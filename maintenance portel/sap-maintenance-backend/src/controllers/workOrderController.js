/**
 * Work Order Controller
 * GET /api/workorders
 * GET /api/workorders/:id
 */
const sapService = require('../services/sapService');

/**
 * Get all work orders with optional filters
 * Query params: id, search, priority
 */
const getWorkOrders = async (req, res, next) => {
  try {
    const { id, search, priority, status } = req.query;
    console.log(`\n🔧 Fetching work orders — filters: ${JSON.stringify(req.query)}`);

    const results = await sapService.getWorkOrders({ id, search, priority, status });

    const workOrders = results.map((w) => ({
      orderId: w.WorkorderId || '',
      orderType: w.OrderType || '',
      description: w.OrderDescription || '',
      plant: w.PlantId || '',
      equipment: w.EquipmentId || '',
      functionalLocation: '', // Not found in this entity set
      priority: w.PriorityLevel || '',
      workCenter: w.WorkCenter || '',
      startDate: w.StartDate || w.CreatedDate || '',
      endDate: w.EndDate || '',
      status: w.OrderStatus || '',
      systemStatus: w.SapStatus || '',
      userStatus: w.DisplayStatus || '',
      plannerGroup: '',
      maintenanceActivity: w.MaintenanceActivity || '',
      revisionNo: '',
      notifNo: '',
      actualStart: '',
      actualEnd: '',
    }));

    res.json({
      success: true,
      count: workOrders.length,
      data: workOrders,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single work order by ID
 */
const getWorkOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await sapService.getWorkOrders({ id });

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, error: `Work Order ${id} not found` });
    }

    const w = results[0];
    res.json({
      success: true,
      data: {
        orderId: w.Aufnr || '',
        orderType: w.Auart || '',
        description: w.Ktext || '',
        plant: w.Werks || '',
        equipment: w.Equnr || '',
        functionalLocation: w.Tplnr || '',
        priority: w.Priok || '',
        workCenter: w.Arbpl || '',
        startDate: w.Gstrp || '',
        endDate: w.Gltrp || '',
        status: w.Sttxt || '',
        plannerGroup: w.Innam || '',
        maintenanceActivity: w.Ilart || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getWorkOrders, getWorkOrderById };
