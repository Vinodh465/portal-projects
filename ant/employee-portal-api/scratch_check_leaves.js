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
  const ids = ["00000004", "00000005", "00000006", "00000007", "00000012", "00000014", "00000018"];
  for (const id of ids) {
    try {
      const res = await sapAxios.get(`/LeaveSet?$filter=EmpId eq '${id}'&$format=json`);
      const results = res.data?.d?.results || [];
      console.log(`\n--- ID: ${id} (Found ${results.length} records) ---`);
      if (results.length > 0) {
        console.log("First record:", {
          EmpId: results[0].EmpId,
          EmpName: results[0].EmpName,
          LeaveType: results[0].LeaveType,
          LeaveDesc: results[0].LeaveDesc,
          TotalDays: results[0].TotalDays,
          BalanceCl: results[0].BalanceCl,
          BalanceSl: results[0].BalanceSl,
          BalancePl: results[0].BalancePl,
          Remarks: results[0].Remarks
        });
      }
    } catch (err) {
      console.error(`Error for ${id}:`, err.message);
    }
  }
}

test();
