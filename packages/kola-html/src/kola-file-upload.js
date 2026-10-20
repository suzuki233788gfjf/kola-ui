/*
 * Kola UI — Téléversement : clic ou glisser-déposer, vérification du format et de la taille,
 * aperçu des images, barre de progression, suppression.
 *
 * <div class="kola-field kola-upload" data-kola-upload data-max-size="5" data-max-files="5">
 *   <span class="kola-field__label" id="pj">Pièces jointes</span>
 *   <label class="kola-upload__zone">
 *     <input class="kola-upload__input" type="file" name="pieces[]" accept="image/*,.pdf" multiple aria-labelledby="pj">
 *   </label>
 * </div>
 *
 * data-max-size : taille maximale d'un fichier, en Mo.  data-max-files : nombre de fichiers.
 * Dans un <form>, le champ envoie seulement les fichiers acceptés.
 *
 * Envoi à ton serveur avec progression :
 *   KolaUpload.onUpload(bloc, async (fichier, progression) => { … progression(0.5) … });
 * Événement « kola-change » : event.detail = { files }  (fichiers prêts)
 */
(function () {
  const UPLOAD_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 16V4M7 9l5-5 5 5M4 16v3a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-3"/></svg>';
  const FILE_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 3H6a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V8zM14 3v5h5M9 13h6M9 17h6"/></svg>';
  const CLEAR_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /** 850 → "850 o", 48 000 → "47 Ko", 1 258 291 → "1,2 Mo" */
  function formatSize(bytes) {
    if (bytes < 1024) return bytes + " o";
    if (bytes < 1024 * 1024) return Math.round(bytes / 1024) + " Ko";
    const mo = bytes / (1024 * 1024);
    const text = mo >= 10 ? String(Math.round(mo)) : mo.toFixed(1).replace(".", ",");
    return text.replace(/,0$/, "") + " Mo";
  }
  function accepts(file, accept) {
    const tokens = String(accept || "").split(",").map((t) => t.trim().toLowerCase()).filter(Boolean);
    if (!tokens.length) return true;
    const name = file.name.toLowerCase();
    const type = (file.type || "").toLowerCase();
    return tokens.some((t) => (t.startsWith(".") ? name.endsWith(t) : t.endsWith("/*") ? type.startsWith(t.slice(0, -1)) : type === t));
  }
  function check(file, accept, maxSize) {
    if (!accepts(file, accept)) return "Format non accepté";
    if (file.size > maxSize) return "Fichier trop lourd (max " + formatSize(maxSize) + ")";
    return null;
  }
  function describe(accept, maxSize) {
    const names = [];
    String(accept || "").split(",").map((x) => x.trim().toLowerCase()).filter(Boolean).forEach((t) => {
      if (t === "image/*") names.push("JPG", "PNG");
      else if (t === "application/pdf" || t === ".pdf") names.push("PDF");
      else if (t.startsWith(".")) names.push(t.slice(1).toUpperCase());
      else if (t.endsWith("/*")) names.push(t.slice(0, -2));
    });
    const u = [...new Set(names)];
    const formats = u.length > 1 ? u.slice(0, -1).join(", ") + " ou " + u[u.length - 1] + " · " : u.length ? u[0] + " · " : "";
    return formats + formatSize(maxSize) + " max";
  }
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

  function enhance(field) {
    if (field.dataset.kolaReady) return;
    field.dataset.kolaReady = "1";
    const input = field.querySelector('input[type="file"]');
    const zone = input.closest(".kola-upload__zone");
    const multiple = input.multiple;
    const maxSize = (Number(field.dataset.maxSize) || 5) * 1024 * 1024;
    const maxFiles = multiple ? Number(field.dataset.maxFiles) || 5 : 1;
    const accept = input.accept;
    const hint = field.dataset.hint || describe(accept, maxSize);

    zone.insertAdjacentHTML(
      "beforeend",
      UPLOAD_SVG + '<span class="kola-upload__title"></span><span class="kola-upload__hint"></span>',
    );
    const title = zone.querySelector(".kola-upload__title");
    const hintEl = zone.querySelector(".kola-upload__hint");
    hintEl.id = (input.id || "kola-upload-" + Math.random().toString(36).slice(2, 8)) + "-aide";
    input.setAttribute("aria-describedby", hintEl.id);
    const notice = document.createElement("p");
    notice.className = "kola-upload__notice";
    notice.setAttribute("role", "alert");
    notice.hidden = true;
    const list = document.createElement("ul");
    list.className = "kola-upload__list";
    list.setAttribute("aria-live", "polite");
    zone.after(notice, list);

    let items = [];
    let nextId = 1;
    const kept = () => items.filter((i) => i.status !== "error").length;

    const syncInput = () => {
      // Le champ ne garde que les fichiers acceptés (utile dans un <form>).
      try {
        const dt = new DataTransfer();
        items.filter((i) => i.status !== "error").forEach((i) => dt.items.add(i.file));
        input.files = dt.files;
      } catch (e) { /* navigateur trop ancien : on garde la sélection telle quelle */ }
    };
    const emit = () =>
      field.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { files: items.filter((i) => i.status === "done").map((i) => i.file) } }));

    const render = () => {
      const full = kept() >= maxFiles;
      const off = full || field.hasAttribute("data-disabled");
      input.disabled = off;
      zone.classList.toggle("is-disabled", off);
      title.textContent = full ? maxFiles + " fichier" + (maxFiles > 1 ? "s" : "") + " maximum" : multiple ? "Choisir des fichiers" : "Choisir un fichier";
      hintEl.textContent = (full ? "" : "ou glisse-les ici · ") + hint;
      list.innerHTML = items
        .map((i) => {
          const size = formatSize(i.file.size);
          const pct = Math.round(i.progress * 100);
          const status = i.status === "uploading" ? size + " · Envoi… " + pct + " %" : i.status === "done" ? size + " · Prêt" : i.error;
          return (
            '<li class="kola-upload__item' + (i.status === "error" ? " is-error" : "") + '">' +
            '<span class="kola-upload__thumb">' + (i.preview ? '<img src="' + i.preview + '" alt="">' : FILE_SVG) + "</span>" +
            '<span class="kola-upload__info"><span class="kola-upload__name">' + esc(i.file.name) + "</span>" +
            '<span class="kola-upload__status">' + esc(status) + "</span>" +
            (i.status === "uploading"
              ? '<span class="kola-upload__bar" role="progressbar" aria-label="Envoi de ' + esc(i.file.name) + '" aria-valuemin="0" aria-valuemax="100" aria-valuenow="' + pct + '"><span style="width:' + pct + '%"></span></span>'
              : "") +
            "</span>" +
            '<button type="button" class="kola-icon-btn kola-upload__remove" data-remove="' + i.id + '" aria-label="Retirer ' + esc(i.file.name) + '" title="Retirer">' + CLEAR_SVG + "</button>" +
            "</li>"
          );
        })
        .join("");
    };

    const upload = (item) => {
      field._kolaUpload(item.file, (p) => {
        item.progress = Math.min(1, Math.max(0, p));
        render();
      }).then(
        () => { item.status = "done"; item.progress = 1; render(); emit(); },
        () => { item.status = "error"; item.error = "Échec de l'envoi"; syncInput(); render(); emit(); },
      );
    };

    const add = (files) => {
      if (!files.length) return;
      if (!multiple) {
        items.forEach((i) => i.preview && URL.revokeObjectURL(i.preview));
        items = [];
        files = files.slice(0, 1);
      }
      let room = maxFiles - kept();
      let skipped = 0;
      const added = [];
      files.forEach((file) => {
        const error = check(file, accept, maxSize);
        if (error) return added.push({ id: nextId++, file, status: "error", progress: 0, error });
        if (room <= 0) return skipped++;
        room--;
        added.push({
          id: nextId++,
          file,
          status: field._kolaUpload ? "uploading" : "done",
          progress: 0,
          preview: (file.type || "").startsWith("image/") ? URL.createObjectURL(file) : "",
        });
      });
      items = items.concat(added);
      notice.hidden = !skipped;
      notice.textContent = skipped ? maxFiles + " fichiers maximum : les autres n'ont pas été ajoutés." : "";
      syncInput();
      render();
      emit();
      added.filter((i) => i.status === "uploading").forEach(upload);
    };

    input.addEventListener("change", () => add([...input.files].filter((f) => !items.some((i) => i.file === f))));
    zone.addEventListener("dragover", (e) => {
      e.preventDefault();
      if (!input.disabled) zone.classList.add("is-dragging");
    });
    zone.addEventListener("dragleave", () => zone.classList.remove("is-dragging"));
    zone.addEventListener("drop", (e) => {
      e.preventDefault();
      zone.classList.remove("is-dragging");
      if (!input.disabled) add([...e.dataTransfer.files]);
    });
    list.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-remove]");
      if (!btn) return;
      const item = items.find((i) => i.id === Number(btn.dataset.remove));
      if (item && item.preview) URL.revokeObjectURL(item.preview);
      items = items.filter((i) => i !== item);
      notice.hidden = true;
      syncInput();
      render();
      emit();
    });
    render();
  }

  function onUpload(field, fn) { field._kolaUpload = fn; }
  function init(root) { root.querySelectorAll("[data-kola-upload]").forEach(enhance); }
  window.KolaUpload = { formatSize, check, describe, onUpload, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
