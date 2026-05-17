const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const baseUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV';

const url = `${baseUrl}/$metadata`;

axios.get(url, {
    headers: { 
        'Authorization': `Basic ${auth}`,
        'X-Requested-With': 'XMLHttpRequest'
    }
}).then(res => {
    console.log(res.data);
}).catch(err => {
    console.log(`Status: ${err.response?.status}`);
    console.log(JSON.stringify(err.response?.data || err.message, null, 2));
});
