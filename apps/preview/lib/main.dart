import 'package:flutter/material.dart';
import 'package:kola_flutter/kola_flutter.dart';

void main() => runApp(const PreviewApp());

/// Vitrine Kola UI. Les options viennent de l'adresse, par exemple :
/// ?variant=outline&color=9A3324&dark=1&loading=1&icon=1&label=Payer
class PreviewApp extends StatelessWidget {
  const PreviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    final p = Uri.base.queryParameters;
    final primary = _hexColor(p['color']) ?? KolaColors.accent;
    final variant = KolaButtonVariant.values.firstWhere(
      (v) => v.name == p['variant'],
      orElse: () => KolaButtonVariant.primary,
    );

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: KolaTheme.light(primary: primary),
      darkTheme: KolaTheme.dark(primary: primary),
      themeMode: p['dark'] == '1' ? ThemeMode.dark : ThemeMode.light,
      home: Scaffold(
        body: Center(
          child: KolaButton(
            label: p['label'] ?? 'Valider',
            variant: variant,
            loading: p['loading'] == '1',
            icon: p['icon'] == '1' ? Icons.check : null,
            onPressed: () {},
          ),
        ),
      ),
    );
  }

  static Color? _hexColor(String? hex) {
    if (hex == null || hex.length != 6) return null;
    final value = int.tryParse(hex, radix: 16);
    return value == null ? null : Color(0xFF000000 | value);
  }
}
