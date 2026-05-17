const axios = require('axios');

async function testFilter(type, status) {
    try {
        console.log(`--- Testing ${type} Filter: ${status} ---`);
        const res = await axios.get(`http://localhost:3000/api/${type}?status=${status}`, {
            headers: { 'x-employee-id': '00000006' }
        });
        console.log('Count:', res.data.count);
        if (res.data.count > 0) {
            console.log('Sample Status:', res.data.data[0].status);
        }
    } catch (err) {
        console.log('Error:', err.message);
    }
}

async function run() {
    await testFilter('notifications', 'Open');
    await testFilter('notifications', 'Closed');
    await testFilter('workorders', 'Open');
    await testFilter('workorders', 'Closed');
}

run();
