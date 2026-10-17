import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'kola_text_field.dart';

/// Champ montant en FCFA : séparateur de milliers pendant la saisie,
/// pas de décimales, et une valeur entière propre côté code.
///
/// ```dart
/// KolaAmountField(onChanged: (montant) => print(montant)); // 25000
/// ```
class KolaAmountField extends StatelessWidget {
  const KolaAmountField({
    super.key,
    this.label = 'Montant',
    this.controller,
    this.helper,
    this.min,
    this.max,
    this.onChanged,
  });

  final String label;
  final TextEditingController? controller;
  final String? helper;
  final int? min;
  final int? max;

  /// Reçoit le montant en entier (null si le champ est vide).
  final ValueChanged<int?>? onChanged;

  /// 1250000 → '1 250 000'
  static String format(int value) {
    final s = value.toString();
    final b = StringBuffer();
    for (var i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 == 0) b.write(' ');
      b.write(s[i]);
    }
    return b.toString();
  }

  /// '1 250 000' → 1250000
  static int? parse(String text) =>
      int.tryParse(text.replaceAll(RegExp(r'\D'), ''));

  String? _validate(String? value) {
    final amount = parse(value ?? '');
    if (amount == null) return null;
    if (min != null && amount < min!) return 'Minimum ${format(min!)} FCFA';
    if (max != null && amount > max!) return 'Maximum ${format(max!)} FCFA';
    return null;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return KolaTextField(
      label: label,
      controller: controller,
      hint: '0',
      helper: helper,
      keyboardType: TextInputType.number,
      inputFormatters: [_FcfaFormatter()],
      validator: _validate,
      onChanged: (v) => onChanged?.call(parse(v)),
      suffix: Padding(
        padding: const EdgeInsets.only(right: 14),
        child: Text(
          'FCFA',
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ),
    );
  }
}

class _FcfaFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final digits = newValue.text.replaceAll(RegExp(r'\D'), '');
    if (digits.isEmpty) return const TextEditingValue();
    if (digits.length > 12) return oldValue;
    final text = KolaAmountField.format(int.parse(digits));
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
