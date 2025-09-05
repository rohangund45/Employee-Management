import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import connectToDatabase from './db/db.js';
import authRoute from './routes/authRoute.js';
import departmentRoute from './routes/departmentRoute.js';
import employeeRoute from './routes/employeeRoute.js';

// Setup environment
dotenv.config();
const app = express();

// Get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Connect to MongoDB
connectToDatabase();

// ✅ Middleware
app.use(cors());
app.use(express.json());

// ✅ Logger
app.use((req, res, next) => {
  console.log(`👉 ${req.method} ${req.url}`);
  next();
});

// ✅ Serve uploaded images statically
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

// ✅ API Routes
app.use("/api/auth", authRoute);
app.use("/api/department", departmentRoute);
app.use("/api/employee", employeeRoute);

// ✅ Global Error Handler
app.use((err, req, res, next) => {
  console.error("❌ Uncaught server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

// ✅ Start Server
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});
