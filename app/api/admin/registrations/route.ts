// app/api/admin/registrations/route.ts
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/server/auth';
import { connectToDatabase } from '@/lib/mongodb';
import Registration from '@/lib/models/Registration';
import { getClientIp, adminApiRateLimiter, rateLimitResponse } from '@/lib/server/rateLimit';

const VALID_SORT_FIELDS = new Set([
  'registeredAt', 'firstName', 'lastName', 'email',
  'levelOfStudy', 'status', 'age',
]);

export async function GET(request: Request): Promise<NextResponse> {
  const ip = getClientIp(request);
  const rl = adminApiRateLimiter.check(ip);
  if (!rl.allowed) return rateLimitResponse(rl.retryAfterMs);

  const auth = await requireAdmin(request);
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status });

  const { searchParams } = new URL(request.url);
  const rawSearch = searchParams.get('search') ?? '';
  // Escape regex special characters to prevent ReDoS via user-supplied input.
  const search = rawSearch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const status = searchParams.get('status') ?? '';
  if (status && !['waitlisted', 'accepted', 'rejected', 'checked-in'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status filter' }, { status: 400 });
  }
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
    ];
  }
  if (status) filter.status = status;

  const [rawRegistrations, total, stats] = await Promise.all([
    Registration.find(filter)
      .sort({ [sortBy]: sortDir })
      .skip((page - 1) * limit)
      .limit(limit)
      .select('-__v -mlhCodeOfConduct -mlhDataSharing -mlhEmailConsent')
      .lean(),
    Registration.countDocuments(filter),
    Registration.aggregate([
      // Treat missing/null status as 'pending'
      { $addFields: { effectiveStatus: { $ifNull: ['$status', 'waitlisted'] } } },
      { $group: { _id: '$effectiveStatus', count: { $sum: 1 } } },
    ]),
  ]);

  // Normalise missing status on returned docs too
  const registrations = rawRegistrations.map((r) => ({
    ...r,
    status: (r as { status?: string }).status ?? 'waitlisted',
  }));

  const statusCounts = { waitlisted: 0, accepted: 0, rejected: 0, 'checked-in': 0, total: 0 };
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
