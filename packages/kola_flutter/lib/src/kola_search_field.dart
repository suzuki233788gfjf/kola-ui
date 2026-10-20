import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Une suggestion de recherche.
class KolaSearchOption {
  const KolaSearchOption(this.label, {this.subtitle, this.value});

  final String label;

  /// Petit texte sous le libellé (ex. la région d'une ville). La recherche le lit aussi.
  final String? subtitle;

  /// Ce que tu veux récupérer quand la suggestion est choisie (un id, un produit…).
  final Object? value;
}

/// Champ de recherche avec suggestions.
///
/// - la recherche ignore majuscules et accents (« yaounde » trouve « Yaoundé ») ;
/// - les suggestions qui commencent par le texte tapé passent en premier ;
/// - flèches haut / bas, Entrée et Échap au clavier.
///
/// ```dart
/// KolaSearchField(
///   hint: 'Rechercher une ville',
///   options: const [
///     KolaSearchOption('Douala', subtitle: 'Littoral'),
///     KolaSearchOption('Yaoundé', subtitle: 'Centre'),
///   ],
///   onSelected: (ville) => print(ville.label),
///   onSubmitted: (texte) => lancerRecherche(texte),
/// );
/// ```
class KolaSearchField extends StatefulWidget {
  const KolaSearchField({
    super.key,
    this.label,
    this.hint = 'Rechercher…',
    this.options = const [],
    this.controller,
    this.onChanged,
    this.onSelected,
    this.onSubmitted,
    this.maxSuggestions = 6,
    this.emptyText = 'Aucun résultat',
    this.enabled = true,
  });

  /// Label au-dessus du champ (facultatif).
  final String? label;
  final String hint;
  final List<KolaSearchOption> options;
  final TextEditingController? controller;
  final ValueChanged<String>? onChanged;

  /// Appelé quand une suggestion est choisie.
  final ValueChanged<KolaSearchOption>? onSelected;

  /// Appelé avec le texte quand on valide (Entrée) sans choisir de suggestion.
  final ValueChanged<String>? onSubmitted;
  final int maxSuggestions;
  final String emptyText;
  final bool enabled;

  /// Minuscules et sans accents, lettre par lettre (même longueur que le texte).
  static String normalize(String s) {
    const from = 'àâäáãåçéèêëíìîïñóòôöõúùûüýÿœæ';
    const to = 'aaaaaaceeeeiiiinooooouuuuyyoa';
    final b = StringBuffer();
    for (final ch in s.split('')) {
      final lower = ch.toLowerCase();
      final i = from.indexOf(lower);
      b.write(i >= 0 ? to[i] : (lower.length == 1 ? lower : ch));
    }
    return b.toString();
  }

  /// Suggestions qui correspondent à [query], les meilleures d'abord :
  /// début du libellé, puis début d'un mot, puis n'importe où, puis le sous-titre.
  static List<KolaSearchOption> filter(List<KolaSearchOption> options, String query, {int max = 6}) {
    final q = normalize(query.trim());
    if (q.isEmpty) return const [];
    final scored = <(int, int, KolaSearchOption)>[];
    for (var i = 0; i < options.length; i++) {
      final o = options[i];
      final label = normalize(o.label);
      final int score;
      if (label.startsWith(q)) {
        score = 0;
      } else if (label.contains(' $q') || label.contains('-$q') || label.contains("'$q")) {
        score = 1;
      } else if (label.contains(q)) {
        score = 2;
      } else if (o.subtitle != null && normalize(o.subtitle!).contains(q)) {
        score = 3;
      } else {
        continue;
      }
      scored.add((score, i, o));
    }
    scored.sort((a, b) => a.$1 != b.$1 ? a.$1 - b.$1 : a.$2 - b.$2);
    return [for (final s in scored.take(max)) s.$3];
  }

  @override
  State<KolaSearchField> createState() => _KolaSearchFieldState();
}

class _KolaSearchFieldState extends State<KolaSearchField> {
  late final TextEditingController _controller = widget.controller ?? TextEditingController();
  final _focus = FocusNode();
  final _portal = OverlayPortalController();
  final _link = LayerLink();
  List<KolaSearchOption> _results = const [];
  int _active = -1;
  String _text = '';
  String? _chosen;
  double _width = 320;

  @override
  void initState() {
    super.initState();
    _text = _controller.text;
    _controller.addListener(_onText);
    _focus.addListener(_sync);
  }

  @override
  void dispose() {
    _controller.removeListener(_onText);
    if (widget.controller == null) _controller.dispose();
    _focus.dispose();
    super.dispose();
  }

  void _onText() {
    if (_controller.text == _text) return;
    _text = _controller.text;
    setState(() {
      _results = KolaSearchField.filter(widget.options, _text, max: widget.maxSuggestions);
      _active = -1;
    });
    _sync();
  }

  void _sync() {
    final show = _focus.hasFocus && _text.trim().isNotEmpty && _text != _chosen;
    if (show && !_portal.isShowing) _portal.show();
    if (!show && _portal.isShowing) _portal.hide();
  }

