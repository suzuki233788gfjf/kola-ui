import 'dart:async';

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

Widget _app(Widget child) => MaterialApp(
      theme: KolaTheme.light(),
      home: Scaffold(
        body: Padding(padding: const EdgeInsets.all(16), child: SingleChildScrollView(child: child)),
      ),
    );

const _villes = [
  KolaSearchOption('Douala', subtitle: 'Littoral'),
  KolaSearchOption('Yaoundé', subtitle: 'Centre'),
  KolaSearchOption('Bafoussam', subtitle: 'Ouest'),
  KolaSearchOption('Bamenda', subtitle: 'Nord-Ouest'),
  KolaSearchOption('Garoua', subtitle: 'Nord'),
  KolaSearchOption('Bertoua', subtitle: 'Est'),
];

List<String> _labels(List<KolaSearchOption> o) => [for (final x in o) x.label];

void main() {
  group('Recherche', () {
    test('sans accents ni majuscules', () {
      expect(KolaSearchField.normalize('Yaoundé'), 'yaounde');
      expect(KolaSearchField.normalize('ÉBOLOWA'), 'ebolowa');
      expect(_labels(KolaSearchField.filter(_villes, 'yaounde')), ['Yaoundé']);
      expect(_labels(KolaSearchField.filter(_villes, 'YAOU')), ['Yaoundé']);
    });

    test('les débuts de mot passent en premier', () {
      expect(_labels(KolaSearchField.filter(_villes, 'ba')), ['Bafoussam', 'Bamenda']);
      expect(_labels(KolaSearchField.filter(_villes, 'oua')), ['Douala', 'Garoua', 'Bertoua']);
      // Le sous-titre compte aussi, après les libellés.
      expect(_labels(KolaSearchField.filter(_villes, 'ouest')), ['Bafoussam', 'Bamenda']);
      expect(KolaSearchField.filter(_villes, ''), isEmpty);
      expect(KolaSearchField.filter(_villes, 'a', max: 2).length, 2);
    });

    testWidgets('choisir une suggestion au doigt', (tester) async {
      KolaSearchOption? choisie;
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaSearchField(controller: c, options: _villes, onSelected: (o) => choisie = o)));
      await tester.enterText(find.byType(TextField), 'yaou');
      await tester.pump();
      expect(find.text('Centre'), findsOneWidget);
      await tester.tap(find.text('Yaoundé', findRichText: true));
      await tester.pump();
      expect(choisie?.label, 'Yaoundé');
      expect(c.text, 'Yaoundé');
      expect(find.text('Centre'), findsNothing);
    });

    testWidgets('flèches et Entrée au clavier', (tester) async {
      KolaSearchOption? choisie;
      await tester.pumpWidget(_app(KolaSearchField(options: _villes, onSelected: (o) => choisie = o)));
      await tester.enterText(find.byType(TextField), 'ba');
      await tester.pump();
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.arrowDown);
      await tester.sendKeyEvent(LogicalKeyboardKey.enter);
      await tester.pump();
      expect(choisie?.label, 'Bamenda');
    });

    testWidgets('aucun résultat, effacer et valider', (tester) async {
      String? lancee;
      final c = TextEditingController();
      await tester.pumpWidget(_app(KolaSearchField(controller: c, options: _villes, onSubmitted: (t) => lancee = t)));
      await tester.enterText(find.byType(TextField), 'kribi');
      await tester.pump();
      expect(find.text('Aucun résultat pour « kribi »'), findsOneWidget);
      await tester.testTextInput.receiveAction(TextInputAction.search);
      await tester.pump();
      expect(lancee, 'kribi');
      await tester.tap(find.byTooltip('Effacer'));
      await tester.pump();
      expect(c.text, '');
    });
  });

  group('Téléversement', () {
    test('tailles en français', () {
      expect(KolaFileUpload.formatSize(850), '850 o');
      expect(KolaFileUpload.formatSize(48000), '47 Ko');
      expect(KolaFileUpload.formatSize(1258291), '1,2 Mo');
      expect(KolaFileUpload.formatSize(5 * 1024 * 1024), '5 Mo');
      expect(KolaFileUpload.formatSize(15 * 1024 * 1024), '15 Mo');
    });

    test('vérification du format et de la taille', () {
      const ok = KolaFile(name: 'CNI.JPG', size: 1000);
      expect(ok.extension, 'jpg');
      expect(ok.isImage, isTrue);
      expect(KolaFileUpload.check(ok, extensions: const ['jpg']), isNull);
      expect(KolaFileUpload.check(const KolaFile(name: 'a.docx', size: 10), extensions: const ['pdf']), 'Format non accepté');
      expect(KolaFileUpload.check(const KolaFile(name: 'a.pdf', size: 6 << 20)), 'Fichier trop lourd (max 5 Mo)');
    });

    testWidgets('fichiers acceptés et refusés', (tester) async {
      List<KolaFile>? prets;
      await tester.pumpWidget(_app(KolaFileUpload(
        onPick: () async => const [
          KolaFile(name: 'cni-recto.jpg', size: 1258291),
          KolaFile(name: 'releve.pdf', size: 6 << 20),
          KolaFile(name: 'note.docx', size: 2000),
        ],
        onChanged: (f) => prets = f,
      )));
      expect(find.text('JPG, PNG ou PDF · 5 Mo max'), findsOneWidget);
      await tester.tap(find.text('Choisir des fichiers'));
      await tester.pump();
      expect(find.text('1,2 Mo · Prêt'), findsOneWidget);
      expect(find.text('Fichier trop lourd (max 5 Mo)'), findsOneWidget);
      expect(find.text('Format non accepté'), findsOneWidget);
      expect(_names(prets), ['cni-recto.jpg']);

      await tester.tap(find.byTooltip('Retirer cni-recto.jpg'));
      await tester.pump();
      expect(find.text('cni-recto.jpg'), findsNothing);
      expect(prets, isEmpty);
    });

    testWidgets('progression de l\'envoi', (tester) async {
      final fin = Completer<void>();
      await tester.pumpWidget(_app(KolaFileUpload(
        onPick: () async => const [KolaFile(name: 'recu.png', size: 48000)],
        onUpload: (file, progress) async {
          progress(0.5);
          await fin.future;
        },
      )));
      await tester.tap(find.text('Choisir des fichiers'));
      await tester.pump();
      expect(find.text('47 Ko · Envoi… 50 %'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsOneWidget);
      fin.complete();
      await tester.pump();
      await tester.pump();
      expect(find.text('47 Ko · Prêt'), findsOneWidget);
      expect(find.byType(LinearProgressIndicator), findsNothing);
    });

    testWidgets('nombre maximum de fichiers', (tester) async {
      await tester.pumpWidget(_app(KolaFileUpload(
        maxFiles: 2,
        onPick: () async => const [
          KolaFile(name: 'a.jpg', size: 10),
          KolaFile(name: 'b.jpg', size: 10),
          KolaFile(name: 'c.jpg', size: 10),
        ],
      )));
      await tester.tap(find.text('Choisir des fichiers'));
      await tester.pump();
      expect(find.text('c.jpg'), findsNothing);
      expect(find.text('2 fichiers maximum : les autres n\'ont pas été ajoutés.'), findsOneWidget);
      expect(find.text('2 fichiers maximum'), findsOneWidget);
    });
  });

  group('États vides et chargement', () {
    testWidgets('état vide avec action', (tester) async {
      var clics = 0;
      await tester.pumpWidget(_app(KolaEmptyState(
        title: 'Aucune commande pour le moment',
        message: 'Tes commandes apparaîtront ici.',
        action: KolaButton(label: 'Partager ma boutique', onPressed: () => clics++),
      )));
      expect(find.text('Aucune commande pour le moment'), findsOneWidget);
      expect(find.text('Tes commandes apparaîtront ici.'), findsOneWidget);
      expect(find.byIcon(Icons.inbox_outlined), findsOneWidget);
      await tester.tap(find.text('Partager ma boutique'));
      expect(clics, 1);
    });

    testWidgets('état d\'erreur', (tester) async {
      await tester.pumpWidget(_app(const KolaEmptyState(
        tone: KolaEmptyTone.error,
        icon: Icons.wifi_off,
        title: 'Pas de connexion',
      )));
      final icon = tester.widget<Icon>(find.byIcon(Icons.wifi_off));
      expect(icon.color, KolaColors.danger);
    });

    testWidgets('liste en chargement', (tester) async {
      await tester.pumpWidget(_app(const KolaSkeletonList(rows: 4)));
      await tester.pump(const Duration(milliseconds: 500));
      expect(find.byType(KolaSkeleton), findsNWidgets(4 * 4));
      expect(find.bySemanticsLabel('Chargement…'), findsOneWidget);
      await tester.pumpWidget(const SizedBox());
    });
  });
}

List<String>? _names(List<KolaFile>? files) => files == null ? null : [for (final f in files) f.name];
