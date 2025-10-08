const Group = require("../models/group");
const Expense = require("../models/expense");
const Balance = require("../models/balance");
const ActivityController = require("../controllers/activityController")

const expenseSplit = async (req, res) => {
  try {
    const { amount, description, currency, payer, method, participants } = req.body;

    if (!amount || !description || !currency || !payer || !method || !participants || participants.length === 0) {
      return res.status(400).json({
        message: "Fill all the inputs and ensure there is at least one participant",
      });
    }

    const groupId = req.params.id;
    const userId = req.user.id;

    const group = await Group.findOne({
      _id: groupId,
      "members.userId": userId,
    });
    if (!group) {
      return res.status(400).json({ message: "User is not a member of the group" });
    }

    const invalid = participants.filter(
      (p) => !group.members.some((m) => m.userId.toString() === p.userId)
    );
    if (invalid.length > 0) {
      return res
        .status(400)
        .json({ message: "Some participants are not in the group", invalid });
    }

    const filteredParticipants = participants.filter(
      (p) => p.userId.toString() !== payer.toString()
    );

    let splitDetails = [];
    let finalParticipants = [];

   
    switch (method) {
      case "equal": {
        const count = participants.length;
        const splitAmount = amount / count;
        splitDetails = participants.map((p) => ({
          userId: p.userId,
          amount: splitAmount,
        }));
        finalParticipants = participants.map((p) => ({
          userId: p.userId,
          share: splitAmount,
        }));
        break;
      }

      case "percentage": {
        const totalPercentage = participants.reduce((sum, p) => sum + p.share, 0);
        if (totalPercentage !== 100) {
          return res.status(400).json({ message: "Percentages must sum up to 100" });
        }
        splitDetails = participants.map((p) => ({
          userId: p.userId,
          amount: (amount * p.share) / 100,
        }));
        finalParticipants = participants;
        break;
      }

      case "exact": {
        const totalAmount = participants.reduce((sum, p) => sum + p.share, 0);
        if (Math.abs(totalAmount - amount) > 0.01) {
          return res.status(400).json({
            message: "Exact amounts must sum up to the total expense amount",
          });
        }
        splitDetails = participants.map((p) => ({
          userId: p.userId,
          amount: p.share,
        }));
        finalParticipants = participants;
        break;
      }

      default:
        return res.status(400).json({ message: "Invalid split method" });
    }

    
    const expenseNew = new Expense({
      groupId,
      createdBy: userId,
      payer,
      amount,
      currency,
      description,
      split: { method, details: splitDetails },
      participants: finalParticipants,
    });

    await expenseNew.save();

    
    for (const detail of splitDetails) {
      const participantId = detail.userId;
      const share = detail.amount;

      if (participantId.toString() === payer.toString()) continue; 

      
      let participantBalance = await Balance.findOne({ groupId, userId: participantId });
      if (!participantBalance) {
        participantBalance = new Balance({
          groupId,
          userId: participantId,
          net: 0,
          iOwe: [],
          owesMe: []
        });
      }

      participantBalance.net -= share;
      const iOweIndex = participantBalance.iOwe.findIndex(e => e.userId.toString() === payer.toString());
      if (iOweIndex >= 0) {
        participantBalance.iOwe[iOweIndex].amount += share;
      } else {
        participantBalance.iOwe.push({ userId: payer, amount: share });
      }
      await participantBalance.save();

      
      let payerBalance = await Balance.findOne({ groupId, userId: payer });
      if (!payerBalance) {
        payerBalance = new Balance({
          groupId,
          userId: payer,
          net: 0,
          iOwe: [],
          owesMe: []
        });
      }

      payerBalance.net += share;
      const owesMeIndex = payerBalance.owesMe.findIndex(e => e.userId.toString() === participantId.toString());
      if (owesMeIndex >= 0) {
        payerBalance.owesMe[owesMeIndex].amount += share;
      } else {
        payerBalance.owesMe.push({ userId: participantId, amount: share });
      }
      await payerBalance.save();
    }
    await ActivityController.logActivity(
      req.user.id,
      "EXPENSE_ADDED",
      expenseNew._id,   
      groupId,          
      `${req.user.name || "User"} added an expense of ${amount} ${currency} in group "${group.name}"`
    );
    


    return res.status(201).json({
      message: "Expense recorded & balances updated successfully",
      expense: expenseNew,
    });

  } catch (error) {
    console.error("Expense split error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

module.exports = expenseSplit;
