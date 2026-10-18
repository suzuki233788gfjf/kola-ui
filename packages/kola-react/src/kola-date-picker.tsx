"use client";

import { useEffect, useId, useRef, useState } from "react";

export type KolaDateRange = { start: Date; end: Date };

/** Dates en français, sans dépendance. */
export const KolaDateFr = {
  months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
  monthsShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
  weekdaysShort: ["L", "M", "M", "J", "V", "S", "D"],
  weekdays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
  /** → "12 oct. 2026" */
  date(d: Date) {
    return `${d.getDate()} ${this.monthsShort[d.getMonth()]} ${d.getFullYear()}`;
  },
  /** → "Du 12 au 16 oct. 2026" (s'adapte si le mois ou l'année change) */
  range(start: Date, end: Date) {
    if (sameDay(start, end)) return this.date(start);
    if (start.getFullYear() !== end.getFullYear()) return `Du ${this.date(start)} au ${this.date(end)}`;
    if (start.getMonth() !== end.getMonth())
      return `Du ${start.getDate()} ${this.monthsShort[start.getMonth()]} au ${this.date(end)}`;
    return `Du ${start.getDate()} au ${this.date(end)}`;
  },
};

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

export type KolaCalendarProps = {
  /** true : choisir une période (début puis fin). */
  range?: boolean;
  initialStart?: Date | null;
  initialEnd?: Date | null;
  firstDate?: Date;
  lastDate?: Date;
  onConfirm: (value: KolaDateRange) => void;
  onCancel?: () => void;
  className?: string;
};

/**
 * Calendrier en français, semaine qui commence le lundi.
 *
 * <KolaCalendar range onConfirm={({ start, end }) => console.log(start, end)} />
 */
export function KolaCalendar({
  range = false,
  initialStart = null,
  initialEnd = null,
  firstDate,
  lastDate,
  onConfirm,
  onCancel,
  className = "",
}: KolaCalendarProps) {
  const [start, setStart] = useState<Date | null>(initialStart && startOfDay(initialStart));
  const [end, setEnd] = useState<Date | null>(initialEnd && startOfDay(initialEnd));
  const [month, setMonth] = useState(() => {
    const base = initialStart ?? new Date();
    return new Date(base.getFullYear(), base.getMonth(), 1);
  });
  const today = startOfDay(new Date());
  const min = firstDate && startOfDay(firstDate);
  const max = lastDate && startOfDay(lastDate);

  const offset = (month.getDay() + 6) % 7; // lundi = 0
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const cells: (Date | null)[] = [
    ...Array<null>(offset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(month.getFullYear(), month.getMonth(), i + 1)),
  ];

  function pick(day: Date) {
    if (!range || !start || end) {
      setStart(day);
      setEnd(null);
    } else if (day < start) {
      setStart(day);
    } else {
      setEnd(day);
    }
  }

  const canPrev = !min || new Date(month.getFullYear(), month.getMonth(), 0) >= min;
  const canNext = !max || new Date(month.getFullYear(), month.getMonth() + 1, 1) <= max;
  const ready = range ? !!start && !!end : !!start;
  const summary = !start
    ? range
      ? "Choisis le début"
      : "Choisis une date"
    : range && !end
      ? `${KolaDateFr.date(start)} → choisis la fin`
      : range
        ? KolaDateFr.range(start, end!)
        : KolaDateFr.date(start);

  return (
    <div className={`flex w-full max-w-[360px] flex-col gap-4 p-5 text-kola-ink ${className}`}>
      <div>
        <p className="text-sm text-kola-ink-subtle">{range ? "Période sélectionnée" : "Date sélectionnée"}</p>
        <p aria-live="polite" className="text-lg font-bold">
          {summary}
        </p>
      </div>
      <div className="flex items-center justify-between">
        <NavButton
          label="Mois précédent"
          disabled={!canPrev}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}
          path="M15 6l-6 6 6 6"
        />
        <span className="font-semibold capitalize">
          {KolaDateFr.months[month.getMonth()]} {month.getFullYear()}
        </span>
        <NavButton
          label="Mois suivant"
          disabled={!canNext}
          onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}
          path="M9 6l6 6-6 6"
        />
      </div>
      <div role="grid" className="grid grid-cols-7 gap-y-1 text-center">
        {KolaDateFr.weekdaysShort.map((w, i) => (
          <span key={i} role="columnheader" aria-label={KolaDateFr.weekdays[i]} className="py-1 text-xs font-semibold text-kola-ink-subtle">
            {w}
          </span>
        ))}
        {cells.map((day, i) => {
          if (!day) return <span key={i} />;
          const disabled = (min && day < min) || (max && day > max);
          const isStart = !!start && sameDay(day, start);
          const isEnd = !!end && sameDay(day, end);
          const inRange = !!start && !!end && day > start && day < end;
          const selected = isStart || isEnd;
          return (
            <span
              key={i}
              className={`flex justify-center ${inRange ? "bg-kola-primary/12" : ""} ${
                isStart && end && !isEnd ? "rounded-l-full bg-kola-primary/12" : ""
              } ${isEnd && start && !isStart ? "rounded-r-full bg-kola-primary/12" : ""}`}
            >
              <button
                type="button"
                disabled={!!disabled}
                aria-pressed={selected}
                aria-label={`${day.getDate()} ${KolaDateFr.months[day.getMonth()]} ${day.getFullYear()}`}
                onClick={() => pick(day)}
                className={`size-10 rounded-full text-sm transition disabled:opacity-30 ${
                  selected
                    ? "bg-kola-primary font-semibold text-kola-on-primary"
                    : `hover:bg-kola-primary/15 ${sameDay(day, today) ? "font-semibold text-kola-primary ring-1 ring-kola-primary" : ""}`
                }`}
              >
                {day.getDate()}
              </button>
            </span>
          );
        })}
      </div>
      <div className="flex justify-end gap-2">
        {onCancel && (
          <button type="button" onClick={onCancel} className="min-h-11 rounded-kola px-4 font-semibold text-kola-primary hover:bg-kola-primary/10">
            Annuler
          </button>
        )}
        <button
          type="button"
          disabled={!ready}
          onClick={() => start && onConfirm({ start, end: range ? end! : start })}
          className="min-h-11 rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110 disabled:opacity-40"
        >
          Valider
        </button>
      </div>
    </div>
  );
}

