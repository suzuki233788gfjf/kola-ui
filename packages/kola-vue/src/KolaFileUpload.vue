<script lang="ts">
/** 850 → "850 o", 48 000 → "47 Ko", 1 258 291 → "1,2 Mo" */
export function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} Ko`;
  const mo = bytes / (1024 * 1024);
  const text = mo >= 10 ? String(Math.round(mo)) : mo.toFixed(1).replace(".", ",");
  return `${text.replace(/,0$/, "")} Mo`;
}

/** Le fichier correspond-il à accept ? ("image/*,.pdf", "application/pdf"…) */
export function acceptsFile(file: { name: string; type: string }, accept: string): boolean {
  const tokens = accept.split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
  if (!tokens.length) return true;
  const name = file.name.toLowerCase();
  const type = (file.type || "").toLowerCase();
  return tokens.some((t) =>
    t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t,
  );
}

/** Message d'erreur pour ce fichier, ou null s'il est accepté. */
export function checkFile(file: { name: string; type: string; size: number }, accept: string, maxSize: number): string | null {
  if (!acceptsFile(file, accept)) return "Format non accepté";
  if (file.size > maxSize) return `Fichier trop lourd (max ${formatSize(maxSize)})`;
  return null;
}

/** "image/*,.pdf" + 5 Mo → "JPG, PNG ou PDF · 5 Mo max" */
export function describeAccept(accept: string, maxSize: number): string {
  const names: string[] = [];
  for (const t of accept.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean)) {
    if (t === "image/*") names.push("JPG", "PNG");
    else if (t === "application/pdf" || t === ".pdf") names.push("PDF");
    else if (t.startsWith(".")) names.push(t.slice(1).toUpperCase());
    else if (t.endsWith("/*")) names.push(t.slice(0, -2));
  }
  const unique = [...new Set(names)];
  const formats = unique.length > 1 ? `${unique.slice(0, -1).join(", ")} ou ${unique.at(-1)} · ` : unique.length ? `${unique[0]} · ` : "";
  return `${formats}${formatSize(maxSize)} max`;
}
</script>

<script setup lang="ts">
/**
 * Zone de téléversement : photo, pièce d'identité, reçu…
 * Clic ou glisser-déposer, vérification du format et de la taille, aperçu, progression.
 *
 * <KolaFileUpload
 *   label="Pièce d'identité"
 *   accept="image/*,.pdf"
 *   :on-upload="envoyer"
 *   @change="(fichiers) => console.log(fichiers)"
 * />
 * async function envoyer(fichier: File, progression: (v: number) => void) {
 *   // Envoie le fichier à ton serveur et appelle progression(0 → 1).
 * }
 */
import { computed, onBeforeUnmount, ref, useId, watch } from "vue";

type Item = { id: number; file: File; status: "uploading" | "done" | "error"; progress: number; error?: string; preview?: string };

const props = withDefaults(
  defineProps<{
    label?: string;
    /** Texte dans la zone. Par défaut : formats et taille maximale. */
    hint?: string;
    /** Formats acceptés, comme l'attribut HTML accept. */
    accept?: string;
    /** Taille maximale d'un fichier, en octets. */
    maxSize?: number;
    multiple?: boolean;
    maxFiles?: number;
    /** Envoie un fichier. Appelle progress avec une valeur de 0 à 1 ; lance une erreur en cas d'échec. */
    onUpload?: (file: File, progress: (value: number) => void) => Promise<void>;
    disabled?: boolean;
  }>(),
  { label: "Pièces jointes", accept: "image/*,.pdf", maxSize: 5 * 1024 * 1024, multiple: true, maxFiles: 5, disabled: false },
);
const emit = defineEmits<{ change: [files: File[]] }>();

const id = useId();
const items = ref<Item[]>([]);
const drag = ref(false);
const notice = ref<string | null>(null);
let nextId = 1;
const limit = computed(() => (props.multiple ? props.maxFiles : 1));
const full = computed(() => items.value.filter((i) => i.status !== "error").length >= limit.value);
const off = computed(() => props.disabled || full.value);
const hintText = computed(() => props.hint ?? describeAccept(props.accept, props.maxSize));

watch(
  () => items.value.filter((i) => i.status === "done").map((i) => i.id).join(","),
  () => emit("change", items.value.filter((i) => i.status === "done").map((i) => i.file)),
);
onBeforeUnmount(() => items.value.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)));

function patch(itemId: number, change: Partial<Item>) {
  const item = items.value.find((i) => i.id === itemId);
  if (item) Object.assign(item, change);
}

function add(files: File[]) {
  if (!files.length || props.disabled) return;
  if (!props.multiple) {
    items.value.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
    items.value = [];
    files = files.slice(0, 1);
  }
  let room = limit.value - items.value.filter((i) => i.status !== "error").length;
  let skipped = 0;
  const added: Item[] = [];
  for (const file of files) {
    const error = checkFile(file, props.accept, props.maxSize);
    if (error) {
      added.push({ id: nextId++, file, status: "error", progress: 0, error });
      continue;
    }
    if (room <= 0) {
      skipped++;
      continue;
    }
    room--;
    added.push({
      id: nextId++,
      file,
      status: props.onUpload ? "uploading" : "done",
      progress: 0,
      preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
    });
  }
  items.value.push(...added);
  notice.value = skipped ? `${props.maxFiles} fichiers maximum : les autres n'ont pas été ajoutés.` : null;
  for (const item of added) {
    if (item.status !== "uploading" || !props.onUpload) continue;
    props.onUpload(item.file, (p) => patch(item.id, { progress: Math.min(1, Math.max(0, p)) })).then(
      () => patch(item.id, { status: "done", progress: 1 }),
      () => patch(item.id, { status: "error", error: "Échec de l'envoi" }),
    );
  }
}

