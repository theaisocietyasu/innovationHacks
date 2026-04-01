// app/api/auth/session/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });
  return NextResponse.json({ user: auth.user });
}
