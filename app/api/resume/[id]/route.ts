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
    const downloadStream = bucket.openDownloadStream(fileId);

    // Pipe the GridFS Node stream directly into a ReadableStream — avoids
    // buffering the entire file in memory per request.
    const webStream = new ReadableStream({
      start(controller) {
        downloadStream.on('data', (chunk: Buffer) => {
          if (downloadStream.destroyed) return;
          controller.enqueue(new Uint8Array(chunk));
        });
        downloadStream.on('end', () => {
          if (downloadStream.destroyed) return;
          controller.close();
        });
        downloadStream.on('error', (err: Error) => controller.error(err));
      },
      cancel() {
        // Remove listeners BEFORE destroy — prevents _destroy() error events
        // from racing into controller.enqueue/close after cancellation.
        downloadStream.removeAllListeners();
        downloadStream.destroy();
      },
    });

    return new NextResponse(webStream, {
      headers: {
        'Content-Type': (file.metadata?.['contentType'] as string | undefined) ?? 'application/pdf',
        'Content-Disposition': `inline; filename="${file.filename}"`,
        'Cache-Control': 'private, no-store',
        // Override the global X-Frame-Options: DENY set in next.config.js so
        // the admin panel (same origin) can embed this response in an iframe.
        'X-Frame-Options': 'SAMEORIGIN',
      },
    });
  } catch (err) {
    console.error('[GET /api/resume] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
