const axios = require('axios');

async function testSettlement() {
  try {
    const response = await axios.post(
      "http://localhost:5000/api/groups/68b42dd97a4b859a668d86fe/settle/test", // change port & groupId
      {
        payer: "68b0418fe0d4568659dd1646",     // replace with your payer userId
        receiver: "68b42ce01015d073e7159bb5",  // replace with your receiver userId
        amount: 200
      },
      {
        headers: {
          "Content-Type": "application/json",
          // mock user auth if needed
          Authorization: "Bearer testtoken"
        }
      }
    );

    console.log("✅ Settlement Response:", response.data);
  } catch (err) {
    console.error("❌ Settlement Failed:", err.response?.data || err.message);
  }
}

testSettlement();
