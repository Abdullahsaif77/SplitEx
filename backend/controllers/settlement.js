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

    // ✅ Find relationship entry between payer and receiver
    const owesEntryOnPayer = payerBalance.iOwe.find(
      (e) => e.userId.toString() === receiver.toString()
    );
    const owesEntryOnReceiver = receiverBalance.owesMe.find(
      (e) => e.userId.toString() === payer.toString()
    );

    if (!owesEntryOnPayer || owesEntryOnPayer.amount <= 0) {
      return res.status(400).json({ message: "Payer does not owe this receiver" });
    }

    if (amount > owesEntryOnPayer.amount) {
      return res.status(400).json({ message: "Settlement amount exceeds owed amount" });
    }

    // ✅ Decrease the owed amounts for both
    owesEntryOnPayer.amount -= amount;
    owesEntryOnReceiver.amount -= amount;

    // ✅ Remove zero or negative entries
    payerBalance.iOwe = payerBalance.iOwe.filter((e) => e.amount > 0);
    receiverBalance.owesMe = receiverBalance.owesMe.filter((e) => e.amount > 0);

    // ✅ Recompute net balances
    const recomputeNet = (balance) => {
      const owesMeTotal = (balance.owesMe || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      const iOweTotal = (balance.iOwe || []).reduce((sum, e) => sum + (e.amount || 0), 0);
      return owesMeTotal - iOweTotal;
    };

    payerBalance.net = recomputeNet(payerBalance);
    receiverBalance.net = recomputeNet(receiverBalance);

    // ✅ Normalize near-zero values (avoid floating point errors)
    const normalize = (v) => (Math.abs(v) < 0.001 ? 0 : Number(v.toFixed(2)));
    payerBalance.net = normalize(payerBalance.net);
    receiverBalance.net = normalize(receiverBalance.net);

    // ✅ Reset if fully clear
    if (payerBalance.iOwe.length === 0 && payerBalance.owesMe.length === 0) payerBalance.net = 0;
    if (receiverBalance.iOwe.length === 0 && receiverBalance.owesMe.length === 0) receiverBalance.net = 0;

    // ✅ Save updates
    await payerBalance.save();
    await receiverBalance.save();

    // ✅ Log settlement
    const payerUser = await User.findById(payer).select("name username");
    const receiverUser = await User.findById(receiver).select("name username");

    const newSettlement = new Settlement({
      groupId,
      payer: {
        userId: payer,
        username: payerUser?.username || payerUser?.name || "payer",
      },
      receiver: {
        userId: receiver,
        username: receiverUser?.username || receiverUser?.name || "receiver",
      },
      amount,
      createdBy: userId,
      paymentIntentId: "TEST",
    });

    await newSettlement.save();

    await ActivityController.logActivity(
      userId,
      "SETTLEMENT_CREATED",
      groupId,
      newSettlement._id,
      `${payerUser?.username || "payer"} settled ${amount} with ${
        receiverUser?.username || "receiver"
      }`
    );

    return res.status(200).json({
      message: "Settlement successful (fixed version ✅)",
      settlement: newSettlement,
      updatedBalances: { payer: payerBalance, receiver: receiverBalance },
    });
  } catch (error) {
    console.error("Settlement error:", error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = settleAmountTest;
