import { Inngest } from "inngest";
import { User } from "../Models/User.js";

// Create a single Inngest client
export const inngest = new Inngest({
  id: "pingup-app",
  name: "PingUp App",
});

// -----------------------
// Function: New User Signup
// -----------------------
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    try {
      const { id, first_name = "New", last_name = "User", email_addresses = [], image_url = "" } = event.data;

      // Fallback email if none provided
      const email = email_addresses[0]?.email_address || `user${Date.now()}@example.com`;
      let username = email.split("@")[0];

      // Check if username already exists
      const userExists = await User.findOne({ username });
      if (userExists) {
        username = username + Math.floor(Math.random() * 10000);
      }

      await User.create({
        _id: id,
        email,
        full_name: `${first_name} ${last_name}`,
        profile_picture: image_url,
        username,
      });

      console.log("New user created:", id);
    } catch (err) {
      console.error("Error in syncUserCreation:", err);
    }
  }
);

// -----------------------
// Function: Update User Profile
// -----------------------
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    try {
      const { id, first_name = "", last_name = "", email_addresses = [], image_url = "" } = event.data;
      const email = email_addresses[0]?.email_address || "";

      await User.findByIdAndUpdate(id, {
        email,
        full_name: `${first_name} ${last_name}`.trim(),
        profile_picture: image_url,
      });

      console.log("User updated:", id);
    } catch (err) {
      console.error("Error in syncUserUpdation:", err);
    }
  }
);

// -----------------------
// Function: Delete User
// -----------------------
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    try {
      await User.findByIdAndDelete(event.data.id);
      console.log("User deleted:", event.data.id);
    } catch (err) {
      console.error("Error in syncUserDeletion:", err);
    }
  }
);

// -----------------------
// Function: Track User Login
// -----------------------
const syncUserLogin = inngest.createFunction(
  { id: "sync-user-login" },
  { event: "clerk/session.created" },
  async ({ event }) => {
    try {
      const userId = event.data.user_id;
      console.log("User logged in:", userId);

      let user = await User.findById(userId);

      if (!user) {
        // Create user if it doesn't exist yet
        const email = event.data.public_metadata?.email || `user${Date.now()}@example.com`;
        const username = event.data.public_metadata?.username || `user${Date.now()}`;
        const full_name = event.data.public_metadata?.full_name || "New User";

        user = await User.create({
          _id: userId,
          email,
          username,
          full_name,
          lastLogin: new Date(),
        });

        console.log("New user created on login:", userId);
      } else {
        // Update last login timestamp
        user.lastLogin = new Date();
        await user.save();
        console.log("Updated lastLogin for user:", userId);
      }
    } catch (err) {
      console.error("Error in syncUserLogin:", err);
    }
  }
);

// -----------------------
// Export All Functions
// -----------------------
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  syncUserLogin,
];
