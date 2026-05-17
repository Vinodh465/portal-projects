const http = require('http');

const belnr = '1900000023';
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/InvoicePdfSet(Belnr='${belnr}')/$value?sap-client=100`;

http.get(url, {
  headers: { 'Authorization': auth }
}, res => {
  let size = 0;
  res.on('data', chunk => size += chunk.length);
  res.on('end', () => {
    console.log('Belnr:', belnr, 'Size:', size);
  });
});
