import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/auth_provider.dart';
import '../../core/theme/app_theme.dart';

/// Theme mode provider
final themeModeProvider = StateProvider<ThemeMode>((ref) => ThemeMode.system);

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final themeMode = ref.watch(themeModeProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: AppTheme.sapDarkBlue,
        foregroundColor: Colors.white,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          const _SectionHeader('Appearance'),
          Card(
            child: Column(
              children: [
                RadioListTile<ThemeMode>(
                  title: const Text('System Default'),
                  secondary: const Icon(Icons.brightness_auto_rounded),
                  value: ThemeMode.system,
                  groupValue: themeMode,
                  onChanged: (v) =>
                      ref.read(themeModeProvider.notifier).state = v!,
                ),
                const Divider(indent: 56, height: 1),
                RadioListTile<ThemeMode>(
                  title: const Text('Light Mode'),
                  secondary: const Icon(Icons.light_mode_rounded),
                  value: ThemeMode.light,
                  groupValue: themeMode,
                  onChanged: (v) =>
                      ref.read(themeModeProvider.notifier).state = v!,
                ),
                const Divider(indent: 56, height: 1),
                RadioListTile<ThemeMode>(
                  title: const Text('Dark Mode'),
                  secondary: const Icon(Icons.dark_mode_rounded),
                  value: ThemeMode.dark,
                  groupValue: themeMode,
                  onChanged: (v) =>
                      ref.read(themeModeProvider.notifier).state = v!,
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          const _SectionHeader('About'),
          Card(
            child: Column(
              children: [
                ListTile(
                  leading: const Icon(Icons.info_outline_rounded),
                  title: const Text('Version'),
                  trailing: const Text('1.0.0',
                      style: TextStyle(color: Colors.grey)),
                ),
                const Divider(indent: 56, height: 1),
                ListTile(
                  leading: const Icon(Icons.business_rounded),
                  title: const Text('SAP Service'),
                  trailing: const Text('ZPM_MAINTENANCE_SRV_093',
                      style: TextStyle(color: Colors.grey, fontSize: 11)),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8, left: 4),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
          color: Colors.grey.shade600,
        ),
      ),
    );
  }
}
