const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const baseUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV';

const url = `${baseUrl}/PlantSet?$top=5&$format=json`;

axios.get(url, {
    headers: { 
        'Authorization': `Basic ${auth}`,
        'X-Requested-With': 'XMLHttpRequest',
        'Accept': 'application/json'
    }
}).then(res => {
    console.log(JSON.stringify(res.data.d.results, null, 2));
}).catch(err => {
    console.log(`Status: ${err.response?.status}`);
    console.log(JSON.stringify(err.response?.data || err.message, null, 2));
});
