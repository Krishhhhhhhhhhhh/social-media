import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

import { functions } from "./inngest/index.js"; // path to your inngest/index.js
import { User } from "./Models/User.js";        // path to your User model

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URL)
  .then(() => console.log("MongoDB connected ✅"))
  .catch(err => console.error("MongoDB connection error:", err));

async function runTest() {
  // Find the Inngest function by ID
  const testUserCreation = functions.find(f => f.id === "sync-user-from-clerk");

  if (!testUserCreation) {
    console.error("sync-user-from-clerk function not found!");
    return;
  }

  // Simulate an event payload
  const dummyEvent = {
    data: {
      _id: "testuser123",
      first_name: "Test",
      last_name: "User",
      email_addresses: [{ email_address: "testuser123@example.com" }],
      image_url: "",
    }
  };

  // Call the function
  await testUserCreation.run({ event: dummyEvent });

  console.log("Dummy event sent ✅");
  process.exit();
}

runTest();
