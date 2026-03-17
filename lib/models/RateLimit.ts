import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRateLimit extends Document {
  ip: string;
  count: number;
  resetAt: Date;
}

const RateLimitSchema = new Schema<IRateLimit>({
  ip: { type: String, required: true },
  count: { type: Number, required: true, default: 1 },
  resetAt: { type: Date, required: true },
});

// Compound index for fast lookup per IP within an active window.
RateLimitSchema.index({ ip: 1, resetAt: 1 });

// TTL index — MongoDB automatically deletes expired documents.
// expireAfterSeconds: 0 means "delete at the time stored in resetAt".
RateLimitSchema.index({ resetAt: 1 }, { expireAfterSeconds: 0 });

const RateLimit: Model<IRateLimit> =
  mongoose.models.RateLimit ||
  mongoose.model<IRateLimit>('RateLimit', RateLimitSchema);

export default RateLimit;
