require('dotenv').config();
const axios = require('axios');

async function parseMetadata() {
    try {
        const auth = Buffer.from(`${process.env.SAP_USERNAME}:${process.env.SAP_PASSWORD}`).toString('base64');
        const res = await axios.get(`${process.env.SAP_BASE_URL}/$metadata`, {
            headers: { 'Authorization': `Basic ${auth}` }
        });
        
        const xml = res.data;
        const entityTypes = xml.match(/<EntityType Name="([^"]+)"[\s\S]+?<\/EntityType>/g);
        
        entityTypes.forEach(et => {
            const name = et.match(/Name="([^"]+)"/)[1];
            console.log(`\n--- Entity: ${name} ---`);
            const props = et.match(/<Property Name="([^"]+)"/g);
            if (props) {
                props.forEach(p => {
                    console.log(`  - ${p.match(/Name="([^"]+)"/)[1]}`);
                });
            }
        });
    } catch (err) {
        console.log('Error:', err.message);
    }
}

parseMetadata();
