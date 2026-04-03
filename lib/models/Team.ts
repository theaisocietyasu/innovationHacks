import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember {
  name: string;
  email: string;
  discord?: string;
}

export interface ITeam extends Document {
  teamName: string;
  leadName: string;
  leadEmail: string;
  leadDiscord: string;
  members: ITeamMember[];
  preferences: string[];
  assignedTrack: string | null;
  isLate: boolean;
  status: "pending" | "assigned";
  submittedAt: Date;
}

const TeamSchema = new Schema<ITeam>({
  teamName: { type: String, required: true },
  leadName: { type: String, required: true },
  leadEmail: { type: String, required: true, unique: true },
  leadDiscord: { type: String, required: true },
  members: [{ name: String, email: String, discord: String }],
  preferences: {
    type: [String],
    validate: {
      validator: (v: string[]) => v.length === 3,
      message: "Must have exactly 3 preferences",
    },
  },
  assignedTrack: { type: String, default: null },
  isLate: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "assigned"], default: "pending" },
  submittedAt: { type: Date, default: Date.now },
});

const Team: Model<ITeam> =
  mongoose.models.Team || mongoose.model<ITeam>("Team", TeamSchema);

export default Team;
