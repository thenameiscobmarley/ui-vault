// Library page: every item live, grouped by category; Add puts it in your package (UVPack), the tray shows the code.
(() => {
  "use strict";
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const P = window.UV_PARTS, L = UV.layers.defs, CAT = window.UV_CATALOG || [];
  const FAM = Object.fromEntries(P.families.map(f => [f.key, f]));

  const SAMPLE = {
    btn: `<button class="uv-btn uv-btn--primary" type="button">Primary</button><button class="uv-btn" type="button">Secondary</button>`,
    card: `<div class="uv-card"><b class="uv-h3">Weekly report</b><p class="uv-muted">12 new sign-ups and 3 issues closed.</p></div>`,
    input: `<div class="col"><input class="uv-input" placeholder="you@example.com" aria-label="Email"><select class="uv-select" aria-label="Plan"><option>Starter</option></select></div>`,
    switch: `<div class="col"><label class="uv-switch"><input type="checkbox" checked><i></i> Notifications</label><label class="uv-switch"><input type="checkbox"><i></i> Auto-update</label></div>`,
    check: `<div class="col"><label class="uv-check"><input type="checkbox" checked> Remember me</label><label class="uv-check"><input type="checkbox"> Weekly digest</label><label class="uv-check"><input type="radio" name="r-NAME" checked> Radio</label></div>`,
    range: `<div class="col"><input type="range" class="uv-range" value="64" aria-label="Volume"><input type="range" class="uv-range" value="28" aria-label="Balance"></div>`,
    tabs: `<div class="uv-tabs"><button type="button" aria-selected="true">Overview</button><button type="button">Activity</button><button type="button">Settings</button></div>`,
    nav: `<div class="col"><nav class="uv-nav"><a href="#!" class="is-active">Home</a><a href="#!">Projects</a><a href="#!">Team</a></nav><div class="uv-pages"><a href="#!">‹</a><a href="#!">1</a><a href="#!" class="is-active">2</a><a href="#!">3</a><a href="#!">›</a></div></div>`,
    badge: `<span class="uv-badge uv-badge--accent">New</span><span class="uv-badge uv-badge--success">Live</span><span class="uv-badge uv-badge--warn">Beta</span><span class="uv-chip is-active">Design</span>`,
    alert: `<div class="col"><div class="uv-alert uv-alert--success">Saved. Your changes are live.</div><div class="uv-toast uv-toast--error"><span class="uv-toast__icon">!</span>Upload failed</div></div>`,
    modal: `<dialog class="uv-modal" open><div><b class="uv-h3">Delete project?</b><p class="uv-muted" style="margin:6px 0 12px;font-size:13px">This can't be undone.</p><button class="uv-btn uv-btn--sm" type="button">Cancel</button></div></dialog>`,
    spinner: `<div class="uv-spinner" role="status" aria-label="Loading"></div>`,
    progress: `<div class="col"><div class="uv-progress" style="--v:68%"><i></i></div><div class="uv-progress" style="--v:34%"><i></i></div></div>`,
    head: `<h2 class="uv-h2">Headline</h2>`, bg: ``,
  };
  // markup for the base components (the rest get a labelled box)
  const COMP = {
    "uv-grad-text": `<h2 class="uv-h2 uv-grad-text">Gradient</h2>`, "uv-shimmer-text": `<h2 class="uv-h2 uv-shimmer-text">Shimmer</h2>`, "uv-aurora-text": `<h2 class="uv-h2 uv-aurora-text">Aurora</h2>`,
    "uv-glow-text": `<h2 class="uv-h2 uv-glow-text">Glow</h2>`, "uv-outline-text": `<h2 class="uv-h2 uv-outline-text">Outline</h2>`, "uv-highlight": `<p>Some <span class="uv-highlight">highlighted</span> text</p>`,
    "uv-btn": SAMPLE.btn, "uv-ripple": `<button class="uv-btn uv-btn--primary" data-uv="ripple" type="button">Click me</button>`, "uv-btn-group": `<div class="uv-btn-group"><button class="uv-btn">Day</button><button class="uv-btn">Week</button><button class="uv-btn">Month</button></div>`,
    "uv-card": SAMPLE.card, "uv-glass": `<div class="uv-card uv-glass" style="width:100%">Frosted glass panel</div>`, "uv-tilt": `<div class="uv-card uv-tilt" data-uv="tilt" style="width:100%">Tilt me <span class="uv-glare"></span></div>`,
    "uv-badge": SAMPLE.badge, "uv-avatar": `<span class="uv-avatar" data-status="online">KM</span><span class="uv-avatar uv-avatar--ring">AL</span>`,
    "uv-avatar-stack": `<div class="uv-avatar-stack"><span class="uv-avatar">A</span><span class="uv-avatar">B</span><span class="uv-avatar">C</span></div>`, "uv-kbd": `<span class="uv-kbd">⌘</span><span class="uv-kbd">K</span>`,
    "uv-chip": `<span class="uv-chip is-active">Active</span><span class="uv-chip">Chip</span>`, "uv-input": SAMPLE.input, "uv-textarea": `<textarea class="uv-textarea" placeholder="Write something…"></textarea>`,
    "uv-field": `<label class="uv-field" style="width:100%"><input class="uv-input" placeholder=" "><span>Floating label</span></label>`, "uv-input-icon": `<label class="uv-input-icon" style="width:100%"><i>⌕</i><input class="uv-input" placeholder="Search"></label>`,
    "uv-label": `<div style="width:100%"><label class="uv-label">Label</label><input class="uv-input"></div>`, "uv-switch": SAMPLE.switch, "uv-check": SAMPLE.check, "uv-range": SAMPLE.range,
    "uv-otp": `<div class="uv-otp"><input value="4"><input value="2"><input><input></div>`, "uv-drop": `<div class="uv-drop" style="width:100%">Drop files here</div>`, "uv-tabs": SAMPLE.tabs,
    "uv-panel": `<div class="uv-panel">A tab panel</div>`, "uv-accordion": `<div class="uv-accordion" style="width:100%"><details open><summary>Question</summary><div>Answer</div></details><details><summary>Another</summary><div>…</div></details></div>`,
    "uv-progress": SAMPLE.progress, "uv-ring": `<div class="uv-ring-wrap"><div class="uv-ring" style="--v:72;--s:90px"></div><b>72%</b></div>`, "uv-ring-wrap": `<div class="uv-ring-wrap"><div class="uv-ring" style="--v:40;--s:90px"></div><b>40%</b></div>`,
    "uv-meter": `<div class="uv-meter" style="width:120px"><i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div>`, "uv-spinner": SAMPLE.spinner, "uv-dots": `<div class="uv-dots"><i></i><i></i><i></i></div>`,
    "uv-skeleton": `<div class="col"><div class="uv-skeleton" style="width:70%"></div><div class="uv-skeleton"></div><div class="uv-skeleton" style="height:40px"></div></div>`, "uv-alert": SAMPLE.alert,
    "uv-toasts": `<button class="uv-btn" type="button" onclick="UV.toast('Hello!',{type:'success'})">Show a toast</button>`, "uv-toast": `<div class="uv-toast uv-toast--success"><span class="uv-toast__icon">✓</span>Saved</div>`,
    "uv-modal": SAMPLE.modal, "uv-cmdk": `<button class="uv-btn" type="button" onclick="UV.cmdk([{label:'Open file'},{label:'Settings'},{label:'Toggle theme'}])">Open ⌘K palette</button>`,
    "uv-dock": `<div class="uv-dock"><a>🏠</a><a>📁</a><a>⚙️</a><a>💬</a></div>`, "uv-nav": SAMPLE.nav, "uv-crumbs": `<nav class="uv-crumbs"><a href="#!">Home</a><a href="#!">Docs</a><span>Install</span></nav>`,
    "uv-sidenav": `<nav class="uv-sidenav" style="width:100%"><a class="is-active" href="#!">Overview</a><a href="#!">Projects</a><a href="#!">Settings</a></nav>`, "uv-pages": `<div class="uv-pages"><a href="#!">‹</a><a href="#!" class="is-active">1</a><a href="#!">2</a><a href="#!">›</a></div>`,
    "uv-menu": `<div class="uv-menu"><button type="button">New <kbd>⌘N</kbd></button><button type="button" class="is-active">Open…</button><hr><button type="button">Close</button></div>`,
    "uv-stat": `<div class="uv-stat"><small>Revenue</small><b>$48.2k</b><em>▲ 12%</em></div>`, "uv-steps": `<ol class="uv-steps" style="padding:0"><li class="is-done">Cart</li><li class="is-current">Pay</li><li>Done</li></ol>`,
    "uv-list": `<ul class="uv-list" style="width:100%"><li>First</li><li>Second</li><li>Third</li></ul>`, "uv-table": `<table class="uv-table"><tr><th>Name</th><th>Role</th></tr><tr><td>Ana</td><td>Design</td></tr><tr><td>Jon</td><td>Code</td></tr></table>`,
    "uv-timeline": `<ol class="uv-timeline"><li>Started</li><li>Shipped v1</li><li>Today</li></ol>`, "uv-bg-grid": `<div class="uv-bg-grid" style="position:absolute;inset:0"></div>`, "uv-bg-dots": `<div class="uv-bg-dots" style="position:absolute;inset:0"></div>`,
    "uv-bg-mesh": `<div class="uv-bg-mesh" style="position:absolute;inset:0"></div>`, "uv-bg-aurora": `<div class="uv-bg-aurora" style="position:absolute;inset:0"></div>`, "uv-fade-mask": `<div class="uv-fade-mask" style="height:80px;overflow:hidden">Long text that fades out at the edges. Long text that fades out at the edges. Long text that fades out at the edges.</div>`,
    "uv-grain": `<div class="uv-card uv-grain" style="width:100%">Film grain</div>`, "uv-beam": `<div class="uv-card uv-beam" style="width:100%">Border beam</div>`,
  };
  // JS function demos
  const JSDEMO = {
    "UV.toast": [`<button class="uv-btn uv-btn--primary" type="button">Toast</button>`, el => el.querySelector("button").onclick = () => UV.toast("Saved!", { type: "success" })],
    "UV.modal": [`<button class="uv-btn" type="button">Open modal</button>`, el => el.querySelector("button").onclick = () => UV.modal({ title: "Hello", body: "A promise-based dialog." })],
    "UV.cmdk": [`<button class="uv-btn" type="button">⌘K palette</button>`, el => el.querySelector("button").onclick = () => UV.cmdk([{ label: "Open file" }, { label: "Settings" }])],
    "UV.confetti": [`<button class="uv-btn uv-btn--primary" type="button">Confetti</button>`, el => el.querySelector("button").onclick = e => UV.confetti({ x: e.clientX, y: e.clientY })],
    "UV.sound": [`<button class="uv-btn" type="button">Play a sound</button>`, el => el.querySelector("button").onclick = () => UV.sound("coin")],
    "UV.countUp": [`<b style="font-size:40px">0</b>`, el => el.onmouseenter = () => UV.countUp(el.querySelector("b"), 12480)],
    "UV.typewriter": [`<b style="font-size:18px">…</b>`, el => el.onmouseenter = () => UV.typewriter(el.querySelector("b"), ["Hover me again", "Typed by UV.typewriter"])],
    "UV.scramble": [`<b style="font-size:22px">SCRAMBLE</b>`, el => el.onmouseenter = () => UV.scramble(el.querySelector("b"), "UNSCRAMBLED")],
    "UV.tilt": [`<div class="uv-card uv-tilt" style="width:100%">Move over me</div>`, el => UV.tilt(el.querySelector(".uv-card"))],
    "UV.magnetic": [`<button class="uv-btn uv-btn--primary" type="button">Magnetic</button>`, el => UV.magnetic(el.querySelector("button"))],
    "UV.ripple": [`<button class="uv-btn uv-btn--primary" type="button">Ripple</button>`, el => UV.ripple(el.querySelector("button"))],
    "UV.spotlight": [`<div class="uv-card uv-card--spot" style="width:100%">Spotlight follows you</div>`, el => UV.spotlight(el.querySelector(".uv-card"))],
    "UV.ring": [`<div class="uv-ring-wrap"><div class="uv-ring" style="--s:90px"></div></div>`, el => el.onmouseenter = () => UV.ring(el.querySelector(".uv-ring"), 80)],
  };
  const FAM_SING = { btn: "Button", card: "Card", input: "Text field", switch: "Switch", check: "Checkbox", range: "Slider", tabs: "Tabs", nav: "Nav", badge: "Badge", alert: "Alert", modal: "Modal", spinner: "Spinner", progress: "Progress", head: "Heading", bg: "Background" };
  const LAYER_TARGET = { glow: "btn", shadow: "card", border: "btn", backdrop: "card", fill: "btn", shape: "btn", text: "head", hover: "btn", press: "btn", enter: "card", idle: "btn", fx: "head" };
  const TYPE_SAMPLE = { btn: `<button class="uv-btn uv-btn--primary" type="button">Button</button>`, card: `<div class="uv-card" style="width:80%"><b>Card</b><p class="uv-muted" style="margin:6px 0 0;font-size:13px">With this layer.</p></div>`, head: `<h2 class="uv-h2">Heading</h2>` };

  // ── categories ───────────────────────────────────────────────────────────
  const cats = [];
  const C = (group, key, label, desc, items, wide) => cats.push({ group, key, label, desc, items, wide });
  const themes = (window.UV_MANIFEST || {}).themes || [];
  C("Style", "themes", "Themes", "Complete looks: colours, type, buttons, cards, hover motion and backgrounds. Add one to set your package's theme.",
    themes.map(t => ({ id: `theme/${t.name}`, name: t.name, desc: `${t.category} · ${t.desc}`, html: `<div class="col" data-uv-theme="${t.name}" style="padding:14px;border-radius:8px;width:100%"><h2 class="uv-h2" style="font-size:30px;text-align:left">${t.name}</h2><div class="uv-row"><button class="uv-btn uv-btn--primary uv-btn--sm" type="button">Primary</button><button class="uv-btn uv-btn--sm" type="button">Second</button><span class="uv-badge uv-badge--accent">New</span></div></div>` })));
  C("Style", "kits", "Kits", "A theme plus one design for every element.", P.kits.map(k => ({ id: `kit/${k.name}`, name: k.label, desc: k.desc,
    html: `<div class="col" data-uv-theme="${k.theme}" ${Object.entries(k.parts).map(([a, b]) => `data-uv-${a}="${b}"`).join(" ")} style="padding:14px;border-radius:8px;width:100%"><h2 class="uv-h2" style="font-size:28px;text-align:left">${esc(k.label)}</h2><div class="uv-row"><button class="uv-btn uv-btn--primary uv-btn--sm" type="button">Go</button><label class="uv-switch"><input type="checkbox" checked><i></i></label><span class="uv-badge uv-badge--success">Live</span></div><div class="uv-progress" style="--v:60%"><i></i></div></div>` })));
  for (const f of P.families) C("Elements", f.key, f.label, `${f.desc}. Each design is switched on with data-uv-${f.key}="name".`, f.parts.map(p => ({ id: `part/${f.key}/${p.name}`, name: p.label, desc: p.desc,
    html: f.key === "bg" ? `<span class="hint">background: ${p.name}</span>` : SAMPLE[f.key].replace(/NAME/g, f.key + p.name), attr: [`data-uv-${f.key}`, p.name] })));
  const opts = keys => L.kinds.filter(k => keys.includes(k.key)).flatMap(k => [{ sub: k.label }, ...k.options.map(o => ({ id: `layer/${k.key}/${o.name}`, name: o.label, desc: `${k.label} layer`, kind: k.key, opt: o }))]);
  C("Effects & motion", "effects", "Effects", "Stackable layers: glow, shadow, border, backdrop, fill, shape and text. Choose which element type each one applies to.", opts(["glow", "shadow", "border", "backdrop", "fill", "shape", "text"]));
  C("Effects & motion", "animations", "Animations", "Hover, press, entrance and idle motion layers. Hover a preview to see it.", opts(["hover", "press", "enter", "idle"]));
  C("Effects & motion", "fx", "uv-fx effects", "Classic one-class effects: add class=\"uv-fx-…\" to any element.", L.kinds.find(k => k.key === "fx").options.map(o => ({ id: `fx/${o.fx}`, name: o.label, desc: o.fx, html: `<h2 class="uv-h2 ${o.fx}" data-text="${esc(o.label)}" style="font-size:34px">${esc(o.label)}</h2>` })));
  C("Effects & motion", "js", "JavaScript", "The UV.* functions. Hover or click a preview to run it.", CAT.filter(i => i[0] === "JavaScript").map(i => ({ id: i[1], name: i[2], desc: i[3], js: i[1].slice(3) })));
  C("More", "backgrounds", "Page backgrounds", "Animated canvases, cursor effects and scrolling for the whole page (hover a preview to play it).", L.pageKinds.flatMap(k => [{ sub: k.label }, ...k.options.map(o => ({ id: `layer/${k.key}/${o.name}`, name: o.label, desc: `${k.label}`, kind: k.key, opt: o, page: true }))]));
  C("More", "components", "Components", "The building blocks: every uv-* component class.", CAT.filter(i => i[0] === "Component").map(i => ({ id: `comp/${i[2]}`, name: i[2], desc: i[3], html: COMP[i[2]] || `<div class="${i[2]}" style="padding:14px">${i[2]}</div>` })));
  C("More", "blocks", "Blocks", "Full page sections (heroes, features, pricing, footers…). They need blocks.css, which the zipper includes.", (window.BLOCKS || []).map(([cat, name, html], i) => ({ id: `block/${i}`, name, desc: cat, block: html })), true);
  C("More", "native", "Native (UiVault3)", "Real custom-painted widgets for PySide6 and Qt 6 C++, drawn from these same designs. Add them to get the Python and C++ packages in your zip.",
    ["Button", "Card", "LineEdit", "Switch", "CheckBox", "RadioButton", "Slider", "TabBar", "ProgressBar", "Spinner", "Badge", "Alert", "Heading", "NavBar", "Surface", "Dialog"].map(n => ({ id: `native/${n}`, name: n, desc: `uivault3.${n} · uv3::${n}`, native: n })));
  const byId = {}; cats.forEach(c => c.items.forEach(i => { if (i.id) { i.cat = c.key; byId[i.id] = i; } }));

  // ── sidebar ──────────────────────────────────────────────────────────────
  const count = c => c.items.filter(i => i.id).length;
  const groups = [...new Set(cats.map(c => c.group))];
  $("#side").insertAdjacentHTML("beforeend", groups.map(g => `<h4>${g}</h4>` + cats.filter(c => c.group === g).map(c => `<button type="button" data-c="${c.key}"><b>${c.label}</b><span class="dot" hidden></span><small>${count(c)}</small></button>`).join("")).join(""));
  $("#side").addEventListener("click", e => { const b = e.target.closest("[data-c]"); if (b) show(b.dataset.c); });

  // ── tiles ────────────────────────────────────────────────────────────────
  let styleEl = document.createElement("style"); document.head.appendChild(styleEl);
  const previewCss = [];
  function tile(it, catKey) {
    if (it.sub) return `<p class="subhead">${esc(it.sub)}</p>`;
    let stage = "", attrs = "", extra = "";
    if (it.html != null) { stage = it.html; if (it.attr) attrs = ` ${it.attr[0]}="${it.attr[1]}"`; }
    if (it.kind && !it.page) {
      const t = LAYER_TARGET[it.kind] || "btn", pid = "lp-" + it.id.replace(/[^\w]/g, "-");
      previewCss.push(UV.layers.cssFor(`[data-lp="${pid}"] :is(${UV.layers.types[t].targets})`, t, { [it.kind]: { o: it.opt.name } }));
      stage = `<div data-lp="${pid}" class="uv" style="display:contents">${TYPE_SAMPLE[t]}</div>${it.kind === "enter" ? `<span class="hint">hover to replay</span>` : ""}`;
      extra = `<select data-target title="Apply to which elements">${UV.layers.defs.types.filter(x => x.key !== "page").map(x => `<option value="${x.key}"${x.key === t ? " selected" : ""}>${x.label}</option>`).join("")}</select>`;
    }
    if (it.page) stage = `<span class="hint">hover to play</span><b style="position:relative;z-index:1">${esc(it.name)}</b>`;
    if (it.js) { const d = JSDEMO[it.js]; stage = d ? d[0] : `<code style="font:12px 'Geist Mono',monospace">${esc(it.name)}</code>`; }
    if (it.block != null) return `<article class="tile" data-id="${it.id}"><div class="stage block"><div class="uv">${it.block.replace(/\sdata-uv-(reveal|scrub|stagger)(="[^"]*")?/g, "")}</div></div>${foot(it, extra)}</article>`;
    if (it.native) stage = `<div class="col" style="text-align:center"><b style="font:600 18px var(--uv-font)">uivault3.${it.native}</b><code style="font:12px 'Geist Mono',monospace;color:var(--uv-muted)">uv3::${it.native}</code></div>`;
    return `<article class="tile" data-id="${it.id}"><div class="stage uv"${attrs}>${stage}</div>${foot(it, extra)}</article>`;
  }
  const foot = (it, extra) => `<footer><div><b title="${esc(it.name)}">${esc(it.name)}</b><small title="${esc(it.desc)}">${esc(it.desc)}</small></div>${extra}<button class="sbtn" type="button" data-code title="Code">&lt;/&gt;</button><button class="sbtn" type="button" data-add>Add</button></footer>`;

  let current = null, stops = new Map();
  function show(key, focusId) {
    const c = cats.find(x => x.key === key) || cats[2]; current = c;
    $$("#side [data-c]").forEach(b => b.classList.toggle("on", b.dataset.c === c.key));
    $("#kicker").textContent = c.group; $("#title").innerHTML = `${esc(c.label)} <em>(${count(c)})</em>`; $("#lead").hidden = true; $("#catdesc").textContent = c.desc;
    previewCss.length = 0;
    const q = $("#q").value.trim().toLowerCase();
    const items = q ? c.items.filter(i => i.sub || (i.name + " " + i.desc).toLowerCase().includes(q)) : c.items;
    $("#grid").className = "grid" + (c.wide ? " wide" : "");
    $("#grid").innerHTML = items.map(i => tile(i, c.key)).join("");
    styleEl.textContent = previewCss.join("\n");
    UV.init($("#grid"));
    // js demos, block scaling, preview behaviours
    $$("#grid .tile").forEach(t => {
      const it = byId[t.dataset.id]; if (!it) return;
      if (it.js && JSDEMO[it.js]) try { JSDEMO[it.js][1](t.querySelector(".stage")); } catch {}
      if (it.kind === "enter") { const el = t.querySelector("[data-lp] > *"); el.classList.add("uvl-in"); t.onmouseenter = () => { el.classList.remove("uvl-in"); void el.offsetWidth; el.classList.add("uvl-in"); }; }
      if (it.opt && it.opt.js && !it.page) { const el = t.querySelector("[data-lp] > *"); ({ ripple: UV.ripple, magnetic: UV.magnetic, tilt: UV.tilt, spotlight: UV.spotlight }[it.opt.js] || (() => {}))(el);
        if (["confetti", "sparkle"].includes(it.opt.js)) el.onclick = e => UV.confetti({ x: e.clientX, y: e.clientY, count: it.opt.js === "sparkle" ? 26 : 80 });
        if (it.opt.js === "sound") el.onclick = () => UV.sound("click"); }
      if (it.page) {
        const st = t.querySelector(".stage");
        t.onmouseenter = () => {
          const pg = it.opt.page; let stop = null;
          try { if (pg.canvas === "waterfall" && window.UVWaterfall) stop = window.UVWaterfall.mount(st); else if (pg.canvas) stop = UV.fx[pg.canvas](st); else if (pg.cursor) stop = UV.fx[pg.cursor](st); } catch {}
          stops.set(t, stop);
        };
        t.onmouseleave = () => { const s = stops.get(t); try { typeof s === "function" ? s() : s && s.stop && s.stop(); } catch {} st.querySelectorAll("canvas").forEach(c => c.remove()); stops.delete(t); };
      }
    });
    mark();
    const url = new URL(location.href); url.searchParams.set("cat", c.key); if (!focusId) url.searchParams.delete("item"); history.replaceState(null, "", url);
    if (focusId) { const t = document.querySelector(`.tile[data-id="${CSS.escape(focusId)}"]`); if (t) { t.scrollIntoView({ block: "center" }); t.classList.add("flash"); } }
    else scrollTo(0, 0);
  }
  $("#q").addEventListener("input", () => current && show(current.key));
  document.addEventListener("keydown", e => { if (e.key === "/" && document.activeElement.tagName !== "INPUT") { e.preventDefault(); $("#q").focus(); } });
  document.addEventListener("click", e => { const a = e.target.closest('a[href="#!"]'); if (a) e.preventDefault(); });

  // ── picking ──────────────────────────────────────────────────────────────
  const idFor = t => { const id = t.dataset.id, sel = t.querySelector("[data-target]"); return sel ? `${id}@${sel.value}` : id; };
  const inPack = t => { const p = UVPack.get(), id = t.dataset.id; return p.some(x => x === id || x.startsWith(id + "@")); };
  $("#grid").addEventListener("click", e => {
    const t = e.target.closest(".tile"); if (!t) return;
    if (e.target.closest("[data-add]")) {
      const id = t.dataset.id, p = UVPack.get(), existing = p.find(x => x === id || x.startsWith(id + "@"));
      UVPack.set(existing ? p.filter(x => x !== existing) : [...p, idFor(t)]);
    }
    if (e.target.closest("[data-code]")) openCode(idFor(t), byId[t.dataset.id]);
  });
  $("#grid").addEventListener("change", e => {
    const s = e.target.closest("[data-target]"); if (!s) return;
    const t = s.closest(".tile"), p = UVPack.get(), existing = p.find(x => x.startsWith(t.dataset.id + "@"));
    if (existing) UVPack.set(p.map(x => x === existing ? idFor(t) : x));
  });
  function mark() {
    const p = UVPack.get();
    $$("#grid .tile").forEach(t => { const on = inPack(t); t.classList.toggle("in", on); const b = t.querySelector("[data-add]"); b.textContent = on ? "Added ✓" : "Add"; b.classList.toggle("on", on); });
    const usedCats = new Set(p.map(id => (byId[id.split("@")[0]] || {}).cat));
    $$("#side [data-c]").forEach(b => b.querySelector(".dot").hidden = !usedCats.has(b.dataset.c));
    tray();
  }
  document.addEventListener("uv:pack", mark);

  // ── tray ─────────────────────────────────────────────────────────────────
  let ttab = "html";
  const label = id => { const it = byId[id.split("@")[0]]; return it ? `${it.name}${id.includes("@") ? " → " + (UV.layers.types[id.split("@")[1]] || {}).label : ""}` : id; };
  function tray() {
    const p = UVPack.get();
    $("#trayN").textContent = p.length;
    $("#trayList").innerHTML = p.length ? p.map(id => `<li title="${esc(id)}">${esc(label(id))}<button type="button" data-rm="${esc(id)}" aria-label="Remove">×</button></li>`).join("") : `<li style="border:0;padding:6px 4px">Nothing yet. Click <b>&nbsp;Add&nbsp;</b> on anything.</li>`;
    const c = p.length ? UVPack.code(p) : null;
    $("#trayCode").textContent = c ? c[ttab] : "// Your import code appears here as you add items.";
  }
  $("#trayHead").onclick = () => { $("#tray").classList.toggle("open"); $("#trayArrow").textContent = $("#tray").classList.contains("open") ? "▾" : "▴"; };
  $("#trayList").onclick = e => { const b = e.target.closest("[data-rm]"); if (b) UVPack.set(UVPack.get().filter(x => x !== b.dataset.rm)); };
  $("#trayTabs").onclick = e => { const b = e.target.closest("button"); if (!b) return; ttab = b.dataset.t; $$("#trayTabs button").forEach(x => x.classList.toggle("on", x === b)); tray(); };
  $("#trayCopy").onclick = () => { navigator.clipboard?.writeText($("#trayCode").textContent); UV.toast("Copied"); };
  $("#trayClear").onclick = () => UVPack.set([]);
  $("#trayZip").onclick = async () => {
    const b = $("#trayZip"); if (!UVPack.get().length) return UV.toast("Add something first", { type: "warn" });
    b.classList.add("is-loading"); b.textContent = "Packing…";
    try { await UVPack.download(UVPack.get(), { web: true, example: true, python: UVPack.get().some(i => i.startsWith("native/")), cpp: UVPack.get().some(i => i.startsWith("native/")), mine: true }); UV.toast("Package downloaded", { type: "success" }); }
    catch (e) { UV.toast("Couldn't fetch the native files here (open the live site)", { type: "error" }); }
    b.classList.remove("is-loading"); b.textContent = "Download .zip";
  };

  // ── per-item code ────────────────────────────────────────────────────────
  let cd = {}, cdTab = "html", cdId = null;
  async function openCode(id, it) {
    await UVPack.ensure();
    const c = UVPack.code([id]);
    cd = { html: c.html, css: UVPack.cssFor(c.pk).split("/* components").slice(1).join("/* components") || UVPack.cssFor(c.pk), py: c.py, cpp: c.cpp };
    if (cd.css.length > 60000) cd.css = cd.css.slice(0, 60000) + "\n/* … truncated in this preview; the zip has all of it */";
    cdId = id; $("#cdTitle").textContent = it ? it.name : id; $("#cdPre").textContent = cd[cdTab];
    $("#cdAdd").textContent = UVPack.get().includes(id) ? "In your package ✓" : "Add to package";
    $("#codedlg").showModal();
  }
  $("#cdTabs").onclick = e => { const b = e.target.closest("button"); if (!b) return; cdTab = b.dataset.t; $$("#cdTabs button").forEach(x => x.classList.toggle("on", x === b)); $("#cdPre").textContent = cd[cdTab]; };
  $("#cdAdd").onclick = () => { if (!UVPack.get().includes(cdId)) UVPack.set([...UVPack.get(), cdId]); $("#cdAdd").textContent = "In your package ✓"; };
  $("#codedlg").addEventListener("click", e => { if (e.target.id === "codedlg") e.target.close(); });

  // ── start ────────────────────────────────────────────────────────────────
  const qs = new URLSearchParams(location.search), item = qs.get("item");
  const target = item && (byId[item] || byId[item.split("@")[0]]);
  UVPack.ensure();   // fetch the source maps in the background for code/zip
  show(target ? target.cat : qs.get("cat") || "btn", target && target.id);
  if (UVPack.get().length) $("#tray").classList.add("open"), $("#trayArrow").textContent = "▾";
})();
