const mongoose = require("mongoose");
const Users = require('../models/users');
const Balances = require('../models/balance');
const Activity = require("../models/activity");

const getBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);

    const existUser = await Users.findById(objectId);
    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }
    const userBalance = await Balances.findOne({ userId: String(userId) });
    if (!userBalance) {
      return res.status(404).json({ message: "Balance not found" });
    }

    const activities = await Activity.find({ user: objectId })
      .populate("user", "name")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    return res.status(200).json({
      message: "Balance fetched successfully",
      balance: userBalance.net,
      activities,
    });

  } catch (error) {
    console.error("Error fetching balance:", error.message, error.stack);
    return res.status(500).json({ 
      message: "Internal server error", 
      error: error.message 
    });
  }
};

module.exports = getBalances;
