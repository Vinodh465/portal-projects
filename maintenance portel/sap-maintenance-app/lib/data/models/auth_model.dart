/// Authentication / Employee model
class AuthModel {
  final String empId;
  final String name;
  final String email;
  final String plant;
  final String role;
  final String department;

  const AuthModel({
    required this.empId,
    required this.name,
    this.email = '',
    this.plant = '',
    this.role = 'Maintenance Engineer',
    this.department = '',
  });

  factory AuthModel.fromJson(Map<String, dynamic> json) {
    return AuthModel(
      empId: json['empId']?.toString() ?? '',
      name: json['name']?.toString() ?? 'Employee',
      email: json['email']?.toString() ?? '',
      plant: json['plant']?.toString() ?? '',
      role: json['role']?.toString() ?? 'Maintenance Engineer',
      department: json['department']?.toString() ?? '',
    );
  }

  Map<String, dynamic> toJson() => {
    'empId': empId,
    'name': name,
    'email': email,
    'plant': plant,
    'role': role,
    'department': department,
  };

  AuthModel copyWith({
    String? empId, String? name, String? email,
    String? plant, String? role, String? department,
  }) {
    return AuthModel(
      empId: empId ?? this.empId,
      name: name ?? this.name,
      email: email ?? this.email,
      plant: plant ?? this.plant,
      role: role ?? this.role,
      department: department ?? this.department,
    );
  }
}
