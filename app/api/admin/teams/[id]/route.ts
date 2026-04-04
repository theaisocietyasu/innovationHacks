import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";
import TrackSlot from "@/lib/models/TrackSlot";
import { TRACKS } from "@/lib/tracks";

export const dynamic = "force-dynamic";

const patchSchema = z.object({ assignedTrack: z.union([z.enum(TRACKS), z.literal("")]) });

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

  const newTrack = assignedTrack || null;

  // Decrement old track count when moving away from it
  if (team.assignedTrack && team.assignedTrack !== newTrack) {
    await TrackSlot.findOneAndUpdate(
      { name: team.assignedTrack, currentCount: { $gt: 0 } },
      { $inc: { currentCount: -1 } }
    );
  }

  // Increment new track count only if assigning to a real track
  if (newTrack && team.assignedTrack !== newTrack) {
    await TrackSlot.findOneAndUpdate(
      { name: newTrack },
      { $inc: { currentCount: 1 } }
    );
  }

  team.assignedTrack = newTrack;
  team.status = newTrack ? "assigned" : "pending";
  await team.save();

  return NextResponse.json(team);
}
