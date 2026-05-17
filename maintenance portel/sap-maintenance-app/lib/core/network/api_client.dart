import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../constants/app_constants.dart';

/// Dio HTTP client configured to call the Node.js backend
class ApiClient {
  static ApiClient? _instance;
  late final Dio _dio;

  ApiClient._() {
    final baseUrl = dotenv.get('API_BASE_URL', fallback: AppConstants.apiBaseUrl);
    _dio = Dio(
      BaseOptions(
        baseUrl: baseUrl,
        connectTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        receiveTimeout: const Duration(seconds: AppConstants.apiTimeoutSeconds),
        validateStatus: (status) {
          return status != null && status < 500;
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      ),
    );

    _dio.interceptors.addAll([
      _AuthInterceptor(),
      _LogInterceptor(),
    ]);
  }

  factory ApiClient() => _instance ??= ApiClient._();

  Dio get dio => _dio;
}

/// Automatically injects x-employee-id header from SharedPreferences
class _AuthInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final empId = prefs.getString(AppConstants.keyEmpId);
      if (empId != null && empId.isNotEmpty) {
        options.headers[AppConstants.employeeIdHeader] = empId;
      }
    } catch (_) {}
    handler.next(options);
  }
}

/// Request/response logger
class _LogInterceptor extends Interceptor {
  @override
  void onRequest(RequestOptions options, RequestInterceptorHandler handler) {
    print('→ ${options.method} ${options.uri}');
    handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    print('← ${response.statusCode} ${response.requestOptions.path}');
    handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    print('✗ API Error: ${err.message}');
    handler.next(err);
  }
}
