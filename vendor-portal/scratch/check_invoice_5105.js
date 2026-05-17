const http = require('http');

const inv = '5105600765';
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

query(`InvoiceSet?$filter=InvDoc eq '${inv}'`).then(res => {
  console.log(`\n--- ${res.path} ---`);
  try {
    const json = JSON.parse(res.data);
    console.log(JSON.stringify(json.d.results, null, 2));
  } catch (e) {
    console.log('Error');
  }
});
