import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectToDatabase } from "@/lib/mongodb";
import Team from "@/lib/models/Team";
import Settings from "@/lib/models/Settings";
import { TRACKS } from "@/lib/tracks";

export const dynamic = "force-dynamic";

const teamSchema = z.object({
  teamName: z.string().min(1),
  leadName: z.string().min(1),
  leadEmail: z.string().email(),
  leadDiscord: z.string().min(2, "Discord username required"),
  members: z
    .array(
      z.object({
        name: z.string().min(1),
        email: z.string().email(),
        discord: z.string().optional(),
      })
    )
    .max(3),
  preferences: z
    .array(z.enum(TRACKS))
    .length(3)
    .refine((prefs) => new Set(prefs).size === 3, {
      message: "Track preferences must be unique",
    }),
});

export async function POST(req: NextRequest): Promise<NextResponse> {
  const openAt = process.env.REGISTRATION_OPEN_AT;
  if (openAt && new Date() < new Date(openAt)) {
    return NextResponse.json(
      { error: "Registration not open yet" },
      { status: 403 }
    );
  }

  const body: unknown = await req.json();
  const parsed = teamSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  await connectToDatabase();

  const existing = await Team.findOne({ leadEmail: parsed.data.leadEmail });
  if (existing) {
    return NextResponse.json(
      { error: "This email is already registered" },
      { status: 400 }
    );
  }

  const settings = await Settings.findOne({ key: "main" });
  const isLate = settings?.assignmentComplete === true;

  // Save as pending — run-assignment handles all track placement
  try {
    await Team.create({
      ...parsed.data,
      assignedTrack: null,
      status: "pending",
      isLate,
    });
  } catch (err: unknown) {
    if ((err as { code?: number }).code === 11000) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 });
    }
    throw err;
  }

  return NextResponse.json(
    { success: true, teamName: parsed.data.teamName },
    { status: 201 }
  );
}
