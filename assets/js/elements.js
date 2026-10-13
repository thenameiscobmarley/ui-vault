// Elements page: every part design as a live tile, kits, the current mix, and a code view (HTML / CSS / Python / C++).
(() => {
  "use strict";
  const D = window.UV_PARTS, P = window.UVPicker;
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const SITE = "https://thenameiscobmarley.github.io/ui-vault/";
  const FAM = Object.fromEntries(D.families.map(f => [f.key, f]));

  // sample markup per family (NAME is replaced so radios in different tiles don't share a group)
  const SAMPLE = {
    btn: `<button class="uv-btn uv-btn--primary" type="button">Primary</button><button class="uv-btn" type="button">Secondary</button>`,
    card: `<div class="uv-card"><b class="uv-h3">Weekly report</b><p class="uv-muted">12 new sign-ups and 3 issues closed this week.</p></div>`,
    input: `<div class="col"><input class="uv-input" placeholder="you@example.com" aria-label="Email"><select class="uv-select" aria-label="Plan"><option>Starter project</option><option>Team project</option></select></div>`,
    switch: `<div class="col"><label class="uv-switch"><input type="checkbox" checked><i></i> Notifications</label><label class="uv-switch"><input type="checkbox"><i></i> Auto-update</label></div>`,
    check: `<div class="col"><label class="uv-check"><input type="checkbox" checked> Remember me</label><label class="uv-check"><input type="checkbox"> Weekly digest</label><label class="uv-check"><input type="radio" name="r-NAME" checked> Radio option</label></div>`,
    range: `<div class="col"><input type="range" class="uv-range" value="64" aria-label="Volume"><input type="range" class="uv-range" value="28" aria-label="Balance"></div>`,
    tabs: `<div class="uv-tabs"><button type="button" aria-selected="true">Overview</button><button type="button">Activity</button><button type="button">Settings</button></div>`,
    nav: `<div class="col"><nav class="uv-nav"><a href="#!" class="is-active">Home</a><a href="#!">Projects</a><a href="#!">Team</a></nav><div class="uv-pages"><a href="#!">‹</a><a href="#!">1</a><a href="#!" class="is-active">2</a><a href="#!">3</a><span>…</span><a href="#!">›</a></div></div>`,
    badge: `<span class="uv-badge uv-badge--accent">New</span><span class="uv-badge uv-badge--success">Live</span><span class="uv-badge uv-badge--warn">Beta</span><span class="uv-badge uv-badge--danger">3 issues</span><span class="uv-chip is-active">Design</span><span class="uv-chip">Code</span>`,
    alert: `<div class="col"><div class="uv-alert uv-alert--success">Saved. Your changes are live.</div><div class="uv-toast uv-toast--error"><span class="uv-toast__icon">!</span>Upload failed, try again</div></div>`,
    modal: `<dialog class="uv-modal" open><div><b class="uv-h3">Delete project?</b><p class="uv-muted" style="margin:6px 0 12px;font-size:13px">This removes 24 files and can't be undone.</p><button class="uv-btn uv-btn--sm" type="button">Cancel</button> <button class="uv-btn uv-btn--sm uv-btn--danger" type="button">Delete</button></div></dialog>`,
    spinner: `<div class="uv-spinner" role="status" aria-label="Loading"></div>`,
    progress: `<div class="col"><div class="uv-progress" style="--v:68%"><i></i></div><div class="uv-progress" style="--v:34%"><i></i></div></div>`,
    head: `<h2 class="uv-h2">Headline</h2>`,
    bg: ``,
  };

  // ── current mix bar ──────────────────────────────────────────────────────
  function renderMix() {
    const cur = P.getParts(), kit = P.getKit();
    const label = (k, n) => (FAM[k].parts.find(p => p.name === n) || { label: n }).label;
    const chips = Object.entries(cur).map(([k, n]) => `<span>${FAM[k].label}: <b>${esc(label(k, n))}</b><button type="button" data-clear="${k}" aria-label="Remove ${FAM[k].label} design">×</button></span>`).join("");
    const kd = kit && D.kits.find(x => x.name === kit);
    $("#mix").innerHTML = `<span class="k" style="border:0;padding:0">Your mix${kd ? ` · kit <b style="color:var(--pg-fg)">${esc(kd.label)}</b>` : ""}</span>${chips || `<em class="none">Nothing picked yet. Every element uses the theme's own look.</em>`}
      <div class="act"><button class="sbtn" type="button" data-rand>Random mix</button><button class="sbtn" type="button" data-reset>Reset</button><a class="sbtn p" href="lab.html">Open test page →</a></div>`;
  }
  $("#mix").addEventListener("click", e => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.clear) P.setParts({ [b.dataset.clear]: "" });
    if ("reset" in b.dataset) P.setParts({}, { replace: true });
    if ("rand" in b.dataset) P.setParts(Object.fromEntries(D.families.map(f => [f.key, f.parts[(Math.random() * f.parts.length) | 0].name])), { replace: true });
  });

  // ── kits ─────────────────────────────────────────────────────────────────
  const attrs = parts => Object.entries(parts).map(([k, v]) => `data-uv-${k}="${v}"`).join(" ");
  $("#kitgrid").innerHTML = D.kits.map(k => `<article class="kitt" data-kit="${k.name}">
    <div class="stage" data-uv-theme="${k.theme}" ${attrs(k.parts)}>
      <h2 class="uv-h2">${esc(k.label)}</h2>
      <div class="row"><button class="uv-btn uv-btn--primary" type="button">Get started</button><button class="uv-btn" type="button">Learn more</button></div>
      <div class="row"><label class="uv-switch"><input type="checkbox" checked><i></i></label><label class="uv-check"><input type="checkbox" checked> On</label><span class="uv-badge uv-badge--accent">New</span><span class="uv-badge uv-badge--success">Live</span></div>
      <input class="uv-input" placeholder="Search…" aria-label="Search">
      <div class="uv-progress" style="--v:62%"><i></i></div>
    </div>
    <footer><div><b>${esc(k.label)}</b><small>${esc(k.desc)} · theme ${k.theme}</small></div><button class="sbtn" type="button" data-apply>Apply</button><button class="sbtn" type="button" data-try>Try it →</button><button class="sbtn" type="button" data-kcode>Code</button></footer></article>`).join("");
  $("#kitgrid").addEventListener("click", async e => {
    const b = e.target.closest("button"), t = e.target.closest("[data-kit]"); if (!b || !t) return;
    const name = t.dataset.kit;
    if ("apply" in b.dataset) { if (P.getKit() === name) { P.setParts({}, { replace: true }); P.apply(""); } else P.applyKit(name); }
    if ("try" in b.dataset) { await P.applyKit(name); location.href = "lab.html"; }
    if ("kcode" in b.dataset) openCode(null, name);
  });

  // ── family sections ──────────────────────────────────────────────────────
  $("#total").textContent = D.families.reduce((n, f) => n + f.parts.length, 0);
  $("#fams").innerHTML = D.families.map(f => `<a href="#f-${f.key}" data-k="${f.key}">${f.label}<small>${f.parts.length}</small></a>`).join("") +
    `<select id="pvTheme" aria-label="Preview theme"><option value="">Preview: page theme</option></select>`;
  $("#famsecs").innerHTML = D.families.map(f => `<section id="f-${f.key}" style="scroll-margin-top:130px">
    <div class="section-h" style="margin-top:36px"><p class="k">${f.parts.length} designs · data-uv-${f.key}</p><h2>${f.label}</h2><p>${esc(f.desc)}.</p></div>
    <div class="grid">${f.parts.map(p => `<article class="tile" data-f="${f.key}" data-n="${p.name}">
      <div class="stage" data-uv-${f.key}="${p.name}">${SAMPLE[f.key].replace(/NAME/g, f.key + p.name)}</div>
      <footer><div><b>${esc(p.label)}</b><small title="${esc(p.desc)}">${esc(p.desc)}</small></div><button class="sbtn" type="button" data-use>Use</button><button class="sbtn" type="button" data-code>Code</button></footer></article>`).join("")}</div></section>`).join("");
  UV.init($("#famsecs")); UV.init($("#kitgrid"));
  // sections are built by script, so jump to #f-… ourselves
  if (location.hash.length > 1) { const t = document.getElementById(location.hash.slice(1)); t && requestAnimationFrame(() => t.scrollIntoView()); }

  // preview every tile under a chosen theme (the page theme by default)
  const themeList = async () => {
    if (!window.UV_TOKENS) await new Promise(r => { const s = document.createElement("script"); s.src = "lib/tokens.js"; s.onload = s.onerror = r; document.head.append(s); });
    const sel = $("#pvTheme");
    sel.innerHTML = `<option value="">Preview: page theme</option>` + Object.keys(window.UV_TOKENS.themes).map(n => `<option>${n}</option>`).join("");
  };
  $("#pvTheme").addEventListener("focus", themeList, { once: true });
  $("#pvTheme").addEventListener("pointerdown", themeList, { once: true });
  $("#pvTheme").addEventListener("change", e => { const v = e.target.value; v ? $("#famsecs").setAttribute("data-uv-theme", v) : $("#famsecs").removeAttribute("data-uv-theme"); });

  $("#famsecs").addEventListener("click", e => {
    const b = e.target.closest("button.sbtn"), t = e.target.closest(".tile"); if (!b || !t) return;
    const { f, n } = t.dataset;
    if ("use" in b.dataset) P.setParts({ [f]: P.getParts()[f] === n ? "" : n });
    if ("code" in b.dataset) openCode(f, n);
  });
  // demo links inside tiles go nowhere
  document.addEventListener("click", e => { const a = e.target.closest('a[href="#!"]'); if (a) e.preventDefault(); });

  function mark() {
    const cur = P.getParts(), kit = P.getKit();
    document.querySelectorAll(".tile").forEach(t => {
      const on = cur[t.dataset.f] === t.dataset.n;
      t.classList.toggle("on", on);
      const u = t.querySelector("[data-use]"); u.textContent = on ? "Using ✓" : "Use"; u.classList.toggle("on", on);
    });
    document.querySelectorAll(".kitt").forEach(t => {
      const on = t.dataset.kit === kit, b = t.querySelector("[data-apply]");
      b.textContent = on ? "Applied ✓" : "Apply"; b.classList.toggle("on", on);
    });
    renderMix();
  }
  document.addEventListener("uv:parts", mark);
  mark();

  // highlight the family chip for the section in view
  const chips = Object.fromEntries([...document.querySelectorAll("#fams a")].map(a => [a.dataset.k, a]));
  const io = new IntersectionObserver(es => es.forEach(en => {
    if (!en.isIntersecting) return;
    Object.values(chips).forEach(c => c.classList.remove("on"));
    const c = chips[en.target.id.slice(2)]; c.classList.add("on");
    $("#fams").scrollLeft = c.offsetLeft - 40;
  }), { rootMargin: "-40% 0px -55% 0px" });
  D.families.forEach(f => io.observe(document.getElementById("f-" + f.key)));

  // ── code dialog ──────────────────────────────────────────────────────────
  const dlg = $("#codedlg");
  let tabs = {}, curTab = "HTML", useFn = null;
  const loadSrc = () => window.UV_PARTS_SRC ? Promise.resolve() : new Promise(r => { const s = document.createElement("script"); s.src = "lib/parts-src.js"; s.onload = s.onerror = r; document.head.append(s); });
  function partCss(f, n) {
    const src = (window.UV_PARTS_SRC || {})[f] || "";
    const head = src.slice(src.indexOf("/* shared reset"), src.indexOf("/* @part"));
    const i = src.indexOf(`/* @part ${f}/${n} `); if (i < 0) return "";
    const j = src.indexOf("/* @part", i + 5);
    return `${head.trim()}\n\n${src.slice(i, j < 0 ? undefined : j).trim()}\n\n/* keyframes some designs use: see lib/css/parts/${f}.css */`;
  }
  const pyFor = (f, n, p) => `import uivault

# The web design "${n}" in Python. Native toolkits get the closest equivalent:
# radius ${p.approx.r === 999 ? "pill" : p.approx.r + "px"}, border ${p.approx.bw}px, fill "${p.approx.fill}", weight ${p.approx.w}${p.approx.up ? ", uppercase" : ""}
uivault.part("${f}", "${n}")

# Qt (PySide6 / PyQt): theme + this ${FAM[f].label.toLowerCase()} design
app.setStyleSheet(uivault.qss("editorial", parts={"${f}": "${n}"}))

# Tkinter / ttk
uivault.apply_tk(root, "editorial", parts={"${f}": "${n}"})

# GTK4: gtk_css can draw gradients and shadows, so it gets closest to the web
uivault.apply_gtk("editorial", parts={"${f}": "${n}"})`;
  const cppFor = (f, n, p) => `#include "uivault.hpp"

// "${n}" as data: radius ${p.approx.r}, border ${p.approx.bw}, Fill::${p.approx.fill}
const uivault::Part* part = uivault::findPart("${f}", "${n}");
const uivault::FillColors c = uivault::fillColors(uivault::editorial, part->fill);
// c.top / c.bottom (gradient stops), c.text, c.border, then draw with your toolkit

// Or take a whole kit (a theme + one design per element):
const uivault::Kit* kit = uivault::findKit("deep-metal");
uivault::imgui::apply(*uivault::findKitTheme(*kit), *kit);        // Dear ImGui
// app.setStyleSheet(QString::fromStdString(uivault::qss(*uivault::findKitTheme(*kit), *kit)));  // Qt`;
  async function openCode(f, n) {
    await loadSrc();
    if (f) {
      const p = FAM[f].parts.find(x => x.name === n);
      $("#cdTitle").textContent = `${FAM[f].label} · ${p.label}`;
      const sample = (SAMPLE[f] || `<main>…your page…</main>`).replace(/NAME/g, "a").replace(/></g, ">\n  <");
      tabs = {
        HTML: `<!-- in <head>: the library (or just core.css + your theme) and this family's designs -->
<link rel="stylesheet" href="${SITE}lib/uivault.css">
<link rel="stylesheet" href="${SITE}lib/css/parts/${f}.css">

<!-- whole page: -->
<html data-uv-${f}="${n}">

<!-- or one area / one element: -->
<div data-uv-${f}="${n}">
  ${sample}
</div>`,
        CSS: partCss(f, n), Python: pyFor(f, n, p), "C++": cppFor(f, n, p),
      };
      useFn = () => P.setParts({ [f]: n });
    } else {
      const k = D.kits.find(x => x.name === n);
      $("#cdTitle").textContent = `Kit · ${k.label}`;
      const files = Object.keys(k.parts).map(fk => `<link rel="stylesheet" href="${SITE}lib/css/parts/${fk}.css">`).join("\n");
      tabs = {
        HTML: `<link rel="stylesheet" href="${SITE}lib/uivault.css">\n<!-- or everything at once: lib/css/parts.css -->\n${files}\n\n<html data-uv-theme="${k.theme}"\n      ${Object.entries(k.parts).map(([a, b]) => `data-uv-${a}="${b}"`).join("\n      ")}>`,
        CSS: `/* A kit is just attributes: the CSS lives in the family files.\n   Equivalent JS: */\n${Object.entries(k.parts).map(([a, b]) => `document.documentElement.dataset.uv${a[0].toUpperCase() + a.slice(1)} = "${b}";`).join("\n")}\nUV.skin("${k.theme}");`,
        Python: `import uivault\n\n# a kit = theme "${k.theme}" + one design per element\napp.setStyleSheet(uivault.qss(kit="${k.name}"))        # Qt\nuivault.apply_tk(root, kit="${k.name}")                 # Tkinter\nuivault.apply_gtk(kit="${k.name}")                      # GTK4\nprint(uivault.kit("${k.name}"))`,
        "C++": `#include "uivault.hpp"\n\nconst uivault::Kit* kit = uivault::findKit("${k.name}");\nconst uivault::Theme* theme = uivault::findKitTheme(*kit);   // ${k.theme}\nuivault::imgui::apply(*theme, *kit);                          // Dear ImGui\nuivault::raygui::apply(*theme, *kit);                         // raygui\nuivault::juce_lf::LookAndFeel lf { *theme, *kit };            // JUCE\nstd::string qss = uivault::qss(*theme, *kit);                 // Qt`,
      };
      useFn = () => P.applyKit(n);
    }
    $("#cdTabs").innerHTML = Object.keys(tabs).map(t => `<button type="button" class="${t === curTab ? "on" : ""}">${t}</button>`).join("");
    if (!tabs[curTab]) curTab = "HTML";
    $("#cdPre").textContent = tabs[curTab];
    dlg.showModal();
  }
  $("#cdTabs").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; curTab = b.textContent; $("#cdTabs").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); $("#cdPre").textContent = tabs[curTab]; });
  $("#cdClose").onclick = () => dlg.close();
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $("#cdCopy").onclick = () => { navigator.clipboard?.writeText($("#cdPre").textContent); UV.toast?.("Copied"); };
  $("#cdUse").onclick = () => { useFn && useFn(); UV.toast?.("Applied to the whole site"); };
})();
