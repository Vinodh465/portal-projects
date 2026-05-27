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
  const ids = ["00902014", "00902093", "00902999", "00000001", "12345678"];
  for (const id of ids) {
    try {
      const res = await sapAxios.get(`/ProfileSet('${id}')?$format=json`);
      console.log(`ID: ${id} -> Status: ${res.status}, FullName: "${res.data?.d?.FullName || ''}"`);
    } catch (err) {
      console.log(`ID: ${id} -> Error: ${err.message} (status: ${err.response?.status})`);
    }
  }
}

test();
