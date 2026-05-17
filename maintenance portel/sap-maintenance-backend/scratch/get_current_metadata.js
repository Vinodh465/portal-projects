require('dotenv').config();
const axios = require('axios');

async function getMetadata() {
    try {
        const auth = Buffer.from(`${process.env.SAP_USERNAME}:${process.env.SAP_PASSWORD}`).toString('base64');
        const res = await axios.get(`${process.env.SAP_BASE_URL}/$metadata`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        console.log(res.data);
    } catch (err) {
        console.log('Error:', err.response?.status, err.response?.data || err.message);
    }
}

getMetadata();
