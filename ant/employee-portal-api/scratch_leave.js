const axios = require('axios');
const config = require('./src/config');

const sapCredentials = Buffer.from(`${config.sapUser}:${config.sapPassword}`).toString('base64');
const sapAxios = axios.create({
  baseURL: `${config.sapBaseUrl}${config.sapServicePath}`,
  timeout: 30000,
  headers: {
    'Authorization': `Basic ${sapCredentials}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

async function test() {
  try {
    console.log("Calling LeaveSet for 12...");
    const leaveRes = await sapAxios.get("/LeaveSet?$filter=EmpId eq '00000001'&$format=json");
    console.log("LeaveSet Response:", JSON.stringify(leaveRes.data, null, 2));
  } catch (err) {
    console.error("Error calling LeaveSet:", err.message);
    if (err.response) {
      console.error("Response:", err.response.data);
    }
  }
}

test();
