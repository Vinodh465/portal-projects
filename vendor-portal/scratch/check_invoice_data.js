const http = require('http');

const vendorId = '0000100000';
const rawVid = '100000';
const auth = 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64');

const query = (path) => new Promise((resolve, reject) => {
  const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/${path}${path.includes('?') ? '&' : '?'}sap-client=100&$format=json`;
  console.log(`Querying: ${url}`);
  http.get(url, {
    headers: { 'Authorization': auth, 'Accept': 'application/json' }
  }, res => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => resolve({ path, data, statusCode: res.statusCode }));
  }).on('error', reject);
});

async function run() {
  console.log('--- Testing InvoiceSet with Filter ---');
  const res1 = await query(`InvoiceSet?$filter=VendorId eq '${rawVid}'`);
  console.log(`Status: ${res1.statusCode}`);
  try {
    const json = JSON.parse(res1.data);
    console.log(`Results: ${json.d.results.length}`);
    if (json.d.results.length > 0) {
      console.log('First Invoice Sample:', JSON.stringify(json.d.results[0], null, 2));
    }
  } catch (e) {
    console.log('Error parsing JSON or no results');
  }

  console.log('\n--- Testing GrSet ---');
  const res2 = await query(`GrSet?$filter=VendorId eq '${rawVid}'`);
  console.log(`Status: ${res2.statusCode}`);
  try {
    const json = JSON.parse(res2.data);
    console.log(`Results: ${json.d.results.length}`);
    if (json.d.results.length > 0) {
      console.log('First GR Sample:', JSON.stringify(json.d.results[0], null, 2));
    }
  } catch (e) {
    console.log('Error parsing JSON or no results');
  }
}

run();
