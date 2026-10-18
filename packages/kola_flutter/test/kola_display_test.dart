import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child, {double width = 700}) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(
        body: SingleChildScrollView(
          child: Center(child: SizedBox(width: width, child: child)),
        ),
      ),
    );

class _Produit {
  const _Produit(this.nom, this.stock);
  final String nom;
  final int stock;
}

const _produits = [
  _Produit('Sucre 1 kg', 18),
  _Produit('Huile 1 L', 42),
  _Produit('Riz 5 kg', 7),
];

final _colonnes = [
  KolaColumn<_Produit>(label: 'Produit', cell: (p) => p.nom, sortBy: (p) => p.nom),
  KolaColumn<_Produit>(
    label: 'Stock',
    cell: (p) => '${p.stock}',
    sortBy: (p) => p.stock,
    numeric: true,
  ),
];

void main() {
  group('Sélecteur', () {
    test('la recherche ignore les accents', () {
      expect(KolaSelect.normalize('Yaoundé'), 'yaounde');
      expect(KolaSelect.normalize('ÉBOLOWA'), 'ebolowa');
    });

    testWidgets('chercher puis choisir une option', (tester) async {
      String? ville;
      await tester.pumpWidget(_app(StatefulBuilder(
        builder: (context, setState) => KolaSelect<String>(
          label: 'Ville',
          value: ville,
          options: const [
            KolaSelectOption('dla', 'Douala'),
            KolaSelectOption('yde', 'Yaoundé'),
            KolaSelectOption('bfm', 'Bafoussam'),
          ],
          onChanged: (v) => setState(() => ville = v),
        ),
      )));

      expect(find.text('Choisir…'), findsOneWidget);
      await tester.tap(find.text('Choisir…'));
      await tester.pumpAndSettle();

      await tester.enterText(find.byType(TextField).last, 'yaounde');
      await tester.pump();
      expect(find.text('Douala'), findsNothing);

      await tester.tap(find.text('Yaoundé'));
      await tester.pumpAndSettle();
      expect(ville, 'yde');
      expect(find.text('Yaoundé'), findsOneWidget);
    });
  });

  group('Carte', () {
    testWidgets('carte produit et carte statistique', (tester) async {
      await tester.pumpWidget(_app(const Column(
        children: [
          KolaCard(
            media: Icon(Icons.shopping_bag),
            badge: 'Nouveau',
            title: 'Riz parfumé 5 kg',
            subtitle: 'Épicerie',
            footer: Text('4 500 FCFA'),
          ),
          KolaStatCard(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5),
        ],
      )));
      expect(find.text('Nouveau'), findsOneWidget);
      expect(find.text('4 500 FCFA'), findsOneWidget);
      expect(find.text('+12,5 %'), findsOneWidget);
    });
  });

  group('Tableau', () {
    testWidgets('trier par stock', (tester) async {
      await tester.pumpWidget(_app(KolaDataTable<_Produit>(columns: _colonnes, rows: _produits)));

      double y(String text) => tester.getTopLeft(find.text(text)).dy;
      await tester.tap(find.text('Stock'));
      await tester.pump();
      expect(y('Riz 5 kg') < y('Sucre 1 kg'), isTrue);
      expect(y('Sucre 1 kg') < y('Huile 1 L'), isTrue);

      await tester.tap(find.text('Stock'));
      await tester.pump();
      expect(y('Huile 1 L') < y('Riz 5 kg'), isTrue);
    });

    testWidgets('pagination', (tester) async {
      await tester.pumpWidget(_app(KolaDataTable<_Produit>(
        columns: _colonnes,
        rows: _produits,
        rowsPerPage: 2,
      )));
      expect(find.text('1–2 sur 3'), findsOneWidget);
      await tester.tap(find.byTooltip('Page suivante'));
      await tester.pump();
      expect(find.text('3–3 sur 3'), findsOneWidget);
    });

    testWidgets('sur petit écran, les lignes deviennent des cartes', (tester) async {
      await tester.pumpWidget(_app(
        KolaDataTable<_Produit>(columns: _colonnes, rows: _produits),
        width: 360,
      ));
      // En mode carte, le libellé « Stock » est répété sur chaque carte.
      expect(find.text('Stock'), findsNWidgets(3));
    });
  });
}
