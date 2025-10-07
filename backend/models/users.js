const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true, 
      trim: true,
    },
    email: {
      type: String,
      unique: true,
      required: true, 
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true, 
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, 
  }
);

module.exports = mongoose.model("site_users", userSchema);
