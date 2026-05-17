const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/$metadata';
const fs = require('fs');

axios.get(url, {
    headers: { 'Authorization': `Basic ${auth}` }
}).then(res => {
    fs.writeFileSync('scratch/metadata.xml', res.data);
    console.log('Metadata saved');
}).catch(err => {
    console.error(err.message);
});
