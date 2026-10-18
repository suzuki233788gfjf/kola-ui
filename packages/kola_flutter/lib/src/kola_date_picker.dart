import 'package:flutter/material.dart';

/// Une période choisie (pour une seule date, [start] et [end] sont égales).
class KolaDateRange {
  const KolaDateRange(this.start, this.end);
  final DateTime start;
  final DateTime end;
}

/// Noms et formats en français — sans dépendance externe.
class KolaDateFr {
  static const months = [
    'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
    'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre',
  ];
  static const monthsShort = [
    'janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin',
    'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.',
  ];
  static const weekdaysShort = ['lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.', 'dim.'];

  /// 2026-10-12 → '12 oct. 2026'
  static String date(DateTime d) => '${d.day} ${monthsShort[d.month - 1]} ${d.year}';

  /// '12 – 16 oct. 2026', '28 sept. – 3 oct. 2026', ou une seule date.
  static String range(DateTime start, DateTime end) {
    if (DateUtils.isSameDay(start, end)) return date(start);
    if (start.year != end.year) return '${date(start)} – ${date(end)}';
    if (start.month != end.month) {
      return '${start.day} ${monthsShort[start.month - 1]} – ${date(end)}';
    }
    return '${start.day} – ${date(end)}';
  }
}

/// Ouvre le calendrier Kola dans une boîte de dialogue.
class KolaDatePicker {
  /// Choisir une date.
  static Future<DateTime?> show(
    BuildContext context, {
    DateTime? initial,
    DateTime? firstDate,
    DateTime? lastDate,
  }) async {
    final r = await _open(context, false, initial, initial, firstDate, lastDate);
    return r?.start;
  }

  /// Choisir une période (du… au…).
  static Future<KolaDateRange?> showRange(
    BuildContext context, {
    DateTime? initialStart,
    DateTime? initialEnd,
    DateTime? firstDate,
    DateTime? lastDate,
  }) =>
      _open(context, true, initialStart, initialEnd, firstDate, lastDate);

  static Future<KolaDateRange?> _open(
    BuildContext context,
    bool range,
    DateTime? start,
    DateTime? end,
    DateTime? first,
    DateTime? last,
  ) {
    return showDialog<KolaDateRange>(
      context: context,
      builder: (ctx) => Dialog(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 360),
          child: KolaCalendar(
            range: range,
            initialStart: start,
            initialEnd: end,
            firstDate: first,
            lastDate: last,
            onCancel: () => Navigator.pop(ctx),
            onConfirm: (r) => Navigator.pop(ctx, r),
          ),
        ),
      ),
    );
  }
}

/// Le calendrier lui-même, utilisable aussi directement dans une page.
class KolaCalendar extends StatefulWidget {
  const KolaCalendar({
    super.key,
    this.range = false,
    this.initialStart,
    this.initialEnd,
    this.firstDate,
    this.lastDate,
    this.onConfirm,
    this.onCancel,
  });

  final bool range;
  final DateTime? initialStart;
  final DateTime? initialEnd;
  final DateTime? firstDate;
  final DateTime? lastDate;
  final ValueChanged<KolaDateRange>? onConfirm;
  final VoidCallback? onCancel;

  @override
  State<KolaCalendar> createState() => _KolaCalendarState();
}

class _KolaCalendarState extends State<KolaCalendar> {
  DateTime? _start;
  DateTime? _end;
  late DateTime _month;

  @override
  void initState() {
    super.initState();
    _start = _day(widget.initialStart);
    _end = widget.range ? _day(widget.initialEnd) : _start;
    final base = _start ?? DateTime.now();
    _month = DateTime(base.year, base.month);
  }

  static DateTime? _day(DateTime? d) => d == null ? null : DateUtils.dateOnly(d);

  bool _enabled(DateTime d) {
    if (widget.firstDate != null && d.isBefore(DateUtils.dateOnly(widget.firstDate!))) {
      return false;
    }
    if (widget.lastDate != null && d.isAfter(DateUtils.dateOnly(widget.lastDate!))) {
      return false;
    }
    return true;
  }

  void _tap(DateTime d) {
    setState(() {
      if (!widget.range) {
        _start = _end = d;
      } else if (_start == null || _end != null) {
        _start = d;
        _end = null;
      } else if (d.isBefore(_start!)) {
        _start = d;
      } else {
        _end = d;
      }
    });
  }

  void _shiftMonth(int delta) =>
      setState(() => _month = DateTime(_month.year, _month.month + delta));

