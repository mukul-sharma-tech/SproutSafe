import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import childRoutes from "./routes/child.js";
import monitorRoutes from "./routes/monitorRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import parentRoutes from "./routes/parentRoutes.js";
import superSafeRoutes from "./routes/superSafeRoutes.js";
import timedBlockRoutes from "./routes/timedBlockRoutes.js";
import { startHeartbeatMonitor } from './utillity/cronMonitor.js';
import { validateEnv } from './config/env.js';
import { errorHandler, notFound } from './middleware/errorHandler.js';
dotenv.config();

validateEnv();

const app = express();

// Rate limit for auth routes (prevent brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // 20 requests per window per IP
  message: { message: "Too many attempts. Please try again later." },
});

app.use(cors({
  origin: '*', // Allows all origins
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Device-ID"],
  credentials: true, // Note: Cannot use '*' with credentials: true
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use("/uploads", express.static("uploads"));

import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Connected");
    startHeartbeatMonitor();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};
connectDB();


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/monitor", monitorRoutes);
app.use("/api/child", childRoutes);
app.use("/api/parent", parentRoutes);
app.use("/api/supersafe", superSafeRoutes);
app.use("/api/timed-blocks", timedBlockRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

