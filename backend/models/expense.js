const mongoose = require("mongoose");


const participantSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "site_users",
    required: true,
  },
  share: {
    type: Number, 
    required: true,
  },
  paid: {
    type: Number, 
    default: 0,
  },
});

const expenseSchema = new mongoose.Schema(
  {
    groupId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "groups",
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "site_users",
      required: true,
    },
    payer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "site_users",
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
      default: "PKR",
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      default: Date.now,
    },

    
    split: {
      method: {
        type: String,
        enum: ["equal", "percentage", "exact"],
        default: "equal",
      },
      details: [
        {
          userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "site_users",
            required: true,
          },
          amount: {
            type: Number, 
            required: true,
          },
        },
      ],
    },

    participants: [participantSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("expenses", expenseSchema);
