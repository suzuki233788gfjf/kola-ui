import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(
        body: SingleChildScrollView(padding: const EdgeInsets.all(16), child: child),
      ),
    );

const _orders = [
  KolaOrder(id: '#1042', customer: 'Awa Ngono', total: 6100, status: KolaOrderStatus.pending),
  KolaOrder(id: '#1041', customer: 'Paul Etoa', total: 2100, status: KolaOrderStatus.pending),
  KolaOrder(id: '#1035', customer: 'Mireille Fouda', total: 1800, status: KolaOrderStatus.delivered),
];

const _products = [
  KolaProduct(name: 'Riz parfumé 5 kg', price: 4500, stock: 7, category: 'Épicerie'),
  KolaProduct(name: 'Huile 1 L', price: 1600, stock: 42, category: 'Épicerie'),
  KolaProduct(name: 'Savon de ménage', price: 350, stock: 64, category: 'Entretien'),
  KolaProduct(name: 'Lait en poudre 400 g', price: 2800, stock: 12, category: 'Épicerie'),
];

void main() {
  group('Bloc connexion par téléphone', () {
    testWidgets('numéro, mauvais code, puis bon code', (tester) async {
      final envoyes = <String>[];
      String? connecte;
      await tester.pumpWidget(_app(KolaPhoneLogin(
        onSendCode: (numero) async => envoyes.add(numero),
        onVerify: (numero, code) async => code == '123456',
        onSuccess: (numero) => connecte = numero,
      )));

      // Le bouton reste inactif tant que le numéro est incomplet.
      await tester.enterText(find.byType(TextField), '6771');
      await tester.pump();
      await tester.tap(find.text('Recevoir le code'));
      await tester.pump();
      expect(envoyes, isEmpty);

      await tester.enterText(find.byType(TextField), '677123456');
      await tester.pump();
      await tester.tap(find.text('Recevoir le code'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      expect(envoyes, ['677123456']);
      expect(find.text('Vérifie ton numéro'), findsOneWidget);
      expect(find.text('Code envoyé au +237 6 77 12 34 56.', findRichText: true), findsOneWidget);

      await tester.enterText(find.byType(TextField), '111111');
      await tester.pump();
      await tester.pump();
      expect(find.text('Code incorrect. Réessaie.'), findsOneWidget);

      await tester.enterText(find.byType(TextField), '123456');
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Bienvenue !'), findsOneWidget);
      expect(connecte, '677123456');

      // Retire le bloc pour arrêter le minuteur « Renvoyer le code ».
      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('revenir au numéro', (tester) async {
      await tester.pumpWidget(_app(KolaPhoneLogin(
        onSendCode: (_) async {},
        onVerify: (_, _) async => false,
      )));
      await tester.enterText(find.byType(TextField), '699123456');
      await tester.pump();
      await tester.tap(find.text('Recevoir le code'));
      await tester.pump();
      await tester.pump(const Duration(milliseconds: 300));
      await tester.tap(find.text('Modifier le numéro'));
      await tester.pump(const Duration(milliseconds: 300));
      expect(find.text('Connexion'), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
    });
  });

  group('Bloc paiement de commande', () {
    testWidgets('récapitulatif et total', (tester) async {
      await tester.pumpWidget(_app(KolaCheckout(
        items: const [
          KolaCartItem(name: 'Riz parfumé 5 kg', price: 4500),
          KolaCartItem(name: 'Huile 1 L', price: 1600, quantity: 2),
        ],
        delivery: 1000,
        onPay: (_) async {},
      )));
      expect(find.text('3 articles'), findsOneWidget);
      expect(find.text('3 200 FCFA'), findsOneWidget);
      expect(find.text('7 700 FCFA'), findsOneWidget);
      expect(find.text('1 000 FCFA'), findsOneWidget);
      expect(find.text('8 700 FCFA'), findsWidgets);
      expect(find.byType(KolaMobileMoneyForm), findsOneWidget);
    });

    testWidgets('livraison gratuite', (tester) async {
      await tester.pumpWidget(_app(KolaCheckout(
        items: const [KolaCartItem(name: 'Sucre 1 kg', price: 900)],
        onPay: (_) async {},
      )));
      expect(find.text('Gratuite'), findsOneWidget);
      expect(find.text('1 article'), findsOneWidget);
    });
  });

  group('Bloc tableau de bord', () {
    test('date en français', () {
      expect(KolaDashboard.formatDay(DateTime(2026, 10, 20)), 'mardi 20 octobre');
      expect(KolaDashboard.formatDay(DateTime(2026, 8, 2)), 'dimanche 2 août');
    });

    testWidgets('chiffres clés et commandes par statut', (tester) async {
      tester.view.physicalSize = const Size(1200, 1600);
      tester.view.devicePixelRatio = 1;
      addTearDown(tester.view.reset);
      await tester.pumpWidget(_app(KolaDashboard(
        name: 'Awa',
        date: DateTime(2026, 10, 20),
        stats: const [
          KolaStat(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5),
          KolaStat(label: 'Commandes', value: '18'),
        ],
        orders: _orders,
      )));
      expect(find.text('Bonjour, Awa'), findsOneWidget);
      expect(find.text('mardi 20 octobre'), findsOneWidget);
      expect(find.text('125 000 FCFA'), findsOneWidget);
      expect(find.text('2'), findsOneWidget); // compteur « En cours »
      expect(find.text('Mireille Fouda'), findsOneWidget);

      await tester.tap(find.text('Livrées'));
      await tester.pump();
      expect(find.text('Mireille Fouda'), findsOneWidget);
      expect(find.text('Awa Ngono'), findsNothing);

      await tester.tap(find.text('Annulées'));
      await tester.pump();
      expect(find.text('Aucune commande annulée'), findsOneWidget);
    });
  });

  group('Bloc liste avec recherche', () {
    test('filtre sans accents', () {
      expect(KolaProductList.filter(_products, 'huile').map((p) => p.name), ['Huile 1 L']);
      expect(KolaProductList.filter(_products, 'epicerie').length, 3);
      expect(KolaProductList.filter(_products, '').length, 4);
    });

    testWidgets('chargement', (tester) async {
      await tester.pumpWidget(_app(const KolaProductList(products: _products, loading: true)));
      expect(find.byType(KolaSkeletonList), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
    });

    testWidgets('recherche, aucun résultat, effacer', (tester) async {
      await tester.pumpWidget(_app(const KolaProductList(products: _products)));
      expect(find.text('4 produits'), findsOneWidget);
      expect(find.text('Stock bas'), findsOneWidget);

      await tester.enterText(find.byType(TextField), 'HUILE');
      await tester.pump();
      expect(find.text('1 produit'), findsOneWidget);
      expect(find.text('Huile 1 L'), findsOneWidget);
      expect(find.text('Savon de ménage'), findsNothing);

      await tester.enterText(find.byType(TextField), 'xyz');
      await tester.pump();
      expect(find.text('Aucun produit pour « xyz »'), findsOneWidget);
      await tester.tap(find.text('Effacer la recherche'));
      await tester.pump();
      expect(find.text('4 produits'), findsOneWidget);
    });
  });
}