function remove(item: Item) {
  if (item.preview) URL.revokeObjectURL(item.preview);
  items.value = items.value.filter((i) => i.id !== item.id);
  notice.value = null;
}

function onChange(e: Event) {
  const input = e.target as HTMLInputElement;
  add([...(input.files ?? [])]);
  input.value = "";
}

function onDrop(e: DragEvent) {
  drag.value = false;
  if (!off.value) add([...(e.dataTransfer?.files ?? [])]);
}

function status(item: Item): string {
  const size = formatSize(item.file.size);
  if (item.status === "uploading") return `${size} · Envoi… ${Math.round(item.progress * 100)} %`;
  if (item.status === "done") return `${size} · Prêt`;
  return item.error ?? "Erreur";
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <span :id="`${id}-label`" class="text-sm font-semibold text-kola-ink">{{ label }}</span>
    <label
      :class="[
        'flex flex-col items-center gap-1 rounded-kola border border-dashed px-4 py-5 text-center transition focus-within:ring-2 focus-within:ring-kola-primary',
        drag ? 'border-kola-primary bg-kola-primary/10' : 'border-kola-line-strong bg-kola-surface-muted',
        off ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:border-kola-primary',
      ]"
      @dragover.prevent="drag = !off"
      @dragleave="drag = false"
      @drop.prevent="onDrop"
    >
      <input
        type="file"
        class="sr-only"
        :accept="accept"
        :multiple="multiple"
        :disabled="off"
        :aria-labelledby="`${id}-label`"
        :aria-describedby="`${id}-hint`"
        @change="onChange"
      />
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="mb-1 size-7 text-kola-primary">
        <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
      </svg>
      <span class="font-semibold text-kola-primary">
        {{ full ? `${limit} fichier${limit > 1 ? "s" : ""} maximum` : multiple ? "Choisir des fichiers" : "Choisir un fichier" }}
      </span>
      <span :id="`${id}-hint`" class="text-sm text-kola-ink-subtle">{{ full ? "" : "ou glisse-les ici · " }}{{ hintText }}</span>
    </label>
    <p v-if="notice" role="alert" class="text-sm text-kola-danger">{{ notice }}</p>
    <ul v-if="items.length" class="flex flex-col gap-2" aria-live="polite">
      <li
        v-for="item in items"
        :key="item.id"
        :class="[
          'flex items-center gap-3 rounded-kola border bg-kola-surface py-2.5 pr-1 pl-2.5',
          item.status === 'error' ? 'border-kola-danger' : 'border-kola-line',
        ]"
      >
        <span class="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-kola-primary/12 text-kola-primary [&_svg]:size-[22px]">
          <img v-if="item.preview" :src="item.preview" alt="" class="size-full object-cover" />
          <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6" />
          </svg>
        </span>
        <span class="flex min-w-0 flex-1 flex-col gap-0.5">
          <span class="truncate text-sm font-semibold text-kola-ink">{{ item.file.name }}</span>
          <span :class="['text-xs', item.status === 'error' ? 'text-kola-danger' : 'text-kola-ink-subtle']">{{ status(item) }}</span>
          <span
            v-if="item.status === 'uploading'"
            role="progressbar"
            :aria-label="`Envoi de ${item.file.name}`"
            aria-valuemin="0"
            aria-valuemax="100"
            :aria-valuenow="Math.round(item.progress * 100)"
            class="mt-1 h-1 overflow-hidden rounded-full bg-kola-line"
          >
            <span class="block h-full rounded-full bg-kola-primary transition-[width]" :style="{ width: `${item.progress * 100}%` }" />
          </span>
        </span>
        <button
          type="button"
          :aria-label="`Retirer ${item.file.name}`"
          title="Retirer"
          class="flex size-9 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink [&_svg]:size-5"
          @click="remove(item)"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      </li>
    </ul>
  </div>
</template>
