/**
 * Dashboard Controller - GET /api/dashboard
 * Fetches KPI analytics from SAP DashboardSet
 */
const sapService = require('../services/sapService');

const getDashboard = async (req, res, next) => {
  try {
    console.log('\n📊 Fetching Dashboard data from SAP...');
    const results = await sapService.getDashboard();

    // Aggregate KPIs if multiple records returned
    let kpis = {};
    if (results.length > 0) {
      // If SAP returns a single aggregated dashboard record
      const d = results[0];
      
      // Log the raw fields to help debugging
      console.log('--- DASHBOARD RAW FIELDS ---');
      console.log(Object.keys(d).join(', '));
      
      kpis = {
        openNotifications: parseInt(d.TotalOpenNotification || 0),
        closedNotifications: parseInt(d.TotalClosedNotification || 0),
        openWorkOrders: parseInt(d.TotalOpenWorkorder || 0),
        inProgressWorkOrders: parseInt(d.TotalInProgressWorkorder || d.TotalPendingCount || 0),
        closedWorkOrders: parseInt(d.TotalClosedWorkorder || 0),
        highPriority: parseInt(d.HighPriorityCount || 0),
        mediumPriority: parseInt(d.MediumPriorityCount || 0),
        lowPriority: parseInt(d.LowPriorityCount || 0),
        totalBreakdown: parseInt(d.TotalBreakdownCount || 0),
        totalEquipment: parseInt(d.TotalEquipmentCount || 0),
        totalPending: parseInt(d.TotalPendingCount || 0),
      };
    }

    res.json({
      success: true,
      data: kpis,
      raw: results.length > 0 ? JSON.stringify(results[0], null, 2) : '', // include raw for debugging
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getDashboard };
