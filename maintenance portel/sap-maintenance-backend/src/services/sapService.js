/**
 * SAP Service - Reusable layer for all SAP OData API calls
 * All methods use Basic Auth configured in sapConfig.js
 */
const sapAxios = require('../config/sapConfig');

/**
 * Helper: extract OData results array from response
 */
const extractResults = (data) => {
  if (!data) return [];
  if (data.d) {
    if (Array.isArray(data.d.results)) return data.d.results;
    if (data.d.results !== undefined) return data.d.results;
    return [data.d]; // single entity
  }
  if (Array.isArray(data)) return data;
  return [data];
};

const authenticateEmployee = async (empId, password) => {
  // SAP Personnel Number (PERNR) is typically 8 digits.
  // Testing confirmed 10 digits results in a 400 error for this service.
  const padLen = 8;
  const paddedId = empId.toString().padStart(padLen, '0');
  
  console.log(`\n  🔑 Validating: ${paddedId} (padding: ${padLen})`);

  const authUrl = `/LoginSet?$filter=EmpId eq '${paddedId}' and Password eq '${password}'&$format=json`;
  
  try {
    const authRes = await sapAxios.get(authUrl);
    const authResults = extractResults(authRes.data);
    
    if (authResults && authResults.length > 0) {
      const employee = authResults[0];
      
      // 'S' means Success in SAP status codes
      if (employee.Status === 'S') {
        console.log(`  ✓ SAP matched: ${paddedId}`);
        return { success: true, employee };
      } else {
        // Status 'F' means authentication failed (wrong password or ID)
        console.log(`  ✗ SAP rejected: ${paddedId} (Status: ${employee.Status})`);
        return { 
          success: false, 
          message: 'Invalid Employee ID or Password' 
        };
      }
    } else {
      // No results found at all
      console.log(`  ✗ SAP not found: ${paddedId}`);
      return { success: false, message: 'Invalid Employee ID or Password' };
    }
  } catch (err) {
    const status = err.response?.status;
    console.error(`  ✗ SAP API Error (${status || 'Network'}):`, err.message);
    
    return { 
      success: false, 
      message: status === 401 ? 'SAP System connection failed' : 'SAP Service error' 
    };
  }
};

/**
 * Fetch Dashboard data from SAP DashboardSet
 */
const getDashboard = async () => {
  const url = `/DashboardSet?$format=json`;
  const response = await sapAxios.get(url);
  return extractResults(response.data);
};

/**
 * Fetch Notifications from SAP NotifySet
 * @param {object} filters - { id, search, priority, status }
 */
const getNotifications = async (filters = {}) => {
  let url = `/NotifySet?$format=json`;
  const conditions = [];

  if (filters.id) {
    conditions.push(`NotificationId eq '${filters.id}'`);
  }
  if (filters.priority) {
    conditions.push(`PriorityLevel eq '${filters.priority}'`);
  }
  if (filters.status) {
    let sapStatus = filters.status;
    if (sapStatus === 'Open') sapStatus = 'OSNO'; // Standard SAP Open status
    if (sapStatus === 'Closed') sapStatus = 'NOCO'; // Standard SAP Closed status
    conditions.push(`SystemStatus eq '${sapStatus}'`);
  }
  if (conditions.length > 0) {
    url += `&$filter=${conditions.join(' and ')}`;
  }

  const response = await sapAxios.get(url);
  let results = extractResults(response.data);

  // Client-side filtering fallback (in case SAP ignores OData filter)
  if (filters.priority) {
    if (filters.priority === '3') {
      results = results.filter((n) => n.PriorityLevel === '3' || n.PriorityLevel === '4');
    } else {
      results = results.filter((n) => n.PriorityLevel === filters.priority);
    }
  }
  if (filters.status) {
    const sapStatus = filters.status === 'Open' ? 'OSNO' : (filters.status === 'Closed' ? 'NOCO' : filters.status);
    results = results.filter((n) => n.SystemStatus === sapStatus || n.SystemStatus === filters.status || (filters.status === 'Open' && n.SystemStatus === '00'));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (n) =>
        (n.NotificationId && n.NotificationId.toLowerCase().includes(q)) ||
        (n.NotificationText && n.NotificationText.toLowerCase().includes(q)) ||
        (n.EquipmentId && n.EquipmentId.toLowerCase().includes(q))
    );
  }

  return results;
};

/**
 * Fetch Work Orders from SAP WorkSet
 * @param {object} filters - { id, search, priority }
 */
const getWorkOrders = async (filters = {}) => {
  let url = `/WorkSet?$format=json`;
  const conditions = [];

  if (filters.id) {
    conditions.push(`WorkorderId eq '${filters.id}'`);
  }
  if (filters.priority) {
    conditions.push(`PriorityLevel eq '${filters.priority}'`);
  }
  if (filters.status) {
    let sapStatus = filters.status;
    if (sapStatus === 'Open') sapStatus = 'REL'; // Standard SAP Released status
    if (sapStatus === 'Closed') sapStatus = 'TECO'; // Standard SAP Technical Complete status
    conditions.push(`OrderStatus eq '${sapStatus}'`);
  }
  if (conditions.length > 0) {
    url += `&$filter=${conditions.join(' and ')}`;
  }

  const response = await sapAxios.get(url);
  let results = extractResults(response.data);

  // Client-side filtering fallback (in case SAP ignores OData filter)
  if (filters.priority) {
    if (filters.priority === '3') {
      results = results.filter((w) => w.PriorityLevel === '3' || w.PriorityLevel === '4');
    } else {
      results = results.filter((w) => w.PriorityLevel === filters.priority);
    }
  }
  if (filters.status) {
    const sapStatus = filters.status === 'Open' ? 'REL' : (filters.status === 'Closed' ? 'TECO' : filters.status);
    results = results.filter((w) => w.OrderStatus === sapStatus || w.OrderStatus === filters.status || (filters.status === 'Open' && w.OrderStatus === '00'));
  }

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (w) =>
        (w.WorkorderId && w.WorkorderId.toLowerCase().includes(q)) ||
        (w.OrderDescription && w.OrderDescription.toLowerCase().includes(q)) ||
        (w.EquipmentId && w.EquipmentId.toLowerCase().includes(q)) ||
        (w.PlantId && w.PlantId.toLowerCase().includes(q))
    );
  }

  return results;
};

/**
 * Fetch Plants from SAP PlantSet
 * @param {object} filters - { id, search }
 */
const getPlants = async (filters = {}) => {
  let url = `/PlantSet?$format=json`;
  const conditions = [];

  if (filters.id) {
    conditions.push(`PlantId eq '${filters.id}'`);
  }
  if (conditions.length > 0) {
    url += `&$filter=${conditions.join(' and ')}`;
  }

  const response = await sapAxios.get(url);
  let results = extractResults(response.data);

  if (filters.search) {
    const q = filters.search.toLowerCase();
    results = results.filter(
      (p) =>
        (p.PlantId && p.PlantId.toLowerCase().includes(q)) ||
        (p.PlantName && p.PlantName.toLowerCase().includes(q)) ||
        (p.CityName && p.CityName.toLowerCase().includes(q)) ||
        (p.CountryCode && p.CountryCode.toLowerCase().includes(q))
    );
  }

  return results;
};

module.exports = {
  authenticateEmployee,
  getDashboard,
  getNotifications,
  getWorkOrders,
  getPlants,
};
