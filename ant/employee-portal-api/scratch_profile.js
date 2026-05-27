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
    console.log("Calling ProfileSet for 12...");
    const profRes = await sapAxios.get("/ProfileSet?$filter=EmpId eq '00000012'&$format=json");
    console.log("ProfileSet Response:", JSON.stringify(profRes.data, null, 2));
  } catch (err) {
    console.error("Error calling ProfileSet:", err.message);
    if (err.response) {
      console.error("Response:", err.response.data);
    }
  }
}

test();
