const sapService = require('../services/sapService');
const { successResponse } = require('../utils/responseHelper');

const getMonthName = (monthStr) => {
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const m = parseInt(monthStr, 10);
  return (m >= 1 && m <= 12) ? months[m - 1] : monthStr;
};

const mapLeave = (l) => {
  if (!l) return l;
  const cl = l.BalanceCl !== undefined ? parseFloat(l.BalanceCl) : 0;
  const sl = l.BalanceSl !== undefined ? parseFloat(l.BalanceSl) : 0;
  const pl = l.BalancePl !== undefined ? parseFloat(l.BalancePl) : 0;

  let days = l.TotalDays ? parseInt(l.TotalDays, 10) : 0;
  if (!days && l.FromDate && l.ToDate) {
    try {
      const fromMs = parseInt(l.FromDate.match(/\/Date\((\d+)\)\//)?.[1], 10);
      const toMs = parseInt(l.ToDate.match(/\/Date\((\d+)\)\//)?.[1], 10);
      if (!isNaN(fromMs) && !isNaN(toMs)) {
        const diffMs = toMs - fromMs;
        const calcDays = Math.round(diffMs / (1000 * 60 * 60 * 24)) + 1;
        days = calcDays > 365 ? 0 : calcDays;
      }
    } catch (e) {}
  }

  return {
    ...l,
    Type: l.LeaveType || '',
    Days: days,
    Status: l.LeaveStatus || 'Approved',
    AnnualBalance: pl,
    SickBalance: sl,
    CasualBalance: cl,
    CompOffBalance: 0,
  };
};

/**
 * GET /api/leave/:empId
 */
const getLeave = async (req, res, next) => {
  try {
    const { empId } = req.params;
    const mappedId = sapService.mapEmpId(empId);
    
    let results = [];
    try {
      const sapResponse = await sapService.getLeave(mappedId);
      results = sapResponse?.data?.d?.results || sapResponse?.data?.d || [];
      if (!Array.isArray(results)) {
        results = results ? [results] : [];
      }
    } catch (err) {
      console.warn(`OData leave fetch failed for ${mappedId}`);
    }

    const hasNoRecords = results.length === 0 || 
                         (results.length === 1 && (results[0].Remarks === "NO LEAVE RECORDS" || !results[0].LeaveType));

    if (hasNoRecords) {
      // Return a single placeholder record with zero balances to avoid frontend crashes
      results = [{
        EmpId: mappedId,
        BalanceCl: 0,
        BalanceSl: 0,
        BalancePl: 0,
        Remarks: "NO LEAVE RECORDS"
      }];
    }

    results = results.map(mapLeave);

    return successResponse(res, results, 'Leave data fetched successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getLeave };
