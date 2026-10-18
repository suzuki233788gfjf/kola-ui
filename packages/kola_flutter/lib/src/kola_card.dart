import 'package:flutter/material.dart';

/// Carte Kola UI : produit, article, profil…
///
/// ```dart
/// KolaCard(
///   media: Image.network(url, fit: BoxFit.cover),
///   title: 'Riz parfumé 5 kg',
///   subtitle: 'Épicerie',
///   footer: Text('4 500 FCFA'),
///   onTap: () {},
/// );
/// ```
class KolaCard extends StatelessWidget {
  const KolaCard({
    super.key,
    this.media,
    this.mediaHeight = 140,
    this.badge,
    required this.title,
    this.subtitle,
    this.footer,
    this.onTap,
  });

  /// Image ou illustration en haut de la carte.
  final Widget? media;
  final double mediaHeight;

  /// Petite étiquette posée sur l'image (ex. « Nouveau », « -20 % »).
  final String? badge;
  final String title;
  final String? subtitle;

  /// Ligne du bas : prix, bouton, auteur…
  final Widget? footer;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Material(
      color: scheme.surface,
      clipBehavior: Clip.antiAlias,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
        side: BorderSide(color: scheme.outlineVariant),
      ),
      child: InkWell(
        onTap: onTap,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            if (media != null)
              SizedBox(
                height: mediaHeight,
                child: Stack(
                  fit: StackFit.expand,
                  children: [
                    ColoredBox(color: scheme.surfaceContainerHighest, child: media),
                    if (badge != null)
                      Positioned(
                        top: 10,
                        left: 10,
                        child: Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                          decoration: BoxDecoration(
                            color: scheme.primary,
                            borderRadius: BorderRadius.circular(99),
                          ),
                          child: Text(
                            badge!,
                            style: theme.textTheme.labelSmall?.copyWith(
                              color: scheme.onPrimary,
                              fontWeight: FontWeight.w700,
                            ),
                          ),
                        ),
                      ),
                  ],
                ),
              ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text(
                    title,
                    style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
                  ),
                  if (subtitle != null) ...[
                    const SizedBox(height: 4),
                    Text(
                      subtitle!,
                      style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ],
                  if (footer != null) ...[
                    const SizedBox(height: 12),
                    DefaultTextStyle.merge(
                      style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
                      child: footer!,
                    ),
                  ],
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

/// Carte statistique : un chiffre clé et son évolution.
///
/// ```dart
/// KolaStatCard(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5);
/// ```
class KolaStatCard extends StatelessWidget {
  const KolaStatCard({
    super.key,
    required this.label,
    required this.value,
    this.change,
    this.icon,
  });

  final String label;
  final String value;

  /// Évolution en % (positive = hausse, négative = baisse).
  final double? change;
  final IconData? icon;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final up = (change ?? 0) >= 0;
    final changeColor = up ? scheme.primary : scheme.error;
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.outlineVariant),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  label,
                  style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                ),
              ),
              if (icon != null) Icon(icon, size: 20, color: scheme.onSurfaceVariant),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            value,
            style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w800),
          ),
          if (change != null) ...[
            const SizedBox(height: 8),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Icon(
                  up ? Icons.trending_up_rounded : Icons.trending_down_rounded,
                  size: 18,
                  color: changeColor,
                ),
                const SizedBox(width: 4),
                Text(
                  '${up ? '+' : ''}${change!.toStringAsFixed(1).replaceAll('.', ',')} %',
                  style: theme.textTheme.labelLarge?.copyWith(
                    color: changeColor,
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ],
            ),
          ],
        ],
      ),
    );
  }
}
