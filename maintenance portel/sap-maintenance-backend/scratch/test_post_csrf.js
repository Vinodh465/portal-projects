const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const baseUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV';

async function testPost() {
    try {
        console.log('--- Fetching CSRF Token ---');
        const getRes = await axios.get(baseUrl + '/', {
            headers: {
                'Authorization': `Basic ${auth}`,
                'X-CSRF-Token': 'Fetch',
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
        const token = getRes.headers['x-csrf-token'];
        const cookies = getRes.headers['set-cookie'];
        
        console.log('Token:', token);
        console.log('Cookies:', cookies ? 'Found' : 'Not found');
        
        console.log('\n--- Attempting POST ---');
        const postRes = await axios.post(`${baseUrl}/LoginSet`, {
            EmpId: '00000006',
            Password: '12345'
        }, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'X-CSRF-Token': token,
                'Cookie': cookies ? cookies.join('; ') : '',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        });
        
        console.log('Status:', postRes.status);
        console.log(JSON.stringify(postRes.data, null, 2));
    } catch (err) {
        console.log('Error Status:', err.response?.status);
        console.log(JSON.stringify(err.response?.data || err.message, null, 2));
    }
}

testPost();
