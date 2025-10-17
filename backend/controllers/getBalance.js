const mongoose = require("mongoose");
const Users = require('../models/users');
const Balances = require('../models/balance');
const Activity = require("../models/activity");

const getBalances = async (req, res) => {
  try {
    const userId = req.user.id;
    const objectId = new mongoose.Types.ObjectId(userId);
    let owesMe = 0;

    // ✅ Check if user exists
    const existUser = await Users.findById(objectId);
    if (!existUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Find ALL balances of this user across all groups
    const userBalances = await Balances.find({ userId: String(userId) });
    const owesMeBalances = await Balances.find({ 'owesMe.userId': String(userId) });

    owesMeBalances.forEach(balance => {
      balance.owesMe.forEach(entry => {
        if (entry.userId.toString() === userId.toString() && entry.amount > 0) {
          owesMe += entry.amount;
        }
      });
    });

    if (!userBalances || userBalances.length === 0) {
      return res.status(404).json({ message: "No balances found for this user" });
    }

    // Debugging: View each group’s net
    userBalances.forEach(b => {
      console.log(`🧾 GroupID: ${b.groupId}, Net: ${b.net}`);
    });

    // ✅ Properly calculate total balance (no double counting)
    let totalOwesMe = 0;
    let totalIOwe = 0;

    userBalances.forEach(b => {
      totalOwesMe += (b.owesMe || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      totalIOwe += (b.iOwe || []).reduce((sum, e) => sum + (e.amount || 0), 0);
    });

    // ✅ Normalize to prevent floating-point issues
    const normalize = (value) => (Math.abs(value) < 0.01 ? 0 : Number(value.toFixed(2)));
    const totalNetBalance = normalize(totalOwesMe - totalIOwe);

    // ✅ Get latest activities
    const activities = await Activity.find({ user: objectId })
      .populate("user", "name")
      .populate("group", "name")
      .sort({ createdAt: -1 })
      .limit(10);

    // ✅ Send response
    return res.status(200).json({
      message: "Balances fetched successfully",
      totalBalance: totalNetBalance,
      balances: userBalances,
      you_owe: owesMe,
      activities,
    });

  } catch (error) {
    console.error("Error fetching balances:", error.message, error.stack);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = getBalances;
