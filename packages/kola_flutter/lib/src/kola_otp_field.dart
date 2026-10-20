import 'dart:async';
import 'dart:math' as math;

import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Champ code OTP : les cases pour le code reçu par SMS.
///
/// - un seul champ invisible derrière les cases : le collage, le remplissage
///   automatique du SMS et l'effacement marchent comme dans un champ normal ;
/// - un SMS entier collé (« Votre code Kola : 482913 ») donne bien 482913 ;
/// - un compte à rebours avant de pouvoir renvoyer le code.
///
/// ```dart
/// KolaOtpField(
///   helper: 'Envoyé par SMS au 6 77 12 34 56',
///   onCompleted: (code) async {
///     // Vérifie le code auprès de ton serveur.
///   },
///   onResend: () async {
///     // Redemande un SMS à ton serveur.
///   },
/// );
/// ```
class KolaOtpField extends StatefulWidget {
  const KolaOtpField({
    super.key,
    this.label = 'Code de vérification',
    this.length = 6,
    this.controller,
    this.helper,
    this.errorText,
    this.onChanged,
    this.onCompleted,
    this.onResend,
    this.resendDelay = const Duration(seconds: 60),
    this.autofocus = false,
    this.enabled = true,
  }) : assert(length >= 3 && length <= 8);

  final String label;

  /// Nombre de chiffres (4 ou 6 le plus souvent).
  final int length;
  final TextEditingController? controller;

  /// Texte sous les cases, ex. 'Envoyé par SMS au 6 77 12 34 56'.
  final String? helper;

  /// Erreur à afficher, ex. 'Code incorrect'. Les cases passent en rouge.
  final String? errorText;

  /// Reçoit le code à chaque changement (chiffres seulement).
  final ValueChanged<String>? onChanged;

  /// Appelé une fois, quand toutes les cases sont remplies.
  final ValueChanged<String>? onCompleted;

  /// Si présent, affiche « Renvoyer le code » après [resendDelay].
  final Future<void> Function()? onResend;
  final Duration resendDelay;
  final bool autofocus;
  final bool enabled;

  /// Garde seulement le code : '48 29 13' → '482913',
  /// 'Votre code Kola : 482913.' → '482913'.
  static String parse(String text, int length) {
    final compact = text.replaceAll(RegExp(r'[\s-]'), '');
    if (RegExp(r'^\d*$').hasMatch(compact)) {
      return compact.substring(0, math.min(compact.length, length));
    }
    final match = RegExp('(^|\\D)(\\d{$length})(?!\\d)').firstMatch(text);
    if (match != null) return match.group(2)!;
    final digits = text.replaceAll(RegExp(r'\D'), '');
    return digits.substring(0, math.min(digits.length, length));
  }

  /// 75 → '1:15'
  static String formatDelay(int seconds) =>
      '${seconds ~/ 60}:${(seconds % 60).toString().padLeft(2, '0')}';

  @override
  State<KolaOtpField> createState() => _KolaOtpFieldState();
}

class _KolaOtpFieldState extends State<KolaOtpField> {
  late final TextEditingController _controller =
      widget.controller ?? TextEditingController();
  final _focus = FocusNode();
  Timer? _timer;
  int _left = 0;
  bool _sending = false;
  String _last = '';

