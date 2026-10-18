import 'package:flutter/material.dart';

import 'kola_amount_field.dart';
import 'kola_phone_field.dart';

/// Ce que le formulaire envoie quand le client clique sur « Payer ».
class KolaMobileMoneyRequest {
  const KolaMobileMoneyRequest({
    required this.phone,
    required this.operator,
    required this.amount,
  });

  /// Numéro sans espaces, ex. '677123456'.
  final String phone;
  final KolaOperator operator;

  /// Montant en FCFA.
  final int amount;
}

/// Lance cette exception dans [KolaMobileMoneyForm.onPay] pour afficher
/// ton propre message d'échec (ex. 'Solde insuffisant').
class KolaMobileMoneyException implements Exception {
  const KolaMobileMoneyException(this.message);
  final String message;

  @override
  String toString() => message;
}

enum _Step { form, pending, success, failure }

/// Formulaire de paiement Mobile Money (MTN MoMo, Orange Money).
///
/// Le composant gère l'interface : saisie, attente de confirmation, succès, échec.
/// Le paiement lui-même passe par TON fournisseur (Campay, Notch Pay, CinetPay…),
/// que tu appelles dans [onPay].
///
/// ```dart
/// KolaMobileMoneyForm(
///   onPay: (demande) async {
///     // Appelle ton fournisseur ici, puis attends la confirmation du client.
///     // En cas d'échec : throw KolaMobileMoneyException('Solde insuffisant');
///   },
/// );
/// ```
class KolaMobileMoneyForm extends StatefulWidget {
  const KolaMobileMoneyForm({
    super.key,
    required this.onPay,
    this.amount,
    this.minAmount = 100,
    this.title = 'Payer par Mobile Money',
  });

  /// Appelé au clic sur « Payer ». Le Future doit se terminer quand le client
  /// a confirmé le paiement ; lance une exception en cas d'échec.
  final Future<void> Function(KolaMobileMoneyRequest request) onPay;

  /// Montant imposé (ex. prix d'un produit). Si null, le client le saisit.
  final int? amount;
  final int minAmount;
  final String title;

  @override
  State<KolaMobileMoneyForm> createState() => _KolaMobileMoneyFormState();
}

class _KolaMobileMoneyFormState extends State<KolaMobileMoneyForm> {
  final _formKey = GlobalKey<FormState>();
  final _phone = TextEditingController();
  final _amount = TextEditingController();

  KolaOperator? _operator;
  _Step _step = _Step.form;
  String? _formError;
  String? _failure;
  KolaMobileMoneyRequest? _request;
  int _attempt = 0;

  @override
  void initState() {
    super.initState();
    _phone.addListener(_onPhoneChanged);
    _amount.addListener(_refresh);
  }

  @override
  void dispose() {
    _phone.dispose();
    _amount.dispose();
    super.dispose();
  }

  void _refresh() => setState(() {});

  void _onPhoneChanged() {
    final detected = KolaPhoneField.detectOperator(_phone.text);
    setState(() {
      if (detected != null) _operator = detected;
    });
  }

  int? get _currentAmount =>
      widget.amount ?? KolaAmountField.parse(_amount.text);

  Future<void> _pay() async {
    setState(() => _formError = null);
    final phoneOk = _formKey.currentState?.validate() ?? false;
    final amount = _currentAmount;

    if (amount == null || amount < widget.minAmount) {
      setState(() => _formError =
          'Indique un montant d\'au moins ${KolaAmountField.format(widget.minAmount)} FCFA');
      return;
    }
    if (!phoneOk) return;
    if (_operator == null) {
      setState(() => _formError = 'Choisis ton opérateur');
      return;
    }

    final request = KolaMobileMoneyRequest(
      phone: _phone.text.replaceAll(' ', ''),
      operator: _operator!,
      amount: amount,
    );
    final attempt = ++_attempt;
    setState(() {
      _request = request;
      _step = _Step.pending;
    });

    try {
      await widget.onPay(request);
      if (!mounted || attempt != _attempt) return;
      setState(() => _step = _Step.success);
    } catch (e) {
      if (!mounted || attempt != _attempt) return;
      setState(() {
        _failure = e is KolaMobileMoneyException
            ? e.message
            : 'Solde insuffisant ou demande refusée. Aucun montant n\'a été débité.';
        _step = _Step.failure;
      });
    }
  }

