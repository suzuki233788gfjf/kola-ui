import 'dart:typed_data';

import 'package:flutter/material.dart';

/// Un fichier choisi par l'utilisateur.
class KolaFile {
  const KolaFile({required this.name, required this.size, this.bytes, this.path});

  final String name;

  /// Taille en octets.
  final int size;

  /// Contenu du fichier (sert aussi à l'aperçu des images).
  final Uint8List? bytes;

  /// Chemin sur le téléphone, si ton sélecteur en donne un.
  final String? path;

  /// Extension en minuscules : 'cni.JPG' → 'jpg'.
  String get extension {
    final i = name.lastIndexOf('.');
    return i < 0 ? '' : name.substring(i + 1).toLowerCase();
  }

  bool get isImage => const ['jpg', 'jpeg', 'png', 'gif', 'webp', 'heic'].contains(extension);
}

enum _Status { uploading, done, error }

class _Item {
  _Item(this.file, this.status, {this.error});
  final KolaFile file;
  _Status status;
  double progress = 0;
  String? error;
}

/// Zone de téléversement : photo, pièce d'identité, reçu…
///
/// Flutter n'a pas de sélecteur de fichiers intégré : passe le tien dans [onPick]
/// (paquet file_picker ou image_picker). Le composant s'occupe du reste :
/// vérification du format et de la taille, aperçu, progression, suppression.
///
/// ```dart
/// KolaFileUpload(
///   label: 'Pièce d\'identité',
///   onPick: () async {
///     final r = await FilePicker.platform.pickFiles(withData: true, allowMultiple: true);
///     return [
///       for (final f in r?.files ?? <PlatformFile>[])
///         KolaFile(name: f.name, size: f.size, bytes: f.bytes),
///     ];
///   },
///   onUpload: (fichier, progression) async {
///     // Envoie le fichier à ton serveur et appelle progression(0.0 → 1.0).
///   },
/// );
/// ```
class KolaFileUpload extends StatefulWidget {
  const KolaFileUpload({
    super.key,
    required this.onPick,
    this.label = 'Pièces jointes',
    this.helper,
    this.onUpload,
    this.onChanged,
    this.extensions = const ['jpg', 'jpeg', 'png', 'pdf'],
    this.maxSize = 5 * 1024 * 1024,
    this.multiple = true,
    this.maxFiles = 5,
    this.enabled = true,
  });

  /// Ouvre ton sélecteur de fichiers et renvoie les fichiers choisis.
  final Future<List<KolaFile>> Function() onPick;
  final String label;

  /// Texte dans la zone. Par défaut : formats et taille maximale.
  final String? helper;

  /// Envoie un fichier. Appelle `progress` avec une valeur de 0 à 1.
  /// Lance une exception pour afficher une erreur sur ce fichier.
  final Future<void> Function(KolaFile file, void Function(double progress) progress)? onUpload;

  /// Reçoit la liste des fichiers prêts (envoyés, ou choisis si pas d'[onUpload]).
  final ValueChanged<List<KolaFile>>? onChanged;

  /// Extensions acceptées, en minuscules. Liste vide : tout est accepté.
  final List<String> extensions;

  /// Taille maximale d'un fichier, en octets.
  final int maxSize;
  final bool multiple;
  final int maxFiles;
  final bool enabled;

  /// 850 → '850 o', 48 000 → '47 Ko', 1 258 291 → '1,2 Mo'
  static String formatSize(int bytes) {
    if (bytes < 1024) return '$bytes o';
    if (bytes < 1024 * 1024) return '${(bytes / 1024).round()} Ko';
    final mo = bytes / (1024 * 1024);
    final text = mo >= 10 ? mo.round().toString() : mo.toStringAsFixed(1).replaceAll('.', ',');
    return '${text.endsWith(',0') ? text.substring(0, text.length - 2) : text} Mo';
  }

  /// Message d'erreur pour ce fichier, ou null s'il est accepté.
  static String? check(KolaFile file, {List<String> extensions = const [], int maxSize = 5 * 1024 * 1024}) {
    if (extensions.isNotEmpty && !extensions.contains(file.extension)) return 'Format non accepté';
    if (file.size > maxSize) return 'Fichier trop lourd (max ${formatSize(maxSize)})';
    return null;
  }

  @override
  State<KolaFileUpload> createState() => _KolaFileUploadState();
}

class _KolaFileUploadState extends State<KolaFileUpload> {
  final _items = <_Item>[];
  String? _notice;
  bool _picking = false;

  int get _kept => _items.where((i) => i.status != _Status.error).length;
  bool get _full => _kept >= (widget.multiple ? widget.maxFiles : 1);

  String get _defaultHelper {
    final ext = widget.extensions.where((e) => e != 'jpeg').map((e) => e.toUpperCase()).toList();
    final formats = ext.isEmpty
        ? ''
        : ext.length == 1
            ? '${ext.first} · '
            : '${ext.sublist(0, ext.length - 1).join(', ')} ou ${ext.last} · ';
    return '$formats${KolaFileUpload.formatSize(widget.maxSize)} max';
  }

  void _notify() {
    widget.onChanged?.call([for (final i in _items) if (i.status == _Status.done) i.file]);
  }

