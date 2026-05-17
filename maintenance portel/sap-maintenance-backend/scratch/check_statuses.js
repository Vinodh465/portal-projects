const axios = require('axios');

async function checkNotifyStatuses() {
    try {
        const res = await axios.get('http://localhost:3000/api/notifications', {
            headers: { 'x-employee-id': '00000006' }
        });
        const statuses = [...new Set(res.data.data.map(n => n.status))];
        console.log('Notification Statuses:', statuses);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

async function checkWorkOrderStatuses() {
    try {
        const res = await axios.get('http://localhost:3000/api/workorders', {
            headers: { 'x-employee-id': '00000006' }
        });
        const statuses = [...new Set(res.data.data.map(w => w.status))];
        console.log('Work Order Statuses:', statuses);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

async function run() {
    await checkNotifyStatuses();
    await checkWorkOrderStatuses();
}

run();
