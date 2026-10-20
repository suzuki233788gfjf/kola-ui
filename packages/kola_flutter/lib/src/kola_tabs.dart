import 'package:flutter/material.dart';

/// Un onglet : un libellé, une icône facultative et un compteur facultatif.
class KolaTabItem {
  const KolaTabItem({required this.label, this.icon, this.badge});

  final String label;

  /// Obligatoire pour [KolaBottomNav], facultative pour [KolaTabs].
  final IconData? icon;

  /// Petit compteur (ex. 3 commandes en cours). Masqué si null ou 0, '99+' au-delà de 99.
  final int? badge;
}

enum KolaTabsVariant { underline, pills }

/// Onglets en haut d'une page. Tu affiches toi-même le contenu de l'onglet choisi.
///
/// ```dart
/// int onglet = 0;
///
/// KolaTabs(
///   items: const [
///     KolaTabItem(label: 'En cours', badge: 3),
///     KolaTabItem(label: 'Livrées'),
///     KolaTabItem(label: 'Annulées'),
///   ],
///   selected: onglet,
///   onChanged: (i) => setState(() => onglet = i),
/// );
/// ```
class KolaTabs extends StatelessWidget {
  const KolaTabs({
    super.key,
    required this.items,
    required this.selected,
    required this.onChanged,
    this.variant = KolaTabsVariant.underline,
    this.expand = false,
  });

  final List<KolaTabItem> items;
  final int selected;
  final ValueChanged<int> onChanged;

  /// Soulignés (par défaut) ou pastilles.
  final KolaTabsVariant variant;

  /// Les onglets se partagent toute la largeur au lieu de défiler.
  final bool expand;

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final pills = variant == KolaTabsVariant.pills;

    final tabs = [
      for (var i = 0; i < items.length; i++)
        _Tab(
          item: items[i],
          selected: i == selected,
          pills: pills,
          compact: expand,
          onTap: () => onChanged(i),
        ),
    ];
    final row = Row(
      mainAxisSize: expand ? MainAxisSize.max : MainAxisSize.min,
      children: [
        for (final t in tabs)
          if (expand) Expanded(child: t) else t,
      ],
    );
    final bar = expand
        ? row
        : SingleChildScrollView(scrollDirection: Axis.horizontal, child: row);

    if (pills) {
      return Container(
        padding: const EdgeInsets.all(4),
        decoration: BoxDecoration(
          color: scheme.surfaceContainerHighest,
          borderRadius: BorderRadius.circular(14),
        ),
        child: bar,
      );
    }
    return DecoratedBox(
      decoration: BoxDecoration(
        border: Border(bottom: BorderSide(color: scheme.outlineVariant)),
      ),
      child: bar,
    );
  }
}

class _Tab extends StatelessWidget {
  const _Tab({required this.item, required this.selected, required this.pills, required this.compact, required this.onTap});

  final KolaTabItem item;
  final bool selected;
  final bool pills;

  /// Pleine largeur : marges intérieures réduites.
  final bool compact;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final color = pills
        ? (selected ? scheme.onSurface : scheme.onSurfaceVariant)
        : (selected ? scheme.primary : scheme.onSurfaceVariant);

    final content = Row(
      mainAxisSize: MainAxisSize.min,
      mainAxisAlignment: MainAxisAlignment.center,
      children: [
        if (item.icon != null) ...[
          Icon(item.icon, size: 18, color: color),
          const SizedBox(width: 8),
        ],
        Flexible(
          child: Text(
            item.label,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600, color: color),
          ),
        ),
        if ((item.badge ?? 0) > 0) ...[
          const SizedBox(width: 8),
          KolaBadge(count: item.badge!),
        ],
      ],
    );

    return MergeSemantics(
      child: Semantics(
        selected: selected,
        button: true,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(pills ? 10 : 0),
          child: pills
              ? AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  constraints: const BoxConstraints(minHeight: 40),
                  padding: EdgeInsets.symmetric(horizontal: compact ? 8 : 14),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color: selected ? scheme.surface : Colors.transparent,
                    borderRadius: BorderRadius.circular(10),
                    boxShadow: selected
                        ? [BoxShadow(color: Colors.black.withValues(alpha: 0.08), blurRadius: 4, offset: const Offset(0, 1))]
                        : null,
                  ),
                  child: content,
                )
              : AnimatedContainer(
                  duration: const Duration(milliseconds: 150),
                  constraints: const BoxConstraints(minHeight: 48),
                  padding: EdgeInsets.symmetric(horizontal: compact ? 8 : 16),
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    border: Border(
                      bottom: BorderSide(color: selected ? scheme.primary : Colors.transparent, width: 2),
                    ),
                  ),
                  child: content,
                ),
        ),
      ),
    );
  }
}

