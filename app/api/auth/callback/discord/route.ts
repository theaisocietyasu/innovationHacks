// app/api/auth/callback/discord/route.ts
import { NextResponse } from 'next/server';
import {
  exchangeCodeForToken,
  getDiscordUser,
  getGuildMemberRoles,
  getAllowedLoginRoleIds,
} from '@/lib/server/discord';
import {
  createAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
  OAUTH_STATE_COOKIE,
} from '@/lib/server/session';
import { getCookie } from '@/lib/server/cookies';

export async function GET(request: Request): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const returnedState = url.searchParams.get('state');
  const oauthError = url.searchParams.get('error');

  const loginUrl = new URL('/admin/login', url.origin);

  const clearState = (resp: NextResponse): NextResponse => {
    resp.cookies.set(OAUTH_STATE_COOKIE, '', { path: '/', maxAge: 0 });
    return resp;
  };

  if (oauthError || !code) {
    loginUrl.searchParams.set('error', oauthError ?? 'missing_code');
    return clearState(NextResponse.redirect(loginUrl));
  }

  const expectedState = getCookie(request, OAUTH_STATE_COOKIE);
  if (!expectedState || expectedState !== returnedState) {
    loginUrl.searchParams.set('error', 'invalid_state');
    return clearState(NextResponse.redirect(loginUrl));
  }

  try {
    const tokenData = await exchangeCodeForToken(code);
    const discordUser = await getDiscordUser(tokenData.access_token);
    const allowedRoleIds = new Set(getAllowedLoginRoleIds());
    const memberRoles = await getGuildMemberRoles(discordUser.id);

    if (!memberRoles.ok || !memberRoles.roles.some((r) => allowedRoleIds.has(r))) {
      loginUrl.searchParams.set('error', 'forbidden');
      return clearState(NextResponse.redirect(loginUrl));
    }

    const sessionToken = await createAdminSessionToken({
      discordId: discordUser.id,
      username: discordUser.username,
    });

    const response = NextResponse.redirect(new URL('/admin', url.origin));
    response.cookies.set(ADMIN_SESSION_COOKIE_NAME, sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60,
    });
    return clearState(response);
  } catch {
    loginUrl.searchParams.set('error', 'server_error');
    return clearState(NextResponse.redirect(loginUrl));
  }
}
