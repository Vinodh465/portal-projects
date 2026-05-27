const fs = require('fs');
const xml2js = require('xml2js');

const xml = fs.readFileSync('metadata.xml', 'utf-8');

xml2js.parseString(xml, (err, result) => {
  if (err) {
    console.error("Error parsing XML:", err);
    return;
  }
  const schemas = result['edmx:Edmx']['edmx:DataServices'][0]['Schema'];
  schemas.forEach(schema => {
    if (schema.EntityType) {
      schema.EntityType.forEach(entityType => {
        if (entityType.$.Name === 'PaySlip') {
          console.log(`EntityType: PaySlip`);
          entityType.Property.forEach(prop => {
            console.log(`Property: ${prop.$.Name} (${prop.$.Type})`);
          });
        }
      });
    }
  });
});
