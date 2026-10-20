<script setup lang="ts">
/**
 * Liste en cours de chargement : rows lignes avec avatar, titre et sous-titre.
 *
 * <KolaSkeletonList v-if="chargement" :rows="4" />
 * <MaListe v-else />
 */
import KolaSkeleton from "./KolaSkeleton.vue";

withDefaults(defineProps<{ rows?: number; avatar?: boolean }>(), { rows: 3, avatar: true });
</script>

<template>
  <div role="status" aria-label="Chargement…" aria-busy="true" class="flex flex-col">
    <div v-for="i in rows" :key="i" class="flex items-center gap-3 py-2.5">
      <KolaSkeleton v-if="avatar" circle class="size-10" />
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <KolaSkeleton :class="['h-3.5', i % 2 ? 'w-[70%]' : 'w-[55%]']" />
        <KolaSkeleton :class="['h-3', i % 2 ? 'w-[45%]' : 'w-[60%]']" />
      </div>
      <KolaSkeleton class="h-3.5 w-14" />
    </div>
  </div>
</template>
