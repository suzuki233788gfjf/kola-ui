import 'package:flutter/material.dart';

import '../kola_button.dart';
import '../kola_otp_field.dart';
import '../kola_phone_field.dart';

/// Bloc « Connexion par téléphone » : numéro +237, puis code reçu par SMS.
///
/// Le bloc gère l'écran ; l'envoi du SMS et la vérification passent par TON serveur
/// (Firebase Auth, ton API…), que tu appelles dans [onSendCode] et [onVerify].
///
/// ```dart
/// KolaPhoneLogin(
///   onSendCode: (numero) async {
///     // Demande à ton serveur d'envoyer un SMS au +237 numero.
///   },
///   onVerify: (numero, code) async {
///     // Renvoie true si le code est le bon.
///     return true;
///   },
///   onSuccess: (numero) => Navigator.of(context).pushReplacementNamed('/accueil'),
/// );
/// ```
class KolaPhoneLogin extends StatefulWidget {
  const KolaPhoneLogin({
    super.key,
    required this.onSendCode,
    required this.onVerify,
    this.onSuccess,
    this.title = 'Connexion',
    this.codeLength = 6,
  });

  /// Envoie le code par SMS. Reçoit le numéro sans espaces (ex. '677123456').
  final Future<void> Function(String phone) onSendCode;

  /// Vérifie le code. Renvoie true si c'est le bon.
  final Future<bool> Function(String phone, String code) onVerify;

  /// Appelé une fois connecté.
  final ValueChanged<String>? onSuccess;
  final String title;
  final int codeLength;

  @override
  State<KolaPhoneLogin> createState() => _KolaPhoneLoginState();
}

enum _Step { phone, code, done }

class _KolaPhoneLoginState extends State<KolaPhoneLogin> {
  final _phoneController = TextEditingController();
  final _code = TextEditingController();
  _Step _step = _Step.phone;
  String _phone = '';
  bool _busy = false;
  String? _error;

  bool get _valid => KolaPhoneField.validate(_phone) == null;

  @override
  void dispose() {
    _phoneController.dispose();
    _code.dispose();
    super.dispose();
  }

  Future<void> _send() async {
    if (!_valid) return;
    setState(() {
      _busy = true;
      _error = null;
    });
    try {
      await widget.onSendCode(_phone);
      if (!mounted) return;
      _code.clear();
      setState(() => _step = _Step.code);
    } catch (_) {
      if (mounted) setState(() => _error = 'Impossible d\'envoyer le SMS. Réessaie.');
    } finally {
      if (mounted) setState(() => _busy = false);
    }
  }

  Future<void> _verify(String code) async {
    setState(() {
      _busy = true;
      _error = null;
    });
    String? error;
    try {
      final ok = await widget.onVerify(_phone, code);
      if (!mounted) return;
      if (ok) {
        setState(() => _step = _Step.done);
        widget.onSuccess?.call(_phone);
      } else {
        error = 'Code incorrect. Réessaie.';
      }
    } catch (_) {
      error = 'Vérification impossible. Réessaie.';
    }
    if (!mounted) return;
    // On vide d'abord le code (ça efface l'erreur), puis on affiche l'erreur.
    if (error != null) _code.clear();
    setState(() {
      _busy = false;
      _error = error;
    });
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final titleStyle = theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700);
    final textStyle = theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant, height: 1.4);
    final phone = '+237 ${KolaPhoneField.format(_phone)}';

    final Widget content = switch (_step) {
      _Step.phone => Column(
          key: const ValueKey('phone'),
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(widget.title, style: titleStyle),
            const SizedBox(height: 6),
            Text('Entre ton numéro : on t\'envoie un code par SMS.', style: textStyle),
            const SizedBox(height: 20),
            KolaPhoneField(
              label: 'Numéro de téléphone',
              controller: _phoneController,
              onChanged: (v) => setState(() {
                _phone = v;
                _error = null;
              }),
            ),
            if (_error != null) ...[
              const SizedBox(height: 12),
              Text(_error!, style: theme.textTheme.bodySmall?.copyWith(color: scheme.error)),
            ],
            const SizedBox(height: 20),
            KolaButton(label: 'Recevoir le code', loading: _busy, expanded: true, onPressed: _valid ? _send : null),
          ],
        ),
      _Step.code => Column(
          key: const ValueKey('code'),
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisSize: MainAxisSize.min,
          children: [
            TextButton.icon(
              onPressed: _busy ? null : () => setState(() {
                _step = _Step.phone;
                _error = null;
              }),
              style: TextButton.styleFrom(padding: EdgeInsets.zero),
              icon: const Icon(Icons.arrow_back, size: 18),
              label: const Text('Modifier le numéro'),
            ),
            const SizedBox(height: 8),
            Text('Vérifie ton numéro', style: titleStyle),
            const SizedBox(height: 6),
            Text.rich(
              TextSpan(children: [
                const TextSpan(text: 'Code envoyé au '),
                TextSpan(text: phone, style: const TextStyle(fontWeight: FontWeight.w600)),
                const TextSpan(text: '.'),
              ]),
              style: textStyle,
            ),
            const SizedBox(height: 20),
            KolaOtpField(
              controller: _code,
              length: widget.codeLength,
              autofocus: true,
              errorText: _error,
              onChanged: (_) {
                if (_error != null) setState(() => _error = null);
              },
              onCompleted: _verify,
              onResend: () => widget.onSendCode(_phone),
            ),
            if (_busy) ...[
              const SizedBox(height: 12),
              Row(
                children: [
                  const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2)),
                  const SizedBox(width: 8),
                  Text('Vérification…', style: textStyle),
                ],
              ),
            ],
          ],
        ),
      _Step.done => Column(
          key: const ValueKey('done'),
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(color: scheme.primary.withValues(alpha: 0.12), shape: BoxShape.circle),
              child: Icon(Icons.check, size: 32, color: scheme.primary),
            ),
            const SizedBox(height: 16),
            Text('Bienvenue !', style: titleStyle),
            const SizedBox(height: 6),
            Text('Tu es connecté avec le $phone.', textAlign: TextAlign.center, style: textStyle),
          ],
        ),
    };

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 400),
      child: Container(
        padding: const EdgeInsets.all(28),
        decoration: BoxDecoration(
          color: scheme.surface,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: AnimatedSwitcher(duration: const Duration(milliseconds: 200), child: content),
      ),
    );
  }
}
