const axios = require('axios');

async function testBackendLogin(empId, password) {
    try {
        console.log(`--- Testing Backend Login for ${empId} ---`);
        const res = await axios.post('http://localhost:3000/api/auth/login', {
            empId,
            password
        });
        console.log('Status:', res.status);
        console.log('Data:', JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log('Error Data:', JSON.stringify(err.response?.data, null, 2));
    }
}

async function runTests() {
    // 1. Test with valid credentials
    await testBackendLogin('00000006', '12345');
    
    console.log('\n');
    
    // 2. Test with invalid password
    await testBackendLogin('00000006', 'wrong_pass');
    
    console.log('\n');
    
    // 3. Test with non-existent user
    await testBackendLogin('99999999', '12345');
}

runTests();
