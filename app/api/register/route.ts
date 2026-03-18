export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';
import RateLimit from '@/lib/models/RateLimit';

// ── Rate limiting ─────────────────────────────────────────────────────────────
// Distributed rate limiting via MongoDB — works correctly across all serverless
// instances. Uses a TTL index for automatic cleanup of expired windows.
// The findOneAndUpdate with $inc is atomic — no race condition between read and write.

const RATE_LIMIT_MAX = 5;
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

async function checkRateLimit(ip: string): Promise<boolean> {
  const now = new Date();
  const resetAt = new Date(now.getTime() + RATE_LIMIT_WINDOW_MS);

  // Atomically increment the counter for the active window.
  // If no document exists for this IP (or the window has expired and been cleaned up),
  // upsert a fresh one with count=1 and a new resetAt.
  const entry = await RateLimit.findOneAndUpdate(
    { ip, resetAt: { $gt: now } },
    { $inc: { count: 1 }, $setOnInsert: { resetAt } },
    { upsert: true, new: true },
  );

  return entry.count <= RATE_LIMIT_MAX;
}

// ── Validation schema ─────────────────────────────────────────────────────────

const LEVEL_OF_STUDY_VALUES = [
  'Less than Secondary / High School',
  'Secondary / High School',
  'Undergraduate University (2 year - community college or similar)',
  'Undergraduate University (3+ year)',
  'Graduate University (Masters, Professional, Doctoral, etc)',
  'Code School / Bootcamp',
  'Other Vocational / Trade Program or Apprenticeship',
  'Post Doctorate',
  'Other',
  "I'm not currently a student",
  'Prefer not to answer',
] as const;

// HTML checkboxes submit 'on'/'off' or 'true'/'false' as strings — coerce to boolean.
const booleanPreprocess = (schema: z.ZodType<boolean>) =>
  z.preprocess((v) => v === 'true' || v === 'on', schema);

const literalTruePreprocess = (message: string) =>
  z.preprocess(
    (v) => v === 'true' || v === 'on',
    z.literal(true, message),
  );

const RegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z
    .string()
    .email('Valid email required')
    .refine(
      (val) => {
        const domain = val.split('@')[1]?.toLowerCase() ?? '';
        return domain === 'gmail.com' || domain.endsWith('.edu');
      },
      { message: 'Please use your school (.edu) or Gmail email address.' },
    ),
  phone: z.string()
    .min(1, 'Phone number is required')
    .refine(
      (val) => val.replace(/\D/g, '').length === 10,
      { message: 'Phone number must be exactly 10 digits' },
    ),
  age: z.coerce.number().int().min(16, 'Must be 16+').max(99, 'Must be 99 or under'),
  school: z.string().min(3, 'School / University is required'),
  levelOfStudy: z.enum(LEVEL_OF_STUDY_VALUES, 'Level of study is required'),
  yearOfStudy: z.string().optional(),
  gender: z.string().min(1, 'Gender is required'),
  raceEthnicity: z.string().min(1, 'Race/Ethnicity is required'),
  countryOfResidence: z.string().min(1, 'Country is required'),
  linkedinUrl: z.string().optional().refine(
    (val) =>
      !val ||
      /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]{3,100}\/?(\?[^\s]*)?$/.test(val),
    { message: 'Please enter a valid LinkedIn profile URL (e.g. linkedin.com/in/yourname)' },
  ),
  githubUrl: z
    .string()
    .min(1, 'GitHub URL is required')
    .regex(
      /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?\/?$/,
      'Please enter a valid GitHub profile URL (e.g. github.com/yourusername)',
    ),
  mlhCodeOfConduct: literalTruePreprocess('You must agree to the MLH Code of Conduct'),
  mlhDataSharing: literalTruePreprocess('You must agree to MLH data sharing'),
  mlhEmailConsent: booleanPreprocess(z.boolean()),
});

const MAX_RESUME_SIZE = 4 * 1024 * 1024; // 4 MB — safe buffer below Vercel's ~4.5 MB request/body size limit for uploads

