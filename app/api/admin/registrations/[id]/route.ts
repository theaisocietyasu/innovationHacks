// app/api/admin/registrations/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';
import { getClientIp, adminApiRateLimiter, rateLimitResponse } from '@/lib/server/rateLimit';

const VALID_STATUSES = ['waitlisted', 'accepted', 'rejected', 'checked-in'] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = adminApiRateLimiter.check(ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  let body: { status?: string };
  try {
    body = (await request.json()) as { status?: string };
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }
  const status = body.status as Status;

  if (!VALID_STATUSES.includes(status)) {
    return NextResponse.json({ error: 'Invalid status value' }, { status: 400 });
  }

  await connectToDatabase();
  const registration = await Registration.findByIdAndUpdate(
    params.id,
    { status },
    { new: true },
  )
    .select('-__v -mlhCodeOfConduct -mlhDataSharing -mlhEmailConsent')
    .lean();

  if (!registration) {
    return NextResponse.json({ error: 'Registration not found' }, { status: 404 });
  }

  return NextResponse.json({ success: true, registration });
}
