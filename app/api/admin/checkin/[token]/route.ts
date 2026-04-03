// app/api/admin/checkin/[token]/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';

export async function GET(
  request: Request,
  { params }: { params: { token: string } },
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { token } = params;
  if (!token) {
    return NextResponse.json({ success: false, reason: 'not_found' }, { status: 404 });
  }

  await connectToDatabase();

  const registration = await Registration.findOne({ checkin_token: token })
    .select('firstName lastName status checkin_token')
    .lean();

  if (!registration || !registration.checkin_token) {
    return NextResponse.json({ success: false, reason: 'not_found' }, { status: 404 });
  }

  const name = `${registration.firstName} ${registration.lastName}`;

  if (registration.status === 'checked-in') {
    return NextResponse.json({ success: true, alreadyCheckedIn: true, name });
  }

  await Registration.updateOne({ _id: registration._id }, { $set: { status: 'checked-in' } });

  return NextResponse.json({ success: true, alreadyCheckedIn: false, name });
}
