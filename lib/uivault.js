/*!
 * UI Vault JS v2.0 — MIT. Tiny behavior + motion API for uivault.css. No dependencies.
 *
 *   <script src="uivault.js"></script>   → window.UV, auto-inits data attributes on DOMContentLoaded
 *
 * Declarative (HTML attributes):
 *   data-uv="tilt magnetic spotlight ripple parallax"   behaviors (space separated)
 *   data-uv-count="1234"  data-uv-decimals="1" data-uv-prefix="$" data-uv-suffix="%"
 *   data-uv-type="Words|To|Cycle"     typewriter
 *   data-uv-scramble                  text scrambles in when visible
 *   data-uv-reveal[="left|right|zoom"] fade/slide in on scroll, data-uv-stagger on parent
 *   data-uv-confetti                  click → confetti burst
 *   data-uv-copy="text"               click → copy + toast
 *   data-uv-sound="click|pop|success" play a UI sound on click
 *   class="uv-tabs"                   sliding indicator tabs; buttons with aria-controls="panelId"
 *   class="uv-otp" / "uv-range" / "uv-drop" / "uv-ring"(data-value) are wired automatically
 *
 * Imperative (JS):
 *   UV.toast(msg, {type, duration})   UV.confetti({x, y, count})   UV.modal({title, body, actions}) → Promise
 *   UV.cmdk(items, {hotkey})          UV.countUp(el, to, opts)     UV.typewriter(el, words, opts)
 *   UV.scramble(el, text)             UV.ring(el, value)           UV.copy(text)    UV.sound(name)
 *   UV.theme("dark"|"light"|"toggle") UV.tilt/magnetic/spotlight/ripple/parallax(el)   UV.init(root)
 */
