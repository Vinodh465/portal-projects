const sapService = require('./src/services/sapService');

async function run() {
  const empId = '00000018';
  console.log(`Querying profile for ${empId}`);
  try {
    const res = await sapService.getProfile(empId);
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
