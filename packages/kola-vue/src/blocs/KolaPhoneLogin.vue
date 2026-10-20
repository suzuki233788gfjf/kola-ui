<script setup lang="ts">
/**
 * Bloc « Connexion par téléphone » : numéro +237, puis code reçu par SMS.
 * Le bloc gère l'écran ; l'envoi du SMS et la vérification passent par TON serveur.
 *
 * <KolaPhoneLogin :on-send-code="envoyerSms" :on-verify="verifierCode" @success="router.push('/accueil')" />
 * async function envoyerSms(numero: string) { … }
 * async function verifierCode(numero: string, code: string) { return true; }
 */
import { computed, ref } from "vue";
import KolaButton from "../KolaButton.vue";
import KolaOtpField from "../KolaOtpField.vue";
import KolaPhoneField, { formatPhone, validatePhone } from "../KolaPhoneField.vue";

const props = withDefaults(
  defineProps<{
    /** Envoie le code par SMS. Reçoit le numéro sans espaces (ex. "677123456"). */
    onSendCode: (phone: string) => Promise<void>;
    /** Vérifie le code. Renvoie true si c'est le bon. */
    onVerify: (phone: string, code: string) => Promise<boolean>;
    title?: string;
    codeLength?: number;
  }>(),
  { title: "Connexion", codeLength: 6 },
);
const emit = defineEmits<{ success: [phone: string] }>();

const step = ref<"phone" | "code" | "done">("phone");
const phone = ref("");
const code = ref("");
const busy = ref(false);
const error = ref<string | null>(null);
const valid = computed(() => validatePhone(phone.value) === null);
const shown = computed(() => `+237 ${formatPhone(phone.value)}`);

async function send() {
  if (!valid.value || busy.value) return;
  busy.value = true;
  error.value = null;
  try {
    await props.onSendCode(phone.value);
    code.value = "";
    step.value = "code";
  } catch {
    error.value = "Impossible d'envoyer le SMS. Réessaie.";
  } finally {
    busy.value = false;
  }
}

async function verify(value: string) {
  busy.value = true;
  error.value = null;
  try {
    if (await props.onVerify(phone.value, value)) {
      step.value = "done";
      emit("success", phone.value);
    } else {
      code.value = "";
      error.value = "Code incorrect. Réessaie.";
    }
  } catch {
    code.value = "";
    error.value = "Vérification impossible. Réessaie.";
  } finally {
    busy.value = false;
  }
}

function onPhone(value: string) {
  phone.value = value;
  error.value = null;
}
function onCode(value: string) {
  code.value = value;
  error.value = null;
}
function back() {
  step.value = "phone";
  error.value = null;
}
</script>

<template>
  <div class="w-full max-w-[400px] rounded-[20px] border border-kola-line bg-kola-surface p-6 text-kola-ink sm:p-7">
    <form v-if="step === 'phone'" class="flex flex-col gap-5" @submit.prevent="send">
      <div class="flex flex-col gap-1.5">
        <h2 class="text-2xl font-bold tracking-tight">{{ title }}</h2>
        <p class="text-kola-ink-subtle">Entre ton numéro : on t'envoie un code par SMS.</p>
      </div>
      <KolaPhoneField :model-value="phone" label="Numéro de téléphone" @update:model-value="onPhone" />
      <p v-if="error" role="alert" class="text-sm text-kola-danger">{{ error }}</p>
      <KolaButton type="submit" label="Recevoir le code" :loading="busy" :disabled="!valid" expanded />
    </form>

    <div v-else-if="step === 'code'" class="flex flex-col gap-5">
      <button
        type="button"
        :disabled="busy"
        class="flex items-center gap-1.5 self-start text-sm font-semibold text-kola-primary hover:underline disabled:opacity-60"
        @click="back"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="size-4">
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Modifier le numéro
      </button>
      <div class="flex flex-col gap-1.5">
        <h2 class="text-2xl font-bold tracking-tight">Vérifie ton numéro</h2>
        <p class="text-kola-ink-subtle">Code envoyé au <b class="font-semibold text-kola-ink">{{ shown }}</b>.</p>
      </div>
      <KolaOtpField
        :model-value="code"
        :length="codeLength"
        autofocus
        :error="error"
        :on-resend="() => onSendCode(phone)"
        @update:model-value="onCode"
        @complete="verify"
      />
      <p v-if="busy" role="status" class="flex items-center gap-2 text-sm text-kola-ink-subtle">
        <span aria-hidden="true" class="size-4 animate-spin rounded-full border-2 border-kola-primary border-t-transparent" />
        Vérification…
      </p>
    </div>

    <div v-else role="status" class="flex flex-col items-center gap-2 py-4 text-center">
      <span aria-hidden="true" class="mb-2 flex size-16 items-center justify-center rounded-full bg-kola-primary/12 text-kola-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="size-8">
          <path d="M5 12.5l4.5 4.5L19 7.5" />
        </svg>
      </span>
      <h2 class="text-2xl font-bold tracking-tight">Bienvenue !</h2>
      <p class="text-kola-ink-subtle">Tu es connecté avec le {{ shown }}.</p>
    </div>
  </div>
</template>
