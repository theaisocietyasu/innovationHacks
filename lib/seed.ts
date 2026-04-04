import { connectToDatabase } from "./mongodb";
import TrackSlot from "./models/TrackSlot";
import Settings from "./models/Settings";
import { TRACKS } from "./tracks";

export async function seedDatabase(): Promise<void> {
  await connectToDatabase();

  // Seed TrackSlots if empty
  const count = await TrackSlot.countDocuments();
  if (count === 0) {
    await TrackSlot.insertMany(
      TRACKS.map((name) => ({ name, maxTeams: 0, currentCount: 0 }))
    );
  }

  // Ensure Settings singleton exists
  await Settings.findOneAndUpdate(
    { key: "main" },
    {
      $setOnInsert: {
        key: "main",
        assignmentComplete: false,
        tracksRevealed: false,
      },
    },
    { upsert: true, new: true }
  );
}
