const http = require('http');

const belnr = '5100000001';
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const query = (path) => new Promise((resolve, reject) => {
  const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/${path}?sap-client=100`;
  http.get(url, {
    headers: { 'Authorization': auth }
  }, res => {
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => resolve({ path, size }));
  }).on('error', reject);
});

Promise.all([
  query(`InvoicePdfSet(Belnr='${belnr}')/$value`),
  query(`InvoicePdfSet('${belnr}')/$value`)
]).then(results => {
  console.log(results);
});
