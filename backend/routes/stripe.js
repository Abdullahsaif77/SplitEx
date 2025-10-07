const express = require("express");
const bodyParser = require("body-parser");
const Stripe = require("stripe");
const Settlement = require("../models/settle");
const Balance = require("../models/balance");

module.exports = (io) => {
  const router = express.Router();
  const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

  
  router.post("/create-checkout-session", async (req, res) => {
    try {
      const { payer, reciever, amount, groupId } = req.body;

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "pkr",
              product_data: {
                name: `Settlement Payment from ${payer.name} to ${reciever.name}`,
              },
              unit_amount: Math.round(amount * 100), 
            },
            quantity: 1,
          },
        ],
        mode: "payment",
        success_url: "http://localhost:5173/success", 
        cancel_url: "http://localhost:5173/cancel",
        metadata: {
          payer: JSON.stringify(payer),
          reciever: JSON.stringify(reciever),
          amount: amount.toString(),
          groupId,
        },
      });

      res.json({ url: session.url });
    } catch (error) {
      console.error("❌ Error creating checkout session:", error.message);
      res.status(500).json({ error: error.message });
    }
  });


  router.post(
    "/webhook",
    bodyParser.raw({ type: "application/json" }),
    async (req, res) => {
      const sig = req.headers["stripe-signature"];
      let event;

      try {
        event = stripe.webhooks.constructEvent(
          req.body,
          sig,
          process.env.STRIPE_WEBHOOK_SECRET
        );
      } catch (err) {
        console.error("❌ Webhook signature verification failed:", err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
      }

      const session = event.data.object;

      switch (event.type) {
        case "checkout.session.completed":
          try {
            const payer = JSON.parse(session.metadata.payer);
            const reciever = JSON.parse(session.metadata.reciever);
            const amount = parseFloat(session.metadata.amount);
            const groupId = session.metadata.groupId;

            
            const settlement = await Settlement.create({
              payer,
              reciever,
              amount,
              groupId,
              status: "paid",
              stripeSessionId: session.id,
            });

            
           const balance =  await Balance.updateOne(
              { groupId, userId: reciever.id },
              { $inc: { balance: amount } },
              { upsert: true }
            );
            console.log(balance)

            
            if (io) {
              io.in(groupId).emit("settlementCompleted", {
                settlementId: settlement._id,
                payer,
                reciever,
                amount,
              });
            }

            console.log("✅ Settlement saved & socket emitted");
          } catch (err) {
            console.error("⚠️ Error handling checkout.session.completed:", err);
          }
          break;

        default:
          console.log(`ℹ️ Unhandled event type ${event.type}`);
      }

      res.json({ received: true });
    }
  );

  return router;
};
