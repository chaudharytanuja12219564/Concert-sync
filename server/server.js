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

// CORS Configuration for Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  process.env.FRONTEND_URL || "",
  process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // For Vercel preview URLs, allow all
        if (origin?.includes("vercel.app")) {
          callback(null, true);
        } else {
          callback(new Error("Not allowed by CORS"));
        }
      }
    },
    credentials: true,
  })
);

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

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Export for Vercel serverless functions
export default app;
