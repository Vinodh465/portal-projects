const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$filter=EmpId eq '00000005' and Password eq '7890'&$format=json";

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    console.log(JSON.stringify(res.data.d.results[0], null, 2));
}).catch(err => {
    console.error(err.message);
});
