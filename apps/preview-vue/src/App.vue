<script setup lang="ts">
/**
 * Vitrine Vue de Kola UI. Le composant et ses options viennent de l'adresse
 * (?c=bouton&variant=outline&color=9A3324&dark=1), puis des messages du site
 * (« kola?… ») pour un aperçu instantané, sans rechargement.
 */
import { computed, onMounted, ref, watchEffect } from "vue";
import Demo from "./Demo.vue";

const params = ref<Record<string, string>>(Object.fromEntries(new URLSearchParams(location.search)));
const key = computed(() => new URLSearchParams(params.value).toString());

onMounted(() => {
  window.addEventListener("message", (e) => {
    if (e.origin !== location.origin) return;
    if (typeof e.data === "string" && e.data.startsWith("kola?")) params.value = Object.fromEntries(new URLSearchParams(e.data.slice(5)));
  });
  window.parent?.postMessage("kola-ready", location.origin);
});

watchEffect(() => {
  const root = document.documentElement;
  root.dataset.kolaTheme = params.value.dark === "1" ? "dark" : "light";
  const hex = params.value.color;
  if (hex && /^[0-9a-fA-F]{6}$/.test(hex)) root.style.setProperty("--kola-primary", "#" + hex);
  else root.style.removeProperty("--kola-primary");
});
</script>

<template>
  <main class="flex min-h-full items-center justify-center bg-kola-surface-muted p-6 text-kola-ink">
    <Demo :key="key" :p="params" />
  </main>
</template>
