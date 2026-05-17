import 'package:shared_preferences/shared_preferences.dart';
import '../models/auth_model.dart';
import '../services/api_service.dart';
import '../../core/constants/app_constants.dart';

class AuthRepository {
  final ApiService _api;
  AuthRepository(this._api);

  Future<AuthModel> login(String empId, String password) async {
    final employee = await _api.login(empId, password);
    // Persist session
    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(AppConstants.keyEmpId, employee.empId);
    await prefs.setString(AppConstants.keyEmpName, employee.name);
    await prefs.setString(AppConstants.keyEmpPlant, employee.plant);
    await prefs.setBool(AppConstants.keyIsLoggedIn, true);
    return employee;
  }

  Future<AuthModel?> getStoredEmployee() async {
    final prefs = await SharedPreferences.getInstance();
    final loggedIn = prefs.getBool(AppConstants.keyIsLoggedIn) ?? false;
    if (!loggedIn) return null;
    return AuthModel(
      empId: prefs.getString(AppConstants.keyEmpId) ?? '',
      name: prefs.getString(AppConstants.keyEmpName) ?? '',
      plant: prefs.getString(AppConstants.keyEmpPlant) ?? '',
    );
  }

  Future<void> logout() async {
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove(AppConstants.keyEmpId);
    await prefs.remove(AppConstants.keyEmpName);
    await prefs.remove(AppConstants.keyEmpPlant);
    await prefs.setBool(AppConstants.keyIsLoggedIn, false);
  }
}
