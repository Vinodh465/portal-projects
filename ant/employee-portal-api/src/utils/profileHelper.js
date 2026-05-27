'use strict';

/**
 * Parse dot-separated SAP date (e.g. "02.09.03" or "02.09.2003") into standard SAP OData Date format: /Date(timestamp)/
 */
const parseSapDob = (dobStr) => {
  if (!dobStr) return dobStr;
  const str = String(dobStr).trim();
  if (str.includes('/Date(')) return str;

  // Handle strange format like "20.8/.25/0" -> 25th August 2000
  const strangeMatch = str.match(/^(\d+)\.(\d+)\/\.(\d+)\/(\d+)$/);
  if (strangeMatch) {
    const yrPrefix = strangeMatch[1]; // "20"
    const month = parseInt(strangeMatch[2], 10);
    const day = parseInt(strangeMatch[3], 10);
    const yrSuffix = strangeMatch[4]; // "0"
    const year = parseInt(yrPrefix + yrSuffix.padStart(2, '0'), 10);
    const d = new Date(year, month - 1, day);
    if (!isNaN(d.getTime())) {
      return `/Date(${d.getTime()})/`;
    }
  }

  // Handle formats like "02.09.03" or "02.09.2003"
  const parts = str.split('.');
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10) - 1; // 0-indexed month
    let year = parseInt(parts[2], 10);
    if (parts[2].length === 2) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return `/Date(${d.getTime()})/`;
    }
  }

  // Handle formats like "01/01/2026" or "25/01/2026"
  const slashParts = str.split('/');
  if (slashParts.length === 3) {
    const day = parseInt(slashParts[0], 10);
    const month = parseInt(slashParts[1], 10) - 1; // 0-indexed month
    let year = parseInt(slashParts[2], 10);
    if (slashParts[2].length === 2) {
      year = year < 50 ? 2000 + year : 1900 + year;
    }
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) {
      return `/Date(${d.getTime()})/`;
    }
  }

  // Handle formats like "YYYY-MM-DD"
  const d = new Date(str);
  if (!isNaN(d.getTime())) {
    return `/Date(${d.getTime()})/`;
  }

  return dobStr;
};

/**
 * Translate numeric gender code to friendly string
 */
const translateGender = (gCode) => {
  if (!gCode) return '—';
  const str = String(gCode).trim();
  if (str === '1' || str.toLowerCase() === 'm' || str.toLowerCase() === 'male') return 'Male';
  if (str === '2' || str.toLowerCase() === 'f' || str.toLowerCase() === 'female') return 'Female';
  return gCode;
};

/**
 * Translate numeric marital status code to friendly string
 */
const translateMaritalStatus = (mCode) => {
  if (!mCode && mCode !== 0) return '—';
  const str = String(mCode).trim();
  if (str === '0' || str.toLowerCase() === 'single') return 'Single';
  if (str === '1' || str.toLowerCase() === 'married') return 'Married';
  if (str === '2' || str.toLowerCase() === 'divorced') return 'Divorced';
  if (str === '3' || str.toLowerCase() === 'widowed') return 'Widowed';
  return mCode;
};

/**
 * Enrich profile details with bank information from payslips and complete missing contact/payroll details
 */
