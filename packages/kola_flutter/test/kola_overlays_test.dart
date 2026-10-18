import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(body: Center(child: child)),
    );

void main() {
  group('Date picker', () {
    test('formats en français', () {
      expect(KolaDateFr.date(DateTime(2026, 10, 12)), '12 oct. 2026');
      expect(KolaDateFr.range(DateTime(2026, 10, 12), DateTime(2026, 10, 16)), '12 – 16 oct. 2026');
      expect(KolaDateFr.range(DateTime(2026, 9, 28), DateTime(2026, 10, 3)), '28 sept. – 3 oct. 2026');
      expect(KolaDateFr.range(DateTime(2026, 12, 30), DateTime(2027, 1, 2)), '30 déc. 2026 – 2 janv. 2027');
    });

    testWidgets('choisir une période', (tester) async {
      KolaDateRange? choisi;
      await tester.pumpWidget(_app(SizedBox(
        width: 360,
        child: KolaCalendar(
          range: true,
          initialStart: DateTime(2026, 10, 1),
          initialEnd: DateTime(2026, 10, 1),
          onConfirm: (r) => choisi = r,
        ),
      )));

      expect(find.text('octobre 2026'), findsOneWidget);
      expect(find.text('lun.'), findsOneWidget);

      await tester.tap(find.text('12'));
      await tester.pump();
      await tester.tap(find.text('16'));
      await tester.pump();
      expect(find.text('12 – 16 oct. 2026'), findsOneWidget);

      await tester.tap(find.text('Valider'));
      expect(choisi?.start, DateTime(2026, 10, 12));
      expect(choisi?.end, DateTime(2026, 10, 16));
    });

    testWidgets('changer de mois', (tester) async {
      await tester.pumpWidget(_app(SizedBox(
        width: 360,
        child: KolaCalendar(initialStart: DateTime(2026, 10, 5)),
      )));
      await tester.tap(find.byTooltip('Mois suivant'));
      await tester.pump();
      expect(find.text('novembre 2026'), findsOneWidget);
    });

    testWidgets('KolaDatePicker.show renvoie la date choisie', (tester) async {
      DateTime? date;
      await tester.pumpWidget(_app(Builder(
        builder: (context) => TextButton(
          onPressed: () async {
            date = await KolaDatePicker.show(context, initial: DateTime(2026, 10, 1));
          },
          child: const Text('Ouvrir'),
        ),
      )));
      await tester.tap(find.text('Ouvrir'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('20'));
      await tester.pump();
      await tester.tap(find.text('Valider'));
      await tester.pumpAndSettle();
      expect(date, DateTime(2026, 10, 20));
    });
  });

  group('Confirmation', () {
    testWidgets('renvoie true quand on confirme', (tester) async {
      bool? resultat;
      await tester.pumpWidget(_app(Builder(
        builder: (context) => TextButton(
          onPressed: () async {
            resultat = await KolaConfirm.show(
              context,
              title: 'Supprimer cet article ?',
              confirmLabel: 'Supprimer',
              destructive: true,
            );
          },
          child: const Text('Ouvrir'),
        ),
      )));
      await tester.tap(find.text('Ouvrir'));
      await tester.pumpAndSettle();
      expect(find.text('Supprimer cet article ?'), findsOneWidget);
      await tester.tap(find.text('Supprimer'));
      await tester.pumpAndSettle();
      expect(resultat, isTrue);
    });

    testWidgets('renvoie false quand on annule', (tester) async {
      bool? resultat;
      await tester.pumpWidget(_app(Builder(
        builder: (context) => TextButton(
          onPressed: () async {
            resultat = await KolaConfirm.show(context, title: 'Continuer ?', sheet: true);
          },
          child: const Text('Ouvrir'),
        ),
      )));
      await tester.tap(find.text('Ouvrir'));
      await tester.pumpAndSettle();
      await tester.tap(find.text('Annuler'));
      await tester.pumpAndSettle();
      expect(resultat, isFalse);
    });
  });

  testWidgets('Notification : le message s\'affiche', (tester) async {
    await tester.pumpWidget(_app(Builder(
      builder: (context) => TextButton(
        onPressed: () => KolaToast.show(
          context,
          'Paiement reçu',
          type: KolaToastType.success,
        ),
        child: const Text('Notifier'),
      ),
    )));
    await tester.tap(find.text('Notifier'));
    await tester.pump();
    await tester.pump(const Duration(milliseconds: 500));
    expect(find.text('Paiement reçu'), findsOneWidget);
    expect(find.byIcon(Icons.check_circle_rounded), findsOneWidget);
  });
}
