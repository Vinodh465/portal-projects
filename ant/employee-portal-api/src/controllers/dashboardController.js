const sapService = require('../services/sapService');
const { successResponse } = require('../utils/responseHelper');

/**
 * GET /api/dashboard/:empId
 */
const getDashboard = async (req, res, next) => {
  try {
    const { empId } = req.params;
    const mappedId = sapService.mapEmpId(empId);

    // Call all service endpoints in parallel
    const [dashRes, leaveRes, payslipRes, profileRes] = await Promise.allSettled([
      sapService.getDashboard(mappedId),
      sapService.getLeave(mappedId),
      sapService.getPayslip(mappedId),
      sapService.getProfile(mappedId),
    ]);

    // Extract results
    const dashData = dashRes.status === 'fulfilled' ? (dashRes.value?.data?.d?.results?.[0] || dashRes.value?.data?.d) : null;
    const leaveData = leaveRes.status === 'fulfilled' ? (leaveRes.value?.data?.d?.results || []) : [];
    const payslipData = payslipRes.status === 'fulfilled' ? (payslipRes.value?.data?.d?.results || []) : [];
    const profileData = profileRes.status === 'fulfilled' ? (profileRes.value?.data?.d?.results?.[0] || profileRes.value?.data?.d) : null;

    let personalInfo = dashData || profileData || {};

    const isOwner = mappedId.includes('93') || mappedId.includes('093');
    const isDemo = mappedId.includes('14') || mappedId.includes('014') || parseInt(mappedId) <= 50;

    const hasRealData = personalInfo.FirstName || personalInfo.FullName;

    if (!hasRealData && (isOwner || isDemo)) {
      personalInfo = {
        EmpId: mappedId,
        FirstName: isOwner ? "Vinodh" : (mappedId === '00000014' ? "Pradeish" : "Employee"),
        LastName: isOwner ? "Kumar" : (mappedId === '00000014' ? "Misara" : mappedId),
        FullName: isOwner ? "Vinodh Kumar" : (mappedId === '00000014' ? "Pradeish Misara" : `Employee ${mappedId}`),
      };
    }

    // Enrich personalInfo using the shared profile mapper utility
    const { enrichProfile } = require('../utils/profileHelper');
    personalInfo = enrichProfile(personalInfo, payslipData, mappedId);

    const unifiedDash = {
      EmpId: mappedId,
      EmpName: personalInfo.FullName,
      FirstName: personalInfo.FirstName,
      LastName: personalInfo.LastName,
      FullName: personalInfo.FullName,
      Dob: personalInfo.DOB || personalInfo.Dob || '',
      Gender: personalInfo.Gender || '',
      Department: personalInfo.Department || '00000000',
      Designation: personalInfo.Designation || '00000000',
      CompanyCode: personalInfo.CompanyCode || 'KAAR',
      JoinDate: personalInfo.JoinDate || '',
      EmailId: personalInfo.EmailId || '',
      MobileNo: personalInfo.MobileNo || '',
    };

    // Calculate Leave Balance from leave records if available
    let leaveBalance = 0;
    const hasLeaves = leaveData && leaveData.length > 0 && leaveData[0].Remarks !== "NO LEAVE RECORDS";

    let usedAnnual = 0;
    let usedSick = 0;
    let usedCasual = 0;

    if (hasLeaves) {
      leaveData.forEach(l => {
        const type = (l.LeaveType || l.Type || '').toLowerCase();
        const desc = (l.LeaveDesc || l.Reason || '').toLowerCase();
        let days = parseInt(l.TotalDays, 10) || 0;
        
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

        if (type.includes('lwp')) {
          // Leave Without Pay - don't count towards any balance
        } else if (type.includes('0300') || type.includes('annual') || type.includes('pl') || type.includes('al') || desc.includes('annual')) {
          usedAnnual += days;
        } else if (type.includes('0200') || type.includes('sick') || type.includes('sl') || desc.includes('sick')) {
          usedSick += days;
        } else if (type.includes('0100') || type.includes('casual') || type.includes('cl') || desc.includes('casual')) {
          usedCasual += days;
        }
      });

      const firstLeave = leaveData[0];
      const cl = parseFloat(firstLeave.BalanceCl) || 0;
      const sl = parseFloat(firstLeave.BalanceSl) || 0;
      const pl = parseFloat(firstLeave.BalancePl) || 0;

      let annualAvail = 21 - usedAnnual;
      let sickAvail = 10 - usedSick;
      let casualAvail = 7 - usedCasual;

      if (pl > 0) annualAvail = pl;
      if (sl > 0) sickAvail = sl;
      if (cl > 0) casualAvail = cl;

      leaveBalance = annualAvail + sickAvail + casualAvail;

      unifiedDash.AnnualLeaveTotal = 21;
      unifiedDash.AnnualLeaveUsed = Math.max(0, 21 - annualAvail);
      unifiedDash.SickLeaveTotal = 10;
      unifiedDash.SickLeaveUsed = Math.max(0, 10 - sickAvail);
      unifiedDash.CasualLeaveTotal = 7;
      unifiedDash.CasualLeaveUsed = Math.max(0, 7 - casualAvail);
    } else {
      leaveBalance = 38; // 21 + 10 + 7 available by default if no leaves taken
      unifiedDash.AnnualLeaveTotal = 21;
      unifiedDash.AnnualLeaveUsed = 0;
      unifiedDash.SickLeaveTotal = 10;
      unifiedDash.SickLeaveUsed = 0;
      unifiedDash.CasualLeaveTotal = 7;
      unifiedDash.CasualLeaveUsed = 0;
    }
    unifiedDash.LeaveBalance = leaveBalance;
    unifiedDash.AvailableLeave = leaveBalance;

    // Attendance, experience and tasks are not in OData. Set to 0 to show original data (no fake mocks)
    unifiedDash.AttendancePct = 0;
    unifiedDash.Attendance = 0;
    unifiedDash.YearsOfService = 0;
    unifiedDash.Experience = 0;
    unifiedDash.PendingTasks = 0;
    unifiedDash.Tasks = 0;

    // Compile Payslip Info
    if (payslipData && payslipData.length > 0) {
      const ps = payslipData[0];
      const basic = parseFloat(ps.BasicPay) || 0;
      const hra = parseFloat(ps.Hra) || 0;
      const allowances = parseFloat(ps.Allowances) || 0;
      const bonus = parseFloat(ps.Bonus) || 0;
      const ot = parseFloat(ps.OvertimePay) || 0;
      
      const pf = parseFloat(ps.PfAmount) || 0;
      const tax = parseFloat(ps.TaxAmount) || 0;
      const ded = parseFloat(ps.Deductions) || (pf + tax);

      const gross = basic + hra + allowances + bonus + ot;
      const net = parseFloat(ps.NetPay) || (gross - ded);

      unifiedDash.GrossSalary = gross;
      unifiedDash.TotalDeductions = ded;
      unifiedDash.NetPay = net;
      unifiedDash.NetSalary = net;
    } else {
      unifiedDash.GrossSalary = 0;
      unifiedDash.TotalDeductions = 0;
      unifiedDash.NetPay = 0;
      unifiedDash.NetSalary = 0;
    }

    // Normalizing Designation and Department to Nice Human Strings
    if (unifiedDash.Department === "00000000" || !unifiedDash.Department) {
      unifiedDash.Department = "Information Technology";
      unifiedDash.DeptText = "Information Technology";
    }
    if (unifiedDash.Designation === "00000000" || !unifiedDash.Designation) {
      unifiedDash.Designation = "Software Engineer";
      unifiedDash.DesignationText = "Software Engineer";
    }

    return successResponse(res, [unifiedDash], 'Dashboard data aggregated and fetched successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
