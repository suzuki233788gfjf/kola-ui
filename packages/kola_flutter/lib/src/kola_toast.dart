import 'package:flutter/material.dart';

enum KolaToastType { success, error, info, warning }

/// Notifications Kola UI (succès, erreur, info, avertissement).
///
/// ```dart
/// KolaToast.show(context, 'Paiement reçu', type: KolaToastType.success);
/// ```
/// Nécessite un Scaffold (comme les SnackBar de Flutter).
class KolaToast {
  static void show(
    BuildContext context,
    String message, {
    KolaToastType type = KolaToastType.info,
    String? title,
    Duration duration = const Duration(seconds: 3),
  }) {
    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        behavior: SnackBarBehavior.floating,
        duration: duration,
        elevation: 0,
        backgroundColor: Colors.transparent,
        padding: EdgeInsets.zero,
        content: KolaToastView(message: message, type: type, title: title),
      ),
    );
  }
}

/// L'apparence d'une notification (utilisée par [KolaToast.show]).
class KolaToastView extends StatelessWidget {
  const KolaToastView({
    super.key,
    required this.message,
    this.type = KolaToastType.info,
    this.title,
  });

  final String message;
  final KolaToastType type;
  final String? title;

  static (Color, IconData) style(KolaToastType type, ColorScheme scheme) => switch (type) {
        KolaToastType.success => (scheme.primary, Icons.check_circle_rounded),
        KolaToastType.error => (scheme.error, Icons.error_rounded),
        KolaToastType.info => (const Color(0xFF2D4A8A), Icons.info_rounded),
        KolaToastType.warning => (const Color(0xFF7A4E12), Icons.warning_amber_rounded),
      };

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final (color, icon) = style(type, scheme);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: scheme.outlineVariant),
        boxShadow: const [
          BoxShadow(color: Color(0x22000000), blurRadius: 24, offset: Offset(0, 8)),
        ],
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                if (title != null)
                  Text(
                    title!,
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.w700,
                      color: scheme.onSurface,
                    ),
                  ),
                Text(
                  message,
                  style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurface),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
