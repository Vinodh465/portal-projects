const fs = require('fs');
const xml = fs.readFileSync('metadata_fresh.xml', 'utf8');

const getKey = (name) => {
  const start = xml.indexOf(`<EntityType Name="${name}"`);
  if (start === -1) return;
  const keyStart = xml.indexOf('<Key>', start);
  const keyEnd = xml.indexOf('</Key>', keyStart);
  const keyXml = xml.substring(keyStart, keyEnd);
  const keys = [...keyXml.matchAll(/<PropertyRef Name="(.*?)"/g)].map(m => m[1]);
  console.log(`\nEntity: ${name}\nKey: ${keys.join(', ')}`);
};

['PAYMENTAGING', 'INVOICE'].forEach(getKey);
