const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const baseUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV';
const empId = '00000001';
const password = '12345';

const url = `${baseUrl}/LoginSet(EmpId='${empId}',Password='${password}')?$format=json`;

console.log(`URL: ${url}`);

axios.get(url, {
    headers: { 
        'Authorization': `Basic ${auth}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
}).then(res => {
    console.log('Status:', res.status);
    console.log(JSON.stringify(res.data, null, 2));
}).catch(err => {
    console.log(`Status: ${err.response?.status}`);
    console.log(JSON.stringify(err.response?.data || err.message, null, 2));
});
