const axios = require('axios');

async function findDifferentStatus() {
    try {
        const res = await axios.get('http://localhost:3000/api/notifications', {
            headers: { 'x-employee-id': '00000006' }
        });
        const non00 = res.data.data.filter(n => n.status !== '00');
        console.log(`Found ${non00.length} records with non-00 status.`);
        if (non00.length > 0) {
            console.log('Sample:', non00[0]);
        }
    } catch (err) {
        console.log('Error:', err.message);
    }
}

findDifferentStatus();
