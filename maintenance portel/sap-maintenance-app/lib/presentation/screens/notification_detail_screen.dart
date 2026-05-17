import 'package:flutter/material.dart';
import '../../data/models/notification_model.dart';
import '../widgets/priority_badge.dart';
import '../../core/theme/app_theme.dart';
import '../../core/utils/app_utils.dart';

class NotificationDetailScreen extends StatelessWidget {
  final NotificationModel notification;
  const NotificationDetailScreen({super.key, required this.notification});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: AppTheme.sapBlue,
            foregroundColor: Colors.white,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
                padding: const EdgeInsets.fromLTRB(20, 80, 20, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisAlignment: MainAxisAlignment.end,
                  children: [
                    Text('${notification.notifType} ${notification.notifNo}',
                        style: const TextStyle(color: Colors.white70, fontSize: 13)),
                    const SizedBox(height: 4),
                    Text(
                      notification.description.isEmpty ? 'No description' : notification.description,
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
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Status + Priority Row
                  Row(
                    children: [
                      PriorityBadge(priority: notification.priority),
                    ],
                  ),
                  const SizedBox(height: 20),

                  // Detail Card
                  _DetailCard(
                    title: 'Notification Details',
                    rows: [
                      _DetailRow('Notification No', notification.notifNo),
                      _DetailRow('Type', notification.notifType),
                      _DetailRow('Plant', notification.plant),
                      _DetailRow('Equipment', notification.equipment),
                      _DetailRow('Functional Location', notification.functionalLocation),
                      _DetailRow('Work Center', notification.workCenter),
                      _DetailRow('Reported By', notification.reportedBy),
                    ],
                  ),

                  const SizedBox(height: 16),

                  _DetailCard(
                    title: 'Timeline',
                    rows: [
                      _DetailRow('Start Date', AppUtils.formatSapDate(notification.startDate)),
                      _DetailRow('End Date', AppUtils.formatSapDate(notification.endDate)),
                    ],
                  ),

                  if (notification.longText.isNotEmpty) ...[
                    const SizedBox(height: 16),
                    Card(
                      child: Padding(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Long Text',
                                style: TextStyle(fontWeight: FontWeight.w700, fontSize: 14)),
                            const SizedBox(height: 10),
                            Text(notification.longText,
                                style: const TextStyle(fontSize: 13, height: 1.5)),
                          ],
                        ),
                      ),
                    ),
                  ],
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

class _DetailCard extends StatelessWidget {
  final String title;
  final List<_DetailRow> rows;
  const _DetailCard({required this.title, required this.rows});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15)),
            const Divider(height: 20),
            ...rows.where((r) => r.value.isNotEmpty).map((r) => Padding(
              padding: const EdgeInsets.only(bottom: 10),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  SizedBox(
                    width: 140,
                    child: Text(r.label,
                        style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                  ),
                  Expanded(
                    child: Text(r.value,
                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500)),
                  ),
                ],
              ),
            )),
          ],
        ),
      ),
    );
  }
}

class _DetailRow {
  final String label;
  final String value;
  const _DetailRow(this.label, this.value);
}
