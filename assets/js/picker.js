// UI Vault floating theme picker — try any of the styles (or your saved custom ones) on any page.
// Remembers the choice in localStorage("uv-skin"); loads only the CSS it needs.
(() => {
  "use strict";
  const BASE = (document.currentScript?.src || "").replace(/assets\/js\/picker\.js.*$/, "");
  const html = document.documentElement;
  const hasBundle = !!document.querySelector('link[href*="uivault.css"]');
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const load = (tag, attrs) => new Promise(res => { const el = Object.assign(document.createElement(tag), attrs); el.onload = res; el.onerror = res; document.head.appendChild(el); });
  const loaded = new Set();
  const css = href => loaded.has(href) ? Promise.resolve() : (loaded.add(href), load("link", { rel: "stylesheet", href }));
  const js = src => loaded.has(src) ? Promise.resolve() : (loaded.add(src), load("script", { src }));

  // map UI Vault tokens onto pages that use their own variable names (homepage, code page)
  const map = document.createElement("style");
  map.textContent = `html[data-uv-theme] { --bg: var(--uv-bg); --bg-2: var(--uv-surface); --surface: var(--uv-surface); --surface-2: var(--uv-surface-2); --line: var(--uv-line); --line-2: var(--uv-line-2); --text: var(--uv-text); --muted: var(--uv-muted); --dim: var(--uv-dim); --accent: var(--uv-accent); --font: var(--uv-font); --serif: var(--uv-font-head); --mono: var(--uv-mono);
    --ink: var(--uv-bg); --ink-2: var(--uv-surface); --ink-3: var(--uv-surface-2); --rule: var(--uv-line); --rule-2: var(--uv-line-2); --fg: var(--uv-text); --fg-2: var(--uv-muted); --fg-3: var(--uv-dim); --sig: var(--uv-accent); }
  html[data-uv-theme] body { background-color: transparent !important; color: var(--uv-text); }
  .uvp-btn { position: fixed; left: 16px; bottom: 16px; z-index: 9990; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px 0 10px; border-radius: 999px; border: 1px solid #ffffff33; background: #151517e6; color: #fff; font: 500 13px "Geist", system-ui, sans-serif; cursor: pointer; backdrop-filter: blur(8px); box-shadow: 0 10px 30px -10px #000a; transition: transform .2s; }
  .uvp-btn:hover { transform: translateY(-2px); } .uvp-btn i { width: 20px; height: 20px; border-radius: 50%; background: conic-gradient(#ff4f00, #ffd23f, #39ff88, #00f0ff, #b46bff, #ff2bd6, #ff4f00); }
  .uvp { position: fixed; left: 16px; bottom: 64px; z-index: 9991; width: min(330px, calc(100vw - 32px)); max-height: min(520px, calc(100vh - 90px)); display: none; flex-direction: column; border-radius: 12px; border: 1px solid #ffffff26; background: #151517f5; color: #ecebe8; font: 14px "Geist", system-ui, sans-serif; box-shadow: 0 30px 60px -20px #000c; backdrop-filter: blur(12px); overflow: hidden; }
  .uvp.open { display: flex; animation: uvp-in .25s cubic-bezier(.2, 1.1, .4, 1); } @keyframes uvp-in { from { opacity: 0; transform: translateY(8px) scale(.98); } }
  .uvp header { display: grid; gap: 8px; padding: 12px; border-bottom: 1px solid #ffffff1a; }
  .uvp input, .uvp select { height: 34px; padding: 0 10px; border-radius: 6px; border: 1px solid #ffffff26; background: #1f1f22; color: #fff; font: 13px "Geist", sans-serif; outline: none; }
  .uvp ul { list-style: none; margin: 0; padding: 6px; overflow: auto; flex: 1; }
  .uvp li { display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 6px; cursor: pointer; }
  .uvp li:hover, .uvp li.on { background: #ffffff12; } .uvp li.on::after { content: "✓"; margin-left: auto; color: #ff6a26; }
  .uvp .sw { display: flex; flex: none; } .uvp .sw b { width: 10px; height: 20px; } .uvp .sw b:first-child { border-radius: 4px 0 0 4px; } .uvp .sw b:last-child { border-radius: 0 4px 4px 0; }
  .uvp small { color: #8f8a82; font: 10px "Geist Mono", monospace; text-transform: uppercase; }
  .uvp footer { display: flex; gap: 6px; padding: 10px; border-top: 1px solid #ffffff1a; } .uvp footer a, .uvp footer button { flex: 1; height: 32px; display: grid; place-items: center; border-radius: 6px; border: 1px solid #ffffff26; background: none; color: #ecebe8; font: 500 12px "Geist", sans-serif; text-decoration: none; cursor: pointer; }
  @media print { .uvp-btn, .uvp { display: none !important; } }`;
  document.head.appendChild(map);

  async function ensureBase() {
    if (!hasBundle) await Promise.all([css(BASE + "lib/css/core.css"), css(BASE + "lib/css/fonts.css")]);
  }
  async function apply(name) {
    if (!name) { html.removeAttribute("data-uv-theme"); store.set("uv-skin", ""); mark(); return; }
    await ensureBase();
    const custom = store.get("uv-custom-styles", {})[name];
    if (custom) {
      await js(BASE + "assets/js/theme-engine.js");
      let st = document.getElementById("uvp-custom"); if (!st) { st = document.createElement("style"); st.id = "uvp-custom"; document.head.appendChild(st); }
      st.textContent = Object.values(store.get("uv-custom-styles", {})).map(s => ThemeEngine.css(s)).join("\n");
    } else if (!hasBundle) await css(BASE + "lib/css/themes/" + name + ".css");
    html.dataset.uvTheme = name; store.set("uv-skin", name); mark();
  }

  // re-apply the saved choice on every page
  const saved = store.get("uv-skin", "");
  if (saved) apply(saved);

  let btn, panel, data;
  async function open() {
    if (!data) { await js(BASE + "lib/tokens.js"); data = window.UV_TOKENS.themes; build(); }
    panel.classList.toggle("open"); if (panel.classList.contains("open")) panel.querySelector("input").focus();
  }
  function build() {
    const cats = ["All", "My styles", ...new Set(Object.values(data).map(t => t.category))];
    panel.innerHTML = `<header><input type="search" placeholder="Search ${Object.keys(data).length} styles…"><select>${cats.map(c => `<option>${c}</option>`).join("")}</select></header><ul></ul>
      <footer><button data-reset>Default</button><button data-rand>Random</button><a href="${BASE}themes.html">All styles →</a></footer>`;
    const q = panel.querySelector("input"), c = panel.querySelector("select");
    q.oninput = c.onchange = render;
    panel.querySelector("[data-reset]").onclick = () => apply("");
    panel.querySelector("[data-rand]").onclick = () => { const k = Object.keys(data); apply(k[(Math.random() * k.length) | 0]); };
    panel.querySelector("ul").onclick = e => { const li = e.target.closest("li"); if (li) apply(li.dataset.n); };
    render();
  }
  function render() {
    if (!panel || !data) return;
    const q = panel.querySelector("input").value.trim().toLowerCase(), c = panel.querySelector("select").value;
    const customs = store.get("uv-custom-styles", {});
    const rows = [...Object.entries(customs).map(([n, s]) => [n, { category: "My styles", solid: { bg: s.bg, surface: s.bg, text: s.fg, accent: s.ac, "accent-2": s.ac2 } }]), ...Object.entries(data)]
      .filter(([n, t]) => (c === "All" || t.category === c) && (!q || (n + " " + t.category + " " + (t.desc || "")).toLowerCase().includes(q)));
    panel.querySelector("ul").innerHTML = rows.map(([n, t]) => `<li data-n="${n}"><span class="sw">${["bg", "surface", "text", "accent", "accent-2"].map(k => `<b style="background:${t.solid[k]}"></b>`).join("")}</span><span>${n.replace(/-/g, " ")}<br><small>${t.category}</small></span></li>`).join("") || `<li style="cursor:default;color:#8f8a82">No styles match</li>`;
    mark();
  }
  function mark() { panel && panel.querySelectorAll("li").forEach(li => li.classList.toggle("on", li.dataset.n === (html.dataset.uvTheme || ""))); }

  const mount = () => {
    btn = Object.assign(document.createElement("button"), { className: "uvp-btn", type: "button", innerHTML: "<i></i>Theme", title: "Try any style on this page" });
    panel = Object.assign(document.createElement("div"), { className: "uvp" });
    btn.onclick = open;
    document.body.append(btn, panel);
    document.addEventListener("keydown", e => { if (e.key === "Escape") panel.classList.remove("open"); });
    document.addEventListener("click", e => { if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove("open"); });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
  window.UVPicker = { apply, refresh: () => { render(); const s = html.dataset.uvTheme; if (s && store.get("uv-custom-styles", {})[s]) apply(s); } };
})();
