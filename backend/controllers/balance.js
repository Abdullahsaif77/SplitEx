const mongoose = require("mongoose");
const Expense = require("../models/expense");
const Balance = require("../models/balance");

const getBalances = async (req, res) => {
  try {
    const groupId = new mongoose.Types.ObjectId(req.params.id);
    const userIdStr = req.user.id;
    const userId = new mongoose.Types.ObjectId(userIdStr);

    
    const pairs = await Expense.aggregate([
      { $match: { groupId } },
      { $unwind: "$participants" },
      { $match: { $expr: { $ne: ["$participants.userId", "$payer"] } } },
      {
        $project: {
          from: "$participants.userId",
          to: "$payer",                 
          amount: "$participants.share"
        }
      },
      
      {
        $group: {
          _id: { from: "$from", to: "$to" },
          amount: { $sum: "$amount" }
        }
      },
      {
        $project: {
          from: "$_id.from",
          to: "$_id.to",
          amount: 1,
          _id: 0
        }
      },
      
      
      {
        $addFields: {
          u1: { $cond: [{ $lt: ["$from", "$to"] }, "$from", "$to"] },
          u2: { $cond: [{ $lt: ["$from", "$to"] }, "$to", "$from"] },
          dir: { $cond: [{ $lt: ["$from", "$to"] }, 1, -1] }
        }
      },
     
      {
        $group: {
          _id: { u1: "$u1", u2: "$u2" },
          net: { $sum: { $multiply: ["$amount", "$dir"] } }
        }
      },
      {
        $project: {
          _id: 0,
          u1: "$_id.u1",
          u2: "$_id.u2",
          net: 1
        }
      }
    ]);

    
    let myBalance = 0;
    const owesMe = [];
    const Iowe = [];

    for (const p of pairs) {
      const u1 = p.u1;
      const u2 = p.u2;
      const net = p.net; 

      if (u1.equals(userId)) {
        if (net > 0) {
          
          Iowe.push({ userId: u2, amount: net });
          myBalance -= net;
        } else if (net < 0) {
         
          owesMe.push({ userId: u2, amount: -net });
          myBalance += -net;
        }
      } else if (u2.equals(userId)) {
        if (net > 0) {
         
          owesMe.push({ userId: u1, amount: net });
          myBalance += net;
        } else if (net < 0) {
          
          Iowe.push({ userId: u1, amount: -net });
          myBalance -= -net;
        }
      }
      
    }

    
    const updated = await Balance.findOneAndUpdate(
      { groupId, userId },
      { $set: { net: myBalance, owesMe, Iowe } },
      { new: true, upsert: true }
    );

    res.json({
      myBalance,
      owesMe,
      Iowe
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = getBalances;
