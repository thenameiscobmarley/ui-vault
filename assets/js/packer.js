// UI Vault packer — turns Library picks into a trimmed package: CSS/JS with only what you picked, an example page,
// UiVault3 Python / C++ setup code, your site customizations, and a zip (made in the browser).
// Picks are ids stored in localStorage "uv-pack":
//   theme/neon · kit/pearl · part/btn/pearl · layer/glow/neon@btn · fx/uv-fx-glitch · comp/uv-accordion · js/UV.toast · block/3 · native/Button · skin3d/obsidian
(() => {
  "use strict";
  const BASE = (document.currentScript?.src || "").replace(/assets\/js\/packer\.js.*$/, "");
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const load = src => new Promise(r => { const s = document.createElement("script"); s.src = BASE + src; s.onload = s.onerror = r; document.head.appendChild(s); });
  async function ensure() {
    const need = [];
    if (!window.UV_SRC) need.push(load("lib/raw-src.js"));
    if (!window.UV_PARTS_SRC) need.push(load("lib/parts-src.js"));
    if (!window.UV_PARTS) need.push(load("lib/parts.js"));
    if (!window.BLOCKS) need.push(load("assets/js/blocks.js"));
    if (!window.UV_COLLECTIONS) need.push(load("lib/collections.js"));
    if (!(window.UV && UV.layers)) need.push(load("lib/uivault.js"));
    await Promise.all(need);
  }

  // ── picks ────────────────────────────────────────────────────────────────
  const get = () => store.get("uv-pack", []);
  const set = ids => { store.set("uv-pack", [...new Set(ids)]); document.dispatchEvent(new CustomEvent("uv:pack", { detail: get() })); };
  const toggle = id => { const p = get(); set(p.includes(id) ? p.filter(x => x !== id) : [...p, id]); return get().includes(id); };
  addEventListener("storage", e => { if (e.key === "uv-pack") document.dispatchEvent(new CustomEvent("uv:pack", { detail: get() })); });

  // ── CSS extraction ───────────────────────────────────────────────────────
  function blocks(css) {   // top-level {prelude, body} blocks (comments removed)
    css = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const out = []; let i = 0;
    while (i < css.length) {
      const o = css.indexOf("{", i); if (o < 0) break;
      let d = 1, j = o + 1;
      while (j < css.length && d) { if (css[j] === "{") d++; else if (css[j] === "}") d--; j++; }
      const prelude = css.slice(i, o).trim();
      if (prelude.startsWith("@import")) { i = css.indexOf(";", i) + 1; continue; }
      out.push({ prelude: prelude.replace(/^[^{}]*;\s*/s, "").trim(), body: css.slice(o + 1, j - 1) });
      i = j;
    }
    return out;
  }
  function extract(css, keep) {
    const kf = {}, props = {}, rules = [];
    const walk = (list, into) => {
      for (const b of list) {
        if (b.prelude.startsWith("@keyframes")) { kf[b.prelude.split(/\s+/)[1]] = `${b.prelude} {${b.body}}`; continue; }
        if (b.prelude.startsWith("@property")) { props[b.prelude.split(/\s+/)[1]] = `${b.prelude} {${b.body}}`; continue; }
        if (b.prelude.startsWith("@media") || b.prelude.startsWith("@supports") || b.prelude.startsWith("@container")) {
          const inner = []; walk(blocks(b.body), inner); if (inner.length) into.push(`${b.prelude} {\n${inner.join("\n")}\n}`); continue;
        }
        if (b.prelude.startsWith("@")) continue;
        if (keep(b.prelude)) into.push(`${b.prelude} {${b.body}}`);
      }
    };
    walk(blocks(css), rules);
    return { rules, kf, props };
  }
  function withDeps({ rules, kf, props }, allKf, allProps) {
    const text = rules.join("\n"), used = new Set(), out = [];
    for (const m of text.matchAll(/animation(?:-name)?\s*:\s*([^;}]+)/g)) for (const part of m[1].split(",")) { const n = part.trim().split(/\s+/).find(t => allKf[t] || kf[t]); if (n) used.add(n); }
    used.forEach(n => out.push(allKf[n] || kf[n]));
    for (const m of text.matchAll(/var\((--[\w-]+)/g)) if (allProps[m[1]] || props[m[1]]) out.push(allProps[m[1]] || props[m[1]]);
    return [...new Set(out)].concat(rules).join("\n");
  }
  const cls = c => new RegExp("\\." + c.replace(/[-]/g, "\\-") + "(?![\\w-])|\\." + c + "(--|__)[\\w-]+");
  let ALL;
  function all() {
    if (ALL) return ALL;
    const e = extract(window.UV_SRC.css, () => false);
    return ALL = { kf: e.kf, props: e.props };
  }
  const FAMILY_CLASSES = { btn: ["uv-btn"], card: ["uv-card"], input: ["uv-input", "uv-select", "uv-textarea", "uv-otp"], switch: ["uv-switch"], check: ["uv-check"], range: ["uv-range"],
    tabs: ["uv-tabs", "uv-panel"], nav: ["uv-nav", "uv-sidenav", "uv-pages", "uv-menu"], badge: ["uv-badge", "uv-chip"], alert: ["uv-alert", "uv-toast", "uv-toasts"], modal: ["uv-modal", "uv-cmdk"],
    spinner: ["uv-spinner"], progress: ["uv-progress"], head: ["uv-h1", "uv-h2"], bg: [] };
  const JS_OF = { toast: "feedback", modal: "feedback", cmdk: "feedback", confetti: "feedback", sound: "feedback", copy: "feedback", tabs: "forms", otp: "forms", range: "forms", drop: "forms",
    countUp: "motion", typewriter: "motion", scramble: "motion", reveal: "motion", tilt: "motion", magnetic: "motion", spotlight: "motion", ripple: "motion", parallax: "motion", ring: "motion",
    scroll: "motion", scrollbar: "motion", smoothScroll: "motion", steps: "motion", layers: "layers" };

  // ── resolve picks → package parts ────────────────────────────────────────
  function resolve(ids) {
    const P = window.UV_PARTS, pk = { themes: new Set(), parts: {}, partList: [], classes: new Set(), js: new Set(["core"]), layers: {}, blocks: [], native: new Set(), fx: new Set(), samples: [], cols: [], icons: [], skins: [] };
    const COLS = Object.fromEntries(((window.UV_COLLECTIONS || {}).collections || []).map(c => [c.key, c]));
    for (const id of ids) {
      const [kind, a, b] = id.split("/");
      if (kind === "theme") pk.themes.add(a);
      else if (kind === "kit") { const k = P.kits.find(x => x.name === a); if (k) { pk.themes.add(k.theme); Object.entries(k.parts).forEach(([f, n]) => { pk.parts[f] = n; pk.partList.push([f, n]); }); } }
      else if (kind === "part") { pk.parts[a] = b; pk.partList.push([a, b]); }
      else if (kind === "layer") {
        const [opt, type] = (b || "").split("@");
        const page = UV.layers.defs.pageKinds.some(k => k.key === a);
        const t = page ? "page" : type || "btn";
        (pk.layers[t] ||= {})[a] = { o: opt };
        const o = UV.layers.option(a, opt);
        if (o && (o.js || o.page || a === "enter" || a === "fx")) pk.js.add("layers");
        if (o && o.js) pk.js.add(["ripple", "magnetic", "tilt", "spotlight"].includes(o.js) ? "motion" : "feedback");
        if (o && o.page) { if (o.page.canvas === "waterfall") pk.js.add("waterfall"); else if (o.page.canvas || o.page.cursor) pk.js.add("fx"); if (o.page.scroll) pk.js.add("motion"); }
      }
      else if (kind === "fx") { pk.classes.add(a); pk.fx.add(a); if (/scrub|reveal/.test(a)) pk.js.add("motion"); }
      else if (kind === "comp") pk.classes.add(a);
      else if (kind === "js") { const n = a.replace(/^UV\./, ""); if (n.startsWith("fx.")) pk.js.add(n === "fx.waterfall" ? "waterfall" : "fx"); else pk.js.add(JS_OF[n] || "motion"); }
      else if (kind === "block") pk.blocks.push(+a);
      else if (kind === "native") pk.native.add(a);
      else if (kind === "skin3d") { pk.skins.push(a); pk.js.add("skins3d"); }
      else if (kind === "col") { const it = COLS[a] && COLS[a].items.find(x => x.name === b); if (it) (a === "icons" ? pk.icons : pk.cols).push(it); }
    }
    for (const f of Object.keys(pk.parts)) FAMILY_CLASSES[f].forEach(c => pk.classes.add(c));
    for (const t of Object.keys(pk.layers)) { const fam = FAMILY_CLASSES[t]; fam && fam.forEach(c => pk.classes.add(c)); }
    for (const i of pk.blocks) { const html = ((window.BLOCKS || [])[i] || [])[2] || ""; for (const m of html.matchAll(/class="([^"]+)"/g)) m[1].split(/\s+/).forEach(c => /^(uv-|b-|blk)/.test(c) && pk.classes.add(c.replace(/--.*$/, ""))); }
    if ([...pk.classes].some(c => c.startsWith("uv-tabs") || c === "uv-otp" || c === "uv-range")) pk.js.add("forms");
    return pk;
  }

  function cssFor(pk) {
    const A = all(), out = [];
    const core = window.UV_SRC.css.match(/\/\*! UI Vault[^*]*core\.css[\s\S]*?(?=\/\*! UI Vault[^*]*components\.css)/);
    out.push("/* core: tokens, light/dark, helpers */\n" + (core ? core[0].replace(/^\/\*![^*]*\*\/\n?/, "") : ""));
    if (pk.classes.size) {
      const re = [...pk.classes].map(cls);
      out.push("/* components & effects you picked: " + [...pk.classes].join(", ") + " */\n" + withDeps(extract(window.UV_SRC.css, sel => re.some(r => r.test(sel)) && !sel.includes("data-uv-theme")), A.kf, A.props));
    }
    for (const t of pk.themes) out.push(`/* theme: ${t} */\n` + withDeps(extract(window.UV_SRC.css, sel => sel.includes(`[data-uv-theme="${t}"]`)), A.kf, A.props));
    if (pk.partList.length) {
      const src = window.UV_PARTS_SRC, done = new Set();
      out.push("/* element-design keyframes */\n" + src._keyframes);
      for (const [f, n] of pk.partList) {
        if (done.has(f + "/" + n)) continue; done.add(f + "/" + n);
        const s = src[f] || "";
        if (!done.has("reset/" + f)) { done.add("reset/" + f); out.push(s.slice(s.indexOf("/* shared reset"), s.indexOf("/* @part")).trim()); }
        const i = s.indexOf(`/* @part ${f}/${n} `), j = s.indexOf("/* @part", i + 5);
        if (i >= 0) out.push(s.slice(i, j < 0 ? undefined : j).trim());
      }
    }
    if (Object.keys(pk.layers).length) out.push("/* effect layers */\n" + UV.layers.css(pk.layers));
    if (pk.cols.length || pk.icons.length) {
      const C = window.UV_COLLECTIONS, body = pk.cols.map(i => i.css).join("\n");
      const kfs = (C.keyframes.match(/@(keyframes|property)[^{]+\{(?:[^{}]|\{[^{}]*\})*\}/g) || []).filter(k => { const n = k.split(/\s+/)[1]; return body.includes(n); });
      out.push("/* collections: " + [...pk.cols, ...pk.icons].map(i => i.cls === "uv-icon" ? "icon " + i.name : i.cls).join(", ") + " */\n" + kfs.join("\n") + "\n" + (pk.icons.length ? C.iconBase + "\n" : "") + body);
    }
    return out.join("\n\n") + "\n";
  }

  // ── usage code ───────────────────────────────────────────────────────────
  const SAMPLE = {
    btn: '<button class="uv-btn uv-btn--primary">Primary</button> <button class="uv-btn">Secondary</button>',
    card: '<div class="uv-card"><h3>Card title</h3><p>Some content.</p></div>',
    input: '<input class="uv-input" placeholder="you@example.com">',
    switch: '<label class="uv-switch"><input type="checkbox" checked><i></i> Notifications</label>',
    check: '<label class="uv-check"><input type="checkbox" checked> Remember me</label>',
    range: '<input type="range" class="uv-range" value="60">',
    tabs: '<div class="uv-tabs"><button aria-selected="true">One</button><button>Two</button><button>Three</button></div>',
    nav: '<nav class="uv-nav"><a class="is-active" href="#">Home</a><a href="#">Docs</a><a href="#">Blog</a></nav>',
    badge: '<span class="uv-badge uv-badge--accent">New</span> <span class="uv-badge uv-badge--success">Live</span>',
    alert: '<div class="uv-alert uv-alert--success">Saved. Your changes are live.</div>',
    modal: '<dialog class="uv-modal" open><div><h3>Hello</h3><p>A dialog.</p></div></dialog>',
    spinner: '<div class="uv-spinner"></div>', progress: '<div class="uv-progress" style="--v:60%"><i></i></div>',
    head: '<h1 class="uv-h1">Headline</h1>', bg: "",
  };
  const PYW = { btn: 'uv.Button("Save", primary=True)', card: "uv.Card()", input: 'uv.LineEdit(placeholder="you@example.com")', switch: 'uv.Switch("Notifications", True)',
    check: 'uv.CheckBox("Remember me", True)', range: "uv.Slider(60)", tabs: 'uv.TabBar(["One", "Two", "Three"])', nav: 'uv.NavBar(["Home", "Docs", "Blog"])',
    badge: 'uv.Badge("New", "accent")', alert: 'uv.Alert("Saved.", "success")', modal: "uv.Dialog()", spinner: "uv.Spinner(28)", progress: "uv.ProgressBar(60)", head: 'uv.Heading("Headline", 44)', bg: "uv.Surface()" };
  function code(ids) {
    const pk = resolve(ids), P = window.UV_PARTS;
    const theme = [...pk.themes][0] || "";
    const attrs = [theme && `data-uv-theme="${theme}"`, ...Object.entries(pk.parts).map(([f, n]) => `data-uv-${f}="${n}"`)].filter(Boolean);
    const fams = new Set([...Object.keys(pk.parts), ...Object.keys(pk.layers).filter(t => SAMPLE[t] != null)]);
    const html = [`<!-- 1. the files from your zip (uivault/) -->`, `<link rel="stylesheet" href="uivault/css/uivault.picked.css">`,
      ...[...pk.js].map(m => `<script src="uivault/js/${m}.js" defer></` + "script>"),
      "", "<!-- 2. switch on your picks (on <html>, or on any element to scope them) -->", `<html${attrs.length ? "\n  " + attrs.join("\n  ") : ""}>`, "", "<!-- 3. use them -->",
      ...[...fams].map(f => SAMPLE[f]).filter(Boolean),
      ...[...pk.fx].map(c => `<h2 class="${c}" data-text="Effect">Effect</h2>`),
      ...[...pk.classes].filter(c => !pk.fx.has(c) && !Object.values(FAMILY_CLASSES).flat().includes(c)).map(c => `<div class="${c}"><!-- see docs.html for the markup --></div>`),
      ...pk.blocks.map(i => `<!-- block: ${((window.BLOCKS || [])[i] || [])[1]} (full markup in index.html) -->`),
      ...pk.skins.map((m, i) => `<div data-uv-3d="${m}" data-shape="${["blade", "gem", "knot", "coin", "sphere", "cube", "tag", "torus"][i % 8]}" data-drag style="width:320px;height:320px"></div>`),
      ...pk.cols.map(i => i.html), ...(pk.icons.length ? ["<!-- icons: paste the SVG, or use the sprite in css/icons.svg -->", pk.icons.map(i => i.html).join(" ")] : [])];
    const js = [];
    if (Object.keys(pk.layers).length) js.push(`UV.layers.apply(${JSON.stringify(pk.layers)});`);
    ids.filter(i => i.startsWith("js/")).forEach(i => js.push(`${i.slice(3)}(/* see docs.html */);`));
    if (js.length) html.push("", "<script>", ...js.map(l => "  " + l), "</" + "script>");
    const pyParts = Object.keys(pk.parts).length ? `, parts=${JSON.stringify(pk.parts).replace(/"/g, '"')}` : "";
    const pyLayers = Object.keys(pk.layers).length ? `, layers=${JSON.stringify(pk.layers)}` : "";
    const py = [`# pip install "git+https://github.com/thenameiscobmarley/ui-vault#subdirectory=uivault3"   (or use python/ from your zip)`,
      "from PySide6.QtWidgets import QApplication, QVBoxLayout", "import uivault3 as uv", "", "app = QApplication([])",
      `uv.apply(app${theme ? `, theme="${theme}"` : ""}${pyParts}${pyLayers})`, "win = uv.Surface(); lay = QVBoxLayout(win)",
      ...[...fams].filter(f => PYW[f]).map(f => `lay.addWidget(${PYW[f]})`), "win.show(); app.exec()"].join("\n").replace(/:true/g, ": True").replace(/:false/g, ": False");
    const look = [`uv3::Look{}${theme ? `.theme("${theme}")` : ""}`, ...Object.entries(pk.parts).map(([f, n]) => `.part("${f}", "${n}")`),
      ...Object.entries(pk.layers).flatMap(([t, ks]) => Object.entries(ks).map(([k, v]) => `.layer("${t}", "${k}", "${v.o}")`))].join("\n        ");
    const CW = { btn: 'new uv3::Button("Save", true)', card: "new uv3::Card", input: 'new uv3::LineEdit("", "you@example.com")', switch: 'new uv3::Switch("Notifications", true)', check: 'new uv3::CheckBox("Remember me", true)',
      range: "new uv3::Slider(60)", tabs: 'new uv3::TabBar({"One", "Two", "Three"})', nav: 'new uv3::NavBar({"Home", "Docs", "Blog"})', badge: 'new uv3::Badge("New", "accent")', alert: 'new uv3::Alert("Saved.", "success")',
      spinner: "new uv3::Spinner(28)", progress: "new uv3::ProgressBar(60)", head: 'new uv3::Heading("Headline", 44)' };
    const cpp = [`// add cpp/uivault3/uivault3.h, uivault3.cpp, uivault3_data.cpp from your zip (Qt 6 Widgets, AUTOMOC)`, `#include "uivault3.h"`, "",
      "int main(int argc, char** argv) {", "    QApplication app(argc, argv);", `    uv3::apply(&app, ${look});`, "    auto* win = new uv3::Surface; auto* lay = new QVBoxLayout(win);",
      ...[...fams].filter(f => CW[f]).map(f => `    lay->addWidget(${CW[f]});`), "    win->show();", "    return app.exec();", "}"].join("\n");
    return { html: html.join("\n"), py, cpp, pk };
  }

  // ── package files ────────────────────────────────────────────────────────
  async function files(ids, opt = { web: true, example: true, python: true, cpp: true, mine: true }) {
    await ensure();
    const { html, py, cpp, pk } = code(ids), out = [];
    const mine = { theme: store.get("uv-skin", ""), parts: store.get("uv-parts", {}), layers: store.get("uv-layers", {}) };
    if (opt.web) {
      out.push(["uivault/css/uivault.picked.css", `/*! UI Vault — your picks: ${ids.join(", ")} · MIT */\n` + cssFor(pk)]);
      const fonts = window.UV_SRC.css.match(/@import url\([^)]*\);/); if (fonts) out.push(["uivault/css/fonts.css", fonts[0] + "\n"]);
      for (const m of pk.js) if (window.UV_SRC.js[m]) out.push([`uivault/js/${m}.js`, window.UV_SRC.js[m]]);
      if (pk.icons.length) out.push(["uivault/css/icons.svg", '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' + pk.icons.map(i => i.html.replace(/^<svg class="uv-icon" viewBox="0 0 24 24" aria-hidden="true">/, `<symbol id="${i.name}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">`).replace(/<\/svg>$/, "</symbol>")).join("\n") + "\n</svg>\n"]);
    }
    if (opt.example) {
      const theme = [...pk.themes][0] || "";
      const attrs = [theme && `data-uv-theme="${theme}"`, ...Object.entries(pk.parts).map(([f, n]) => `data-uv-${f}="${n}"`)].filter(Boolean).join(" ");
      const blocksHtml = pk.blocks.map(i => ((window.BLOCKS || [])[i] || [])[2] || "").join("\n");
      const usage = html.split("<!-- 3. use them -->")[1] || "";
      out.push(["uivault/index.html", `<!doctype html>\n<html lang="en" data-theme="dark" ${attrs}>\n<head>\n<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">\n<title>My UI Vault picks</title>\n<link rel="stylesheet" href="css/fonts.css">\n<link rel="stylesheet" href="css/uivault.picked.css">\n${[...pk.js].map(m => `<script src="js/${m}.js" defer></` + "script>").join("\n")}\n<style>body{margin:0;padding:40px;display:grid;gap:22px;max-width:900px;background:var(--uv-bg);color:var(--uv-text);font-family:var(--uv-font)}</style>\n</head>\n<body class="uv">\n<h1 class="uv-h1">My UI Vault picks</h1>\n${usage.replace(/<script>[\s\S]*$/, "")}\n${blocksHtml}\n${usage.includes("<script>") ? "<script>document.addEventListener('DOMContentLoaded',()=>{" + (usage.split("<script>")[1] || "").split("</" + "script>")[0] + "})</" + "script>" : ""}\n</body>\n</html>\n`]);
      out.push(["uivault/README.md", `# My UI Vault package\n\nPicked on ${new Date().toISOString().slice(0, 10)}: ${ids.length} item(s).\n\n${ids.map(i => "- " + i).join("\n")}\n\n## Web\n\n\`\`\`html\n${html}\n\`\`\`\n\nOpen \`uivault/index.html\` to see them working.\n\n## Python (UiVault3 / PySide6)\n\n\`\`\`python\n${py}\n\`\`\`\n\n## C++ (UiVault3 / Qt 6)\n\n\`\`\`cpp\n${cpp}\n\`\`\`\n\nDocs: https://thenameiscobmarley.github.io/ui-vault/ · MIT\n`]);
    }
    if (opt.mine && (mine.theme || Object.keys(mine.parts).length || Object.keys(mine.layers).length)) {
      out.push(["uivault/my-style.json", JSON.stringify(mine, null, 2)]);
      out.push(["uivault/my-style.css", `/* Your site customizations (Effects / Inspector). Put data-uv-theme="${mine.theme}" ${Object.entries(mine.parts).map(([f, n]) => `data-uv-${f}="${n}"`).join(" ")} on <html>. */\n` + UV.layers.css(Object.fromEntries(Object.entries(mine.layers).filter(([k]) => k !== "@el")))]);
    }
    const fetchAll = async list => Promise.all(list.map(async ([dst, src]) => { const r = await fetch(BASE + src); if (!r.ok) throw new Error(src); return [dst, new Uint8Array(await r.arrayBuffer())]; }));
    if (opt.python) {
      out.push(...await fetchAll(["__init__.py", "__main__.py", "demo.py", "engine.py", "style.py", "widgets.py", "data/native.json", "data/layers.json", "data/tokens.json"].map(f => [`python/uivault3/${f}`, `uivault3/uivault3/${f}`])));
      out.push(...await fetchAll([["python/pyproject.toml", "uivault3/pyproject.toml"], ["python/README.md", "uivault3/README.md"]]));
      out.push(["python/my_ui.py", py + "\n"]);
      if (opt.mine) out.push(["python/load_my_style.py", 'import uivault3 as uv\n# apply the style you built on the website (my-style.json is in uivault/)\nuv.load("../uivault/my-style.json")\n']);
    }
    if (opt.cpp) {
      out.push(...await fetchAll(["uivault3.h", "uivault3.cpp", "uivault3_data.cpp", "CMakeLists.txt", "README.md"].map(f => [`cpp/uivault3/${f}`, `cpp/uivault3/${f}`])));
      out.push(["cpp/uivault3/example.cpp", cpp.replace('#include "uivault3.h"', '#include <QApplication>\n#include <QVBoxLayout>\n#include "uivault3.h"') + "\n"]);
    }
    out.push(["LICENSE.txt", "MIT License — UI Vault (https://github.com/thenameiscobmarley/ui-vault)\n"]);
    return out;
  }

  // minimal ZIP writer (store method)
  const crcT = new Uint32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
  const crc32 = b => { let c = ~0; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return ~c >>> 0; };
  function zip(list) {
    const enc = new TextEncoder(), parts = [], cent = []; let off = 0;
    const u16 = v => [v & 255, v >> 8 & 255], u32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
    for (const [name, data] of list) {
      const n = enc.encode(name), d = typeof data === "string" ? enc.encode(data) : data, c = crc32(d);
      const head = [...u32(0x04034b50), ...u16(20), ...u16(0x800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0)];
      parts.push(new Uint8Array(head), n, d);
      cent.push(new Uint8Array([...u32(0x02014b50), ...u16(20), ...u16(20), ...u16(0x800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), n);
      off += head.length + n.length + d.length;
    }
    const cs = cent.reduce((a, b) => a + b.length, 0);
    return new Blob([...parts, ...cent, new Uint8Array([...u32(0x06054b50), ...u16(0), ...u16(0), ...u16(list.length), ...u16(list.length), ...u32(cs), ...u32(off), ...u16(0)])], { type: "application/zip" });
  }
  async function download(ids, opt, name = "my-uivault.zip") {
    const list = await files(ids, opt);
    const a = document.createElement("a"); a.href = URL.createObjectURL(zip(list)); a.download = name; a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    return list;
  }
  window.UVPack = { get, set, toggle, ensure, resolve, code, cssFor, files, zip, download };
})();
