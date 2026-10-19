<script setup lang="ts">
/**
 * Champ date : un clic ouvre le calendrier dans une fenêtre.
 * Nécessite KolaCalendar.vue.
 *
 * <KolaDatePicker v-model="livraison" label="Date de livraison" />
 * <KolaDatePicker v-model="periode" label="Période" range />   // { start, end }
 */
import { ref, useId, watch } from "vue";
import KolaCalendar, { KolaDateFr, type KolaDateRange } from "./KolaCalendar.vue";

const props = withDefaults(defineProps<{ label: string; range?: boolean; placeholder?: string; firstDate?: Date; lastDate?: Date }>(), {
  range: false,
});
const model = defineModel<KolaDateRange | null>({ default: null });
const open = ref(false);
const dialog = ref<HTMLDialogElement | null>(null);
const id = useId();

watch(open, (o) => {
  const d = dialog.value;
  if (!d) return;
  if (o && !d.open) d.showModal();
  if (!o && d.open) d.close();
});
function text() {
  const v = model.value;
  if (!v) return props.placeholder ?? (props.range ? "Choisir une période" : "Choisir une date");
  return props.range ? KolaDateFr.range(v.start, v.end) : KolaDateFr.date(v.start);
}
function onConfirm(v: KolaDateRange) {
  model.value = v;
  open.value = false;
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <span :id="id" class="text-sm font-semibold text-kola-ink">{{ label }}</span>
    <button
      type="button"
      :aria-labelledby="`${id} ${id}-value`"
      aria-haspopup="dialog"
      class="flex min-h-12 items-center gap-2.5 rounded-kola border border-kola-line-strong bg-kola-surface px-3.5 text-left hover:border-kola-ink-subtle focus-visible:border-kola-primary focus-visible:ring-1 focus-visible:ring-kola-primary focus-visible:outline-none"
      @click="open = true"
    >
      <svg viewBox="0 0 24 24" class="size-5 text-kola-ink-subtle" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <rect x="3" y="5" width="18" height="16" rx="2" />
        <path d="M3 10h18M8 3v4M16 3v4" />
      </svg>
      <span :id="`${id}-value`" :class="model ? 'text-kola-ink' : 'text-kola-ink-subtle'">{{ text() }}</span>
    </button>
    <dialog
      ref="dialog"
      :aria-label="label"
      class="m-auto rounded-[20px] border border-kola-line bg-kola-surface p-0 shadow-2xl backdrop:bg-black/40"
      @close="open = false"
      @click="$event.target === $event.currentTarget && (open = false)"
    >
      <KolaCalendar
        v-if="open"
        :range="range"
        :initial-start="model?.start"
        :initial-end="range ? model?.end : null"
        :first-date="firstDate"
        :last-date="lastDate"
        cancelable
        @cancel="open = false"
        @confirm="onConfirm"
      />
    </dialog>
  </div>
</template>
