const sapService = require('./src/services/sapService');

async function run() {
  const empId = '00000025';
  console.log(`Diagnosing Login for ${empId}`);
  try {
    const res = await sapService.validateLogin(empId, '123456'); // assuming some password
    console.log(JSON.stringify(res.data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

run();
