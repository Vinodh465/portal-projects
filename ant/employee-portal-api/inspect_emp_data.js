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
  for (const id of ids) {
    try {
      console.log(`\n--- ID: ${id} ---`);
      
      const loginRes = await sapAxios.get(`/LoginSet?$filter=EmpId eq '${id}'&$format=json`);
      console.log("Login Status:", loginRes.data?.d?.results?.[0]?.Status, "Msg:", loginRes.data?.d?.results?.[0]?.Message);

      const dbRes = await sapAxios.get(`/DashboardSet?$filter=EmpId eq '${id}'&$format=json`);
      console.log("Dashboard:", JSON.stringify(dbRes.data?.d?.results?.[0], null, 2));

      const profRes = await sapAxios.get(`/ProfileSet?$filter=EmpId eq '${id}'&$format=json`);
      console.log("Profile FullName:", profRes.data?.d?.results?.[0]?.FullName);

      const leaveRes = await sapAxios.get(`/LeaveSet?$filter=EmpId eq '${id}'&$format=json`);
      console.log("Leave balance (CL/SL/PL):", leaveRes.data?.d?.results?.[0]?.BalanceCl, leaveRes.data?.d?.results?.[0]?.BalanceSl, leaveRes.data?.d?.results?.[0]?.BalancePl);

      const payslipRes = await sapAxios.get(`/PaySlipSet?$filter=EmpId eq '${id}'&$format=json`);
      console.log("Payslip NetPay:", payslipRes.data?.d?.results?.[0]?.NetPay);

    } catch (err) {
      console.error("Error for ID", id, err.message);
    }
  }
}

test();
