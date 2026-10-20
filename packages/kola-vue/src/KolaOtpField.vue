<script lang="ts">
/**
 * Garde seulement le code : "48 29 13" → "482913",
 * "Votre code Kola : 482913." → "482913".
 */
export function parseOtp(text: string, length: number): string {
  const compact = text.replace(/[\s-]/g, "");
  if (/^\d*$/.test(compact)) return compact.slice(0, length);
  const match = new RegExp(`(^|\\D)(\\d{${length}})(?!\\d)`).exec(text);
  if (match) return match[2];
  return text.replace(/\D/g, "").slice(0, length);
}

/** 75 → "1:15" */
export function formatDelay(seconds: number): string {
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}
</script>

<script setup lang="ts">
/**
 * Champ code OTP : les cases pour le code reçu par SMS.
 * Un seul champ invisible derrière les cases : collage, remplissage automatique
 * du SMS et effacement marchent comme dans un champ normal.
 *
 * <KolaOtpField
 *   v-model="code"
 *   helper="Envoyé par SMS au 6 77 12 34 56"
 *   :on-resend="renvoyerSms"
 *   @complete="verifier"
 * />
 */
import { computed, onBeforeUnmount, onMounted, ref, useId, watch } from "vue";

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Nombre de chiffres (4 ou 6 le plus souvent). */
    length?: number;
    /** Texte sous les cases, ex. "Envoyé par SMS au 6 77 12 34 56". */
    helper?: string;
    /** Erreur à afficher, ex. "Code incorrect". Les cases passent en rouge. */
    error?: string | null;
    /** Si présent, affiche « Renvoyer le code » après resendDelay secondes. */
    onResend?: () => void | Promise<void>;
    resendDelay?: number;
    autofocus?: boolean;
    disabled?: boolean;
    id?: string;
    name?: string;
  }>(),
  { label: "Code de vérification", length: 6, resendDelay: 60, autofocus: false, disabled: false },
);
const model = defineModel<string>({ default: "" });
const emit = defineEmits<{ complete: [code: string] }>();

const autoId = useId();
const inputId = computed(() => props.id ?? autoId);
const input = ref<HTMLInputElement | null>(null);
const focused = ref(false);
const left = ref(props.onResend ? props.resendDelay : 0);
const sending = ref(false);

const code = computed(() => parseOtp(model.value ?? "", props.length));
const active = computed(() => (focused.value ? Math.min(code.value.length, props.length - 1) : -1));
const message = computed(() => props.error ?? props.helper);

function update(next: string) {
  if (next === code.value) {
    // Remet l'affichage du champ au propre (lettres refusées, etc.).
    if (input.value && input.value.value !== next) input.value.value = next;
    return;
  }
  model.value = next;
  if (next.length === props.length) emit("complete", next);
}

function onPaste(e: ClipboardEvent) {
  // Un collage remplace tout le code au lieu de s'ajouter à la fin.
  e.preventDefault();
  update(parseOtp(e.clipboardData?.getData("text") ?? "", props.length));
}

function keepCaretAtEnd(e: Event) {
  // Le curseur reste toujours à la fin : on remplit les cases dans l'ordre.
  const el = e.target as HTMLInputElement;
  const end = el.value.length;
  if (el.selectionStart !== end || el.selectionEnd !== end) el.setSelectionRange(end, end);
}

let timer: ReturnType<typeof setInterval> | undefined;
function startTimer() {
  clearInterval(timer);
  left.value = props.resendDelay;
  timer = setInterval(() => {
    left.value = Math.max(0, left.value - 1);
    if (left.value === 0) clearInterval(timer);
  }, 1000);
}
onMounted(() => {
  if (props.onResend) startTimer();
});
onBeforeUnmount(() => clearInterval(timer));

async function resend() {
  if (!props.onResend) return;
  sending.value = true;
  try {
    await props.onResend();
    model.value = "";
    startTimer();
    input.value?.focus();
  } finally {
    sending.value = false;
  }
}

// Le parent peut vider le code (ex. après une erreur) : on garde le champ synchronisé.
watch(code, (c) => {
  if (input.value && input.value.value !== c) input.value.value = c;
});
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <label :for="inputId" class="text-sm font-semibold text-kola-ink">{{ label }}</label>
    <div :class="['relative flex max-w-full gap-2 self-start', disabled && 'opacity-60']">
      <div
        v-for="i in length"
        :key="i"
        aria-hidden="true"
        :class="[
          'flex aspect-[6/7] w-12 min-w-0 shrink items-center justify-center rounded-kola border bg-kola-surface text-2xl font-semibold text-kola-ink transition',
          error
            ? 'border-kola-danger ring-1 ring-kola-danger'
            : i - 1 === active
              ? 'border-kola-primary ring-1 ring-kola-primary'
              : 'border-kola-line-strong',
        ]"
      >
        <template v-if="code[i - 1]">{{ code[i - 1] }}</template>
        <span v-else-if="i - 1 === active" class="h-1/2 w-0.5 rounded-full bg-kola-primary motion-safe:animate-pulse" />
      </div>
      <!-- Le vrai champ, invisible, posé sur les cases. -->
      <input
        :id="inputId"
        ref="input"
        :name="name"
        :value="code"
        :disabled="disabled"
        :autofocus="autofocus"
        inputmode="numeric"
        autocomplete="one-time-code"
        pattern="[0-9]*"
        spellcheck="false"
        :aria-invalid="error ? true : undefined"
        :aria-describedby="message ? `${inputId}-desc` : undefined"
        class="absolute inset-0 h-full w-full cursor-text bg-transparent text-base text-transparent caret-transparent opacity-0 outline-none disabled:cursor-not-allowed"
        @input="update(parseOtp(($event.target as HTMLInputElement).value, length))"
        @paste="onPaste"
        @focus="focused = true"
        @blur="focused = false"
        @select="keepCaretAtEnd"
        @keyup="keepCaretAtEnd"
        @click="keepCaretAtEnd"
      />
    </div>
    <p v-if="message" :id="`${inputId}-desc`" :class="['text-sm', error ? 'text-kola-danger' : 'text-kola-ink-subtle']">
      {{ message }}
    </p>
    <p v-if="onResend" class="mt-1 text-sm text-kola-ink-subtle">
      <template v-if="left > 0">
        Renvoyer le code dans <span class="font-mono">{{ formatDelay(left) }}</span>
      </template>
      <button
        v-else
        type="button"
        :disabled="sending || disabled"
        class="font-semibold text-kola-primary hover:underline disabled:opacity-60"
        @click="resend"
      >
        {{ sending ? "Envoi…" : "Renvoyer le code" }}
      </button>
    </p>
  </div>
</template>
