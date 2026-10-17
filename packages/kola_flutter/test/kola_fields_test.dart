import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(body: Padding(padding: const EdgeInsets.all(16), child: child)),
    );

void main() {
  group('Téléphone +237', () {
    test('formatage', () {
      expect(KolaPhoneField.format('677123456'), '6 77 12 34 56');
      expect(KolaPhoneField.format('6771'), '6 77 1');
      expect(KolaPhoneField.format('6771234567890'), '6 77 12 34 56');
    });

    test('détection de l\'opérateur', () {
      expect(KolaPhoneField.detectOperator('677'), KolaOperator.mtn);
      expect(KolaPhoneField.detectOperator('680'), KolaOperator.mtn);
      expect(KolaPhoneField.detectOperator('652'), KolaOperator.mtn);
      expect(KolaPhoneField.detectOperator('699'), KolaOperator.orange);
      expect(KolaPhoneField.detectOperator('657'), KolaOperator.orange);
      expect(KolaPhoneField.detectOperator('6'), isNull);
      expect(KolaPhoneField.detectOperator('620'), isNull);
    });

    test('validation', () {
      expect(KolaPhoneField.validate('6 77 12 34 56'), isNull);
      expect(KolaPhoneField.validate('6 77 12'), isNotNull);
      expect(KolaPhoneField.validate('2 22 12 34 56'), isNotNull);
    });

    testWidgets('la saisie est formatée et le badge MTN apparaît', (tester) async {
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaPhoneField(controller: c)));
      await tester.enterText(find.byType(TextFormField), '677123456');
      await tester.pump();
      expect(c.text, '6 77 12 34 56');
      expect(find.text('MTN'), findsOneWidget);
    });
  });

  group('Montant FCFA', () {
    test('formatage et lecture', () {
      expect(KolaAmountField.format(25000), '25 000');
      expect(KolaAmountField.format(1250000), '1 250 000');
      expect(KolaAmountField.format(999), '999');
      expect(KolaAmountField.parse('1 250 000'), 1250000);
      expect(KolaAmountField.parse(''), isNull);
    });

    testWidgets('la saisie est formatée et la valeur est un entier', (tester) async {
      final c = TextEditingController();
      int? valeur;
      await tester.pumpWidget(
        _app(KolaAmountField(controller: c, onChanged: (v) => valeur = v)),
      );
      await tester.enterText(find.byType(TextFormField), '1250000');
      await tester.pump();
      expect(c.text, '1 250 000');
      expect(valeur, 1250000);
      expect(find.text('FCFA'), findsOneWidget);
    });
  });

  group('Champ de texte', () {
    testWidgets('affiche le label et l\'erreur de validation', (tester) async {
      await tester.pumpWidget(_app(KolaTextField(
        label: 'E-mail',
        validator: (v) => (v ?? '').contains('@') ? null : 'Adresse e-mail incomplète',
      )));
      expect(find.text('E-mail'), findsOneWidget);
      await tester.enterText(find.byType(TextFormField), 'susy');
      await tester.pump();
      expect(find.text('Adresse e-mail incomplète'), findsOneWidget);
    });

    testWidgets('le mot de passe peut être affiché', (tester) async {
      await tester.pumpWidget(_app(const KolaTextField(label: 'Mot de passe', obscure: true)));
      expect(find.byTooltip('Afficher'), findsOneWidget);
      await tester.tap(find.byTooltip('Afficher'));
      await tester.pump();
      expect(find.byTooltip('Masquer'), findsOneWidget);
    });
  });
}
