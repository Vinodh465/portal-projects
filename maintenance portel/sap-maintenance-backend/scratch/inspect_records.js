const axios = require('axios');

async function inspectRecords() {
    try {
        console.log('--- NOTIFICATIONS (First 5) ---');
        const resN = await axios.get('http://localhost:3000/api/notifications', {
            headers: { 'x-employee-id': '00000006' }
        });
        console.log(JSON.stringify(resN.data.data.slice(0, 5), null, 2));

        console.log('\n--- WORK ORDERS (First 5 Status Fields) ---');
        const resW = await axios.get('http://localhost:3000/api/workorders', {
            headers: { 'x-employee-id': '00000006' }
        });
        const samples = resW.data.data.slice(0, 5).map(w => ({
            id: w.orderId,
            status: w.status,
            systemStatus: w.systemStatus,
            userStatus: w.userStatus
        }));
        console.log(JSON.stringify(samples, null, 2));
    } catch (err) {
        console.log('Error:', err.message);
    }
}

inspectRecords();
