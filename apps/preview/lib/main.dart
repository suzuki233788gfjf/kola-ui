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
///   ?c=telephone-237   ·   ?c=montant-fcfa   ·   ?c=code-otp&length=4   ·   ?c=mobile-money&amount=5000
///   ?c=date-picker&range=1   ·   ?c=confirmation&sheet=1   ·   ?c=notifications&type=error
///   ?c=onglets&variant=pills   ·   ?c=onglets&nav=bottom
///   ?c=recherche   ·   ?c=televersement   ·   ?c=etats-vides&error=1
///   Blocs : ?c=connexion-telephone · ?c=paiement-commande · ?c=tableau-de-bord · ?c=liste-recherche
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
    case 'code-otp':
      return SizedBox(width: 360, child: _OtpDemo(p: p));
    case 'onglets':
      return SizedBox(width: p['nav'] == 'bottom' ? 360 : 420, child: _TabsDemo(p: p));
    case 'recherche':
      return SizedBox(width: 360, child: _SearchDemo(p: p));
    case 'televersement':
      return SizedBox(width: 400, child: _UploadDemo(p: p));
    case 'etats-vides':
      return _StatesDemo(p: p);
    case 'connexion-telephone':
      return KolaPhoneLogin(
        onSendCode: (_) => Future<void>.delayed(const Duration(milliseconds: 800)),
        onVerify: (_, code) async {
          await Future<void>.delayed(const Duration(milliseconds: 800));
          return code == '123456';
        },
      );
    case 'paiement-commande':
      return KolaCheckout(
        items: const [
          KolaCartItem(name: 'Riz parfumé 5 kg', price: 4500),
          KolaCartItem(name: 'Huile 1 L', price: 1600, quantity: 2),
          KolaCartItem(name: 'Savon de ménage', price: 350, quantity: 3),
        ],
        delivery: 1000,
        onPay: (demande) async {
          // Simulation : 3 secondes d'attente, échec si le numéro finit par 0.
          await Future<void>.delayed(const Duration(seconds: 3));
          if (demande.phone.endsWith('0')) {
            throw const KolaMobileMoneyException('Solde insuffisant (simulation)');
          }
        },
      );
    case 'tableau-de-bord':
      return const KolaDashboard(
        name: 'Awa',
        stats: [
          KolaStat(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5, icon: Icons.payments_outlined),
          KolaStat(label: 'Commandes', value: '18', change: 5, icon: Icons.receipt_long_outlined),
          KolaStat(label: 'Panier moyen', value: '6 950 FCFA', change: -3.2, icon: Icons.shopping_basket_outlined),
        ],
        orders: [
          KolaOrder(id: '#1042', customer: 'Awa Ngono', total: 6100, status: KolaOrderStatus.pending),
          KolaOrder(id: '#1041', customer: 'Paul Etoa', total: 2100, status: KolaOrderStatus.pending),
          KolaOrder(id: '#1040', customer: 'Brice Mbarga', total: 12500, status: KolaOrderStatus.pending),
          KolaOrder(id: '#1039', customer: 'Chantal Abena', total: 2800, status: KolaOrderStatus.delivered),
          KolaOrder(id: '#1037', customer: 'Serge Tchoua', total: 4500, status: KolaOrderStatus.delivered),
          KolaOrder(id: '#1035', customer: 'Mireille Fouda', total: 1800, status: KolaOrderStatus.delivered),
        ],
      );
    case 'liste-recherche':
      return const _ProductListDemo();
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

/// Démo du code OTP : affiche le code saisi quand toutes les cases sont remplies.
class _OtpDemo extends StatefulWidget {
  const _OtpDemo({required this.p});
  final Map<String, String> p;

  @override
  State<_OtpDemo> createState() => _OtpDemoState();
}

class _OtpDemoState extends State<_OtpDemo> {
  String? _done;

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        KolaOtpField(
          label: p['label'] ?? 'Code de vérification',
          length: p['length'] == '4' ? 4 : 6,
          helper: 'Envoyé par SMS au 6 77 12 34 56',
          errorText: p['error'] == '1' ? 'Code incorrect. Il te reste 2 essais.' : null,
          onChanged: (_) => setState(() => _done = null),
          onCompleted: (code) => setState(() => _done = code),
          onResend: p['resend'] == '0' ? null : () async {},
        ),
        const SizedBox(height: 16),
        SizedBox(
          height: 20,
          child: _done == null
              ? null
              : Text(
                  '✓ Code $_done saisi',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    color: Theme.of(context).colorScheme.primary,
                  ),
                ),
        ),
      ],
    );
  }
}

/// Démo des onglets : commandes en haut, ou barre du bas d'une app.
class _TabsDemo extends StatefulWidget {
  const _TabsDemo({required this.p});
  final Map<String, String> p;

  @override
  State<_TabsDemo> createState() => _TabsDemoState();
}