function NavButton({ label, path, disabled, onClick }: { label: string; path: string; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      disabled={disabled}
      onClick={onClick}
      className="flex size-10 items-center justify-center rounded-full hover:bg-kola-primary/10 disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
        <path d={path} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export type KolaDatePickerProps = {
  label: string;
  range?: boolean;
  value?: KolaDateRange | null;
  onChange?: (value: KolaDateRange) => void;
  placeholder?: string;
  firstDate?: Date;
  lastDate?: Date;
  className?: string;
};

/**
 * Champ date : un clic ouvre le calendrier dans une fenêtre.
 *
 * <KolaDatePicker label="Date de livraison" onChange={({ start }) => console.log(start)} />
 * <KolaDatePicker label="Période" range onChange={({ start, end }) => …} />
 */
export function KolaDatePicker({
  label,
  range = false,
  value,
  onChange,
  placeholder,
  firstDate,
  lastDate,
  className = "",
}: KolaDatePickerProps) {
  const [inner, setInner] = useState<KolaDateRange | null>(null);
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const id = useId();
  const current = value !== undefined ? value : inner;

  useEffect(() => {
    const d = dialog.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <span id={id} className="text-sm font-semibold text-kola-ink">
        {label}
      </span>
      <button
        type="button"
        aria-labelledby={`${id} ${id}-value`}
        aria-haspopup="dialog"
        onClick={() => setOpen(true)}
        className="flex min-h-12 items-center gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface px-3.5 text-left hover:border-kola-ink-subtle focus-visible:border-kola-primary focus-visible:ring-1 focus-visible:ring-kola-primary focus-visible:outline-none"
      >
        <svg viewBox="0 0 24 24" className="size-5 text-kola-ink-subtle" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
        </svg>
        <span id={`${id}-value`} className={current ? "text-kola-ink" : "text-kola-ink-subtle"}>
          {current
            ? range
              ? KolaDateFr.range(current.start, current.end)
              : KolaDateFr.date(current.start)
            : (placeholder ?? (range ? "Choisir une période" : "Choisir une date"))}
        </span>
      </button>
      <dialog
        ref={dialog}
        aria-label={label}
        onClose={() => setOpen(false)}
        onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        className="m-auto rounded-[20px] border border-kola-line bg-kola-surface p-0 shadow-2xl backdrop:bg-black/40"
      >
        {open && (
          <KolaCalendar
            range={range}
            initialStart={current?.start}
            initialEnd={range ? current?.end : null}
            firstDate={firstDate}
            lastDate={lastDate}
            onCancel={() => setOpen(false)}
            onConfirm={(v) => {
              setInner(v);
              onChange?.(v);
              setOpen(false);
            }}
          />
        )}
      </dialog>
    </div>
  );
}
