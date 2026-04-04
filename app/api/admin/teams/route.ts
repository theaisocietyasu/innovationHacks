import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdmin } from "@/lib/server/auth";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";
import TrackSlot from "@/lib/models/TrackSlot";
import { TRACKS } from "@/lib/tracks";

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

const manualTeamSchema = z.object({
  teamName: z.string().min(1),
  leadName: z.string().min(1),
  leadEmail: z.string().email(),
  leadDiscord: z.string().min(2),
  members: z
    .array(z.object({
      name: z.string().min(1),
      email: z.string().email(),
      discord: z.string().optional(),
    }))
    .max(3)
    .default([]),
  assignedTrack: z.enum(TRACKS),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  const body: unknown = await req.json();
  const parsed = manualTeamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await Team.findOne({ leadEmail: parsed.data.leadEmail });
  if (existing) {
    return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
  }

  try {
    const team = await Team.create({
      teamName: parsed.data.teamName,
      leadName: parsed.data.leadName,
      leadEmail: parsed.data.leadEmail,
      leadDiscord: parsed.data.leadDiscord,
      members: parsed.data.members,
      preferences: [parsed.data.assignedTrack, TRACKS[0], TRACKS[1]],
      assignedTrack: parsed.data.assignedTrack,
      status: "assigned",
      isLate: true, // admin-added: run-assignment ignores these
    });

    // Increment count for display — bypasses maxTeams capacity check intentionally
    await TrackSlot.findOneAndUpdate(
      { name: parsed.data.assignedTrack },
      { $inc: { currentCount: 1 } }
    );

    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }
    throw err;
  }
}
