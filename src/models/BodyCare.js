const mongoose = require("mongoose");

const bodyCareSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  making: { type: String, required: true }, // HTML format content
  chart: { type: String, required: true }, // HTML format content
  image: { type: String, required: true }, // Store the image file path
  context: { type: Number, required: true }, // Context as a number
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("BodyCare", bodyCareSchema);
