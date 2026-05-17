import 'package:flutter/material.dart';
import '../../data/models/work_order_model.dart';
import '../widgets/priority_badge.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/app_utils.dart';

class WorkOrderDetailScreen extends StatelessWidget {
  final WorkOrderModel workOrder;
  const WorkOrderDetailScreen({super.key, required this.workOrder});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: AppTheme.sapTeal,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppTheme.tealGradient),
                padding: const EdgeInsets.fromLTRB(20, 80, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text('${workOrder.orderType} ${workOrder.orderId}',
                        style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      workOrder.description.isEmpty ? 'No description' : workOrder.description,
                      style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.w700),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  Row(
                    children: [
                      PriorityBadge(priority: workOrder.priority),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Card(
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('Order Details',
                              style: TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
                          const Divider(height: 20),
                          ...[
                            ['Order ID', workOrder.orderId],
                            ['Order Type', workOrder.orderType],
                            ['Plant', workOrder.plant],
                            ['Equipment', workOrder.equipment],
                            ['Functional Location', workOrder.functionalLocation],
                            ['Work Center', workOrder.workCenter],
                            ['Planner Group', workOrder.plannerGroup],
                            ['Maintenance Activity', workOrder.maintenanceActivity],
                            ['Notification No', workOrder.notifNo],
                            ['Start Date', AppUtils.formatSapDate(workOrder.startDate)],
                            ['End Date', AppUtils.formatSapDate(workOrder.endDate)],
                          ].where((r) => (r[1]).isNotEmpty).map((r) => Padding(
                            padding: const EdgeInsets.only(bottom: 10),
                            child: Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                SizedBox(
                                  width: 150,
                                  child: Text(r[0], style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                                ),
                                Expanded(
                                  child: Text(r[1],
                                      style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                                ),
                              ],
                            ),
                          )),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(height: 32),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}
