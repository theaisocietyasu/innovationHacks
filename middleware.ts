// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const ADMIN_SESSION_COOKIE_NAME = 'ih_admin_session';

export function middleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isLoginPage = pathname === '/admin/login' || pathname === '/admin/login/';
  const token = request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value;

  if (!isLoginPage && !token) {
    return NextResponse.redirect(new URL('/admin/login', request.url));
  }

  if (isLoginPage && token) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
