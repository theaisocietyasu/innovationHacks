// lib/server/auth.ts
import { getCookie } from './cookies';
import {
  verifyAdminSessionToken,
  ADMIN_SESSION_COOKIE_NAME,
  type AdminSessionPayload,
} from './session';
import { getAllowedLoginRoleIds, getGuildMemberRoles } from './discord';

export type AdminCheckResult =
  | { ok: true; user: AdminSessionPayload }
  | { ok: false; status: number; error: string };

export async function requireAdmin(request: Request): Promise<AdminCheckResult> {
  const token = getCookie(request, ADMIN_SESSION_COOKIE_NAME);
  if (!token) return { ok: false, status: 401, error: 'Authentication required' };

  const session = await verifyAdminSessionToken(token);
  if (!session) return { ok: false, status: 401, error: 'Invalid or expired session' };

  const allowedRoleIds = new Set(getAllowedLoginRoleIds());
  const memberRoles = await getGuildMemberRoles(session.discordId);

  if (!memberRoles.ok) {
    return {
      ok: false,
      status: memberRoles.status === 404 ? 403 : 503,
      error: 'Unable to verify Discord roles',
    };
  }

  const isAllowed = memberRoles.roles.some((roleId) => allowedRoleIds.has(roleId));
  if (!isAllowed) {
    return { ok: false, status: 403, error: 'You do not have the required role' };
  }

  return { ok: true, user: session };
}
