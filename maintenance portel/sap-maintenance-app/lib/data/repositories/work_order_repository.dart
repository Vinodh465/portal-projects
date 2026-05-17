import '../models/work_order_model.dart';
import '../services/api_service.dart';

class WorkOrderRepository {
  final ApiService _api;
  WorkOrderRepository(this._api);

  Future<List<WorkOrderModel>> getWorkOrders({
    String? id, String? search, String? priority, String? status,
  }) => _api.getWorkOrders(id: id, search: search, priority: priority, status: status);

  Future<WorkOrderModel> getById(String id) => _api.getWorkOrderById(id);
}
