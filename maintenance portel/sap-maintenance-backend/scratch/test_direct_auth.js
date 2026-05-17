const axios = require('axios');
const auth = Buffer.from('00000001:12345').toString('base64');
const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$format=json';

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    console.log(JSON.stringify(res.data.d, null, 2));
}).catch(err => {
    console.log(`Status: ${err.response?.status}`);
    console.log(err.message);
});
