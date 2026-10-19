/*
 * Kola UI — Confirmation en une ligne.
 *
 * const ok = await kolaConfirm({
 *   title: "Supprimer cet article ?",
 *   message: "Cette action est définitive.",
 *   confirmLabel: "Supprimer",
 *   destructive: true,   // bouton rouge
 *   sheet: false,        // true : panneau qui monte du bas (mobile)
 * });
 */
(function () {
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  function kolaConfirm({ title, message, confirmLabel = "Confirmer", cancelLabel = "Annuler", destructive = false, sheet = false, container } = {}) {
    return new Promise((resolve) => {
      const d = document.createElement("dialog");
      d.className = "kola-dialog" + (sheet ? " kola-dialog--sheet" : "");
      d.setAttribute("aria-label", title);
      d.innerHTML = `<div class="kola-confirm">
  ${sheet ? '<span class="kola-confirm__handle" aria-hidden="true"></span>' : ""}
  <h2>${esc(title)}</h2>
  ${message ? `<p>${esc(message)}</p>` : ""}
  <div class="kola-confirm__actions">
    <button type="button" class="kola-btn kola-btn--text" data-r="0">${esc(cancelLabel)}</button>
    <button type="button" class="kola-btn ${destructive ? "kola-btn--danger" : "kola-btn--primary"}" data-r="1" autofocus>${esc(confirmLabel)}</button>
  </div>
</div>`;
      let done = false;
      const finish = (ok) => {
        if (done) return;
        done = true;
        d.close();
        d.remove();
        resolve(ok);
      };
      d.addEventListener("click", (e) => {
        const b = e.target.closest("[data-r]");
        if (b) finish(b.dataset.r === "1");
        else if (e.target === d) finish(false);
      });
      d.addEventListener("cancel", (e) => { e.preventDefault(); finish(false); });
      (container || document.body).appendChild(d);
      d.showModal();
    });
  }
  window.kolaConfirm = kolaConfirm;
})();
