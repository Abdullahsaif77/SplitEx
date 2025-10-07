const mongoose = require("mongoose");

const settlementSchema = new mongoose.Schema({
  groupId: { type: String, required: true },
  payer: {
    userId: { type: String, required: true },
    username: String,
  },
  receiver: {
    userId: { type: String, required: true },
    username: String,
  },
  amount: { type: Number, required: true },
  createdBy: { type: String, required: true },
  paymentIntentId: { type: String },
}, { timestamps: true });

// ✅ Correct export
module.exports = mongoose.model("Settlement", settlementSchema);
