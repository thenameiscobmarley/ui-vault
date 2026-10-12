/*! UI Vault 3 · feedback.js — toast, modal, cmdk palette, confetti, sound, copy. Needs core.js. MIT */
(function (UV) {
  "use strict";
  let host, actx;

  UV.toast = (msg, { type = "info", duration = 3000, icon } = {}) => {
    if (!host) { host = document.createElement("div"); host.className = "uv-toasts uv"; host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
    const t = document.createElement("div");
    t.className = "uv-toast uv-toast--" + type;
    t.innerHTML = '<span class="uv-toast__icon"></span><span></span>';
    t.firstChild.textContent = icon || { success: "✓", error: "✕", warn: "!", info: "i" }[type] || "i";
    t.lastChild.textContent = msg;
    host.appendChild(t);
    const close = () => { t.classList.add("is-out"); setTimeout(() => t.remove(), 300); };
    t.addEventListener("click", close); setTimeout(close, duration);
    return close;
  };

  UV.copy = async (text, msg = "Copied to clipboard") => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    if (msg) UV.toast(msg, { type: "success", duration: 1800 });
  };

  UV.sound = (name = "click", vol = .15) => {
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const now = actx.currentTime;
      const tone = (f, t, d, type = "sine", v = vol, f2) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, now + t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, now + t + d * .8);
        g.gain.setValueAtTime(0, now + t); g.gain.linearRampToValueAtTime(v, now + t + .005); g.gain.exponentialRampToValueAtTime(.0001, now + t + d);
        o.connect(g).connect(actx.destination); o.start(now + t); o.stop(now + t + d + .02);
      };
      ({ click: () => tone(1800, 0, .04, "triangle", vol * .6),
         pop: () => tone(420, 0, .12, "sine", vol, 920),
         success: () => { tone(660, 0, .25); tone(880, .09, .3); tone(1320, .18, .4); },
         error: () => { tone(220, 0, .18, "square", vol * .4); tone(180, .12, .25, "square", vol * .4); },
         hover: () => tone(2400, 0, .02, "sine", vol * .3),
         whoosh: () => tone(200, 0, .3, "sawtooth", vol * .15, 1200),
         coin: () => { tone(988, 0, .08, "square", vol * .4); tone(1319, .08, .3, "square", vol * .4); },
         laser: () => tone(1600, 0, .25, "sawtooth", vol * .3, 120) }[name] || (() => {}))();
    } catch {}
  };

  UV.confetti = ({ x = innerWidth / 2, y = innerHeight / 2, count = 120, colors, shapes = "rect", spread = 1 } = {}) => {
    if (UV.reduce) return;
    const cs = getComputedStyle(document.documentElement);
    colors = colors || [cs.getPropertyValue("--uv-accent").trim() || "#ff4f00", "#1a1917", "#8f8a82", "#e2ded6", "#fbfaf8"];
    const c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10000";
    c.width = innerWidth * dpr; c.height = innerHeight * dpr; document.body.appendChild(c);
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    const P = Array.from({ length: count }, () => { const a = Math.random() * Math.PI * 2, s = (4 + Math.random() * 9) * spread;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: colors[(Math.random() * colors.length) | 0], life: 0 }; });
    let frame = 0;
    (function tick() {
      g.clearRect(0, 0, innerWidth, innerHeight); let alive = 0;
      for (const p of P) {
        p.vy += .28; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
        if (p.y < innerHeight + 20) alive++;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - p.life / 160); g.fillStyle = p.c;
        if (shapes === "circle") { g.beginPath(); g.arc(0, 0, p.w / 2, 0, 7); g.fill(); } else g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * .15)));
        g.restore();
      }
      if (alive && ++frame < 200) UV.raf(tick); else c.remove();
    })();
  };

  UV.modal = ({ title = "", body = "", actions = [{ label: "OK", value: true, primary: true }] } = {}) => new Promise(res => {
    const d = document.createElement("dialog");
    d.className = "uv-modal uv";
    d.innerHTML = `<div><h3 class="uv-h3" style="margin-bottom:8px"></h3><div class="uv-muted" style="margin-bottom:22px"></div><div class="uv-row" style="justify-content:flex-end"></div></div>`;
    d.querySelector("h3").textContent = title;
    const b = d.querySelector(".uv-muted"); typeof body === "string" ? (b.textContent = body) : b.appendChild(body);
    actions.forEach(a => { const btn = document.createElement("button"); btn.className = "uv-btn " + (a.primary ? "uv-btn--primary" : a.danger ? "uv-btn--danger" : "uv-btn--ghost"); btn.textContent = a.label; btn.onclick = () => d.close(JSON.stringify(a.value ?? a.label)); d.querySelector(".uv-row").appendChild(btn); });
    d.addEventListener("click", e => { if (e.target === d) d.close("null"); });
    d.addEventListener("close", () => { let v = null; try { v = JSON.parse(d.returnValue || "null"); } catch {} d.remove(); res(v); });
    document.body.appendChild(d); d.showModal();
  });

  UV.cmdk = (items, { hotkey = "k", placeholder = "Type a command or search…" } = {}) => {
    const d = document.createElement("dialog");
    d.className = "uv-cmdk uv"; d.innerHTML = `<input placeholder="${placeholder}" aria-label="Command"><ul role="listbox"></ul>`;
    document.body.appendChild(d);
    const input = d.querySelector("input"), ul = d.querySelector("ul");
    let shown = [], active = 0;
    const run = it => { d.close(); it.action && it.action(); };
    const render = () => {
      const q = input.value.toLowerCase().trim();
      shown = items.filter(i => !q || (i.label + " " + (i.keywords || "")).toLowerCase().includes(q));
      active = Math.min(active, Math.max(0, shown.length - 1));
      ul.innerHTML = shown.length ? "" : `<div class="uv-cmdk__empty">No results</div>`;
      shown.forEach((it, k) => {
        const li = document.createElement("li"); li.className = k === active ? "is-active" : "";
        li.innerHTML = `<span>${it.icon || "›"}</span><span></span>${it.shortcut ? `<span class="uv-kbd">${it.shortcut}</span>` : ""}`;
        li.children[1].textContent = it.label;
        li.onmouseenter = () => { active = k; [...ul.children].forEach((c, j) => c.classList.toggle("is-active", j === k)); };
        li.onclick = () => run(it); ul.appendChild(li);
      });
    };
    input.addEventListener("input", () => { active = 0; render(); });
    input.addEventListener("keydown", e => {
      if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); active = (active + (e.key === "ArrowDown" ? 1 : -1) + shown.length) % (shown.length || 1); render(); ul.children[active]?.scrollIntoView({ block: "nearest" }); }
      if (e.key === "Enter" && shown[active]) run(shown[active]);
    });
    d.addEventListener("click", e => { if (e.target === d) d.close(); });
    const open = () => { input.value = ""; active = 0; render(); d.showModal(); input.focus(); };
    if (hotkey) document.addEventListener("keydown", e => { if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === hotkey) { e.preventDefault(); d.open ? d.close() : open(); } });
    return { open, close: () => d.close() };
  };

  UV.use("feedback", root => {
    root.querySelectorAll("[data-uv-confetti]").forEach(el => UV.once(el, "conf") && el.addEventListener("click", e => UV.confetti({ x: e.clientX, y: e.clientY })));
    root.querySelectorAll("[data-uv-copy]").forEach(el => UV.once(el, "copy") && el.addEventListener("click", () => UV.copy(el.dataset.uvCopy)));
    root.querySelectorAll("[data-uv-sound]").forEach(el => UV.once(el, "snd") && el.addEventListener("click", () => UV.sound(el.dataset.uvSound)));
    root.querySelectorAll("[data-uv-toast]").forEach(el => UV.once(el, "toast") && el.addEventListener("click", () => UV.toast(el.dataset.uvToast, { type: el.dataset.uvToastType || "info" })));
  });
})(window.UV);
