// Test page: mock pages + a control panel wired to the site-wide picker (theme, kit, one design per element).
(() => {
  "use strict";
  const D = window.UV_PARTS, P = window.UVPicker, html = document.documentElement;
  const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];

  // ── mock content ─────────────────────────────────────────────────────────
  $("#chart").innerHTML = [38, 52, 44, 66, 58, 74, 61, 83, 70, 92, 78, 88].map((h, k) => `<i style="height:${h}%;animation-delay:${k * 40}ms"></i>`).join("");
  const prods = [
    ["Arc desk lamp", 89, "#ffb26b, #ff6a3d", "New", "accent", "30%"], ["Stoneware mug", 24, "#9ad3ff, #5b8ce8", "", "", "50%"],
    ["Grid notebook", 18, "#e9e2f7, #b9a6ea", "-20%", "danger", "8px"], ["Cable tray", 32, "#c9ced6, #6b7480", "", "", "6px"],
    ["Walnut riser", 120, "#d8b04a, #8a5f0c", "Best seller", "success", "12px"], ["Linen print", 45, "#b8ff9a, #2f9e45", "", "", "2px"],
  ];
  $("#prods").innerHTML = prods.map(([n, p, g, b, bt, sh], k) => `<div class="uv-card prod">
    <div class="img" style="--g:linear-gradient(140deg, ${g});--shape:${sh}">${b ? `<span class="uv-badge uv-badge--${bt}">${b}</span>` : ""}<b></b></div>
    <div class="meta"><h3>${n}</h3><span class="price">$${p}</span></div>
    <div class="meta"><span class="stars">★★★★${k % 3 ? "★" : "☆"}</span><small class="muted">${40 + k * 17} reviews</small></div>
    <button class="uv-btn uv-btn--primary uv-btn--block" type="button" data-cart="${n}">Add to cart</button></div>`).join("");
  UV.init(document.querySelector(".stage"));

  document.addEventListener("click", e => {
    const a = e.target.closest('a[href="#!"]'); if (a) e.preventDefault();
    const t = e.target.closest("[data-toast]"); if (t) UV.toast(t.dataset.toast, { type: "success" });
    const c = e.target.closest("[data-cart]");
    if (c && !c.classList.contains("is-loading")) { c.classList.add("is-loading"); setTimeout(() => { c.classList.remove("is-loading"); UV.toast(`${c.dataset.cart} added to cart`, { type: "success" }); }, 700); }
    const chip = e.target.closest(".uv-chip"); if (chip && chip.parentElement) { chip.parentElement.querySelectorAll(".uv-chip").forEach(x => x.classList.toggle("is-active", x === chip)); }
    const nav = e.target.closest(".uv-sidenav a, .uv-nav a, .uv-pages > a"); if (nav && !/[‹›]/.test(nav.textContent)) nav.parentElement.querySelectorAll(":scope > a").forEach(x => x.classList.toggle("is-active", x === nav));
  });
  $("#saveBtn").addEventListener("click", e => { const b = e.currentTarget; b.classList.add("is-loading"); setTimeout(() => { b.classList.remove("is-loading"); UV.toast("Settings saved", { type: "success" }); }, 900); });
  $("#delBtn").addEventListener("click", () => $("#labModal").showModal());
  $("#labModal").addEventListener("click", e => { if (e.target.id === "labModal") e.target.close(); });

  // ── views ────────────────────────────────────────────────────────────────
  const show = v => {
    if (!$(`[data-mock="${v}"]`)) v = "dash";
    $$("[data-mock]").forEach(m => m.hidden = m.dataset.mock !== v);
    $$("#views button").forEach(b => b.classList.toggle("on", b.dataset.v === v));
    history.replaceState(null, "", "#" + v);
    realign();
  };
  $("#views").addEventListener("click", e => { const b = e.target.closest("button"); if (b) { show(b.dataset.v); scrollTo(0, 0); } });

  // tab indicators sit on measured positions; re-measure after a design changes their padding
  function realign() {
    requestAnimationFrame(() => $$(".uv-tabs").forEach(t => {
      const ind = t.querySelector(".uv-tabs__ind"), sel = t.querySelector('button[aria-selected="true"]');
      if (ind && sel) { ind.style.width = sel.offsetWidth + "px"; ind.style.transform = `translateX(${sel.offsetLeft}px)`; }
    }));
  }

  // ── control panel ────────────────────────────────────────────────────────
  $("#cKits").innerHTML = D.kits.map(k => `<button type="button" data-kit="${k.name}" title="${k.desc}">${k.label}</button>`).join("");
  $("#cParts").innerHTML = D.families.map(f => `<label for="c-${f.key}">${f.label}</label><select id="c-${f.key}" data-fam="${f.key}"><option value="">Theme default</option>${f.parts.map(p => `<option value="${p.name}">${p.label}</option>`).join("")}</select>`).join("");
  $("#cKits").addEventListener("click", e => {
    const b = e.target.closest("[data-kit]"); if (!b) return;
    if (P.getKit() === b.dataset.kit) { P.setParts({}, { replace: true }); P.apply(""); } else P.applyKit(b.dataset.kit);
  });
  $("#cParts").addEventListener("change", e => { const s = e.target.closest("select"); if (s) P.setParts({ [s.dataset.fam]: s.value }); });
  $("#cRand").onclick = () => P.setParts(Object.fromEntries(D.families.map(f => [f.key, f.parts[(Math.random() * f.parts.length) | 0].name])), { replace: true });
  $("#cReset").onclick = () => { P.setParts({}, { replace: true }); P.apply(""); };
  $("#modeBtn").onclick = () => P.toggleMode();
  $("#ctlToggle").onclick = () => $("#ctl").classList.toggle("open");

  // theme list (grouped by category) from the token file
  const tk = document.createElement("script"); tk.src = "lib/tokens.js";
  tk.onload = () => {
    const by = {};
    Object.entries(window.UV_TOKENS.themes).forEach(([n, t]) => (by[t.category] ||= []).push(n));
    $("#cTheme").innerHTML = `<option value="">Default (editorial)</option>` + Object.entries(by).map(([c, ns]) => `<optgroup label="${c}">${ns.map(n => `<option>${n}</option>`).join("")}</optgroup>`).join("");
    sync();
  };
  document.head.append(tk);
  $("#cTheme").addEventListener("change", e => P.apply(e.target.value));

  function sync() {
    const cur = P.getParts(), kit = P.getKit();
    $$("#cParts select").forEach(s => s.value = cur[s.dataset.fam] || "");
    $$("#cKits button").forEach(b => b.classList.toggle("on", b.dataset.kit === kit));
    $("#cTheme").value = html.dataset.uvTheme || "";
    realign();
  }
  document.addEventListener("uv:parts", sync);
  new MutationObserver(sync).observe(html, { attributes: true, attributeFilter: ["data-uv-theme"] });

  // lab.html?kit=pearl  or  #shop
  const q = new URLSearchParams(location.search);
  if (q.get("kit")) P.applyKit(q.get("kit"));
  show(location.hash.slice(1) || "dash");
  sync();
})();
