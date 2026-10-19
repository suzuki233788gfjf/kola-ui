<script lang="ts">
export type KolaConfirmOptions = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Bouton de confirmation en rouge (suppression, action définitive). */
  destructive?: boolean;
  /** Panneau qui monte du bas de l'écran (pratique sur mobile). */
  sheet?: boolean;
};
</script>

<script setup lang="ts">
/**
 * Demande de confirmation en une ligne.
 *
 * <KolaConfirm ref="confirmer" />
 *
 * const confirmer = ref();
 * if (await confirmer.value.open({ title: "Supprimer cet article ?", destructive: true })) {
 *   // l'utilisateur a confirmé
 * }
 */
import { nextTick, ref } from "vue";

const options = ref<KolaConfirmOptions | null>(null);
const dialog = ref<HTMLDialogElement | null>(null);
let resolver: ((ok: boolean) => void) | null = null;

async function open(o: KolaConfirmOptions): Promise<boolean> {
  resolver?.(false);
  options.value = o;
  await nextTick();
  if (dialog.value && !dialog.value.open) dialog.value.showModal();
  return new Promise<boolean>((resolve) => (resolver = resolve));
}
function finish(ok: boolean) {
  resolver?.(ok);
  resolver = null;
  dialog.value?.close();
  options.value = null;
}
defineExpose({ open });
</script>

<template>
  <dialog
    ref="dialog"
    :aria-label="options?.title"
    :class="[
      'border border-kola-line bg-kola-surface p-0 text-kola-ink shadow-2xl backdrop:bg-black/40',
      options?.sheet ? 'mx-0 mt-auto mb-0 w-full max-w-full rounded-t-[24px]' : 'm-auto w-[calc(100%-32px)] max-w-[420px] rounded-[20px]',
    ]"
    @cancel.prevent="finish(false)"
    @click="$event.target === $event.currentTarget && finish(false)"
  >
    <div v-if="options" :class="['flex flex-col gap-3 p-6', options.sheet && 'mx-auto max-w-[560px] pb-8']">
      <span v-if="options.sheet" aria-hidden="true" class="mx-auto -mt-2 mb-2 h-1 w-10 rounded-full bg-kola-line-strong" />
      <h2 class="text-xl font-bold">{{ options.title }}</h2>
      <p v-if="options.message" class="leading-relaxed text-kola-ink-muted">{{ options.message }}</p>
      <div :class="['mt-3 flex gap-2', options.sheet ? 'flex-col-reverse' : 'justify-end']">
        <button type="button" class="min-h-12 rounded-kola px-5 font-semibold text-kola-ink-muted hover:bg-kola-surface-muted" @click="finish(false)">
          {{ options.cancelLabel ?? "Annuler" }}
        </button>
        <button
          type="button"
          autofocus
          :class="['min-h-12 rounded-kola px-5 font-semibold hover:brightness-110', options.destructive ? 'bg-kola-danger text-kola-bg' : 'bg-kola-primary text-kola-on-primary']"
          @click="finish(true)"
        >
          {{ options.confirmLabel ?? "Confirmer" }}
        </button>
      </div>
    </div>
  </dialog>
</template>
