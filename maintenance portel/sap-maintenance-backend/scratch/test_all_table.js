const axios = require('axios');
const auth = Buffer.from('K902093:Vinodh@5284456').toString('base64');
const users = [
    { id: '00000001', pass: '1234' },
    { id: '00000002', pass: '5678' },
    { id: '00000003', pass: '9012' },
    { id: '00000004', pass: '3456' },
    { id: '00000005', pass: '7890' },
    { id: '00000006', pass: '12345' },
    { id: '00000007', pass: '67890' },
    { id: '00000008', pass: '123456' },
    { id: '00000009', pass: '789012' }
];

async function testAll() {
    for (const u of users) {
        const url = `http://AZKTLDS5CP.kcloud.com:8000/sap/opu/odata/SAP/ZPM_MAINTENANCE_SRV_093_SRV/LoginSet?$filter=EmpId eq '${u.id}' and Password eq '${u.pass}'&$format=json`;
        try {
            const res = await axios.get(url, { headers: { 'Authorization': `Basic ${auth}` } });
            const result = res.data.d.results[0];
            console.log(`ID: ${u.id}, Pass: ${u.pass}, Status: ${result.Status}`);
        } catch (e) {
            console.log(`ID: ${u.id}, Error: ${e.message}`);
        }
    }
}

testAll();
