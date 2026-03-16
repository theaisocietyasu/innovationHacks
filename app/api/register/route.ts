export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import mongoose from 'mongoose';
import { GridFSBucket } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';

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

const literalTruePreprocess = () =>
  z.preprocess((v) => v === 'true' || v === 'on', z.literal(true));

const RegistrationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('A valid email is required'),
  phone: z.string().refine(
    (val) => val.replace(/\D/g, '').length === 10,
    { message: 'Phone number must be exactly 10 digits' }
  ),
  age: z.coerce.number().int().min(16, 'Must be at least 16').max(99, 'Must be 99 or younger'),
  school: z.string().min(1, 'School is required'),
  levelOfStudy: z.enum(LEVEL_OF_STUDY_VALUES),
  gender: z.string().min(1, 'Gender is required'),
  raceEthnicity: z.string().min(1, 'Race/Ethnicity is required'),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  linkedinUrl: z.string().optional(),
  githubUrl: z.string().min(1, 'GitHub URL is required'),
  mlhCodeOfConduct: literalTruePreprocess(),
  mlhDataSharing: literalTruePreprocess(),
  mlhEmailConsent: booleanPreprocess(z.boolean()),
});

const MAX_RESUME_SIZE = 5 * 1024 * 1024; // 5 MB

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const formData = await request.formData();

    // --- Resume file handling ---
    let resumeUrl = '';
    let resumeFileName = '';

    const resumeFile = formData.get('resumeFile');
    if (resumeFile instanceof File && resumeFile.size > 0) {
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
              message: 'Resume file must be 5 MB or smaller.',
              details: [{ field: 'resumeFile', message: 'File size exceeds 5 MB limit.' }],
            },
          },
          { status: 400 },
        );
      }

      // Upload to MongoDB GridFS
      await connectToDatabase();
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

      resumeUrl = `/api/resume/${fileId.toString()}`;
      resumeFileName = uuidFileName;
    }

    if (!resumeUrl) {
      return NextResponse.json(
        { success: false, message: 'Resume is required. Please upload a PDF.' },
        { status: 400 },
      );
    }

    // --- Build plain object from remaining form fields ---
    const rawFields: Record<string, unknown> = {};
    formData.forEach((value, key) => {
      if (key === 'resumeFile') return;
      rawFields[key] = value;
    });

    // --- Zod validation ---
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

    // --- Duplicate email check ---
    await connectToDatabase();

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

    // --- Persist registration ---
    const registration = new Registration({
      ...data,
      resumeUrl,
      resumeFileName,
    });
    await registration.save();

    return NextResponse.json(
      { success: true, message: 'Registration successful! See you at Innovation Hacks 2.0!' },
      { status: 200 },
    );
  } catch (err) {
    console.error('[POST /api/register] Unhandled error:', err);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 },
    );
  }
}
