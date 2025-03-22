const express = require("express");
const mongoose = require("mongoose");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Ensure face & hair care images folder exists
const uploadDir = path.join(__dirname, "../public/face_hair_care");
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
const faceHairCareSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    making: { type: String, required: true }, // HTML format content
    chart: { type: String, required: true }, // HTML format content
    image: { type: String, required: true }, // Store the image file path
    context: { type: Number, required: true }, // NEW: Context as a Number
    createdAt: { type: Date, default: Date.now }
  });

const FaceHairCare = mongoose.model("FaceHairCare", faceHairCareSchema);

// 📌 Create a New Face & Hair Care Item (With Image Upload)
router.post("/create", upload.single("image"), async (req, res) => {
    try {
      const { name, description, making, chart, context } = req.body;
      const imagePath = req.file ? `/face_hair_care/${req.file.filename}` : null;
  
      if (!imagePath) {
        return res.status(400).json({ error: "Image upload is required!" });
      }
  
      if (!context || isNaN(context)) {
        return res.status(400).json({ error: "Context must be a number!" });
      }
  
      const existingItem = await FaceHairCare.findOne({ name });
      if (existingItem) {
        return res.status(400).json({ error: "Item already exists!" });
      }
  
      const newItem = new FaceHairCare({ 
        name, 
        description, 
        making, 
        chart, 
        context: Number(context), // Ensure it's stored as a number
        image: imagePath 
      });
  
      await newItem.save();
      res.json({ success: "Item added successfully!", data: newItem });
    } catch (error) {
      console.error("❌ Error creating item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });

// 📌 Update an Existing Face & Hair Care Item (With Image Upload)
router.put("/update/:id", upload.single("image"), async (req, res) => {
    try {
      const { id } = req.params;
      const { name, description, making, chart, context } = req.body;
      let imagePath;
  
      if (req.file) {
        imagePath = `/face_hair_care/${req.file.filename}`;
      }
  
      if (context && isNaN(context)) {
        return res.status(400).json({ error: "Context must be a number!" });
      }
  
      const updatedItem = await FaceHairCare.findByIdAndUpdate(
        id,
        { name, description, making, chart, ...(imagePath && { image: imagePath }), context: Number(context) },
        { new: true }
      );
  
      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found!" });
      }
  
      res.json({ success: "Item updated successfully!", data: updatedItem });
    } catch (error) {
      console.error("❌ Error updating item:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  });
  

// 📌 List All Face & Hair Care Items
router.get("/list", async (req, res) => {
  try {
    const itemList = await FaceHairCare.find().sort({ createdAt: -1 });
    res.json(itemList);
  } catch (error) {
    console.error("❌ Error fetching item list:", error);
    res.status(500).json({ error: "Error fetching item list" });
  }
});

// 📌 Delete an Item
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await FaceHairCare.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found!" });
    }

    // Delete the image from the server
    const imagePath = path.join(__dirname, "../public", deletedItem.image);
    if (fs.existsSync(imagePath)) {
      fs.unlinkSync(imagePath);
    }

    res.json({ success: "Item deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 Filter API: List Only Item Names
router.get("/filter", async (req, res) => {
  try {
    const itemNames = await FaceHairCare.find({}, "name");
    res.json(itemNames);
  } catch (error) {
    console.error("❌ Error fetching item names:", error);
    res.status(500).json({ error: "Error fetching item names" });
  }
});

module.exports = router;
