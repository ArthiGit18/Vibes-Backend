const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const BodyCare = require("../models/BodyCare");

const router = express.Router();

// Ensure bodycare directory exists
const bodycareDir = path.join(__dirname, "../uploads/bodycare");
if (!fs.existsSync(bodycareDir)) {
  fs.mkdirSync(bodycareDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, bodycareDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// 📌 CREATE API
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const { name, description, making, chart, context } = req.body;
    const imagePath = req.file ? `/bodycare/${req.file.filename}` : null;

    if (!imagePath) {
      return res.status(400).json({ error: "Image upload is required!" });
    }

    if (!context || isNaN(context)) {
      return res.status(400).json({ error: "Context must be a number!" });
    }

    const existingItem = await BodyCare.findOne({ name });
    if (existingItem) {
      return res.status(400).json({ error: "Item already exists!" });
    }

    const newItem = new BodyCare({ 
      name, 
      description, 
      making, 
      chart, 
      context: Number(context), 
      image: imagePath 
    });

    await newItem.save();
    res.json({ success: "Body Care Tip added successfully!", data: newItem });
  } catch (error) {
    console.error("❌ Error creating body care tip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 UPDATE API
router.put("/update/:id", upload.single("image"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, making, chart, context } = req.body;
    let imagePath;

    if (req.file) {
      imagePath = `/bodycare/${req.file.filename}`;
    }

    if (context && isNaN(context)) {
      return res.status(400).json({ error: "Context must be a number!" });
    }

    const updatedItem = await BodyCare.findByIdAndUpdate(
      id,
      { name, description, making, chart, ...(imagePath && { image: imagePath }), context: Number(context) },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ error: "Body Care Tip not found!" });
    }

    res.json({ success: "Body Care Tip updated successfully!", data: updatedItem });
  } catch (error) {
    console.error("❌ Error updating body care tip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// 📌 GET LIST API
router.get("/list", async (req, res) => {
  try {
    const items = await BodyCare.find().sort({ createdAt: -1 });
    res.json(items);
  } catch (error) {
    console.error("❌ Error fetching body care tips:", error);
    res.status(500).json({ error: "Error fetching body care tips" });
  }
});

// 📌 DELETE API
router.delete("/delete/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const deletedItem = await BodyCare.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: "Body Care Tip not found!" });
    }

    res.json({ success: "Body Care Tip deleted successfully!" });
  } catch (error) {
    console.error("❌ Error deleting body care tip:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
