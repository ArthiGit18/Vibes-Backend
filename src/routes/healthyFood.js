const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure images folder exists
const uploadDir = path.join(__dirname, "../public/images");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer Storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

// Create Mongoose Schema & Model
const healthyFoodSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    making: { type: String, required: true }, // HTML format content
    chart: { type: String, required: true }, // HTML format content
    image: { type: String, required: true }, // Store the image file path
    context: { type: Number, required: true },
    createdAt: { type: Date, default: Date.now }
});

const HealthyFood = mongoose.model("HealthyFood", healthyFoodSchema);

// 📌 Create a New Healthy Food Item (With Image Upload)
router.post("/create", upload.single("image"), async (req, res) => {
    try {
        const { name, description, making, chart, context } = req.body;
        const imagePath = req.file ? `/images/${req.file.filename}` : null;

        if (!imagePath) {
            return res.status(400).json({ error: "Image upload is required!" });
        }

        
      if (!context || isNaN(context)) {
        return res.status(400).json({ error: "Context must be a number!" });
      }

        const existingFood = await HealthyFood.findOne({ name });
        if (existingFood) {
            return res.status(400).json({ error: "Food item already exists!" });
        }

        const newFood = new HealthyFood({ name, description, making, chart, image: imagePath, context: Number(context) });
        await newFood.save();

        res.json({ success: "Food item added successfully!", data: newFood });
    } catch (error) {
        console.error("❌ Error creating food item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 Update an Existing Food Item (With Image Upload)
router.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
        const { id } = req.params;
        const { name, description, making, chart, context } = req.body;
        let imagePath;

        if (req.file) {
            imagePath = `/images/${req.file.filename}`;
        }

        if (context && isNaN(context)) {
            return res.status(400).json({ error: "Context must be a number!" });
          }
      
        const updatedFood = await HealthyFood.findByIdAndUpdate(
            id,
            { name, description, making, chart, ...(imagePath && { image: imagePath }), context: Number(context)  },
            { new: true }
        );

        if (!updatedFood) {
            return res.status(404).json({ error: "Food item not found!" });
        }

        res.json({ success: "Food item updated successfully!", data: updatedFood });
    } catch (error) {
        console.error("❌ Error updating food item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 List All Healthy Food Items
router.get("/list", async (req, res) => {
    try {
        const foodList = await HealthyFood.find().sort({ createdAt: -1 });
        res.json(foodList);
    } catch (error) {
        console.error("❌ Error fetching food list:", error);
        res.status(500).json({ error: "Error fetching food list" });
    }
});

// 📌 Delete a Food Item
router.delete("/delete/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const deletedFood = await HealthyFood.findByIdAndDelete(id);

        if (!deletedFood) {
            return res.status(404).json({ error: "Food item not found!" });
        }

        // Delete the image from the server
        const imagePath = path.join(__dirname, "../public", deletedFood.image);
        if (fs.existsSync(imagePath)) {
            fs.unlinkSync(imagePath);
        }

        res.json({ success: "Food item deleted successfully!" });
    } catch (error) {
        console.error("❌ Error deleting food item:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// 📌 Filter API: List Food Names Only
router.get("/filter", async (req, res) => {
    try {
        const foodNames = await HealthyFood.find({}, "name");
        res.json(foodNames);
    } catch (error) {
        console.error("❌ Error fetching food names:", error);
        res.status(500).json({ error: "Error fetching food names" });
    }
});

module.exports = router;
