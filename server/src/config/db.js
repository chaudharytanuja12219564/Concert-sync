import mongoose from "mongoose";

let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds between retries

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("MONGODB_URI environment variable is not set");
      throw new Error("MONGODB_URI not configured");
    }
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 15000,
      maxPoolSize: 10,
      family: 4,
      retryWrites: true,
      appName: "ConcertSyncApp",
    });
    
    connectionAttempts = 0; // Reset counter on success
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ MongoDB Connection Error (Attempt ${connectionAttempts}/${MAX_RETRIES}):`, error.message);
    
    // Auto-retry with exponential backoff
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(); // Recursive retry
    }
    
    // Give up after max retries, but return null instead of crashing
    console.error("❌ Max MongoDB connection retries exhausted");
    return null;
  }
};

export default connectDB;