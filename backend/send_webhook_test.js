require("dotenv").config();
const axios = require("axios");

// ✅ 1. Create raw payload as Buffer
const payloadObj = {
  id: "evt_test_webhook",
  object: "event",
  type: "payment_succeeded", // generic event type
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

// ✅ 2. Send raw Buffer to your backend webhook route
axios.post("http://localhost:5500/webhook", payload, {
  headers: {
    "Content-Type": "application/json"
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