class _TabsDemoState extends State<_TabsDemo> {
  int _selected = 0;

  static const _orders = [
    [('#1042', 'Riz parfumé 5 kg + huile 1 L', '6 100 FCFA'), ('#1041', 'Savon de ménage × 6', '2 100 FCFA'), ('#1039', 'Lait en poudre 400 g', '2 800 FCFA')],
    [('#1035', 'Sucre 1 kg × 2', '1 800 FCFA')],
    <(String, String, String)>[],
  ];

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final badges = p['badges'] != '0';

    if (p['nav'] == 'bottom') {
      const titles = ['Accueil', 'Commandes', 'Paiements', 'Profil'];
      return Container(
        height: 300,
        clipBehavior: Clip.antiAlias,
        decoration: BoxDecoration(
          color: theme.scaffoldBackgroundColor,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: Column(
          children: [
            Expanded(child: Center(child: Text(titles[_selected], style: theme.textTheme.titleMedium))),
            KolaBottomNav(
              items: [
                const KolaTabItem(label: 'Accueil', icon: Icons.home_outlined),
                KolaTabItem(label: 'Commandes', icon: Icons.receipt_long_outlined, badge: badges ? 2 : null),
                const KolaTabItem(label: 'Paiements', icon: Icons.account_balance_wallet_outlined),
                const KolaTabItem(label: 'Profil', icon: Icons.person_outline),
              ],
              selected: _selected,
              onChanged: (i) => setState(() => _selected = i),
            ),
          ],
        ),
      );
    }

    final icons = p['icons'] == '1';
    final rows = _orders[_selected];
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        KolaTabs(
          variant: p['variant'] == 'pills' ? KolaTabsVariant.pills : KolaTabsVariant.underline,
          expand: p['expand'] == '1',
          items: [
            KolaTabItem(label: 'En cours', icon: icons ? Icons.schedule : null, badge: badges ? 3 : null),
            KolaTabItem(label: 'Livrées', icon: icons ? Icons.check_circle_outline : null),
            KolaTabItem(label: 'Annulées', icon: icons ? Icons.cancel_outlined : null),
          ],
          selected: _selected,
          onChanged: (i) => setState(() => _selected = i),
        ),
        const SizedBox(height: 16),
        if (rows.isEmpty)
          Padding(
            padding: const EdgeInsets.symmetric(vertical: 24),
            child: Center(
              child: Text('Aucune commande annulée.', style: TextStyle(color: scheme.onSurfaceVariant)),
            ),
          )
        else
          Container(
            decoration: BoxDecoration(
              color: scheme.surface,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Column(
              children: [
                for (final (n, what, price) in rows)
                  ListTile(
                    dense: true,
                    title: Text.rich(TextSpan(children: [
                      TextSpan(text: '$n  ', style: TextStyle(color: scheme.onSurfaceVariant)),
                      TextSpan(text: what),
                    ])),
                    trailing: Text(price, style: const TextStyle(fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
          ),
      ],
    );
  }
}

/// Démo de la recherche : affiche la ville choisie ou la recherche lancée.
class _SearchDemo extends StatefulWidget {
  const _SearchDemo({required this.p});
  final Map<String, String> p;

  @override
  State<_SearchDemo> createState() => _SearchDemoState();
}

class _SearchDemoState extends State<_SearchDemo> {
  String _result = '';

  static const _villes = [
    KolaSearchOption('Douala', subtitle: 'Littoral'),
    KolaSearchOption('Yaoundé', subtitle: 'Centre'),
    KolaSearchOption('Bafoussam', subtitle: 'Ouest'),
    KolaSearchOption('Bamenda', subtitle: 'Nord-Ouest'),
    KolaSearchOption('Garoua', subtitle: 'Nord'),
    KolaSearchOption('Maroua', subtitle: 'Extrême-Nord'),
    KolaSearchOption('Ngaoundéré', subtitle: 'Adamaoua'),
    KolaSearchOption('Bertoua', subtitle: 'Est'),
    KolaSearchOption('Ebolowa', subtitle: 'Sud'),
    KolaSearchOption('Buea', subtitle: 'Sud-Ouest'),
    KolaSearchOption('Kribi', subtitle: 'Sud'),
    KolaSearchOption('Limbé', subtitle: 'Sud-Ouest'),
  ];

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    return Padding(
      padding: const EdgeInsets.only(bottom: 220),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          KolaSearchField(
            label: p['showLabel'] == '0' ? null : (p['label'] ?? 'Ville'),
            hint: p['placeholder'] ?? 'Rechercher une ville',
            options: _villes,
            onChanged: (_) => setState(() => _result = ''),
            onSelected: (o) => setState(() => _result = 'Ville choisie : ${o.label} (${o.subtitle})'),
            onSubmitted: (t) => setState(() => _result = t.trim().isEmpty ? '' : 'Recherche lancée : « ${t.trim()} »'),
          ),
          const SizedBox(height: 12),
          SizedBox(
            height: 20,
            child: Text(
              _result,
              style: TextStyle(fontWeight: FontWeight.w600, color: Theme.of(context).colorScheme.primary),
            ),
          ),
        ],
      ),
    );
  }
}

/// Démo du téléversement : faux fichiers (Flutter web n'a pas de sélecteur sans paquet).
class _UploadDemo extends StatefulWidget {
  const _UploadDemo({required this.p});
  final Map<String, String> p;

