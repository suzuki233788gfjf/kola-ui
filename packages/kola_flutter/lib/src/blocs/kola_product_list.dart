import 'package:flutter/material.dart';

import '../kola_amount_field.dart';
import '../kola_button.dart';
import '../kola_empty_state.dart';
import '../kola_search_field.dart';

/// Un produit de la liste.
class KolaProduct {
  const KolaProduct({required this.name, required this.price, required this.stock, this.category});

  final String name;

  /// Prix en FCFA.
  final int price;
  final int stock;
  final String? category;
}

/// Bloc « Liste avec recherche » : recherche sans accents, chargement, liste vide.
///
/// ```dart
/// KolaProductList(
///   loading: chargement,
///   products: produits, // List<KolaProduct>
///   onTap: (produit) => ouvrirFiche(produit),
/// );
/// ```
class KolaProductList extends StatefulWidget {
  const KolaProductList({
    super.key,
    required this.products,
    this.loading = false,
    this.title = 'Produits',
    this.lowStock = 10,
    this.onTap,
  });

  final List<KolaProduct> products;

  /// Affiche des squelettes pendant le chargement.
  final bool loading;
  final String title;

  /// En dessous de ce stock, le produit est marqué « Stock bas ».
  final int lowStock;
  final ValueChanged<KolaProduct>? onTap;

  /// Produits dont le nom (ou la catégorie) contient la recherche, sans accents.
  static List<KolaProduct> filter(List<KolaProduct> products, String query) {
    final q = KolaSearchField.normalize(query.trim());
    if (q.isEmpty) return products;
    return [
      for (final p in products)
        if (KolaSearchField.normalize(p.name).contains(q) || KolaSearchField.normalize(p.category ?? '').contains(q)) p,
    ];
  }

  @override
  State<KolaProductList> createState() => _KolaProductListState();
}

class _KolaProductListState extends State<KolaProductList> {
  final _search = TextEditingController();
  String _query = '';

  @override
  void initState() {
    super.initState();
    _search.addListener(() {
      if (_search.text != _query) setState(() => _query = _search.text);
    });
  }

  @override
  void dispose() {
    _search.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final shown = KolaProductList.filter(widget.products, _query);

    final Widget body;
    if (widget.loading) {
      body = const KolaSkeletonList(rows: 5);
    } else if (shown.isEmpty) {
      body = KolaEmptyState(
        icon: Icons.search_off,
        title: _query.trim().isEmpty ? 'Aucun produit' : 'Aucun produit pour « ${_query.trim()} »',
        message: _query.trim().isEmpty ? null : 'Vérifie l\'orthographe ou essaie un autre mot.',
        action: _query.trim().isEmpty
            ? null
            : KolaButton(label: 'Effacer la recherche', variant: KolaButtonVariant.outline, onPressed: _search.clear),
      );
    } else {
      body = Container(
        decoration: BoxDecoration(
          color: scheme.surface,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: scheme.outlineVariant),
        ),
        child: Column(
          children: [
            for (var i = 0; i < shown.length; i++) ...[
              if (i > 0) Divider(height: 1, color: scheme.outlineVariant),
              _ProductRow(product: shown[i], low: shown[i].stock < widget.lowStock, onTap: widget.onTap),
            ],
          ],
        ),
      );
    }

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 520),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        mainAxisSize: MainAxisSize.min,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.baseline,
            textBaseline: TextBaseline.alphabetic,
            children: [
              Expanded(child: Text(widget.title, style: theme.textTheme.headlineSmall?.copyWith(fontWeight: FontWeight.w700))),
              if (!widget.loading)
                Text(
                  '${shown.length} produit${shown.length > 1 ? 's' : ''}',
                  style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                ),
            ],
          ),
          const SizedBox(height: 16),
          KolaSearchField(controller: _search, hint: 'Rechercher un produit', enabled: !widget.loading),
          const SizedBox(height: 16),
          body,
        ],
      ),
    );
  }
}

class _ProductRow extends StatelessWidget {
  const _ProductRow({required this.product, required this.low, this.onTap});

  final KolaProduct product;
  final bool low;
  final ValueChanged<KolaProduct>? onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    return InkWell(
      onTap: onTap == null ? null : () => onTap!(product),
      child: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Row(
          children: [
            Container(
              width: 40,
              height: 40,
              decoration: BoxDecoration(color: scheme.primary.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(10)),
              child: Icon(Icons.shopping_basket_outlined, size: 20, color: scheme.primary),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(product.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
                  const SizedBox(height: 2),
                  Row(
                    children: [
                      Text('Stock : ${product.stock}', style: theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant)),
                      if (low) ...[
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 1),
                          decoration: BoxDecoration(color: scheme.error.withValues(alpha: 0.12), borderRadius: BorderRadius.circular(6)),
                          child: Text('Stock bas', style: theme.textTheme.labelSmall?.copyWith(color: scheme.error, fontWeight: FontWeight.w600)),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Text('${KolaAmountField.format(product.price)} FCFA', style: theme.textTheme.bodyLarge?.copyWith(fontWeight: FontWeight.w600)),
          ],
        ),
      ),
    );
  }
}
