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
