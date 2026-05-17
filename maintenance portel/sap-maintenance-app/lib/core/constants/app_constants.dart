/// App-wide constants
class AppConstants {
  AppConstants._();

  // API
  static const String apiBaseUrl = 'http://localhost:3000/api';
  static const int apiTimeoutSeconds = 30;
  static const String employeeIdHeader = 'x-employee-id';

  // SharedPreferences Keys
  static const String keyEmpId = 'emp_id';
  static const String keyEmpName = 'emp_name';
  static const String keyEmpPlant = 'emp_plant';
  static const String keyIsLoggedIn = 'is_logged_in';

  // Animation Durations
  static const Duration animFast = Duration(milliseconds: 250);
  static const Duration animMedium = Duration(milliseconds: 400);
  static const Duration animSlow = Duration(milliseconds: 700);

  // Priorities
  static const String priorityHigh = '1';
  static const String priorityMedium = '2';
  static const String priorityLow = '3';

  // Pagination
  static const int pageSize = 20;
}
