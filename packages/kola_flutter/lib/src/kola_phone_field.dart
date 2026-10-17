import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

import 'kola_text_field.dart';

/// Opérateurs mobiles détectés au Cameroun.
enum KolaOperator { mtn, orange }

/// Champ téléphone Cameroun (+237) : formatage « 6 77 12 34 56 »
/// et détection de l'opérateur (MTN ou Orange).
///
/// ```dart
/// KolaPhoneField(onChanged: (numero) => print(numero)); // '677123456'
/// ```
class KolaPhoneField extends StatefulWidget {
  const KolaPhoneField({
    super.key,
    this.label = 'Téléphone',
    this.controller,
    this.helper,
    this.onChanged,
  });

  final String label;
  final TextEditingController? controller;
  final String? helper;

  /// Reçoit le numéro sans espaces (ex. '677123456').
  final ValueChanged<String>? onChanged;

  /// Préfixes : MTN 67, 68, 650–654 · Orange 69, 655–659.
  static KolaOperator? detectOperator(String input) {
    final d = input.replaceAll(RegExp(r'\D'), '');
    if (d.length < 2) return null;
    final p2 = d.substring(0, 2);
    if (p2 == '67' || p2 == '68') return KolaOperator.mtn;
    if (p2 == '69') return KolaOperator.orange;
    if (p2 == '65' && d.length >= 3) {
      final third = int.parse(d[2]);
      return third <= 4 ? KolaOperator.mtn : KolaOperator.orange;
    }
    return null;
  }

  /// '677123456' → '6 77 12 34 56'
  static String format(String input) {
    final d = input.replaceAll(RegExp(r'\D'), '');
    final b = StringBuffer();
    for (var i = 0; i < d.length && i < 9; i++) {
      if (i == 1 || i == 3 || i == 5 || i == 7) b.write(' ');
      b.write(d[i]);
    }
    return b.toString();
  }

  static String? validate(String? value) {
    final d = (value ?? '').replaceAll(RegExp(r'\D'), '');
    if (d.isEmpty) return 'Numéro requis';
    if (!d.startsWith('6')) return 'Un numéro mobile commence par 6';
    if (d.length < 9) return 'Numéro incomplet (9 chiffres)';
    return null;
  }

  @override
  State<KolaPhoneField> createState() => _KolaPhoneFieldState();
}

class _KolaPhoneFieldState extends State<KolaPhoneField> {
  late final TextEditingController _controller =
      widget.controller ?? TextEditingController();

  @override
  void initState() {
    super.initState();
    _controller.addListener(_refresh);
  }

  void _refresh() => setState(() {});

  @override
  void dispose() {
    _controller.removeListener(_refresh);
    if (widget.controller == null) _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final op = KolaPhoneField.detectOperator(_controller.text);

    return KolaTextField(
      label: widget.label,
      controller: _controller,
      hint: '6 XX XX XX XX',
      helper: widget.helper,
      keyboardType: TextInputType.phone,
      inputFormatters: [_CmPhoneFormatter()],
      validator: KolaPhoneField.validate,
      onChanged: (v) => widget.onChanged?.call(v.replaceAll(' ', '')),
      prefix: Padding(
        padding: const EdgeInsets.only(left: 14, right: 10),
        child: Text(
          '+237',
          style: theme.textTheme.bodyLarge?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
          ),
        ),
      ),
      suffix: op == null
          ? null
          : Padding(
              padding: const EdgeInsets.only(right: 10),
              child: _OperatorBadge(op),
            ),
    );
  }
}

class _OperatorBadge extends StatelessWidget {
  const _OperatorBadge(this.kind);
  final KolaOperator kind;

  @override
  Widget build(BuildContext context) {
    final isMtn = kind == KolaOperator.mtn;
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isMtn ? const Color(0xFFFFCB05) : const Color(0xFFFF7900),
        borderRadius: BorderRadius.circular(6),
      ),
      child: Text(
        isMtn ? 'MTN' : 'Orange',
        style: const TextStyle(
          color: Color(0xFF1A1712),
          fontSize: 12,
          fontWeight: FontWeight.w700,
        ),
      ),
    );
  }
}

class _CmPhoneFormatter extends TextInputFormatter {
  @override
  TextEditingValue formatEditUpdate(
    TextEditingValue oldValue,
    TextEditingValue newValue,
  ) {
    final text = KolaPhoneField.format(newValue.text);
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
