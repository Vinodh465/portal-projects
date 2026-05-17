/// Plant model
class PlantModel {
  final String plantId;
  final String plantName;
  final String city;
  final String country;
  final String region;
  final String postalCode;
  final String street;
  final String phone;
  final String language;
  final String companyCode;

  const PlantModel({
    required this.plantId,
    this.plantName = '',
    this.city = '',
    this.country = '',
    this.region = '',
    this.postalCode = '',
    this.street = '',
    this.phone = '',
    this.language = '',
    this.companyCode = '',
  });

  factory PlantModel.fromJson(Map<String, dynamic> json) {
    return PlantModel(
      plantId: json['plantId']?.toString() ?? '',
      plantName: json['plantName']?.toString() ?? '',
      city: json['city']?.toString() ?? '',
      country: json['country']?.toString() ?? '',
      region: json['region']?.toString() ?? '',
      postalCode: json['postalCode']?.toString() ?? '',
      street: json['street']?.toString() ?? '',
      phone: json['phone']?.toString() ?? '',
      language: json['language']?.toString() ?? '',
      companyCode: json['companyCode']?.toString() ?? '',
    );
  }

  String get fullAddress {
    final parts = [street, city, region, country, postalCode]
        .where((s) => s.isNotEmpty)
        .toList();
    return parts.join(', ');
  }
}
