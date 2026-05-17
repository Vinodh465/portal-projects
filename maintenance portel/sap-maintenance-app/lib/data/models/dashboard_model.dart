/// Dashboard KPI model from Node backend
class DashboardModel {
  final int openNotifications;
  final int closedNotifications;
  final int openWorkOrders;
  final int inProgressWorkOrders;
  final int closedWorkOrders;
  final int highPriority;
  final int mediumPriority;
  final int lowPriority;
  final int totalBreakdown;
  final int totalEquipment;
  final int totalPending;
  final String rawData;

  const DashboardModel({
    this.openNotifications = 0,
    this.closedNotifications = 0,
    this.openWorkOrders = 0,
    this.inProgressWorkOrders = 0,
    this.closedWorkOrders = 0,
    this.highPriority = 0,
    this.mediumPriority = 0,
    this.lowPriority = 0,
    this.totalBreakdown = 0,
    this.totalEquipment = 0,
    this.totalPending = 0,
    this.rawData = '',
  });

  factory DashboardModel.fromJson(Map<String, dynamic> json) {
    int _i(dynamic v) => int.tryParse(v?.toString() ?? '0') ?? 0;
    return DashboardModel(
      openNotifications: _i(json['openNotifications']),
      closedNotifications: _i(json['closedNotifications']),
      openWorkOrders: _i(json['openWorkOrders']),
      inProgressWorkOrders: _i(json['inProgressWorkOrders']),
      closedWorkOrders: _i(json['closedWorkOrders']),
      highPriority: _i(json['highPriority']),
      mediumPriority: _i(json['mediumPriority']),
      lowPriority: _i(json['lowPriority']),
      totalBreakdown: _i(json['totalBreakdown']),
      totalEquipment: _i(json['totalEquipment']),
      totalPending: _i(json['totalPending']),
      rawData: json['raw']?.toString() ?? '',
    );
  }

  int get totalNotifications => openNotifications + closedNotifications;
  int get totalWorkOrders => openWorkOrders + closedWorkOrders;
}
