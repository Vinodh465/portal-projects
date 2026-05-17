import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/notification_model.dart';
import '../../data/repositories/notification_repository.dart';
import 'auth_provider.dart';

final notificationRepositoryProvider = Provider<NotificationRepository>(
  (ref) => NotificationRepository(ref.read(apiServiceProvider)),
);

// Filter state
class NotificationFilter {
  final String search;
  final String id;
  final String priority;
  final String status;
  const NotificationFilter({
    this.search = '', this.id = '', this.priority = '', this.status = '',
  });
  NotificationFilter copyWith({String? search, String? id, String? priority, String? status}) =>
      NotificationFilter(
        search: search ?? this.search,
        id: id ?? this.id,
        priority: priority ?? this.priority,
        status: status ?? this.status,
      );
}

final notificationFilterProvider =
    StateProvider<NotificationFilter>((ref) => const NotificationFilter());

final notificationsProvider = FutureProvider<List<NotificationModel>>((ref) async {
  final filter = ref.watch(notificationFilterProvider);
  final repo = ref.read(notificationRepositoryProvider);
  return repo.getNotifications(
    id: filter.id.isEmpty ? null : filter.id,
    search: filter.search.isEmpty ? null : filter.search,
    priority: filter.priority.isEmpty ? null : filter.priority,
    status: filter.status.isEmpty ? null : filter.status,
  );
});
