const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$filter=Status ne 'F'&$format=json";

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    const results = res.data.d.results || [];
    console.log(`Found ${results.length} users with Status != F`);
    results.forEach(r => {
        console.log(`ID: ${r.EmpId}, Status: ${r.Status}`);
    });
}).catch(err => {
    console.error(err.message);
});
