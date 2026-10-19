<script setup lang="ts">
/**
 * Bouton Kola UI.
 *
 * <KolaButton label="Valider" @click="envoyer" />
 * <KolaButton label="Envoi…" loading />
 * Icône : <KolaButton label="Valider"><template #icon><MonIcone /></template></KolaButton>
 */
withDefaults(
  defineProps<{
    label: string;
    variant?: "primary" | "secondary" | "outline" | "text";
    loading?: boolean;
    expanded?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
  }>(),
  { variant: "primary", loading: false, expanded: false, disabled: false, type: "button" },
);
defineEmits<{ click: [event: MouseEvent] }>();

const VARIANTS = {
  primary: "bg-kola-primary text-kola-on-primary hover:brightness-110",
  secondary: "bg-kola-primary/12 text-kola-primary hover:bg-kola-primary/20",
  outline: "border border-kola-line-strong text-kola-ink hover:border-kola-primary hover:text-kola-primary",
  text: "text-kola-primary hover:bg-kola-primary/10",
};
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :aria-busy="loading || undefined"
    :class="[
      'inline-flex min-h-12 items-center justify-center gap-2 rounded-kola px-5 font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kola-primary disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-5',
      loading && 'cursor-progress',
      expanded && 'w-full',
      VARIANTS[variant],
    ]"
    @click="!loading && $emit('click', $event)"
  >
    <span v-if="loading" aria-hidden="true" class="size-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
    <slot v-else name="icon" />
    <span>{{ label }}</span>
  </button>
</template>
