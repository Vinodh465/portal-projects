import '../models/notification_model.dart';
import '../services/api_service.dart';

class NotificationRepository {
  final ApiService _api;
  NotificationRepository(this._api);

  Future<List<NotificationModel>> getNotifications({
    String? id, String? search, String? priority, String? status,
  }) => _api.getNotifications(id: id, search: search, priority: priority, status: status);

  Future<NotificationModel> getById(String id) => _api.getNotificationById(id);
}
