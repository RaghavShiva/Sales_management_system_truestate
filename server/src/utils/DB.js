import mongoose from "mongoose";

export async function connectDB(uri) {
  if (!uri) throw new Error("MongoDB URI is not provided");

  await mongoose.connect(uri, {
  });
}
