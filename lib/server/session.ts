// lib/server/session.ts
import { SignJWT, jwtVerify } from 'jose';

export { ADMIN_SESSION_COOKIE_NAME } from '@/lib/constants/admin';
export const OAUTH_STATE_COOKIE = 'ih_oauth_state';

export interface AdminSessionPayload {
  discordId: string;
  username: string;
}

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET environment variable is not set');
  return new TextEncoder().encode(secret);
}

export async function createAdminSessionToken(
  payload: AdminSessionPayload,
): Promise<string> {
  return new SignJWT({ discordId: payload.discordId, username: payload.username })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer('innovation-hacks')
    .setAudience('admin')
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyAdminSessionToken(
  token: string,
): Promise<AdminSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret(), {
      issuer: 'innovation-hacks',
      audience: 'admin',
    });
    return {
      discordId: payload.discordId as string,
      username: payload.username as string,
    };
  } catch {
    return null;
  }
}
