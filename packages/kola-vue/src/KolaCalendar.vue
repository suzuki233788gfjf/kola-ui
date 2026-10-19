<script lang="ts">
export type KolaDateRange = { start: Date; end: Date };

const same = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

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
  /** → "Du 12 au 16 oct. 2026" */
  range(start: Date, end: Date) {
    if (same(start, end)) return this.date(start);
    if (start.getFullYear() !== end.getFullYear()) return `Du ${this.date(start)} au ${this.date(end)}`;
    if (start.getMonth() !== end.getMonth()) return `Du ${start.getDate()} ${this.monthsShort[start.getMonth()]} au ${this.date(end)}`;
    return `Du ${start.getDate()} au ${this.date(end)}`;
  },
};
</script>

<script setup lang="ts">
/**
 * Calendrier en français, semaine qui commence le lundi.
 *
 * <KolaCalendar range @confirm="({ start, end }) => …" @cancel="…" />
 */
import { computed, ref } from "vue";

const props = withDefaults(
  defineProps<{ range?: boolean; initialStart?: Date | null; initialEnd?: Date | null; firstDate?: Date; lastDate?: Date; cancelable?: boolean }>(),
  { range: false, initialStart: null, initialEnd: null, cancelable: false },
);
const emit = defineEmits<{ confirm: [value: KolaDateRange]; cancel: [] }>();

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
const start = ref<Date | null>(props.initialStart ? startOfDay(props.initialStart) : null);
const end = ref<Date | null>(props.initialEnd ? startOfDay(props.initialEnd) : null);
const base = props.initialStart ?? new Date();
const month = ref(new Date(base.getFullYear(), base.getMonth(), 1));
const today = startOfDay(new Date());
const min = props.firstDate && startOfDay(props.firstDate);
const max = props.lastDate && startOfDay(props.lastDate);

const cells = computed(() => {
  const m = month.value;
  const offset = (m.getDay() + 6) % 7;
  const days = new Date(m.getFullYear(), m.getMonth() + 1, 0).getDate();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: days }, (_, i) => new Date(m.getFullYear(), m.getMonth(), i + 1)),
  ];
});
const canPrev = computed(() => !min || new Date(month.value.getFullYear(), month.value.getMonth(), 0) >= min);
const canNext = computed(() => !max || new Date(month.value.getFullYear(), month.value.getMonth() + 1, 1) <= max);
const ready = computed(() => (props.range ? !!start.value && !!end.value : !!start.value));
const summary = computed(() => {
  if (!start.value) return props.range ? "Choisis le début" : "Choisis une date";
  if (props.range && !end.value) return `${KolaDateFr.date(start.value)} → choisis la fin`;
  return props.range ? KolaDateFr.range(start.value, end.value!) : KolaDateFr.date(start.value);
});

function pick(day: Date) {
  if (!props.range || !start.value || end.value) {
    start.value = day;
    end.value = null;
  } else if (day < start.value) start.value = day;
  else end.value = day;
}
function move(delta: number) {
  month.value = new Date(month.value.getFullYear(), month.value.getMonth() + delta, 1);
}
const isStart = (d: Date) => !!start.value && same(d, start.value);
const isEnd = (d: Date) => !!end.value && same(d, end.value);
const inRange = (d: Date) => !!start.value && !!end.value && d > start.value && d < end.value;
const disabled = (d: Date) => (!!min && d < min) || (!!max && d > max);
function confirm() {
  if (start.value) emit("confirm", { start: start.value, end: props.range ? end.value! : start.value });
}
</script>

<template>
  <div class="flex w-full max-w-[360px] flex-col gap-4 p-5 text-kola-ink">
    <div>
      <p class="text-sm text-kola-ink-subtle">{{ range ? "Période sélectionnée" : "Date sélectionnée" }}</p>
      <p aria-live="polite" class="text-lg font-bold">{{ summary }}</p>
    </div>
    <div class="flex items-center justify-between">
      <button type="button" aria-label="Mois précédent" title="Mois précédent" :disabled="!canPrev" class="flex size-10 items-center justify-center rounded-full hover:bg-kola-primary/10 disabled:opacity-30" @click="move(-1)">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M15 6l-6 6 6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
      <span class="font-semibold capitalize">{{ KolaDateFr.months[month.getMonth()] }} {{ month.getFullYear() }}</span>
      <button type="button" aria-label="Mois suivant" title="Mois suivant" :disabled="!canNext" class="flex size-10 items-center justify-center rounded-full hover:bg-kola-primary/10 disabled:opacity-30" @click="move(1)">
        <svg viewBox="0 0 24 24" class="size-5" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke-linecap="round" stroke-linejoin="round" /></svg>
      </button>
    </div>
    <div role="grid" class="grid grid-cols-7 gap-y-1 text-center">
      <span v-for="(w, i) in KolaDateFr.weekdaysShort" :key="'w' + i" role="columnheader" :aria-label="KolaDateFr.weekdays[i]" class="py-1 text-xs font-semibold text-kola-ink-subtle">{{ w }}</span>
      <template v-for="(day, i) in cells" :key="i">
        <span v-if="!day" />
        <span
          v-else
          :class="[
            'flex justify-center',
            inRange(day) && 'bg-kola-primary/12',
            isStart(day) && end && !isEnd(day) && 'rounded-l-full bg-kola-primary/12',
            isEnd(day) && start && !isStart(day) && 'rounded-r-full bg-kola-primary/12',
          ]"
        >
          <button
            type="button"
            :disabled="disabled(day)"
            :aria-pressed="isStart(day) || isEnd(day)"
            :aria-label="`${day.getDate()} ${KolaDateFr.months[day.getMonth()]} ${day.getFullYear()}`"
            :class="[
              'size-10 rounded-full text-sm transition disabled:opacity-30',
              isStart(day) || isEnd(day)
                ? 'bg-kola-primary font-semibold text-kola-on-primary'
                : ['hover:bg-kola-primary/15', same(day, today) && 'font-semibold text-kola-primary ring-1 ring-kola-primary'],
            ]"
            @click="pick(day)"
          >
            {{ day.getDate() }}
          </button>
        </span>
      </template>
    </div>
    <div class="flex justify-end gap-2">
      <button v-if="cancelable" type="button" class="min-h-11 rounded-kola px-4 font-semibold text-kola-primary hover:bg-kola-primary/10" @click="emit('cancel')">Annuler</button>
      <button type="button" :disabled="!ready" class="min-h-11 rounded-kola bg-kola-primary px-5 font-semibold text-kola-on-primary hover:brightness-110 disabled:opacity-40" @click="confirm">Valider</button>
    </div>
  </div>
</template>
