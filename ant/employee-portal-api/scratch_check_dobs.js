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
  const ids = ["12", "13", "14", "15", "93"];
  for (const id of ids) {
    try {
      const paddedId = id.padStart(8, '0');
      const dbRes = await sapAxios.get(`/Dashboard1Set?$filter=EmpId eq '${paddedId}'&$format=json`);
      const result = dbRes.data?.d?.results?.[0];
      if (result) {
        console.log(`ID: ${id} -> Dob: "${result.Dob}", JoinDate: "${result.JoinDate}"`);
      } else {
        console.log(`ID: ${id} -> No result`);
      }
    } catch (e) {
      console.log(`ID: ${id} -> Failed: ${e.message}`);
    }
  }
}

test();
