import 'package:flutter/material.dart';

/// SAP Fiori-inspired Material 3 Theme
class AppTheme {
  AppTheme._();

  // ─── Brand Colors ───────────────────────────────────────────────────────────
  static const Color sapBlue = Color(0xFF0A6ED1);
  static const Color sapDarkBlue = Color(0xFF063970);
  static const Color sapLightBlue = Color(0xFF5BA4D4);
  static const Color sapTeal = Color(0xFF0FAAAA);
  static const Color sapGreen = Color(0xFF107E3E);
  static const Color sapRed = Color(0xFFBB0000);
  static const Color sapOrange = Color(0xFFE9730C);
  static const Color sapYellow = Color(0xFFE8A000);
  static const Color sapPurple = Color(0xFF6A2C8E);

  // ─── Neutrals ────────────────────────────────────────────────────────────────
  static const Color backgroundLight = Color(0xFFF5F7FA);
  static const Color backgroundDark = Color(0xFF0D1117);
  static const Color surfaceLight = Color(0xFFFFFFFF);
  static const Color surfaceDark = Color(0xFF161B22);
  static const Color cardDark = Color(0xFF1E2530);
  static const Color dividerLight = Color(0xFFE4E8EE);
  static const Color dividerDark = Color(0xFF30363D);

  // ─── Priority Colors ─────────────────────────────────────────────────────────
  static const Color priorityHigh = Color(0xFFBB0000);
  static const Color priorityMedium = Color(0xFFE9730C);
  static const Color priorityLow = Color(0xFF107E3E);

  // ─── Gradient Presets ────────────────────────────────────────────────────────
  static const LinearGradient heroGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0A6ED1), Color(0xFF063970)],
  );

  static const LinearGradient tealGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF0FAAAA), Color(0xFF063970)],
  );

  static const LinearGradient successGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFF107E3E), Color(0xFF0B5D2C)],
  );

  static const LinearGradient warningGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFE9730C), Color(0xFFC25A00)],
  );

  static const LinearGradient dangerGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [Color(0xFFBB0000), Color(0xFF8C0000)],
  );

  // ─── Light Theme ─────────────────────────────────────────────────────────────
  static ThemeData get lightTheme {
    final base = ColorScheme.fromSeed(
      seedColor: sapBlue,
      brightness: Brightness.light,
      primary: sapBlue,
      secondary: sapTeal,
      error: sapRed,
      surface: surfaceLight,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: base,
      scaffoldBackgroundColor: backgroundLight,
      fontFamily: 'Inter',
      appBarTheme: AppBarTheme(
        backgroundColor: sapBlue,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        color: surfaceLight,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: Colors.white,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dividerLight),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dividerLight),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: sapBlue, width: 2),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: sapRed),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: sapBlue,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
            fontFamily: 'Inter',
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceLight,
        selectedItemColor: sapBlue,
        unselectedItemColor: Color(0xFF8F9BB3),
        elevation: 8,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, fontSize: 11),
        unselectedLabelStyle: TextStyle(fontFamily: 'Inter', fontSize: 11),
      ),
      chipTheme: ChipThemeData(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
        side: BorderSide.none,
      ),
      dividerTheme: const DividerThemeData(color: dividerLight, thickness: 1),
    );
  }

  // ─── Dark Theme ──────────────────────────────────────────────────────────────
  static ThemeData get darkTheme {
    final base = ColorScheme.fromSeed(
      seedColor: sapBlue,
      brightness: Brightness.dark,
      primary: sapLightBlue,
      secondary: sapTeal,
      error: const Color(0xFFCF6679),
      surface: surfaceDark,
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: base,
      scaffoldBackgroundColor: backgroundDark,
      fontFamily: 'Inter',
      appBarTheme: AppBarTheme(
        backgroundColor: surfaceDark,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: false,
        titleTextStyle: const TextStyle(
          fontFamily: 'Inter',
          fontSize: 18,
          fontWeight: FontWeight.w600,
          color: Colors.white,
        ),
      ),
      cardTheme: CardThemeData(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(16),
          side: const BorderSide(color: dividerDark),
        ),
        color: cardDark,
        surfaceTintColor: Colors.transparent,
      ),
      inputDecorationTheme: InputDecorationTheme(
        filled: true,
        fillColor: cardDark,
        contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dividerDark),
        ),
        enabledBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: dividerDark),
        ),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: sapLightBlue, width: 2),
        ),
      ),
      elevatedButtonTheme: ElevatedButtonThemeData(
        style: ElevatedButton.styleFrom(
          backgroundColor: sapBlue,
          foregroundColor: Colors.white,
          elevation: 0,
          padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          textStyle: const TextStyle(
            fontFamily: 'Inter',
            fontWeight: FontWeight.w600,
            fontSize: 15,
          ),
        ),
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: surfaceDark,
        selectedItemColor: sapLightBlue,
        unselectedItemColor: Color(0xFF6E7680),
        elevation: 0,
        type: BottomNavigationBarType.fixed,
        selectedLabelStyle: TextStyle(fontFamily: 'Inter', fontWeight: FontWeight.w600, fontSize: 11),
        unselectedLabelStyle: TextStyle(fontFamily: 'Inter', fontSize: 11),
      ),
      dividerTheme: const DividerThemeData(color: dividerDark, thickness: 1),
    );
  }
}

/// Priority color helper
Color priorityColor(String priority) {
  switch (priority.trim()) {
    case '1':
    case 'High':
    case 'HOCH':
      return AppTheme.priorityHigh;
    case '2':
    case 'Medium':
    case 'MITTEL':
      return AppTheme.priorityMedium;
    case '3':
    case 'Low':
    case 'NIEDRIG':
      return AppTheme.priorityLow;
    default:
      return AppTheme.sapBlue;
  }
}

/// Priority label helper
String priorityLabel(String priority) {
  switch (priority.trim()) {
    case '1': return 'High';
    case '2': return 'Medium';
    case '3': return 'Low';
    default: return priority.isEmpty ? 'N/A' : priority;
  }
}
