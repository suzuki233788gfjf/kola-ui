<script setup lang="ts">
/**
 * Champ de texte Kola UI : label, aide, erreur, validation, mot de passe masquable.
 *
 * <KolaTextField
 *   v-model="email"
 *   label="E-mail"
 *   placeholder="nom@exemple.cm"
 *   :validate="(v) => (v.includes('@') ? null : 'Adresse e-mail incomplète')"
 * />
 */
import { computed, ref, useId } from "vue";

const props = withDefaults(
  defineProps<{
    label: string;
    helper?: string;
    /** Erreur imposée de l'extérieur (prioritaire sur validate). */
    error?: string | null;
    /** Vérifie la valeur après le premier passage dans le champ. */
    validate?: (value: string) => string | null;
    /** Mot de passe : texte masqué avec un bouton Afficher / Masquer. */
    obscure?: boolean;
    type?: string;
    placeholder?: string;
    inputmode?: "text" | "numeric" | "tel" | "email" | "decimal" | "search" | "url";
    autocomplete?: string;
    disabled?: boolean;
    id?: string;
  }>(),
  { obscure: false, type: "text", disabled: false },
);
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ blur: [event: FocusEvent] }>();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);
const touched = ref(false);
const hidden = ref(true);
const message = computed(() => props.error ?? (touched.value && props.validate ? props.validate(model.value) : null));
const inputType = computed(() => (props.obscure ? (hidden.value ? "password" : "text") : props.type));
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-sm font-semibold text-kola-ink">{{ label }}</label>
    <div
      :class="[
        'flex min-h-12 items-center gap-2.5 rounded-kola border bg-kola-surface px-3.5 transition [&_svg]:size-5',
        message
          ? 'border-kola-danger ring-1 ring-kola-danger'
          : 'border-kola-line-strong focus-within:border-kola-primary focus-within:ring-1 focus-within:ring-kola-primary',
        disabled && 'opacity-60',
      ]"
    >
      <span v-if="$slots.icon" aria-hidden="true" class="flex text-kola-ink-subtle"><slot name="icon" /></span>
      <slot name="prefix" />
      <input
        :id="inputId"
        v-model="model"
        :type="inputType"
        :placeholder="placeholder"
        :inputmode="inputmode"
        :autocomplete="autocomplete"
        :disabled="disabled"
        :aria-invalid="message ? true : undefined"
        :aria-describedby="message || helper ? `${inputId}-desc` : undefined"
        class="min-w-0 flex-1 bg-transparent py-3 text-base text-kola-ink outline-none placeholder:text-kola-ink-subtle"
        @blur="
          touched = true;
          emit('blur', $event);
        "
      />
      <slot name="suffix" />
      <button
        v-if="obscure"
        type="button"
        :aria-label="hidden ? 'Afficher' : 'Masquer'"
        :title="hidden ? 'Afficher' : 'Masquer'"
        class="-mr-1.5 flex size-9 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink"
        @click="hidden = !hidden"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
          <path v-if="!hidden" d="M3 3l18 18" />
        </svg>
      </button>
    </div>
    <p v-if="message || helper" :id="`${inputId}-desc`" :class="['text-sm', message ? 'text-kola-danger' : 'text-kola-ink-subtle']">
      {{ message ?? helper }}
    </p>
  </div>
</template>
