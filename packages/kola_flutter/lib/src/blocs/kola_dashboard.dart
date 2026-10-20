import 'package:flutter/material.dart';

import '../kola_amount_field.dart';
import '../kola_card.dart';
import '../kola_data_table.dart';
import '../kola_empty_state.dart';
import '../kola_tabs.dart';

enum KolaOrderStatus { pending, delivered, cancelled }

/// Une commande du tableau de bord.
class KolaOrder {
  const KolaOrder({required this.id, required this.customer, required this.total, required this.status});

  /// Numéro affiché, ex. '#1042'.
  final String id;
  final String customer;

  /// Montant en FCFA.
  final int total;
  final KolaOrderStatus status;
}

/// Un chiffre clé en haut du tableau de bord.
class KolaStat {
  const KolaStat({required this.label, required this.value, this.change, this.icon});

  final String label;
  final String value;

  /// Évolution en %, ex. 12.5 ou -3.2.
  final double? change;
  final IconData? icon;
}

/// Bloc « Tableau de bord boutique » : chiffres clés, puis commandes par statut.
///
/// ```dart
/// KolaDashboard(
///   name: 'Awa',
///   stats: const [
///     KolaStat(label: 'Ventes du jour', value: '125 000 FCFA', change: 12.5),
///     KolaStat(label: 'Commandes', value: '18', change: 5),
///   ],
///   orders: commandes, // List<KolaOrder>
/// );
/// ```
class KolaDashboard extends StatefulWidget {
  const KolaDashboard({super.key, required this.name, required this.stats, required this.orders, this.date});

  final String name;
  final List<KolaStat> stats;
  final List<KolaOrder> orders;

  /// Date affichée sous le bonjour (aujourd'hui par défaut).
  final DateTime? date;

  static const statusLabels = {
    KolaOrderStatus.pending: 'En cours',
    KolaOrderStatus.delivered: 'Livrée',
    KolaOrderStatus.cancelled: 'Annulée',
  };

  /// 2026-10-20 → 'mardi 20 octobre'
  static String formatDay(DateTime d) {
    const days = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
    const months = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
    return '${days[d.weekday - 1]} ${d.day} ${months[d.month - 1]}';
  }

  @override
  State<KolaDashboard> createState() => _KolaDashboardState();
}

class _KolaDashboardState extends State<KolaDashboard> {
  int _tab = 0;

  static const _filters = <KolaOrderStatus?>[null, KolaOrderStatus.pending, KolaOrderStatus.delivered, KolaOrderStatus.cancelled];
  static const _empty = ['Aucune commande pour le moment', 'Aucune commande en cours', 'Aucune commande livrée', 'Aucune commande annulée'];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final orders = widget.orders;
    int count(KolaOrderStatus s) => orders.where((o) => o.status == s).length;
    final filter = _filters[_tab];
    final shown = filter == null ? orders : orders.where((o) => o.status == filter).toList();

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 960),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Bonjour, ${widget.name}', style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700)),
          const SizedBox(height: 2),
          Text(
            KolaDashboard.formatDay(widget.date ?? DateTime.now()),
            style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 20),
          LayoutBuilder(
            builder: (context, c) {
              final cards = [
                for (final s in widget.stats) KolaStatCard(label: s.label, value: s.value, change: s.change, icon: s.icon),
              ];
              if (c.maxWidth < 640) {
                return Column(children: [
                  for (var i = 0; i < cards.length; i++) Padding(padding: EdgeInsets.only(top: i == 0 ? 0 : 12), child: cards[i]),
                ]);
              }
              return Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  for (var i = 0; i < cards.length; i++)
                    Expanded(child: Padding(padding: EdgeInsets.only(left: i == 0 ? 0 : 16), child: cards[i])),
                ],
              );
            },
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: scheme.surface,
              borderRadius: BorderRadius.circular(20),
              border: Border.all(color: scheme.outlineVariant),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Text('Commandes', style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700)),
                const SizedBox(height: 12),
                KolaTabs(
                  items: [
                    const KolaTabItem(label: 'Toutes'),
                    KolaTabItem(label: 'En cours', badge: count(KolaOrderStatus.pending)),
                    const KolaTabItem(label: 'Livrées'),
                    const KolaTabItem(label: 'Annulées'),
                  ],
                  selected: _tab,
                  onChanged: (i) => setState(() => _tab = i),
                ),
                const SizedBox(height: 16),
                if (shown.isEmpty)
                  KolaEmptyState(icon: Icons.receipt_long_outlined, title: _empty[_tab])
                else
                  KolaDataTable<KolaOrder>(
                    key: ValueKey(_tab),
                    rows: shown,
                    rowsPerPage: 5,
                    columns: [
                      KolaColumn(label: 'N°', cell: (o) => o.id, sortBy: (o) => o.id),
                      KolaColumn(label: 'Client', cell: (o) => o.customer, sortBy: (o) => o.customer, flex: 2),
                      KolaColumn(label: 'Montant', cell: (o) => '${KolaAmountField.format(o.total)} FCFA', sortBy: (o) => o.total, numeric: true, flex: 2),
                      KolaColumn(label: 'Statut', cell: (o) => KolaDashboard.statusLabels[o.status]!),
                    ],
                  ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
