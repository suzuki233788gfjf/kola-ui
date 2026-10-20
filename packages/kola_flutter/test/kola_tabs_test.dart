import 'package:flutter/material.dart';
import 'package:flutter/semantics.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(body: Padding(padding: const EdgeInsets.all(16), child: child)),
    );

const _items = [
  KolaTabItem(label: 'En cours', badge: 3),
  KolaTabItem(label: 'Livrées'),
  KolaTabItem(label: 'Annulées', badge: 0),
];

/// Petit écran de test : garde l'onglet choisi.
class _Host extends StatefulWidget {
  const _Host({required this.builder});
  final Widget Function(int selected, ValueChanged<int> onChanged) builder;

  @override
  State<_Host> createState() => _HostState();
}

class _HostState extends State<_Host> {
  int _selected = 0;

  @override
  Widget build(BuildContext context) => Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          widget.builder(_selected, (i) => setState(() => _selected = i)),
          Text('Contenu $_selected'),
        ],
      );
}

void main() {
  group('Onglets', () {
    test('compteur', () {
      expect(KolaBadge.label(3), '3');
      expect(KolaBadge.label(99), '99');
      expect(KolaBadge.label(120), '99+');
    });

    testWidgets('un clic change d\'onglet', (tester) async {
      await tester.pumpWidget(_app(_Host(
        builder: (s, on) => KolaTabs(items: _items, selected: s, onChanged: on),
      )));
      expect(find.text('Contenu 0'), findsOneWidget);
      await tester.tap(find.text('Livrées'));
      await tester.pumpAndSettle();
      expect(find.text('Contenu 1'), findsOneWidget);
    });

    testWidgets('le compteur s\'affiche, pas quand il vaut 0', (tester) async {
      await tester.pumpWidget(_app(KolaTabs(items: _items, selected: 0, onChanged: (_) {})));
      expect(find.text('3'), findsOneWidget);
      expect(find.text('0'), findsNothing);
    });

    testWidgets('l\'onglet choisi est annoncé comme sélectionné', (tester) async {
      await tester.pumpWidget(_app(KolaTabs(items: _items, selected: 1, onChanged: (_) {})));
      SemanticsProperties props(String label) => tester
          .widget<Semantics>(find
              .ancestor(
                of: find.text(label),
                matching: find.byWidgetPredicate((w) => w is Semantics && w.properties.selected != null),
              )
              .first)
          .properties;
      expect(props('Livrées').selected, isTrue);
      expect(props('Livrées').button, isTrue);
      expect(props('En cours').selected, isFalse);
    });

    testWidgets('pastilles et pleine largeur', (tester) async {
      await tester.pumpWidget(_app(_Host(
        builder: (s, on) => KolaTabs(items: _items, selected: s, onChanged: on, variant: KolaTabsVariant.pills, expand: true),
      )));
      await tester.tap(find.text('Annulées'));
      await tester.pumpAndSettle();
      expect(find.text('Contenu 2'), findsOneWidget);
    });

    testWidgets('barre du bas : icônes, compteur et changement d\'onglet', (tester) async {
      await tester.pumpWidget(_app(_Host(
        builder: (s, on) => KolaBottomNav(
          items: const [
            KolaTabItem(label: 'Accueil', icon: Icons.home_outlined),
            KolaTabItem(label: 'Commandes', icon: Icons.receipt_long_outlined, badge: 120),
            KolaTabItem(label: 'Profil', icon: Icons.person_outline),
          ],
          selected: s,
          onChanged: on,
        ),
      )));
      expect(find.byIcon(Icons.home_outlined), findsOneWidget);
      expect(find.text('99+'), findsOneWidget);
      await tester.tap(find.text('Profil'));
      await tester.pumpAndSettle();
      expect(find.text('Contenu 2'), findsOneWidget);
    });
  });
}
