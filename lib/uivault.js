/*! UI Vault 3.1.0 — full bundle (core, motion, feedback, forms, fx, waterfall). MIT */
/*! UI Vault 3 · core.js — the UV namespace, module registry, theming, auto-init. Load first. MIT
 *  Every other module calls UV.use(name, initFn). initFn(root) runs on DOMContentLoaded and on UV.init(root).
 */
(function (global) {
  "use strict";
  if (global.UV && global.UV._core) return;
  const UV = global.UV = Object.assign(global.UV || {}, { version: "3.0.0", _core: true, modules: [] });
  const hooks = [];
  let ready = false;

  UV.reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  UV.raf = requestAnimationFrame.bind(global);
  UV.$ = (s, r = document) => r.querySelector(s);
  UV.$$ = (s, r = document) => [...r.querySelectorAll(s)];
  UV.local = (e, el) => { const r = el.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top, w: r.width, h: r.height }; };
  UV.once = (el, key) => { if (el["_uv_" + key]) return false; el["_uv_" + key] = true; return true; };
  UV.css = (id, text) => { if (document.getElementById(id)) return; const s = document.createElement("style"); s.id = id; s.textContent = text; document.head.appendChild(s); };

  /** Register a module. fn(root) wires up everything the module owns inside root. */
  UV.use = (name, fn) => {
    UV.modules.push(name);
    if (fn) { hooks.push(fn); if (ready) fn(document); }
  };

  /** Wire every module inside root (call again after injecting HTML). */
  UV.init = (root = document) => {
    root.querySelectorAll("[data-uv]").forEach(el => {
      if (!UV.once(el, "behaviors")) return;
      el.dataset.uv.split(/\s+/).forEach(b => typeof UV[b] === "function" && UV[b](el));
    });
    hooks.forEach(fn => { try { fn(root); } catch (e) { console.warn("[UV]", e); } });
    return UV;
  };

  /** Light/dark mode for the default theme: "dark" | "light" | "toggle". */
  UV.theme = mode => {
    const r = document.documentElement;
    const next = mode === "toggle" ? (r.dataset.theme === "dark" ? "light" : "dark") : mode;
    r.dataset.theme = next;
    try { localStorage.setItem("uv-theme", next); } catch {}
    return next;
  };

  /** Design theme (skin) for any element: UV.skin("neon") for the page, UV.skin("brutal", el) for one section. */
  UV.skin = (name, el = document.documentElement) => {
    if (name) el.dataset.uvTheme = name; else el.removeAttribute("data-uv-theme");
    if (el === document.documentElement) { try { localStorage.setItem("uv-skin", name || ""); } catch {} }
    return name;
  };
  UV.skins = ["editorial", "brutal", "neon", "glass", "terminal", "soft", "retro", "swiss", "y2k", "mono", "sketch", "luxe"];

  try { const t = localStorage.getItem("uv-theme"); if (t && !document.documentElement.dataset.theme) document.documentElement.dataset.theme = t; } catch {}

  const boot = () => { ready = true; UV.init(document); };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot); else setTimeout(boot);
})(window);

