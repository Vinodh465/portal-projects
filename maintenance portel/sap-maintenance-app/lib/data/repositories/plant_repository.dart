import '../models/plant_model.dart';
import '../services/api_service.dart';

class PlantRepository {
  final ApiService _api;
  PlantRepository(this._api);

  Future<List<PlantModel>> getPlants({String? id, String? search}) =>
      _api.getPlants(id: id, search: search);
}
