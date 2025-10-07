const Group = require("../models/group");
const Settlement = require("../models/settle");
const Balance = require("../models/balance");
const User = require("../models/users");
const ActivityController = require("../controllers/activityController");


const settleAmountTest = async (req, res) => {
  try {
    const groupId = req.params.id;
    const userId = req.user.id;
    const { payer, receiver, amount } = req.body;

    if (!payer || !receiver || !amount) {
      return res.status(400).json({ message: "Fill all the inputs" });
    }

    const existGroup = await Group.findById(groupId);
    if (!existGroup)
      return res.status(400).json({ message: "Group does not exist" });

    const payerBalance = await Balance.findOne({ userId: payer, groupId });
    const receiverBalance = await Balance.findOne({ userId: receiver, groupId });
    

    if (!payerBalance || !receiverBalance) {
      return res.status(404).json({ message: "Payer or receiver balance not found" });
    }

    const owesEntryOnPayer = (payerBalance.iOwe).find(
      (e) => e.userId.toString() === receiver.toString()
    );
    console.log(owesEntryOnPayer)

    if (!owesEntryOnPayer || owesEntryOnPayer.amount <= 0) {
      return res.status(400).json({ message: "Payer does not owe this receiver" });
    }

    if (amount > owesEntryOnPayer.amount) {
      return res.status(400).json({ message: "Settlement amount exceeds owed amount" });
    }

    payerBalance.iOwe = (payerBalance.iOwe || [])
      .map((e) => e.userId.toString() === receiver.toString() ? { ...e, amount: e.amount - amount } : e)
      .filter((e) => e.amount > 0);

    receiverBalance.owesMe = (receiverBalance.owesMe || [])
      .map((e) => e.userId.toString() === payer.toString() ? { ...e, amount: e.amount - amount } : e)
      .filter((e) => e.amount > 0);

    
    const recomputeNet = (b) => {
      const owesMeTotal = (b.owesMe || []).reduce((s, e) => s + (e.amount || 0), 0);
      const iOweTotal = (b.iOwe || []).reduce((s, e) => s + (e.amount || 0), 0);
      b.net = owesMeTotal - iOweTotal;
    };

    recomputeNet(payerBalance);
    recomputeNet(receiverBalance);

    await payerBalance.save();
    await receiverBalance.save();

    
    const payerUser = await User.findById(payer).select("name");
    const receiverUser = await User.findById(receiver).select("name");

    const newSettlement = new Settlement({
      groupId,
      payer: { userId: payer, username: payerUser?.username || "payer" },
      receiver: { userId: receiver, username: receiverUser?.username || "receiver" },
      amount,
      createdBy: userId,
      paymentIntentId: "TEST" 
    });

    await newSettlement.save();

    await ActivityController.logActivity(
      userId,
      "SETTLEMENT_CREATED",
      groupId,
      newSettlement._id,
      `${payerUser?.username || "payer"} settled ${amount} with ${receiverUser?.username || "receiver"}`
    );

    return res.json({
      message: "Settlement successful (test)",
      settlement: newSettlement,
      updatedBalances: { payer: payerBalance, receiver: receiverBalance },
    });

  } catch (error) {
    console.error("Settlement error:", error);
    return res.status(500).json({ error: "Server error" });
  }
};

module.exports = settleAmountTest;
