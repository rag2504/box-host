import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { createServer } from "http";
import { Server } from "socket.io";

// Routes
import testRoutes from "./routes/test.js";
import authRoutes from "./routes/auth.js";
import groundRoutes, { adminRouter as adminGroundsRouter } from "./routes/grounds.js";
import bookingRoutes, { adminRouter as adminBookingsRouter } from "./routes/bookings.js";
import userRoutes from "./routes/users.js";
import paymentsRoutes from "./routes/payments.js";
import { adminRouter as adminLocationsRouter } from "./routes/locations.js";

// Environment Config
dotenv.config();

// App and Server Initialization
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.NODE_ENV === 'production' 
      ? [process.env.FRONTEND_URL, '*'] // In production, accept the deployed frontend URL and any origin as fallback
      : [
          "http://localhost:5173",
          "http://localhost:8080",
          "http://localhost:3000",
          "http://localhost:4000"
        ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, '*'] // In production, accept the deployed frontend URL and any origin as fallback
    : [
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:3000",
        "http://localhost:4000"
      ],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://rag123456:rag123456@cluster0.qipvo.mongodb.net/boxcricket?retryWrites=true&w=majority';
let isMongoConnected = false;

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
    isMongoConnected = true;
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message);
    console.log("⚠️ Running without database connection");
    isMongoConnected = false;
  });

app.set("mongoConnected", () => isMongoConnected);

// Cashfree Configuration
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY;
const CASHFREE_API_URL = process.env.CASHFREE_API_URL || 'https://api.cashfree.com/pg';

// Socket.IO Setup
io.on("connection", (socket) => {
  console.log("🧠 Socket connected:", socket.id);

  socket.on("join-ground", (groundId) => {
    socket.join(`ground-${groundId}`);
    console.log(`📍 User joined room: ground-${groundId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// Attach IO to app
app.set("io", io);

// Routes
app.use("/api/test", testRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/grounds", groundRoutes);
app.use("/api/admin/grounds", adminGroundsRouter);
app.use("/api/bookings", bookingRoutes);
app.use("/api/admin/bookings", adminBookingsRouter);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentsRoutes);
app.use("/api/admin/locations", adminLocationsRouter);

// Health Check
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "BoxCric API is running successfully!",
    mongoConnected: isMongoConnected,
    timestamp: new Date().toISOString(),
  });
});

// 404 Handler
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "API endpoint not found",
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("🚨 Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// Server Listener
const PORT = process.env.PORT || 3001;
// Always use 0.0.0.0 on Render or in production to accept connections from any IP
// Force 0.0.0.0 for all deployments to ensure proper binding
const HOST = '0.0.0.0';

// Debug environment variables
console.log('Environment Variables:');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`RENDER: ${process.env.RENDER ? 'true' : 'undefined'}`);
console.log(`HOST: ${HOST}`);
console.log(`PORT: ${PORT}`);

// Additional debug info
console.log('Server binding to:', `${HOST}:${PORT}`);
console.log('Running in environment:', process.env.NODE_ENV || 'development');

server.listen(PORT, HOST, () => {
  console.log(`🚀 BoxCric API Server running on http://${HOST}:${PORT}`);
  console.log(`📡 Frontend expected at: ${process.env.FRONTEND_URL || 'http://localhost:8080'}`);
  console.log(`💳 Cashfree Config:`);

  if (CASHFREE_APP_ID && CASHFREE_SECRET_KEY) {
    console.log(`   ✅ App ID: ${CASHFREE_APP_ID.slice(0, 6)}...`);
    console.log(`   ✅ Secret Key: ${CASHFREE_SECRET_KEY.slice(0, 6)}...`);
    console.log(`   ✅ API URL: ${CASHFREE_API_URL}`);
  } else {
    console.log(`   ❌ Cashfree credentials not set`);
  }
});


export default app;
