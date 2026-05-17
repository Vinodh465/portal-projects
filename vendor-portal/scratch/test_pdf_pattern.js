const http = require('http');

const belnr = '5100000001';
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const query = (path) => new Promise((resolve, reject) => {
  const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/${path}?sap-client=100&$format=json`;
  http.get(url, {
    headers: { 'Authorization': auth, 'Accept': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ path, data, headers: res.headers }));
  }).on('error', reject);
});

query(`InvoicePdfSet('${belnr}')/$value`).then(res => {
  console.log(`\n--- ${res.path} ---`);
  console.log('Content-Length:', res.headers['content-length']);
  console.log('Content-Type:', res.headers['content-type']);
  // We can't see the binary data easily, but we can check the size.
});
