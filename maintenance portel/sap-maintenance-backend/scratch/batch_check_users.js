const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = "http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$format=json";

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    // try different IDs sequentially until we find an 'S'
    const ids = ['00000001', '00000002', '00000003', '00000004', '00000005', '00000006'];
    Promise.all(ids.map(id => {
        const u = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$filter=EmpId eq '${id}'&$format=json`;
        return axios.get(u, { headers: { 'Authorization': `Basic ${auth}` } }).then(r => r.data.d.results[0]);
    })).then(results => {
        results.forEach(r => {
            console.log(`ID: ${r.EmpId}, Status: ${r.Status}`);
        });
    });
}).catch(err => {
    console.error(err.message);
});
