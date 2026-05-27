const https = require('http');

const url = 'http://AZKTLDS5CP.kcloud.com:8000/sap/bc/srt/scs/sap/zsd_delivery_srv_2193?sap-client=100';
const user = 'K902093';
const pass = 'Vinodh@5284456';
const auth = 'Basic ' + Buffer.from(user + ':' + pass).toString('base64');

const body = `<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:urn="urn:sap-com:document:sap:rfc:functions">
<soapenv:Header/>
<soapenv:Body>
<urn:ZFM_SD_DELIVERY_FINAL_093>
<P_CUST_ID>0000000010</P_CUST_ID>
<IT_DELIVERY>
  <item></item>
</IT_DELIVERY>
</urn:ZFM_SD_DELIVERY_FINAL_093>
</soapenv:Body>
</soapenv:Envelope>`;

const req = https.request(url, {
  method: 'POST',
  headers: {
    'Authorization': auth,
    'Content-Type': 'text/xml;charset=UTF-8',
    'Content-Length': Buffer.byteLength(body)
  }
}, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    console.log('STATUS:', res.statusCode);
    console.log('RESPONSE:', data.substring(0, 2000));
  });
});

req.on('error', console.error);
req.write(body);
req.end();
