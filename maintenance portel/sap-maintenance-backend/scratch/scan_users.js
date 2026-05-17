const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$top=50&$format=json";

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    const results = res.data.d.results;
    const stats = results.map(r => ({ id: r.EmpId, status: r.Status }));
    console.log(JSON.stringify(stats, null, 2));
}).catch(err => {
    console.error(err.message);
});
