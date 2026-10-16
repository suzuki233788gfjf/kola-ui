import 'package:flutter/material.dart';

/// Couleurs Kola UI — identiques aux variables du fichier Figma.
class KolaColors {
  static const accent = Color(0xFF1F6B45);
  static const accentTint = Color(0xFFE7F1EB);
  static const danger = Color(0xFF9A3324);
  static const ink = Color(0xFF1A1712);
  static const inkMuted = Color(0xFF4F4A42);
  static const inkSubtle = Color(0xFF6B655B);
  static const bg = Color(0xFFFAFAF8);
  static const surface = Color(0xFFFFFFFF);
  static const surfaceMuted = Color(0xFFF4F3EF);
  static const border = Color(0xFFE6E3DC);
  static const borderStrong = Color(0xFFD9D5CC);
}

/// Thème Kola UI. Change `primary` pour adapter toute la bibliothèque à ta marque.
class KolaTheme {
  static const double radius = 12;
  static const double spacing = 8;

  static ThemeData light({Color primary = KolaColors.accent}) =>
      _build(Brightness.light, primary);

  static ThemeData dark({Color primary = KolaColors.accent}) =>
      _build(Brightness.dark, primary);

  static ThemeData _build(Brightness brightness, Color primary) {
    final isDark = brightness == Brightness.dark;
    final scheme = ColorScheme.fromSeed(
      seedColor: primary,
      brightness: brightness,
    ).copyWith(
      primary: primary,
      error: KolaColors.danger,
      surface: isDark ? const Color(0xFF1A1712) : KolaColors.surface,
      onSurface: isDark ? const Color(0xFFF3F1EC) : KolaColors.ink,
      outline: isDark ? const Color(0xFF3A352D) : KolaColors.borderStrong,
    );
    final shape = RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(radius),
    );

    return ThemeData(
      useMaterial3: true,
      colorScheme: scheme,
      scaffoldBackgroundColor: isDark ? const Color(0xFF12100C) : KolaColors.bg,
      inputDecorationTheme: InputDecorationTheme(
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(radius),
        ),
      ),
      filledButtonTheme: FilledButtonThemeData(
        style: FilledButton.styleFrom(
          shape: shape,
          minimumSize: const Size(0, 48),
        ),
      ),
      outlinedButtonTheme: OutlinedButtonThemeData(
        style: OutlinedButton.styleFrom(
          shape: shape,
          minimumSize: const Size(0, 48),
        ),
      ),
    );
  }
}
