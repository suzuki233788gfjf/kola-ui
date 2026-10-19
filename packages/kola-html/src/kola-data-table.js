/*
 * Kola UI — Tableau de données : tri, pagination, cartes sur petit écran.
 * Part d'un <table> normal.
 *
 * <table class="kola-table" data-kola-table data-rows-per-page="5">
 *   <thead><tr>
 *     <th data-sort>Produit</th>
 *     <th data-sort="number" class="is-num">Stock</th>
 *     <th data-sort="number" class="is-num">Prix</th>
 *   </tr></thead>
 *   <tbody>
 *     <tr><td>Riz parfumé 5 kg</td><td class="is-num">7</td><td class="is-num" data-value="4500">4 500 FCFA</td></tr>
 *   </tbody>
 * </table>
 *
 * - data-sort : colonne triable (data-sort="number" pour les nombres)
 * - data-value sur une cellule : valeur utilisée pour trier (sinon, le texte)
 */
(function () {
  const ICONS = {
    none: '<path d="M8 9l4-4 4 4M8 15l4 4 4-4"/>',
    ascending: '<path d="M12 19V5M6 11l6-6 6 6"/>',
    descending: '<path d="M12 5v14M6 13l6 6 6-6"/>',
  };
  const svg = (p) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${p}</svg>`;

  function enhance(table) {
    if (table.dataset.kolaReady) return;
    table.dataset.kolaReady = "1";
    const perPage = Math.max(1, Number(table.dataset.rowsPerPage) || 8);
    const wrap = document.createElement("div");
    wrap.className = "kola-table-wrap";
    table.before(wrap);
    wrap.appendChild(table);
    const heads = Array.from(table.tHead.rows[0].cells);
    const body = table.tBodies[0];
    const all = Array.from(body.rows);
    all.forEach((tr) => Array.from(tr.cells).forEach((td, i) => {
      td.dataset.label = heads[i] ? heads[i].textContent.trim() : "";
      if (heads[i] && heads[i].classList.contains("is-num")) td.classList.add("is-num");
    }));
    let rows = all.slice(), page = 0, sort = null;

    heads.forEach((th, i) => {
      if (!("sort" in th.dataset)) return;
      const label = th.textContent.trim();
      th.innerHTML = `<button type="button" class="kola-table__sort" aria-label="Trier par ${label}">${label}${svg(ICONS.none)}</button>`;
      th.querySelector("button").addEventListener("click", () => {
        sort = sort && sort.i === i ? { i, asc: !sort.asc } : { i, asc: true };
        const num = th.dataset.sort === "number";
        const val = (tr) => { const c = tr.cells[i]; const v = c.dataset.value ?? c.textContent.trim(); return num ? Number(String(v).replace(/[^\d.-]/g, "")) : v; };
        rows = all.slice().sort((a, b) => {
          const x = val(a), y = val(b);
          const r = num ? x - y : String(x).localeCompare(String(y), "fr");
          return sort.asc ? r : -r;
        });
        page = 0;
        render();
      });
    });

    const foot = document.createElement("div");
    foot.className = "kola-table__foot";
    foot.innerHTML = `<span></span><button type="button" class="kola-icon-btn" data-p="-1" aria-label="Page précédente" title="Page précédente">${svg('<path d="M15 6l-6 6 6 6"/>')}</button><button type="button" class="kola-icon-btn" data-p="1" aria-label="Page suivante" title="Page suivante">${svg('<path d="M9 6l6 6-6 6"/>')}</button>`;
    wrap.appendChild(foot);
    foot.addEventListener("click", (e) => { const b = e.target.closest("[data-p]"); if (b) { page += Number(b.dataset.p); render(); } });

    function render() {
      const pages = Math.max(1, Math.ceil(rows.length / perPage));
      page = Math.min(Math.max(0, page), pages - 1);
      const visible = rows.slice(page * perPage, page * perPage + perPage);
      body.replaceChildren(...visible);
      heads.forEach((th, i) => {
        if (!("sort" in th.dataset)) return;
        const state = sort && sort.i === i ? (sort.asc ? "ascending" : "descending") : null;
        if (state) th.setAttribute("aria-sort", state); else th.removeAttribute("aria-sort");
        th.querySelector("svg").innerHTML = ICONS[state || "none"];
      });
      const from = rows.length ? page * perPage + 1 : 0;
      foot.querySelector("span").textContent = `${from}–${page * perPage + visible.length} sur ${rows.length}`;
      foot.querySelector('[data-p="-1"]').disabled = page === 0;
      foot.querySelector('[data-p="1"]').disabled = page >= pages - 1;
    }
    render();
  }

  function init(root) { root.querySelectorAll("table[data-kola-table]").forEach(enhance); }
  window.KolaDataTable = { init };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
