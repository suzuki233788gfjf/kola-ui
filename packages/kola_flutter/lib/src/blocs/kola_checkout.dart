import 'package:flutter/material.dart';

import '../kola_amount_field.dart';
import '../kola_mobile_money_form.dart';

/// Un article du panier.
class KolaCartItem {
  const KolaCartItem({required this.name, required this.price, this.quantity = 1});

  final String name;

  /// Prix unitaire en FCFA.
  final int price;
  final int quantity;

  int get total => price * quantity;
}

/// Bloc « Paiement de commande » : récapitulatif du panier, puis paiement Mobile Money.
///
/// ```dart
/// KolaCheckout(
///   items: const [
///     KolaCartItem(name: 'Riz parfumé 5 kg', price: 4500),
///     KolaCartItem(name: 'Huile 1 L', price: 1600, quantity: 2),
///   ],
///   delivery: 1000,
///   onPay: (demande) async {
///     // Appelle ton fournisseur (Campay, Notch Pay, CinetPay…).
///   },
/// );
/// ```
class KolaCheckout extends StatelessWidget {
  const KolaCheckout({
    super.key,
    required this.items,
    required this.onPay,
    this.delivery = 0,
    this.title = 'Ta commande',
  });

  final List<KolaCartItem> items;

  /// Frais de livraison en FCFA (0 : livraison gratuite).
  final int delivery;
  final Future<void> Function(KolaMobileMoneyRequest request) onPay;
  final String title;

  int get subtotal => items.fold(0, (sum, i) => sum + i.total);
  int get total => subtotal + delivery;

  static String fcfa(int amount) => '${KolaAmountField.format(amount)} FCFA';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final count = items.fold(0, (sum, i) => sum + i.quantity);
    final muted = theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant);

    Widget line(String label, String value, {bool strong = false}) => Padding(
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Row(
            children: [
              Expanded(child: Text(label, style: strong ? theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700) : muted)),
              Text(value, style: strong ? theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700) : theme.textTheme.bodyMedium),
            ],
          ),
        );

    return ConstrainedBox(
      constraints: const BoxConstraints(maxWidth: 440),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
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
                Row(
                  children: [
                    Expanded(child: Text(title, style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700))),
                    Text('$count article${count > 1 ? 's' : ''}', style: muted),
                  ],
                ),
                const SizedBox(height: 12),
                for (final item in items)
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Row(
                      children: [
                        Expanded(
                          child: Text.rich(TextSpan(children: [
                            TextSpan(text: item.name),
                            if (item.quantity > 1)
                              TextSpan(text: '  × ${item.quantity}', style: TextStyle(color: scheme.onSurfaceVariant)),
                          ])),
                        ),
                        Text(fcfa(item.total)),
                      ],
                    ),
                  ),
                const Divider(height: 24),
                line('Sous-total', fcfa(subtotal)),
                line('Livraison', delivery == 0 ? 'Gratuite' : fcfa(delivery)),
                const SizedBox(height: 4),
                line('Total', fcfa(total), strong: true),
              ],
            ),
          ),
          const SizedBox(height: 16),
          KolaMobileMoneyForm(amount: total, onPay: onPay),
        ],
      ),
    );
  }
}
