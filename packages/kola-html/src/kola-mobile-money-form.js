/*
 * Kola UI — Formulaire Mobile Money (MTN MoMo, Orange Money).
 * Nécessite kola-phone-field.js et kola-amount-field.js.
 *
 * <div id="paiement"></div>
 * <script>
 *   KolaMobileMoney(document.getElementById("paiement"), {
 *     amount: 5000,                       // optionnel : montant imposé
 *     onPay: async (demande) => {          // { phone, operator, amount }
 *       // Appelle ton serveur ici. En cas d'échec :
 *       // throw new KolaMobileMoneyError("Solde insuffisant");
 *     },
 *   });
 * </script>
 */
(function () {
  class KolaMobileMoneyError extends Error {}
  const NAMES = { mtn: "MTN MoMo", orange: "Orange Money" };
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
  const ICON = (path) =>
    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${path}"/></svg>`;

  function KolaMobileMoney(el, options) {
    const { onPay, amount: fixed, minAmount = 100, title = "Payer par Mobile Money" } = options || {};
    const Phone = window.KolaPhone, Amount = window.KolaAmount;
    const fmt = Amount ? Amount.format : String;
    el.classList.add("kola-momo");
    let state = { phone: "", amount: null, operator: null };
    let attempt = 0;

    function renderForm() {
      const uid = "kola-momo-" + Math.random().toString(36).slice(2, 7);
      el.innerHTML = `
<form novalidate>
  <h2>${esc(title)}</h2>
  <div class="kola-momo__ops" role="radiogroup" aria-label="Opérateur">
    <button type="button" class="kola-momo__op" role="radio" data-op="mtn" aria-checked="false"><span class="kola-momo__dot" style="background:#ffcb05"></span>MTN MoMo</button>
    <button type="button" class="kola-momo__op" role="radio" data-op="orange" aria-checked="false"><span class="kola-momo__dot" style="background:#ff7900"></span>Orange Money</button>
  </div>
  <div class="kola-field" data-kola-phone>
    <label class="kola-field__label" for="${uid}-tel">Téléphone</label>
    <div class="kola-field__box"><span class="kola-field__prefix">+237</span>
      <input class="kola-field__input" id="${uid}-tel" type="tel" inputmode="tel" autocomplete="tel-national" placeholder="6 XX XX XX XX"></div>
  </div>
  ${
    fixed === undefined
      ? `<div class="kola-field" data-kola-amount data-min="${minAmount}">
    <label class="kola-field__label" for="${uid}-amt">Montant</label>
    <div class="kola-field__box"><input class="kola-field__input" id="${uid}-amt" placeholder="0"><span class="kola-field__suffix">FCFA</span></div>
  </div>`
      : `<div class="kola-momo__fixed"><span>Montant</span><b>${fmt(fixed)} FCFA</b></div>`
  }
  <p class="kola-momo__error" role="alert" hidden></p>
  <button type="submit" class="kola-btn kola-btn--primary kola-btn--block">Payer</button>
  <p class="kola-momo__note">Tu recevras une demande de confirmation sur ton téléphone.</p>
</form>`;
      if (Phone) Phone.init(el);
      if (Amount) Amount.init(el);
      const form = el.querySelector("form");
      const submit = form.querySelector('[type="submit"]');
      const ops = form.querySelectorAll(".kola-momo__op");
      const setOp = (op) => { state.operator = op; ops.forEach((b) => b.setAttribute("aria-checked", String(b.dataset.op === op))); };
      const refresh = () => {
        const a = fixed ?? state.amount;
        submit.textContent = a === null ? "Payer" : `Payer ${fmt(a)} FCFA`;
      };
      ops.forEach((b) => b.addEventListener("click", () => setOp(b.dataset.op)));
      form.addEventListener("kola-change", (e) => {
        if ("phone" in e.detail) { state.phone = e.detail.phone; if (e.detail.operator) setOp(e.detail.operator); }
        if ("amount" in e.detail) { state.amount = e.detail.amount; refresh(); }
      });
      form.addEventListener("submit", (e) => { e.preventDefault(); pay(form); });
      refresh();
    }

    async function pay(form) {
      const err = form.querySelector(".kola-momo__error");
      const show = (m) => { err.textContent = m || ""; err.hidden = !m; };
      show(null);
      const amount = fixed ?? state.amount;
      const phoneInput = form.querySelector("[data-kola-phone] input");
      const phoneMsg = Phone ? Phone.validate(state.phone) : null;
      if (phoneMsg && window.KolaField) window.KolaField.setError(phoneInput, phoneMsg);
      if (amount === null || amount < minAmount) return show(`Indique un montant d'au moins ${fmt(minAmount)} FCFA`);
      if (phoneMsg) return;
      if (!state.operator) return show("Choisis ton opérateur");
      const req = { phone: state.phone, operator: state.operator, amount };
      const current = ++attempt;
      renderStatus(
        '<span class="kola-spinner kola-momo__big-spinner"></span>',
        "Confirme sur ton téléphone",
        `Une demande de ${fmt(req.amount)} FCFA a été envoyée au ${Phone ? Phone.format(req.phone) : req.phone}. Valide-la avec ton code secret ${NAMES[req.operator]}.`,
        '<button type="button" class="kola-btn kola-btn--outline" data-action="back">Annuler</button>',
      );
      try {
        await onPay(req);
        if (current !== attempt) return;
        renderStatus(
          `<span class="kola-momo__badge" style="background:var(--kola-success)">${ICON("M5 12.5l4.5 4.5L19 7.5")}</span>`,
          "Paiement reçu",
          `${fmt(req.amount)} FCFA · ${NAMES[req.operator]} · ${Phone ? Phone.format(req.phone) : req.phone}`,
          '<button type="button" class="kola-btn kola-btn--secondary" data-action="new">Nouveau paiement</button>',
        );
      } catch (e) {
        if (current !== attempt) return;
        renderStatus(
          `<span class="kola-momo__badge" style="background:var(--kola-danger)">${ICON("M7 7l10 10M17 7L7 17")}</span>`,
          "Paiement non abouti",
          e instanceof KolaMobileMoneyError ? e.message : "Solde insuffisant ou demande refusée. Aucun montant n'a été débité.",
          '<button type="button" class="kola-btn kola-btn--primary" data-action="back">Réessayer</button>',
        );
      }
    }

    function renderStatus(icon, heading, message, action) {
      el.innerHTML = `<div class="kola-momo__status" role="status">${icon}<h2>${esc(heading)}</h2><p>${esc(message)}</p>${action}</div>`;
      const btn = el.querySelector("[data-action]");
      btn.addEventListener("click", () => {
        attempt++; // ignore le résultat d'une demande abandonnée
        if (btn.dataset.action === "new") state = { phone: "", amount: null, operator: null };
        renderForm();
        if (btn.dataset.action === "back") restore();
      });
    }

    function restore() {
      const tel = el.querySelector("[data-kola-phone] input");
      if (tel && state.phone) { tel.value = state.phone; tel.dispatchEvent(new Event("input")); }
      const amt = el.querySelector("[data-kola-amount] input");
      if (amt && state.amount !== null) { amt.value = String(state.amount); amt.dispatchEvent(new Event("input")); }
    }

    renderForm();
    return { reset: () => { state = { phone: "", amount: null, operator: null }; renderForm(); } };
  }

  window.KolaMobileMoney = KolaMobileMoney;
  window.KolaMobileMoneyError = KolaMobileMoneyError;
})();
