const axios = require('axios');

async function testFilter(status) {
    try {
        console.log(`--- Testing Filter: ${status} ---`);
        const res = await axios.get(`http://localhost:3000/api/notifications?status=${status}`, {
            headers: { 'x-employee-id': '00000006' }
        });
        console.log('Count:', res.data.count);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

async function run() {
    await testFilter('Open');
    await testFilter('Closed');
    await testFilter('OSNO');
    await testFilter('NOCO');
}

run();
