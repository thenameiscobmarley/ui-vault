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
    }), { threshold: .15, rootMargin: "0px 0px -40px" });
    root.querySelectorAll("[data-uv-stagger]").forEach(p => [...p.children].forEach((c, k) => { if (!c.hasAttribute("data-uv-reveal")) c.setAttribute("data-uv-reveal", p.dataset.uvStagger || ""); c.style.setProperty("--d", (k % 8) * 70 + "ms"); }));
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

  UV.use("motion", root => {
    UV.scroll(root);
    root.querySelectorAll("[data-uv-steps]").forEach(el => UV.once(el, "steps") && UV.steps(el));
    root.querySelectorAll(".uv-card--spot").forEach(el => UV.once(el, "spot") && UV.spotlight(el));
    root.querySelectorAll("[data-uv-type]").forEach(el => UV.once(el, "type") && UV.typewriter(el, el.dataset.uvType.split("|")));
    UV.reveal(root);
  });
})(window.UV);
