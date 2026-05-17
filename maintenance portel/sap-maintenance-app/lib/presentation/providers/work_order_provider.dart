import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/work_order_model.dart';
import '../../data/repositories/work_order_repository.dart';
import 'auth_provider.dart';

final workOrderRepositoryProvider = Provider<WorkOrderRepository>(
  (ref) => WorkOrderRepository(ref.read(apiServiceProvider)),
);

class WorkOrderFilter {
  final String search;
  final String id;
  final String priority;
  final String status;
  const WorkOrderFilter({this.search = '', this.id = '', this.priority = '', this.status = ''});
  WorkOrderFilter copyWith({String? search, String? id, String? priority, String? status}) =>
      WorkOrderFilter(
        search: search ?? this.search,
        id: id ?? this.id,
        priority: priority ?? this.priority,
        status: status ?? this.status,
      );
}

final workOrderFilterProvider =
    StateProvider<WorkOrderFilter>((ref) => const WorkOrderFilter());

final workOrdersProvider = FutureProvider<List<WorkOrderModel>>((ref) async {
  final filter = ref.watch(workOrderFilterProvider);
  final repo = ref.read(workOrderRepositoryProvider);
  return repo.getWorkOrders(
    id: filter.id.isEmpty ? null : filter.id,
    search: filter.search.isEmpty ? null : filter.search,
    priority: filter.priority.isEmpty ? null : filter.priority,
    status: filter.status.isEmpty ? null : filter.status,
  );
});
