const mongoose = require("mongoose");

const activitySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "site_users", // who performed the action
    required: true
  },
  type: {
    type: String,
    enum: ["EXPENSE_ADDED", "GROUP_CREATED", "SETTLEMENT_DONE"],
    required: true
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId, // e.g. Expense ID, Group ID, Settlement ID
  },
  group: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "group_info", // optional link to group
  },
  message: {
    type: String, // human-readable text
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("activity", activitySchema);
