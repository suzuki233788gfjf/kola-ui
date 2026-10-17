import 'package:flutter/material.dart';
import 'package:kola_flutter/kola_flutter.dart';

void main() => runApp(const PreviewApp());

/// Vitrine Kola UI. Le composant et ses options viennent de l'adresse, par exemple :
///   ?c=bouton&variant=outline&color=9A3324&dark=1
///   ?c=champ-de-texte&label=E-mail&error=1
///   ?c=telephone-237   ·   ?c=montant-fcfa
class PreviewApp extends StatelessWidget {
  const PreviewApp({super.key});

  @override
  Widget build(BuildContext context) {
    final p = Uri.base.queryParameters;
    final primary = _hexColor(p['color']) ?? KolaColors.accent;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: KolaTheme.light(primary: primary),
      darkTheme: KolaTheme.dark(primary: primary),
      themeMode: p['dark'] == '1' ? ThemeMode.dark : ThemeMode.light,
      home: Scaffold(
        body: Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: _component(p),
          ),
        ),
      ),
    );
  }

  static Widget _component(Map<String, String> p) {
    final label = p['label'];
    switch (p['c']) {
      case 'champ-de-texte':
        return SizedBox(
          width: 340,
          child: KolaTextField(
            label: label ?? 'E-mail',
            hint: p['password'] == '1' ? null : 'nom@exemple.cm',
            helper: p['helper'],
            obscure: p['password'] == '1',
            prefixIcon: p['icon'] == '1'
                ? (p['password'] == '1' ? Icons.lock_outline : Icons.mail_outline)
                : null,
            errorText: p['error'] == '1' ? 'Adresse e-mail incomplète' : null,
          ),
        );
      case 'telephone-237':
        return SizedBox(
          width: 340,
          child: KolaPhoneField(
            label: label ?? 'Téléphone',
            controller: TextEditingController(
              text: KolaPhoneField.format(p['value'] ?? ''),
            ),
          ),
        );
      case 'montant-fcfa':
        final value = int.tryParse(p['value'] ?? '');
        return SizedBox(
          width: 340,
          child: KolaAmountField(
            label: label ?? 'Montant',
            controller: TextEditingController(
              text: value == null ? '' : KolaAmountField.format(value),
            ),
          ),
        );
      default:
        final variant = KolaButtonVariant.values.firstWhere(
          (v) => v.name == p['variant'],
          orElse: () => KolaButtonVariant.primary,
        );
        return KolaButton(
          label: label ?? 'Valider',
          variant: variant,
          loading: p['loading'] == '1',
          icon: p['icon'] == '1' ? Icons.check : null,
          onPressed: () {},
        );
    }
  }

  static Color? _hexColor(String? hex) {
    if (hex == null || hex.length != 6) return null;
    final value = int.tryParse(hex, radix: 16);
    return value == null ? null : Color(0xFF000000 | value);
  }
}
