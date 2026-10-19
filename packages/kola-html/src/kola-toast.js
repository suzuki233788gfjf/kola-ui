/*
 * Kola UI — Notifications.
 *
 * kolaToast("Paiement reçu", { type: "success" });            // success | error | info | warning
 * kolaToast("Réseau instable", { type: "warning", title: "Attention", duration: 6000 });
 *
 * Pour afficher une notification fixe dans la page : KolaToast.view(message, options) renvoie l'élément.
 */
(function () {
  const PATHS = { success: "M8 12.5l2.7 2.7L16 9.5", error: "M9 9l6 6M15 9l-6 6", info: "M12 11v5M12 8v.01", warning: "M12 8v4.5M12 16v.01" };
  const LABELS = { success: "Succès", error: "Erreur", info: "Information", warning: "Attention" };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);

  function view(message, { type = "success", title, onClose } = {}) {
    const el = document.createElement("div");
    el.className = "kola-toast kola-toast--" + type;
    el.setAttribute("role", type === "error" ? "alert" : "status");
    el.innerHTML = `<svg class="kola-toast__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-label="${LABELS[type]}"><circle cx="12" cy="12" r="10"/><path d="${PATHS[type]}"/></svg>
<div class="kola-toast__body">${title ? `<p class="kola-toast__title">${esc(title)}</p>` : ""}<p class="kola-toast__msg">${esc(message)}</p></div>
${onClose ? '<button type="button" class="kola-icon-btn kola-toast__close" aria-label="Fermer" title="Fermer"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M7 7l10 10M17 7L7 17"/></svg></button>' : ""}`;
    if (onClose) el.querySelector(".kola-toast__close").addEventListener("click", onClose);
    return el;
  }

  function kolaToast(message, { type = "success", title, duration = 4000 } = {}) {
    let stack = document.querySelector(".kola-toasts");
    if (!stack) {
      stack = document.createElement("div");
      stack.className = "kola-toasts";
      stack.setAttribute("aria-live", "polite");
      document.body.appendChild(stack);
    }
    while (stack.children.length >= 3) stack.firstElementChild.remove();
    const close = () => el.remove();
    const el = view(message, { type, title, onClose: close });
    stack.appendChild(el);
    setTimeout(close, duration);
    return close;
  }

  window.kolaToast = kolaToast;
  window.KolaToast = { show: kolaToast, view };
})();
