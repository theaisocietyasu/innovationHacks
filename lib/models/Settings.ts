import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISettings extends Document {
  key: string;
  assignmentComplete: boolean;
  tracksRevealed: boolean;
  teamRegistrationOpen: boolean;
}

const SettingsSchema = new Schema<ISettings>({
  key: { type: String, default: "main", unique: true },
  assignmentComplete: { type: Boolean, default: false },
  tracksRevealed: { type: Boolean, default: false },
  teamRegistrationOpen: { type: Boolean, default: false },
});

const Settings: Model<ISettings> =
  mongoose.models.Settings ||
  mongoose.model<ISettings>("Settings", SettingsSchema);

export default Settings;
