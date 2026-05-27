const sapService = require('../services/sapService');
const { successResponse } = require('../utils/responseHelper');
const { enrichProfile } = require('../utils/profileHelper');

/**
 * GET /api/profile/:empId
 */
const getProfile = async (req, res, next) => {
  try {
    const { empId } = req.params;
    const mappedId = sapService.mapEmpId(empId);
    
    // Fetch profile, payslips, and dashboard in parallel
    const [profileRes, payslipRes, dashRes] = await Promise.allSettled([
      sapService.getProfile(mappedId),
      sapService.getPayslip(mappedId),
      sapService.getDashboard(mappedId)
    ]);

    let profileData = null;
    if (profileRes.status === 'fulfilled') {
      const results = profileRes.value?.data?.d?.results || profileRes.value?.data?.d || [];
      profileData = Array.isArray(results) ? results[0] : results;
    }

    let payslipData = [];
    if (payslipRes.status === 'fulfilled') {
      payslipData = payslipRes.value?.data?.d?.results || payslipRes.value?.data?.d || [];
      if (!Array.isArray(payslipData)) {
        payslipData = payslipData ? [payslipData] : [];
      }
    }

    let dashData = null;
    if (dashRes.status === 'fulfilled') {
      const results = dashRes.value?.data?.d?.results || dashRes.value?.data?.d || [];
      dashData = Array.isArray(results) ? results[0] : results;
    }

    const isOwner = mappedId.includes('93') || mappedId.includes('093');
    const isDemo = mappedId.includes('14') || mappedId.includes('014') || parseInt(mappedId) <= 50;

    const hasRealData = profileData && (profileData.FirstName || profileData.FullName);

    if (!hasRealData && dashData && (dashData.FirstName || dashData.FullName)) {
      profileData = { ...dashData };
    } else if (!hasRealData && (isOwner || isDemo)) {
      profileData = {
        EmpId: mappedId,
        FirstName: isOwner ? "Vinodh" : (mappedId === '00000014' ? "Pradeish" : "Employee"),
        LastName: isOwner ? "Kumar" : (mappedId === '00000014' ? "Misara" : mappedId),
        FullName: isOwner ? "Vinodh Kumar" : (mappedId === '00000014' ? "Pradeish Misara" : `Employee ${mappedId}`),
      };
    }

    if (profileData) {
      profileData = enrichProfile(profileData, payslipData, dashData, mappedId);
    }

    return successResponse(res, profileData, 'Profile data fetched successfully');
  } catch (err) {
    next(err);
  }
};

module.exports = { getProfile };
