const axios = require('axios');
const config = require('./src/config');
const fs = require('fs');

const sapCredentials = Buffer.from(`${config.sapUser}:${config.sapPassword}`).toString('base64');
const sapAxios = axios.create({
  baseURL: `${config.sapBaseUrl}${config.sapServicePath}`,
  timeout: 30000,
  headers: {
    'Authorization': `Basic ${sapCredentials}`,
  },
});

async function test() {
  try {
    console.log("Fetching $metadata...");
    const res = await sapAxios.get('/$metadata');
    fs.writeFileSync('metadata.xml', res.data);
    console.log("Metadata fetched and saved to metadata.xml");
  } catch (err) {
    console.error("Error occurred:", err.message);
  }
}

test();
