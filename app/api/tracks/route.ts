import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import TrackSlot from "@/lib/models/TrackSlot";
import Team from "@/lib/models/Team";
import Settings from "@/lib/models/Settings";

export const dynamic = "force-dynamic";

export async function GET(): Promise<NextResponse> {
  await connectToDatabase();

  const settings = await Settings.findOne({ key: "main" });
  const revealed = settings?.tracksRevealed ?? false;

  const slots = await TrackSlot.find();
  const teams = await Team.find({ status: "assigned" });

  const tracks = slots.map((slot) => ({
    name: slot.name,
    currentCount: slot.currentCount,
    teams: teams
      .filter((t) => t.assignedTrack === slot.name)
      .map((t) => ({ teamName: t.teamName, leadName: t.leadName })),
  }));

  return NextResponse.json({ revealed, tracks });
}
