import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";

export const dynamic = "force-dynamic";

export async function GET(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  await connectToDatabase();
  const teams = await Team.find().sort({ submittedAt: 1 });
  return NextResponse.json(teams);
}
