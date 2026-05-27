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
    console.log("Calling login...");
    const loginRes = await sapAxios.get('/LoginSet?$format=json');
    console.log("Login Status:", loginRes.status);
    console.log("Login Data results length:", loginRes.d?.results?.length || loginRes.data?.d?.results?.length);
    if (loginRes.data?.d?.results) {
      console.log("First Login result:", JSON.stringify(loginRes.data.d.results[0], null, 2));
    }

    console.log("\nCalling dashboard...");
    const dbRes = await sapAxios.get('/DashboardSet?$format=json');
    console.log("Dashboard Status:", dbRes.status);
    console.log("Dashboard Data results length:", dbRes.data?.d?.results?.length);
    if (dbRes.data?.d?.results) {
      console.log("First Dashboard result:", JSON.stringify(dbRes.data.d.results[0], null, 2));
      console.log("All Dashboard results:", JSON.stringify(dbRes.data.d.results, null, 2));
    }

    console.log("\nCalling profile...");
    const profRes = await sapAxios.get('/ProfileSet?$format=json');
    console.log("Profile Status:", profRes.status);
    console.log("Profile Data results length:", profRes.data?.d?.results?.length);
    if (profRes.data?.d?.results) {
      console.log("First Profile result:", JSON.stringify(profRes.data.d.results[0], null, 2));
    }
  } catch (err) {
    console.error("Error occurred:", err.message);
    if (err.response) {
      console.error("Response data:", err.response.data);
    }
  }
}

test();
