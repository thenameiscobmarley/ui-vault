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
