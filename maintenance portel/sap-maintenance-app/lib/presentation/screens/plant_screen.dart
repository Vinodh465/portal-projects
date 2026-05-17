import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/plant_provider.dart';
import '../widgets/shimmer_loader.dart';
import '../widgets/search_filter_bar.dart';
import '../../core/theme/app_theme.dart';
import '../../data/models/plant_model.dart';

class PlantScreen extends ConsumerStatefulWidget {
  const PlantScreen({super.key});
  @override
  ConsumerState<PlantScreen> createState() => _PlantScreenState();
}

class _PlantScreenState extends ConsumerState<PlantScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  void _applyFilter() {
    ref.read(plantFilterProvider.notifier).state = PlantFilter(
      search: _searchCtrl.text.trim(),
    );
  }

  void _clearFilter() {
    _searchCtrl.clear();
    ref.read(plantFilterProvider.notifier).state = const PlantFilter();
  }

  @override
  Widget build(BuildContext context) {
    final plants = ref.watch(plantsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Plants'),
        backgroundColor: AppTheme.sapPurple,
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(plantsProvider),
          ),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Theme.of(context).cardColor,
            padding: const EdgeInsets.all(16),
            child: SearchFilterBar(
              searchController: _searchCtrl,
              searchHint: 'Search plants...',
              onSearch: _applyFilter,
              onClear: _clearFilter,
            ),
          ),
          Expanded(
            child: plants.when(
              loading: () => const ShimmerLoader(count: 6, height: 120),
              error: (err, _) => Center(
                child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
                  Icon(Icons.cloud_off_rounded, size: 60, color: Colors.grey.shade400),
                  const SizedBox(height: 16),
                  const Text('Failed to load plants'),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: () => ref.invalidate(plantsProvider),
                    icon: const Icon(Icons.refresh_rounded),
                    label: const Text('Retry'),
                  ),
                ]),
              ),
              data: (list) => list.isEmpty
                  ? const Center(child: Text('No plants found'))
                  : RefreshIndicator(
                      onRefresh: () async => ref.invalidate(plantsProvider),
                      child: ListView.separated(
                        padding: const EdgeInsets.all(16),
                        itemCount: list.length,
                        separatorBuilder: (_, __) => const SizedBox(height: 12),
                        itemBuilder: (_, i) => _PlantCard(plant: list[i]),
                      ),
                    ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PlantCard extends StatelessWidget {
  final PlantModel plant;
  const _PlantCard({required this.plant});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    gradient: AppTheme.heroGradient,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Center(
                    child: Text(
                      plant.plantId.isEmpty ? '?' : plant.plantId.substring(0, 1),
                      style: const TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        plant.plantName.isEmpty ? 'Unknown Plant' : plant.plantName,
                        style: const TextStyle(fontWeight: FontWeight.w700, fontSize: 15),
                      ),
                      Text('Plant ID: ${plant.plantId}',
                          style: TextStyle(fontSize: 12, color: Colors.grey.shade600)),
                    ],
                  ),
                ),
              ],
            ),
            if (plant.fullAddress.isNotEmpty) ...[
              const SizedBox(height: 12),
              const Divider(height: 1),
              const SizedBox(height: 12),
              Row(
                children: [
                  const Icon(Icons.location_on_rounded, size: 16, color: Colors.grey),
                  const SizedBox(width: 6),
                  Expanded(
                    child: Text(plant.fullAddress,
                        style: const TextStyle(fontSize: 12, color: Colors.grey)),
                  ),
                ],
              ),
            ],
            if (plant.phone.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.phone_rounded, size: 16, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text(plant.phone,
                      style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
            if (plant.language.isNotEmpty) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.language_rounded, size: 16, color: Colors.grey),
                  const SizedBox(width: 6),
                  Text('Language: ${plant.language}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ],
          ],
        ),
      ),
    );
  }
}
