<script lang="ts">
import { reactive } from "vue";

export type KolaToastType = "success" | "error" | "info" | "warning";
export type KolaToastOptions = { type?: KolaToastType; title?: string; duration?: number };
type Toast = KolaToastOptions & { id: number; message: string };

const toasts = reactive<Toast[]>([]);
let nextId = 0;

/**
 * const toast = useKolaToast();
 * toast("Paiement reçu", { type: "success" });
 */
export function useKolaToast() {
  return (message: string, options: KolaToastOptions = {}) => {
    const id = ++nextId;
    if (toasts.length >= 3) toasts.shift();
    toasts.push({ id, message, ...options });
    setTimeout(() => dismiss(id), options.duration ?? 4000);
  };
}
function dismiss(id: number) {
  const i = toasts.findIndex((t) => t.id === id);
  if (i >= 0) toasts.splice(i, 1);
}
</script>

<script setup lang="ts">
/**
 * Notifications. Place <KolaToaster /> une fois, dans App.vue,
 * puis appelle useKolaToast() dans n'importe quel composant.
 * Nécessite KolaToastView.vue.
 */
import KolaToastView from "./KolaToastView.vue";
</script>

<template>
  <div aria-live="polite" class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 p-4">
    <KolaToastView
      v-for="t in toasts"
      :key="t.id"
      class="pointer-events-auto"
      :message="t.message"
      :title="t.title"
      :type="t.type"
      closable
      @close="dismiss(t.id)"
    />
  </div>
</template>
