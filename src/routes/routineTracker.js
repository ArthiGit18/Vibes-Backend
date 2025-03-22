const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Create Mongoose Schema & Model
const routineSchema = new mongoose.Schema({
  morningRoutine: Array,
  date: { type: String, required: true, unique: true }, // Store date as string (YYYY-MM-DD)
});

const Routine = mongoose.model("Routine", routineSchema);

// API to Save a New Routine
router.post("/save-routine", async (req, res) => {
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
router.get("/routines", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });
    res.json(routines);
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({ error: "Error fetching routines" });
  }
});

// API to List Routines with Formatted Date & Time
router.get("/list", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });

    // Format response to include ID, Date, and Time
    const formattedRoutines = routines.map((routine) => ({
      id: routine._id,
      date: routine.date.toISOString().split("T")[0], // Extracting only YYYY-MM-DD
      morningRoutine: routine.morningRoutine,
    }));

    res.json(formattedRoutines);
  } catch (error) {
    console.error("❌ Error fetching routines:", error);
    res.status(500).json({ error: "Error fetching routines" });
  }
});

router.get("/check-routine", async (req, res) => {
    const todayDate = new Date().toISOString().split("T")[0]; // Get YYYY-MM-DD format
  
    try {
      const existingRoutine = await Routine.findOne({ date: todayDate });
  
      if (existingRoutine) {
        return res.json({ exists: true, routine: existingRoutine });
      } else {
        return res.json({ exists: false });
      }
    } catch (error) {
      console.error("❌ Error checking routine:", error);
      res.status(500).json({ error: "Error checking routine" });
    }
  });

// API to Get Tracker Summary (Completed Dates)
router.get("/tracker-summary", async (req, res) => {
  try {
    const routines = await Routine.find({}, "date"); // Fetch only the date field
    const completedDates = routines.map((routine) => routine.date); // Extract dates

    res.json({ completedDates });
  } catch (error) {
    console.error("❌ Error fetching tracker summary:", error);
    res.status(500).json({ error: "Error fetching tracker summary" });
  }
});

module.exports = router;
