import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../data/models/plant_model.dart';
import '../../data/repositories/plant_repository.dart';
import 'auth_provider.dart';

final plantRepositoryProvider = Provider<PlantRepository>(
  (ref) => PlantRepository(ref.read(apiServiceProvider)),
);

class PlantFilter {
  final String search;
  final String id;
  const PlantFilter({this.search = '', this.id = ''});
  PlantFilter copyWith({String? search, String? id}) =>
      PlantFilter(search: search ?? this.search, id: id ?? this.id);
}

final plantFilterProvider = StateProvider<PlantFilter>((ref) => const PlantFilter());

final plantsProvider = FutureProvider<List<PlantModel>>((ref) async {
  final filter = ref.watch(plantFilterProvider);
  final repo = ref.read(plantRepositoryProvider);
  return repo.getPlants(
    id: filter.id.isEmpty ? null : filter.id,
    search: filter.search.isEmpty ? null : filter.search,
  );
});
