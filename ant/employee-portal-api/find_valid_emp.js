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
  const password = "Vinodh@5284456";
  // We'll search around 00902000 to 00902100
  console.log("Searching for a valid employee ID...");
  for (let i = 0; i <= 200; i++) {
    const paddedId = String(902000 + i).padStart(8, '0');
    try {
      const res = await sapAxios.get(`/LoginSet?$filter=EmpId eq '${paddedId}' and Password eq '${password}'&$format=json`);
      const result = res.data?.d?.results?.[0];
      if (result) {
        if (result.Status !== 'E') {
          console.log(`🎉 Found valid ID! ${paddedId} -> Status: ${result.Status}, Message: ${result.Message}`);
        } else if (result.Message !== 'Invalid Employee ID') {
          console.log(`❓ Potential ID match: ${paddedId} -> Status: ${result.Status}, Message: ${result.Message}`);
        }
      }
    } catch (err) {
      // Ignore errors for individual requests
    }
  }
  console.log("Search finished.");
}

test();
