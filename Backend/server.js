import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './configs/db.js';
import { Inngest } from 'inngest';
import { serve } from "inngest/express";

const app = express();
await connectDB();

// Create Inngest client
const inngest = new Inngest({
     name: 'My App',
      id: process.env.INNGEST_EVENT_KEY,  
       signingSecret: process.env.INNGEST_SIGNING_KEY 
    
    });

//inggest endpoint added here 
app.use("/api/inngest", serve({client:inngest,functions: []}));

// Define your functions here (empty array for now)
const functions = [];

// Middleware
app.use(express.json());
app.use(cors());

// Route to handle Inngest events
app.post('/api/inngest', async (req, res) => {
  try {
    await inngest.handle(req.body, functions);
    res.status(200).send('Event received');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error processing event');
  }
});
// Root route for testing
app.get('/', (req, res) => {
  res.send('Backend API is running 🚀');
});

// Optional: prevent favicon 404
app.get('/favicon.ico', (req, res) => res.status(204));


const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
