import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

/// Champ de texte Kola UI : label au-dessus, aide, erreur, validation et mot de passe masquable.
///
/// ```dart
/// KolaTextField(
///   label: 'E-mail',
///   hint: 'nom@exemple.cm',
///   validator: (v) => (v ?? '').contains('@') ? null : 'Adresse e-mail incomplète',
/// );
/// ```
class KolaTextField extends StatefulWidget {
  const KolaTextField({
    super.key,
    required this.label,
    this.controller,
    this.hint,
    this.helper,
    this.errorText,
    this.validator,
    this.onChanged,
    this.prefixIcon,
    this.prefix,
    this.suffix,
    this.obscure = false,
    this.keyboardType,
    this.inputFormatters,
    this.enabled = true,
  });

  final String label;
  final TextEditingController? controller;
  final String? hint;
  final String? helper;

  /// Erreur imposée de l'extérieur (sinon c'est le [validator] qui décide).
  final String? errorText;
  final FormFieldValidator<String>? validator;
  final ValueChanged<String>? onChanged;
  final IconData? prefixIcon;

  /// Widget affiché au début du champ (prioritaire sur [prefixIcon]).
  final Widget? prefix;

  /// Widget affiché à la fin du champ (ignoré si [obscure] est vrai).
  final Widget? suffix;

  /// Mot de passe : texte masqué avec un bouton pour l'afficher.
  final bool obscure;
  final TextInputType? keyboardType;
  final List<TextInputFormatter>? inputFormatters;
  final bool enabled;

  @override
  State<KolaTextField> createState() => _KolaTextFieldState();
}

class _KolaTextFieldState extends State<KolaTextField> {
  late bool _hidden = widget.obscure;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);

    Widget? prefix = widget.prefix;
    if (prefix == null && widget.prefixIcon != null) {
      prefix = Icon(widget.prefixIcon, size: 20);
    }

    final Widget? suffix = widget.obscure
        ? IconButton(
            tooltip: _hidden ? 'Afficher' : 'Masquer',
            icon: Icon(
              _hidden
                  ? Icons.visibility_outlined
                  : Icons.visibility_off_outlined,
            ),
            onPressed: () => setState(() => _hidden = !_hidden),
          )
        : widget.suffix;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(
          widget.label,
          style: theme.textTheme.labelLarge?.copyWith(
            fontWeight: FontWeight.w600,
          ),
        ),
        const SizedBox(height: 8),
        TextFormField(
          controller: widget.controller,
          obscureText: _hidden,
          keyboardType: widget.keyboardType,
          inputFormatters: widget.inputFormatters,
          validator: widget.validator,
          onChanged: widget.onChanged,
          enabled: widget.enabled,
          autovalidateMode: AutovalidateMode.onUserInteraction,
          decoration: InputDecoration(
            hintText: widget.hint,
            helperText: widget.helper,
            errorText: widget.errorText,
            prefixIcon: prefix,
            suffixIcon: suffix,
          ),
        ),
      ],
    );
  }
}
