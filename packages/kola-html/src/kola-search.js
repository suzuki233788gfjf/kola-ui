/*
 * Kola UI — Recherche avec suggestions (« yaounde » trouve Yaoundé).
 * Sans JavaScript, le <datalist> du navigateur prend le relais.
 *
 * <div class="kola-field kola-search" data-kola-search>
 *   <label class="kola-field__label" for="ville">Ville</label>
 *   <div class="kola-field__box">
 *     <input class="kola-field__input" id="ville" type="search" list="villes" placeholder="Rechercher une ville">
 *   </div>
 *   <datalist id="villes">
 *     <option value="Douala">Littoral</option>     ← le texte devient le sous-titre
 *     <option value="Yaoundé">Centre</option>
 *   </datalist>
 * </div>
 *
 * Événements sur le bloc :
 *   « kola-select » event.detail = { label, subtitle }  (suggestion choisie)
 *   « kola-search » event.detail = { query }            (Entrée sans suggestion)
 */
(function () {
  const SEARCH_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>';
  const CLEAR_SVG =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>';

  /** Minuscules et sans accents, lettre par lettre (même longueur que le texte). */
  function fold(text) {
    let out = "";
    for (const ch of String(text)) {
      const lower = ch.toLowerCase();
      const plain = lower.normalize("NFD").replace(/[̀-ͯ]/g, "");
      out += plain.length === 1 ? plain : lower.length === 1 ? lower : ch;
    }
    return out;
  }
  /** Début du libellé, puis début d'un mot, puis n'importe où, puis le sous-titre. */
  function filter(options, query, max) {
    const q = fold(String(query).trim());
    if (!q) return [];
    const scored = [];
    options.forEach((o, i) => {
      const label = fold(o.label);
      let score;
      if (label.startsWith(q)) score = 0;
      else if (label.includes(" " + q) || label.includes("-" + q) || label.includes("'" + q)) score = 1;
      else if (label.includes(q)) score = 2;
      else if (o.subtitle && fold(o.subtitle).includes(q)) score = 3;
      else return;
      scored.push([score, i, o]);
    });
    return scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]).slice(0, max || 6).map((s) => s[2]);
  }
  const esc = (t) => String(t).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  let uid = 0;
  function enhance(field) {
    if (field.dataset.kolaReady) return;
    field.dataset.kolaReady = "1";
    const input = field.querySelector("input");
    const box = input.closest(".kola-field__box") || input.parentElement;
    const datalist = input.list || field.querySelector("datalist");
    const options = datalist
      ? [...datalist.options].map((o) => ({ label: o.value, subtitle: o.textContent.trim() && o.textContent.trim() !== o.value ? o.textContent.trim() : "" }))
      : [];
    const max = Number(field.dataset.max) || 6;
    const base = "kola-search-" + ++uid;

    input.removeAttribute("list");
    input.type = "search";
    input.autocomplete = "off";
    input.setAttribute("enterkeyhint", "search");
    input.setAttribute("role", "combobox");
    input.setAttribute("aria-autocomplete", "list");
    input.setAttribute("aria-expanded", "false");
    input.setAttribute("aria-controls", base + "-list");
    if (!box.querySelector("svg")) box.insertAdjacentHTML("afterbegin", SEARCH_SVG);
    box.setAttribute("role", "search");

    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "kola-icon-btn kola-search__clear";
    clear.setAttribute("aria-label", "Effacer");
    clear.title = "Effacer";
    clear.innerHTML = CLEAR_SVG;
    box.appendChild(clear);

    const list = document.createElement("ul");
    list.id = base + "-list";
    list.className = "kola-search__list";
    list.setAttribute("role", "listbox");
    list.setAttribute("aria-label", (field.querySelector("label") || {}).textContent || "Suggestions");
    list.hidden = true;
    field.appendChild(list);

    let results = [];
    let active = -1;
    let open = false;

    const render = () => {
      const query = input.value;
      clear.hidden = !query;
      // Sans <datalist>, c'est un simple champ de recherche : pas de liste.
      const shown = open && options.length > 0 && query.trim() !== "";
      list.hidden = !shown;
      input.setAttribute("aria-expanded", shown ? "true" : "false");
      if (shown && active >= 0) input.setAttribute("aria-activedescendant", base + "-opt-" + active);
      else input.removeAttribute("aria-activedescendant");
      if (!shown) return;
      if (!results.length) {
        list.innerHTML = '<li class="kola-search__empty">Aucun résultat pour « ' + esc(query.trim()) + " »</li>";
        return;
      }
      const q = fold(query.trim());
      list.innerHTML = results
        .map((o, i) => {
          const start = fold(o.label).indexOf(q);
          const label = start < 0 ? esc(o.label) : esc(o.label.slice(0, start)) + "<b>" + esc(o.label.slice(start, start + q.length)) + "</b>" + esc(o.label.slice(start + q.length));
          return (
            '<li class="kola-search__option" role="option" id="' + base + "-opt-" + i + '" data-index="' + i + '" aria-selected="' + (i === active) + '">' +
            '<span class="kola-search__label">' + label + "</span>" +
            (o.subtitle ? '<span class="kola-search__subtitle">' + esc(o.subtitle) + "</span>" : "") +
            "</li>"
          );
        })
        .join("");
    };
    // Change seulement la suggestion surlignée, sans reconstruire la liste (le clic reste valable).
    const highlight = () => {
      list.querySelectorAll("[data-index]").forEach((li) => li.setAttribute("aria-selected", String(Number(li.dataset.index) === active)));
      if (!list.hidden && active >= 0) {
        input.setAttribute("aria-activedescendant", base + "-opt-" + active);
        const li = list.querySelector('[data-index="' + active + '"]');
        if (li) li.scrollIntoView({ block: "nearest" });
      } else input.removeAttribute("aria-activedescendant");
    };
    const update = () => {
      results = filter(options, input.value, max);
      active = -1;
      render();
    };
    const choose = (o) => {
      input.value = o.label;
      open = false;
      active = -1;
      render();
      field.dispatchEvent(new CustomEvent("kola-select", { bubbles: true, detail: { label: o.label, subtitle: o.subtitle } }));
    };

    input.addEventListener("input", () => { open = true; update(); });
    input.addEventListener("focus", () => { open = true; update(); });
    input.addEventListener("blur", () => { open = false; render(); });
    input.addEventListener("keydown", (e) => {
      const n = results.length;
      if (e.key === "ArrowDown") {
        e.preventDefault();
        open = true;
        if (n) active = (active + 1) % n;
        if (list.hidden) render();
        else highlight();
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        if (n) active = active <= 0 ? n - 1 : active - 1;
        highlight();
      } else if (e.key === "Enter") {
        if (!list.hidden && active >= 0 && results[active]) {
          e.preventDefault();
          choose(results[active]);
        } else {
          open = false;
          render();
          field.dispatchEvent(new CustomEvent("kola-search", { bubbles: true, detail: { query: input.value } }));
        }
      } else if (e.key === "Escape" && !list.hidden) {
        e.preventDefault();
        open = false;
        render();
      }
    });
    list.addEventListener("mousedown", (e) => e.preventDefault());
    list.addEventListener("click", (e) => {
      const li = e.target.closest("[data-index]");
      if (li) choose(results[Number(li.dataset.index)]);
    });
    list.addEventListener("mousemove", (e) => {
      const li = e.target.closest("[data-index]");
      if (li && Number(li.dataset.index) !== active) { active = Number(li.dataset.index); highlight(); }
    });
    clear.addEventListener("click", () => {
      input.value = "";
      input.focus();
      update();
      input.dispatchEvent(new Event("input", { bubbles: true }));
    });
    render();
  }

  function init(root) { root.querySelectorAll("[data-kola-search]").forEach(enhance); }
  window.KolaSearch = { fold, filter, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
