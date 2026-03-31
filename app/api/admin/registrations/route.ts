// app/api/admin/registrations/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';

const VALID_SORT_FIELDS = new Set([
  'registeredAt', 'firstName', 'lastName', 'email', 'school',
  'levelOfStudy', 'status', 'age',
]);

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const search = searchParams.get('search') ?? '';
  const status = searchParams.get('status') ?? '';
  const levelOfStudy = searchParams.get('levelOfStudy') ?? '';
  const rawSort = searchParams.get('sortBy') ?? 'registeredAt';
  const sortBy = VALID_SORT_FIELDS.has(rawSort) ? rawSort : 'registeredAt';
  const sortDir = searchParams.get('sortDir') === 'asc' ? 1 : -1;
  const page = Math.max(1, parseInt(searchParams.get('page') ?? '1', 10));
  const limit = 50;

  await connectToDatabase();

  const filter: Record<string, unknown> = {};
  if (search) {
    filter.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
      { school: { $regex: search, $options: 'i' } },
    ];
  }
  if (status) filter.status = status;
  if (levelOfStudy) filter.levelOfStudy = levelOfStudy;

  const [registrations, total, stats] = await Promise.all([
    Registration.find(filter)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v -mlhCodeOfConduct -mlhDataSharing -mlhEmailConsent')
      .lean(),
    Registration.countDocuments(filter),
    Registration.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
  ]);

  const statusCounts = { pending: 0, accepted: 0, waitlisted: 0, rejected: 0, total: 0 };
  for (const s of stats as { _id: string; count: number }[]) {
    const key = s._id as keyof typeof statusCounts;
    if (key in statusCounts) statusCounts[key] = s.count;
    statusCounts.total += s.count;
  }

  return NextResponse.json({
    registrations,
    total,
    page,
    totalPages: Math.ceil(total / limit),
    stats: statusCounts,
  });
}
