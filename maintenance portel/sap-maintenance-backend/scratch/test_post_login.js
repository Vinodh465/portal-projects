const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet';

axios.post(url, {
    EmpId: '00000001',
    Password: '12345'
}, {
    headers: { 
        'Authorization': `Basic ${auth}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
}).then(res => {
    console.log(JSON.stringify(res.data, null, 2));
}).catch(err => {
    console.log(`Status: ${err.response?.status}`);
    console.log(JSON.stringify(err.response?.data, null, 2));
});