  String get _summary {
    if (_start == null) return widget.range ? 'Choisis le début' : 'Choisis une date';
    if (widget.range && _end == null) return '${KolaDateFr.date(_start!)} – …';
    return KolaDateFr.range(_start!, _end!);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final scheme = theme.colorScheme;
    final complete = _start != null && _end != null;

    return Padding(
      padding: const EdgeInsets.all(20),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Text(
            widget.range ? 'Période sélectionnée' : 'Date sélectionnée',
            style: theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
          ),
          const SizedBox(height: 2),
          Text(
            _summary,
            style: theme.textTheme.titleLarge?.copyWith(fontWeight: FontWeight.w700),
          ),
          const SizedBox(height: 12),
          Row(
            children: [
              IconButton(
                tooltip: 'Mois précédent',
                icon: const Icon(Icons.chevron_left),
                onPressed: () => _shiftMonth(-1),
              ),
              Expanded(
                child: Text(
                  '${KolaDateFr.months[_month.month - 1]} ${_month.year}',
                  textAlign: TextAlign.center,
                  style: theme.textTheme.titleSmall?.copyWith(fontWeight: FontWeight.w600),
                ),
              ),
              IconButton(
                tooltip: 'Mois suivant',
                icon: const Icon(Icons.chevron_right),
                onPressed: () => _shiftMonth(1),
              ),
            ],
          ),
          Row(
            children: [
              for (final w in KolaDateFr.weekdaysShort)
                Expanded(
                  child: Padding(
                    padding: const EdgeInsets.symmetric(vertical: 6),
                    child: Text(
                      w,
                      textAlign: TextAlign.center,
                      style: theme.textTheme.bodySmall?.copyWith(color: scheme.onSurfaceVariant),
                    ),
                  ),
                ),
            ],
          ),
          ..._weeks(context),
          const SizedBox(height: 8),
          Row(
            mainAxisAlignment: MainAxisAlignment.end,
            children: [
              if (widget.onCancel != null)
                TextButton(onPressed: widget.onCancel, child: const Text('Annuler')),
              const SizedBox(width: 8),
              FilledButton(
                onPressed: complete && widget.onConfirm != null
                    ? () => widget.onConfirm!(KolaDateRange(_start!, _end!))
                    : null,
                child: const Text('Valider'),
              ),
            ],
          ),
        ],
      ),
    );
  }

  List<Widget> _weeks(BuildContext context) {
    final daysInMonth = DateUtils.getDaysInMonth(_month.year, _month.month);
    final leading = DateTime(_month.year, _month.month).weekday - 1; // lundi = 0
    final cells = <DateTime?>[
      for (var i = 0; i < leading; i++) null,
      for (var d = 1; d <= daysInMonth; d++) DateTime(_month.year, _month.month, d),
    ];
    while (cells.length % 7 != 0) {
      cells.add(null);
    }
    return [
      for (var i = 0; i < cells.length; i += 7)
        Row(
          children: [
            for (final d in cells.sublist(i, i + 7))
              Expanded(child: d == null ? const SizedBox(height: 44) : _dayCell(context, d)),
          ],
        ),
    ];
  }

  Widget _dayCell(BuildContext context, DateTime d) {
    final scheme = Theme.of(context).colorScheme;
    final isStart = _start != null && DateUtils.isSameDay(d, _start);
    final isEnd = _end != null && DateUtils.isSameDay(d, _end);
    final edge = isStart || isEnd;
    final inRange = widget.range &&
        _start != null &&
        _end != null &&
        !d.isBefore(_start!) &&
        !d.isAfter(_end!);
    final isToday = DateUtils.isSameDay(d, DateTime.now());
    final enabled = _enabled(d);

    BorderRadius? band;
    if (inRange && !DateUtils.isSameDay(_start, _end)) {
      band = BorderRadius.horizontal(
        left: isStart ? const Radius.circular(22) : Radius.zero,
        right: isEnd ? const Radius.circular(22) : Radius.zero,
      );
    }

    return Container(
      height: 44,
      margin: const EdgeInsets.symmetric(vertical: 1),
      decoration: band == null
          ? null
          : BoxDecoration(color: scheme.primary.withValues(alpha: 0.12), borderRadius: band),
      child: Center(
        child: Material(
          color: edge ? scheme.primary : Colors.transparent,
          shape: const CircleBorder(),
          child: InkWell(
            customBorder: const CircleBorder(),
            onTap: enabled ? () => _tap(d) : null,
            child: SizedBox(
              width: 40,
              height: 40,
              child: Center(
                child: Text(
                  '${d.day}',
                  style: TextStyle(
                    fontWeight: edge || isToday ? FontWeight.w700 : FontWeight.w400,
                    color: !enabled
                        ? scheme.onSurface.withValues(alpha: 0.3)
                        : edge
                            ? scheme.onPrimary
                            : scheme.onSurface,
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
