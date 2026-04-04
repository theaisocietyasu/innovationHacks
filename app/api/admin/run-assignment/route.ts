import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";
import TrackSlot from "@/lib/models/TrackSlot";
import Settings from "@/lib/models/Settings";
import { requireAdmin } from "@/lib/server/auth";

export const dynamic = "force-dynamic";

async function verifyCronOrAdmin(request: NextRequest): Promise<boolean> {
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get("authorization");
  if (cronSecret && authHeader === `Bearer ${cronSecret}`) return true;

  const auth = await requireAdmin(request);
  return auth.ok;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const authorized = await verifyCronOrAdmin(req);
  if (!authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectToDatabase();

  // Atomic idempotency guard: only proceeds if assignmentComplete is currently false,
  // and flips it to true in the same operation — prevents double-run from concurrent requests.
  const guard = await Settings.findOneAndUpdate(
    { key: "main", assignmentComplete: false },
    { $set: { assignmentComplete: true } },
    { new: false }
  );
  if (!guard) {
    return NextResponse.json({ error: "Assignment already ran" }, { status: 400 });
  }

  // Registration uses first-come-first-served at submission time.
  // This endpoint handles any teams still pending (all preferences were full
  // when they registered). Assign them to the track with the most remaining
  // capacity, sorted by submittedAt ASC so earlier teams get priority.
  const pendingTeams = await Team.find({ status: "pending", isLate: false }).sort({ submittedAt: 1 });
  const slots = await TrackSlot.find();

  const slotMap = new Map<string, { maxTeams: number; currentCount: number }>();
  for (const slot of slots) {
    slotMap.set(slot.name, { maxTeams: slot.maxTeams, currentCount: slot.currentCount });
  }

  const assignments: { id: string; track: string }[] = [];

  for (const team of pendingTeams) {
    // Try preferences first (capacity may have freed up or limits may have changed)
    let assigned: string | null = null;

    for (const pref of team.preferences) {
      const slot = slotMap.get(pref);
      if (slot && slot.currentCount < slot.maxTeams) {
        assigned = pref;
        slot.currentCount += 1;
        break;
      }
    }

    // Fallback: track with most remaining capacity
    if (!assigned) {
      let bestSlot: string | null = null;
      let mostRemaining = -Infinity;
      for (const [name, slot] of Array.from(slotMap.entries())) {
        const remaining = slot.maxTeams - slot.currentCount;
        if (remaining > mostRemaining) {
          mostRemaining = remaining;
          bestSlot = name;
        }
      }
      if (bestSlot) {
        assigned = bestSlot;
        const slot = slotMap.get(bestSlot)!;
        slot.currentCount += 1;
      }
    }

    if (assigned) {
      assignments.push({ id: (team._id as { toString(): string }).toString(), track: assigned });
    }
  }

  if (assignments.length > 0) {
    await Team.bulkWrite(
      assignments.map(({ id, track }) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { assignedTrack: track, status: "assigned" as const } },
        },
      }))
    );
  }

  // Increment slot counts only for newly assigned teams — avoids overwriting
  // live counts that may have been updated by concurrent registrations.
  if (assignments.length > 0) {
    await Promise.all(
      assignments.map(({ track }) =>
        TrackSlot.findOneAndUpdate({ name: track }, { $inc: { currentCount: 1 } })
      )
    );
  }

  // Reveal tracks (assignmentComplete was already set atomically above)
  await Settings.findOneAndUpdate(
    { key: "main" },
    { $set: { tracksRevealed: true } }
  );

  const finalSlots = await TrackSlot.find();
  const summary: Record<string, number> = {};
  for (const s of finalSlots) summary[s.name] = s.currentCount;

  return NextResponse.json({
    success: true,
    assigned: assignments.length,
    summary,
  });
}
