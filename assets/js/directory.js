// Index page: one search over every page, section, theme, element design, kit, effect, animation, component, block,
// JavaScript / Python / C++ function and open-source resource.
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const COLORS = { Collection: "#ff8fb8", Page: "#ff6a26", Section: "#ffb26b", Theme: "#b46bff", Element: "#4fd2ff", Kit: "#ff4fd8", Effect: "#39ff88", Animation: "#ffd23f", Background: "#7fe3ff",
    Component: "#9aa3b0", Block: "#c9a96e", Docs: "#86b4ff", JavaScript: "#f7df1e", Python: "#4b8bbe", "C++": "#659ad2", Resource: "#a19d95" };
  const items = [];
  const add = (k, n, d, u, g) => items.push({ k, n, d: d || "", u, g: g || "", s: (n + " " + (d || "") + " " + (g || "") + " " + k).toLowerCase() });

  for (const [k, id, n, d, u, g] of window.UV_CATALOG || []) add(k, n, d, u, g);
  for (const t of (window.UV_MANIFEST || {}).themes || []) add("Theme", t.name, `${t.category} theme: ${t.desc}`, `library.html?item=theme/${t.name}`, t.category);
  const SING = { btn: "Button", card: "Card", input: "Text field", switch: "Switch", check: "Checkbox", range: "Slider", tabs: "Tabs", nav: "Navigation", badge: "Badge", alert: "Alert", modal: "Modal", spinner: "Spinner", progress: "Progress bar", head: "Heading", bg: "Background" };
  const P = window.UV_PARTS;
  if (P) {
    for (const f of P.families) for (const p of f.parts) add("Element", `${p.label} · ${SING[f.key] || f.label}`, p.desc, `library.html?item=part/${f.key}/${p.name}`, f.label);
    for (const k of P.kits) add("Kit", k.label, `${k.desc} (theme ${k.theme})`, `library.html?item=kit/${k.name}`, "Kits");
  }
  const L = window.UV && UV.layers && UV.layers.defs;
  if (L) {
    const anim = new Set(["hover", "press", "enter", "idle"]);
    for (const k of L.kinds) if (k.key !== "fx") for (const o of k.options) add(anim.has(k.key) ? "Animation" : "Effect", `${o.label} · ${k.label}`, `${k.label} layer: stack it on any element`, `library.html?item=layer/${k.key}/${o.name}`, k.label);
    for (const k of L.pageKinds) for (const o of k.options) add("Background", `${o.label}`, `${k.label} for the whole page`, `library.html?item=layer/${k.key}/${o.name}`, k.label);
  }
  for (const col of (window.UV_COLLECTIONS || {}).collections || []) for (const i of col.items) add("Collection", `${i.label} · ${col.label.replace(/s$/, "")}`, i.cls === "uv-icon" ? `icon "${i.name}"` : `class="${i.cls}"`, `library.html?item=col/${col.key}/${i.name}`, col.label);
  (window.BLOCKS || []).forEach(([cat, name], i) => add("Block", name, `${cat} section template`, `library.html?item=block/${i}`, cat));
  (window.RESOURCES || []).forEach(r => add("Resource", r[0], `${r[4]} · ${r[3]}`, r[1], r[2]));

  // ── counts + chips ───────────────────────────────────────────────────────
  const kinds = {}; items.forEach(i => kinds[i.k] = (kinds[i.k] || 0) + 1);
  const order = ["Page", "Section", "Theme", "Element", "Kit", "Effect", "Animation", "Background", "Collection", "Component", "Block", "Docs", "JavaScript", "Python", "C++", "Resource"].filter(k => kinds[k]);
  $("#counts").innerHTML = `<span><b>${items.length.toLocaleString()}</b> things</span>` + ["Theme", "Element", "Effect", "Animation", "Resource"].filter(k => kinds[k]).map(k => `<span><b>${kinds[k]}</b>${k.toLowerCase()}s</span>`).join("");
  let kind = "All";
  $("#chips").innerHTML = `<button type="button" class="on" data-k="All">All<small>${items.length}</small></button>` + order.map(k => `<button type="button" data-k="${k}">${k === "JavaScript" ? "JS" : k}<small>${kinds[k]}</small></button>`).join("");
  $("#chips").onclick = e => { const b = e.target.closest("button"); if (!b) return; kind = b.dataset.k; $("#chips").querySelectorAll("button").forEach(x => x.classList.toggle("on", x === b)); run(); };

  // ── search ───────────────────────────────────────────────────────────────
  let shown = 60, sel = 0, last = [];
  function score(it, terms) {
    let sc = 0; const n = it.n.toLowerCase();
    for (const t of terms) {
      const i = it.s.indexOf(t); if (i < 0) return -1;
      sc += n === t ? 60 : n.startsWith(t) ? 30 : n.includes(t) ? 18 : 4;
    }
    return sc + ({ Page: 14, Section: 8, Theme: 4, Kit: 4, Element: 3, Docs: 5 }[it.k] || 0) - it.n.length * .05;
  }
  const hl = (text, terms) => { let t = esc(text); for (const q of terms) if (q.length > 1) t = t.replace(new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig"), "<mark>$1</mark>"); return t; };
  function run() {
    const q = $("#q").value.trim().toLowerCase(), terms = q.split(/\s+/).filter(Boolean);
    const pool = items.filter(i => kind === "All" || i.k === kind);
    $("#dir").hidden = !!(q || kind !== "All");
    if (!q && kind === "All") { $("#res").innerHTML = ""; history.replaceState(null, "", location.pathname); return; }
    last = q ? pool.map(i => [score(i, terms), i]).filter(x => x[0] >= 0).sort((a, b) => b[0] - a[0]).map(x => x[1]) : pool;
    sel = Math.min(sel, Math.max(0, last.length - 1));
    const ext = u => /^https?:/.test(u);
    $("#res").innerHTML = last.slice(0, shown).map((it, i) => `<li class="${i === sel ? "sel" : ""}${ext(it.u) ? " ext" : ""}" data-i="${i}"><a href="${esc(it.u)}"${ext(it.u) ? ' target="_blank" rel="noopener"' : ""}>
      <span class="kind" style="--c:${COLORS[it.k] || "#888"}"><i></i>${it.k === "JavaScript" ? "JS" : it.k}</span>
      <span><b>${hl(it.n, terms)}</b><small>${hl(it.d, terms)}</small></span><span class="go">${ext(it.u) ? new URL(it.u).hostname.replace("www.", "") + " ↗" : esc(it.u.split("?")[0].split("#")[0] || "home")}</span></a></li>`).join("")
      + (last.length > shown ? `<li><button class="more" type="button" id="more">Show ${Math.min(120, last.length - shown)} more of ${last.length - shown}</button></li>` : "")
      + (!last.length ? `<li class="empty">Nothing matches “${esc(q)}”. Try a simpler word, or browse the <a href="library.html" style="color:var(--pg-ac)">Library</a>.</li>` : "");
    const m = $("#more"); if (m) m.onclick = () => { shown += 120; run(); };
    history.replaceState(null, "", q ? "?q=" + encodeURIComponent(q) : location.pathname);
  }
  $("#q").addEventListener("input", () => { shown = 60; sel = 0; run(); });
  // the mouse and the arrow keys share one highlight, so there is never more than one lit row
  $("#res").addEventListener("mouseover", e => {
    const li = e.target.closest("li[data-i]"); if (!li || +li.dataset.i === sel) return;
    sel = +li.dataset.i; $("#res").querySelectorAll("li.sel").forEach(x => x.classList.remove("sel")); li.classList.add("sel");
  });
  $("#q").addEventListener("keydown", e => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); sel = Math.max(0, Math.min(last.length - 1, sel + (e.key === "ArrowDown" ? 1 : -1))); run(); document.querySelector(".res li.sel")?.scrollIntoView({ block: "nearest" }); }
    if (e.key === "Enter" && last[sel]) { const a = document.querySelector(".res li.sel a"); a && a.click(); }
  });
  document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement !== $("#q")) { e.preventDefault(); $("#q").focus(); } });

  // ── directory (shown while the box is empty) ─────────────────────────────
  const pages = items.filter(i => i.k === "Page"), secs = items.filter(i => i.k === "Section");
  const groups = {};
  pages.forEach(p => (groups[p.g] ||= []).push(p));
  $("#groups").innerHTML = Object.entries(groups).map(([g, ps]) => `<div class="grp"><p class="k">${g}</p><h2>${{ Start: "Start here", Design: "Design", Code: "Code", Examples: "Examples" }[g] || g}</h2>
    ${ps.map(p => { const sub = secs.filter(s => s.g === p.n); return `<a href="${p.u}"><b>${p.n}</b><small>${esc(p.d)}</small></a>${sub.length ? `<div class="subs">${sub.map(s => `<a href="${s.u}">${esc(s.n)}</a>`).join("")}</div>` : ""}`; }).join("")}</div>`).join("")
    + `<div class="grp"><p class="k">Browse</p><h2>By kind</h2>${order.filter(k => !["Page", "Section"].includes(k)).map(k => `<a href="#" data-kind="${k}"><b>${k === "C++" ? "C++ API" : k === "Python" ? "Python API" : k + "s"}</b><small>${kinds[k]} items</small></a>`).join("")}</div>`;
  $("#groups").addEventListener("click", e => { const a = e.target.closest("[data-kind]"); if (!a) return; e.preventDefault(); $(`#chips [data-k="${a.dataset.kind}"]`).click(); scrollTo(0, 0); });

  const q0 = new URLSearchParams(location.search).get("q");
  if (q0) $("#q").value = q0;
  run();
})();
