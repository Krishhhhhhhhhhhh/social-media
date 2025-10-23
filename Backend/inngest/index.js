import { Inngest } from "inngest";
import { User } from "../Models/User.js";
import connectDB from "../configs/db.js";
import Connections from "../Models/Connections.js";
import sendEmail from "../configs/nodeMailer.js";

await connectDB();
console.log("MongoDB URL check:", process.env.MONGODB_URL ? "✅ Loaded" : "❌ Missing");
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
      const { id, first_name = "New", last_name = "User", email_addresses = [], image_url = "" } = event.data;
      const email = email_addresses[0]?.email_address || `user${Date.now()}@example.com`;
      const full_name = `${first_name} ${last_name}`.trim();
      const username = email.split("@")[0];

      // Find existing user
      let user = await User.findById(id);

      if (!user) {
        // Create new user if it doesn't exist
        user = await User.create({
          _id: id,
          email,
          full_name,
          profile_picture: image_url,
          username,
        });
        console.log("User created on update:", id);
      } else {
        // Update existing user
        user.email = email;
        user.full_name = full_name;
        user.profile_picture = image_url;
        await user.save();
        console.log("User updated:", id);
      }
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
    console.log("clerk session created");
    console.log("Full event daata",event.data);
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
//Inngest function to send Remainder when a new connection request is added
const sendNewConnectionRequestRemainder=inngest.createFunction(
  {id:"send-new-connection-request-remainder"},
  {event:"app/connection-request"},
  async({event,step})=>{
    const {connectionId}=event.data;

    await step.run('send-connection-request-mail',async()=>{
      const connection=await Connections.findById(connectionId).populate('from_user_id to_user_id');
      const subject=`New Connection Request`;
      const body=`<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${connection.to_user_id.full_name},</h2>
  <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request</p>
  <br/>
  <p>Thanks,<br/>PingUp - Stay Connected</p>
</div>
 `;
 await sendEmail({
  to:connection.to_user_id.email,
  subject,
  body
 })

    })
    const in24Hours=new Date(Date.now() + 24*60*60*1000)
    await step.sleepUntil("Wait-for-24-hours",in24Hours);
    await step.run('send-connection-request-remainder',async()=>{
      const connection=await Connections.findById(connectionId).populate('from_user_id to_user_id');
      if(connection.status =="Accepted")
        {
          return {message:"Already accepted"}
        }
        const subject=`New Connection Request`;
      const body=`<div style="font-family: Arial, sans-serif; padding: 20px;">
  <h2>Hi ${connection.to_user_id.full_name},</h2>
  <p>You have a new connection request from ${connection.from_user_id.full_name} - @${connection.from_user_id.username}</p>
  <p>Click <a href="${process.env.FRONTEND_URL}/connections" style="color:#10b981;">here</a> to accept or reject the request</p>
  <br/>
  <p>Thanks,<br/>PingUp - Stay Connected</p>
</div>
 `;
 await sendEmail({
  to:connection.to_user_id.email,
  subject,
  body
 })
 return {message:"Remainder sent"}
      
    })

  }
)

// -----------------------
// Export All Functions
// -----------------------
export const functions = [
  syncUserCreation,
  syncUserUpdation,
  syncUserDeletion,
  syncUserLogin,
  sendNewConnectionRequestRemainder
];
