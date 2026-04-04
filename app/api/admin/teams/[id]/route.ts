import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";
import TrackSlot from "@/lib/models/TrackSlot";
import { TRACKS } from "@/lib/tracks";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ assignedTrack: z.enum(TRACKS) });

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  const auth = await requireAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body: unknown = await request.json();
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }
  const { assignedTrack } = parsed.data;

  await connectToDatabase();

  const team = await Team.findById(params.id);
  if (!team) {
    return NextResponse.json({ error: "Team not found" }, { status: 404 });
  }

  // Decrement old track count if changing to a different track.
  // Guard against going negative by requiring currentCount > 0.
  if (team.assignedTrack && team.assignedTrack !== assignedTrack) {
    await TrackSlot.findOneAndUpdate(
      { name: team.assignedTrack, currentCount: { $gt: 0 } },
      { $inc: { currentCount: -1 } }
    );
  }

  // Increment new track count only if track is actually changing
  if (team.assignedTrack !== assignedTrack) {
    await TrackSlot.findOneAndUpdate(
      { name: assignedTrack },
      { $inc: { currentCount: 1 } }
    );
  }

  team.assignedTrack = assignedTrack;
  team.status = "assigned";
  await team.save();

  return NextResponse.json(team);
}
