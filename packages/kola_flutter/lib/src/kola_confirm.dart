import 'package:flutter/material.dart';

/// Boîte de confirmation Kola UI, en une ligne.
///
/// ```dart
/// final ok = await KolaConfirm.show(
///   context,
///   title: 'Supprimer cet article ?',
///   message: 'Cette action est définitive.',
///   confirmLabel: 'Supprimer',
///   destructive: true,
/// );
/// if (ok) { /* supprimer */ }
/// ```
class KolaConfirm {
  /// Renvoie true si l'utilisateur confirme, false sinon.
  /// [sheet] : true pour un panneau qui monte du bas (pratique sur mobile).
  static Future<bool> show(
    BuildContext context, {
    required String title,
    String? message,
    String confirmLabel = 'Confirmer',
    String cancelLabel = 'Annuler',
    bool destructive = false,
    bool sheet = false,
  }) async {
    final content = KolaConfirmContent(
      title: title,
      message: message,
      confirmLabel: confirmLabel,
      cancelLabel: cancelLabel,
      destructive: destructive,
    );
    final result = sheet
        ? await showModalBottomSheet<bool>(
            context: context,
            showDragHandle: true,
            builder: (_) => SafeArea(child: content),
          )
        : await showDialog<bool>(
            context: context,
            builder: (_) => Dialog(
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 400),
                child: content,
              ),
            ),
          );
    return result ?? false;
  }
}

/// Le contenu de la confirmation (utilisé par [KolaConfirm.show]).
class KolaConfirmContent extends StatelessWidget {
  const KolaConfirmContent({
    super.key,
    required this.title,
    this.message,
    this.confirmLabel = 'Confirmer',
    this.cancelLabel = 'Annuler',
    this.destructive = false,
  });

  final String title;
  final String? message;
  final String confirmLabel;
  final String cancelLabel;
  final bool destructive;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 24, 24, 16),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            title,
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          if (message != null) ...[
            const SizedBox(height: 8),
            Text(
              message!,
              style: theme.textTheme.bodyMedium?.copyWith(
                color: scheme.onSurfaceVariant,
                height: 1.5,
              ),
            ),
          ],
          const SizedBox(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              TextButton(
                onPressed: () => Navigator.pop(context, false),
                child: Text(cancelLabel),
              ),
              const SizedBox(width: 8),
              FilledButton(
                style: destructive
                    ? FilledButton.styleFrom(
                        backgroundColor: scheme.error,
                        foregroundColor: scheme.onError,
                      )
                    : null,
                onPressed: () => Navigator.pop(context, true),
                child: Text(confirmLabel),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
