import 'dart:js_interop';
import 'dart:js_interop_unsafe';

import 'package:flutter/material.dart';
import 'package:kola_flutter/kola_flutter.dart';

void main() => runApp(const PreviewApp());

/// Aperçu instantané : le site envoie « kola?c=…&… » par postMessage,
/// la vitrine se reconstruit sans recharger la page.
/// Au démarrage, elle prévient le site avec « kola-ready ».
class _Bridge {
  static String get _origin =>
      ((globalContext['location'] as JSObject)['origin'] as JSString).toDart;

  static void listen(void Function(Map<String, String>) onParams) {
    void onMessage(JSObject event) {
      final origin = (event['origin'] as JSString?)?.toDart;
      if (origin != _origin) return;
      final data = event['data'].dartify();
      if (data is String && data.startsWith('kola?')) {
        onParams(Uri.splitQueryString(data.substring(5)));
      }
    }

    globalContext.callMethod('addEventListener'.toJS, 'message'.toJS, onMessage.toJS);
  }

  static void ready() {
    final parent = globalContext['parent'] as JSObject?;
    parent?.callMethod('postMessage'.toJS, 'kola-ready'.toJS, _origin.toJS);
  }
}

/// Vitrine Kola UI. Le composant et ses options viennent de l'adresse, par exemple :
///   ?c=bouton&variant=outline&color=9A3324&dark=1
///   ?c=champ-de-texte&label=E-mail&error=1
///   ?c=telephone-237   ·   ?c=montant-fcfa   ·   ?c=mobile-money&amount=5000
///   ?c=date-picker&range=1   ·   ?c=confirmation&sheet=1   ·   ?c=notifications&type=error
///   ?c=selecteur   ·   ?c=carte&variant=stat   ·   ?c=tableau&mobile=1
class PreviewApp extends StatefulWidget {
  const PreviewApp({super.key});

  @override
  State<PreviewApp> createState() => _PreviewAppState();
}

class _PreviewAppState extends State<PreviewApp> {
  Map<String, String> _p = Uri.base.queryParameters;

  @override
  void initState() {
    super.initState();
    _Bridge.listen((p) => setState(() => _p = p));
    WidgetsBinding.instance.addPostFrameCallback((_) => _Bridge.ready());
  }

  @override
  Widget build(BuildContext context) {
    final p = _p;
    final primary = _parseHex(p['color']) ?? KolaColors.accent;

    return MaterialApp(
      debugShowCheckedModeBanner: false,
      theme: KolaTheme.light(primary: primary),
      darkTheme: KolaTheme.dark(primary: primary),
      themeMode: p['dark'] == '1' ? ThemeMode.dark : ThemeMode.light,
      home: Scaffold(
        body: Center(
          child: SingleChildScrollView(
            padding: const EdgeInsets.all(24),
            // Nouvelle clé à chaque changement d'option : le composant repart de zéro,
            // comme avant, mais sans recharger Flutter.
            child: KeyedSubtree(
              key: ValueKey(Uri(queryParameters: p).query),
              child: _buildComponent(p),
            ),
          ),
        ),
      ),
    );
  }
}

Widget _buildComponent(Map<String, String> p) {
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
    case 'selecteur':
      return SizedBox(width: 340, child: _CitySelect(label: label ?? 'Ville'));
    case 'carte':
      if (p['variant'] == 'stat') {
        return SizedBox(
          width: 300,
          child: KolaStatCard(
            label: label ?? 'Ventes du jour',
            value: p['value'] ?? '125 000 FCFA',
            change: double.tryParse(p['change'] ?? '12.5'),
            icon: Icons.payments_outlined,
          ),
        );
      }
      return SizedBox(
        width: 280,
        child: KolaCard(
          media: const Center(child: Icon(Icons.shopping_basket_outlined, size: 48)),
          badge: p['badge'],
          title: label ?? 'Riz parfumé 5 kg',
          subtitle: p['subtitle'] ?? 'Épicerie · En stock',
          footer: Text(p['footer'] ?? '4 500 FCFA'),
          onTap: () {},
        ),
      );
    case 'tableau':
      return SizedBox(
        width: p['mobile'] == '1' ? 360 : 640,
        child: KolaDataTable<_Product>(
          rowsPerPage: int.tryParse(p['rows'] ?? '') ?? 5,
          rows: _products,
          columns: [
            KolaColumn(label: 'Produit', cell: (r) => r.name, sortBy: (r) => r.name, flex: 2),
            KolaColumn(label: 'Stock', cell: (r) => '${r.stock}', sortBy: (r) => r.stock, numeric: true),
            KolaColumn(
              label: 'Prix',
              cell: (r) => '${KolaAmountField.format(r.price)} FCFA',
              sortBy: (r) => r.price,
              numeric: true,
              flex: 2,
            ),
          ],
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

Color? _parseHex(String? hex) {
  if (hex == null || hex.length != 6) return null;
  final value = int.tryParse(hex, radix: 16);
  return value == null ? null : Color(0xFF000000 | value);
}

class _CitySelect extends StatefulWidget {
  const _CitySelect({required this.label});
  final String label;

  @override
  State<_CitySelect> createState() => _CitySelectState();
}

class _CitySelectState extends State<_CitySelect> {
  String? _city;

  static const _cities = [
    KolaSelectOption('dla', 'Douala', subtitle: 'Littoral'),
    KolaSelectOption('yde', 'Yaoundé', subtitle: 'Centre'),
    KolaSelectOption('bfm', 'Bafoussam', subtitle: 'Ouest'),
    KolaSelectOption('bda', 'Bamenda', subtitle: 'Nord-Ouest'),
    KolaSelectOption('grg', 'Garoua', subtitle: 'Nord'),
    KolaSelectOption('mrw', 'Maroua', subtitle: 'Extrême-Nord'),
    KolaSelectOption('ngd', 'Ngaoundéré', subtitle: 'Adamaoua'),
    KolaSelectOption('btr', 'Bertoua', subtitle: 'Est'),
    KolaSelectOption('ebw', 'Ebolowa', subtitle: 'Sud'),
    KolaSelectOption('bea', 'Buea', subtitle: 'Sud-Ouest'),
    KolaSelectOption('kri', 'Kribi', subtitle: 'Sud'),
    KolaSelectOption('lmb', 'Limbé', subtitle: 'Sud-Ouest'),
  ];

  @override
  Widget build(BuildContext context) => KolaSelect<String>(
        label: widget.label,
        value: _city,
        options: _cities,
        onChanged: (v) => setState(() => _city = v),
      );
}

class _Product {
  const _Product(this.name, this.stock, this.price);
  final String name;
  final int stock;
  final int price;
}

const _products = [
  _Product('Riz parfumé 5 kg', 7, 4500),
  _Product('Huile 1 L', 42, 1600),
  _Product('Sucre 1 kg', 18, 900),
  _Product('Lait en poudre 400 g', 12, 2800),
  _Product('Savon de ménage', 64, 350),
  _Product('Farine 1 kg', 25, 700),
  _Product('Tomate concentrée', 80, 250),
  _Product('Spaghetti 500 g', 33, 450),
];
