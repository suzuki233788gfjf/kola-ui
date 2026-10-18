import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(
        body: SingleChildScrollView(
          padding: const EdgeInsets.all(16),
          child: child,
        ),
      ),
    );

Future<void> _fill(WidgetTester tester, {String phone = '677123456', String amount = '25000'}) async {
  final fields = find.byType(TextFormField);
  await tester.enterText(fields.at(0), phone);
  await tester.enterText(fields.at(1), amount);
  await tester.pump();
}

Finder _payButton() => find.widgetWithText(FilledButton, 'Payer 25 000 FCFA');

void main() {
  testWidgets('paiement réussi : demande correcte puis écran de succès', (tester) async {
    final completer = Completer<void>();
    KolaMobileMoneyRequest? recu;
    await tester.pumpWidget(_app(KolaMobileMoneyForm(
      onPay: (r) {
        recu = r;
        return completer.future;
      },
    )));

    await _fill(tester);
    expect(_payButton(), findsOneWidget);

    await tester.ensureVisible(_payButton());
    await tester.tap(_payButton());
    await tester.pump();

    expect(recu?.phone, '677123456');
    expect(recu?.operator, KolaOperator.mtn);
    expect(recu?.amount, 25000);
    expect(find.text('Confirme sur ton téléphone'), findsOneWidget);

    completer.complete();
    await tester.pumpAndSettle();
    expect(find.text('Paiement reçu'), findsOneWidget);
  });

  testWidgets('échec : le message du fournisseur est affiché', (tester) async {
    await tester.pumpWidget(_app(KolaMobileMoneyForm(
      onPay: (_) async => throw const KolaMobileMoneyException('Solde insuffisant'),
    )));

    await _fill(tester, phone: '699123456');
    await tester.ensureVisible(_payButton());
    await tester.tap(_payButton());
    await tester.pumpAndSettle();

    expect(find.text('Paiement non abouti'), findsOneWidget);
    expect(find.text('Solde insuffisant'), findsOneWidget);
  });

  testWidgets('numéro incomplet : onPay n\'est pas appelé', (tester) async {
    var appels = 0;
    await tester.pumpWidget(_app(KolaMobileMoneyForm(
      onPay: (_) async => appels++,
    )));

    await _fill(tester, phone: '6771');
    await tester.ensureVisible(_payButton());
    await tester.tap(_payButton());
    await tester.pump();

    expect(appels, 0);
    expect(find.text('Confirme sur ton téléphone'), findsNothing);
  });

  testWidgets('montant imposé : pas de champ montant', (tester) async {
    await tester.pumpWidget(_app(KolaMobileMoneyForm(
      amount: 5000,
      onPay: (_) async {},
    )));
    expect(find.byType(TextFormField), findsOneWidget);
    expect(find.text('Payer 5 000 FCFA'), findsOneWidget);
  });
}
