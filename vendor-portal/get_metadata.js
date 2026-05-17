const http = require('http');
const fs = require('fs');

http.get('http://localhost:4300/sap/opu/odata/sap/ZMM_VENDOR_SRV_093_SRV/$metadata', {
  headers: { 'Authorization': 'Basic ' + Buffer.from('K902093:Vinodh@5284456').toString('base64') }
}, res => {
  let d = '';
  res.setEncoding('utf8');
  res.on('data', c => d += c);
  res.on('end', () => {
    fs.writeFileSync('metadata.xml', d);
    const xml = fs.readFileSync('metadata.xml', 'utf8');
    const matches = [...xml.matchAll(/<EntityType Name=\"(.*?)\">([\s\S]*?)<\/EntityType>/g)];
    matches.forEach(m => {
      console.log('\nEntity: ' + m[1]);
      const props = [...m[2].matchAll(/<Property Name=\"(.*?)\"/g)];
      console.log(props.map(p => p[1]).join(', '));
    });
  });
}).on('error', console.error);
