import 'package:dio/dio.dart';
import '../models/auth_model.dart';
import '../models/dashboard_model.dart';
import '../models/notification_model.dart';
import '../models/work_order_model.dart';
import '../models/plant_model.dart';
import '../../core/network/api_client.dart';

/// Central API service - calls Node.js backend only
class ApiService {
  final Dio _dio;

  ApiService() : _dio = ApiClient().dio;

  // ─── AUTH ─────────────────────────────────────────────────────────────────

  Future<AuthModel> login(String empId, String password) async {
    final response = await _dio.post('/auth/login', data: {
      'empId': empId,
      'password': password,
    });
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      return AuthModel.fromJson(body['data'] as Map<String, dynamic>);
    }
    throw Exception(body['error'] ?? 'Login failed');
  }

  // ─── DASHBOARD ───────────────────────────────────────────────────────────

  Future<DashboardModel> getDashboard() async {
    final response = await _dio.get('/dashboard');
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      final payload = body['data'] as Map<String, dynamic>;
      payload['raw'] = body['raw']; // Pass the raw data down to the model
      return DashboardModel.fromJson(payload);
    }
    throw Exception(body['error'] ?? 'Failed to load dashboard');
  }

  // ─── NOTIFICATIONS ────────────────────────────────────────────────────────

  Future<List<NotificationModel>> getNotifications({
    String? id,
    String? search,
    String? priority,
    String? status,
  }) async {
    final params = <String, String>{};
    if (id != null && id.isNotEmpty) params['id'] = id;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (priority != null && priority.isNotEmpty) params['priority'] = priority;
    if (status != null && status.isNotEmpty) params['status'] = status;

    final response = await _dio.get('/notifications', queryParameters: params);
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      final list = body['data'] as List<dynamic>;
      return list.map((e) => NotificationModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception(body['error'] ?? 'Failed to load notifications');
  }

  Future<NotificationModel> getNotificationById(String id) async {
    final response = await _dio.get('/notifications/$id');
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      return NotificationModel.fromJson(body['data'] as Map<String, dynamic>);
    }
    throw Exception(body['error'] ?? 'Notification not found');
  }

  // ─── WORK ORDERS ─────────────────────────────────────────────────────────

  Future<List<WorkOrderModel>> getWorkOrders({
    String? id,
    String? search,
    String? priority,
    String? status,
  }) async {
    final params = <String, String>{};
    if (id != null && id.isNotEmpty) params['id'] = id;
    if (search != null && search.isNotEmpty) params['search'] = search;
    if (priority != null && priority.isNotEmpty) params['priority'] = priority;
    if (status != null && status.isNotEmpty) params['status'] = status;

    final response = await _dio.get('/workorders', queryParameters: params);
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      final list = body['data'] as List<dynamic>;
      return list.map((e) => WorkOrderModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception(body['error'] ?? 'Failed to load work orders');
  }

  Future<WorkOrderModel> getWorkOrderById(String id) async {
    final response = await _dio.get('/workorders/$id');
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      return WorkOrderModel.fromJson(body['data'] as Map<String, dynamic>);
    }
    throw Exception(body['error'] ?? 'Work order not found');
  }

  // ─── PLANTS ───────────────────────────────────────────────────────────────

  Future<List<PlantModel>> getPlants({String? id, String? search}) async {
    final params = <String, String>{};
    if (id != null && id.isNotEmpty) params['id'] = id;
    if (search != null && search.isNotEmpty) params['search'] = search;

    final response = await _dio.get('/plants', queryParameters: params);
    final body = response.data as Map<String, dynamic>;
    if (body['success'] == true) {
      final list = body['data'] as List<dynamic>;
      return list.map((e) => PlantModel.fromJson(e as Map<String, dynamic>)).toList();
    }
    throw Exception(body['error'] ?? 'Failed to load plants');
  }
}
