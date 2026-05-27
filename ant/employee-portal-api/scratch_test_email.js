const axios = require('axios');

async function test() {
  try {
    console.log("Calling POST /api/payslip/send-email...");
    // Since it's protected by authMiddleware, we need a JWT token or we can call the controller method directly by mocking req/res, OR we can request a login first.
    // Let's perform a login first using backend test credentials or real SAP login.
    // Let's check find_valid_emp or server.js to see if there is login.
    // Wait, let's just make a POST request to login:
    const loginRes = await axios.post("http://localhost:3000/api/login", {
      empId: "14",
      password: "Vinodh@5284456"
    });
    const token = loginRes.data?.data?.token;
    console.log("Login successful! Token:", token);

    const emailRes = await axios.post("http://localhost:3000/api/payslip/send-email", {
      empId: "14",
      email: "peruvayalavinodh465@gmail.com",
      month: "05",
      year: "2026"
    }, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log("Email Response:", JSON.stringify(emailRes.data, null, 2));

  } catch (err) {
    console.error("Error occurred:", err.message);
    if (err.response) {
      console.error("Response:", err.response.data);
    }
  }
}

test();