  @override
  void initState() {
    super.initState();
    _last = _controller.text;
    _controller.addListener(_onText);
    _focus.addListener(_rebuild);
    if (widget.onResend != null) _startTimer();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _controller.removeListener(_onText);
    if (widget.controller == null) _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _rebuild() => setState(() {});

  void _onText() {
    final value = _controller.value;
    // Le curseur reste toujours à la fin : on remplit les cases dans l'ordre.
    final end = value.text.length;
    if (value.selection != TextSelection.collapsed(offset: end)) {
      _controller.selection = TextSelection.collapsed(offset: end);
    }
    if (value.text == _last) return;
    _last = value.text;
    setState(() {});
    widget.onChanged?.call(value.text);
    if (value.text.length == widget.length) widget.onCompleted?.call(value.text);
  }

  void _startTimer() {
    _timer?.cancel();
    _left = widget.resendDelay.inSeconds;
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (!mounted) return;
      setState(() => _left = math.max(0, _left - 1));
      if (_left == 0) t.cancel();
    });
  }

  Future<void> _resend() async {
    setState(() => _sending = true);
    try {
      await widget.onResend!();
      if (!mounted) return;
      _controller.clear();
      _focus.requestFocus();
      _startTimer();
    } finally {
      if (mounted) setState(() => _sending = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final error = widget.errorText;
    final message = error ?? widget.helper;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600),
        ),
        const SizedBox(height: 8),
        LayoutBuilder(
          builder: (context, constraints) {
            const gap = 8.0;
            final available = constraints.maxWidth.isFinite
                ? constraints.maxWidth
                : double.infinity;
            final size = math.min(48.0, (available - gap * (widget.length - 1)) / widget.length);
            return Opacity(
              opacity: widget.enabled ? 1 : 0.6,
              child: Stack(
                children: [
                  Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      for (var i = 0; i < widget.length; i++)
                        Padding(
                          padding: EdgeInsets.only(left: i == 0 ? 0 : gap),
                          child: _Box(
                            width: size,
                            char: i < _controller.text.length ? _controller.text[i] : null,
                            active: _focus.hasFocus &&
                                i == math.min(_controller.text.length, widget.length - 1),
                            error: error != null,
                          ),
                        ),
                    ],
                  ),
                  // Le vrai champ, invisible, posé sur les cases.
                  Positioned.fill(
                    child: Semantics(
                      label: widget.label,
                      child: TextField(
                        controller: _controller,
                        focusNode: _focus,
                        autofocus: widget.autofocus,
                        enabled: widget.enabled,
                        keyboardType: TextInputType.number,
                        autofillHints: const [AutofillHints.oneTimeCode],
                        inputFormatters: [_OtpFormatter(widget.length)],
                        showCursor: false,
                        style: const TextStyle(color: Colors.transparent, fontSize: 1),
                        decoration: const InputDecoration.collapsed(hintText: ''),
                      ),
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        if (message != null) ...[
          const SizedBox(height: 8),
          Text(
            message,
            style: theme.textTheme.bodySmall?.copyWith(
              color: error != null ? scheme.error : scheme.onSurfaceVariant,
            ),
          ),
        ],
        if (widget.onResend != null) ...[
          const SizedBox(height: 4),
          SizedBox(
            height: 40,
            child: _left > 0
                ? Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Renvoyer le code dans ${KolaOtpField.formatDelay(_left)}',
                      style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  )
                : TextButton(
                    onPressed: _sending || !widget.enabled ? null : _resend,
                    style: TextButton.styleFrom(padding: EdgeInsets.zero),
                    child: Text(_sending ? 'Envoi…' : 'Renvoyer le code'),
                  ),
          ),
        ],
      ],
    );
  }
}

class _Box extends StatelessWidget {
  const _Box({required this.width, required this.char, required this.active, required this.error});

  final double width;
  final String? char;
  final bool active;
  final bool error;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final color = error ? scheme.error : (active ? scheme.primary : scheme.outline);
    return AnimatedContainer(
      duration: const Duration(milliseconds: 120),
      width: width,
      height: width * 7 / 6,
      alignment: Alignment.center,
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: color, width: error || active ? 2 : 1),
      ),
      child: char != null
          ? Text(
              char!,
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.w600,
                color: scheme.onSurface,
              ),
            )
          : active
              ? Container(width: 2, height: width / 2, color: scheme.primary)
              : null,
    );
  }
}

class _OtpFormatter extends TextInputFormatter {
  _OtpFormatter(this.length);
  final int length;

  @override
  TextEditingValue formatEditUpdate(TextEditingValue oldValue, TextEditingValue newValue) {
    // Un code complet collé à la suite remplace tout le code au lieu de s'ajouter à la fin.
    final added = newValue.text.startsWith(oldValue.text) &&
        newValue.text.length - oldValue.text.length > 1;
    if (added) {
      final pasted = KolaOtpField.parse(newValue.text.substring(oldValue.text.length), length);
      if (pasted.length == length) {
        return TextEditingValue(
          text: pasted,
          selection: TextSelection.collapsed(offset: pasted.length),
        );
      }
    }
    final text = KolaOtpField.parse(newValue.text, length);
    return TextEditingValue(
      text: text,
      selection: TextSelection.collapsed(offset: text.length),
    );
  }
}
