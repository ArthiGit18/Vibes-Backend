const mongoose = require("mongoose");

const routineSchema = new mongoose.Schema({
  email: { type: String, required: true }, // Email of the user
  morningRoutine: Array,
  date: { type: String, required: true, unique: true }, // YYYY-MM-DD format
});

const Routine = mongoose.model("Routine", routineSchema);
module.exports = Routine;
