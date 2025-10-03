import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import { inngest, functions } from "./inngest/index.js"; // ✅ import Inngest + functions
import { serve } from "inngest/express";
import {clerkMiddleware} from '@clerk/express'

const app = express();
await connectDB();

// Middleware
app.use(express.json());
app.use(cors());
app.use(clerkMiddleware())


// Inngest endpoint for handling events
app.use("/api/inngest", serve({ client: inngest, functions }));

// Test route
app.get("/", (req, res) => {
  res.send("Backend API is running 🚀");
});




// Prevent favicon errors
app.get("/favicon.ico", (req, res) => res.status(204));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
