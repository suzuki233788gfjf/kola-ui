/*
 * Kola UI — Montant en FCFA : séparateur de milliers pendant la saisie, sans décimales.
 *
 * <div class="kola-field" data-kola-amount data-min="100"> … <input class="kola-field__input"> … </div>
 *
 * La valeur entière est dans input.dataset.amount ("25000").
 * Événement « kola-change » : event.detail = { amount } (un nombre, ou null si vide)
 */
(function () {
  /** 1250000 → "1 250 000" */
  function format(value) {
    const s = String(Math.trunc(Math.abs(value)));
    let out = "";
    for (let i = 0; i < s.length; i++) {
      if (i > 0 && (s.length - i) % 3 === 0) out += " ";
      out += s[i];
    }
    return value < 0 ? "-" + out : out;
  }
  /** "1 250 000" → 1250000 */
  function parse(text) {
    const d = String(text).replace(/\D/g, "");
    return d ? Number(d) : null;
  }

  function enhance(field) {
    if (field.dataset.kolaReady) return;
    field.dataset.kolaReady = "1";
    const input = field.querySelector("input");
    input.setAttribute("inputmode", "numeric");
    const min = field.dataset.min ? Number(field.dataset.min) : null;
    const max = field.dataset.max ? Number(field.dataset.max) : null;
    let touched = false;
    const check = (amount) => {
      if (amount === null) return null;
      if (min !== null && amount < min) return "Minimum " + format(min) + " FCFA";
      if (max !== null && amount > max) return "Maximum " + format(max) + " FCFA";
      return null;
    };
    const setError = (m) => (window.KolaField ? window.KolaField.setError(input, m) : field.classList.toggle("is-invalid", !!m));
    let last = input.value;
    const update = () => {
      const digits = input.value.replace(/\D/g, "");
      if (digits.length > 12) { input.value = last; return; }
      const amount = digits ? Number(digits) : null;
      input.value = amount === null ? "" : format(amount);
      last = input.value;
      input.dataset.amount = amount === null ? "" : String(amount);
      if (touched) setError(check(amount));
      field.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { amount } }));
    };
    input.addEventListener("input", update);
    input.addEventListener("blur", () => { touched = true; setError(check(parse(input.value))); });
    if (input.value) update();
  }

  function init(root) { root.querySelectorAll("[data-kola-amount]").forEach(enhance); }
  window.KolaAmount = { format, parse, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
