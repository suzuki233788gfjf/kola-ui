import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(body: Center(child: child)),
    );

void main() {
  testWidgets('un clic appelle onPressed', (tester) async {
    var clics = 0;
    await tester.pumpWidget(
      _app(KolaButton(label: 'Valider', onPressed: () => clics++)),
    );
    await tester.tap(find.text('Valider'));
    expect(clics, 1);
  });

  testWidgets('en chargement : roue visible et clic ignoré', (tester) async {
    var clics = 0;
    await tester.pumpWidget(
      _app(KolaButton(
        label: 'Valider',
        loading: true,
        onPressed: () => clics++,
      )),
    );
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.tap(find.text('Valider'), warnIfMissed: false);
    expect(clics, 0);
  });

  testWidgets('les 4 variantes s\'affichent', (tester) async {
    await tester.pumpWidget(_app(Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        for (final v in KolaButtonVariant.values)
          KolaButton(label: v.name, variant: v, onPressed: () {}),
      ],
    )));
    for (final v in KolaButtonVariant.values) {
      expect(find.text(v.name), findsOneWidget);
    }
  });
}