/// Barre d'onglets en bas d'une app mobile (3 à 5 onglets, avec icône).
///
/// ```dart
/// Scaffold(
///   body: pages[onglet],
///   bottomNavigationBar: KolaBottomNav(
///     items: const [
///       KolaTabItem(label: 'Accueil', icon: Icons.home_outlined),
///       KolaTabItem(label: 'Commandes', icon: Icons.receipt_long_outlined, badge: 2),
///       KolaTabItem(label: 'Profil', icon: Icons.person_outline),
///     ],
///     selected: onglet,
///     onChanged: (i) => setState(() => onglet = i),
///   ),
/// );
/// ```
class KolaBottomNav extends StatelessWidget {
  const KolaBottomNav({
    super.key,
    required this.items,
    required this.selected,
    required this.onChanged,
  }) : assert(items.length >= 2 && items.length <= 5);

  final List<KolaTabItem> items;
  final int selected;
  final ValueChanged<int> onChanged;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return Material(
      color: scheme.surface,
      child: DecoratedBox(
        decoration: BoxDecoration(border: Border(top: BorderSide(color: scheme.outlineVariant))),
        child: SafeArea(
          top: false,
          child: SizedBox(
            height: 68,
            child: Row(
              children: [
                for (var i = 0; i < items.length; i++)
                  Expanded(child: _NavItem(item: items[i], selected: i == selected, onTap: () => onChanged(i))),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  const _NavItem({required this.item, required this.selected, required this.onTap});

  final KolaTabItem item;
  final bool selected;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final color = selected ? scheme.primary : scheme.onSurfaceVariant;
    return MergeSemantics(
      child: Semantics(
        selected: selected,
        button: true,
        child: InkWell(
          onTap: onTap,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Stack(
                clipBehavior: Clip.none,
                children: [
                  AnimatedContainer(
                    duration: const Duration(milliseconds: 150),
                    width: 56,
                    height: 30,
                    decoration: BoxDecoration(
                      color: selected ? scheme.primary.withValues(alpha: 0.12) : Colors.transparent,
                      borderRadius: BorderRadius.circular(15),
                    ),
                    child: Icon(item.icon ?? Icons.circle_outlined, size: 22, color: color),
                  ),
                  if ((item.badge ?? 0) > 0)
                    Positioned(top: -4, right: 8, child: KolaBadge(count: item.badge!)),
                ],
              ),
              const SizedBox(height: 4),
              Text(
                item.label,
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
                style: theme.textTheme.labelSmall?.copyWith(
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.w600 : FontWeight.w500,
                  color: color,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

/// Petit compteur rond : 3, 12, 99+.
class KolaBadge extends StatelessWidget {
  const KolaBadge({super.key, required this.count});

  final int count;

  /// 3 → '3', 120 → '99+'
  static String label(int count) => count > 99 ? '99+' : '$count';

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    return Container(
      constraints: const BoxConstraints(minWidth: 20),
      height: 20,
      padding: const EdgeInsets.symmetric(horizontal: 6),
      alignment: Alignment.center,
      decoration: BoxDecoration(color: scheme.primary, borderRadius: BorderRadius.circular(10)),
      child: Text(
        label(count),
        style: TextStyle(fontSize: 11, fontWeight: FontWeight.w700, color: scheme.onPrimary, height: 1),
      ),
    );
  }
}
