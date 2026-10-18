import 'package:flutter/material.dart';

/// Une option du sélecteur.
class KolaSelectOption<T> {
  const KolaSelectOption(this.value, this.label, {this.subtitle});
  final T value;
  final String label;
  final String? subtitle;
}

/// Sélecteur avec recherche : un champ qui ouvre une liste filtrable.
/// La recherche ignore les majuscules et les accents (« yaounde » trouve « Yaoundé »).
///
/// ```dart
/// KolaSelect<String>(
///   label: 'Ville',
///   value: ville,
///   options: const [
///     KolaSelectOption('dla', 'Douala'),
///     KolaSelectOption('yde', 'Yaoundé'),
///   ],
///   onChanged: (v) => setState(() => ville = v),
/// );
/// ```
class KolaSelect<T> extends StatelessWidget {
  const KolaSelect({
    super.key,
    required this.label,
    required this.options,
    required this.onChanged,
    this.value,
    this.hint = 'Choisir…',
    this.searchHint = 'Rechercher…',
    this.emptyText = 'Aucun résultat',
  });

  final String label;
  final List<KolaSelectOption<T>> options;
  final T? value;
  final ValueChanged<T?> onChanged;
  final String hint;
  final String searchHint;
  final String emptyText;

  /// Minuscules et sans accents, pour comparer.
  static String normalize(String s) {
    const from = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ';
    const to = 'aaaaaaceeeeiiiinooooouuuuyyoa';
    final lower = s.toLowerCase();
    final b = StringBuffer();
    for (final ch in lower.split('')) {
      final i = from.indexOf(ch);
      b.write(i >= 0 ? to[i] : ch);
    }
    return b.toString();
  }

  KolaSelectOption<T>? get _selected {
    for (final o in options) {
      if (o.value == value) return o;
    }
    return null;
  }

  Future<void> _open(BuildContext context) async {
    final picked = await showDialog<KolaSelectOption<T>>(
      context: context,
      builder: (_) => _SelectDialog<T>(
        title: label,
        options: options,
        selected: value,
        searchHint: searchHint,
        emptyText: emptyText,
      ),
    );
    if (picked != null) onChanged(picked.value);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final selected = _selected;
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(label, style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        InkWell(
          borderRadius: BorderRadius.circular(12),
          onTap: () => _open(context),
          child: InputDecorator(
            decoration: const InputDecoration(
              suffixIcon: Icon(Icons.unfold_more_rounded),
            ),
            child: Text(
              selected?.label ?? hint,
              style: theme.textTheme.bodyLarge?.copyWith(
                color: selected == null ? theme.colorScheme.onSurfaceVariant : null,
              ),
            ),
          ),
        ),
      ],
    );
  }
}

class _SelectDialog<T> extends StatefulWidget {
  const _SelectDialog({
    required this.title,
    required this.options,
    required this.selected,
    required this.searchHint,
    required this.emptyText,
  });

  final String title;
  final List<KolaSelectOption<T>> options;
  final T? selected;
  final String searchHint;
  final String emptyText;

  @override
  State<_SelectDialog<T>> createState() => _SelectDialogState<T>();
}

class _SelectDialogState<T> extends State<_SelectDialog<T>> {
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final q = KolaSelect.normalize(_query.trim());
    final results = q.isEmpty
        ? widget.options
        : widget.options
            .where((o) =>
                KolaSelect.normalize(o.label).contains(q) ||
                KolaSelect.normalize(o.subtitle ?? '').contains(q))
            .toList();

    return Dialog(
      child: ConstrainedBox(
        constraints: const BoxConstraints(maxWidth: 420, maxHeight: 520),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 12),
              child: Text(
                widget.title,
                style: theme.textTheme.titleMedium?.copyWith(fontWeight: FontWeight.w700),
              ),
            ),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: TextField(
                autofocus: true,
                decoration: InputDecoration(
                  hintText: widget.searchHint,
                  prefixIcon: const Icon(Icons.search),
                ),
                onChanged: (v) => setState(() => _query = v),
              ),
            ),
            const SizedBox(height: 8),
            Flexible(
              child: results.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(24),
                      child: Text(
                        widget.emptyText,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodyMedium?.copyWith(
                          color: theme.colorScheme.onSurfaceVariant,
                        ),
                      ),
                    )
                  : ListView.builder(
                      shrinkWrap: true,
                      padding: const EdgeInsets.only(bottom: 12),
                      itemCount: results.length,
                      itemBuilder: (context, i) {
                        final o = results[i];
                        final selected = o.value == widget.selected;
                        return ListTile(
                          title: Text(o.label),
                          subtitle: o.subtitle == null ? null : Text(o.subtitle!),
                          selected: selected,
                          trailing: selected ? const Icon(Icons.check) : null,
                          onTap: () => Navigator.pop(context, o),
                        );
                      },
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
