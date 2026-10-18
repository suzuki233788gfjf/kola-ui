import 'package:flutter/material.dart';

/// Une colonne du tableau.
class KolaColumn<T> {
  const KolaColumn({
    required this.label,
    required this.cell,
    this.sortBy,
    this.numeric = false,
    this.flex = 1,
  });

  final String label;

  /// Texte affiché pour une ligne.
  final String Function(T row) cell;

  /// Valeur utilisée pour trier (si null, la colonne n'est pas triable).
  final Comparable<dynamic> Function(T row)? sortBy;

  /// Aligne à droite (montants, quantités).
  final bool numeric;
  final int flex;
}

/// Tableau de données : tri, pagination, et cartes sur petit écran.
///
/// ```dart
/// KolaDataTable<Produit>(
///   rows: produits,
///   columns: [
///     KolaColumn(label: 'Produit', cell: (p) => p.nom, sortBy: (p) => p.nom),
///     KolaColumn(label: 'Stock', cell: (p) => '${p.stock}', sortBy: (p) => p.stock, numeric: true),
///   ],
/// );
/// ```
class KolaDataTable<T> extends StatefulWidget {
  const KolaDataTable({
    super.key,
    required this.columns,
    required this.rows,
    this.rowsPerPage = 8,
    this.mobileBreakpoint = 560,
    this.onRowTap,
    this.emptyText = 'Aucune donnée',
  });

  final List<KolaColumn<T>> columns;
  final List<T> rows;
  final int rowsPerPage;

  /// En dessous de cette largeur, les lignes deviennent des cartes.
  final double mobileBreakpoint;
  final ValueChanged<T>? onRowTap;
  final String emptyText;

  @override
  State<KolaDataTable<T>> createState() => _KolaDataTableState<T>();
}

class _KolaDataTableState<T> extends State<KolaDataTable<T>> {
  int? _sortColumn;
  bool _ascending = true;
  int _page = 0;

  List<T> get _sorted {
    final rows = [...widget.rows];
    final i = _sortColumn;
    if (i != null && widget.columns[i].sortBy != null) {
      final key = widget.columns[i].sortBy!;
      rows.sort((a, b) => _ascending ? key(a).compareTo(key(b)) : key(b).compareTo(key(a)));
    }
    return rows;
  }

  void _sort(int i) {
    setState(() {
      if (_sortColumn == i) {
        _ascending = !_ascending;
      } else {
        _sortColumn = i;
        _ascending = true;
      }
      _page = 0;
    });
  }

  @override
  Widget build(BuildContext context) {
    final scheme = Theme.of(context).colorScheme;
    final all = _sorted;
    final pageCount = (all.length / widget.rowsPerPage).ceil().clamp(1, 1 << 30);
    final page = _page.clamp(0, pageCount - 1);
    final from = page * widget.rowsPerPage;
    final to = (from + widget.rowsPerPage).clamp(0, all.length);
    final visible = all.sublist(from, to);

    return Container(
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: scheme.outlineVariant),
      ),
      clipBehavior: Clip.antiAlias,
      child: LayoutBuilder(
        builder: (context, constraints) {
          final mobile = constraints.maxWidth < widget.mobileBreakpoint;
          return Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              if (all.isEmpty)
                Padding(
                  padding: const EdgeInsets.all(32),
                  child: Text(widget.emptyText, textAlign: TextAlign.center),
                )
              else if (mobile)
                ...visible.map((r) => _card(context, r))
              else ...[
                _header(context),
                ...visible.map((r) => _row(context, r)),
              ],
              _footer(context, from, to, all.length, page, pageCount),
            ],
          );
        },
      ),
    );
  }

  Widget _header(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      color: theme.colorScheme.surfaceContainerHighest,
      padding: const EdgeInsets.symmetric(horizontal: 8),
      child: Row(
        children: [
          for (var i = 0; i < widget.columns.length; i++)
            Expanded(
              flex: widget.columns[i].flex,
              child: _headerCell(context, i),
            ),
        ],
      ),
    );
  }

  Widget _headerCell(BuildContext context, int i) {
    final theme = Theme.of(context);
    final col = widget.columns[i];
    final active = _sortColumn == i;
    final label = Row(
      mainAxisAlignment: col.numeric ? MainAxisAlignment.end : MainAxisAlignment.start,
      children: [
        Flexible(
          child: Text(
            col.label,
            overflow: TextOverflow.ellipsis,
            style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
        ),
        if (col.sortBy != null) ...[
          const SizedBox(width: 4),
          Icon(
            active
                ? (_ascending ? Icons.arrow_upward_rounded : Icons.arrow_downward_rounded)
                : Icons.unfold_more_rounded,
            size: 16,
            color: active ? theme.colorScheme.primary : theme.colorScheme.onSurfaceVariant,
          ),
        ],
      ],
    );
    final content = Padding(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
      child: label,
    );
    if (col.sortBy == null) return content;
    return Semantics(
      button: true,
      label: 'Trier par ${col.label}',
      child: InkWell(onTap: () => _sort(i), child: content),
    );
  }

  Widget _row(BuildContext context, T r) {
    final theme = Theme.of(context);
    return InkWell(
      onTap: widget.onRowTap == null ? null : () => widget.onRowTap!(r),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 8),
        decoration: BoxDecoration(
          border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
        ),
        child: Row(
          children: [
            for (var i = 0; i < widget.columns.length; i++)
              Expanded(
                flex: widget.columns[i].flex,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 14),
                  child: Text(
                    widget.columns[i].cell(r),
                    overflow: TextOverflow.ellipsis,
                    textAlign: widget.columns[i].numeric ? TextAlign.right : TextAlign.left,
                    style: i == 0
                        ? theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)
                        : theme.textTheme.bodyMedium,
                  ),
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _card(BuildContext context, T r) {
    final theme = Theme.of(context);
    final cols = widget.columns;
    return InkWell(
      onTap: widget.onRowTap == null ? null : () => widget.onRowTap!(r),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          border: Border(bottom: BorderSide(color: theme.colorScheme.outlineVariant)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              cols.first.cell(r),
              style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w700),
            ),
            const SizedBox(height: 6),
            for (final c in cols.skip(1))
              Padding(
                padding: const EdgeInsets.only(top: 2),
                child: Row(
                  children: [
                    Expanded(
                      child: Text(
                        c.label,
                        style: theme.textTheme.bodySmall?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    ),
                    Text(c.cell(r), style: theme.textTheme.bodyMedium),
                  ],
                ),
              ),
          ],
        ),
      ),
    );
  }

  Widget _footer(BuildContext context, int from, int to, int total, int page, int pageCount) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
      decoration: BoxDecoration(
        border: Border(top: BorderSide(color: theme.colorScheme.outlineVariant)),
      ),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.end,
        children: [
          Text(
            total == 0 ? '0 sur 0' : '${from + 1}–$to sur $total',
            style: theme.textTheme.bodySmall,
          ),
          const SizedBox(width: 8),
          IconButton(
            tooltip: 'Page précédente',
            icon: const Icon(Icons.chevron_left),
            onPressed: page > 0 ? () => setState(() => _page = page - 1) : null,
          ),
          IconButton(
            tooltip: 'Page suivante',
            icon: const Icon(Icons.chevron_right),
            onPressed: page < pageCount - 1 ? () => setState(() => _page = page + 1) : null,
          ),
        ],
      ),
    );
  }
}
