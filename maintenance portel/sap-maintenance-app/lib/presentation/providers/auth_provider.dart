import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/auth_model.dart';
import '../../data/repositories/auth_repository.dart';
import '../../data/services/api_service.dart';

// ─── Service & Repository Providers ─────────────────────────────────────────
final apiServiceProvider = Provider<ApiService>((ref) => ApiService());

final authRepositoryProvider = Provider<AuthRepository>(
  (ref) => AuthRepository(ref.read(apiServiceProvider)),
);

// ─── Auth State ───────────────────────────────────────────────────────────────
enum AuthStatus { initial, loading, authenticated, unauthenticated, error }

class AuthState {
  final AuthStatus status;
  final AuthModel? employee;
  final String? errorMessage;

  const AuthState({
    this.status = AuthStatus.initial,
    this.employee,
    this.errorMessage,
  });

  AuthState copyWith({AuthStatus? status, AuthModel? employee, String? errorMessage}) {
    return AuthState(
      status: status ?? this.status,
      employee: employee ?? this.employee,
      errorMessage: errorMessage ?? this.errorMessage,
    );
  }

  bool get isAuthenticated => status == AuthStatus.authenticated;
}

// ─── Auth Notifier ────────────────────────────────────────────────────────────
class AuthNotifier extends StateNotifier<AuthState> {
  final AuthRepository _repo;

  AuthNotifier(this._repo) : super(const AuthState()) {
    _checkSession();
  }

  Future<void> _checkSession() async {
    state = state.copyWith(status: AuthStatus.loading);
    try {
      final emp = await _repo.getStoredEmployee();
      if (emp != null && emp.empId.isNotEmpty) {
        state = AuthState(status: AuthStatus.authenticated, employee: emp);
      } else {
        state = const AuthState(status: AuthStatus.unauthenticated);
      }
    } catch (_) {
      state = const AuthState(status: AuthStatus.unauthenticated);
    }
  }

  /// Returns true on success, false on failure (does NOT set global loading)
  Future<bool> login(String empId, String password) async {
    try {
      final employee = await _repo.login(empId, password);
      state = AuthState(status: AuthStatus.authenticated, employee: employee);
      return true;
    } catch (e) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: e.toString().replaceFirst('Exception: ', ''),
      );
      return false;
    }
  }

  Future<void> logout() async {
    await _repo.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>(
  (ref) => AuthNotifier(ref.read(authRepositoryProvider)),
);
