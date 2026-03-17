export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  // ── Access control ──────────────────────────────────────────────────────────
  // This is an internal admin endpoint. Protect it with a shared secret token
  // passed in the x-resume-token header. Fail secure — if the env var is not
  // set, we still enforce the check and return 401 rather than exposing resumes.
  const expectedToken = process.env.RESUME_ACCESS_TOKEN;
  if (!expectedToken) {
    console.warn('[GET /api/resume] RESUME_ACCESS_TOKEN is not set — all requests will be rejected.');
  }

  const providedToken = request.headers.get('x-resume-token');
  if (!expectedToken || providedToken !== expectedToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await connectToDatabase();

    const { id } = await params;
    if (!ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }
    const fileId = new ObjectId(id);
    const bucket = new GridFSBucket(mongoose.connection.db!, { bucketName: 'resumes' });

    const files = await bucket.find({ _id: fileId }).toArray();
    if (!files.length) {
      return NextResponse.json({ error: 'File not found' }, { status: 404 });
    }

    const file = files[0];
    const chunks: Buffer[] = [];

    await new Promise<void>((resolve, reject) => {
      const stream = bucket.openDownloadStream(fileId);
      stream.on('data', (chunk) => chunks.push(Buffer.from(chunk)));
      stream.on('end', resolve);
      stream.on('error', reject);
    });

    const buffer = Buffer.concat(chunks);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': (file.metadata?.['contentType'] as string | undefined) ?? 'application/pdf',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('[GET /api/resume] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
