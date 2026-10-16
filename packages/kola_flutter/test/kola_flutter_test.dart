import 'package:flutter_test/flutter_test.dart';
import 'package:kola_flutter/kola_flutter.dart';

void main() {
  test('le thème clair utilise la couleur Kola', () {
    final theme = KolaTheme.light();
    expect(theme.colorScheme.primary, KolaColors.accent);
  });

  test('on peut changer la couleur principale', () {
    final theme = KolaTheme.dark(primary: KolaColors.danger);
    expect(theme.colorScheme.primary, KolaColors.danger);
  });
}
