import dotenv from "dotenv";
if (process.env.NODE_ENV !== "production") {
  dotenv.config();
}

import express from "express";
import cors from "cors";
import connectDB from "./src/config/db.js";
import concertRoutes from "./routes/concertRoutes.js";
import { initSocket } from "./socket/socketHandler.js";

import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

//DB connect
connectDB();

// CORS middleware - MUST be before routes
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: false
}));

app.use(express.json());

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
