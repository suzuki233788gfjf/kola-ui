import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(body: Padding(padding: const EdgeInsets.all(16), child: child)),
    );

void main() {
  group('Code OTP', () {
    test('lecture du code', () {
      expect(KolaOtpField.parse('482913', 6), '482913');
      expect(KolaOtpField.parse('48 29 13', 6), '482913');
      expect(KolaOtpField.parse('482-913', 6), '482913');
      expect(KolaOtpField.parse('Votre code Kola : 482913. Valable 5 min.', 6), '482913');
      expect(KolaOtpField.parse('12ab', 6), '12');
      expect(KolaOtpField.parse('1234567', 6), '123456');
      expect(KolaOtpField.parse('Code 4821', 4), '4821');
      expect(KolaOtpField.parse('', 6), '');
    });

    test('compte à rebours', () {
      expect(KolaOtpField.formatDelay(60), '1:00');
      expect(KolaOtpField.formatDelay(75), '1:15');
      expect(KolaOtpField.formatDelay(9), '0:09');
    });

    testWidgets('les chiffres remplissent les cases et le code complet est envoyé une fois', (tester) async {
      final codes = <String>[];
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaOtpField(controller: c, onCompleted: codes.add)));
      await tester.enterText(find.byType(TextField), '4829');
      await tester.pump();
      expect(find.text('4'), findsOneWidget);
      expect(find.text('9'), findsOneWidget);
      expect(codes, isEmpty);
      await tester.enterText(find.byType(TextField), '482913');
      await tester.pump();
      expect(c.text, '482913');
      expect(codes, ['482913']);
    });

    testWidgets('un SMS collé en entier donne le code', (tester) async {
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaOtpField(controller: c)));
      await tester.enterText(find.byType(TextField), 'Votre code Kola : 482913.');
      await tester.pump();
      expect(c.text, '482913');
    });

    testWidgets('les lettres sont ignorées et la longueur respectée', (tester) async {
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaOtpField(controller: c, length: 4)));
      await tester.enterText(find.byType(TextField), '12ab');
      await tester.pump();
      expect(c.text, '12');
      c.clear();
      await tester.pump();
      await tester.enterText(find.byType(TextField), '123456');
      await tester.pump();
      expect(c.text, '1234');
    });

    testWidgets('un code complet collé à la suite remplace l\'ancien', (tester) async {
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaOtpField(controller: c)));
      await tester.enterText(find.byType(TextField), '12');
      await tester.pump();
      // Collage à la fin du champ : '12' + '482913'
      await tester.enterText(find.byType(TextField), '12482913');
      await tester.pump();
      expect(c.text, '482913');
      // Chiffre tapé en plus : ignoré, le code reste complet
      await tester.enterText(find.byType(TextField), '4829137');
      await tester.pump();
      expect(c.text, '482913');
    });

    testWidgets('affiche le label, l\'aide et l\'erreur', (tester) async {
      await tester.pumpWidget(_app(const KolaOtpField(helper: 'Envoyé par SMS')));
      expect(find.text('Code de vérification'), findsOneWidget);
      expect(find.text('Envoyé par SMS'), findsOneWidget);
      await tester.pumpWidget(_app(const KolaOtpField(helper: 'Envoyé par SMS', errorText: 'Code incorrect')));
      expect(find.text('Code incorrect'), findsOneWidget);
      expect(find.text('Envoyé par SMS'), findsNothing);
    });

    testWidgets('renvoyer le code après le compte à rebours', (tester) async {
      var renvois = 0;
      final c = TextEditingController(text: '1234');
      await tester.pumpWidget(_app(KolaOtpField(
        controller: c,
        resendDelay: const Duration(seconds: 30),
        onResend: () async => renvois++,
      )));
      expect(find.text('Renvoyer le code dans 0:30'), findsOneWidget);
      await tester.pump(const Duration(seconds: 10));
      expect(find.text('Renvoyer le code dans 0:20'), findsOneWidget);
      await tester.pump(const Duration(seconds: 20));
      expect(find.text('Renvoyer le code'), findsOneWidget);

      await tester.tap(find.text('Renvoyer le code'));
      await tester.pump();
      await tester.pump();
      expect(renvois, 1);
      expect(c.text, '');
      expect(find.text('Renvoyer le code dans 0:30'), findsOneWidget);

      // Retire le champ pour arrêter le minuteur.
      await tester.pumpWidget(const SizedBox());
    });
  });
}
