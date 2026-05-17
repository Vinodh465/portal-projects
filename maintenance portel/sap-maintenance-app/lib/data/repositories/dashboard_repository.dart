import '../models/dashboard_model.dart';
import '../services/api_service.dart';

class DashboardRepository {
  final ApiService _api;
  DashboardRepository(this._api);
  Future<DashboardModel> getDashboard() => _api.getDashboard();
}
