const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$filter=Status eq 'X'&$format=json";

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    console.log(`Found ${res.data.d.results.length} users with Status X`);
}).catch(err => {
    console.error(err.message);
});
