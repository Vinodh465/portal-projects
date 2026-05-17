const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const baseUrl = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV';

axios.get(`${baseUrl}/$metadata`, {
    headers: { 'Authorization': `Basic ${auth}`, 'X-Requested-With': 'XMLHttpRequest' }
}).then(res => {
    const xml = res.data;
    const loginTypeMatch = xml.match(/<EntityType Name="Login"[\s\S]*?<\/EntityType>/);
    if (loginTypeMatch) {
        console.log(loginTypeMatch[0]);
    } else {
        console.log('Login EntityType not found');
    }
});
