const fs = require('fs');
const xml = fs.readFileSync('metadata_fresh.xml', 'utf8');

const getKey = (name) => {
  const regex = new RegExp(`<EntityType Name="${name}"[\\s\\S]*?><Key>([\\s\\S]*?)<\\/Key>`, 'i');
  const match = regex.exec(xml);
  if (match) {
    const keys = [...match[1].matchAll(/<PropertyRef Name="(.*?)"/g)].map(m => m[1]);
    console.log(`\nEntity: ${name}\nKey: ${keys.join(', ')}`);
  }
};

['PAYMENTAGING', 'INVOICE'].forEach(getKey);
