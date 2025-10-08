const mongoose = require("mongoose");

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  groupId: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "group_info",
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true, 
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  status: {
    type: String,
    enum: ["pending", "accepted", "expired"],
    default: "pending",
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "site_users",
    required: true,
  },
}, { timestamps: true }); 

module.exports = mongoose.model("Invite", inviteSchema);
