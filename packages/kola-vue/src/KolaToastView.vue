<script setup lang="ts">
/** Une notification seule, sans minuterie (utilisée par KolaToaster.vue). */
import type { KolaToastType } from "./KolaToaster.vue";

withDefaults(defineProps<{ message: string; title?: string; type?: KolaToastType; closable?: boolean }>(), {
  type: "success",
  closable: false,
});
defineEmits<{ close: [] }>();

const STYLES: Record<KolaToastType, { bar: string; icon: string; path: string; label: string }> = {
  success: { bar: "bg-kola-success", icon: "text-kola-success", path: "M5 12.5l4.5 4.5L19 7.5", label: "Succès" },
  error: { bar: "bg-kola-danger", icon: "text-kola-danger", path: "M7 7l10 10M17 7L7 17", label: "Erreur" },
  info: { bar: "bg-kola-info", icon: "text-kola-info", path: "M12 11v6M12 7.5v.01", label: "Information" },
  warning: { bar: "bg-kola-warning", icon: "text-kola-warning", path: "M12 8v5M12 16.5v.01", label: "Attention" },
};
</script>

<template>
  <div
    :role="type === 'error' ? 'alert' : 'status'"
    class="flex w-full max-w-[420px] items-start gap-3 overflow-hidden rounded-kola border border-kola-line bg-kola-surface py-3.5 pr-2 pl-0 text-kola-ink shadow-lg"
  >
    <span aria-hidden="true" :class="['-my-3.5 w-1 self-stretch', STYLES[type].bar]" />
    <svg viewBox="0 0 24 24" :class="['mt-0.5 size-5 shrink-0', STYLES[type].icon]" fill="none" stroke="currentColor" stroke-width="2.5" :aria-label="STYLES[type].label">
      <circle cx="12" cy="12" r="10" stroke-width="2" />
      <path :d="STYLES[type].path" stroke-linecap="round" stroke-linejoin="round" transform="translate(12 12) scale(0.6) translate(-12 -12)" />
    </svg>
    <div class="flex min-w-0 flex-1 flex-col gap-0.5">
      <p v-if="title" class="font-semibold">{{ title }}</p>
      <p :class="title ? 'text-sm text-kola-ink-muted' : ''">{{ message }}</p>
    </div>
    <button v-if="closable" type="button" aria-label="Fermer" title="Fermer" class="-mt-1 flex size-8 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink" @click="$emit('close')">
      <svg viewBox="0 0 24 24" class="size-4" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M7 7l10 10M17 7L7 17" stroke-linecap="round" /></svg>
    </button>
  </div>
</template>
