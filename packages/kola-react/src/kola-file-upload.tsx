"use client";

import { useEffect, useId, useRef, useState, type DragEvent } from "react";

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

type Item = {
  id: number;
  file: File;
  status: "uploading" | "done" | "error";
  progress: number;
  error?: string;
  preview?: string;
};

export type KolaFileUploadProps = {
  label?: string;
  /** Texte dans la zone. Par défaut : formats et taille maximale. */
  hint?: string;
  /** Formats acceptés, comme l'attribut HTML accept. */
  accept?: string;
  /** Taille maximale d'un fichier, en octets. */
  maxSize?: number;
  multiple?: boolean;
  maxFiles?: number;
  /**
   * Envoie un fichier à ton serveur. Appelle progress avec une valeur de 0 à 1.
   * Lance une erreur pour afficher « Échec de l'envoi » sur ce fichier.
   */
  onUpload?: (file: File, progress: (value: number) => void) => Promise<void>;
  /** Reçoit les fichiers prêts (envoyés, ou choisis si pas d'onUpload). */
  onChange?: (files: File[]) => void;
  disabled?: boolean;
  className?: string;
};

/**
 * Zone de téléversement : photo, pièce d'identité, reçu…
 * Clic ou glisser-déposer, vérification du format et de la taille, aperçu, progression.
 *
 * <KolaFileUpload
 *   label="Pièce d'identité"
 *   accept="image/*,.pdf"
 *   onUpload={async (fichier, progression) => {
 *     // Envoie le fichier à ton serveur et appelle progression(0 → 1).
 *   }}
 * />
 */
export function KolaFileUpload({
  label = "Pièces jointes",
  hint,
  accept = "image/*,.pdf",
  maxSize = 5 * 1024 * 1024,
  multiple = true,
  maxFiles = 5,
  onUpload,
  onChange,
  disabled = false,
  className = "",
}: KolaFileUploadProps) {
  const id = useId();
  const [items, setItems] = useState<Item[]>([]);
  const [drag, setDrag] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const nextId = useRef(1);
  const limit = multiple ? maxFiles : 1;
  const kept = items.filter((i) => i.status !== "error").length;
  const full = kept >= limit;
  const off = disabled || full;

  // Prévient le parent quand la liste des fichiers prêts change.
  const ready = items.filter((i) => i.status === "done");
  const readyKey = ready.map((i) => i.id).join(",");
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    onChange?.(itemsRef.current.filter((i) => i.status === "done").map((i) => i.file));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [readyKey]);

  // Libère les aperçus d'images.
  useEffect(() => () => itemsRef.current.forEach((i) => i.preview && URL.revokeObjectURL(i.preview)), []);

  const patch = (itemId: number, change: Partial<Item>) =>
    setItems((list) => list.map((i) => (i.id === itemId ? { ...i, ...change } : i)));

  const add = (files: File[]) => {
    if (!files.length || disabled) return;
    let list = itemsRef.current;
    if (!multiple) {
      list.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
      list = [];
      files = files.slice(0, 1);
    }
    let room = limit - list.filter((i) => i.status !== "error").length;
    let skipped = 0;
    const added: Item[] = [];
    for (const file of files) {
      const error = checkFile(file, accept, maxSize);
      if (error) {
        added.push({ id: nextId.current++, file, status: "error", progress: 0, error });
        continue;
      }
      if (room <= 0) {
        skipped++;
        continue;
      }
      room--;
      added.push({
        id: nextId.current++,
        file,
        status: onUpload ? "uploading" : "done",
        progress: 0,
        preview: file.type.startsWith("image/") ? URL.createObjectURL(file) : undefined,
      });
    }
    setItems([...list, ...added]);
    setNotice(skipped ? `${maxFiles} fichiers maximum : les autres n'ont pas été ajoutés.` : null);
    for (const item of added) {
      if (item.status !== "uploading" || !onUpload) continue;
      onUpload(item.file, (p) => patch(item.id, { progress: Math.min(1, Math.max(0, p)) })).then(
        () => patch(item.id, { status: "done", progress: 1 }),
        () => patch(item.id, { status: "error", error: "Échec de l'envoi" }),
      );
    }
  };

  const remove = (item: Item) => {
    if (item.preview) URL.revokeObjectURL(item.preview);
    setItems((list) => list.filter((i) => i.id !== item.id));
    setNotice(null);
  };

  const onDrop = (e: DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (!off) add([...e.dataTransfer.files]);
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <span id={`${id}-label`} className="text-sm font-semibold text-kola-ink">
        {label}
      </span>
      <label
        onDragOver={(e) => {
          e.preventDefault();
          if (!off) setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={onDrop}
        className={`flex flex-col items-center gap-1 rounded-kola border border-dashed px-4 py-5 text-center transition focus-within:ring-2 focus-within:ring-kola-primary ${
          drag ? "border-kola-primary bg-kola-primary/10" : "border-kola-line-strong bg-kola-surface-muted"
        } ${off ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-kola-primary"}`}
      >
        <input
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={off}
          aria-labelledby={`${id}-label`}
          aria-describedby={`${id}-hint`}
          onChange={(e) => {
            add([...(e.target.files ?? [])]);
            e.target.value = "";
          }}
        />
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden className="mb-1 size-7 text-kola-primary">
          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3" />
        </svg>
        <span className="font-semibold text-kola-primary">
          {full ? `${limit} fichier${limit > 1 ? "s" : ""} maximum` : multiple ? "Choisir des fichiers" : "Choisir un fichier"}
        </span>
        <span id={`${id}-hint`} className="text-sm text-kola-ink-subtle">
          {!full && "ou glisse-les ici · "}
          {hint ?? describeAccept(accept, maxSize)}
        </span>
      </label>
      {notice && (
        <p role="alert" className="text-sm text-kola-danger">
          {notice}
        </p>
      )}
      {items.length > 0 && (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {items.map((item) => {
            const size = formatSize(item.file.size);
            const status =
              item.status === "uploading"
                ? `${size} · Envoi… ${Math.round(item.progress * 100)} %`
                : item.status === "done"
                  ? `${size} · Prêt`
                  : item.error;
            return (
              <li
                key={item.id}
                className={`flex items-center gap-3 rounded-kola border bg-kola-surface py-2.5 pr-1 pl-2.5 ${item.status === "error" ? "border-kola-danger" : "border-kola-line"}`}
              >
                <span className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-kola-primary/12 text-kola-primary [&_svg]:size-[22px]">
                  {item.preview ? (
                    <img src={item.preview} alt="" className="size-full object-cover" />
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                      <path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6" />
                    </svg>
                  )}
                </span>
                <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="truncate text-sm font-semibold text-kola-ink">{item.file.name}</span>
                  <span className={`text-xs ${item.status === "error" ? "text-kola-danger" : "text-kola-ink-subtle"}`}>{status}</span>
                  {item.status === "uploading" && (
                    <span
                      role="progressbar"
                      aria-label={`Envoi de ${item.file.name}`}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-valuenow={Math.round(item.progress * 100)}
                      className="mt-1 h-1 overflow-hidden rounded-full bg-kola-line"
                    >
                      <span className="block h-full rounded-full bg-kola-primary transition-[width]" style={{ width: `${item.progress * 100}%` }} />
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => remove(item)}
                  aria-label={`Retirer ${item.file.name}`}
                  title="Retirer"
                  className="flex size-9 shrink-0 items-center justify-center rounded-lg text-kola-ink-subtle hover:text-kola-ink [&_svg]:size-5"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
