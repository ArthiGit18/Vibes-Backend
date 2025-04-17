const express = require("express");
const mongoose = require("mongoose");

const router = express.Router();

// Create Mongoose Schema & Model
const routineSchema = new mongoose.Schema({
  email: { type: String, required: true },
  morningRoutine: Array,
  date: { type: String }, // ✅ No unique constraint
});

const Routine = mongoose.model("Routine", routineSchema);

router.post("/save-routine", async (req, res) => {
  const { email, morningRoutine } = req.body;
  const todayDate = new Date().toISOString().split("T")[0]; // YYYY-MM-DD format

  try {
    // Check if this email already submitted a routine today
    const existingRoutine = await Routine.findOne({ email, date: todayDate });

    if (existingRoutine) {
      return res.status(400).json({ error: "You have already submitted today's routine!" });
    }

    // Save new routine
    const newRoutine = new Routine({
      email,
      morningRoutine,
      date: todayDate, // Save only the date, not full ISO timestamp
    });

    await newRoutine.save();

    res.json({ success: "Routine saved successfully!" });
  } catch (error) {
    console.error("❌ Error in save-routine:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});


// API to Get All Saved Routines

router.get("/routines", async (req, res) => {
  try {
      const { email, date } = req.query;
      console.log("Received query params:", { email, date }); // Debugging

      if (!email || !date) {
          return res.status(400).json({ error: "Email and date are required." });
      }

      // const routines = await Routine.find({ email, date }).sort({ date: -1 });``
      const routines = await Routine.find({
        email: String(email),
        date: String(date)
    }).sort({ date: -1 });

      console.log("Filtered routines:", routines); // Debugging
      res.json(routines);
  } catch (error) {
      console.error("❌ Error fetching routines:", error);
      res.status(500).json({ error: "Error fetching routines" });
  }
});
// API to List Routines with Email, Date & Time
router.get("/list", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });
    const formattedRoutines = routines.map((routine) => ({
      id: routine._id,
      email: routine.email,
      date: routine.date,
      morningRoutine: routine.morningRoutine,
    }));
    res.json(formattedRoutines);
  } catch (error) {
    console.error("Error fetching routines:", error);
    res.status(500).json({ error: "Error fetching routines" });
  }
});

// API to Check if Today's Routine Exists
router.get("/check-routine", async (req, res) => {
  const todayDate = new Date().toISOString().split("T")[0];
  const { email } = req.query;

  try {
    const existingRoutine = await Routine.findOne({ date: todayDate, email });
    res.json({ exists: !!existingRoutine, routine: existingRoutine || null });
  } catch (error) {
    console.error("Error checking routine:", error);
    res.status(500).json({ error: "Error checking routine" });
  }
});

// API to Get Tracker Summary
router.get("/tracker-summary", async (req, res) => {
  try {
    // Fetch all routines with only `date` and `email` fields
    const routines = await Routine.find({}, "date email");
    
    // Convert the data into an array of { date, email }
    const completedDates = routines.map((routine) => ({
      date: routine.date,
      email: routine.email,
    }));

    res.json({ completedDates });
  } catch (error) {
    console.error("❌ Error fetching tracker summary:", error);
    res.status(500).json({ error: "Error fetching tracker summary" });
  }
});

module.exports = router;