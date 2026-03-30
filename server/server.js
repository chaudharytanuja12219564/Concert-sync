import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import connectDB from "./src/config/db.js";
import concertRoutes from "./routes/concertRoutes.js";
import { initSocket } from "./socket/socketHandler.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

//DB connect
connectDB();

app.use(express.json());

// Simple CORS for Vercel
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

app.use("/api/concerts", concertRoutes);

app.get("/", (req, res) => {
  res.send("API running");
});

const PORT = process.env.PORT || 5000;

// CREATE HTTP SERVER FROM EXPRESS
const server = createServer(app);

//ATTACH SOCKET.IO TO THAT SERVER
const io = new Server(server, {
  cors: {
    origin: "*",
  },
});

// MAKE IO AVAILABLE INSIDE CONTROLLERS
app.set("io", io);

//SOCKET CODE GOES HERE
initSocket(io);

// Only listen in development, not on Vercel
if (process.env.NODE_ENV !== "production") {
  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Export for Vercel serverless functions
export default app;
