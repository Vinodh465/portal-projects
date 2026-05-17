const axios = require('axios');
const auth = Buffer.from('SUSER_093:India@123').toString('base64');
const url = 'http://103.111.45.210:8001/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/PlantSet?$top=1&$format=json';

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    console.log(JSON.stringify(res.data, null, 2));
}).catch(err => {
    console.error(err.message);
});
