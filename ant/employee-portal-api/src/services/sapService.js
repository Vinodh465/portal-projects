'use strict';

const axios = require('axios');
const config = require('../config');

// ─── Axios SAP Instance ───────────────────────────────────────────────────────
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

// ─── Retry Helper ─────────────────────────────────────────────────────────────
const withRetry = async (fn, retries = 2, delayMs = 1000) => {
  for (let attempt = 1; attempt <= retries + 1; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isNetworkError = !err.response && (
        err.code === 'ECONNRESET' || err.code === 'ETIMEDOUT' || err.code === 'ECONNREFUSED'
      );
      if (isNetworkError && attempt <= retries) {
        console.warn(`⚠️  SAP request failed (attempt ${attempt}), retrying in ${delayMs}ms...`);
        await new Promise((r) => setTimeout(r, delayMs));
      } else {
        throw err;
      }
    }
  }
};

// ─── ID Mapping Helper ────────────────────────────────────────────────────────
const mapEmpId = (empId) => {
  if (!empId) return empId;
  const str = String(empId).trim();
  
  // E.g., K902014 -> 00000014
  const kMatch = str.match(/^K902(\d{3})$/i);
  if (kMatch) {
    return `00000${kMatch[1]}`;
  }
  
  // E.g., 00902014 -> 00000014
  const numMatch = str.match(/^00902(\d{3})$/);
  if (numMatch) {
    return `00000${numMatch[1]}`;
  }

  // E.g., 902014 -> 00000014
  const numMatchShort = str.match(/^902(\d{3})$/);
  if (numMatchShort) {
    return `00000${numMatchShort[1]}`;
  }
  
  // E.g., 14 -> 00000014
  if (/^\d{1,3}$/.test(str)) {
    return str.padStart(8, '0');
  }

  return str;
};

// ─── SAP Service Functions ────────────────────────────────────────────────────

/**
 * Validate employee login against SAP LoginSet
 */
const validateLogin = async (empId, password) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/LoginSet?$filter=EmpId eq '${mappedId}' and Password eq '${password}'&$format=json`)
  );
};

/**
 * Get dashboard data for an employee
 */
const getDashboard = async (empId) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/Dashboard1Set?$filter=EmpId eq '${mappedId}'&$format=json`)
  );
};

/**
 * Get profile data for an employee
 */
const getProfile = async (empId) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/ProfileSet?$filter=EmpId eq '${mappedId}'&$format=json`)
  );
};

/**
 * Get leave records for an employee
 */
const getLeave = async (empId) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/LeaveSet?$filter=EmpId eq '${mappedId}'&$format=json`)
  );
};

/**
 * Get payslip data for an employee
 */
const getPayslip = async (empId) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/PaySlipSet?$filter=EmpId eq '${mappedId}'&$format=json`)
  );
};

/**
 * Get payslip PDF as arraybuffer
 */
const getPayslipPdf = async (empId) => {
  const mappedId = mapEmpId(empId);
  return withRetry(() =>
    sapAxios.get(`/PaySlipPdfSet(pernr_d='${mappedId}')/$value`, {
      responseType: 'arraybuffer',
      headers: {
        'Authorization': `Basic ${sapCredentials}`,
        'Accept': 'application/pdf, */*',
      },
    })
  );
};

module.exports = {
  mapEmpId,
  validateLogin,
  getDashboard,
  getProfile,
  getLeave,
  getPayslip,
  getPayslipPdf,
};