  void _backToForm() {
    setState(() {
      _attempt++; // ignore le résultat d'une demande abandonnée
      _step = _Step.form;
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      padding: const EdgeInsets.all(24),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: AnimatedSwitcher(
        duration: const Duration(milliseconds: 200),
        child: switch (_step) {
          _Step.form => _buildForm(context),
          _Step.pending => _buildPending(context),
          _Step.success => _buildSuccess(context),
          _Step.failure => _buildFailure(context),
        },
      ),
    );
  }

  Widget _buildForm(BuildContext context) {
    final theme = Theme.of(context);
    final amount = _currentAmount;
    return Form(
      key: _formKey,
      child: Column(
        key: const ValueKey('form'),
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            widget.title,
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 20),
          Row(
            children: [
              _operatorTile(context, KolaOperator.mtn),
              const SizedBox(width: 10),
              _operatorTile(context, KolaOperator.orange),
            ],
          ),
          const SizedBox(height: 20),
          KolaPhoneField(controller: _phone),
          const SizedBox(height: 16),
          if (widget.amount == null)
            KolaAmountField(controller: _amount, min: widget.minAmount)
          else
            Row(
              children: [
                Expanded(child: Text('Montant', style: theme.textTheme.labelLarge)),
                Text(
                  '${KolaAmountField.format(widget.amount!)} FCFA',
                  style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                ),
              ],
            ),
          if (_formError != null) ...[
            const SizedBox(height: 12),
            Text(
              _formError!,
              style: theme.textTheme.bodyMedium?.copyWith(color: theme.colorScheme.error),
            ),
          ],
          const SizedBox(height: 20),
          FilledButton(
            onPressed: _pay,
            child: Text(
              amount == null ? 'Payer' : 'Payer ${KolaAmountField.format(amount)} FCFA',
            ),
          ),
          const SizedBox(height: 12),
          Text(
            'Tu recevras une demande de confirmation sur ton téléphone.',
            textAlign: TextAlign.center,
            style: theme.textTheme.bodySmall?.copyWith(
              color: theme.colorScheme.onSurfaceVariant,
            ),
          ),
        ],
      ),
    );
  }

  Widget _operatorTile(BuildContext context, KolaOperator op) {
    final scheme = Theme.of(context).colorScheme;
    final selected = _operator == op;
    final isMtn = op == KolaOperator.mtn;
    return Expanded(
      child: Semantics(
        button: true,
        selected: selected,
        child: Material(
          color: selected ? scheme.primary.withValues(alpha: 0.08) : scheme.surface,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: BorderSide(
              color: selected ? scheme.primary : scheme.outline,
              width: selected ? 2 : 1,
            ),
          ),
          child: InkWell(
            borderRadius: BorderRadius.circular(12),
            onTap: () => setState(() => _operator = op),
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
              child: Row(
                children: [
                  Container(
                    width: 16,
                    height: 16,
                    decoration: BoxDecoration(
                      color: isMtn ? const Color(0xFFFFCB05) : const Color(0xFFFF7900),
                      shape: BoxShape.circle,
                    ),
                  ),
                  const SizedBox(width: 8),
                  Flexible(
                    child: Text(
                      _operatorName(op),
                      overflow: TextOverflow.ellipsis,
                      style: const TextStyle(fontWeight: FontWeight.w600),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildPending(BuildContext context) {
    final r = _request!;
    return _StatusView(
      key: const ValueKey('pending'),
      icon: const SizedBox(
        width: 48,
        height: 48,
        child: CircularProgressIndicator(strokeWidth: 4),
      ),
      title: 'Confirme sur ton téléphone',
      message:
          'Une demande de ${KolaAmountField.format(r.amount)} FCFA a été envoyée au '
          '${KolaPhoneField.format(r.phone)}. Valide-la avec ton code secret '
          '${_operatorName(r.operator)}.',
      action: OutlinedButton(onPressed: _backToForm, child: const Text('Annuler')),
    );
  }

  Widget _buildSuccess(BuildContext context) {
    final r = _request!;
    final scheme = Theme.of(context).colorScheme;
    return _StatusView(
      key: const ValueKey('success'),
      icon: CircleAvatar(
        radius: 28,
        backgroundColor: scheme.primary.withValues(alpha: 0.12),
        child: Icon(Icons.check_rounded, size: 32, color: scheme.primary),
      ),
      title: 'Paiement reçu',
      message:
          '${KolaAmountField.format(r.amount)} FCFA · ${_operatorName(r.operator)} · '
          '${KolaPhoneField.format(r.phone)}',
      action: OutlinedButton(
        onPressed: _backToForm,
        child: const Text('Nouveau paiement'),
      ),
    );
  }

  Widget _buildFailure(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return _StatusView(
      key: const ValueKey('failure'),
      icon: CircleAvatar(
        radius: 28,
        backgroundColor: scheme.error.withValues(alpha: 0.12),
        child: Icon(Icons.close_rounded, size: 32, color: scheme.error),
      ),
      title: 'Paiement non abouti',
      message: _failure ?? '',
      action: FilledButton(onPressed: _backToForm, child: const Text('Réessayer')),
    );
  }

  static String _operatorName(KolaOperator op) =>
      op == KolaOperator.mtn ? 'MTN MoMo' : 'Orange Money';
}

class _StatusView extends StatelessWidget {
  const _StatusView({
    super.key,
    required this.icon,
    required this.title,
    required this.message,
    required this.action,
  });

  final Widget icon;
  final String title;
  final String message;
  final Widget action;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const SizedBox(height: 16),
        Center(child: icon),
        const SizedBox(height: 16),
        Text(
          title,
          textAlign: TextAlign.center,
          style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
        ),
        const SizedBox(height: 8),
        Text(
          message,
          textAlign: TextAlign.center,
          style: theme.textTheme.bodyMedium?.copyWith(
            color: theme.colorScheme.onSurfaceVariant,
            height: 1.5,
          ),
        ),
        const SizedBox(height: 24),
        action,
      ],
    );
  }
}
