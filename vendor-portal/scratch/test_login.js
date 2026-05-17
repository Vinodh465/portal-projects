const http = require('http');

const vendorId = '100000';
const password = 'Password@123'; // I don't know the real password, but I want to see the response structure
const padded = vendorId.trim().padStart(10, '0');

const url = `http://localhost:4300/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/LOGINSet('${padded}')?Password=${password}&sap-client=100&$format=json`;

console.log('Testing Login URL:', url);

http.get(url, {
  headers: {
    'Authorization': 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64'),
    'Accept': 'application/json'
  }
}, res => {
  console.log('Status Code:', res.statusCode);
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('Response:', data);
    try {
      const json = JSON.parse(data);
      console.log('Parsed JSON:', JSON.stringify(json, null, 2));
    } catch (e) {
      console.log('Failed to parse JSON');
    }
  });
}).on('error', err => {
  console.error('Error:', err.message);
});