/*! UI Vault 3 · motion.js — countUp, typewriter, scramble, reveal, tilt, magnetic, spotlight, ripple, parallax, ring. Needs core.js. MIT */
(function (UV) {
  "use strict";
  const { raf } = UV;

  UV.countUp = (el, to, { duration = 1400, decimals = 0, prefix = "", suffix = "", from = 0 } = {}) => {
    const fmt = v => prefix + v.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals }) + suffix;
    if (UV.reduce) { el.textContent = fmt(to); return; }
    const t0 = performance.now();
    (function step(now) { const p = Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 4); el.textContent = fmt(from + (to - from) * e); if (p < 1) raf(step); })(t0);
  };

  UV.typewriter = (el, words, { speed = 70, pause = 1400, loop = true } = {}) => {
    let w = 0, i = 0, del = false, stopped = false;
    UV.css("uv-caret-css", ".uv-caret::after{content:'';display:inline-block;width:2px;height:1em;margin-left:3px;vertical-align:-.12em;background:currentColor;animation:uv-blink .9s step-end infinite}@keyframes uv-blink{50%{opacity:0}}");
    el.classList.add("uv-caret");
    (function tick() {
      if (stopped) return;
      const word = words[w]; el.textContent = word.slice(0, i);
      if (!del && i < word.length) { i++; setTimeout(tick, speed); }
      else if (!del) { if (!loop && w === words.length - 1) return; del = true; setTimeout(tick, pause); }
      else if (i > 0) { i--; setTimeout(tick, speed / 2); }
      else { del = false; w = (w + 1) % words.length; setTimeout(tick, speed * 3); }
    })();
    return () => { stopped = true; };
  };

  UV.scramble = (el, text = el.textContent, { duration = 900, chars = "!<>-_\\/[]{}—=+*^?#ABCDEFX01" } = {}) => {
    if (UV.reduce) { el.textContent = text; return; }
    const t0 = performance.now();
    (function step(now) {
      const p = Math.min(1, (now - t0) / duration);
      el.textContent = [...text].map((ch, k) => ch === " " || k / text.length < p ? ch : chars[(Math.random() * chars.length) | 0]).join("");
      if (p < 1) raf(step); else el.textContent = text;
    })(t0);
  };

  UV.spotlight = el => el.addEventListener("pointermove", e => { const p = UV.local(e, el); el.style.setProperty("--x", p.x + "px"); el.style.setProperty("--y", p.y + "px"); });
  UV.tilt = (el, { max = 12 } = {}) => {
    if (UV.reduce) return;
    el.classList.add("uv-tilt");
    if (!el.querySelector(":scope > .uv-glare")) { const g = document.createElement("i"); g.className = "uv-glare"; el.appendChild(g); }
    el.addEventListener("pointermove", e => {
      const p = UV.local(e, el), px = p.x / p.w, py = p.y / p.h;
      el.style.setProperty("--ry", (px - .5) * max * 2 + "deg"); el.style.setProperty("--rx", (.5 - py) * max * 2 + "deg");
      el.style.setProperty("--gx", px * 100 + "%"); el.style.setProperty("--gy", py * 100 + "%");
    });
    el.addEventListener("pointerleave", () => { el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); });
  };
  UV.magnetic = (el, { strength = .35 } = {}) => {
    if (UV.reduce) return;
    el.style.transition = "transform .3s cubic-bezier(.2,.8,.2,1)";
    el.addEventListener("pointermove", e => { const p = UV.local(e, el); el.style.transform = `translate(${(p.x - p.w / 2) * strength}px,${(p.y - p.h / 2) * strength}px)`; });
    el.addEventListener("pointerleave", () => { el.style.transform = ""; });
  };
  UV.ripple = el => el.addEventListener("pointerdown", e => {
    const p = UV.local(e, el), d = Math.max(p.w, p.h), i = document.createElement("span");
    i.className = "uv-ripple"; i.style.cssText = `width:${d}px;height:${d}px;left:${p.x - d / 2}px;top:${p.y - d / 2}px`;
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    el.style.overflow = "hidden"; el.appendChild(i); setTimeout(() => i.remove(), 650);
  });
  UV.parallax = el => {
    if (UV.reduce) return;
    const layers = el.querySelectorAll("[data-depth]");
    layers.forEach(l => { l.style.transition = "transform .25s ease-out"; });
    el.addEventListener("pointermove", e => { const p = UV.local(e, el), dx = p.x / p.w - .5, dy = p.y / p.h - .5; layers.forEach(l => { const d = +l.dataset.depth; l.style.transform = `translate(${dx * d * 40}px,${dy * d * 40}px)`; }); });
    el.addEventListener("pointerleave", () => layers.forEach(l => { l.style.transform = ""; }));
  };
  UV.ring = (el, value, { duration = 1200 } = {}) => {
    const from = +getComputedStyle(el).getPropertyValue("--v") || 0, t0 = performance.now();
    (function step(now) { const p = UV.reduce ? 1 : Math.min(1, (now - t0) / duration), e = 1 - Math.pow(1 - p, 3); el.style.setProperty("--v", from + (value - from) * e); if (p < 1) raf(step); })(t0);
  };

  let io;
  UV.reveal = (root = document) => {
    io = io || new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target; io.unobserve(el); el.classList.add("is-in");
      if (el.hasAttribute("data-uv-count")) UV.countUp(el, +el.dataset.uvCount, { decimals: +el.dataset.uvDecimals || 0, prefix: el.dataset.uvPrefix || "", suffix: el.dataset.uvSuffix || "" });
      if (el.hasAttribute("data-uv-scramble")) UV.scramble(el, el.dataset.uvText);
      if (el.classList.contains("uv-ring") && el.dataset.value) UV.ring(el, +el.dataset.value);
      if (el.classList.contains("uv-progress") && el.dataset.value) el.firstElementChild.style.setProperty("--v", el.dataset.value + "%");
    }), { threshold: 0, rootMargin: "0px 0px 18% 0px" });   // start revealing just BEFORE elements scroll in
    root.querySelectorAll("[data-uv-stagger]").forEach(p => [...p.children].forEach((c, k) => { if (!c.hasAttribute("data-uv-reveal")) c.setAttribute("data-uv-reveal", p.dataset.uvStagger || ""); c.style.setProperty("--d", (k % 6) * 40 + "ms"); }));
    root.querySelectorAll("[data-uv-reveal],[data-uv-count],[data-uv-scramble],.uv-ring[data-value],.uv-progress[data-value],.uv-fx-highlight").forEach(el => {
      if (!UV.once(el, "reveal")) return;
      if (el.hasAttribute("data-uv-scramble")) el.dataset.uvText = el.dataset.uvText || el.textContent;
      io.observe(el);
    });
  };

  // ── Scroll-linked motion ─────────────────────────────────────
  // data-uv-scrub        → sets --p from 0 (element enters bottom) to 1 (leaves top); style anything with var(--p)
  // data-uv-scrub="center" → 0 at entering, 1 when its centre reaches the viewport centre
  // data-uv-speed="0.3"  → scroll parallax (translateY); negative values move against the scroll
  // .uv-scrollbar        → page progress bar (uses --uv-page on <html>)
  const de_smooth = () => document.documentElement.hasAttribute("data-uv-smooth");
  const live = new Set();
  let ticking = false;
  const vis = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target)), { rootMargin: "20% 0px" });
  function frame() {
    ticking = false;
    const vh = innerHeight, de = document.documentElement;
    de.style.setProperty("--uv-page", (scrollY / Math.max(1, de.scrollHeight - vh)).toFixed(4));
    for (const el of live) {
      const r = el.getBoundingClientRect();
      if (el.hasAttribute("data-uv-scrub")) {
        const center = el.dataset.uvScrub === "center";
        const p = center ? (vh - r.top) / (vh / 2 + r.height / 2) : (vh - r.top) / (vh + r.height);
        el.style.setProperty("--p", Math.min(1, Math.max(0, p)).toFixed(4));
      }
      if (el.dataset.uvSpeed) el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.uvSpeed)).toFixed(1)}px, 0)`;
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; raf(frame); } };
  UV.scroll = (root = document) => {
    if (UV.reduce) return;
    root.querySelectorAll("[data-uv-scrub],[data-uv-speed]").forEach(el => UV.once(el, "scroll") && vis.observe(el));
    if (!UV._scrollBound) { UV._scrollBound = true; addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); }
    onScroll();
  };
  UV.scrollbar = () => { if (document.querySelector(".uv-scrollbar")) return; const b = document.createElement("div"); b.className = "uv-scrollbar"; document.body.prepend(b); UV.scroll(); };

  /** Scrollytelling: children with [data-step] fire as they cross the viewport centre.
   *  UV.steps(container, (stepEl, index) => …); also sets container.dataset.step and dispatches "uv-step". */
  UV.steps = (el, cb) => {
    const steps = [...el.querySelectorAll("[data-step]")];
    const io2 = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const i = steps.indexOf(e.target);
      steps.forEach((s, k) => s.classList.toggle("is-active", k === i));
      el.dataset.step = e.target.dataset.step;
      cb && cb(e.target, i);
      el.dispatchEvent(new CustomEvent("uv-step", { detail: { index: i, step: e.target.dataset.step } }));
    }), { rootMargin: "-50% 0px -50% 0px" });
    steps.forEach(s => io2.observe(s));
    return () => io2.disconnect();
  };

  /** Inertial smooth scrolling for mouse wheels. Leaves inner scrollable areas, dialogs, zoom and touch alone.
   *  Turn on with <html data-uv-smooth> or UV.smoothScroll({ ease }). Off with prefers-reduced-motion. */
  UV.smoothScroll = ({ ease = .11, multiplier = 1 } = {}) => {
    if (UV.reduce || UV._smooth) return; UV._smooth = true;
    const de = document.documentElement;
    let target = scrollY, current = scrollY, running = false;
    const max = () => de.scrollHeight - innerHeight;
    const innerScroll = (el, dy) => {
      for (; el && el !== document.body && el !== de; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))
          if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    };
    const step = () => {
      current += (target - current) * ease;
      if (Math.abs(target - current) < .5) { current = target; running = false; }
      scrollTo({ top: current, behavior: "instant" });
      if (running) raf(step);
    };
    addEventListener("wheel", e => {
      if (e.ctrlKey || e.defaultPrevented || Math.abs(e.deltaX) > Math.abs(e.deltaY) || document.querySelector("dialog[open]") || innerScroll(e.target, e.deltaY)) return;
      e.preventDefault();
      const d = e.deltaMode === 1 ? e.deltaY * 36 : e.deltaMode === 2 ? e.deltaY * innerHeight : e.deltaY;
      if (!running) target = current = scrollY;
      target = Math.max(0, Math.min(max(), target + d * multiplier));
      if (!running) { running = true; raf(step); }
    }, { passive: false });
    addEventListener("scroll", () => { if (!running) target = current = scrollY; }, { passive: true });
  };

  UV.use("motion", root => {
    if (root === document && de_smooth()) UV.smoothScroll();
    UV.scroll(root);
    root.querySelectorAll("[data-uv-steps]").forEach(el => UV.once(el, "steps") && UV.steps(el));
    root.querySelectorAll(".uv-card--spot").forEach(el => UV.once(el, "spot") && UV.spotlight(el));
    root.querySelectorAll("[data-uv-type]").forEach(el => UV.once(el, "type") && UV.typewriter(el, el.dataset.uvType.split("|")));
    UV.reveal(root);
  });
})(window.UV);

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

/*! UI Vault 3 · forms.js — tabs, otp, range, file drop. Needs core.js. MIT */
(function (UV) {
  "use strict";
  UV.tabs = (el, onChange) => {
    if (!UV.once(el, "tabs")) return el._uvTabsApi;
    el.setAttribute("role", "tablist");
    let ind = el.querySelector(".uv-tabs__ind");
    if (!ind) { ind = document.createElement("span"); ind.className = "uv-tabs__ind"; el.prepend(ind); }
    const tabs = [...el.querySelectorAll(":scope > button")];
    const move = t => { ind.style.width = t.offsetWidth + "px"; ind.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, silent) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", on); x.setAttribute("role", "tab"); x.tabIndex = on ? 0 : -1;
        const panel = x.getAttribute("aria-controls") && document.getElementById(x.getAttribute("aria-controls")); if (panel) panel.hidden = !on; });
      move(t); if (!silent && onChange) onChange(t, tabs.indexOf(t));
      if (!silent) el.dispatchEvent(new CustomEvent("uv-change", { detail: tabs.indexOf(t) }));
    };
    tabs.forEach((t, k) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const n = tabs[(k + d + tabs.length) % tabs.length]; n.focus(); select(n); } });
    });
    const first = tabs.find(t => t.getAttribute("aria-selected") === "true") || tabs[0];
    ind.style.transition = "none"; select(first, true);
    UV.raf(() => UV.raf(() => { ind.style.transition = ""; move(first); }));
    new ResizeObserver(() => { const s = tabs.find(t => t.getAttribute("aria-selected") === "true"); s && move(s); }).observe(el);
    return (el._uvTabsApi = { select: i => select(tabs[i]) });
  };

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

  UV.use("forms", root => {
    root.querySelectorAll(".uv-tabs").forEach(el => UV.tabs(el));
    root.querySelectorAll(".uv-otp").forEach(el => UV.once(el, "otp") && UV.otp(el));
    root.querySelectorAll(".uv-range").forEach(el => UV.once(el, "range") && UV.range(el));
    root.querySelectorAll(".uv-drop").forEach(el => UV.once(el, "drop") && UV.drop(el));
  });
})(window.UV);

/*! UI Vault 3 · fx.js — interactive effects. Needs core.js (pairs with fx.css). MIT
 *  Declarative:  data-uv-fx="matrix starfield particles snow cursor-trail cursor-blob sparkles magnet scramble-hover fireworks gravity spotlight holo"
 *  Imperative:   UV.fx.matrix(el, opts) … every effect returns a stop() function.
 *  Canvas effects size to their element, pause when off-screen and respect prefers-reduced-motion.
 */
(function (UV) {
  "use strict";
  const fx = UV.fx = {};
  const accent = el => getComputedStyle(el).getPropertyValue("--uv-accent").trim() || "#ff4f00";
  const textCol = el => getComputedStyle(el).color;

  /** Mount a full-size canvas inside el and run draw(g, w, h, t) while visible. */
  function canvasFx(el, setup, draw) {
    if (UV.reduce) return () => {};
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    const c = document.createElement("canvas"), g = c.getContext("2d"), dpr = Math.min(devicePixelRatio || 1, 1.5);
    c.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;border-radius:inherit";
    el.prepend(c);
    let w = 0, h = 0, raf = 0, visible = false, state = {};
    const size = () => { w = el.clientWidth; h = el.clientHeight; c.width = w * dpr; c.height = h * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); state = setup(w, h, state) || state; };
    const loop = t => { raf = 0; draw(g, w, h, t, state); if (visible) raf = UV.raf(loop); };
    const ro = new ResizeObserver(size); ro.observe(el); size();
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible && !raf) raf = UV.raf(loop); }); io.observe(el);
    return () => { visible = false; ro.disconnect(); io.disconnect(); c.remove(); };
  }

  fx.matrix = (el, { color, size = 14, chars = "アイウエオカキクケコｱｲｳｴｵ01ΣΔΞ#$%" } = {}) => canvasFx(el,
    (w, h) => ({ cols: Array.from({ length: Math.ceil(w / size) }, () => Math.random() * -h / size), col: color || accent(el), last: 0 }),
    (g, w, h, t, s) => {
      if (t - s.last < 50) return; s.last = t;
      g.fillStyle = "rgba(0,0,0,.08)"; g.globalCompositeOperation = "destination-out"; g.fillRect(0, 0, w, h); g.globalCompositeOperation = "source-over";
      g.fillStyle = s.col; g.font = size + "px monospace";
      s.cols.forEach((y, i) => { g.fillText(chars[(Math.random() * chars.length) | 0], i * size, y * size); s.cols[i] = y * size > h && Math.random() > .975 ? 0 : y + 1; });
    });

  fx.starfield = (el, { count = 160, speed = 1 } = {}) => canvasFx(el,
    (w, h) => ({ stars: Array.from({ length: count }, () => ({ x: Math.random() * w - w / 2, y: Math.random() * h - h / 2, z: Math.random() * w })), col: textCol(el) }),
    (g, w, h, t, s) => {
      g.clearRect(0, 0, w, h); g.fillStyle = s.col;
      for (const p of s.stars) {
        p.z -= 2 * speed; if (p.z <= 1) { p.z = w; p.x = Math.random() * w - w / 2; p.y = Math.random() * h - h / 2; }
        const k = 128 / p.z, x = p.x * k + w / 2, y = p.y * k + h / 2, r = Math.max(.3, (1 - p.z / w) * 2.2);
        g.globalAlpha = 1 - p.z / w; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
      }
      g.globalAlpha = 1;
    });

  fx.particles = (el, { count = 60, link = 110 } = {}) => {
    let mouse = { x: -999, y: -999 };
    el.addEventListener("pointermove", e => { mouse = UV.local(e, el); });
    el.addEventListener("pointerleave", () => { mouse = { x: -999, y: -999 }; });
    return canvasFx(el,
      (w, h) => ({ p: Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5 })), col: textCol(el), acc: accent(el) }),
      (g, w, h, t, s) => {
        g.clearRect(0, 0, w, h);
        const pts = s.p.concat([{ x: mouse.x, y: mouse.y, m: 1 }]);
        for (const p of s.p) { p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > w) p.vx *= -1; if (p.y < 0 || p.y > h) p.vy *= -1; }
        for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < link) { g.strokeStyle = b.m ? s.acc : s.col; g.globalAlpha = (1 - d / link) * (b.m ? .9 : .35); g.beginPath(); g.moveTo(a.x, a.y); g.lineTo(b.x, b.y); g.stroke(); }
        }
        g.globalAlpha = 1; g.fillStyle = s.col; for (const p of s.p) { g.beginPath(); g.arc(p.x, p.y, 1.6, 0, 7); g.fill(); }
      });
  };

  fx.snow = (el, { count = 90 } = {}) => canvasFx(el,
    (w, h) => ({ f: Array.from({ length: count }, () => ({ x: Math.random() * w, y: Math.random() * h, r: .6 + Math.random() * 2.2, s: .3 + Math.random() * .9, o: Math.random() * 6 })), col: textCol(el) }),
    (g, w, h, t, s) => {
      g.clearRect(0, 0, w, h); g.fillStyle = s.col;
      for (const p of s.f) { p.y += p.s; p.x += Math.sin(t / 900 + p.o) * .4; if (p.y > h + 4) { p.y = -4; p.x = Math.random() * w; } g.globalAlpha = .4 + p.r / 4; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    });

  fx["cursor-trail"] = (el, { length = 14 } = {}) => {
    if (UV.reduce) return () => {};
    const dots = Array.from({ length }, (_, i) => { const d = document.createElement("i"); d.style.cssText = `position:fixed;left:0;top:0;width:${10 - i * .5}px;height:${10 - i * .5}px;border-radius:50%;background:${accent(el)};pointer-events:none;z-index:9999;opacity:${1 - i / length};transform:translate(-50%,-50%)`; document.body.appendChild(d); return { d, x: 0, y: 0 }; });
    let mx = -100, my = -100, on = true;
    const mv = e => { mx = e.clientX; my = e.clientY; };
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerleave", () => { mx = my = -100; });
    (function tick() { if (!on) return; let x = mx, y = my; dots.forEach(p => { p.x += (x - p.x) * .45; p.y += (y - p.y) * .45; p.d.style.left = p.x + "px"; p.d.style.top = p.y + "px"; x = p.x; y = p.y; }); UV.raf(tick); })();
    return () => { on = false; dots.forEach(p => p.d.remove()); el.removeEventListener("pointermove", mv); };
  };

  fx["cursor-blob"] = (el, { size = 120 } = {}) => {
    if (UV.reduce) return () => {};
    const b = document.createElement("i");
    b.style.cssText = `position:fixed;left:0;top:0;width:${size}px;height:${size}px;margin:${-size / 2}px 0 0 ${-size / 2}px;border-radius:50%;background:#fff;mix-blend-mode:difference;pointer-events:none;z-index:9999;transform:scale(0);transition:transform .3s cubic-bezier(.3,1.4,.5,1)`;
    document.body.appendChild(b);
    let x = 0, y = 0, tx = 0, ty = 0, on = true;
    el.addEventListener("pointermove", e => { tx = e.clientX; ty = e.clientY; });
    el.addEventListener("pointerenter", () => { b.style.transform = "scale(1)"; });
    el.addEventListener("pointerleave", () => { b.style.transform = "scale(0)"; });
    (function tick() { if (!on) return; x += (tx - x) * .18; y += (ty - y) * .18; b.style.left = x + "px"; b.style.top = y + "px"; UV.raf(tick); })();
    return () => { on = false; b.remove(); };
  };

  fx.sparkles = (el, { rate = 60 } = {}) => {
    if (UV.reduce) return () => {};
    UV.css("uv-sparkle-css", "@keyframes uv-sparkle{0%{transform:translate(-50%,-50%) scale(0) rotate(0)}50%{transform:translate(-50%,-50%) scale(1) rotate(90deg)}100%{transform:translate(-50%,-50%) scale(0) rotate(180deg)}}");
    if (getComputedStyle(el).position === "static") el.style.position = "relative";
    let last = 0;
    const mv = e => {
      const now = performance.now(); if (now - last < rate) return; last = now;
      const p = UV.local(e, el), s = document.createElement("i"), z = 8 + Math.random() * 12;
      s.style.cssText = `position:absolute;left:${p.x + (Math.random() - .5) * 30}px;top:${p.y + (Math.random() - .5) * 30}px;width:${z}px;height:${z}px;pointer-events:none;z-index:5;background:${accent(el)};clip-path:polygon(50% 0,61% 39%,100% 50%,61% 61%,50% 100%,39% 61%,0 50%,39% 39%);animation:uv-sparkle .7s ease forwards`;
      el.appendChild(s); setTimeout(() => s.remove(), 700);
    };
    el.addEventListener("pointermove", mv);
    return () => el.removeEventListener("pointermove", mv);
  };

  /** Letters push away from the cursor. */
  fx.magnet = (el, { radius = 90, force = 26 } = {}) => {
    if (UV.reduce) return () => {};
    const spans = fx.split(el);
    spans.forEach(s => { s.style.transition = "transform .25s cubic-bezier(.2,.8,.2,1)"; s.style.display = "inline-block"; });
    const mv = e => spans.forEach(s => {
      const r = s.getBoundingClientRect(), dx = r.left + r.width / 2 - e.clientX, dy = r.top + r.height / 2 - e.clientY, d = Math.hypot(dx, dy);
      const k = Math.max(0, 1 - d / radius) * force; s.style.transform = k ? `translate(${dx / (d || 1) * k}px,${dy / (d || 1) * k}px)` : "";
    });
    el.addEventListener("pointermove", mv);
    el.addEventListener("pointerleave", () => spans.forEach(s => { s.style.transform = ""; }));
    return () => el.removeEventListener("pointermove", mv);
  };

  fx["scramble-hover"] = el => { const t = el.textContent; const h = () => UV.scramble ? UV.scramble(el, t, { duration: 500 }) : 0; el.addEventListener("mouseenter", h); return () => el.removeEventListener("mouseenter", h); };

  /** Click anywhere inside el for a firework burst. */
  fx.fireworks = el => {
    const h = e => { if (UV.confetti) UV.confetti({ x: e.clientX, y: e.clientY, count: 70, shapes: "circle", spread: .8 }); };
    el.addEventListener("click", h); return () => el.removeEventListener("click", h);
  };

  /** Click: the element's letters fall with gravity, then reassemble. */
  fx.gravity = el => {
    const spans = fx.split(el); spans.forEach(s => { s.style.display = "inline-block"; });
    const h = () => {
      if (UV.reduce) return;
      spans.forEach(s => { const vx = (Math.random() - .5) * 6; let vy = -Math.random() * 6, x = 0, y = 0, r = 0, vr = (Math.random() - .5) * 20, t = 0;
        (function f() { vy += .5; x += vx; y += vy; r += vr; s.style.transform = `translate(${x}px,${y}px) rotate(${r}deg)`; if (++t < 70) UV.raf(f); else { s.style.transition = "transform .6s cubic-bezier(.3,1.4,.5,1)"; s.style.transform = ""; setTimeout(() => s.style.transition = "", 600); } })(); });
    };
    el.addEventListener("click", h); return () => el.removeEventListener("click", h);
  };

  fx.spotlight = el => { const h = e => { const p = UV.local(e, el); el.style.setProperty("--x", p.x + "px"); el.style.setProperty("--y", p.y + "px"); }; el.addEventListener("pointermove", h); return () => el.removeEventListener("pointermove", h); };
  fx.holo = el => { const h = e => { const p = UV.local(e, el); el.style.setProperty("--gx", (p.x / p.w) * 100 + "%"); }; el.addEventListener("pointermove", h); return () => el.removeEventListener("pointermove", h); };

  /** Split text into <span style="--i:n"> per character (idempotent). */
  fx.split = el => {
    if (el._uvSplit) return el._uvSplit;
    const text = el.textContent; el.setAttribute("aria-label", text); el.textContent = "";
    return (el._uvSplit = [...text].map((ch, i) => { const s = document.createElement("span"); s.textContent = ch === " " ? " " : ch; s.style.setProperty("--i", i); s.setAttribute("aria-hidden", "true"); el.appendChild(s); return s; }));
  };

  fx.list = Object.keys(fx).filter(k => k !== "split" && k !== "list");

  UV.use("fx", root => {
    root.querySelectorAll(".uv-fx-glitch:not([data-text])").forEach(el => el.dataset.text = el.textContent);
    root.querySelectorAll(".uv-fx-wave, .uv-fx-bounce-in").forEach(el => fx.split(el));
    root.querySelectorAll(".uv-fx-spotlight").forEach(el => UV.once(el, "fxspot") && fx.spotlight(el));
    root.querySelectorAll(".uv-fx-holo-card").forEach(el => UV.once(el, "fxholo") && fx.holo(el));
    root.querySelectorAll("[data-uv-fx]").forEach(el => {
      if (!UV.once(el, "fx")) return;
      el.dataset.uvFx.split(/\s+/).forEach(name => fx[name] && fx[name](el));
    });
  });
})(window.UV);

