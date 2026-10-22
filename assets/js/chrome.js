/* UI Vault — shared site chrome behaviour: mega menus, mobile sheet, Ctrl/Cmd+K site search.
   Markup comes from tools/chrome.py; styles from assets/css/chrome.css. */
(() => {
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const html = document.documentElement;

  /* ── Mega menus: hover on fine pointers, click everywhere, Esc / outside click closes ── */
  const dds = $$(".uvc-dd");
  const close = except => dds.forEach(d => { if (d !== except) { d.classList.remove("open"); d.firstElementChild.setAttribute("aria-expanded", "false"); } });
  const open = d => { close(d); d.classList.add("open"); d.firstElementChild.setAttribute("aria-expanded", "true"); };
  const hover = matchMedia("(hover: hover) and (pointer: fine)").matches;
  dds.forEach(d => {
    let t;
    d.firstElementChild.addEventListener("click", () => d.classList.contains("open") ? close() : open(d));
    if (hover) {
      d.addEventListener("pointerenter", () => { clearTimeout(t); t = setTimeout(() => open(d), dds.some(x => x.classList.contains("open")) ? 0 : 90); });
      d.addEventListener("pointerleave", () => { clearTimeout(t); t = setTimeout(() => close(), 160); });
    }
    d.addEventListener("keydown", e => {
      const items = $$(".uvc-menu a", d), i = items.indexOf(document.activeElement);
      if (e.key === "ArrowDown") { e.preventDefault(); open(d); items[(i + 1) % items.length].focus(); }
      else if (e.key === "ArrowUp") { e.preventDefault(); open(d); items[(i - 1 + items.length) % items.length].focus(); }
    });
    d.addEventListener("focusout", e => { if (!d.contains(e.relatedTarget)) close(); });
  });
  document.addEventListener("click", e => { if (!e.target.closest(".uvc-dd")) close(); });

  /* ── Mobile sheet ── */
  const burger = $("[data-uvc-burger]"), sheet = $("#uvc-sheet");
  const sheetOpen = on => {
    if (!sheet) return;
    sheet.classList.toggle("open", on); html.classList.toggle("uvc-lock", on);
    burger && burger.setAttribute("aria-expanded", on);
  };
  burger && burger.addEventListener("click", () => sheetOpen(!sheet.classList.contains("open")));
  addEventListener("resize", () => { if (innerWidth > 900) sheetOpen(false); }, { passive: true });

  /* ── Header shadow once the page scrolls ── */
  const top = $("#uvc-top");
  if (top) {
    const s = () => top.style.boxShadow = scrollY > 4 ? "0 8px 24px -16px #0008" : "";
    addEventListener("scroll", s, { passive: true }); s();
  }

  /* ── Site search ── */
  const PAGES = [
    ["Home", "./", "Playground, post-FX lab, logo forge and the resource index"],
    ["Quick start", "quickstart.html", "Install in two minutes and zip only what you use"],
    ["Docs", "docs.html", "Every component and function with live examples"],
    ["Library", "library.html", "Everything live in one catalogue, pick and pack"],
    ["Themes", "themes.html", "87 complete styles and a theme builder"],
    ["Elements", "elements.html", "273 element designs and 18 kits"],
    ["3D skins", "skins.html", "26 animated WebGL materials"],
    ["Blocks", "blocks.html", "41 page sections, ready to paste"],
    ["Showcase", "showcase.html", "30 finished pieces"],
    ["Examples", "examples.html", "Seven scroll-animated websites"],
    ["Test page", "lab.html", "Try themes on a dashboard, landing, settings and shop"],
    ["Python & C++", "code.html", "uivault for Python, uivault.hpp and UiVault3 native widgets"],
    ["Index", "directory.html", "Search everything"],
  ].map(([t, h, d]) => ({ kind: "Page", t, h, d }));
  let items = PAGES, loaded = false;
  const load = () => {
    if (loaded) return; loaded = true;
    const ingest = () => {
      const seen = new Set(PAGES.map(p => p.t));
      items = PAGES.concat((window.UV_CATALOG || []).filter(r => !(r[0] === "Page" && seen.has(r[2]))).map(r => ({ kind: r[0], t: r[2], d: r[3], h: r[4] === "./" ? "./" : r[4], g: r[5] || "" })));
      if (box.classList.contains("open")) render();
    };
    if (window.UV_CATALOG) return ingest();
    const s = document.createElement("script"); s.src = "lib/catalog.js"; s.onload = ingest; document.head.appendChild(s);
  };

  const box = document.createElement("div");
  box.className = "uvc-k"; box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true"); box.setAttribute("aria-label", "Search UI Vault");
  box.innerHTML = `<div class="uvc-k__box"><label class="uvc-k__in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input type="search" placeholder="Search pages, components, functions, effects…" autocomplete="off" spellcheck="false" aria-label="Search"><kbd>Esc</kbd></label>
    <div class="uvc-k__list" role="listbox"></div>
    <div class="uvc-k__foot"><span><kbd>↑</kbd><kbd>↓</kbd> move</span><span><kbd>↵</kbd> open</span><span><a href="directory.html" style="color:inherit">Full index →</a></span></div></div>`;
  document.body.appendChild(box);
  const input = $("input", box), list = $(".uvc-k__list", box);
  let hits = [], sel = 0, last;

  const score = (it, q) => {
    const t = it.t.toLowerCase(), d = (it.d + " " + it.kind + " " + (it.g || "")).toLowerCase();
    if (t === q) return 100;
    if (t.startsWith(q)) return 80 - t.length / 100;
    const w = t.indexOf(" " + q); if (w >= 0) return 65;
    if (t.includes(q)) return 55;
    if (q.split(/\s+/).every(p => t.includes(p) || d.includes(p))) return 30 + (it.kind === "Page" ? 5 : 0);
    let i = 0; for (const c of t) if (c === q[i]) i++;
    return i === q.length && q.length > 2 ? 10 : 0;
  };
  const mark = (t, q) => { const i = q ? t.toLowerCase().indexOf(q) : -1; return i < 0 ? esc(t) : esc(t.slice(0, i)) + "<mark>" + esc(t.slice(i, i + q.length)) + "</mark>" + esc(t.slice(i + q.length)); };
  function render() {
    const q = input.value.trim().toLowerCase();
    hits = q ? items.map(it => [score(it, q), it]).filter(x => x[0] > 0).sort((a, b) => b[0] - a[0]).slice(0, 60).map(x => x[1]) : PAGES;
    if (q) {   // group by kind, groups ordered by their best hit
      const order = [...new Set(hits.map(h => h.kind))];
      hits = order.flatMap(k => hits.filter(h => h.kind === k));
    }
    sel = Math.min(sel, Math.max(0, hits.length - 1));
    if (!hits.length) { list.innerHTML = `<p class="uvc-k__none">Nothing for “${esc(input.value)}”. Try <b>button</b>, <b>toast</b>, <b>neon</b> or <b>scroll</b>.</p>`; return; }
    let g = null;
    list.innerHTML = hits.map((it, i) => {
      const head = it.kind !== g ? `<h4>${esc(q ? it.kind : "Pages")}</h4>` : "";
      g = it.kind;
      return `${head}<a href="${esc(it.h)}" role="option" data-i="${i}" class="${i === sel ? "on" : ""}"><b>${mark(it.t, q)}</b><span>${esc(it.d || "")}</span><em>${esc(it.kind)}</em></a>`;
    }).join("");
  }
  const move = d => {
    if (!hits.length) return;
    sel = (sel + d + hits.length) % hits.length;
    $$("a", list).forEach(a => a.classList.toggle("on", +a.dataset.i === sel));
    const a = $(`a[data-i="${sel}"]`, list); a && a.scrollIntoView({ block: "nearest" });
  };
  const show = () => {
    load(); close(); sheetOpen(false);
    last = document.activeElement; box.classList.add("open"); html.classList.add("uvc-lock");
    input.value = ""; sel = 0; render(); input.focus();
  };
  const hide = () => { box.classList.remove("open"); html.classList.remove("uvc-lock"); last && last.focus && last.focus(); };

  input.addEventListener("input", () => { sel = 0; render(); });
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); move(1); }
    else if (e.key === "ArrowUp") { e.preventDefault(); move(-1); }
    else if (e.key === "Enter") { const a = $(`a[data-i="${sel}"]`, list); if (a) { e.preventDefault(); hide(); location.href = a.href; } }
  });
  list.addEventListener("pointermove", e => { const a = e.target.closest("a"); if (a && +a.dataset.i !== sel) { sel = +a.dataset.i; move(0); } });
  list.addEventListener("click", e => { if (e.target.closest("a")) hide(); });
  box.addEventListener("pointerdown", e => { if (e.target === box) hide(); });
  $$("[data-uvc-search]").forEach(b => b.addEventListener("click", show));
  // pages that demo UV.cmdk keep Ctrl/Cmd+K for the demo: <meta name="uvc-hotkey" content="off">
  const hotkey = !document.querySelector('meta[name="uvc-hotkey"][content="off"]');
  document.addEventListener("keydown", e => {
    if (hotkey && (e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === "k") { e.preventDefault(); e.stopImmediatePropagation(); box.classList.contains("open") ? hide() : show(); }
    else if (e.key === "Escape") { if (box.classList.contains("open")) { e.stopImmediatePropagation(); hide(); } else { close(); sheetOpen(false); } }
  }, true);
  const kbd = $(".uvc-search kbd");
  if (kbd && !hotkey) kbd.remove();
  else if (kbd && /Mac|iPhone|iPad/.test(navigator.platform)) kbd.textContent = "⌘K";
  // warm the index in idle time so the first search is instant
  (window.requestIdleCallback || setTimeout)(load, 2500);
})();
