import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/work_order_provider.dart';
import '../widgets/shimmer_loader.dart';
import '../widgets/priority_badge.dart';
import '../widgets/search_filter_bar.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/app_utils.dart';
import '../../data/models/work_order_model.dart';
import 'work_order_detail_screen.dart';

class WorkOrderListScreen extends ConsumerStatefulWidget {
  const WorkOrderListScreen({super.key});
  @override
  ConsumerState<WorkOrderListScreen> createState() => _WorkOrderListScreenState();
}

class _WorkOrderListScreenState extends ConsumerState<WorkOrderListScreen> {
  final _searchCtrl = TextEditingController();
  String _selectedPriority = '';

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref.read(workOrderFilterProvider.notifier).state = WorkOrderFilter(
      search: _searchCtrl.text.trim(),
      priority: _selectedPriority,
    );
  }

  void _clearFilter() {
    _searchCtrl.clear();
    setState(() => _selectedPriority = '');
    ref.read(workOrderFilterProvider.notifier).state = const WorkOrderFilter();
  }

  @override
  Widget build(BuildContext context) {
    final workOrders = ref.watch(workOrdersProvider);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        title: const Text('Work Orders'),
        backgroundColor: AppTheme.sapTeal,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(workOrdersProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                SearchFilterBar(
                  searchController: _searchCtrl,
                  searchHint: 'Search work orders...',
                  onSearch: _applyFilter,
                  onClear: _clearFilter,
                ),
                const SizedBox(height: 10),
                // Status filter chips
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: [
                      _buildChip(
                        'All Status',
                        ref.watch(workOrderFilterProvider).status.isEmpty,
                        AppTheme.sapTeal,
                        () {
                          ref.read(workOrderFilterProvider.notifier).state = 
                              ref.read(workOrderFilterProvider).copyWith(status: '');
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildChip(
                        'Open',
                        ref.watch(workOrderFilterProvider).status == 'Open',
                        AppTheme.sapTeal,
                        () {
                          ref.read(workOrderFilterProvider.notifier).state = 
                              ref.read(workOrderFilterProvider).copyWith(status: 'Open');
                        },
                      ),
                      const SizedBox(width: 8),
                      _buildChip(
                        'Closed',
                        ref.watch(workOrderFilterProvider).status == 'Closed',
                        Colors.grey.shade700,
                        () {
                          ref.read(workOrderFilterProvider.notifier).state = 
                              ref.read(workOrderFilterProvider).copyWith(status: 'Closed');
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
                      _buildChip('All Priorities', _selectedPriority.isEmpty, AppTheme.sapTeal, () {
                        setState(() => _selectedPriority = '');
                        _applyFilter();
                      }),
                      const SizedBox(width: 8),
                      _buildChip('High', _selectedPriority == '1', AppTheme.sapRed, () {
                        setState(() => _selectedPriority = '1');
                        _applyFilter();
                      }),
                      const SizedBox(width: 8),
                      _buildChip('Medium', _selectedPriority == '2', AppTheme.sapOrange, () {
                        setState(() => _selectedPriority = '2');
                        _applyFilter();
                      }),
                      const SizedBox(width: 8),
                      _buildChip('Low', _selectedPriority == '3', AppTheme.sapGreen, () {
                        setState(() => _selectedPriority = '3');
                        _applyFilter();
                      }),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: workOrders.when(
              loading: () => const ShimmerLoader(count: 8, height: 110),
              error: (err, _) => Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.cloud_off_rounded, size: 60, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('Failed to load work orders'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => ref.invalidate(workOrdersProvider),
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Retry'),
                  ),
                ]),
              ),
              data: (list) => list.isEmpty
                  ? const Center(child: Text('No work orders found'))
                  : RefreshIndicator(
                      onRefresh: () async => ref.invalidate(workOrdersProvider),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) => _WorkOrderCard(
                          workOrder: list[i],
                          onTap: () => Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => WorkOrderDetailScreen(workOrder: list[i]),
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

  Widget _buildChip(String label, bool selected, Color color, VoidCallback onTap) {
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
        child: Text(label,
            style: TextStyle(
                color: selected ? Colors.white : color,
                fontSize: 12,
                fontWeight: FontWeight.w600)),
      ),
    );
  }
}

class _WorkOrderCard extends StatelessWidget {
  final WorkOrderModel workOrder;
  final VoidCallback onTap;
  const _WorkOrderCard({required this.workOrder, required this.onTap});

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
                      color: AppTheme.sapTeal.withOpacity(0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      workOrder.orderType.isEmpty ? 'WO' : workOrder.orderType,
                      style: const TextStyle(
                          color: AppTheme.sapTeal, fontSize: 11, fontWeight: FontWeight.w600),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(workOrder.orderId,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  ),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                workOrder.description.isEmpty ? 'No description' : workOrder.description,
                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 10),
              Row(
                children: [
                  if (workOrder.plant.isNotEmpty) ...[
                    const Icon(Icons.factory_rounded, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(workOrder.plant,
                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                    const SizedBox(width: 12),
                  ],
                  if (workOrder.startDate.isNotEmpty) ...[
                    const Icon(Icons.calendar_today_rounded, size: 14, color: Colors.grey),
                    const SizedBox(width: 4),
                    Text(AppUtils.formatSapDate(workOrder.startDate),
                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ],
                  const Spacer(),
                  PriorityBadge(priority: workOrder.priority),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
