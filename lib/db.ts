import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || '';

type MongooseCache = { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
const globalWithMongoose = globalThis as typeof globalThis & { mongoose?: MongooseCache };

let cached: MongooseCache = globalWithMongoose.mongoose || { conn: null, promise: null };

export async function connectDB() {
  if (!MONGODB_URI) throw new Error('MONGODB_URI is not configured');
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}
