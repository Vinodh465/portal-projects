import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/dashboard_model.dart';
import '../../data/repositories/dashboard_repository.dart';
import 'auth_provider.dart';

final dashboardRepositoryProvider = Provider<DashboardRepository>(
  (ref) => DashboardRepository(ref.read(apiServiceProvider)),
);

final dashboardProvider = FutureProvider<DashboardModel>((ref) async {
  final repo = ref.read(dashboardRepositoryProvider);
  return repo.getDashboard();
});
