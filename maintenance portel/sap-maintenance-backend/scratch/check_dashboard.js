const axios = require('axios');

async function checkDashboard() {
    try {
        const res = await axios.get('http://localhost:3000/api/dashboard', {
            headers: { 'x-employee-id': '00000006' }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (err) {
        console.log('Error:', err.message);
    }
}

checkDashboard();