  @override
  State<_UploadDemo> createState() => _UploadDemoState();
}

class _UploadDemoState extends State<_UploadDemo> {
  int _pick = 0;

  static const _lots = [
    [KolaFile(name: 'cni-recto.jpg', size: 1258291), KolaFile(name: 'releve-bancaire.pdf', size: 6710886)],
    [KolaFile(name: 'recu-paiement.png', size: 491520), KolaFile(name: 'contrat.docx', size: 122880)],
    [KolaFile(name: 'cni-verso.jpg', size: 1153434)],
  ];

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    return KolaFileUpload(
      label: p['label'] ?? 'Pièce d\'identité',
      multiple: p['multiple'] != '0',
      helper: 'Démo : des fichiers d\'exemple sont ajoutés · JPG, PNG ou PDF · 5 Mo max',
      onPick: () async => _lots[_pick++ % _lots.length],
      onUpload: p['upload'] == '0'
          ? null
          : (file, progress) async {
              for (var i = 1; i <= 10; i++) {
                await Future<void>.delayed(const Duration(milliseconds: 150));
                progress(i / 10);
              }
            },
    );
  }
}

/// Démo des états : vide, erreur (avec « Réessayer ») ou chargement.
class _StatesDemo extends StatefulWidget {
  const _StatesDemo({required this.p});
  final Map<String, String> p;

  @override
  State<_StatesDemo> createState() => _StatesDemoState();
}

class _StatesDemoState extends State<_StatesDemo> {
  bool _retrying = false;

  Future<void> _retry() async {
    setState(() => _retrying = true);
    await Future<void>.delayed(const Duration(milliseconds: 1500));
    if (mounted) setState(() => _retrying = false);
  }

  @override
  Widget build(BuildContext context) {
    final p = widget.p;
    final scheme = Theme.of(context).colorScheme;
    final action = p['action'] != '0';
    final Widget child;
    if (p['loading'] == '1' || _retrying) {
      child = const KolaSkeletonList(rows: 4);
    } else if (p['error'] == '1') {
      child = KolaEmptyState(
        tone: KolaEmptyTone.error,
        icon: Icons.wifi_off,
        title: 'Pas de connexion',
        message: 'Vérifie ta connexion internet puis réessaie.',
        action: action ? KolaButton(label: 'Réessayer', variant: KolaButtonVariant.outline, onPressed: _retry) : null,
      );
    } else {
      child = KolaEmptyState(
        icon: Icons.receipt_long_outlined,
        title: 'Aucune commande pour le moment',
        message: 'Tes commandes apparaîtront ici dès qu\'un client achète.',
        action: action ? KolaButton(label: 'Partager ma boutique', onPressed: () {}) : null,
      );
    }
    return Container(
      width: 400,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: child,
    );
  }
}

/// Démo de la liste : 1,2 seconde de chargement, puis les produits.
class _ProductListDemo extends StatefulWidget {
  const _ProductListDemo();

  @override
  State<_ProductListDemo> createState() => _ProductListDemoState();
}

class _ProductListDemoState extends State<_ProductListDemo> {
  bool _loading = true;

  static const _products = [
    KolaProduct(name: 'Riz parfumé 5 kg', price: 4500, stock: 7, category: 'Épicerie'),
    KolaProduct(name: 'Huile 1 L', price: 1600, stock: 42, category: 'Épicerie'),
    KolaProduct(name: 'Sucre 1 kg', price: 900, stock: 18, category: 'Épicerie'),
    KolaProduct(name: 'Lait en poudre 400 g', price: 2800, stock: 12, category: 'Épicerie'),
    KolaProduct(name: 'Savon de ménage', price: 350, stock: 64, category: 'Entretien'),
    KolaProduct(name: 'Farine 1 kg', price: 700, stock: 4, category: 'Épicerie'),
    KolaProduct(name: 'Tomate concentrée', price: 250, stock: 80, category: 'Épicerie'),
    KolaProduct(name: 'Eau de Javel 1 L', price: 600, stock: 9, category: 'Entretien'),
  ];

  @override
  void initState() {
    super.initState();
    Future<void>.delayed(const Duration(milliseconds: 1200), () {
      if (mounted) setState(() => _loading = false);
    });
  }

  @override
  Widget build(BuildContext context) => KolaProductList(products: _products, loading: _loading);
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
