const http = require('http');
const fs = require('fs');

const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');
const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/$metadata?sap-client=100';

http.get(url, {
  headers: { 'Authorization': auth }
}, res => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    fs.writeFileSync('metadata_fresh.xml', data);
    console.log('Metadata saved to metadata_fresh.xml');
  });
}).on('error', console.error);
