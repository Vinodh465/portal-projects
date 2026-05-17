const http = require('http');

const docs = ['5100000000', '5100000001', '5100000005', '1900000024', '1900000040'];
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const query = (belnr) => new Promise((resolve, reject) => {
  const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/InvoicePdfSet(Belnr='${belnr}')/$value?sap-client=100`;
  http.get(url, {
    headers: { 'Authorization': auth }
  }, res => {
    let size = 0;
    res.on('data', chunk => size += chunk.length);
    res.on('end', () => resolve({ belnr, size }));
  }).on('error', reject);
});

Promise.all(docs.map(query)).then(results => {
  console.log(results);
});
