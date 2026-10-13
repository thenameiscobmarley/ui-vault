/*! UI Vault @VERSION@ · layers.js — stackable effect layers (glow, shadow, border, backdrop, fill, shape, text, hover,
 *  press, entrance, idle, every uv-fx effect, page backgrounds/cursor/scroll) on any element type or a single element.
 *  UV.layers.apply({ btn: { glow: { o: "neon", c: "accent", s: 18 }, hover: { o: "jelly" } }, page: { canvas: { o: "starfield" } } })
 *  UV.layers.css(stack) → the static CSS (for exporting). Needs core.js; uses motion/feedback/fx when present. MIT */
(function (UV) {
  "use strict";
  const DEFS = /*@DEFS@*/null;
  const KIND = Object.fromEntries([...DEFS.kinds, ...DEFS.pageKinds].map(k => [k.key, k]));
  const TYPE = Object.fromEntries(DEFS.types.map(t => [t.key, t]));
  const UI = ".uvp, .uvp *, .uvp-btn, .uvi, .uvi *";            // the editors themselves never get layered
  const NO_PSEUDO = /^(input|img|range|switch|check|page)$/;     // replaced elements / composites: no ::before/::after rings
  const opt = (kind, name) => (KIND[kind] && KIND[kind].options.find(o => o.name === name)) || null;

  // ── value helpers ────────────────────────────────────────────────────────
  const TOK = { accent: "var(--uv-accent)", "accent-2": "var(--uv-accent-2)", text: "var(--uv-text)", white: "#ffffff", black: "#000000",
    success: "var(--uv-success)", warn: "var(--uv-warn)", danger: "var(--uv-danger)", info: "var(--uv-info)" };
  const col = v => TOK[v] || v || "var(--uv-accent)";
  const num = (expr, s) => typeof expr === "number" ? expr : Function("s", "return " + String(expr))(s);
  function val(str, p) {
    const c = col(p.c), c2 = col(p.c2 || "accent-2");
    return String(str)
      .replace(/%A2/g, "var(--uv-accent-2)").replace(/%A/g, "var(--uv-accent)").replace(/%T/g, "var(--uv-text)").replace(/%BG/g, "var(--uv-bg)").replace(/%S/g, "var(--uv-surface)")
      .replace(/on\(c\)/g, p.c === "white" ? "#111111" : (!p.c || p.c === "accent") ? "var(--uv-on-accent, #fff)" : "#ffffff")
      .replace(/mix\(([^,]+),([^,]+),(\d+)\)/g, (_, a, b, n) => `color-mix(in srgb, ${a.trim()}, ${b.trim()} ${n}%)`)
      .replace(/\bc2@(\d+)/g, (_, n) => `color-mix(in srgb, ${c2} ${n}%, transparent)`)
      .replace(/\bc@(\d+)/g, (_, n) => `color-mix(in srgb, ${c} ${n}%, transparent)`)
      .replace(/\bc2\b/g, c2).replace(/\bc\b/g, c);
  }
  const drops = (list, p) => (list || []).map(([x, y, b, cc]) => `drop-shadow(${num(x, p.s)}px ${num(y, p.s)}px ${Math.max(0, num(b, p.s))}px ${val(cc, p)})`);
  const RADIUS = { pill: "999px", blob: "30% 70% 70% 30% / 30% 30% 70% 70%" };
  const CLIP = { notch: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
    cut: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" };
  const FONT = { mono: "var(--uv-mono)", serif: "var(--uv-serif)", display: "var(--uv-font-head)" };
  const RING = (kind, p) => ({
    gradient: `linear-gradient(135deg, ${col(p.c)}, ${col(p.c2 || "accent-2")})`,
    spin: `conic-gradient(from var(--uvl-a), ${col(p.c)}, ${col(p.c2 || "accent-2")}, transparent 45%, ${col(p.c)})`,
    holo: "conic-gradient(from var(--uvl-a), #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6)",
    dash: `linear-gradient(90deg, ${col(p.c)} 50%, transparent 0) 0 0 / 16px ${p.s}px repeat-x, linear-gradient(90deg, ${col(p.c)} 50%, transparent 0) 0 100% / 16px ${p.s}px repeat-x, linear-gradient(0deg, ${col(p.c)} 50%, transparent 0) 0 0 / ${p.s}px 16px repeat-y, linear-gradient(0deg, ${col(p.c)} 50%, transparent 0) 100% 0 / ${p.s}px 16px repeat-y`,
  }[kind]);

  // ── CSS for one target (a type's selector or one element's attribute selector) ─
  function block(sel, type, kinds) {
    const S = `:is(${sel}):not(${UI}):not(#_):not(#_)`;
    const P = k => Object.assign({}, (KIND[k] || {}).defaults, kinds[k]);
    const base = [], hov = [], act = [], out = [], filt = [], hfilt = [], afilt = [], anims = [], hanims = [];
    let pseudoBefore = "", pseudoAfter = "", needPos = false, enter = null;
    for (const k of Object.keys(kinds)) {
      const p = P(k), o = opt(k, p.o); if (!o || KIND[k].key === "fx" || o.page) continue;
      filt.push(...drops(o.drop, p));
      if (o.anim && k !== "enter") anims.push(o.anim === "uvl-hue" || o.anim === "uvl-spin" ? `${o.anim} ${k === "idle" ? p.t * 2 : 6}s linear infinite` : `${o.anim} ${k === "idle" ? p.t : 2.4}s ease-in-out infinite`);
      if (o.anim && k === "enter") enter = `${o.anim} ${p.t}s var(--uv-ease, ease) both`;
      if (o.outline) { const [w, st, c, off] = o.outline; base.push(`outline: ${num(w, p.s)}px ${st} ${val(c, p)}; outline-offset: ${num(off, p.s)}px`); }
      if (o.ring && !NO_PSEUDO.test(type)) {
        needPos = true;
        pseudoAfter = `content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; padding: ${o.ring === "dash" ? 0 : p.s}px; background: ${RING(o.ring, p)};` +
          (o.ring === "dash" ? " animation: uvl-march 1s linear infinite;" : ` -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);${o.ring !== "gradient" ? " animation: uvl-spin-a 3s linear infinite;" : ""}`);
      } else if (o.ring) base.push(`outline: ${p.s}px solid ${col(p.c)}; outline-offset: 1px`);
      if (o.bg) base.push(`background: ${val(o.bg, p)}`);
      if (o.fg) base.push(`color: ${val(o.fg, p)}`);
      if (o.backdrop) {
        const [b, a] = o.backdrop;
        base.push(`backdrop-filter: blur(${num(b, p.s)}px) saturate(1.4); -webkit-backdrop-filter: blur(${num(b, p.s)}px) saturate(1.4)`);
        if (!o.bg) base.push(`background: color-mix(in srgb, var(--uv-surface) ${Math.round(a * 100)}%, transparent)`);
      }
      if (o.extra) for (const [a, b] of Object.entries(o.extra)) base.push(`${a}: ${b}`);
      if (o.radius) base.push(`border-radius: ${RADIUS[o.radius] || o.radius}`);
      if (o.clip) base.push(`clip-path: ${CLIP[o.clip]}`);
      if (o.font) {
        const f = o.font;
        if (f.tt) base.push(`text-transform: ${f.tt}`); if (f.ls) base.push(`letter-spacing: ${f.ls}`);
        if (f.ff) base.push(`font-family: ${FONT[f.ff]}`); if (f.fw) base.push(`font-weight: ${f.fw}`); if (f.fs) base.push(`font-style: ${f.fs}`);
        if (f.sc) base.push("font-variant: small-caps");
        if (f.glow) base.push(`text-shadow: 0 0 6px ${val(f.glow, p)}, 0 0 18px ${val("c@60", p)}`);
        if (f.emboss) base.push("text-shadow: 0 1px 0 #ffffff70, 0 -1px 0 #00000040");
        if (f.stroke) base.push(`-webkit-text-stroke: 1.2px ${val(f.stroke, p)}; color: transparent; -webkit-text-fill-color: transparent`);
        if (f.grad) base.push(`background-image: ${val(f.grad, p)}; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent`);
      }
      for (const [state, list, fl, an] of [[o.hover, hov, hfilt, hanims], [o.active, act, afilt, null]]) {
        if (!state) continue;
        if (state.y != null || state.x != null) list.push(`translate: ${num(state.x || 0, p.s)}px ${num(state.y || 0, p.s)}px`);
        if (state.scale != null) list.push(`scale: ${num(state.scale, p.s)}`);
        if (state.rot != null) list.push(`rotate: ${num(state.rot, p.s)}deg`);
        if (state.bright) fl.push(`brightness(${state.bright})`);
        if (state.drop) fl.push(...drops(state.drop, p));
        if (state.outline) { const [w, st, c, off] = state.outline; list.push(`outline: ${num(w, p.s)}px ${st} ${val(c, p)}; outline-offset: ${num(off, p.s)}px`); }
        if (state.anim) (an || list).push(an ? `${state.anim} ${state.anim === "uvl-pan" ? "1.2s ease forwards" : state.anim === "uvl-float" ? "1.6s ease-in-out infinite" : ".55s ease"}` : `animation: ${state.anim} .4s ease`);
        if (state.shine && !NO_PSEUDO.test(type)) { needPos = true; base.push("overflow: hidden"); pseudoBefore = `content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none; background: linear-gradient(110deg, transparent 35%, #ffffff70 50%, transparent 65%); translate: -120% 0;`; out.push(`${S}:hover::before { animation: uvl-shine .7s ease; }`); }
      }
      if (o.js === "tilt") base.push("transform: perspective(700px) rotateX(var(--uvl-rx, 0deg)) rotateY(var(--uvl-ry, 0deg))");
      if (o.js === "magnetic") base.push("translate: var(--uvl-mx, 0px) var(--uvl-my, 0px)");
      if (o.js === "spotlight" && !NO_PSEUDO.test(type)) { needPos = true; base.push("overflow: hidden"); pseudoBefore = `content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit; background: radial-gradient(220px circle at var(--uvl-x, 50%) var(--uvl-y, 50%), ${val("c@25", p)}, transparent 65%);`; }
    }
    if (filt.length) base.push(`filter: ${filt.join(" ")}`);
    if (hfilt.length) hov.push(`filter: ${[...filt, ...hfilt].join(" ")}`);
    if (afilt.length) act.push(`filter: ${[...filt, ...afilt].join(" ")}`);
    if (anims.length) base.push(`animation: ${anims.join(", ")}`);
    if (hanims.length) hov.push(`animation: ${[...hanims, ...anims].join(", ")}`);
    if (needPos && type !== "page") base.push("position: relative; isolation: isolate");
    if (hov.length || act.length) base.push("transition: translate .25s var(--uv-ease, ease), scale .25s var(--uv-spring, ease), rotate .25s ease, filter .25s ease, outline-color .2s, background-color .2s, background-position .6s, color .2s, border-color .2s, box-shadow .25s");
    const css = [];
    if (base.length) css.push(`${S} { ${base.join("; ")}; }`);
    if (hov.length) css.push(`${S}:hover { ${hov.join("; ")}; }`);
    if (act.length) css.push(`${S}:active { ${act.join("; ")}; }`);
    if (pseudoBefore) css.push(`${S}::before { ${pseudoBefore} }`);
    if (pseudoAfter) css.push(`${S}::after { ${pseudoAfter} }`);
    if (enter) {
      css.push(`html.uvl-js ${S}:not(.uvl-in) { opacity: 0; }`);
      css.push(`${S}.uvl-in { animation: ${enter}${anims.length ? ", " + anims.map(a => a + "").join(", ") : ""}; }`);
    }
    return css.concat(out).join("\n");
  }

  /** The static CSS for a stack (everything except JS behaviours, uv-fx classes and page effects). */
  function css(stack = {}) {
    const out = [DEFS.keyframes.trim()];
    for (const [type, kinds] of Object.entries(stack)) {
      if (type === "@el" || type === "page" || !TYPE[type]) continue;
      const b = block(TYPE[type].targets, type, kinds); if (b) out.push(`/* ${TYPE[type].label} */\n` + b);
    }
    for (const [key, v] of Object.entries(stack["@el"] || {})) {
      if (!v || !v.kinds || (v.page && v.page !== location.pathname)) continue;
      const b = block(`[data-uvl="${v.id}"]`, v.type, v.kinds); if (b) out.push(`/* one ${v.type} on ${v.page} */\n` + b);
    }
    return out.length > 1 ? out.join("\n") : "";
  }

  // ── runtime: JS behaviours, uv-fx classes, entrance observer, page effects ─
  let style, current = {}, stops = [], io, mo, pending = 0;
  const allTargets = () => {
    const list = [];
    for (const [type, kinds] of Object.entries(current)) if (TYPE[type] && type !== "page" && type !== "@el") list.push([TYPE[type].targets, type, kinds]);
    for (const v of Object.values(current["@el"] || {})) if (v && v.kinds && (!v.page || v.page === location.pathname)) list.push([`[data-uvl="${v.id}"]`, v.type, v.kinds]);
    return list;
  };
  const isUI = el => !!el.closest(".uvp, .uvi, .uvp-btn");
  function tagElements() {
    // per-element picks are stored as a CSS path; give the element its id attribute
    for (const v of Object.values(current["@el"] || {})) {
      if (!v || (v.page && v.page !== location.pathname)) continue;
      try { const el = document.querySelector(v.path); if (el) { el.setAttribute("data-uvl", v.id); if (v.design) el.setAttribute("data-uv-" + v.type, v.design); } } catch {}
    }
    const fxWanted = new Map();
    for (const [sel, , kinds] of allTargets()) {
      const els = [...document.querySelectorAll(sel)].filter(e => !isUI(e));
      const fx = kinds.fx && opt("fx", kinds.fx.o);
      if (fx) els.forEach(e => { (fxWanted.get(e) || fxWanted.set(e, new Set()).get(e)).add(fx.fx); });
      if (kinds.enter && kinds.enter.o) els.forEach(e => { if (!e.classList.contains("uvl-in") && !e._uvlSeen) { e._uvlSeen = 1; io.observe(e); } });
    }
    // add/remove uv-fx classes we manage
    document.querySelectorAll("[data-uvl-fx]").forEach(e => { if (!fxWanted.has(e)) { e.dataset.uvlFx.split(" ").forEach(c => e.classList.remove(c)); e.removeAttribute("data-uvl-fx"); } });
    fxWanted.forEach((set, e) => {
      const want = [...set], had = (e.dataset.uvlFx || "").split(" ").filter(Boolean);
      had.filter(c => !set.has(c)).forEach(c => e.classList.remove(c));
      want.forEach(c => e.classList.add(c));
      if (!e.dataset.text) e.dataset.text = e.textContent.trim().slice(0, 80);
      e.dataset.uvlFx = want.join(" ");
    });
  }
  const kindsFor = el => {
    const res = [];
    for (const [sel, , kinds] of allTargets()) { try { if (el.matches(sel)) res.push(kinds); } catch {} }
    return res;
  };
  const jsFor = (el, name) => kindsFor(el).some(ks => Object.entries(ks).some(([k, v]) => { const o = opt(k, v && v.o); return o && o.js === name; }));
  const hit = e => { const t = e.target.closest && e.target.closest("*"); if (!t || isUI(t)) return null; for (let el = t; el && el !== document; el = el.parentElement) { if (kindsFor(el).length) return el; } return null; };
  function onDown(e) {
    const el = hit(e); if (!el) return;
    if (jsFor(el, "ripple")) {
      const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height), i = document.createElement("span");
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.overflow = "hidden";
      i.className = "uv-ripple"; i.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      el.appendChild(i); setTimeout(() => i.remove(), 650);
    }
    if (jsFor(el, "sound") && UV.sound) UV.sound("click");
  }
  function onClick(e) {
    const el = hit(e); if (!el) return;
    if (jsFor(el, "confetti") && UV.confetti) UV.confetti({ x: e.clientX, y: e.clientY, count: 80 });
    if (jsFor(el, "sparkle") && UV.confetti) UV.confetti({ x: e.clientX, y: e.clientY, count: 26, spread: .45, shapes: "circle" });
  }
  function onMove(e) {
    const el = hit(e); if (!el) return;
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (jsFor(el, "tilt")) { el.style.setProperty("--uvl-rx", ((.5 - y / r.height) * 12).toFixed(2) + "deg"); el.style.setProperty("--uvl-ry", ((x / r.width - .5) * 14).toFixed(2) + "deg"); }
    if (jsFor(el, "magnetic")) { el.style.setProperty("--uvl-mx", ((x - r.width / 2) * .25).toFixed(1) + "px"); el.style.setProperty("--uvl-my", ((y - r.height / 2) * .3).toFixed(1) + "px"); }
    if (jsFor(el, "spotlight")) { el.style.setProperty("--uvl-x", x + "px"); el.style.setProperty("--uvl-y", y + "px"); }
    el._uvlMoved = 1;
  }
  function onOut(e) {
    const el = e.target; if (!el || !el._uvlMoved || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    ["--uvl-rx", "--uvl-ry", "--uvl-mx", "--uvl-my"].forEach(p => el.style.removeProperty(p));
  }
  function page(p = {}) {
    stops.forEach(s => { try { s && s(); } catch {} }); stops = [];
    const o = k => p[k] && opt(k, p[k].o);
    const canvas = o("canvas"), cursor = o("cursor"), scroll = o("scroll");
    if (canvas && UV.fx) {
      const host = document.createElement("div"); host.className = "uvl-page-bg";
      host.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden";
      document.body.prepend(host);
      const run = UV.fx[canvas.page.canvas] || (canvas.page.canvas === "waterfall" && window.UVWaterfall && (el => window.UVWaterfall.mount(el)));
      let stop = null; try { stop = run && run(host); } catch {}
      stops.push(() => { try { typeof stop === "function" ? stop() : stop && stop.stop && stop.stop(); } catch {} host.remove(); });
    }
    if (cursor && UV.fx && UV.fx[cursor.page.cursor]) { try { stops.push(UV.fx[cursor.page.cursor](document.body)); } catch {} }
    if (scroll) {
      const s = scroll.page.scroll;
      if ((s === "smooth" || s === "both") && UV.smoothScroll && !document.documentElement.hasAttribute("data-uv-smooth")) { try { stops.push(UV.smoothScroll()); } catch {} }
      if ((s === "progress" || s === "both") && UV.scrollbar) { UV.scrollbar(); stops.push(() => document.querySelectorAll(".uv-scrollbar").forEach(b => b.remove())); }
    }
  }
  let lastPage = "";
  function apply(stack = {}) {
    current = stack || {};
    if (!style) { style = document.createElement("style"); style.id = "uv-layers"; document.head.appendChild(style); }
    style.textContent = css(current);
    document.documentElement.classList.add("uvl-js");
    if (!io) io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("uvl-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -6% 0px" });
    if (!mo) {
      mo = new MutationObserver(() => { if (!pending) pending = setTimeout(() => { pending = 0; tagElements(); }, 250); });
      const start = () => { mo.observe(document.body, { childList: true, subtree: true }); document.addEventListener("pointerdown", onDown, true); document.addEventListener("click", onClick, true); document.addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("pointerout", onOut, true); };
      document.body ? start() : document.addEventListener("DOMContentLoaded", start);
    }
    const go = () => {
      tagElements();
      const pj = JSON.stringify(current.page || {}); if (pj !== lastPage) { lastPage = pj; page(current.page); }
    };
    document.body ? go() : document.addEventListener("DOMContentLoaded", go);
    return current;
  }
  /** A CSS path that finds this element again on this page. */
  function pathOf(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body; e = e.parentElement) {
      if (e.id) { parts.unshift("#" + CSS.escape(e.id)); break; }
      let i = 1; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++;
      parts.unshift(e.tagName.toLowerCase() + ":nth-of-type(" + i + ")");
    }
    return parts.join(" > ");
  }
  /** Which element type (btn, card, …) an element belongs to, or null. */
  function typeOf(el) {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (isUI(e)) return null;
      for (const t of DEFS.types) { if (t.key === "page") continue; try { if (e.matches(t.targets)) return [t.key, e]; } catch {} }
    }
    return ["page", document.documentElement];
  }
  UV.layers = { defs: DEFS, kinds: KIND, types: TYPE, apply, css, get: () => current, pathOf, typeOf, option: opt };
})(window.UV);
