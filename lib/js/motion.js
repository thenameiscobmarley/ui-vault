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
  // data-uv-scrub="pin"  → for a tall .uv-pin section: 0 when its top hits the viewport top, 1 when its bottom leaves
  //                         (its .uv-pin__stage stays stuck on screen meanwhile — scroll-scrubbed scenes)
  // data-uv-scrub="page" → whole-page progress 0…1 (put it on a small fixed element, e.g. a backdrop or a gauge)
  // data-uv-velocity     → sets --v (-1…1) from how fast the page is scrolling, eased back to 0 (skews, stretches)
  // data-uv-speed="0.3"  → scroll parallax (translateY); negative values move against the scroll
  // .uv-scrollbar        → page progress bar (uses --uv-page on <html>)
  const de_smooth = () => document.documentElement.hasAttribute("data-uv-smooth");
  const bars = document.getElementsByClassName("uv-scrollbar");   // live collection
  const live = new Set();
  let ticking = false;
  const vis = new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? live.add(e.target) : live.delete(e.target)), { rootMargin: "20% 0px" });
  function frame() {
    ticking = false;
    const vh = innerHeight, de = document.documentElement;
    // write the page progress ONLY on progress bars — setting an inherited var on <html> restyles the whole page every frame
    if (bars.length) { const pg = (scrollY / Math.max(1, de.scrollHeight - vh)).toFixed(4); for (const b of bars) b.style.setProperty("--uv-page", pg); }
    // read every rect first, then write — interleaving reads and writes forces a layout per element
    const items = [...live].map(el => [el, el.getBoundingClientRect()]);
    const now = performance.now(), dy = scrollY - lastY, dt = Math.max(8, now - lastT); lastY = scrollY; lastT = now;
    vel += (Math.max(-1, Math.min(1, dy / dt / 4)) - vel) * .35;
    for (const [el, r] of items) {
      if (el.hasAttribute("data-uv-scrub")) {
        const m = el.dataset.uvScrub;
        const p = m === "page" ? scrollY / Math.max(1, de.scrollHeight - vh) : m === "pin" ? -r.top / Math.max(1, r.height - vh) : m === "center" ? (vh - r.top) / (vh / 2 + r.height / 2) : (vh - r.top) / (vh + r.height);
        const v = Math.min(1, Math.max(0, p)), t = v.toFixed(4);
        if (el._uvP !== t) { el._uvP = t; el.style.setProperty("--p", t); if (el._uvScrub) el._uvScrub.forEach(f => f(v, el)); }
      }
      if (el.hasAttribute("data-uv-velocity")) el.style.setProperty("--v", vel.toFixed(3));
      if (el.dataset.uvSpeed) el.style.transform = `translate3d(0, ${((r.top + r.height / 2 - vh / 2) * -parseFloat(el.dataset.uvSpeed)).toFixed(1)}px, 0)`;
    }
  }
  let lastY = scrollY, lastT = performance.now(), vel = 0;
  const onScroll = () => { if (!ticking) { ticking = true; raf(frame); } };
  // keep easing --v back to rest for a moment after the scrolling stops
  const settle = () => { if (Math.abs(vel) > .002) { onScroll(); setTimeout(settle, 16); } else if (vel) { vel = 0; onScroll(); } };
  addEventListener("scroll", () => { clearTimeout(UV._velT); UV._velT = setTimeout(settle, 40); }, { passive: true });
  UV.scroll = (root = document) => {
    if (UV.reduce) return;
    root.querySelectorAll("[data-uv-scrub],[data-uv-speed],[data-uv-velocity]").forEach(el => UV.once(el, "scroll") && vis.observe(el));
    if (!UV._scrollBound) { UV._scrollBound = true; addEventListener("scroll", onScroll, { passive: true }); addEventListener("resize", onScroll); }
    onScroll();
  };
  /** Scroll progress in JS: UV.scrub(el, p => …, "pin"|"center"|"page"|"") — same 0…1 value the CSS gets as --p.
   *  Use it for numbers, canvas frames or anything CSS can't do. Returns an off() function. */
  UV.scrub = (el, cb, mode) => {
    if (mode != null || !el.hasAttribute("data-uv-scrub")) el.setAttribute("data-uv-scrub", mode || "");
    (el._uvScrub = el._uvScrub || new Set()).add(cb); el._uvP = null;
    if (UV.reduce) { cb(1, el); return () => {}; }
    UV.scroll(el.parentNode || document);
    return () => el._uvScrub.delete(cb);
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
    let target = scrollY, current = scrollY, running = false, last = 0;
    const max = () => de.scrollHeight - innerHeight;
    const innerScroll = (el, dy) => {
      for (; el && el !== document.body && el !== de; el = el.parentElement) {
        if (el.scrollHeight > el.clientHeight + 1 && /(auto|scroll)/.test(getComputedStyle(el).overflowY))
          if (dy > 0 ? el.scrollTop + el.clientHeight < el.scrollHeight - 1 : el.scrollTop > 0) return true;
      }
      return false;
    };
    const step = now => {
      const dt = Math.min(64, now - (last || now - 16.7)); last = now;
      current += (target - current) * (1 - Math.pow(1 - ease, dt / 16.7));   // same feel at 60, 120 or 144 Hz
      if (Math.abs(target - current) < .5) { current = target; running = false; last = 0; }
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
