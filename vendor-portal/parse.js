const fs = require('fs');
const xml = fs.readFileSync('metadata.xml', 'utf16le');
const matches = [...xml.matchAll(/<EntityType Name=\"(.*?)\">([\s\S]*?)<\/EntityType>/g)];
matches.forEach(m => {
  console.log('\nEntity: ' + m[1]);
  const props = [...m[2].matchAll(/<Property Name=\"(.*?)\"/g)];
  console.log(props.map(p => p[1]).join(', '));
});
