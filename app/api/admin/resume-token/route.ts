// app/api/admin/resume-token/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  // Return the resume token so the client can construct download URLs
  const token = process.env.RESUME_ACCESS_TOKEN ?? '';
  return NextResponse.json({ token });
}