  Future<void> _pick() async {
    setState(() => _picking = true);
    List<KolaFile> files;
    try {
      files = await widget.onPick();
    } finally {
      if (mounted) setState(() => _picking = false);
    }
    if (!mounted || files.isEmpty) return;
    if (!widget.multiple) {
      _items.clear();
      files = files.take(1).toList();
    }
    final room = (widget.multiple ? widget.maxFiles : 1) - _kept;
    var added = 0;
    var skipped = 0;
    for (final file in files) {
      final error = KolaFileUpload.check(file, extensions: widget.extensions, maxSize: widget.maxSize);
      if (error != null) {
        setState(() => _items.add(_Item(file, _Status.error, error: error)));
        continue;
      }
      if (added >= room) {
        skipped++;
        continue;
      }
      added++;
      final item = _Item(file, widget.onUpload == null ? _Status.done : _Status.uploading);
      setState(() => _items.add(item));
      if (widget.onUpload != null) _upload(item);
    }
    setState(() {
      _notice = skipped > 0 ? '${widget.maxFiles} fichiers maximum : les autres n\'ont pas été ajoutés.' : null;
    });
    _notify();
  }

  Future<void> _upload(_Item item) async {
    try {
      await widget.onUpload!(item.file, (p) {
        if (mounted && _items.contains(item)) setState(() => item.progress = p.clamp(0, 1).toDouble());
      });
      if (!mounted || !_items.contains(item)) return;
      setState(() => item.status = _Status.done);
    } catch (e) {
      if (!mounted || !_items.contains(item)) return;
      setState(() {
        item.status = _Status.error;
        item.error = 'Échec de l\'envoi';
      });
    }
    _notify();
  }

  void _remove(_Item item) {
    setState(() {
      _items.remove(item);
      _notice = null;
    });
    _notify();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final disabled = !widget.enabled || _full || _picking;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Text(widget.label, style: theme.textTheme.labelLarge?.copyWith(fontWeight: FontWeight.w600)),
        const SizedBox(height: 8),
        Semantics(
          button: true,
          enabled: !disabled,
          child: Material(
            color: scheme.surfaceContainerHighest.withValues(alpha: 0.5),
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
              side: BorderSide(color: scheme.outline),
            ),
            child: InkWell(
              onTap: disabled ? null : _pick,
              borderRadius: BorderRadius.circular(12),
              child: Opacity(
                opacity: disabled && !_picking ? 0.6 : 1,
                child: Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 22),
                  child: Column(
                    children: [
                      _picking
                          ? const SizedBox(width: 28, height: 28, child: CircularProgressIndicator(strokeWidth: 2.5))
                          : Icon(Icons.upload_file_outlined, size: 28, color: scheme.primary),
                      const SizedBox(height: 8),
                      Text(
                        _full ? '${widget.multiple ? widget.maxFiles : 1} fichier${widget.multiple && widget.maxFiles > 1 ? 's' : ''} maximum' : (widget.multiple ? 'Choisir des fichiers' : 'Choisir un fichier'),
                        style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600, color: scheme.primary),
                      ),
                      const SizedBox(height: 2),
                      Text(
                        widget.helper ?? _defaultHelper,
                        textAlign: TextAlign.center,
                        style: theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                      ),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ),
        if (_notice != null) ...[
          const SizedBox(height: 8),
          Text(_notice!, style: theme.textTheme.bodySmall?.copyWith(color: scheme.error)),
        ],
        for (final item in _items) ...[
          const SizedBox(height: 8),
          _FileRow(item: item, onRemove: () => _remove(item)),
        ],
      ],
    );
  }
}

class _FileRow extends StatelessWidget {
  const _FileRow({required this.item, required this.onRemove});

  final _Item item;
  final VoidCallback onRemove;

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final file = item.file;
    final size = KolaFileUpload.formatSize(file.size);
    final status = switch (item.status) {
      _Status.uploading => '$size · Envoi… ${(item.progress * 100).round()} %',
      _Status.done => '$size · Prêt',
      _Status.error => item.error ?? 'Erreur',
    };

    return Container(
      padding: const EdgeInsets.fromLTRB(10, 10, 4, 10),
      decoration: BoxDecoration(
        color: scheme.surface,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: item.status == _Status.error ? scheme.error : scheme.outlineVariant),
      ),
      child: Row(
        children: [
          ClipRRect(
            borderRadius: BorderRadius.circular(8),
            child: SizedBox(
              width: 44,
              height: 44,
              child: file.isImage && file.bytes != null
                  ? Image.memory(file.bytes!, fit: BoxFit.cover, errorBuilder: (_, _, _) => _icon(scheme, file))
                  : _icon(scheme, file),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(file.name, maxLines: 1, overflow: TextOverflow.ellipsis, style: theme.textTheme.bodyMedium?.copyWith(fontWeight: FontWeight.w600)),
                const SizedBox(height: 2),
                Text(
                  status,
                  style: theme.textTheme.bodySmall?.copyWith(
                    color: item.status == _Status.error ? scheme.error : scheme.onSurfaceVariant,
                  ),
                ),
                if (item.status == _Status.uploading) ...[
                  const SizedBox(height: 6),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(2),
                    child: LinearProgressIndicator(value: item.progress, minHeight: 4),
                  ),
                ],
              ],
            ),
          ),
          IconButton(
            tooltip: 'Retirer ${file.name}',
            icon: const Icon(Icons.close, size: 20),
            onPressed: onRemove,
          ),
        ],
      ),
    );
  }

  Widget _icon(ColorScheme scheme, KolaFile file) => ColoredBox(
        color: scheme.primary.withValues(alpha: 0.12),
        child: Icon(
          file.isImage ? Icons.image_outlined : Icons.description_outlined,
          color: scheme.primary,
          size: 22,
        ),
      );
}
