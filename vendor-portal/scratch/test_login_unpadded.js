const http = require('http');

const vendorId = '100000';
const password = 'TEST';

const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/LOGINSet?$filter=Lifnr eq '${vendorId}' and Password eq '${password}'&sap-client=100&$format=json`;

console.log('Testing URL:', url);

const options = {
  headers: {
    'Authorization': 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64'),
    'Accept': 'application/json'
  }
};

http.get(url, options, res => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
