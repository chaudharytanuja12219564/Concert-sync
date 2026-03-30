import mongoose from "mongoose";

let connectionAttempts = 0;
const MAX_RETRIES = 5;
const RETRY_DELAY = 3000; // 3 seconds between retries

const connectDB = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      console.error("❌ CRITICAL: MONGODB_URI environment variable is NOT SET");
      throw new Error("MONGODB_URI not configured");
    }
    
    // Debug: Log connection string (without password)
    const uri = process.env.MONGODB_URI;
    const uriPreview = uri.replace(/:([^@]+)@/, ":***@");
    console.log(`🔌 Attempting MongoDB connection: ${uriPreview}`);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 20000,  // INCREASED: 20 seconds
      socketTimeoutMS: 45000,
      connectTimeoutMS: 20000,  // INCREASED: 20 seconds
      maxPoolSize: 10,
      family: 4,
      retryWrites: true,
      appName: "ConcertSyncApp",
      authSource: "admin",  // Explicit auth source for Atlas
      directConnection: false,  // Use replica set discovery
    });
    
    connectionAttempts = 0; // Reset counter on success
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Connection State: ${conn.connection.readyState} (1 = connected)`);
    return conn;
  } catch (error) {
    connectionAttempts++;
    console.error(`❌ MongoDB Connection Error (Attempt ${connectionAttempts}/${MAX_RETRIES}):`);
    console.error(`   Error: ${error.message}`);
    console.error(`   Code: ${error.code}`);
    if (error.reason) console.error(`   Reason: ${error.reason.message}`);
    
    // Auto-retry with exponential backoff
    if (connectionAttempts < MAX_RETRIES) {
      console.log(`⏳ Retrying in ${RETRY_DELAY / 1000} seconds...`);
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return connectDB(); // Recursive retry
    }
    
    // Give up after max retries
    console.error("❌ Max MongoDB connection retries exhausted");
    console.error("⚠️  CRITICAL: Application running without database - all requests will fail");
    return null;
  }
};

export default connectDB;