/*
 * Kola UI — Code OTP : les cases pour le code reçu par SMS.
 * Un seul champ invisible derrière les cases : collage, remplissage automatique
 * du SMS et effacement marchent comme dans un champ normal.
 *
 * <div class="kola-field kola-otp" data-kola-otp data-length="6" data-resend="60">
 *   <label class="kola-field__label" for="code">Code de vérification</label>
 *   <input class="kola-otp__input" id="code" name="code">
 *   <p class="kola-field__help">Envoyé par SMS au 6 77 12 34 56</p>
 * </div>
 *
 * Événements sur le bloc :
 *   « kola-change »   event.detail = { code }
 *   « kola-complete » event.detail = { code }  (toutes les cases remplies)
 *   « kola-resend »   clic sur « Renvoyer le code » (data-resend = délai en secondes)
 *
 * KolaOtp.setError(bloc, "Code incorrect")  ·  KolaOtp.clear(bloc)
 */
(function () {
  /** "48 29 13" → "482913" · "Votre code Kola : 482913." → "482913" */
  function parse(text, length) {
    const s = String(text);
    const compact = s.replace(/[\s-]/g, "");
    if (/^\d*$/.test(compact)) return compact.slice(0, length);
    const match = new RegExp("(^|\\D)(\\d{" + length + "})(?!\\d)").exec(s);
    if (match) return match[2];
    return s.replace(/\D/g, "").slice(0, length);
  }
  /** 75 → "1:15" */
  function formatDelay(seconds) {
    return Math.floor(seconds / 60) + ":" + String(seconds % 60).padStart(2, "0");
  }

  function enhance(field) {
    if (field.dataset.kolaReady) return;
    field.dataset.kolaReady = "1";
    const length = Number(field.dataset.length) || 6;
    const input = field.querySelector("input");
    const label = field.querySelector("label");

    input.classList.add("kola-otp__input");
    input.setAttribute("inputmode", "numeric");
    input.setAttribute("autocomplete", "one-time-code");
    input.setAttribute("pattern", "[0-9]*");
    input.setAttribute("spellcheck", "false");
    if (!input.id) input.id = "kola-otp-" + Math.random().toString(36).slice(2, 8);
    if (label) label.htmlFor = input.id;

    const boxes = document.createElement("div");
    boxes.className = "kola-otp__boxes";
    const cells = [];
    for (let i = 0; i < length; i++) {
      const cell = document.createElement("div");
      cell.className = "kola-otp__box";
      cell.setAttribute("aria-hidden", "true");
      cells.push(cell);
      boxes.appendChild(cell);
    }
    input.replaceWith(boxes);
    boxes.appendChild(input);
    field.classList.toggle("is-disabled", input.disabled);

    let code = parse(input.value, length);
    const render = () => {
      input.value = code;
      const focused = document.activeElement === input;
      const active = focused ? Math.min(code.length, length - 1) : -1;
      cells.forEach((cell, i) => {
        cell.classList.toggle("is-active", i === active);
        if (code[i]) cell.textContent = code[i];
        else if (i === active) cell.innerHTML = '<span class="kola-otp__caret"></span>';
        else cell.textContent = "";
      });
    };
    const set = (next) => {
      if (next === code) return render();
      code = next;
      render();
      field.dispatchEvent(new CustomEvent("kola-change", { bubbles: true, detail: { code } }));
      if (code.length === length) field.dispatchEvent(new CustomEvent("kola-complete", { bubbles: true, detail: { code } }));
    };
    const caretToEnd = () => {
      const end = input.value.length;
      if (input.selectionStart !== end || input.selectionEnd !== end) input.setSelectionRange(end, end);
    };

    input.addEventListener("input", () => set(parse(input.value, length)));
    input.addEventListener("paste", (e) => {
      // Un collage remplace tout le code au lieu de s'ajouter à la fin.
      e.preventDefault();
      set(parse(e.clipboardData ? e.clipboardData.getData("text") : "", length));
    });
    input.addEventListener("focus", render);
    input.addEventListener("blur", render);
    ["select", "keyup", "click"].forEach((t) => input.addEventListener(t, caretToEnd));
    field._kolaOtp = { clear: () => { set(""); input.focus(); } };

    // Renvoyer le code
    if (field.dataset.resend !== undefined) {
      const delay = Number(field.dataset.resend) || 60;
      const line = document.createElement("p");
      line.className = "kola-otp__resend";
      field.appendChild(line);
      let left = delay;
      let timer;
      const show = () => {
        if (left > 0) {
          line.innerHTML = 'Renvoyer le code dans <span class="kola-otp__timer">' + formatDelay(left) + "</span>";
        } else {
          line.innerHTML = '<button type="button">Renvoyer le code</button>';
          const btn = line.querySelector("button");
          btn.disabled = input.disabled;
          btn.addEventListener("click", () => {
            field.dispatchEvent(new CustomEvent("kola-resend", { bubbles: true }));
            set("");
            input.focus();
            start();
          });
        }
      };
      const start = () => {
        clearInterval(timer);
        left = delay;
        show();
        timer = setInterval(() => {
          left = Math.max(0, left - 1);
          show();
          if (left === 0) clearInterval(timer);
        }, 1000);
      };
      start();
    }
    render();
  }

  function setError(field, message) {
    const input = field.querySelector("input");
    if (window.KolaField) return window.KolaField.setError(input, message);
    field.classList.toggle("is-invalid", !!message);
  }
  function clear(field) {
    if (field._kolaOtp) field._kolaOtp.clear();
  }
  function init(root) { root.querySelectorAll("[data-kola-otp]").forEach(enhance); }

  window.KolaOtp = { parse, formatDelay, init, setError, clear };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => init(document));
  else init(document);
})();
