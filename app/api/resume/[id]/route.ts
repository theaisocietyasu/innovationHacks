export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { GridFSBucket, ObjectId } from 'mongodb';
import { connectToDatabase } from '@/lib/mongodb';

export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  try {
    await connectToDatabase();

    const fileId = new ObjectId(params.id);
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
