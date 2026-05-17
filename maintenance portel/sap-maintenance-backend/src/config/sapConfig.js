/**
 * SAP Configuration - Axios Instance with Basic Auth
 */
const axios = require('axios');

const SAP_BASE_URL = process.env.SAP_BASE_URL;
const SAP_USERNAME = process.env.SAP_USERNAME;
const SAP_PASSWORD = process.env.SAP_PASSWORD;

if (!SAP_BASE_URL || !SAP_USERNAME || !SAP_PASSWORD) {
  console.error('❌ Missing SAP configuration in .env file!');
  process.exit(1);
}

// Create reusable axios instance with SAP Basic Auth
const sapAxios = axios.create({
  baseURL: SAP_BASE_URL,
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Authorization': `Basic ${Buffer.from(`${SAP_USERNAME}:${SAP_PASSWORD}`).toString('base64')}`,
  },
});

// Request interceptor - log outgoing SAP calls
sapAxios.interceptors.request.use(
  (config) => {
    console.log(`  → SAP Request: ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - log and normalize
sapAxios.interceptors.response.use(
  (response) => {
    console.log(`  ← SAP Response: ${response.status} (${response.config.url})`);
    return response;
  },
  (error) => {
    const status = error.response?.status;
    const msg = error.response?.data || error.message;
    console.error(`  ✗ SAP Error ${status}: ${JSON.stringify(msg)}`);
    return Promise.reject(error);
  }
);

module.exports = sapAxios;
