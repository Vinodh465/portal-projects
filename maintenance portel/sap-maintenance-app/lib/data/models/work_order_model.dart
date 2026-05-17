/// Work Order model
class WorkOrderModel {
  final String orderId;
  final String orderType;
  final String description;
  final String plant;
  final String equipment;
  final String functionalLocation;
  final String priority;
  final String workCenter;
  final String startDate;
  final String endDate;
  final String status;
  final String plannerGroup;
  final String maintenanceActivity;
  final String notifNo;

  const WorkOrderModel({
    required this.orderId,
    this.orderType = '',
    this.description = '',
    this.plant = '',
    this.equipment = '',
    this.functionalLocation = '',
    this.priority = '',
    this.workCenter = '',
    this.startDate = '',
    this.endDate = '',
    this.status = '',
    this.plannerGroup = '',
    this.maintenanceActivity = '',
    this.notifNo = '',
  });

  factory WorkOrderModel.fromJson(Map<String, dynamic> json) {
    return WorkOrderModel(
      orderId: json['orderId']?.toString() ?? '',
      orderType: json['orderType']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      plant: json['plant']?.toString() ?? '',
      equipment: json['equipment']?.toString() ?? '',
      functionalLocation: json['functionalLocation']?.toString() ?? '',
      priority: json['priority']?.toString() ?? '',
      workCenter: json['workCenter']?.toString() ?? '',
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      plannerGroup: json['plannerGroup']?.toString() ?? '',
      maintenanceActivity: json['maintenanceActivity']?.toString() ?? '',
      notifNo: json['notifNo']?.toString() ?? '',
    );
  }

  bool get isHighPriority => priority == '1' || priority.toLowerCase() == 'high';
}
