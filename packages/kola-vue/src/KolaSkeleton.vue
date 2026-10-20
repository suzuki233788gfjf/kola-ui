<script setup lang="ts">
/**
 * Forme grise qui pulse doucement pendant le chargement. Donne-lui sa taille avec class.
 *
 * <KolaSkeleton class="h-4 w-32" />
 * <KolaSkeleton circle class="size-10" />
 */
withDefaults(defineProps<{ circle?: boolean }>(), { circle: false });
</script>

<template>
  <span aria-hidden="true" :class="['block bg-kola-line motion-safe:animate-pulse', circle ? 'shrink-0 rounded-full' : 'rounded-md']" />
</template>