  void _select(KolaSearchOption option) {
    _chosen = option.label;
    _controller.value = TextEditingValue(
      text: option.label,
      selection: TextSelection.collapsed(offset: option.label.length),
    );
    _portal.hide();
    widget.onSelected?.call(option);
  }

  void _clear() {
    _chosen = null;
    _controller.clear();
    widget.onChanged?.call('');
    _focus.requestFocus();
  }

  KeyEventResult _onKey(FocusNode node, KeyEvent event) {
    if (event is! KeyDownEvent && event is! KeyRepeatEvent) return KeyEventResult.ignored;
    if (!_portal.isShowing) {
      if (event.logicalKey == LogicalKeyboardKey.arrowDown && _text.trim().isNotEmpty) {
        _chosen = null;
        _sync();
        return KeyEventResult.handled;
      }
      return KeyEventResult.ignored;
    }
    final key = event.logicalKey;
    if (key == LogicalKeyboardKey.arrowDown && _results.isNotEmpty) {
      setState(() => _active = (_active + 1) % _results.length);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.arrowUp && _results.isNotEmpty) {
      setState(() => _active = _active <= 0 ? _results.length - 1 : _active - 1);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.enter && _active >= 0) {
      _select(_results[_active]);
      return KeyEventResult.handled;
    }
    if (key == LogicalKeyboardKey.escape) {
      _portal.hide();
      return KeyEventResult.handled;
    }
    return KeyEventResult.ignored;
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;

    final field = LayoutBuilder(
      builder: (context, constraints) {
        if (constraints.maxWidth.isFinite) _width = constraints.maxWidth;
        return CompositedTransformTarget(
          link: _link,
          child: Focus(
            onKeyEvent: _onKey,
            skipTraversal: true,
            child: TextField(
              controller: _controller,
              focusNode: _focus,
              enabled: widget.enabled,
              textInputAction: TextInputAction.search,
              onChanged: (v) {
                _chosen = null;
                widget.onChanged?.call(v);
              },
              onSubmitted: (v) {
                _portal.hide();
                widget.onSubmitted?.call(v);
              },
              decoration: InputDecoration(
                hintText: widget.hint,
                prefixIcon: const Icon(Icons.search, size: 20),
                suffixIcon: _text.isEmpty
                    ? null
                    : IconButton(
                        tooltip: 'Effacer',
                        icon: const Icon(Icons.close, size: 20),
                        onPressed: _clear,
                      ),
              ),
            ),
          ),
        );
      },
    );

    return OverlayPortal(
      controller: _portal,
      overlayChildBuilder: (context) => CompositedTransformFollower(
        link: _link,
        showWhenUnlinked: false,
        targetAnchor: Alignment.bottomLeft,
        offset: const Offset(0, 6),
        child: Align(
          alignment: Alignment.topLeft,
          child: TextFieldTapRegion(
            child: SizedBox(
              width: _width,
              child: Material(
                elevation: 6,
                color: scheme.surface,
                borderRadius: BorderRadius.circular(12),
                clipBehavior: Clip.antiAlias,
                child: _results.isEmpty
                    ? Padding(
                        padding: const EdgeInsets.all(16),
                        child: Text(
                          '${widget.emptyText} pour « ${_text.trim()} »',
                          style: theme.textTheme.bodyMedium?.copyWith(color: scheme.onSurfaceVariant),
                        ),
                      )
                    : ConstrainedBox(
                        constraints: const BoxConstraints(maxHeight: 320),
                        child: ListView(
                          padding: const EdgeInsets.symmetric(vertical: 6),
                          shrinkWrap: true,
                          children: [
                            for (var i = 0; i < _results.length; i++)
                              _Suggestion(
                                option: _results[i],
                                query: _text,
                                active: i == _active,
                                onTap: () => _select(_results[i]),
                              ),
                          ],
                        ),
                      ),
              ),
            ),
          ),
        ),
      ),
      child: widget.label == null
          ? field
          : Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(widget.label!, style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 8),
                field,
              ],
            ),
    );
  }
}

class _Suggestion extends StatelessWidget {
  const _Suggestion({required this.option, required this.query, required this.active, required this.onTap});

  final KolaSearchOption option;
  final String query;
  final bool active;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final label = option.label;
    final q = KolaSearchField.normalize(query.trim());
    final start = q.isEmpty ? -1 : KolaSearchField.normalize(label).indexOf(q);
    final base = theme.textTheme.bodyLarge?.copyWith(color: scheme.onSurface);

    return Semantics(
      selected: active,
      button: true,
      child: InkWell(
        onTap: onTap,
        child: Container(
          color: active ? scheme.surfaceContainerHighest : null,
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text.rich(
                TextSpan(
                  style: base,
                  children: start < 0
                      ? [TextSpan(text: label)]
                      : [
                          TextSpan(text: label.substring(0, start)),
                          TextSpan(
                            text: label.substring(start, start + q.length),
                            style: const TextStyle(fontWeight: FontWeight.w700),
                          ),
                          TextSpan(text: label.substring(start + q.length)),
                        ],
                ),
              ),
              if (option.subtitle != null)
                Text(
                  option.subtitle!,
                  style: theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                ),
            ],
          ),
        ),
      ),
    );
  }
}
