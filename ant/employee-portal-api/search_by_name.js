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
    console.log("Searching Profiles with non-empty FirstName...");
    // Try filtering by FirstName not equal to empty string
    // Note: OData standard supports 'ne' operator.
    const res = await sapAxios.get("/ProfileSet?$filter=FirstName ne ''&$format=json");
    const results = res.data?.d?.results || [];
    console.log(`Found ${results.length} profiles.`);
    results.forEach(p => {
      console.log(`Profile: EmpId=${p.EmpId}, FirstName=${p.FirstName}, LastName=${p.LastName}, FullName=${p.FullName}`);
    });

    console.log("\nSearching Dashboards with non-empty FirstName...");
    const dbRes = await sapAxios.get("/DashboardSet?$filter=FirstName ne ''&$format=json");
    const dbResults = dbRes.data?.d?.results || [];
    console.log(`Found ${dbResults.length} dashboards.`);
    dbResults.forEach(d => {
      console.log(`Dashboard: EmpId=${d.EmpId}, FirstName=${d.FirstName}, LastName=${d.LastName}, FullName=${d.FullName}`);
    });

    console.log("\nSearching Leaves with non-empty EmpName...");
    const leaveRes = await sapAxios.get("/LeaveSet?$filter=EmpName ne ''&$format=json");
    const leaveResults = leaveRes.data?.d?.results || [];
    console.log(`Found ${leaveResults.length} leaves.`);
    leaveResults.forEach(l => {
      console.log(`Leave: EmpId=${l.EmpId}, EmpName=${l.EmpName}, BalanceCl=${l.BalanceCl}`);
    });
  } catch (err) {
    console.error("Error occurred:", err.message);
    if (err.response) {
      console.error("Response status:", err.response.status);
      console.error("Response data:", JSON.stringify(err.response.data, null, 2));
    }
  }
}

test();
