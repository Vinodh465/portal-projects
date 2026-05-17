/// Maintenance Notification model
class NotificationModel {
  final String notifNo;
  final String description;
  final String priority;
  final String status;
  final String plant;
  final String equipment;
  final String functionalLocation;
  final String startDate;
  final String endDate;
  final String notifType;
  final String reportedBy;
  final String workCenter;
  final String longText;

  const NotificationModel({
    required this.notifNo,
    this.description = '',
    this.priority = '',
    this.status = '',
    this.plant = '',
    this.equipment = '',
    this.functionalLocation = '',
    this.startDate = '',
    this.endDate = '',
    this.notifType = '',
    this.reportedBy = '',
    this.workCenter = '',
    this.longText = '',
  });

  factory NotificationModel.fromJson(Map<String, dynamic> json) {
    return NotificationModel(
      notifNo: json['notifNo']?.toString() ?? '',
      description: json['description']?.toString() ?? '',
      priority: json['priority']?.toString() ?? '',
      status: json['status']?.toString() ?? '',
      plant: json['plant']?.toString() ?? '',
      equipment: json['equipment']?.toString() ?? '',
      functionalLocation: json['functionalLocation']?.toString() ?? '',
      startDate: json['startDate']?.toString() ?? '',
      endDate: json['endDate']?.toString() ?? '',
      notifType: json['notifType']?.toString() ?? '',
      reportedBy: json['reportedBy']?.toString() ?? '',
      workCenter: json['workCenter']?.toString() ?? '',
      longText: json['longText']?.toString() ?? '',
    );
  }

  bool get isOpen =>
      status.toLowerCase().contains('open') ||
      status.toLowerCase().contains('ouvrir') ||
      status == 'OSNO' ||
      status.isEmpty;

  bool get isHighPriority => priority == '1' || priority.toLowerCase() == 'high';

  NotificationModel copyWith({
    String? notifNo,
    String? description,
    String? priority,
    String? status,
    String? plant,
    String? equipment,
    String? functionalLocation,
    String? startDate,
    String? endDate,
    String? notifType,
    String? reportedBy,
    String? workCenter,
    String? longText,
  }) {
    return NotificationModel(
      notifNo: notifNo ?? this.notifNo,
      description: description ?? this.description,
      priority: priority ?? this.priority,
      status: status ?? this.status,
      plant: plant ?? this.plant,
      equipment: equipment ?? this.equipment,
      functionalLocation: functionalLocation ?? this.functionalLocation,
      startDate: startDate ?? this.startDate,
      endDate: endDate ?? this.endDate,
      notifType: notifType ?? this.notifType,
      reportedBy: reportedBy ?? this.reportedBy,
      workCenter: workCenter ?? this.workCenter,
      longText: longText ?? this.longText,
    );
  }
}
