// app/api/admin/settings/route.ts
// GET  /api/admin/settings — read current feature flags.
// PATCH /api/admin/settings — update boolean feature flags in the Settings document.
// Currently supports: teamRegistrationOpen

import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Settings from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await connectToDatabase();

  const settings = await Settings.findOne({ key: "main" });
  return NextResponse.json({
    teamRegistrationOpen: settings?.teamRegistrationOpen ?? false,
  });
}

export async function PATCH(request: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body: unknown = await request.json();
  const { teamRegistrationOpen } = body as { teamRegistrationOpen?: boolean };

  if (typeof teamRegistrationOpen !== "boolean") {
    return NextResponse.json(
      { error: "teamRegistrationOpen must be a boolean" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const settings = await Settings.findOneAndUpdate(
    { key: "main" },
    { $set: { teamRegistrationOpen } },
    { new: true, upsert: true }
  );

  return NextResponse.json({ teamRegistrationOpen: settings.teamRegistrationOpen });
}
