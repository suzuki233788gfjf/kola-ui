/*
 * Kola UI — Sélecteur avec recherche, à partir d'un <select> normal (il reste dans ton formulaire).
 * La recherche ignore les accents : « yaounde » trouve Yaoundé.
 *
 * <div class="kola-field">
 *   <label class="kola-field__label" for="ville">Ville</label>
 *   <select id="ville" name="ville" data-kola-select>
 *     <option value="">Choisir…</option>
 *     <option value="dla" data-subtitle="Littoral">Douala</option>
 *     <option value="yde" data-subtitle="Centre">Yaoundé</option>
 *   </select>
 * </div>
 *
 * Le <select> reçoit l'événement « change » normal quand on choisit.
 */
(function () {
  const normalize = (t) => String(t).normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/œ/g, "oe").replace(/æ/g, "ae").toLowerCase().trim();
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const CHEVRON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg>';
  const CHECK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';

  function enhance(select) {
    if (select.dataset.kolaReady) return;
    select.dataset.kolaReady = "1";
    const field = select.closest(".kola-field") || select.parentElement;
    const labelEl = field.querySelector("label");
    const label = labelEl ? labelEl.textContent.trim() : "Choisir";
    const placeholderOpt = Array.from(select.options).find((o) => o.value === "");
    const placeholder = placeholderOpt ? placeholderOpt.textContent : "Choisir…";
    const searchPh = select.dataset.searchPlaceholder || "Rechercher…";
    const emptyText = select.dataset.emptyText || "Aucun résultat";
    const options = () => Array.from(select.options).filter((o) => o.value !== "");

    select.classList.add("kola-select__native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    const trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "kola-select__trigger";
    trigger.setAttribute("aria-haspopup", "dialog");
    if (labelEl) { if (!labelEl.id) labelEl.id = (select.id || "kola-select") + "-label"; labelEl.htmlFor = ""; }
    const dialog = document.createElement("dialog");
    dialog.className = "kola-dialog";
    dialog.setAttribute("aria-label", label);
    select.after(trigger, dialog);
    if (labelEl) labelEl.addEventListener("click", () => trigger.focus());

    const syncTrigger = () => {
      const o = select.selectedOptions[0];
      const has = o && o.value !== "";
      trigger.classList.toggle("has-value", has);
      trigger.innerHTML = `<span>${esc(has ? o.textContent : placeholder)}</span>${CHEVRON}`;
      trigger.setAttribute("aria-label", `${label} : ${has ? o.textContent : placeholder}`);
    };

    function renderList(q) {
      const n = normalize(q);
      const found = options().filter((o) => !n || normalize(o.textContent).includes(n) || normalize(o.dataset.subtitle || "").includes(n));
      const list = dialog.querySelector(".kola-select__list");
      list.innerHTML = found.length
        ? found
            .map((o) => {
              const sel = o.value === select.value;
              return `<li role="option" aria-selected="${sel}"><button type="button" class="kola-select__opt" aria-selected="${sel}" data-value="${esc(o.value)}"><span><span class="kola-select__label">${esc(o.textContent)}</span>${o.dataset.subtitle ? `<span class="kola-select__sub">${esc(o.dataset.subtitle)}</span>` : ""}</span>${sel ? CHECK : ""}</button></li>`;
            })
            .join("")
        : `<li class="kola-select__empty">${esc(emptyText)}</li>`;
      return found;
    }
    const choose = (value) => {
      select.value = value;
      select.dispatchEvent(new Event("change", { bubbles: true }));
      syncTrigger();
      dialog.close();
      trigger.focus();
    };

    trigger.addEventListener("click", () => {
      dialog.innerHTML = `<div class="kola-select__panel"><div class="kola-select__head"><p class="kola-select__title">${esc(label)}</p><input type="search" class="kola-select__search" placeholder="${esc(searchPh)}" aria-label="${esc(searchPh)}"></div><ul class="kola-select__list" role="listbox" aria-label="${esc(label)}"></ul></div>`;
      const input = dialog.querySelector("input");
      let found = renderList("");
      input.addEventListener("input", () => { found = renderList(input.value); });
      input.addEventListener("keydown", (e) => { if (e.key === "Enter" && found.length) { e.preventDefault(); choose(found[0].value); } });
      dialog.querySelector(".kola-select__list").addEventListener("click", (e) => {
        const b = e.target.closest("[data-value]");
        if (b) choose(b.dataset.value);
      });
      dialog.showModal();
      input.focus();
    });
    dialog.addEventListener("click", (e) => e.target === dialog && dialog.close());
    select.addEventListener("change", syncTrigger);
    syncTrigger();
  }

  function init(root) { root.querySelectorAll("select[data-kola-select]").forEach(enhance); }
  window.KolaSelect = { init, normalize };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
