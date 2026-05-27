const axios = require('axios');
const config = require('./src/config');

const sapCredentials = Buffer.from(`${config.sapUser}:${config.sapPassword}`).toString('base64');
const sapAxios = axios.create({
  baseURL: `${config.sapBaseUrl}${config.sapServicePath}`,
  timeout: 30000,
  headers: {
    'Authorization': `Basic ${sapCredentials}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

async function test() {
  const empId = "00902014";
  const password = "Vinodh@5284456";

  try {
    console.log(`Checking CSRF token...`);
    const tokenRes = await sapAxios.get('/', {
      headers: { 'X-CSRF-Token': 'Fetch' }
    });
    const csrfToken = tokenRes.headers['x-csrf-token'];
    const cookies = tokenRes.headers['set-cookie'];
    console.log("CSRF Token:", csrfToken);

    const headers = {
      'X-CSRF-Token': csrfToken,
    };
    if (cookies) {
      headers['Cookie'] = cookies.join('; ');
    }

    console.log(`\n1. Posting to LoginSet...`);
    try {
      const loginPayload = {
        EmpId: empId,
        Password: password,
        Status: "",
        Message: ""
      };
      const res = await sapAxios.post('/LoginSet', loginPayload, { headers });
      console.log("LoginSet POST success:", JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("LoginSet POST error:", err.message, err.response?.data);
    }

    console.log(`\n2. Posting to ProfileSet...`);
    try {
      const profilePayload = {
        EmpId: empId,
        FirstName: "Vinodh",
        MiddleName: "",
        LastName: "Kumar",
        FullName: "Vinodh Kumar",
        Dob: "/Date(631152000000)/", // 1990-01-01
        Gender: "M",
        MaritalStatus: "S",
        Nationality: "Indian",
        BloodGroup: "O+",
        EmailId: "vinodh.kumar@company.com",
        MobileNo: "9876543210",
        Address: "123 SAP Street",
        City: "Bangalore",
        State: "Karnataka",
        Pincode: "560001",
        Country: "IN",
        Language: "EN"
      };
      const res = await sapAxios.post('/ProfileSet', profilePayload, { headers });
      console.log("ProfileSet POST success:", JSON.stringify(res.data, null, 2));
    } catch (err) {
      console.error("ProfileSet POST error:", err.message, err.response?.data);
    }

  } catch (err) {
    console.error("Overall error:", err.message);
  }
}

test();
