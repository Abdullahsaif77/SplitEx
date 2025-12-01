const express = require("express");
const Settlement = require("../models/settle");
const Balance = require("../models/balance");

module.exports = (io) => {
  const router = express.Router();

  // ✅ Generic checkout route (dummy, no Stripe)
  router.post("/create-checkout-session", async (req, res) => {
    try {
      const { payer, reciever, amount, groupId } = req.body;

      // Simulate a successful checkout session
      const sessionId = `session_${Date.now()}`;

      // Optionally, you can immediately create the settlement
      const settlement = await Settlement.create({
        payer,
        reciever,
        amount,
        groupId,
        status: "paid", // mark as paid since no real payment
        stripeSessionId: sessionId, // just a placeholder
      });

      // Update balance
      await Balance.updateOne(
        { groupId, userId: reciever.id },
        { $inc: { balance: amount } },
        { upsert: true }
      );

      // Emit socket event if io is available
      if (io) {
        io.in(groupId).emit("settlementCompleted", {
          settlementId: settlement._id,
          payer,
          reciever,
          amount,
        });
      }

      console.log("✅ Settlement saved & socket emitted");

      // Respond with dummy session URL
      res.json({ url: `/success?session_id=${sessionId}` });
    } catch (error) {
      console.error("❌ Error creating checkout session:", error.message);
      res.status(500).json({ error: error.message });
    }
  });

  // ✅ Webhook route (generic, no Stripe)
  router.post("/webhook", async (req, res) => {
    // Example: receive a payload and process it generically
    const { payer, reciever, amount, groupId } = req.body;

    if (payer && reciever && amount && groupId) {
      try {
        const settlement = await Settlement.create({
          payer,
          reciever,
          amount,
          groupId,
          status: "paid",
        });

        await Balance.updateOne(
          { groupId, userId: reciever.id },
          { $inc: { balance: amount } },
          { upsert: true }
        );

        if (io) {
          io.in(groupId).emit("settlementCompleted", {
            settlementId: settlement._id,
            payer,
            reciever,
            amount,
          });
        }

        console.log("✅ Generic webhook processed");
        res.json({ received: true });
      } catch (err) {
        console.error("❌ Error processing generic webhook:", err.message);
        res.status(500).json({ error: err.message });
      }
    } else {
      res.status(400).json({ error: "Invalid webhook payload" });
    }
  });

  return router;
};
