require("dotenv").config();
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");

// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" })); // Allow all origins
app.use(bodyParser.json());

// Connect to MongoDB using the correct URI from .env
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Create Mongoose Schema & Model
const RoutineSchema = new mongoose.Schema({
  email: String,
  morningRoutine: Array,
  date: { type: Date, default: Date.now },
});

const Routine = mongoose.model("Routine", RoutineSchema);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
});

// API to Save Routine & Send Email
app.post("/send-email", async (req, res) => {
  const { email, morningRoutine } = req.body;

  if (!email || !morningRoutine) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    // Save to Database
    const newRoutine = new Routine({ email, morningRoutine });
    await newRoutine.save();

    // Email Content
    let emailContent = `<h2>Morning Routine Summary</h2>`;
    emailContent += `<p>Date: ${new Date().toLocaleString()}</p>`;
    emailContent += `<table border="1" cellpadding="5"><tr><th>Activity</th><th>Completed</th><th>Notes</th><th>Time</th></tr>`;

    morningRoutine.forEach((item) => {
      emailContent += `<tr>
            <td>${item.name}</td>
            <td>${item.completed ? "Yes" : "No"}</td>
            <td>${item.notes || "N/A"}</td>
            <td>${item.time}</td>
          </tr>`;
    });

    emailContent += `</table>`;

    // Send Email
    await transporter.sendMail({
      from: process.env.GMAIL_USER,
      to: email,
      subject: "Your Morning Routine Summary",
      html: emailContent,
    });

    res.json({ success: "Email sent and routine saved successfully!" });
  } catch (error) {
    console.error("❌ Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// API to Get All Saved Routines
app.get("/routines", async (req, res) => {
  try {
    const routines = await Routine.find().sort({ date: -1 });
    res.json(routines);
  } catch (error) {
    res.status(500).json({ error: "Error fetching routines" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
