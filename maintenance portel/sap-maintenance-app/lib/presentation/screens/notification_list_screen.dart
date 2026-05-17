import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/notification_provider.dart';
import '../widgets/shimmer_loader.dart';
import '../widgets/priority_badge.dart';
import '../widgets/search_filter_bar.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/app_utils.dart';
import '../../data/models/notification_model.dart';
import 'notification_detail_screen.dart';

class NotificationListScreen extends ConsumerStatefulWidget {
  const NotificationListScreen({super.key});

  @override
  ConsumerState<NotificationListScreen> createState() =>
      _NotificationListScreenState();
}

class _NotificationListScreenState
    extends ConsumerState<NotificationListScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedPriority = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref.read(notificationFilterProvider.notifier).state = NotificationFilter(
      search: _searchCtrl.text.trim(),
      priority: _selectedPriority,
    );
  }

  void _clearFilter() {
    _searchCtrl.clear();
    setState(() => _selectedPriority = '');
    ref.read(notificationFilterProvider.notifier).state =
        const NotificationFilter();
  }

  @override
  Widget build(BuildContext context) {
    final notifications = ref.watch(notificationsProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Notifications'),
        backgroundColor: AppTheme.sapBlue,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(notificationsProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          // ─── Filters ─────────────────────────────────────────────────
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SearchFilterBar(
                  searchController: _searchCtrl,
                  searchHint: 'Search notifications...',
                  onSearch: _applyFilter,
                  onClear: _clearFilter,
                ),
                const SizedBox(height: 10),
                // Status filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _PriorityChip(
                        label: 'All Status',
                        selected: ref.watch(notificationFilterProvider).status.isEmpty,
                        color: AppTheme.sapBlue,
                        onTap: () {
                          ref.read(notificationFilterProvider.notifier).state = 
                              ref.read(notificationFilterProvider).copyWith(status: '');
                        },
                      ),
                      const SizedBox(width: 8),
                      _PriorityChip(
                        label: 'Open',
                        selected: ref.watch(notificationFilterProvider).status == 'Open',
                        color: AppTheme.sapBlue,
                        onTap: () {
                          ref.read(notificationFilterProvider.notifier).state = 
                              ref.read(notificationFilterProvider).copyWith(status: 'Open');
                        },
                      ),
                      const SizedBox(width: 8),
                      _PriorityChip(
                        label: 'Closed',
                        selected: ref.watch(notificationFilterProvider).status == 'Closed',
                        color: Colors.grey.shade700,
                        onTap: () {
                          ref.read(notificationFilterProvider.notifier).state = 
                              ref.read(notificationFilterProvider).copyWith(status: 'Closed');
                        },
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 10),
                // Priority filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _PriorityChip(
                        label: 'All Priorities',
                        selected: _selectedPriority.isEmpty,
                        color: AppTheme.sapBlue,
                        onTap: () {
                          setState(() => _selectedPriority = '');
                          _applyFilter();
                        },
                      ),
                      const SizedBox(width: 8),
                      _PriorityChip(
                        label: 'High',
                        selected: _selectedPriority == '1',
                        color: AppTheme.sapRed,
                        onTap: () {
                          setState(() => _selectedPriority = '1');
                          _applyFilter();
                        },
                      ),
                      const SizedBox(width: 8),
                      _PriorityChip(
                        label: 'Medium',
                        selected: _selectedPriority == '2',
                        color: AppTheme.sapOrange,
                        onTap: () {
                          setState(() => _selectedPriority = '2');
                          _applyFilter();
                        },
                      ),
                      const SizedBox(width: 8),
                      _PriorityChip(
                        label: 'Low',
                        selected: _selectedPriority == '3',
                        color: AppTheme.sapGreen,
                        onTap: () {
                          setState(() => _selectedPriority = '3');
                          _applyFilter();
                        },
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ─── List ─────────────────────────────────────────────────────
          Expanded(
            child: notifications.when(
              loading: () => const ShimmerLoader(count: 8, height: 100),
              error: (err, _) => _buildError(err),
              data: (list) => list.isEmpty
                  ? _buildEmpty()
                  : RefreshIndicator(
                      onRefresh: () async => ref.invalidate(notificationsProvider),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) => _NotificationCard(
                          notification: list[i],
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => NotificationDetailScreen(
                                notification: list[i],
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildError(Object err) => Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.cloud_off_rounded, size: 60, color: Colors.grey.shade400),
              const SizedBox(height: 16),
              const Text('Failed to load notifications'),
              const SizedBox(height: 16),
              ElevatedButton.icon(
                onPressed: () => ref.invalidate(notificationsProvider),
                icon: const Icon(Icons.refresh_rounded),
                label: const Text('Retry'),
              ),
            ],
          ),
        ),
      );

  Widget _buildEmpty() => const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.notifications_none_rounded, size: 64, color: Colors.grey),
            SizedBox(height: 16),
            Text('No notifications found'),
          ],
        ),
      );
}

class _NotificationCard extends StatelessWidget {
  final NotificationModel notification;
  final VoidCallback onTap;

  const _NotificationCard({required this.notification, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: AppTheme.sapBlue.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      notification.notifType.isEmpty ? 'NOTIF' : notification.notifType,
                      style: const TextStyle(
                          color: AppTheme.sapBlue, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      notification.notifNo.isEmpty ? 'N/A' : notification.notifNo,
                      style: TextStyle(
                        fontSize: 12,
                        color: Colors.grey.shade600,
                        fontWeight: FontWeight.w500,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                notification.description.isEmpty
                    ? 'No description'
                    : notification.description,
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (notification.plant.isNotEmpty) ...[
                    const Icon(Icons.factory_rounded, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(notification.plant,
                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    const SizedBox(width: 12),
                  ],
                  if (notification.startDate.isNotEmpty) ...[
                    const Icon(Icons.calendar_today_rounded, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(
                      AppUtils.formatSapDate(notification.startDate),
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                  const Spacer(),
                  PriorityBadge(priority: notification.priority),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _PriorityChip extends StatelessWidget {
  final String label;
  final bool selected;
  final Color color;
  final VoidCallback onTap;

  const _PriorityChip({
    required this.label,
    required this.selected,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: selected ? color : color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: color.withOpacity(0.4)),
        ),
        child: Text(
          label,
          style: TextStyle(
            color: selected ? Colors.white : color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
        ),
      ),
    );
  }
}