/*! UI Vault 3 · waterfall.js — a soft, filmic waterfall background (WebGL, procedural, no video). MIT
 *  UVWaterfall.mount(el?, { scale, fps, tint })  → stop()        (also UV.fx.waterfall when UV is loaded)
 *  Renders at a fraction of screen resolution and is upscaled by the browser — that is what makes it look
 *  like a blurred, out-of-focus video while staying cheap on integrated GPUs. Pauses when hidden/off-screen.
 */
(function (global) {
  "use strict";
  const FS = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform vec2 R; uniform float t;
float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / R; float asp = R.x / R.y;
  vec2 p = vec2((uv.x - .5) * asp, uv.y);
  // wet rock + moss
  float rock = fbm(p * vec2(2.6, 3.4));
  vec3 col = mix(vec3(.04, .06, .055), vec3(.17, .21, .19), rock);
  col = mix(col, vec3(.11, .23, .12), smoothstep(.45, .78, fbm(p * 4.6 + 3.)) * .75);
  col += vec3(.03, .05, .06) * fbm(vec2(p.x * 7., p.y * 2. - t * .25));
  // the falls: a wobbling column, wider towards the pool
  float x = p.x + .035 * sin(uv.y * 3.1 + .4) + .015 * sin(uv.y * 9. + t * .6);
  float w = .22 + .08 * (1. - uv.y) + .02 * sin(uv.y * 5. + t * .45);
  float edge = (fbm(vec2(uv.y * 3.5 - t * .9, 4.)) - .5) * .12;
  float m = smoothstep(w + edge, w + edge - .09, abs(x));
  float s1 = fbm(vec2(x * 16., p.y * 1.1 + t * 1.5));
  float s2 = fbm(vec2(x * 31. + 5., p.y * 1.9 + t * 2.3));
  float streak = pow(clamp(s1 * .62 + s2 * .5, 0., 1.), 2.1);
  vec3 water = mix(vec3(.5, .68, .74), vec3(.97, .99, 1.), streak);
  col = mix(col, water, m * (.7 + .3 * streak));
  // spray at the edges of the falls
  col = mix(col, vec3(.85, .92, .94), smoothstep(.08, 0., abs(abs(x) - w)) * .25 * fbm(vec2(x * 10., p.y * 4. + t)));
  // plunge pool + foam
  float pool = smoothstep(.27, .04, uv.y);
  float foam = fbm(vec2(p.x * 5.5 + sin(t * .2), p.y * 7. - t * .7));
  vec3 poolc = mix(vec3(.12, .27, .29), vec3(.9, .95, .96), smoothstep(.42, .8, foam) * (.35 + .65 * smoothstep(.6, 0., abs(p.x))));
  col = mix(col, poolc, pool);
  // rising mist
  float mist = fbm(vec2(p.x * 1.8 + t * .04, p.y * 2.4 - t * .22));
  col = mix(col, vec3(.88, .94, .95), mist * smoothstep(.62, 0., uv.y) * .8);
  // canopy at the top corners
  float leaf = fbm(p * 6. + vec2(t * .02, 0.));
  col = mix(col, vec3(.04, .11, .05), smoothstep(.6, .95, uv.y) * smoothstep(.2, .7, abs(p.x)) * smoothstep(.38, .62, leaf) * .9);
  // daylight from above, vignette, grade
  col += vec3(.16, .19, .15) * smoothstep(.35, 1., uv.y) * max(0., 1. - abs(p.x) * .9) * .55;
  col *= .78 + .38 * (1. - length((uv - .5) * vec2(1., 1.25)));
  gl_FragColor = vec4(pow(col, vec3(.95)), 1.);
}`;

  function mount(host = document.body, { scale = .2, fps = 30, maxW = 440, tint = true } = {}) {
    const fixed = host === document.body;
    const c = document.createElement("canvas");
    c.className = "uv-waterfall";
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = (fixed ? "position:fixed;" : "position:absolute;") + "inset:0;width:100%;height:100%;z-index:-3;pointer-events:none;display:block;";
    host.prepend(c);
    let veil;
    if (tint) {
      veil = document.createElement("div");
      veil.className = "uv-waterfall-veil";
      veil.setAttribute("aria-hidden", "true");
      veil.style.cssText = (fixed ? "position:fixed;" : "position:absolute;") + "inset:0;z-index:-2;pointer-events:none;";
      c.after(veil);
    }
    const opts = { antialias: false, depth: false, alpha: false, powerPreference: "low-power" };
    const forced2d = /[?#&]wf=2d/.test(location.href);
    const gl = !forced2d && (c.getContext("webgl", opts) || c.getContext("experimental-webgl", opts));
    let pr = null;
    if (gl) {
      const sh = (type, src) => { const x = gl.createShader(type); gl.shaderSource(x, src); gl.compileShader(x); return gl.getShaderParameter(x, gl.COMPILE_STATUS) ? x : null; };
      const vs = sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }"), fs = sh(gl.FRAGMENT_SHADER, FS);
      if (vs && fs) {
        pr = gl.createProgram(); gl.attachShader(pr, vs); gl.attachShader(pr, fs);
        gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr);
        if (!gl.getProgramParameter(pr, gl.LINK_STATUS)) pr = null;
      }
    }
    if (!gl || !pr) return mount2d(c, veil, fixed, host, { fps: Math.min(fps, 12) });   // no WebGL → software fallback
    gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "R"), uT = gl.getUniformLocation(pr, "t");
    const size = () => {
      const w = Math.min(maxW, Math.max(160, Math.round(c.clientWidth * scale))), h = Math.max(90, Math.round(w * c.clientHeight / Math.max(1, c.clientWidth)));
      c.width = w; c.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uR, w, h);
    };
    size(); addEventListener("resize", size);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, t0 = performance.now(), on = true, visible = true;
    const draw = now => { gl.uniform1f(uT, (now - t0) / 1000 + 20); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const loop = now => {
      raf = 0; if (!on) return;
      if (now - last >= 1000 / fps) { last = now; draw(now); }
      if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && on) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", kick);
    if (!fixed) new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(host);
    reduce ? draw(t0 + 4000) : kick();
    return () => { on = false; c.remove(); veil && veil.remove(); removeEventListener("resize", size); };
  }

  /** Canvas 2D fallback for browsers without WebGL: same scene, ~120px wide, upscaled (naturally soft). */
  function mount2d(c, veil, fixed, host, { fps = 12 } = {}) {
    const g = c.getContext("2d");
    const H = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
    const N = (x, y) => { const ix = Math.floor(x), iy = Math.floor(y); let fx = x - ix, fy = y - iy; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
      const a = H(ix, iy), b = H(ix + 1, iy), cc = H(ix, iy + 1), d = H(ix + 1, iy + 1); return a + (b - a) * fx + (cc - a) * fy + (a - b - cc + d) * fx * fy; };
    const F = (x, y) => { let v = 0, a = .5; for (let i = 0; i < 4; i++) { v += a * N(x, y); x = x * 2.03 + 1.7; y = y * 2.03 + 9.2; a *= .5; } return v; };
    const mix = (a, b, t) => a + (b - a) * t, sm = (e0, e1, x) => { const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0))); return t * t * (3 - 2 * t); };
    let w = 0, h = 0, img;
    const size = () => { w = 120; h = Math.max(40, Math.round(w * c.clientHeight / Math.max(1, c.clientWidth))); c.width = w; c.height = h; img = g.createImageData(w, h); };
    size(); addEventListener("resize", size);
    const draw = t => {
      const d = img.data, asp = w / h;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
        const u = i / w, v = 1 - j / h, px = (u - .5) * asp;
        const rock = F(px * 2.6, v * 3.4);
        let r = mix(.04, .17, rock), gg = mix(.06, .21, rock), b = mix(.055, .19, rock);
        const moss = sm(.45, .78, F(px * 4.6 + 3, v * 4.6 + 3)) * .75; r = mix(r, .11, moss); gg = mix(gg, .23, moss); b = mix(b, .12, moss);
        const x = px + .035 * Math.sin(v * 3.1 + .4), wd = .22 + .08 * (1 - v), m = sm(wd + .02, wd - .07, Math.abs(x));
        const st = Math.pow(Math.min(1, F(x * 16, v * 1.1 + t * 1.5) * .62 + F(x * 31 + 5, v * 1.9 + t * 2.3) * .5), 2.1), k = m * (.7 + .3 * st);
        r = mix(r, mix(.5, .97, st), k); gg = mix(gg, mix(.68, .99, st), k); b = mix(b, mix(.74, 1, st), k);
        const pool = sm(.27, .04, v), foam = sm(.42, .8, F(px * 5.5, v * 7 - t * .7)) * (.35 + .65 * sm(.6, 0, Math.abs(px)));
        r = mix(r, mix(.12, .9, foam), pool); gg = mix(gg, mix(.27, .95, foam), pool); b = mix(b, mix(.29, .96, foam), pool);
        const mist = F(px * 1.8 + t * .04, v * 2.4 - t * .22) * sm(.62, 0, v) * .8; r = mix(r, .88, mist); gg = mix(gg, .94, mist); b = mix(b, .95, mist);
        const lit = .16 * sm(.35, 1, v) * Math.max(0, 1 - Math.abs(px) * .9) * .55, vig = .78 + .38 * (1 - Math.hypot(u - .5, (v - .5) * 1.25));
        const o = (j * w + i) * 4; d[o] = (r + lit) * vig * 255; d[o + 1] = (gg + lit * 1.2) * vig * 255; d[o + 2] = (b + lit * .9) * vig * 255; d[o + 3] = 255;
      }
      g.putImageData(img, 0, 0);
    };
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let on = true, last = 0, raf = 0, visible = true; const t0 = performance.now();
    const loop = now => { raf = 0; if (!on) return; if (now - last >= 1000 / fps) { last = now; draw((now - t0) / 1000 + 20); } if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop); };
    const kick = () => { if (!raf && on) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", kick);
    if (!fixed) new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(host);
    reduce ? draw(24) : kick();
    c.dataset.renderer = "2d";
    return () => { on = false; c.remove(); veil && veil.remove(); removeEventListener("resize", size); };
  }

  global.UVWaterfall = { mount };
  if (global.UV) { global.UV.fx = global.UV.fx || {}; global.UV.fx.waterfall = (el, o) => mount(el, o); }
})(window);
