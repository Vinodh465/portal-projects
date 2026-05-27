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
    console.log("Calling DashboardSet for 12...");
    try {
      const dbRes = await sapAxios.get("/DashboardSet?$filter=EmpId eq '00000001'&$format=json");
      console.log("DashboardSet Success! Response:", JSON.stringify(dbRes.data?.d?.results?.[0] || dbRes.data, null, 2));
    } catch (e) {
      console.log("DashboardSet failed:", e.message);
    }

    console.log("\nCalling Dashboard1Set for 12...");
    try {
      const dbRes2 = await sapAxios.get("/Dashboard1Set?$filter=EmpId eq '00000001'&$format=json");
      console.log("Dashboard1Set Success! Response:", JSON.stringify(dbRes2.data?.d?.results?.[0] || dbRes2.data, null, 2));
    } catch (e) {
      console.log("Dashboard1Set failed:", e.message);
    }
  } catch (err) {
    console.error("General error:", err.message);
  }
}

test();
