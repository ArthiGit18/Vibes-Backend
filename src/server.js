require("dotenv").config();
const express = require("express");
const cors = require("cors"); // Ensure CORS is enabled if calling from frontend
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const path = require("path");

// Import Routes
const healthyFoodRoutes = require("./routes/healthyFood");
const faceHairCareRoutes = require("./routes/faceHairCare"); // New Route
const bodyCareRoutes = require("./routes/bodyCare");
const routineRoutes = require("./routes/routineTracker");


// Initialize Express App
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({ origin: "*" }));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve Static Images
app.use("/images", express.static(path.join(__dirname, "public/images")));
app.use("/face_hair_care", express.static(path.join(__dirname, "public/face_hair_care"))); // New Image Folder
app.use("/uploads", express.static("uploads"));
app.use("/api", routineRoutes);
app.use("/api/routine", routineRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

// Use Routes
app.use("/api/food", healthyFoodRoutes);
app.use("/api/face-hair-care", faceHairCareRoutes); // New API Route
app.use("/api/body-care", bodyCareRoutes);


// Root Endpoint
app.get("/", (req, res) => {
  res.send("🚀 Railway Server Running Successfully");
});

// Start Server
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
