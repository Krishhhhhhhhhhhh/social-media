import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

// Import your User model
import { User } from "./Models/User.js"; 

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGODB_URL}/socialmedia`);
    console.log("MongoDB connected ✅");
  } catch (err) {
    console.error("MongoDB connection error:", err);
  }
};

const sendDummyData = async () => {
  await connectDB();

  try {
    const dummyUser = {
      _id: "testuser12454545453",
      email: "testuser@example.com",
      full_name: "Test User",
      username: "testuse2323r",
      profile_picture: "https://example.com/profile.png",
      lastLogin: new Date(),
    };

    const savedUser = await User.create(dummyUser);
    console.log("Dummy data saved ✅:", savedUser);
  } catch (err) {
    console.error("Error saving dummy data:", err);
  } finally {
    mongoose.connection.close();
  }
};

sendDummyData();
