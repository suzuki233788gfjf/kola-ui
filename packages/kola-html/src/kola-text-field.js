/*
 * Kola UI — Champ de texte : bouton Afficher / Masquer pour les mots de passe
 * et messages d'erreur après le premier passage dans le champ.
 *
 * <input type="password" data-kola-toggle>                    → bouton œil
 * <input type="email" required data-error="Adresse incomplète"> → message si invalide
 *
 * KolaField.setError(input, "Message")  /  KolaField.setError(input, null)
 */
(function () {
  const EYE =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>';
  const EYE_OFF = EYE.replace("</svg>", '<path d="M3 3l18 18"/></svg>');

  function setError(input, message) {
    const field = input.closest(".kola-field");
    if (!field) return;
    let help = field.querySelector(".kola-field__help");
    if (!help) {
      help = document.createElement("p");
      help.className = "kola-field__help";
      field.appendChild(help);
    }
    if (help.dataset.helper === undefined) help.dataset.helper = help.textContent;
    if (!help.id) help.id = (input.id || "kola") + "-aide";
    input.setAttribute("aria-describedby", help.id);
    field.classList.toggle("is-invalid", !!message);
    if (message) input.setAttribute("aria-invalid", "true");
    else input.removeAttribute("aria-invalid");
    help.textContent = message || help.dataset.helper;
    help.hidden = !help.textContent;
  }

  function init(root) {
    root.querySelectorAll("input[data-kola-toggle]").forEach((input) => {
      if (input.dataset.kolaReady) return;
      input.dataset.kolaReady = "1";
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "kola-icon-btn kola-field__toggle";
      const sync = () => {
        const hidden = input.type === "password";
        btn.innerHTML = hidden ? EYE : EYE_OFF;
        btn.setAttribute("aria-label", hidden ? "Afficher" : "Masquer");
        btn.title = hidden ? "Afficher" : "Masquer";
      };
      btn.addEventListener("click", () => {
        input.type = input.type === "password" ? "text" : "password";
        sync();
      });
      sync();
      input.after(btn);
    });
    root.querySelectorAll(".kola-field input[data-error], .kola-field input[required]").forEach((input) => {
      if (input.dataset.kolaValidate) return;
      input.dataset.kolaValidate = "1";
      let touched = false;
      const check = () => setError(input, input.checkValidity() ? null : input.dataset.error || input.validationMessage);
      input.addEventListener("blur", () => { touched = true; check(); });
      input.addEventListener("input", () => touched && check());
    });
  }

  window.KolaField = { setError, init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