(function (global) {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const raf = requestAnimationFrame;
  const UV = { version: "2.0.0" };

  // ── Toasts ──────────────────────────────────────────────────
  let host;
  UV.toast = (msg, { type = "info", duration = 3000, icon } = {}) => {
    if (!host) { host = document.createElement("div"); host.className = "uv-toasts uv"; host.setAttribute("aria-live", "polite"); document.body.appendChild(host); }
    const t = document.createElement("div");
    t.className = "uv-toast uv-toast--" + type;
    const ic = icon || { success: "✓", error: "✕", warn: "!", info: "i" }[type] || "i";
    t.innerHTML = '<span class="uv-toast__icon"></span><span></span>';
    t.firstChild.textContent = ic; t.lastChild.textContent = msg;
    host.appendChild(t);
    const close = () => { t.classList.add("is-out"); setTimeout(() => t.remove(), 300); };
    t.addEventListener("click", close);
    setTimeout(close, duration);
    return close;
  };

  // ── Clipboard ───────────────────────────────────────────────
  UV.copy = async (text, msg = "Copied to clipboard") => {
    try { await navigator.clipboard.writeText(text); }
    catch { const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0"; document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove(); }
    if (msg) UV.toast(msg, { type: "success", duration: 1800 });
  };

  // ── Sounds (synthesized, no files) ──────────────────────────
  let actx;
  UV.sound = (name = "click", vol = .15) => {
    try {
      actx = actx || new (global.AudioContext || global.webkitAudioContext)();
      const now = actx.currentTime;
      const tone = (f, t, d, type = "sine", v = vol) => {
        const o = actx.createOscillator(), g = actx.createGain();
        o.type = type; o.frequency.setValueAtTime(f, now + t);
        if (name === "pop") o.frequency.exponentialRampToValueAtTime(f * 2.2, now + t + d * .6);
        g.gain.setValueAtTime(0, now + t); g.gain.linearRampToValueAtTime(v, now + t + .005); g.gain.exponentialRampToValueAtTime(.0001, now + t + d);
        o.connect(g).connect(actx.destination); o.start(now + t); o.stop(now + t + d + .02);
      };
      ({ click: () => tone(1800, 0, .04, "triangle", vol * .6),
         pop: () => tone(420, 0, .12),
         success: () => { tone(660, 0, .25); tone(880, .09, .3); tone(1320, .18, .4); },
         error: () => { tone(220, 0, .18, "square", vol * .4); tone(180, .12, .25, "square", vol * .4); },
         hover: () => tone(2400, 0, .02, "sine", vol * .3) }[name] || (() => {}))();
    } catch {}
  };

  // ── Confetti (one canvas, auto-removes) ─────────────────────
  UV.confetti = ({ x = innerWidth / 2, y = innerHeight / 2, count = 120, colors } = {}) => {
    if (reduce) return;
    const cs = getComputedStyle(document.documentElement);
    colors = colors || [cs.getPropertyValue("--uv-accent").trim() || "#8b5cf6", cs.getPropertyValue("--uv-accent-2").trim() || "#22d3ee", "#f472b6", "#fbbf24", "#34d399"];
    const c = document.createElement("canvas"), dpr = Math.min(devicePixelRatio || 1, 2);
    c.style.cssText = "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:10000";
    c.width = innerWidth * dpr; c.height = innerHeight * dpr;
    document.body.appendChild(c);
    const g = c.getContext("2d"); g.scale(dpr, dpr);
    const P = Array.from({ length: count }, () => {
      const a = Math.random() * Math.PI * 2, s = 4 + Math.random() * 9;
      return { x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 6, r: Math.random() * 6, vr: (Math.random() - .5) * .4, w: 6 + Math.random() * 6, h: 4 + Math.random() * 4, c: colors[(Math.random() * colors.length) | 0], life: 0 };
    });
    let frame = 0;
    (function tick() {
      g.clearRect(0, 0, innerWidth, innerHeight);
      let alive = 0;
      for (const p of P) {
        p.vy += .28; p.vx *= .985; p.vy *= .985; p.x += p.vx; p.y += p.vy; p.r += p.vr; p.life++;
        if (p.y < innerHeight + 20) alive++;
        g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.globalAlpha = Math.max(0, 1 - p.life / 160);
        g.fillStyle = p.c; g.fillRect(-p.w / 2, -p.h / 2, p.w, p.h * Math.abs(Math.cos(p.life * .15))); g.restore();
      }
      if (alive && ++frame < 200) raf(tick); else c.remove();
    })();
  };

  // ── Number count-up ─────────────────────────────────────────
  UV.countUp = (el, to, { duration = 1400, decimals = 0, prefix = "", suffix = "", from = 0 } = {}) => {
    const fmt = v => prefix + v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 4);
      el.textContent = fmt(from + (to - from) * e);
      if (p < 1) raf(step);
    })(t0);
  };

  // ── Typewriter ──────────────────────────────────────────────
  UV.typewriter = (el, words, { speed = 70, pause = 1400, loop = true } = {}) => {
    let w = 0, i = 0, del = false, stopped = false;
    el.classList.add("uv-caret");
    if (!document.getElementById("uv-caret-css")) {
      const s = document.createElement("style"); s.id = "uv-caret-css";
      s.textContent = ".uv-caret::after{content:'';display:inline-block;width:2px;height:1em;margin-left:3px;vertical-align:-.12em;background:currentColor;animation:uv-blink .9s step-end infinite}@keyframes uv-blink{50%{opacity:0}}";
      document.head.appendChild(s);
    }
    (function tick() {
      if (stopped) return;
      const word = words[w];
      el.textContent = word.slice(0, i);
      if (!del && i < word.length) { i++; setTimeout(tick, speed); }
      else if (!del) { if (!loop && w === words.length - 1) return; del = true; setTimeout(tick, pause); }
      else if (i > 0) { i--; setTimeout(tick, speed / 2); }
      else { del = false; w = (w + 1) % words.length; setTimeout(tick, speed * 3); }
    })();
    return () => { stopped = true; };
  };

  // ── Scramble text ───────────────────────────────────────────
  UV.scramble = (el, text = el.textContent, { duration = 900, chars = "!<>-_\\/[]{}—=+*^?#ABCDEFX01" } = {}) => {
    if (reduce) { el.textContent = text; return; }
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = [...text].map((ch, k) => ch === " " || k / text.length < p ? ch : chars[(Math.random() * chars.length) | 0]).join("");
      if (p < 1) raf(step); else el.textContent = text;
    })(t0);
  };

  // ── Pointer behaviors ───────────────────────────────────────
  const local = (e, el) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  UV.spotlight = el => el.addEventListener("pointermove", e => { const p = local(e, el); el.style.setProperty("--x", p.x + "px"); el.style.setProperty("--y", p.y + "px"); });
  UV.tilt = (el, { max = 12 } = {}) => {
    if (reduce) return;
    el.classList.add("uv-tilt");
    if (!el.querySelector(".uv-glare")) { const g = document.createElement("i"); g.className = "uv-glare"; el.appendChild(g); }
    el.addEventListener("pointermove", e => {
      const p = local(e, el), px = p.x / p.w, py = p.y / p.h;
      el.style.setProperty("--ry", (px - .5) * max * 2 + "deg"); el.style.setProperty("--rx", (.5 - py) * max * 2 + "deg");
      el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  };
  UV.magnetic = (el, { strength = .35 } = {}) => {
    if (reduce) return;
    el.style.transition = "transform .3s cubic-bezier(.2,.8,.2,1)";
    el.addEventListener("pointermove", e => { const p = local(e, el); el.style.transform = `translate(${(p.x - p.w / 2) * strength}px,${(p.y - p.h / 2) * strength}px)`; });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };
  UV.ripple = el => el.addEventListener("pointerdown", e => {
    const p = local(e, el), d = Math.max(p.w, p.h), i = document.createElement("span");
    i.className = "uv-ripple"; i.style.cssText = `width:${d}px;height:${d}px;left:${p.x - d / 2}px;top:${p.y - d / 2}px`;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.overflow = "hidden"; el.appendChild(i); setTimeout(() => i.remove(), 650);
  });
  UV.parallax = el => {
    if (reduce) return;
    const layers = el.querySelectorAll("[data-depth]");
    el.addEventListener("pointermove", e => {
      const p = local(e, el), dx = p.x / p.w - .5, dy = p.y / p.h - .5;
      layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${dx * d * 40}px,${dy * d * 40}px)`; });
    });
    el.addEventListener("pointerleave", () => layers.forEach(l => { l.style.transform = ""; }));
    layers.forEach(l => { l.style.transition = "transform .25s ease-out"; });
  };

  // ── Tabs with sliding indicator + panels ────────────────────
  UV.tabs = (el, onChange) => {
    if (el._uvTabs) return; el._uvTabs = true;
    el.setAttribute("role", "tablist");
    let ind = el.querySelector(".uv-tabs__ind");
    if (!ind) { ind = document.createElement("span"); ind.className = "uv-tabs__ind"; el.prepend(ind); }
    const tabs = [...el.querySelectorAll(":scope > button")];
    const move = t => { ind.style.width = t.offsetWidth + "px"; ind.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, silent) => {
      tabs.forEach(x => {
        const on = x === t; x.setAttribute("aria-selected", on); x.setAttribute("role", "tab"); x.tabIndex = on ? 0 : -1;
        const panel = x.getAttribute("aria-controls") && document.getElementById(x.getAttribute("aria-controls"));
        if (panel) panel.hidden = !on;
      });
      move(t); if (!silent && onChange) onChange(t, tabs.indexOf(t));
    };
    tabs.forEach((t, k) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => {
        const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (d) { const n = tabs[(k + d + tabs.length) % tabs.length]; n.focus(); select(n); }
      });
    });
    const first = tabs.find(t => t.getAttribute("aria-selected") === "true") || tabs[0];
    ind.style.transition = "none"; select(first, true);
    raf(() => raf(() => { ind.style.transition = ""; move(first); }));
    new ResizeObserver(() => { const s = tabs.find(t => t.getAttribute("aria-selected") === "true"); s && move(s); }).observe(el);
    return { select: i => select(tabs[i]) };
  };

  // ── Ring / progress ─────────────────────────────────────────
  UV.ring = (el, value, { duration = 1200 } = {}) => {
    const from = +getComputedStyle(el).getPropertyValue("--v") || 0, t0 = performance.now();
    (function step(now) {
      const p = reduce ? 1 : Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 3);
      el.style.setProperty("--v", from + (value - from) * e);
      if (p < 1) raf(step);
    })(t0);
  };

  // ── Form helpers ────────────────────────────────────────────
  UV.otp = el => {
    const inputs = [...el.querySelectorAll("input")];
    inputs.forEach((inp, k) => {
      inp.maxLength = 1; inp.inputMode = "numeric";
      inp.addEventListener("input", () => { inp.value = inp.value.replace(/\D/g, ""); if (inp.value && inputs[k + 1]) inputs[k + 1].focus(); if (inputs.every(i => i.value)) el.dispatchEvent(new CustomEvent("uv-complete", { detail: inputs.map(i => i.value).join("") })); });
      inp.addEventListener("keydown", e => { if (e.key === "Backspace" && !inp.value && inputs[k - 1]) inputs[k - 1].focus(); });
      inp.addEventListener("paste", e => { const t = (e.clipboardData.getData("text") || "").replace(/\D/g, ""); if (t) { e.preventDefault(); inputs.forEach((i, j) => { i.value = t[j] || ""; }); inputs[Math.min(t.length, inputs.length) - 1].focus(); inp.dispatchEvent(new Event("input")); } });
    });
  };
  UV.range = el => { const sync = () => el.style.setProperty("--v", ((el.value - (el.min || 0)) / ((el.max || 100) - (el.min || 0))) * 100 + "%"); el.addEventListener("input", sync); sync(); };
  UV.drop = (el, onFiles) => {
    const input = document.createElement("input"); input.type = "file"; input.multiple = true; input.hidden = true; el.appendChild(input);
    const emit = files => { if (files.length) { el.dispatchEvent(new CustomEvent("uv-files", { detail: [...files] })); onFiles && onFiles([...files]); } };
    el.addEventListener("click", e => { if (e.target !== input) input.click(); });
    input.addEventListener("change", () => emit(input.files));
    ["dragenter", "dragover"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.remove("is-over"); }));
    el.addEventListener("drop", e => emit(e.dataTransfer.files));
  };

  // ── Modal (Promise-based) ───────────────────────────────────
  UV.modal = ({ title = "", body = "", actions = [{ label: "OK", value: true, primary: true }] } = {}) => new Promise(res => {
    const d = document.createElement("dialog");
    d.className = "uv-modal uv";
    d.innerHTML = `<div><h3 class="uv-h3" style="margin-bottom:8px"></h3><div class="uv-muted" style="margin-bottom:22px"></div><div class="uv-row" style="justify-content:flex-end"></div></div>`;
    d.querySelector("h3").textContent = title;
    const b = d.querySelector(".uv-muted"); typeof body === "string" ? (b.textContent = body) : b.appendChild(body);
    actions.forEach(a => {
      const btn = document.createElement("button");
      btn.className = "uv-btn " + (a.primary ? "uv-btn--primary" : a.danger ? "uv-btn--danger" : "uv-btn--ghost");
      btn.textContent = a.label; btn.onclick = () => d.close(JSON.stringify(a.value ?? a.label));
      d.querySelector(".uv-row").appendChild(btn);
    });
    d.addEventListener("click", e => { if (e.target === d) d.close("null"); });
    d.addEventListener("close", () => { let v = null; try { v = JSON.parse(d.returnValue || "null"); } catch {} d.remove(); res(v); });
    document.body.appendChild(d); d.showModal();
  });

  // ── Command palette ─────────────────────────────────────────
  UV.cmdk = (items, { hotkey = "k", placeholder = "Type a command or search…" } = {}) => {
    const d = document.createElement("dialog");
    d.className = "uv-cmdk uv";
    d.innerHTML = `<input placeholder="${placeholder}" aria-label="Command"><ul role="listbox"></ul>`;
    document.body.appendChild(d);
    const input = d.querySelector("input"), ul = d.querySelector("ul");
    let shown = [], active = 0;
    const render = () => {
      const q = input.value.toLowerCase().trim();
      shown = items.filter(i => !q || (i.label + " " + (i.keywords || "")).toLowerCase().includes(q));
      active = Math.min(active, Math.max(0, shown.length - 1));
      ul.innerHTML = shown.length ? "" : `<div class="uv-cmdk__empty">No results</div>`;
      shown.forEach((it, k) => {
        const li = document.createElement("li");
        li.className = k === active ? "is-active" : "";
        li.innerHTML = `<span>${it.icon || "›"}</span><span></span>${it.shortcut ? `<span class="uv-kbd">${it.shortcut}</span>` : ""}`;
        li.children[1].textContent = it.label;
        li.onmouseenter = () => { active = k; [...ul.children].forEach((c, j) => c.classList.toggle("is-active", j === k)); };
        li.onclick = () => run(it);
        ul.appendChild(li);
      });
    };
    const run = it => { d.close(); it.action && it.action(); };
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

  // ── Theme ───────────────────────────────────────────────────
  UV.theme = mode => {
    const r = document.documentElement;
    const next = mode === "toggle" ? (r.dataset.theme === "light" ? "dark" : "light") : mode;
    r.dataset.theme = next;
    try { localStorage.setItem("uv-theme", next); } catch {}
    return next;
  };

  // ── Scroll reveal ───────────────────────────────────────────
  let io;
  UV.reveal = (root = document) => {
    io = io || new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el);
      el.classList.add("is-in");
      if (el.hasAttribute("data-uv-count")) UV.countUp(el, +el.dataset.uvCount, { decimals: +el.dataset.uvDecimals || 0, prefix: el.dataset.uvPrefix || "", suffix: el.dataset.uvSuffix || "" });
      if (el.hasAttribute("data-uv-scramble")) UV.scramble(el, el.dataset.uvText);
      if (el.classList.contains("uv-ring") && el.dataset.value) UV.ring(el, +el.dataset.value);
      if (el.classList.contains("uv-progress") && el.dataset.value) el.firstElementChild.style.setProperty("--v", el.dataset.value + "%");
    }), { threshold: .15, rootMargin: "0px 0px -40px" });
    root.querySelectorAll("[data-uv-stagger]").forEach(p => [...p.children].forEach((c, k) => { if (!c.hasAttribute("data-uv-reveal")) c.setAttribute("data-uv-reveal", p.dataset.uvStagger || ""); c.style.setProperty("--d", k * 70 + "ms"); }));
    root.querySelectorAll("[data-uv-reveal],[data-uv-count],[data-uv-scramble],.uv-ring[data-value],.uv-progress[data-value]").forEach(el => {
      if (el.hasAttribute("data-uv-scramble")) el.dataset.uvText = el.dataset.uvText || el.textContent;
      io.observe(el);
    });
  };

  // ── Auto-init ───────────────────────────────────────────────
  UV.init = (root = document) => {
    root.querySelectorAll("[data-uv]").forEach(el => {
      if (el._uvInit) return; el._uvInit = true;
      el.dataset.uv.split(/\s+/).forEach(b => UV[b] && UV[b](el));
    });
    root.querySelectorAll(".uv-tabs").forEach(el => UV.tabs(el));
    root.querySelectorAll(".uv-otp").forEach(el => !el._uv && (el._uv = 1, UV.otp(el)));
    root.querySelectorAll(".uv-range").forEach(el => !el._uv && (el._uv = 1, UV.range(el)));
    root.querySelectorAll(".uv-drop").forEach(el => !el._uv && (el._uv = 1, UV.drop(el)));
    root.querySelectorAll(".uv-card--spot").forEach(el => !el._uvs && (el._uvs = 1, UV.spotlight(el)));
    root.querySelectorAll("[data-uv-type]").forEach(el => !el._uv && (el._uv = 1, UV.typewriter(el, el.dataset.uvType.split("|"))));
    root.querySelectorAll("[data-uv-confetti]").forEach(el => !el._uvc && (el._uvc = 1, el.addEventListener("click", e => UV.confetti({ x: e.clientX, y: e.clientY }))));
    root.querySelectorAll("[data-uv-copy]").forEach(el => !el._uvp && (el._uvp = 1, el.addEventListener("click", () => UV.copy(el.dataset.uvCopy))));
    root.querySelectorAll("[data-uv-sound]").forEach(el => !el._uvsn && (el._uvsn = 1, el.addEventListener("click", () => UV.sound(el.dataset.uvSound))));
    UV.reveal(root);
  };

  try { const t = localStorage.getItem("uv-theme"); if (t && !document.documentElement.dataset.theme) document.documentElement.dataset.theme = t; } catch {}
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => UV.init());
  else UV.init();
  global.UV = UV;
})(window);
