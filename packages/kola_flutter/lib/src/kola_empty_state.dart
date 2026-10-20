import 'package:flutter/material.dart';

enum KolaEmptyTone { neutral, error }

/// Écran vide ou d'erreur : une icône, un titre, un message et une action.
///
/// ```dart
/// KolaEmptyState(
///   icon: Icons.receipt_long_outlined,
///   title: 'Aucune commande pour le moment',
///   message: 'Tes commandes apparaîtront ici dès qu\'un client achète.',
///   action: KolaButton(label: 'Partager ma boutique', onPressed: () {}),
/// );
///
/// KolaEmptyState(
///   tone: KolaEmptyTone.error,
///   icon: Icons.wifi_off,
///   title: 'Pas de connexion',
///   message: 'Vérifie ta connexion internet puis réessaie.',
///   action: KolaButton(label: 'Réessayer', onPressed: recharger),
/// );
/// ```
class KolaEmptyState extends StatelessWidget {
  const KolaEmptyState({
    super.key,
    required this.title,
    this.icon = Icons.inbox_outlined,
    this.message,
    this.action,
    this.tone = KolaEmptyTone.neutral,
  });

  final String title;
  final IconData icon;
  final String? message;

  /// Un bouton, par exemple KolaButton.
  final Widget? action;
  final KolaEmptyTone tone;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final color = tone == KolaEmptyTone.error ? scheme.error : scheme.primary;

    return Semantics(
      container: true,
      liveRegion: tone == KolaEmptyTone.error,
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 32),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 64,
              height: 64,
              decoration: BoxDecoration(color: color.withValues(alpha: 0.12), shape: BoxShape.circle),
              child: Icon(icon, size: 30, color: color),
            ),
            const SizedBox(height: 16),
            Text(
              title,
              textAlign: TextAlign.center,
              style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
            ),
            if (message != null) ...[
              const SizedBox(height: 6),
              ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 320),
                child: Text(
                  message!,
                  textAlign: TextAlign.center,
                  style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant, height: 1.4),
                ),
              ),
            ],
            if (action != null) ...[
              const SizedBox(height: 20),
              action!,
            ],
          ],
        ),
      ),
    );
  }
}

/// Forme grise qui pulse doucement pendant le chargement.
///
/// ```dart
/// const KolaSkeleton(width: 120, height: 14);
/// const KolaSkeleton.circle(size: 40);
/// ```
class KolaSkeleton extends StatefulWidget {
  const KolaSkeleton({super.key, this.width, this.height = 14, this.radius = 6}) : _circle = false;

  const KolaSkeleton.circle({super.key, double size = 40})
      : width = size,
        height = size,
        radius = size / 2,
        _circle = true;

  /// null : toute la largeur disponible.
  final double? width;
  final double height;
  final double radius;
  final bool _circle;

  @override
  State<KolaSkeleton> createState() => _KolaSkeletonState();
}

class _KolaSkeletonState extends State<KolaSkeleton> with SingleTickerProviderStateMixin {
  late final AnimationController _pulse = AnimationController(
    vsync: this,
    duration: const Duration(milliseconds: 900),
    lowerBound: 0.45,
    upperBound: 1,
  );

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Pas d'animation si le téléphone demande moins de mouvement.
    if (MediaQuery.maybeDisableAnimationsOf(context) ?? false) {
      _pulse.value = 1;
      _pulse.stop();
    } else if (!_pulse.isAnimating) {
      _pulse.repeat(reverse: true);
    }
  }

  @override
  void dispose() {
    _pulse.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return FadeTransition(
      opacity: _pulse,
      child: Container(
        width: widget.width,
        height: widget.height,
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: widget._circle ? null : BorderRadius.circular(widget.radius),
          shape: widget._circle ? BoxShape.circle : BoxShape.rectangle,
        ),
      ),
    );
  }
}

/// Liste en cours de chargement : [rows] lignes avec avatar, titre et sous-titre.
///
/// ```dart
/// chargement ? const KolaSkeletonList(rows: 4) : MaListe(...)
/// ```
class KolaSkeletonList extends StatelessWidget {
  const KolaSkeletonList({super.key, this.rows = 3, this.avatar = true});

  final int rows;
  final bool avatar;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Chargement…',
      container: true,
      child: ExcludeSemantics(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            for (var i = 0; i < rows; i++)
              Padding(
                padding: const EdgeInsets.symmetric(vertical: 10),
                child: Row(
                  children: [
                    if (avatar) ...[
                      const KolaSkeleton.circle(size: 40),
                      const SizedBox(width: 12),
                    ],
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          FractionallySizedBox(widthFactor: i.isEven ? 0.7 : 0.55, child: const KolaSkeleton(height: 14)),
                          const SizedBox(height: 8),
                          FractionallySizedBox(widthFactor: i.isEven ? 0.45 : 0.6, child: const KolaSkeleton(height: 12)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 12),
                    const KolaSkeleton(width: 56, height: 14),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }
}