export async function POST(request: NextRequest): Promise<NextResponse> {
  // Connect early — rate limit check requires DB access.
  await connectToDatabase();

  // ── Rate limit check ────────────────────────────────────────────────────────
  // Prefer x-real-ip (set by Vercel's edge to the actual client IP).
  // x-forwarded-for is client-controllable on Vercel — do not use it for auth decisions.
  const ip =
    request.headers.get('x-real-ip')?.trim() ??
    request.headers.get('x-forwarded-for')?.split(',').at(-1)?.trim() ??
    'unknown';

  if (!(await checkRateLimit(ip))) {
    return NextResponse.json(
      {
        error: {
          code: 'RATE_LIMITED',
          message: 'We\'re sorry, you\'ve made too many attempts. Please try again later.',
        },
      },
      { status: 429 },
    );
  }

  try {
    const formData = await request.formData();

    // ── Step 1: Validate resume file (type + size only — no upload yet) ──────
    const resumeFile = formData.get('resumeFile');

    if (!(resumeFile instanceof File) || resumeFile.size === 0) {
      return NextResponse.json(
        { error: { code: 'VALIDATION_FAILED', message: 'Resume is required. Please upload a PDF.' } },
        { status: 400 },
      );
    }

    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Resume must be a PDF file.',
            details: [{ field: 'resumeFile', message: 'Only PDF files are accepted.' }],
          },
        },
        { status: 400 },
      );
    }

    if (resumeFile.size > MAX_RESUME_SIZE) {
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Resume file must be 4 MB or smaller.',
            details: [{ field: 'resumeFile', message: 'File size exceeds 4 MB limit.' }],
          },
        },
        { status: 400 },
      );
    }

    // ── Step 2: Validate form fields ─────────────────────────────────────────
    const rawFields: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (key === 'resumeFile') return;
      rawFields[key] = value;
    });

    const parsed = RegistrationSchema.safeParse(rawFields);
    if (!parsed.success) {
      const details = parsed.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      return NextResponse.json(
        {
          error: {
            code: 'VALIDATION_FAILED',
            message: 'Please fix the errors below and try again.',
            details,
          },
        },
        { status: 400 },
      );
    }

    const data = parsed.data;

    // ── Step 3: Duplicate email check ────────────────────────────────────────
    const existing = await Registration.findOne({ email: data.email });
    if (existing) {
      return NextResponse.json(
        {
          error: {
            code: 'CONFLICT',
            message: 'An application with this email address already exists.',
            details: [{ field: 'email', message: 'This email has already been registered.' }],
          },
        },
        { status: 409 },
      );
    }

    // ── Step 4: Upload resume to GridFS ───────────────────────────────────────
    // Only reached after all validation passes — no orphaned files on failure.
    const bucket = new GridFSBucket(mongoose.connection.db!, { bucketName: 'resumes' });
    const buffer = Buffer.from(await resumeFile.arrayBuffer());
    const fileId = new mongoose.Types.ObjectId();
    const uuidFileName = `${crypto.randomUUID()}.pdf`;

    await new Promise<void>((resolve, reject) => {
      const uploadStream = bucket.openUploadStreamWithId(fileId, uuidFileName, {
        metadata: { contentType: 'application/pdf' },
      });
      uploadStream.end(buffer);
      uploadStream.on('finish', resolve);
      uploadStream.on('error', reject);
    });

    const resumeUrl = `/api/resume/${fileId.toString()}`;

    // ── Step 5: Persist registration ─────────────────────────────────────────
    const registration = new Registration({
      ...data,
      resumeUrl,
      resumeFileName: uuidFileName,
    });

    try {
      await registration.save();
    } catch (saveErr) {
      // Clean up the uploaded resume so we don't leave an orphaned GridFS file.
      await bucket.delete(fileId).catch((deleteErr) =>
        console.error('[POST /api/register] Failed to delete orphaned resume after save failure:', deleteErr),
      );
      throw saveErr;
    }

    return NextResponse.json(
      { success: true, message: 'Registration successful! See you at Innovation Hacks 2.0!' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[POST /api/register] Unhandled error:', err);
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred.' } },
      { status: 500 },
    );
  }
}
