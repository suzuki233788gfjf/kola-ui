<script setup lang="ts">
/**
 * Écran vide ou d'erreur : une icône, un titre, un message et une action.
 *
 * <KolaEmptyState title="Aucune commande pour le moment" message="Tes commandes apparaîtront ici.">
 *   <template #action><KolaButton label="Partager ma boutique" /></template>
 * </KolaEmptyState>
 *
 * Icône : <template #icon><MonIcone /></template>  ·  Erreur : tone="error"
 */
withDefaults(
  defineProps<{
    title: string;
    message?: string;
    /** "error" : icône rouge, annoncée aux lecteurs d'écran. */
    tone?: "neutral" | "error";
  }>(),
  { tone: "neutral" },
);
</script>

<template>
  <div :role="tone === 'error' ? 'alert' : undefined" class="flex flex-col items-center px-6 py-8 text-center">
    <span
      aria-hidden="true"
      :class="[
        'mb-4 flex size-16 items-center justify-center rounded-full [&_svg]:size-[30px]',
        tone === 'error' ? 'bg-kola-danger/12 text-kola-danger' : 'bg-kola-primary/12 text-kola-primary',
      ]"
    >
      <slot name="icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 13l2.5-7h13L21 13M3 13v6h18v-6M3 13h5l1.5 2.5h5L16 13h5" />
        </svg>
      </slot>
    </span>
    <p class="text-lg font-bold text-kola-ink">{{ title }}</p>
    <p v-if="message" class="mt-1.5 max-w-80 leading-relaxed text-kola-ink-subtle">{{ message }}</p>
    <div v-if="$slots.action" class="mt-5"><slot name="action" /></div>
  </div>
</template>
