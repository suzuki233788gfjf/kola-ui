<script setup lang="ts">
/**
 * Carte produit.
 *
 * <KolaCard badge="Nouveau" title="Riz parfumé 5 kg" subtitle="Épicerie · En stock" footer="4 500 FCFA" @click="ouvrir">
 *   <template #media><img :src="url" alt="" class="size-full object-cover" /></template>
 * </KolaCard>
 */
withDefaults(defineProps<{ title: string; subtitle?: string; badge?: string; footer?: string; mediaHeight?: number; clickable?: boolean }>(), {
  mediaHeight: 140,
  clickable: false,
});
defineEmits<{ click: [] }>();
</script>

<template>
  <component
    :is="clickable ? 'button' : 'article'"
    :type="clickable ? 'button' : undefined"
    :class="[
      'flex w-full flex-col overflow-hidden rounded-[16px] border border-kola-line bg-kola-surface text-left',
      clickable && 'transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kola-primary',
    ]"
    @click="clickable && $emit('click')"
  >
    <div v-if="$slots.media" :style="{ height: mediaHeight + 'px' }" class="relative flex items-center justify-center overflow-hidden bg-kola-surface-muted text-kola-ink-subtle">
      <slot name="media" />
      <span v-if="badge" class="absolute top-3 left-3 rounded-full bg-kola-primary px-2.5 py-1 text-xs font-semibold text-kola-on-primary">{{ badge }}</span>
    </div>
    <div class="flex flex-col gap-1 p-4">
      <span v-if="!$slots.media && badge" class="mb-1 self-start rounded-full bg-kola-primary/12 px-2.5 py-1 text-xs font-semibold text-kola-primary">{{ badge }}</span>
      <h3 class="font-semibold text-kola-ink">{{ title }}</h3>
      <p v-if="subtitle" class="text-sm text-kola-ink-subtle">{{ subtitle }}</p>
      <div v-if="footer || $slots.footer" class="mt-2 font-bold text-kola-ink"><slot name="footer">{{ footer }}</slot></div>
    </div>
  </component>
</template>
