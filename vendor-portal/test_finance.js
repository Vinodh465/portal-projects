const http = require('http');

const query = (path) => new Promise((resolve, reject) => {
  const url = 'http://localhost:4300/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/' + path;
  http.get(url, {
    headers: {
      'Authorization': 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64'),
      'Accept': 'application/json'
    }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ path, data }));
  }).on('error', reject);
});

const endpoints = [
  'InvoiceSet?$format=json&$filter=VendorId%20eq%20%27100000%27',
  'PaymentAgingSet?$format=json&$filter=VendorId%20eq%20%27100000%27',
  'CreditSet?$format=json&$filter=VendorId%20eq%20%27100000%27'
];

Promise.all(endpoints.map(query))
  .then(results => {
    results.forEach(res => {
      console.log('--- ' + res.path.split('?')[0] + ' ---');
      try {
        const json = JSON.parse(res.data);
        if (json.error) {
          console.log('Error:', json.error.message.value);
          return;
        }
        const data = json.d.results ? json.d.results[0] : json.d;
        if (data) {
          console.log(Object.keys(data).filter(k => k !== '__metadata').join(', '));
        } else {
          console.log('Empty Array');
        }
      } catch (err) {
        console.log('JSON Parse Error', res.data.substring(0, 100));
      }
    });
  })
  .catch(console.error);
