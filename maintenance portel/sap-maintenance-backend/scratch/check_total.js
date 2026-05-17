const axios = require('axios');

async function checkTotalCount() {
    try {
        const res = await axios.get('http://localhost:3000/api/notifications', {
            headers: { 'x-employee-id': '00000001' }
        });
        console.log('Total Notifications:', res.data.count);
    } catch (err) {
        console.log('Error:', err.message);
    }
}

checkTotalCount();
