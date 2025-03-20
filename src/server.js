require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins
app.use(bodyParser.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Create Mongoose Schema & Model
const routineSchema = new mongoose.Schema({
  morningRoutine: Array,
  date: { type: String, required: true, unique: true }, // Store date as string (YYYY-MM-DD)
});

const Routine = mongoose.model("Routine", routineSchema);

app.post("/save-routine", async (req, res) => {
  const { morningRoutine } = req.body;
  const todayDate = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format

  try {
    const existingRoutine = await Routine.findOne({ date: todayDate });

    if (existingRoutine) {
      return res.status(400).json({ error: "Today's routine has already been entered!" });
    }

    const newRoutine = new Routine({ morningRoutine, date: todayDate });
    await newRoutine.save();

    res.json({ success: "Routine saved successfully!" });
  } catch (error) {
    console.error("Error in save-routine:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});
// API to Get All Saved Routines
app.get("/routines", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });
    res.json(routines);
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({ error: "Error fetching routines" });
  }
});

// API to List Routines with Formatted Date & Time
app.get("/list", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });

    // Format response to include ID, Date, and Time
    const formattedRoutines = routines.map((routine) => ({
      id: routine._id,
      email: routine.email,
      date: routine.date.toISOString().split("T")[0], // Extracting only YYYY-MM-DD
      time: routine.date.toTimeString().split(" ")[0], // Extracting HH:MM:SS
      morningRoutine: routine.morningRoutine,
    }));

    res.json(formattedRoutines);
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({ error: "Error fetching routines" });
  }
});

app.get("/tracker-summary", async (req, res) => {
  try {
    const routines = await Routine.find({}, "date"); // Fetch only the date field
    const completedDates = routines.map((routine) => routine.date); // Extract dates

    res.json({ completedDates });
  } catch (error) {
    console.error("❌ Error fetching tracker summary:", error);
    res.status(500).json({ error: "Error fetching tracker summary" });
  }
});

// Root Endpoint
app.get("/", (req, res) => {
  res.send("🚀 Railway Server Running Successfully");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
