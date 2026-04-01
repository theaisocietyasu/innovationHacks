// lib/server/cookies.ts
export function getCookie(request: Request, name: string): string | undefined {
  const cookieHeader = request.headers.get('cookie') ?? '';
  for (const cookie of cookieHeader.split(';')) {
    const [key, ...valueParts] = cookie.trim().split('=');
    if (key.trim() === name) return valueParts.join('=');
  }
  return undefined;
}
