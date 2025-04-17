const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  resetToken: { type: String }, // Store password reset token
  resetTokenExpiry: { type: Date }, // Token expiry time
});

module.exports = mongoose.model("User", UserSchema);
