/*
 * Kola UI — Téléphone Cameroun (+237) : formatage « 6 77 12 34 56 » et détection MTN / Orange.
 *
 * <div class="kola-field" data-kola-phone> … <input class="kola-field__input" type="tel"> … </div>
 *
 * Le numéro sans espaces est dans input.dataset.phone ("677123456").
 * Événement « kola-change » : event.detail = { phone, operator }
 */
(function () {
  /** Préfixes : MTN 67, 68, 650–654 · Orange 69, 655–659. */
  function detectOperator(input) {
    const d = String(input).replace(/\D/g, "");
    if (d.length < 2) return null;
    const p2 = d.slice(0, 2);
    if (p2 === "67" || p2 === "68") return "mtn";
    if (p2 === "69") return "orange";
    if (p2 === "65" && d.length >= 3) return Number(d[2]) <= 4 ? "mtn" : "orange";
    return null;
  }
  /** "677123456" → "6 77 12 34 56" */
  function format(input) {
    const d = String(input).replace(/\D/g, "").slice(0, 9);
    return [d.slice(0, 1), d.slice(1, 3), d.slice(3, 5), d.slice(5, 7), d.slice(7, 9)].filter(Boolean).join(" ");
  }
  function validate(input) {
    const d = String(input).replace(/\D/g, "");
    if (!d) return "Numéro requis";
    if (!d.startsWith("6")) return "Un numéro mobile commence par 6";
    if (d.length < 9) return "Numéro incomplet (9 chiffres)";
    return null;
  }
  function digitsOf(v) {
    let d = String(v).replace(/\D/g, "");
    if (d.length > 9 && d.startsWith("237")) d = d.slice(3);
    return d.slice(0, 9);
  }

  function setError(field, input, message) {
    if (window.KolaField) return window.KolaField.setError(input, message);
    field.classList.toggle("is-invalid", !!message);
  }

  function enhance(field) {
    if (field.dataset.kolaReady) return;
    field.dataset.kolaReady = "1";
    const input = field.querySelector("input");
    const box = field.querySelector(".kola-field__box") || input.parentElement;
    let badge = field.querySelector(".kola-operator");
    if (!badge) {
      badge = document.createElement("span");
      badge.className = "kola-operator";
      badge.hidden = true;
      box.appendChild(badge);
    }
    let touched = false;
    const update = () => {
      const d = digitsOf(input.value);
      input.value = format(d);
      input.dataset.phone = d;
      const op = detectOperator(d);
      badge.hidden = !op;
      badge.className = "kola-operator" + (op ? " kola-operator--" + op : "");
      badge.textContent = op === "mtn" ? "MTN" : op === "orange" ? "Orange" : "";
      if (touched) setError(field, input, validate(d));
      field.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { phone: d, operator: op } }));
    };
    input.addEventListener("input", update);
    input.addEventListener("blur", () => { touched = true; setError(field, input, validate(input.value)); });
    if (input.value) update();
  }

  function init(root) { root.querySelectorAll("[data-kola-phone]").forEach(enhance); }
  window.KolaPhone = { detectOperator, format, validate, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
