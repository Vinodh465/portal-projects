const fs = require('fs');
const data = fs.readFileSync('scratch/metadata.xml', 'utf8');
const start = data.indexOf('<EntityType Name="Login"');
const end = data.indexOf('</EntityType>', start);
if (start !== -1 && end !== -1) {
    console.log(data.substring(start, end + 13));
} else {
    console.log('Not found');
}
