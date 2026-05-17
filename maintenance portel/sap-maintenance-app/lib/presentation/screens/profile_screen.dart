import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';

class ProfileScreen extends ConsumerWidget {
  const ProfileScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    final emp = auth.employee;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 200,
            pinned: true,
            backgroundColor: AppTheme.sapDarkBlue,
            foregroundColor: Colors.white,
            automaticallyImplyLeading: false,
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(gradient: AppTheme.heroGradient),
                child: SafeArea(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Container(
                        width: 80,
                        height: 80,
                        decoration: BoxDecoration(
                          color: Colors.white.withOpacity(0.2),
                          shape: BoxShape.circle,
                          border: Border.all(color: Colors.white.withOpacity(0.4), width: 2),
                        ),
                        child: const Icon(Icons.person_rounded, size: 44, color: Colors.white),
                      ),
                      const SizedBox(height: 12),
                      Text(
                        emp?.name ?? 'Employee',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 20,
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        emp?.role ?? 'Maintenance Engineer',
                        style: TextStyle(color: Colors.white.withOpacity(0.75), fontSize: 13),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  // Info Card
                  Card(
                    child: Column(
                      children: [
                        _InfoTile(
                          icon: Icons.badge_outlined,
                          label: 'Employee ID',
                          value: emp?.empId ?? 'N/A',
                        ),
                        const Divider(indent: 56, height: 1),
                        _InfoTile(
                          icon: Icons.email_outlined,
                          label: 'Email',
                          value: emp?.email.isEmpty == true ? 'Not provided' : emp!.email,
                        ),
                        const Divider(indent: 56, height: 1),
                        _InfoTile(
                          icon: Icons.factory_rounded,
                          label: 'Plant',
                          value: emp?.plant.isEmpty == true ? 'Not assigned' : emp!.plant,
                        ),
                        const Divider(indent: 56, height: 1),
                        _InfoTile(
                          icon: Icons.work_outline_rounded,
                          label: 'Role',
                          value: emp?.role ?? 'N/A',
                        ),
                        if (emp?.department.isNotEmpty == true) ...[
                          const Divider(indent: 56, height: 1),
                          _InfoTile(
                            icon: Icons.business_rounded,
                            label: 'Department',
                            value: emp!.department,
                          ),
                        ],
                      ],
                    ),
                  ),

                  const SizedBox(height: 16),

                  // App Info Card
                  Card(
                    child: Column(
                      children: [
                        _InfoTile(
                          icon: Icons.info_outline_rounded,
                          label: 'App Version',
                          value: '1.0.0',
                        ),
                        const Divider(indent: 56, height: 1),
                        _InfoTile(
                          icon: Icons.security_rounded,
                          label: 'Backend',
                          value: 'Node.js + Express',
                        ),
                        const Divider(indent: 56, height: 1),
                        _InfoTile(
                          icon: Icons.storage_rounded,
                          label: 'SAP System',
                          value: 'ZPM_MAINTENANCE_SRV_093',
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Logout Button
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: ElevatedButton.icon(
                      onPressed: () async {
                        final confirmed = await showDialog<bool>(
                          context: context,
                          builder: (ctx) => AlertDialog(
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
                            title: const Text('Sign Out'),
                            content: const Text('Are you sure you want to sign out?'),
                            actions: [
                              TextButton(
                                onPressed: () => Navigator.pop(ctx, false),
                                child: const Text('Cancel'),
                              ),
                              ElevatedButton(
                                onPressed: () => Navigator.pop(ctx, true),
                                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.sapRed),
                                child: const Text('Sign Out'),
                              ),
                            ],
                          ),
                        );
                        if (confirmed == true) {
                          await ref.read(authProvider.notifier).logout();
                        }
                      },
                      icon: const Icon(Icons.logout_rounded),
                      label: const Text('Sign Out'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppTheme.sapRed,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
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

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  const _InfoTile({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon, color: AppTheme.sapBlue, size: 22),
      title: Text(label, style: const TextStyle(fontSize: 12, color: Colors.grey)),
      subtitle: Text(value, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.w600)),
      dense: false,
    );
  }
}
