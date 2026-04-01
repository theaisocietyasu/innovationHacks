// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE_NAME, verifyAdminSessionToken } from '@/lib/server/session';

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  const session = token ? await verifyAdminSessionToken(token) : null;

  if (!isLoginPage && !session) {
    const response = NextResponse.redirect(new URL('/admin/login', request.url));
    if (token) response.cookies.delete(ADMIN_SESSION_COOKIE_NAME);
    return response;
  }

  if (isLoginPage && session) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
