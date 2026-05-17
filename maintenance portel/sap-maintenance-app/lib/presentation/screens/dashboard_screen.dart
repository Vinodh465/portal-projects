import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:flutter_animate/flutter_animate.dart';
import '../providers/dashboard_provider.dart';
import '../providers/auth_provider.dart';
import '../providers/notification_provider.dart';
import '../providers/work_order_provider.dart';
import '../providers/bottom_nav_provider.dart';
import '../widgets/kpi_card.dart';
import '../widgets/shimmer_loader.dart';
import '../../core/theme/app_theme.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final dashboard = ref.watch(dashboardProvider);
    final auth = ref.watch(authProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        slivers: [
          // ─── App Bar ─────────────────────────────────────────────────
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            backgroundColor: AppTheme.sapBlue,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
                padding: const EdgeInsets.fromLTRB(20, 60, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text(
                      'Hello, ${auth.employee?.name ?? 'Engineer'} 👋',
                      style: const TextStyle(color: Colors.white70, fontSize: 13),
                    ),
                    const SizedBox(height: 4),
                    const Text(
                      'Maintenance Dashboard',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 22,
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            actions: [
              IconButton(
                icon: const Icon(Icons.person_outline, color: Colors.white),
                onPressed: () => _showProfileDialog(context, ref),
              ),
              IconButton(
                icon: const Icon(Icons.refresh_rounded, color: Colors.white),
                onPressed: () => ref.invalidate(dashboardProvider),
              ),
            ],
          ),

          // ─── Body ─────────────────────────────────────────────────────
          SliverToBoxAdapter(
            child: dashboard.when(
              loading: () => const SizedBox(
                height: 500,
                child: ShimmerLoader(count: 6),
              ),
              error: (err, _) => _buildError(context, err, ref),
              data: (data) => RefreshIndicator(
                onRefresh: () async => ref.invalidate(dashboardProvider),
                child: SingleChildScrollView(
                  physics: const AlwaysScrollableScrollPhysics(),
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ─── KPI Grid ─────────────────────────────────────
                      _sectionTitle(context, 'Key Performance Indicators'),
                      const SizedBox(height: 12),
                      GridView.count(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        crossAxisCount: 2,
                        crossAxisSpacing: 12,
                        mainAxisSpacing: 12,
                        childAspectRatio: 1.4,
                        children: [
                          KpiCard(
                            title: 'Open Notifications',
                            value: '${data.openNotifications}',
                            icon: Icons.notifications_active_rounded,
                            gradientColors: [AppTheme.sapBlue, AppTheme.sapDarkBlue],
                            animationDelay: 0,
                            onTap: () {
                              ref.read(notificationFilterProvider.notifier).state = 
                                  const NotificationFilter(status: 'Open');
                              ref.read(bottomNavIndexProvider.notifier).state = 1;
                            },
                          ),
                          KpiCard(
                            title: 'Closed Notifications',
                            value: '${data.closedNotifications}',
                            icon: Icons.notifications_off_rounded,
                            gradientColors: [AppTheme.sapGreen, const Color(0xFF0B5D2C)],
                            animationDelay: 80,
                            onTap: () {
                              ref.read(notificationFilterProvider.notifier).state = 
                                  const NotificationFilter(status: 'Closed');
                              ref.read(bottomNavIndexProvider.notifier).state = 1;
                            },
                          ),
                          KpiCard(
                            title: 'Open Work Orders',
                            value: '${data.openWorkOrders}',
                            icon: Icons.build_circle_rounded,
                            gradientColors: [AppTheme.sapTeal, const Color(0xFF077A7A)],
                            animationDelay: 160,
                            onTap: () {
                              ref.read(workOrderFilterProvider.notifier).state = 
                                  const WorkOrderFilter(status: 'Open');
                              ref.read(bottomNavIndexProvider.notifier).state = 2;
                            },
                          ),
                          KpiCard(
                            title: 'Closed Work Orders',
                            value: '${data.closedWorkOrders}',
                            icon: Icons.check_circle_rounded,
                            gradientColors: [AppTheme.sapPurple, const Color(0xFF4A1D69)],
                            animationDelay: 240,
                            onTap: () {
                              ref.read(workOrderFilterProvider.notifier).state = 
                                  const WorkOrderFilter(status: 'Closed');
                              ref.read(bottomNavIndexProvider.notifier).state = 2;
                            },
                          ),
                          KpiCard(
                            title: 'High Priority',
                            value: '${data.highPriority}',
                            icon: Icons.priority_high_rounded,
                            gradientColors: [AppTheme.sapRed, const Color(0xFF8C0000)],
                            animationDelay: 320,
                          ),
                          KpiCard(
                            title: 'Medium Priority',
                            value: '${data.mediumPriority}',
                            icon: Icons.warning_amber_rounded,
                            gradientColors: [AppTheme.sapOrange, const Color(0xFFC25A00)],
                            animationDelay: 400,
                          ),
                          KpiCard(
                            title: 'Low Priority',
                            value: '${data.lowPriority}',
                            icon: Icons.low_priority_rounded,
                            gradientColors: [const Color(0xFF107E3E), const Color(0xFF065422)],
                            animationDelay: 480,
                          ),
                          KpiCard(
                            title: 'Total Breakdown',
                            value: '${data.totalBreakdown}',
                            icon: Icons.handyman_rounded,
                            gradientColors: [const Color(0xFF6A2C8E), const Color(0xFF3D1055)],
                            animationDelay: 560,
                          ),
                          KpiCard(
                            title: 'Equipment Count',
                            value: '${data.totalEquipment}',
                            icon: Icons.precision_manufacturing_rounded,
                            gradientColors: [const Color(0xFF006494), const Color(0xFF003D5B)],
                            animationDelay: 640,
                          ),
                          KpiCard(
                            title: 'Total Pending',
                            value: '${data.totalPending}',
                            icon: Icons.pending_actions_rounded,
                            gradientColors: [const Color(0xFFE8A000), const Color(0xFFA86E00)],
                            animationDelay: 720,
                          ),
                        ],
                      ),

                      const SizedBox(height: 28),

                      // ─── Notification Pie Chart ───────────────────────
                      _sectionTitle(context, 'Notification Analysis'),
                      const SizedBox(height: 12),
                      _buildPieChartCard(
                        context,
                        title: 'Notifications by Status',
                        sections: [
                          PieChartSectionData(
                            color: AppTheme.sapBlue,
                            value: data.openNotifications.toDouble().clamp(0.1, double.infinity),
                            title: 'Open\n${data.openNotifications}',
                            radius: 80,
                            titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          PieChartSectionData(
                            color: AppTheme.sapGreen,
                            value: data.closedNotifications.toDouble().clamp(0.1, double.infinity),
                            title: 'Closed\n${data.closedNotifications}',
                            radius: 80,
                            titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                        ],
                        delay: 800,
                      ),

                      const SizedBox(height: 16),

                      // ─── Priority Pie Chart ───────────────────────────
                      _buildPieChartCard(
                        context,
                        title: 'Priority Distribution',
                        sections: [
                          PieChartSectionData(
                            color: AppTheme.sapRed,
                            value: data.highPriority.toDouble().clamp(0.1, double.infinity),
                            title: 'High\n${data.highPriority}',
                            radius: 80,
                            titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          PieChartSectionData(
                            color: AppTheme.sapOrange,
                            value: data.mediumPriority.toDouble().clamp(0.1, double.infinity),
                            title: 'Med\n${data.mediumPriority}',
                            radius: 80,
                            titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                          PieChartSectionData(
                            color: AppTheme.sapGreen,
                            value: data.lowPriority.toDouble().clamp(0.1, double.infinity),
                            title: 'Low\n${data.lowPriority}',
                            radius: 80,
                            titleStyle: const TextStyle(fontSize: 11, color: Colors.white, fontWeight: FontWeight.w600),
                          ),
                        ],
                        delay: 1000,
                      ),

                      const SizedBox(height: 16),

                      // ─── Work Order Bar Chart ─────────────────────────
                      _sectionTitle(context, 'Work Order Status'),
                      const SizedBox(height: 12),
                      _buildBarChartCard(context, data),

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _sectionTitle(BuildContext context, String title) {
    return Text(
      title,
      style: Theme.of(context).textTheme.titleMedium?.copyWith(
            fontWeight: FontWeight.w700,
            letterSpacing: -0.2,
          ),
    );
  }

  Widget _buildPieChartCard(
    BuildContext context, {
    required String title,
    required List<PieChartSectionData> sections,
    int delay = 0,
  }) {
    return Animate(
      effects: [FadeEffect(duration: 500.ms, delay: Duration(milliseconds: delay))],
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              const SizedBox(height: 16),
              SizedBox(
                height: 200,
                child: PieChart(
                  PieChartData(
                    sections: sections,
                    centerSpaceRadius: 40,
                    sectionsSpace: 3,
                    pieTouchData: PieTouchData(enabled: true),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildBarChartCard(BuildContext context, dynamic data) {
    return Animate(
      effects: [FadeEffect(duration: 500.ms, delay: 1200.ms)],
      child: Card(
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Work Orders Overview',
                  style: TextStyle(fontWeight: FontWeight.w600, fontSize: 15)),
              const SizedBox(height: 16),
              SizedBox(
                height: 180,
                child: BarChart(
                  BarChartData(
                    alignment: BarChartAlignment.spaceAround,
                    maxY: (data.openWorkOrders + data.closedWorkOrders + 20).toDouble(),
                    barTouchData: BarTouchData(enabled: true),
                    titlesData: FlTitlesData(
                      show: true,
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) {
                            switch (v.toInt()) {
                              case 0: return const Text('Open', style: TextStyle(fontSize: 11));
                              case 1: return const Text('Closed', style: TextStyle(fontSize: 11));
                              default: return const Text('');
                            }
                          },
                        ),
                      ),
                      leftTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      topTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                      rightTitles: const AxisTitles(sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: const FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                    barGroups: [
                      BarChartGroupData(x: 0, barRods: [
                        BarChartRodData(
                          toY: data.openWorkOrders.toDouble(),
                          color: AppTheme.sapBlue,
                          width: 40,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                        ),
                      ]),
                      BarChartGroupData(x: 1, barRods: [
                        BarChartRodData(
                          toY: data.closedWorkOrders.toDouble(),
                          color: AppTheme.sapGreen,
                          width: 40,
                          borderRadius: const BorderRadius.vertical(top: Radius.circular(8)),
                        ),
                      ]),
                    ],
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildError(BuildContext context, Object err, WidgetRef ref) {
    return Padding(
      padding: const EdgeInsets.all(32),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          const SizedBox(height: 60),
          Icon(Icons.cloud_off_rounded, size: 72, color: Colors.grey.shade400),
          const SizedBox(height: 20),
          const Text('Cannot reach backend',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.w600)),
          const SizedBox(height: 8),
          Text(
            'Make sure the Node.js backend is running on localhost:3000',
            textAlign: TextAlign.center,
            style: TextStyle(fontSize: 13, color: Colors.grey.shade600),
          ),
          const SizedBox(height: 24),
          ElevatedButton.icon(
            onPressed: () => ref.invalidate(dashboardProvider),
            icon: const Icon(Icons.refresh_rounded),
            label: const Text('Retry'),
          ),
        ],
      ),
    );
  }

  void _showProfileDialog(BuildContext context, WidgetRef ref) {
    final auth = ref.read(authProvider);
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Row(
          children: [
            Container(
              width: 44,
              height: 44,
              decoration: BoxDecoration(
                gradient: AppTheme.heroGradient,
                borderRadius: BorderRadius.circular(12),
              ),
              child: const Icon(Icons.person, color: Colors.white),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(auth.employee?.name ?? 'Employee',
                      style: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700)),
                  Text('ID: ${auth.employee?.empId ?? ''}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            if (auth.employee?.plant.isNotEmpty == true)
              ListTile(
                dense: true,
                leading: const Icon(Icons.factory_rounded, size: 18),
                title: Text('Plant: ${auth.employee!.plant}'),
              ),
            if (auth.employee?.role.isNotEmpty == true)
              ListTile(
                dense: true,
                leading: const Icon(Icons.work_rounded, size: 18),
                title: Text(auth.employee!.role),
              ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Close'),
          ),
          ElevatedButton.icon(
            onPressed: () async {
              Navigator.pop(ctx);
              await ref.read(authProvider.notifier).logout();
            },
            icon: const Icon(Icons.logout, size: 16),
            label: const Text('Logout'),
            style: ElevatedButton.styleFrom(backgroundColor: AppTheme.sapRed),
          ),
        ],
      ),
    );
  }
}
