
import 'package:flutter/material.dart';

enum KolaButtonVariant { primary, secondary, outline, text }

/// Bouton Kola UI.
///
/// ```dart
/// KolaButton(label: 'Valider', onPressed: () {});
/// KolaButton(label: 'Envoi…', loading: true, onPressed: () {});
/// ```
class KolaButton extends StatelessWidget {
  const KolaButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.variant = KolaButtonVariant.primary,
    this.icon,
    this.loading = false,
    this.expanded = false,
  });

  final String label;
  final VoidCallback? onPressed;
  final KolaButtonVariant variant;
  final IconData? icon;
  final bool loading;
  final bool expanded;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;

    final Color foreground = switch (variant) {
      KolaButtonVariant.primary => scheme.onPrimary,
      KolaButtonVariant.secondary => scheme.onSecondaryContainer,
      _ => scheme.primary,
    };

    final content = Row(
      mainAxisSize: expanded ? MainAxisSize.max : MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (loading)
          SizedBox(
            width: 18,
            height: 18,
            child: CircularProgressIndicator(
              strokeWidth: 2,
              color: foreground,
            ),
          )
        else if (icon != null)
          Icon(icon, size: 18),
        if (loading || icon != null) const SizedBox(width: 8),
        Text(label),
      ],
    );

    final Widget button = switch (variant) {
      KolaButtonVariant.primary =>
        FilledButton(onPressed: onPressed, child: content),
      KolaButtonVariant.secondary =>
        FilledButton.tonal(onPressed: onPressed, child: content),
      KolaButtonVariant.outline =>
        OutlinedButton(onPressed: onPressed, child: content),
      KolaButtonVariant.text =>
        TextButton(onPressed: onPressed, child: content),
    };

    return IgnorePointer(
      ignoring: loading,
      child: expanded
          ? SizedBox(width: double.infinity, child: button)
          : button,
    );
  }
}
