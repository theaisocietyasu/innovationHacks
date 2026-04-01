// app/api/auth/discord/route.ts
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { randomBytes } from 'crypto';
import { getDiscordAuthUrl } from '@/lib/server/discord';
import { OAUTH_STATE_COOKIE } from '@/lib/server/session';

export async function GET(): Promise<NextResponse> {
  const state = randomBytes(16).toString('hex');
  const authUrl = getDiscordAuthUrl(state);
  const response = NextResponse.redirect(authUrl);
  response.cookies.set(OAUTH_STATE_COOKIE, state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 10,
  });
  return response;
}
