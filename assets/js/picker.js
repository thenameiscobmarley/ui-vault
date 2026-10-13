// UI Vault floating theme picker — try any of the styles (or your saved custom ones) on any page,
// plus element designs (buttons, cards, inputs…) mixed and matched per family, and ready-made kits.
// Remembers the choices in localStorage("uv-skin", "uv-parts"); loads only the CSS it needs.
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
  :root { --uvp-bg: #151517f2; --uvp-field: #1f1f22; --uvp-ln: #ffffff1a; --uvp-ln2: #ffffff29; --uvp-ln3: #ffffff40; --uvp-hov: #ffffff12; --uvp-fg: #ecebe8; --uvp-mu: #a19d95; --uvp-di: #8f8a82; --uvp-sh: #000b; --uvp-ac: #ff6a26; }
  :is(.uvp, .uvi, .uvp-btn) { color-scheme: dark; }
  html[data-theme="light"] { --uvp-bg: #fbfaf8f5; --uvp-field: #ffffff; --uvp-ln: #1a191714; --uvp-ln2: #1a191726; --uvp-ln3: #1a191742; --uvp-hov: #1a19170d; --uvp-fg: #1a1917; --uvp-mu: #5f5b54; --uvp-di: #77726a; --uvp-sh: #1a19173a; --uvp-ac: #ff4f00; }
  html[data-theme="light"] :is(.uvp, .uvi, .uvp-btn) { color-scheme: light; }
  .uvp-btn { position: fixed; left: 16px; bottom: 16px; z-index: 9990; display: flex; align-items: center; gap: 8px; height: 40px; padding: 0 14px 0 10px; border-radius: 999px; border: 1px solid var(--uvp-ln2); background: var(--uvp-bg); color: var(--uvp-fg); font: 500 13px "Geist", system-ui, sans-serif; cursor: pointer; box-shadow: 0 10px 30px -10px var(--uvp-sh); transition: transform .2s; }
  .uvp-btn:hover { transform: translateY(-2px); }
  .uvp-insp { left: 162px !important; }
  .uvp-btn { transition: transform .2s, opacity .25s, left .25s, width .25s, padding .25s; }
  html.uvp-c .uvp-btn { opacity: .72; } html.uvp-c .uvp-btn:hover, html.uvp-c .uvp-btn:focus-visible { opacity: 1; }
  html.uvp-c .uvp-btn:not(.uvp-mode) { width: 40px; padding: 0; justify-content: center; gap: 0; font-size: 0; }
  html.uvp-c .uvp-mode:not(.uvp-insp) { left: 62px; } html.uvp-c .uvp-insp { left: 108px !important; }
  .uvp-mode { left: 116px; width: 40px; padding: 0; justify-content: center; font-size: 17px; } .uvp-btn i { width: 20px; height: 20px; border-radius: 50%; background: conic-gradient(#ff4f00, #ffd23f, #39ff88, #00f0ff, #b46bff, #ff2bd6, #ff4f00); }
  .uvp { position: fixed; left: 16px; bottom: 64px; z-index: 9991; width: min(330px, calc(100vw - 32px)); max-height: min(520px, calc(100vh - 90px)); display: none; flex-direction: column; border-radius: 12px; border: 1px solid var(--uvp-ln2); background: var(--uvp-bg); color: var(--uvp-fg); font: 14px "Geist", system-ui, sans-serif; box-shadow: 0 30px 60px -20px var(--uvp-sh); overflow: hidden; }
  .uvp.open { display: flex; animation: uvp-in .25s cubic-bezier(.2, 1.1, .4, 1); } @keyframes uvp-in { from { opacity: 0; transform: translateY(8px) scale(.98); } }
  .uvp header { display: grid; gap: 8px; padding: 12px; border-bottom: 1px solid var(--uvp-ln); }
  .uvp input, .uvp select { height: 34px; padding: 0 10px; border-radius: 6px; border: 1px solid var(--uvp-ln2); background: var(--uvp-field); color: var(--uvp-fg); font: 13px "Geist", sans-serif; outline: none; }
  .uvp ul { list-style: none; margin: 0; padding: 6px; overflow: auto; flex: 1; }
  .uvp li { display: flex; align-items: center; gap: 10px; padding: 7px 8px; border-radius: 6px; cursor: pointer; }
  .uvp li:hover, .uvp li.on { background: var(--uvp-hov); } .uvp li.on::after { content: "✓"; margin-left: auto; color: #ff6a26; }
  .uvp .sw { display: flex; flex: none; } .uvp .sw b { width: 10px; height: 20px; } .uvp .sw b:first-child { border-radius: 4px 0 0 4px; } .uvp .sw b:last-child { border-radius: 0 4px 4px 0; }
  .uvp small { color: var(--uvp-di); font: 10px "Geist Mono", monospace; text-transform: uppercase; }
  .uvp nav { display: flex; gap: 4px; padding: 8px 12px 0; } .uvp nav button { flex: 1; height: 30px; border: 1px solid var(--uvp-ln2); border-radius: 6px; background: none; color: var(--uvp-mu); font: 500 12px "Geist", sans-serif; cursor: pointer; } .uvp nav button.on { background: var(--uvp-hov); color: var(--uvp-fg); border-color: var(--uvp-ln3); }
  .uvp .parts { display: grid; grid-template-columns: auto 1fr; gap: 6px 10px; align-items: center; padding: 10px 12px; overflow: auto; flex: 1; } .uvp .parts label { color: var(--uvp-mu); font-size: 12px; } .uvp .parts select { height: 30px; min-width: 0; }
  .uvp .kits { display: flex; flex-wrap: wrap; gap: 6px; padding: 10px 12px 0; } .uvp .kits button { padding: 5px 9px; border-radius: 999px; border: 1px solid var(--uvp-ln2); background: none; color: var(--uvp-fg); font: 500 12px "Geist", sans-serif; cursor: pointer; } .uvp .kits button:hover, .uvp .kits button.on { background: #ff6a26; border-color: #ff6a26; color: #111; }
  .uvp footer { display: flex; gap: 6px; padding: 10px; border-top: 1px solid var(--uvp-ln); } .uvp footer a, .uvp footer button { flex: 1; height: 32px; display: grid; place-items: center; border-radius: 6px; border: 1px solid var(--uvp-ln2); background: none; color: var(--uvp-fg); font: 500 12px "Geist", sans-serif; text-decoration: none; cursor: pointer; }
  :is(p, li, dd, small) > a:not([class]):hover, :is(p, li) > a[style*="color"]:hover { text-decoration: underline; text-decoration-thickness: 1px; text-underline-offset: 3px; }
  :where(body *) { scrollbar-width: thin; scrollbar-color: color-mix(in srgb, currentColor 26%, transparent) transparent; }
  @media print { .uvp-btn, .uvp { display: none !important; } }`;
  document.head.appendChild(map);

  async function ensureBase() {
    if (!hasBundle) await Promise.all([css(BASE + "lib/css/core.css"), css(BASE + "lib/css/fonts.css")]);
  }
  let themeSeq = 0;
  async function apply(name) {
    const seq = ++themeSeq;
    if (!name) { html.removeAttribute("data-uv-theme"); store.set("uv-skin", ""); mark(); return; }
    store.set("uv-skin", name);
    await ensureBase();
    const custom = store.get("uv-custom-styles", {})[name];
    if (custom) {
      await js(BASE + "assets/js/theme-engine.js");
      let st = document.getElementById("uvp-custom"); if (!st) { st = document.createElement("style"); st.id = "uvp-custom"; document.head.appendChild(st); }
      st.textContent = Object.values(store.get("uv-custom-styles", {})).map(s => ThemeEngine.css(s)).join("\n");
    } else if (!hasBundle) await css(BASE + "lib/css/themes/" + name + ".css");
    if (seq !== themeSeq) return;
    html.dataset.uvTheme = name; mark();
  }

  // element designs: data-uv-<family>="name" on <html>, one CSS file per family in use
  const FAMS = ["btn", "card", "input", "switch", "check", "range", "tabs", "nav", "badge", "alert", "modal", "spinner", "progress", "head", "bg"];
  let partsData;
  const loadParts = async () => { if (!partsData) { await js(BASE + "lib/parts.js"); partsData = window.UV_PARTS; } return partsData; };
  async function setParts(mix, { replace = false, kit } = {}) {
    const cur = replace ? {} : store.get("uv-parts", {});
    Object.assign(cur, mix);
    for (const k of Object.keys(cur)) if (!cur[k]) delete cur[k];
    store.set("uv-parts", cur); store.set("uv-kit", kit || "");
    await applyParts(cur);
  }
  let partsSeq = 0;
  async function applyParts(cur = store.get("uv-parts", {})) {
    const seq = ++partsSeq, used = FAMS.filter(k => cur[k]);
    if (used.length) await ensureBase();
    await Promise.all(used.map(k => css(BASE + "lib/css/parts/" + k + ".css")));
    if (seq !== partsSeq) return;   // a newer pick arrived while this one was loading
    for (const k of FAMS) cur[k] ? html.setAttribute("data-uv-" + k, cur[k]) : html.removeAttribute("data-uv-" + k);
    renderParts();
    document.dispatchEvent(new CustomEvent("uv:parts", { detail: cur }));
  }
  async function applyKit(name) {
    const d = await loadParts(), kit = d.kits.find(k => k.name === name);
    if (!kit) return;
    await setParts(kit.parts, { replace: true, kit: name });
    if (kit.theme) await apply(kit.theme);
  }

  // effect layers (glow, hover, backdrop… on any element type or a single element): stored in "uv-layers"
  const hasJs = () => !!(window.UV && window.UV.layers);
  let layersP = null;
  const ensureLayers = () => hasJs() ? Promise.resolve() : (layersP ||= (async () => { await ensureBase(); await css(BASE + "lib/css/components.css"); await js(BASE + "lib/uivault.js"); })());
  const loadFamily = k => css(BASE + "lib/css/parts/" + k + ".css");
  async function applyLayers(stack = store.get("uv-layers", {})) {
    if (!Object.keys(stack).length && !hasJs()) return;
    await ensureLayers();
    Object.values(stack["@el"] || {}).forEach(v => v && v.design && loadFamily(v.type));
    window.UV.layers.apply(stack);
    // per-element designs live on the element itself
    Object.values(stack["@el"] || {}).forEach(v => { if (v && v.design && (!v.page || v.page === location.pathname)) { try { const e = document.querySelector(v.path); e && e.setAttribute("data-uv-" + v.type, v.design); } catch {} } });
  }

  // re-apply the saved choices on every page
  const saved = store.get("uv-skin", "");
  if (saved) apply(saved);
  if (Object.keys(store.get("uv-parts", {})).length) applyParts();
  if (Object.keys(store.get("uv-layers", {})).length) (document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", () => applyLayers()) : applyLayers());
  // keep other open tabs in sync
  addEventListener("storage", e => {
    if (e.key === "uv-parts") applyParts();
    if (e.key === "uv-layers") applyLayers();
    if (e.key === "uv-skin") { const v = store.get("uv-skin", ""); v ? apply(v) : apply(""); }
  });

  let btn, panel, data;
  async function open() {
    if (!data) { await Promise.all([js(BASE + "lib/tokens.js"), loadParts()]); data = window.UV_TOKENS.themes; build(); }
    panel.classList.toggle("open"); if (panel.classList.contains("open")) panel.querySelector("input").focus();
  }
  function build() {
    const cats = ["All", "My styles", ...new Set(Object.values(data).map(t => t.category))];
    const pd = partsData;
    panel.innerHTML = `<nav><button type="button" data-tab="s" class="on">Styles</button><button type="button" data-tab="e">Elements</button><button type="button" data-tab="l">Effects</button></nav>
      <section data-pane="s" style="display:contents"><header><input type="search" placeholder="Search ${Object.keys(data).length} styles…"><select>${cats.map(c => `<option>${c}</option>`).join("")}</select></header><ul></ul>
      <footer><button data-reset>Default</button><button data-rand>Random</button><a href="${BASE}themes.html">All styles →</a></footer></section>
      <section data-pane="e" style="display:none">
        <div class="kits">${pd.kits.map(k => `<button type="button" data-kit="${k.name}" title="${k.desc}">${k.label}</button>`).join("")}</div>
        <div class="parts">${pd.families.map(f => `<label for="uvp-${f.key}">${f.label}</label><select id="uvp-${f.key}" data-fam="${f.key}"><option value="">Theme default</option>${f.parts.map(p => `<option value="${p.name}">${p.label}</option>`).join("")}</select>`).join("")}</div>
        <footer><button data-preset>Reset</button><button data-prand>Random</button><a href="${BASE}elements.html">Browse →</a><a href="${BASE}lab.html">Test page →</a></footer></section>
      <section data-pane="l" style="display:none"><div class="parts" style="grid-template-columns:auto 1fr;padding-bottom:0"><label for="uvp-ltype">Element</label><select id="uvp-ltype">${["btn","card","input","switch","check","range","tabs","nav","badge","alert","modal","spinner","progress","head","link","img","text","page"].map(k => `<option value="${k}">${{btn:"Buttons",card:"Cards",input:"Text fields",switch:"Switches",check:"Checkboxes",range:"Sliders",tabs:"Tabs",nav:"Navigation",badge:"Badges",alert:"Alerts & toasts",modal:"Modals",spinner:"Spinners",progress:"Progress",head:"Headings",link:"Links",img:"Images",text:"Paragraphs",page:"Whole page"}[k]}</option>`).join("")}</select></div>
        <div class="leditor" style="padding:10px 12px;overflow:auto;flex:1"></div>
        <footer><button data-inspect>Inspect an element</button><a href="${BASE}lab.html">Test page →</a></footer></section>`;
    const tabs = panel.querySelectorAll("nav button");
    tabs.forEach(b => b.onclick = () => { tabs.forEach(x => x.classList.toggle("on", x === b)); panel.querySelectorAll("[data-pane]").forEach(p => p.style.display = p.dataset.pane === b.dataset.tab ? (p.dataset.pane === "s" ? "contents" : "flex") : "none"); });
    const pe = panel.querySelector('[data-pane="e"]'); pe.style.flexDirection = "column"; pe.style.minHeight = "0";
    const pl = panel.querySelector('[data-pane="l"]'); pl.style.flexDirection = "column"; pl.style.minHeight = "0";
    const drawL = async () => { await ensureLayers(); await js(BASE + "assets/js/layers-ui.js"); UVLayersUI.render(pl.querySelector(".leditor"), { type: pl.querySelector("#uvp-ltype").value }); };
    pl.querySelector("#uvp-ltype").onchange = drawL;
    tabs.forEach(b => b.addEventListener("click", () => b.dataset.tab === "l" && drawL()));
    pl.querySelector("[data-inspect]").onclick = () => { panel.classList.remove("open"); inspect(); };
    pe.querySelector(".kits").onclick = e => { const b = e.target.closest("[data-kit]"); if (b) applyKit(b.dataset.kit); };
    pe.querySelectorAll("select").forEach(sel => sel.onchange = () => setParts({ [sel.dataset.fam]: sel.value }));
    pe.querySelector("[data-preset]").onclick = () => setParts({}, { replace: true });
    pe.querySelector("[data-prand]").onclick = () => setParts(Object.fromEntries(pd.families.map(f => [f.key, f.parts[(Math.random() * f.parts.length) | 0].name])), { replace: true });
    const q = panel.querySelector("input"), c = panel.querySelector("select");
    q.oninput = c.onchange = render;
    panel.querySelector("[data-reset]").onclick = () => apply("");
    panel.querySelector("[data-rand]").onclick = () => { const k = Object.keys(data); apply(k[(Math.random() * k.length) | 0]); };
    panel.querySelector("ul").onclick = e => { const li = e.target.closest("li"); if (li) apply(li.dataset.n); };
    render(); renderParts();
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
  function renderParts() {
    if (!panel) return;
    const cur = store.get("uv-parts", {}), kit = store.get("uv-kit", "");
    panel.querySelectorAll("select[data-fam]").forEach(sel => sel.value = cur[sel.dataset.fam] || "");
    panel.querySelectorAll("[data-kit]").forEach(b => b.classList.toggle("on", b.dataset.kit === kit));
  }
  function mark() { panel && panel.querySelectorAll("li").forEach(li => li.classList.toggle("on", li.dataset.n === (html.dataset.uvTheme || ""))); }

  // light / dark mode — shared by every page (localStorage "uv-theme"; pages have an early script that applies it)
  // what the page LOOKS like: a style (data-uv-theme) brings its own colours, so read the actual background then
  const looksDark = () => {
    for (const el of [html, document.body]) {
      const m = (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || []).map(Number);
      if (m.length >= 3 && (m.length < 4 || m[3] > .5)) return (0.2126 * m[0] + 0.7152 * m[1] + 0.0722 * m[2]) / 255 < .5;
    }
    return html.dataset.theme !== "light";
  };
  const isDark = () => {
    if (html.dataset.uvTheme) return looksDark();
    if (html.dataset.theme) return html.dataset.theme === "dark";
    return looksDark();
  };
  let modeBtn;
  const syncMode = () => { if (modeBtn) { const d = isDark(); modeBtn.textContent = d ? "☀" : "☾"; modeBtn.title = d ? "Switch to light mode" : "Switch to dark mode"; }
    // keep the phone browser's toolbar colour in step with the page
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) requestAnimationFrame(() => { const c = getComputedStyle(document.body).backgroundColor; meta.content = /^rgba\(.*, 0\)$/.test(c) || c === "transparent" ? (isDark() ? "#121211" : "#f4f2ee") : c; });
  };
  function toggleMode() {
    const next = isDark() ? "light" : "dark";
    // a style keeps its own colours whatever the mode, so switching mode means going back to the site's own look
    const skin = html.dataset.uvTheme;
    if (skin) { apply(""); window.UV && UV.toast && UV.toast(`"${skin}" has fixed colours, so the page is back to the default ${next} look. Pick it again in Theme.`); }
    html.dataset.theme = next;
    try { localStorage.setItem("uv-theme", next); } catch {}
    syncMode();
  }
  new MutationObserver(syncMode).observe(html, { attributes: true, attributeFilter: ["data-theme", "data-uv-theme"] });

  const mount = () => {
    modeBtn = Object.assign(document.createElement("button"), { className: "uvp-btn uvp-mode", type: "button" });
    modeBtn.setAttribute("aria-label", "Toggle light or dark mode");
    modeBtn.onclick = toggleMode;
    document.body.append(modeBtn); syncMode();
    const ib = Object.assign(document.createElement("button"), { className: "uvp-btn uvp-mode uvp-insp", type: "button", innerHTML: '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="7"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/></svg>', title: "Inspect: click any element to change its design and effects" });
    ib.setAttribute("aria-label", "Inspect an element"); ib.onclick = e => { e.stopPropagation(); inspect(); };
    document.body.append(ib);
    // shrink to icons once the page is scrolled, so they don't sit on top of content
    let ct = 0; const comp = () => { ct = 0; html.classList.toggle("uvp-c", scrollY > 240); };
    addEventListener("scroll", () => { if (!ct) ct = requestAnimationFrame(comp); }, { passive: true }); comp();
    btn = Object.assign(document.createElement("button"), { className: "uvp-btn", type: "button", innerHTML: "<i></i>Theme", title: "Try any style on this page" });
    panel = Object.assign(document.createElement("div"), { className: "uvp" });
    btn.onclick = open;
    document.body.append(btn, panel);
    document.addEventListener("keydown", e => { if (e.key === "Escape") panel.classList.remove("open"); });
    document.addEventListener("click", e => { if (panel.classList.contains("open") && !panel.contains(e.target) && !btn.contains(e.target)) panel.classList.remove("open"); });
  };
  document.readyState === "loading" ? document.addEventListener("DOMContentLoaded", mount) : mount();
  async function inspect() {
    await ensureLayers(); await loadParts();
    await js(BASE + "assets/js/layers-ui.js"); await js(BASE + "assets/js/inspector.js");
    UVInspector.start();
  }
  window.UVPicker = { toggleMode, apply, setParts, applyKit, loadParts, ensureLayers, applyLayers, loadFamily, inspect, getLayers: () => store.get("uv-layers", {}), getParts: () => store.get("uv-parts", {}), getKit: () => store.get("uv-kit", ""), refresh: () => { render(); const s = html.dataset.uvTheme; if (s && store.get("uv-custom-styles", {})[s]) apply(s); } };
})();
