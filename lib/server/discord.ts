// lib/server/discord.ts

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable: ${name}`);
  return value;
}

function getDiscordRedirectUri(): string {
  return requireEnv('DISCORD_CALLBACK_URL');
}

export function getDiscordAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: requireEnv('DISCORD_CLIENT_ID'),
    redirect_uri: getDiscordRedirectUri(),
    response_type: 'code',
    scope: 'identify',
    state,
  });
  return `https://discord.com/api/oauth2/authorize?${params.toString()}`;
}

export async function exchangeCodeForToken(
  code: string,
): Promise<{ access_token: string }> {
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: requireEnv('DISCORD_CLIENT_ID'),
      client_secret: requireEnv('DISCORD_CLIENT_SECRET'),
      grant_type: 'authorization_code',
      code,
      redirect_uri: getDiscordRedirectUri(),
    }),
  });
  if (!response.ok) {
    throw new Error(`Discord token exchange failed: ${response.status}`);
  }
  return response.json() as Promise<{ access_token: string }>;
}

export async function getDiscordUser(
  accessToken: string,
): Promise<{ id: string; username: string }> {
  const response = await fetch('https://discord.com/api/users/@me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    throw new Error(`Failed to fetch Discord user: ${response.status}`);
  }
  return response.json() as Promise<{ id: string; username: string }>;
}

export async function getGuildMemberRoles(
  discordUserId: string,
): Promise<{ ok: true; roles: string[] } | { ok: false; status: number }> {
  const botToken = requireEnv('DISCORD_BOT_TOKEN');
  const guildId = requireEnv('DISCORD_GUILD_ID');
  const response = await fetch(
    `https://discord.com/api/guilds/${guildId}/members/${discordUserId}`,
    { headers: { Authorization: `Bot ${botToken}` } },
  );
  if (!response.ok) return { ok: false, status: response.status };
  const member = (await response.json()) as { roles: string[] };
  return { ok: true, roles: member.roles };
}

export function getAllowedLoginRoleIds(): string[] {
  const raw = process.env.ADMIN_ROLE_ID ?? '';
  const ids = raw.split(',').map((r) => r.trim()).filter(Boolean);
  if (ids.length === 0) {
    throw new Error('ADMIN_ROLE_ID environment variable is required and must not be empty');
  }
  return ids;
}
