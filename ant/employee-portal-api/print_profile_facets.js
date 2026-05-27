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
        if (entityType.$.Name === 'Profile') {
          console.log(`EntityType: Profile`);
          entityType.Property.forEach(prop => {
            console.log(`Property: ${prop.$.Name}`);
            console.log("  Attributes:", JSON.stringify(prop.$, null, 2));
          });
        }
        if (entityType.$.Name === 'Login') {
          console.log(`EntityType: Login`);
          entityType.Property.forEach(prop => {
            console.log(`Property: ${prop.$.Name}`);
            console.log("  Attributes:", JSON.stringify(prop.$, null, 2));
          });
        }
      });
    }
  });
});
