/**
 * Notification Controller
 * GET /api/notifications
 * GET /api/notifications/:id
 */
const sapService = require('../services/sapService');

/**
 * Get all notifications with optional filters
 * Query params: id, search, priority, status
 */
const getNotifications = async (req, res, next) => {
  try {
    const { id, search, priority, status } = req.query;
    console.log(`\n🔔 Fetching notifications — filters: ${JSON.stringify(req.query)}`);

    const results = await sapService.getNotifications({ id, search, priority, status });

    // Normalize the field names to a clean JSON structure
    const notifications = results.map((n) => ({
      notifNo: n.NotificationId || '',
      description: n.NotificationText || '',
      priority: n.PriorityLevel || '',
      status: n.SystemStatus || '',
      plant: n.PlantId || '',
      equipment: n.EquipmentId || '',
      functionalLocation: '', // Not found in this entity set
      startDate: n.StartDate || n.CreatedDate || '',
      endDate: n.EndDate || '',
      notifType: n.NotificationType || '',
      reportedBy: '', // Not found in this entity set
      workCenter: n.WorkCenter || '',
      orderNo: n.WorkorderId || '',
      longText: '',
    }));

    res.json({
      success: true,
      count: notifications.length,
      data: notifications,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Get single notification by ID
 */
const getNotificationById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const results = await sapService.getNotifications({ id });

    if (!results || results.length === 0) {
      return res.status(404).json({ success: false, error: `Notification ${id} not found` });
    }

    const n = results[0];
    res.json({
      success: true,
      data: {
        notifNo: n.NotifNo || n.Qmnum || '',
        description: n.ShortText || n.Qmtxt || n.Ktext || '',
        priority: n.Priority || n.Priok || '',
        status: n.MnotStatn || n.Status || n.Qmstat || '',
        plant: n.Werks || n.Plant || '',
        equipment: n.Equnr || n.Equipment || '',
        functionalLocation: n.Tplnr || n.FuncLoc || '',
        startDate: n.Qmdat || n.StartDate || '',
        endDate: n.Aufnr || n.EndDate || '',
        notifType: n.Qmart || n.NotifType || '',
        reportedBy: n.Ernam || n.ReportedBy || '',
        workCenter: n.Arbpl || n.WorkCenter || '',
        longText: n.LongText || '',
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = { getNotifications, getNotificationById };
