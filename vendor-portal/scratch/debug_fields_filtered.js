const http = require('http');

const vendorId = '0000100000';
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const query = (path) => new Promise((resolve, reject) => {
  const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/${path}&sap-client=100&$format=json`;
  http.get(url, {
    headers: { 'Authorization': auth, 'Accept': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ path, data }));
  }).on('error', reject);
});

const endpoints = [
  `PoSet?$filter=VendorId eq '${vendorId}'&$top=1`,
  `InvoiceSet?$filter=VendorId eq '${vendorId}'&$top=1`,
  `PaymentAgingSet?$filter=VendorId eq '${vendorId}'&$top=1`
];

Promise.all(endpoints.map(query)).then(results => {
  results.forEach(res => {
    console.log(`\n--- ${res.path} ---`);
    try {
      const json = JSON.parse(res.data);
      if (json.error) { console.log('Error:', json.error.message.value); return; }
      const data = json.d.results[0];
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('No data');
      }
    } catch (e) {
      console.log('Error parsing JSON', res.data.substring(0, 100));
    }
  });
});
