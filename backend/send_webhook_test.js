require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

// ✅ 1. Create raw payload as Buffer
const payloadObj = {
  id: "evt_test_webhook",
  object: "event",
  type: "payment_intent.succeeded",
  data: {
    object: {
      id: "pi_test_123",
      settlementId: "settle_001",
      groupId: "group_001",
      payer: "user_123",
      receiver: "user_456",
      amount: 5000
    }
  }
};

const payload = Buffer.from(JSON.stringify(payloadObj));

// ✅ 2. Stripe signature
const secret = process.env.STRIPE_WEBHOOK_SECRET;
const timestamp = Math.floor(Date.now() / 1000);
const sigPayload = `${timestamp}.${payload.toString()}`;
const signature = crypto
  .createHmac("sha256", secret)
  .update(sigPayload, "utf8")
  .digest("hex");
const stripeSignature = `t=${timestamp},v1=${signature}`;

// ✅ 3. Send raw Buffer
axios.post("http://localhost:5500/stripe/webhook", payload, {
  headers: {
    "Content-Type": "application/json",
    "Stripe-Signature": stripeSignature
  },
  transformRequest: [(data) => data] // keep as raw
})
.then(res => {
  console.log("✅ Webhook delivered successfully!");
  console.log("Response:", res.data);
})
.catch(err => {
  console.error("❌ Webhook error:");
  if (err.response) {
    console.error("Status:", err.response.status);
    console.error("Body:", err.response.data);
  } else {
    console.error("Message:", err.message);
  }
});
