<script setup lang="ts">
/**
 * Barre d'onglets en bas d'une app mobile (3 à 5 onglets, avec icône).
 *
 * <KolaBottomNav v-model="page" fixed :items="[
 *   { value: 'accueil', label: 'Accueil', icon: IconeAccueil },
 *   { value: 'commandes', label: 'Commandes', icon: IconeRecu, badge: 2, href: '/commandes' },
 * ]" />
 */
import { computed } from "vue";
import { badgeLabel, type KolaTabItem } from "./KolaTabs.vue";

const props = withDefaults(
  defineProps<{
    /** Avec href, l'onglet devient un lien <a>. */
    items: (KolaTabItem & { href?: string })[];
    /** Nom de la barre pour les lecteurs d'écran. */
    label?: string;
    /** Collée en bas de l'écran (position fixed). */
    fixed?: boolean;
  }>(),
  { label: "Navigation principale", fixed: false },
);
const model = defineModel<string>();
const current = computed(() => model.value ?? props.items[0]?.value);
</script>

<template>
  <nav
    :aria-label="label"
    :class="['border-t border-kola-line bg-kola-surface pb-[env(safe-area-inset-bottom)]', fixed && 'fixed inset-x-0 bottom-0 z-40']"
  >
    <ul class="mx-auto flex h-[68px] max-w-lg">
      <li v-for="item in items" :key="item.value" class="min-w-0 flex-1">
        <component
          :is="item.href ? 'a' : 'button'"
          :href="item.href"
          :type="item.href ? undefined : 'button'"
          :aria-current="item.value === current ? 'page' : undefined"
          class="flex h-full w-full flex-col items-center justify-center gap-1 outline-none focus-visible:ring-2 focus-visible:ring-kola-primary focus-visible:ring-inset"
          @click="model = item.value"
        >
          <span
            :class="[
              'relative flex h-[30px] w-14 items-center justify-center rounded-full transition [&_svg]:size-[22px]',
              item.value === current ? 'bg-kola-primary/12 text-kola-primary' : 'text-kola-ink-subtle',
            ]"
          >
            <span aria-hidden="true" class="flex"><component :is="item.icon" v-if="item.icon" /></span>
            <span
              v-if="item.badge"
              class="absolute -top-1 right-1.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-kola-primary px-1.5 text-[11px] leading-none font-bold text-kola-on-primary"
            >
              {{ badgeLabel(item.badge) }}
            </span>
          </span>
          <span :class="['max-w-full truncate px-1 text-xs', item.value === current ? 'font-semibold text-kola-primary' : 'font-medium text-kola-ink-subtle']">
            {{ item.label }}
          </span>
        </component>
      </li>
    </ul>
  </nav>
</template>