const enrichProfile = (profileData, payslipList, dashData, empId) => {
  if (!profileData) return profileData;

  const data = { ...profileData };

  // 1. Extract Bank Details from Payslip list if available and missing in profile
  const payslip = Array.isArray(payslipList) && payslipList.length > 0 ? payslipList[0] : null;
  const payslipBankName = payslip?.BankName;
  const payslipAccountNo = payslip?.AccountNo;
  const payslipIfscCode = payslip?.IfscCode || payslip?.IFSCCode || payslip?.ifscCode;

  if (payslipBankName && (!data.BankName || data.BankName === '—')) {
    data.BankName = payslipBankName;
  }
  if (payslipAccountNo && (!data.AccountNo || data.AccountNo === '—')) {
    data.AccountNo = payslipAccountNo;
    data.BankAccount = payslipAccountNo;
  }
  if (payslipIfscCode && (!data.IFSCCode || data.IFSCCode === '—')) {
    data.IFSCCode = payslipIfscCode;
    data.IFSC = payslipIfscCode;
  }

  // 2. Extract Department, Designation, CompanyCode, JoinDate from Dashboard Set if available
  const dash = dashData || {};
  if (dash.Department && (!data.Department || data.Department === '00000000')) {
    data.Department = dash.Department;
  }
  if (dash.Designation && (!data.Designation || data.Designation === '00000000')) {
    data.Designation = dash.Designation;
  }
  if (dash.CompanyCode && !data.CompanyCode) {
    data.CompanyCode = dash.CompanyCode;
  }
  if (dash.JoinDate && !data.JoinDate) {
    data.JoinDate = dash.JoinDate;
  }

  // 3. Normalise Date of Birth
  if (data.Dob) {
    const formattedDob = parseSapDob(data.Dob);
    data.DateOfBirth = formattedDob;
    data.DOB = formattedDob;
  }

  // 4. Normalise Gender & Marital Status
  if (data.Gender) {
    data.Gender = translateGender(data.Gender);
  }
  if (data.MaritalStatus || data.MaritalStatus === '0') {
    data.MaritalStatus = translateMaritalStatus(data.MaritalStatus);
  }

  // 5. Translate Country
  if (data.Country) {
    const c = String(data.Country).toUpperCase().trim();
    if (c === 'AE') data.Country = 'United Arab Emirates';
    else if (c === 'IN') data.Country = 'India';
    else if (c === 'US') data.Country = 'United States';
  }

  // 6. Translate State
  if (data.State) {
    const s = String(data.State).toUpperCase().trim();
    if (s === 'AZ') {
      data.State = (data.Country === 'United Arab Emirates' || data.Address?.includes('Dubai')) ? 'Abu Dhabi' : 'Arizona';
    } else if (s === 'KA') {
      data.State = 'Karnataka';
    } else if (s === 'TN') {
      data.State = 'Tamil Nadu';
    }
  }

  // 7. Setup full name mapping
  data.FullName = data.FullName || `${data.FirstName || ''} ${data.LastName || ''}`.replace(/\s+/g, ' ').trim() || 'Employee';
  data.EmpName = data.FullName;
  data.Name = data.FullName;

  // 8. Contact information - Use OData directly (no hardcoded fallbacks!)
  data.Email = data.EmailId || '';
  data.EmailId = data.EmailId || '';
  data.Mobile = data.MobileNo || '';
  data.MobileNo = data.MobileNo || '';
  data.Phone = data.MobileNo || '';
  data.BloodGroup = data.BloodGroup || '';
  data.AlternatePhone = '';

  // 9. Employment & Payroll fields not in OData: set to empty (no hardcoded fallbacks!)
  data.EmployeeType = '';
  data.CostCenter = '';
  data.PAN = '';
  data.PANNo = '';
  data.PFNo = '';
  data.PFNumber = '';
  data.ESINo = '';

  if (data.Department === '00000000') {
    data.Department = '';
    data.DeptText = '';
  }
  if (data.Designation === '00000000') {
    data.Designation = '';
    data.DesignationText = '';
  }

  // JoinDate / DateOfJoining / HireDate formatting
  if (data.JoinDate || data.DateOfJoining || data.HireDate) {
    const jd = parseSapDob(data.JoinDate || data.DateOfJoining || data.HireDate);
    data.JoinDate = jd;
    data.DateOfJoining = jd;
    data.HireDate = jd;
  } else {
    data.JoinDate = '';
    data.DateOfJoining = '';
    data.HireDate = '';
  }

  // Bank Account mappings (only merge from payslip if found, otherwise keep empty)
  data.BankName = data.BankName || '';
  data.AccountNo = data.AccountNo || data.BankAccount || '';
  data.BankAccount = data.BankAccount || data.AccountNo || '';
  data.IFSCCode = data.IFSCCode || data.IFSC || '';
  data.IFSC = data.IFSC || data.IFSCCode || '';

  return data;
};

module.exports = {
  parseSapDob,
  translateGender,
  translateMaritalStatus,
  enrichProfile,
};
