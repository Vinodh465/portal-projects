import 'package:intl/intl.dart';

/// Utility functions used across the app
class AppUtils {
  AppUtils._();

  /// Format SAP date string (YYYYMMDD) to readable format
  static String formatSapDate(String? sapDate) {
    if (sapDate == null || sapDate.isEmpty || sapDate == '00000000') return 'N/A';
    try {
      // Handle /Date(timestamp)/ format
      if (sapDate.contains('/Date(')) {
        final ms = int.parse(
          sapDate.replaceAll(RegExp(r'[^0-9]'), ''),
        );
        final date = DateTime.fromMillisecondsSinceEpoch(ms);
        return DateFormat('dd MMM yyyy').format(date);
      }
      // Handle YYYYMMDD format
      if (sapDate.length == 8) {
        final date = DateFormat('yyyyMMdd').parse(sapDate);
        return DateFormat('dd MMM yyyy').format(date);
      }
      return sapDate;
    } catch (_) {
      return sapDate;
    }
  }

  /// Zero-pad employee ID to 8 digits
  static String padEmpId(String empId) {
    return empId.padLeft(8, '0');
  }

  /// Get relative time label
  static String timeAgo(String? dateStr) {
    if (dateStr == null || dateStr.isEmpty) return '';
    try {
      final date = DateFormat('yyyyMMdd').parse(dateStr);
      final diff = DateTime.now().difference(date);
      if (diff.inDays > 30) return '${(diff.inDays / 30).floor()}mo ago';
      if (diff.inDays > 0) return '${diff.inDays}d ago';
      if (diff.inHours > 0) return '${diff.inHours}h ago';
      return 'Just now';
    } catch (_) {
      return '';
    }
  }
}
