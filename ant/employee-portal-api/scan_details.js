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
  console.log("Scanning employee IDs for non-zero leave balances and payslips...");
  for (let i = 1; i <= 20; i++) {
    const id = String(i).padStart(8, '0');
    try {
      const leaveRes = await sapAxios.get(`/LeaveSet?$filter=EmpId eq '${id}'&$format=json`);
      const leave = leaveRes.data?.d?.results?.[0];
      const payslipRes = await sapAxios.get(`/PaySlipSet?$filter=EmpId eq '${id}'&$format=json`);
      const payslip = payslipRes.data?.d?.results?.[0];
      const dbRes = await sapAxios.get(`/DashboardSet?$filter=EmpId eq '${id}'&$format=json`);
      const db = dbRes.data?.d?.results?.[0];

      if (db && db.FirstName) {
        console.log(`\nEmployee: ${id} (${db.FullName})`);
        if (leave) {
          console.log(`  Leave Balances: CL=${leave.BalanceCl}, SL=${leave.BalanceSl}, PL=${leave.BalancePl}, Remarks="${leave.Remarks || ''}"`);
        }
        if (payslip) {
          console.log(`  Payslip: BasicPay=${payslip.BasicPay}, NetPay=${payslip.NetPay}, Month/Year=${payslip.PayMonth}/${payslip.PayYear}`);
        }
      }
    } catch (err) {
      // Ignore
    }
  }
}

test();
