import 'package:flutter/material.dart';
import 'package:kola_flutter/kola_flutter.dart';

void main() => runApp(const PreviewApp());

/// Vitrine Kola UI. Le composant et ses options viennent de l'adresse, par exemple :
///   ?c=bouton&variant=outline&color=9A3324&dark=1
///   ?c=champ-de-texte&label=E-mail&error=1
///   ?c=telephone-237   ·   ?c=montant-fcfa   ·   ?c=mobile-money&amount=5000
///   ?c=date-picker&range=1   ·   ?c=confirmation&sheet=1   ·   ?c=notifications&type=error
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
          child: SingleChildScrollView(
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
      case 'date-picker':
        return Builder(
          builder: (context) => Container(
            width: 360,
            decoration: BoxDecoration(
              color: Theme.of(context).colorScheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: Theme.of(context).colorScheme.outlineVariant),
            ),
            child: KolaCalendar(
              range: p['range'] != '0',
              onConfirm: (r) => KolaToast.show(
                context,
                KolaDateFr.range(r.start, r.end),
                title: 'Sélection validée',
                type: KolaToastType.success,
              ),
            ),
          ),
        );
      case 'confirmation':
        return Builder(
          builder: (context) => KolaButton(
            label: p['button'] ?? 'Supprimer l\'article',
            variant: p['destructive'] == '1'
                ? KolaButtonVariant.outline
                : KolaButtonVariant.primary,
            onPressed: () async {
              final ok = await KolaConfirm.show(
                context,
                title: label ?? 'Supprimer cet article ?',
                message: p['message'] ?? 'Cette action est définitive.',
                confirmLabel: p['confirm'] ?? 'Supprimer',
                destructive: p['destructive'] == '1',
                sheet: p['sheet'] == '1',
              );
              if (!context.mounted) return;
              KolaToast.show(
                context,
                ok ? 'Tu as confirmé.' : 'Tu as annulé.',
                type: ok ? KolaToastType.success : KolaToastType.info,
              );
            },
          ),
        );
      case 'notifications':
        final type = KolaToastType.values.firstWhere(
          (t) => t.name == p['type'],
          orElse: () => KolaToastType.success,
        );
        final title = p['title'];
        final message = p['message'] ?? 'Paiement reçu : 25 000 FCFA';
        return Builder(
          builder: (context) => SizedBox(
            width: 380,
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                KolaToastView(message: message, title: title, type: type),
                const SizedBox(height: 24),
                KolaButton(
                  label: 'Afficher en vrai',
                  variant: KolaButtonVariant.secondary,
                  onPressed: () => KolaToast.show(context, message, title: title, type: type),
                ),
              ],
            ),
          ),
        );
      case 'mobile-money':
        return SizedBox(
          width: 380,
          child: KolaMobileMoneyForm(
            title: p['title'] ?? 'Payer par Mobile Money',
            amount: int.tryParse(p['amount'] ?? ''),
            onPay: (demande) async {
              // Simulation : 3 secondes d'attente, échec si le numéro finit par 0.
              await Future<void>.delayed(const Duration(seconds: 3));
              if (demande.phone.endsWith('0')) {
                throw const KolaMobileMoneyException('Solde insuffisant (simulation)');
              }
            },
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
