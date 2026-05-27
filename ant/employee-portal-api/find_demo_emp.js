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
  // Let's generate a list of candidate employee IDs
  const candidates = [];
  // Standard demo IDs
  for (let i = 1; i <= 20; i++) {
    candidates.push(String(i).padStart(8, '0'));
  }
  for (let i = 1000; i <= 1020; i++) {
    candidates.push(String(i).padStart(8, '0'));
  }
  // Try around student batch ID (902014, 902093, etc.)
  for (let i = 902000; i <= 902050; i++) {
    candidates.push(String(i).padStart(8, '0'));
  }
  // Try without leading zeros
  candidates.push("1", "2", "1000", "902014", "902093");

  console.log(`Scanning ${candidates.length} candidate employee IDs...`);
  for (const id of candidates) {
    try {
      const res = await sapAxios.get(`/ProfileSet?$filter=EmpId eq '${id}'&$format=json`);
      const profile = res.data?.d?.results?.[0];
      if (profile && profile.FirstName) {
        console.log(`🎉 Found employee with profile! ID: ${id} -> Name: ${profile.FullName || profile.FirstName}`);
      }
    } catch (err) {
      // Ignore
    }
  }
  console.log("Scan finished.");
}

test();
