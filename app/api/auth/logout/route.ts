// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/session';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json({ success: true });
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
