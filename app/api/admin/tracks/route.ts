import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/server/auth";
import { connectToDatabase } from "@/lib/mongodb";
import TrackSlot from "@/lib/models/TrackSlot";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body: unknown = await request.json();
  const { name, maxTeams } = body as { name?: string; maxTeams?: number };

  if (!name || typeof maxTeams !== "number" || !Number.isInteger(maxTeams) || maxTeams < 0) {
    return NextResponse.json(
      { error: "name and maxTeams required" },
      { status: 400 }
    );
  }

  await connectToDatabase();

  const slot = await TrackSlot.findOneAndUpdate(
    { name },
    { maxTeams },
    { new: true }
  );

  if (!slot) {
    return NextResponse.json({ error: "Track not found" }, { status: 404 });
  }

  return NextResponse.json(slot);
}
