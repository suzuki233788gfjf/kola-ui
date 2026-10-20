/*
 * Kola UI — Onglets : clic, flèches gauche / droite, Début et Fin au clavier.
 *
 * <div class="kola-tabs" data-kola-tabs>
 *   <div class="kola-tabs__list" role="tablist" aria-label="Commandes">
 *     <button class="kola-tabs__tab" role="tab" aria-selected="true">En cours <span class="kola-badge">3</span></button>
 *     <button class="kola-tabs__tab" role="tab">Livrées</button>
 *   </div>
 *   <div class="kola-tabs__panel" role="tabpanel">…</div>
 *   <div class="kola-tabs__panel" role="tabpanel" hidden>…</div>
 * </div>
 *
 * Variantes : kola-tabs--pills (pastilles), kola-tabs--expand (pleine largeur).
 * Événement « kola-change » : event.detail = { index }
 *
 * Barre du bas : avec des liens <a>, aucun script n'est nécessaire.
 * Avec des <button> et data-kola-bottom-nav sur le <nav>, l'onglet choisi est mis à jour
 * et « kola-change » est envoyé (event.detail = { index }).
 */
(function () {
  let uid = 0;

  function enhanceTabs(root) {
    if (root.dataset.kolaReady) return;
    root.dataset.kolaReady = "1";
    const base = "kola-tabs-" + ++uid;
    const tabs = [...root.querySelectorAll('[role="tab"]')];
    const panels = [...root.querySelectorAll('[role="tabpanel"]')];

    const select = (index, focus) => {
      tabs.forEach((tab, i) => {
        const on = i === index;
        tab.setAttribute("aria-selected", on ? "true" : "false");
        tab.tabIndex = on ? 0 : -1;
        if (panels[i]) panels[i].hidden = !on;
      });
      if (focus) tabs[index].focus();
    };

    tabs.forEach((tab, i) => {
      tab.type = "button";
      if (!tab.id) tab.id = base + "-tab-" + i;
      const panel = panels[i];
      if (panel) {
        if (!panel.id) panel.id = base + "-panel-" + i;
        tab.setAttribute("aria-controls", panel.id);
        panel.setAttribute("aria-labelledby", tab.id);
        panel.tabIndex = 0;
      }
      tab.querySelectorAll("svg").forEach((svg) => svg.setAttribute("aria-hidden", "true"));
      tab.addEventListener("click", () => change(i));
      tab.addEventListener("keydown", (e) => {
        const last = tabs.length - 1;
        const next =
          e.key === "ArrowRight" ? (i === last ? 0 : i + 1)
          : e.key === "ArrowLeft" ? (i === 0 ? last : i - 1)
          : e.key === "Home" ? 0
          : e.key === "End" ? last
          : null;
        if (next === null) return;
        e.preventDefault();
        change(next, true);
      });
    });

    let current = Math.max(0, tabs.findIndex((t) => t.getAttribute("aria-selected") === "true"));
    function change(index, focus) {
      select(index, focus);
      if (index === current) return;
      current = index;
      root.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { index } }));
    }
    select(current, false);
  }

  function enhanceBottomNav(nav) {
    if (nav.dataset.kolaReady) return;
    nav.dataset.kolaReady = "1";
    const items = [...nav.querySelectorAll(".kola-bottom-nav__item")];
    items.forEach((item, i) => {
      item.querySelectorAll("svg").forEach((svg) => svg.setAttribute("aria-hidden", "true"));
      if (item.tagName !== "BUTTON") return;
      item.type = "button";
      item.addEventListener("click", () => {
        if (item.getAttribute("aria-current") === "page") return;
        items.forEach((it) => it.removeAttribute("aria-current"));
        item.setAttribute("aria-current", "page");
        nav.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { index: i } }));
      });
    });
  }

  function init(root) {
    root.querySelectorAll("[data-kola-tabs]").forEach(enhanceTabs);
    root.querySelectorAll("[data-kola-bottom-nav]").forEach(enhanceBottomNav);
  }

  window.KolaTabs = { init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
