const fs = require('fs');
const xml = fs.readFileSync('metadata_fresh.xml', 'utf8');

const getEntity = (name) => {
  const regex = new RegExp(`<EntityType Name="${name}"[\\s\\S]*?>([\\s\\S]*?)<\\/EntityType>`, 'i');
  const match = regex.exec(xml);
  if (match) {
    const props = [...match[1].matchAll(/<Property Name="(.*?)"/g)].map(m => m[1]);
    console.log(`\nEntity: ${name}\nProperties: ${props.join(', ')}`);
  } else {
    console.log(`\nEntity: ${name} not found`);
  }
};

['LOGIN', 'PROFILE', 'RFQ', 'PO', 'GR', 'INVOICE', 'PAYMENTAGING', 'CREDIT'].forEach(getEntity);
