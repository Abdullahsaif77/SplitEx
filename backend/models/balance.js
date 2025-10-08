const mongoose = require("mongoose");

const balanceSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true
  },
  userId: {
    type: String,
    required: true,
  },
  net: {
    type: Number,
    required: true,
    default: 0
  },
  owesMe: [
    {
      userId: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ],
  iOwe: [
    {
      userId: { type: String, required: true },
      amount: { type: Number, required: true }
    }
  ]
});

module.exports = mongoose.model("Balance", balanceSchema);
