// app/api/auth/logout/route.ts
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/server/session';

export async function POST(request: Request): Promise<NextResponse> {
  const origin = new URL(request.url).origin;
  const response = NextResponse.redirect(new URL('/admin/login', origin));
  response.cookies.set(ADMIN_SESSION_COOKIE_NAME, '', { path: '/', maxAge: 0 });
  return response;
}
