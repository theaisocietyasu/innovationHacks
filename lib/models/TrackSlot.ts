import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITrackSlot extends Document {
  name: string;
  maxTeams: number;
  currentCount: number;
}

const TrackSlotSchema = new Schema<ITrackSlot>({
  name: { type: String, required: true, unique: true },
  maxTeams: { type: Number, default: 0 },
  currentCount: { type: Number, default: 0 },
});

const TrackSlot: Model<ITrackSlot> =
  mongoose.models.TrackSlot ||
  mongoose.model<ITrackSlot>("TrackSlot", TrackSlotSchema);

export default TrackSlot;
