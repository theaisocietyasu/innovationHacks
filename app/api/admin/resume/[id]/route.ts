export const runtime = 'nodejs';

import { type NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';
import { requireAdmin } from '@/lib/server/auth';
import { getClientIp, adminApiRateLimiter, rateLimitResponse } from '@/lib/server/rateLimit';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = adminApiRateLimiter.check(ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  const authResult = await requireAdmin(request);
  if (!authResult.ok) {
    return NextResponse.json({ error: authResult.error }, { status: authResult.status });
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
      },
    });
  } catch (err) {
    console.error('[GET /api/admin/resume] Error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
