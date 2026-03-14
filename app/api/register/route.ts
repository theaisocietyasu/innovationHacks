export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { put } from '@vercel/blob';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';

const LEVEL_OF_STUDY_VALUES = [
  'High School',
  '1st Year (Freshman)',
  '2nd Year (Sophomore)',
  '3rd Year (Junior)',
  '4th Year (Senior)',
  '5th Year+',
  'Graduate Student',
  'Bootcamp / Non-traditional',
  'Other / Not a student',
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
  phone: z.string().min(7, 'Phone number must be at least 7 characters'),
  age: z.coerce.number().int().min(13, 'Must be at least 13').max(99, 'Must be 99 or younger'),
  school: z.string().min(1, 'School is required'),
  levelOfStudy: z.enum(LEVEL_OF_STUDY_VALUES),
  gender: z.string().min(1, 'Gender is required'),
  raceEthnicity: z.string().min(1, 'Race/Ethnicity is required'),
  countryOfResidence: z.string().min(1, 'Country of residence is required'),
  linkedinUrl: z.string().min(1, 'LinkedIn URL is required'),
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

      const blob = await put(resumeFile.name, resumeFile, { access: 'public' });
      resumeUrl = blob.url;
      resumeFileName = resumeFile.name;
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
