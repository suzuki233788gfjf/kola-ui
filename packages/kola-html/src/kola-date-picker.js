/*
 * Kola UI — Date picker en français (semaine du lundi), une date ou une période.
 *
 * <div data-kola-date data-label="Période" data-range data-name="periode"></div>
 *
 * - data-range : choisir une période (sinon, une seule date)
 * - data-name  : crée un champ caché pour ton formulaire ("2026-10-12" ou "2026-10-12/2026-10-16")
 * Événement « kola-change » : event.detail = { start, end } (des objets Date)
 *
 * Ou en JavaScript : KolaDatePicker(element, { label, range, onChange })
 */
(function () {
  const Fr = {
    months: ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
    monthsShort: ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."],
    weekdays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi", "dimanche"],
    /** → "12 oct. 2026" */
    date(d) { return `${d.getDate()} ${this.monthsShort[d.getMonth()]} ${d.getFullYear()}`; },
    /** → "Du 12 au 16 oct. 2026" */
    range(a, b) {
      if (same(a, b)) return this.date(a);
      if (a.getFullYear() !== b.getFullYear()) return `Du ${this.date(a)} au ${this.date(b)}`;
      if (a.getMonth() !== b.getMonth()) return `Du ${a.getDate()} ${this.monthsShort[a.getMonth()]} au ${this.date(b)}`;
      return `Du ${a.getDate()} au ${this.date(b)}`;
    },
  };
  const day0 = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const same = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
  const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const CAL_ICON = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
  const ARROW = (d) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${d}"/></svg>`;

  /** Calendrier seul, dans n'importe quel élément. */
  function KolaCalendar(el, { range = false, start = null, end = null, onConfirm, onCancel } = {}) {
    let s = start && day0(start), e = end && day0(end);
    let month = new Date((s || new Date()).getFullYear(), (s || new Date()).getMonth(), 1);
    const today = day0(new Date());
    function render() {
      const offset = (month.getDay() + 6) % 7;
      const days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
      const summary = !s ? (range ? "Choisis le début" : "Choisis une date") : range && !e ? `${Fr.date(s)} → choisis la fin` : range ? Fr.range(s, e) : Fr.date(s);
      let cells = "";
      for (let i = 0; i < offset; i++) cells += "<span></span>";
      for (let n = 1; n <= days; n++) {
        const d = new Date(month.getFullYear(), month.getMonth(), n);
        const isS = s && same(d, s), isE = e && same(d, e);
        const cls = ["kola-cal__cell", s && e && d > s && d < e ? "in-range" : "", isS && e && !isE ? "range-start" : "", isE && s && !isS ? "range-end" : ""].join(" ");
        cells += `<span class="${cls}"><button type="button" class="kola-cal__day${same(d, today) ? " is-today" : ""}" data-day="${n}" aria-pressed="${!!(isS || isE)}" aria-label="${n} ${Fr.months[d.getMonth()]} ${d.getFullYear()}">${n}</button></span>`;
      }
      el.innerHTML = `<div class="kola-cal">
  <div><p class="kola-cal__caption">${range ? "Période sélectionnée" : "Date sélectionnée"}</p><p class="kola-cal__summary" aria-live="polite">${summary}</p></div>
  <div class="kola-cal__nav">
    <button type="button" class="kola-icon-btn" data-nav="-1" aria-label="Mois précédent" title="Mois précédent">${ARROW("M15 6l-6 6 6 6")}</button>
    <span class="kola-cal__month">${Fr.months[month.getMonth()]} ${month.getFullYear()}</span>
    <button type="button" class="kola-icon-btn" data-nav="1" aria-label="Mois suivant" title="Mois suivant">${ARROW("M9 6l6 6-6 6")}</button>
  </div>
  <div class="kola-cal__grid">${Fr.weekdays.map((w) => `<span class="kola-cal__wd" aria-label="${w}">${w[0].toUpperCase()}</span>`).join("")}${cells}</div>
  <div class="kola-cal__actions">
    ${onCancel ? '<button type="button" class="kola-btn kola-btn--text" data-cancel>Annuler</button>' : ""}
    <button type="button" class="kola-btn kola-btn--primary" data-ok ${(range ? s && e : s) ? "" : "disabled"}>Valider</button>
  </div>
</div>`;
    }
    el.addEventListener("click", (ev) => {
      const t = ev.target.closest("button");
      if (!t || !el.contains(t)) return;
      if (t.dataset.nav) { month = new Date(month.getFullYear(), month.getMonth() + Number(t.dataset.nav), 1); render(); }
      else if (t.dataset.day) {
        const d = new Date(month.getFullYear(), month.getMonth(), Number(t.dataset.day));
        if (!range || !s || e) { s = d; e = null; } else if (d < s) s = d; else e = d;
        render();
      } else if ("cancel" in t.dataset) onCancel && onCancel();
      else if ("ok" in t.dataset && s) onConfirm && onConfirm({ start: s, end: range ? e : s });
    });
    render();
  }

  /** Champ date : un clic ouvre le calendrier dans une fenêtre. */
  function KolaDatePicker(el, { label = "Date", range = false, name, placeholder, onChange } = {}) {
    const id = "kola-date-" + Math.random().toString(36).slice(2, 7);
    let value = null;
    el.classList.add("kola-field");
    el.innerHTML = `<span class="kola-field__label" id="${id}">${label}</span>
<button type="button" class="kola-date__trigger" aria-haspopup="dialog" aria-labelledby="${id} ${id}-v">${CAL_ICON}<span id="${id}-v">${placeholder || (range ? "Choisir une période" : "Choisir une date")}</span></button>
${name ? `<input type="hidden" name="${name}">` : ""}
<dialog class="kola-dialog" aria-label="${label}" style="max-width:380px"></dialog>`;
    const trigger = el.querySelector(".kola-date__trigger"), dialog = el.querySelector("dialog"), hidden = el.querySelector('input[type="hidden"]');
    trigger.addEventListener("click", () => {
      KolaCalendar(dialog, {
        range, start: value && value.start, end: value && value.end,
        onCancel: () => dialog.close(),
        onConfirm: (v) => {
          value = v;
          trigger.classList.add("has-value");
          trigger.querySelector("span").textContent = range ? Fr.range(v.start, v.end) : Fr.date(v.start);
          if (hidden) hidden.value = range ? `${iso(v.start)}/${iso(v.end)}` : iso(v.start);
          dialog.close();
          onChange && onChange(v);
          el.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: v }));
        },
      });
      dialog.showModal();
    });
    dialog.addEventListener("click", (ev) => ev.target === dialog && dialog.close());
  }

  function init(root) {
    root.querySelectorAll("[data-kola-date]").forEach((el) => {
      if (el.dataset.kolaReady) return;
      el.dataset.kolaReady = "1";
      KolaDatePicker(el, { label: el.dataset.label, range: "range" in el.dataset, name: el.dataset.name, placeholder: el.dataset.placeholder });
    });
  }
  window.KolaDateFr = Fr;
  window.KolaCalendar = KolaCalendar;
  window.KolaDatePicker = KolaDatePicker;
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
