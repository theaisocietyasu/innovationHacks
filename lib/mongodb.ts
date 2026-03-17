import mongoose from 'mongoose';

interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

// In development, store on `global` so the cached connection survives hot reloads.
// In production, a module-level variable is sufficient — the module is not reloaded.
let cached: MongooseCache;
if (process.env.NODE_ENV === 'development') {
  global.mongoose ??= { conn: null, promise: null };
  cached = global.mongoose;
} else {
  cached = { conn: null, promise: null };
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  // Check at call time, not module load — avoids build failures when env var is absent.
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not set');
  }

  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      // Disable command buffering — fail fast when the DB is unreachable rather
      // than silently queuing operations. Important for serverless environments.
      bufferCommands: false,

      // Connection pool settings. minPoolSize keeps a small number of warm
      // connections ready; maxPoolSize caps total concurrent connections per
      // serverless instance. These are per-instance limits, not cluster-wide.
      minPoolSize: 0,
      maxPoolSize: 10,

      // Fail quickly if no server is reachable within this window (ms).
      serverSelectionTimeoutMS: 5000,

      // Close idle sockets after this duration to avoid stale connections (ms).
      socketTimeoutMS: 45000,
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    // Clear the cached promise so the next call retries the connection instead
    // of re-awaiting a permanently rejected promise.
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}
