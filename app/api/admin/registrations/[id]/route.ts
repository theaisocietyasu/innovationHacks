// app/api/admin/registrations/[id]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';

const VALID_STATUSES = ['pending', 'accepted', 'waitlisted', 'rejected'] as const;
type Status = (typeof VALID_STATUSES)[number];

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const body = (await request.json()) as { status?: string };
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
