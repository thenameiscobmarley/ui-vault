// UI Vault — "Raw code" view. Extracts the exact CSS (rules, variables, keyframes) and JS a piece
// uses, so it can be pasted into any page without the library.
//   RawCode.open(liveEl, { title, html })   liveEl = rendered element to analyse, html = clean source
//   RawCode.extract(liveEl, html) → Promise<{ html, css, js }>
(() => {
  "use strict";
  const SRC_URL = (document.querySelector('script[src*="raw.js"]')?.src || "").replace(/assets\/js\/raw\.js.*$/, "") + "lib/raw-src.js";
  let srcP, sheet;
  const loadSrc = () => srcP || (srcP = new Promise((res, rej) => {
    if (window.UV_SRC) return res(window.UV_SRC);
    const s = document.createElement("script"); s.src = SRC_URL; s.onload = () => res(window.UV_SRC); s.onerror = rej; document.head.appendChild(s);
  }));

  // states that never match statically — strip them so hover/focus/pseudo-element rules are kept
  const DYN = /::?(?:before|after|placeholder|backdrop|selection|marker|-webkit-[\w-]+|-moz-[\w-]+)|:(?:hover|focus-visible|focus-within|focus|active|visited|checked|disabled)\b|:not\(:(?:placeholder-shown|checked|hover|focus)\)/g;
  const isToken = sel => /:root|^\[data-uv-theme\]$|^\s*\[data-uv-theme\]\s*,|,\s*\[data-uv-theme\]\s*$/.test(sel) && !/\./.test(sel.replace(/\[data-uv-theme="[\w-]+"\]/g, ""));
  const prelude = r => r.cssText.slice(0, r.cssText.indexOf("{")).trim();

  function matchesAny(nodes, sel) {
    for (const part of sel.split(/,(?![^(]*\))/)) {
      let base = part.replace(DYN, "").trim();
      if (!base || /^[>+~]|[>+~]\s*$/.test(base)) base = (base.replace(/^[>+~]|[>+~]\s*$/g, "").trim()) || "*";
      try { if (nodes.some(n => n.matches(base))) return true; } catch { /* selector the engine can't test */ }
    }
    return false;
  }

  function collect(rules, nodes, out, tokens) {
    for (const r of rules) {
      if (r instanceof CSSStyleRule) {
        if (isToken(r.selectorText)) {
          tokens.push(r);
          // token rules can also carry real properties (e.g. [data-uv-theme] { background-color… })
          const real = [...r.style].filter(p => !p.startsWith("--"));
          if (real.length && matchesAny(nodes, r.selectorText.replace(/:root\s*,?/g, "").trim() || ":root"))
            out.push(`${r.selectorText.replace(/:root\s*,\s*/g, "")} { ${real.map(p => `${p}: ${r.style.getPropertyValue(p)};`).join(" ")} }`);
          continue;
        }
        if (matchesAny(nodes, r.selectorText)) out.push(r.cssText);
      } else if (r.cssRules && !(r instanceof CSSKeyframesRule)) {
        const inner = []; collect(r.cssRules, nodes, inner, tokens);
        if (inner.length) out.push(prelude(r) + " {\n" + inner.map(x => "  " + x).join("\n") + "\n}");
      }
    }
  }

  async function extract(live, html) {
    const src = await loadSrc();
    if (!sheet) { sheet = new CSSStyleSheet(); sheet.replaceSync(src.css.replace(/@import[^;]+;/g, "")); }
    // Work on a clone, plus the elements the JS creates at runtime, so their CSS is included too.
    const themed = live.closest("[data-uv-theme]");
    const work = live.cloneNode(true);
    const add = (parent, html) => parent.insertAdjacentHTML("beforeend", html);
    work.querySelectorAll(".uv-tabs").forEach(t => { if (!t.querySelector(".uv-tabs__ind")) add(t, '<span class="uv-tabs__ind"></span>'); });
    [work, ...work.querySelectorAll("[data-uv]")].forEach(el => {
      const b = (el.dataset && el.dataset.uv) || "";
      if (/ripple/.test(b)) add(el, '<span class="uv-ripple"></span>');
      if (/tilt/.test(b)) { el.classList.add("uv-tilt"); add(el, '<i class="uv-glare"></i>'); }
    });
    work.querySelectorAll("[data-uv-type]").forEach(el => el.classList.add("uv-caret"));
    if (/UV\.(toast|copy)|data-uv-(copy|toast)/.test(html + work.innerHTML)) add(work, '<div class="uv-toasts uv"><div class="uv-toast uv-toast--success uv-toast--error uv-toast--warn"><span class="uv-toast__icon"></span></div></div>');
    if (/UV\.modal/.test(html + work.innerHTML)) add(work, '<dialog class="uv-modal uv"><div><h3 class="uv-h3"></h3><div class="uv-muted"></div><div class="uv-row"><button class="uv-btn uv-btn--primary"></button><button class="uv-btn uv-btn--danger"></button><button class="uv-btn uv-btn--ghost"></button></div></div></dialog>');
    if (/UV\.cmdk/.test(html + work.innerHTML)) add(work, '<dialog class="uv-cmdk uv"><input><ul><li class="is-active"><span class="uv-kbd"></span></li></ul><div class="uv-cmdk__empty"></div></dialog>');
    let scope = work;
    if (themed && themed !== live) { scope = document.createElement("div"); scope.dataset.uvTheme = themed.dataset.uvTheme; scope.appendChild(work); }
    const nodes = [scope, ...scope.querySelectorAll("*")];
    const out = [], tokens = [];
    collect(sheet.cssRules, nodes, out, tokens);

    // theme rules for an ancestor scope

    let body = out.join("\n");
    // keyframes + @property referenced by animations
    const extra = [];
    for (const r of sheet.cssRules) {
      if (r instanceof CSSKeyframesRule && new RegExp("\\b" + r.name + "\\b").test(body)) extra.push(r.cssText);
      if (r.constructor.name === "CSSPropertyRule" && body.includes(r.name)) extra.push(r.cssText);
    }
    body = extra.concat(out).join("\n");

    // variables: everything referenced, resolved through token rules (recursively)
    const need = new Set(), defs = new Map();
    tokens.forEach(r => { for (const p of r.style) if (p.startsWith("--")) { const sel = r.selectorText; if (!defs.has(sel)) defs.set(sel, []); defs.get(sel).push([p, r.style.getPropertyValue(p).trim()]); } });
    const scan = t => { for (const m of t.matchAll(/var\((--[\w-]+)/g)) if (!need.has(m[1])) { need.add(m[1]); defs.forEach(list => list.forEach(([p, v]) => p === m[1] && scan(v))); } };
    scan(body);
    const vars = [...defs].map(([sel, list]) => { const keep = list.filter(([p]) => need.has(p)); return keep.length ? `${sel} {\n${keep.map(([p, v]) => `  ${p}: ${v};`).join("\n")}\n}` : ""; }).filter(Boolean);

    const css = `/* Standalone CSS extracted from UI Vault — no library needed. */\n` + vars.concat(body).join("\n\n")
      .replace(/; /g, ";\n  ").replace(/\{ /g, "{\n  ").replace(/ \}/g, "\n}");

    // JS: only the modules this piece touches
    const has = (re) => re.test(html) || nodes.some(n => [...n.attributes].some(a => re.test(a.name + "=" + a.value)) || re.test(n.className || ""));
    const mods = ["core"];
    if (has(/data-uv="|data-uv-(type|count|scramble|reveal|stagger)|uv-card--spot|uv-ring|uv-progress|UV\.(countUp|typewriter|scramble|tilt|magnetic|ripple|spotlight|parallax|ring|reveal)/)) mods.push("motion");
    if (has(/data-uv-(confetti|copy|sound|toast)|UV\.(toast|modal|cmdk|confetti|sound|copy)/)) mods.push("feedback");
    if (has(/uv-tabs|uv-otp|uv-range|uv-drop|UV\.(tabs|otp|range|drop)/)) mods.push("forms");
    if (has(/data-uv-fx|uv-fx-(glitch|wave|bounce-in|spotlight|holo-card)|UV\.fx/)) mods.push("fx");
    const js = mods.length > 1 ? `// Standalone JS for this piece: ${mods.join(" + ")} (${mods.length} of 5 modules). Paste once per page.\n` + mods.map(m => src.js[m]).join("\n") : "";

    return { html: html.trim(), css, js, wrap: themed && themed !== live && !/data-uv-theme=/.test(html) ? themed.dataset.uvTheme : null };
  }

  const FONTS = '<link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600;700&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@500;700&family=VT323&family=Patrick+Hand&display=swap" rel="stylesheet">';
  const single = r => `<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n${FONTS}\n<style>\n${r.css}\n</style>\n</head>\n<body style="margin:0;padding:40px;font-family:Geist,system-ui,sans-serif">\n${r.wrap ? `<div data-uv-theme="${r.wrap}">\n${r.html}\n</div>` : r.html}\n${r.js ? `<script>\n${r.js}\n</` + "script>" : ""}\n</body>\n</html>`;

  let dlg;
  function dialog() {
    if (dlg) return dlg;
    const st = document.createElement("style");
    st.textContent = `.raw-dlg{width:min(900px,calc(100vw - 24px));max-height:86vh;padding:0;border:1px solid #1a191740;border-radius:8px;background:#fbfaf8;color:#1a1917;box-shadow:0 30px 80px -20px #1a191780;font-family:Geist,system-ui,sans-serif}
.raw-dlg[open]{display:flex;flex-direction:column}.raw-dlg::backdrop{background:#1a191766}
.raw-dlg header{display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:12px 12px 12px 18px;border-bottom:1px solid #1a19172e}
.raw-dlg h3{margin:0;flex:1;font:400 24px "Instrument Serif",Georgia,serif}
.raw-dlg .tabs{display:flex;gap:2px}.raw-dlg .tabs button,.raw-dlg header>button{padding:6px 11px;border:1px solid #1a19172e;border-radius:4px;background:none;color:#5f5b54;font:500 12px "Geist Mono",monospace;cursor:pointer}
.raw-dlg .tabs button[aria-selected=true]{background:#1a1917;color:#fbfaf8;border-color:#1a1917}
.raw-dlg .note{margin:0;padding:10px 18px;font-size:13px;color:#5f5b54;border-bottom:1px solid #1a19171a}
.raw-dlg pre{margin:0;flex:1;overflow:auto;padding:18px;background:#1a1917;color:#d9d6cf;font:12.5px/1.65 "Geist Mono",monospace;white-space:pre}
.raw-dlg footer{display:flex;gap:8px;justify-content:flex-end;align-items:center;padding:10px 12px;border-top:1px solid #1a19172e}
.raw-dlg footer span{margin-right:auto;font:500 11px "Geist Mono",monospace;color:#8f8a82;text-transform:uppercase}
.raw-dlg footer button{height:34px;padding:0 14px;border-radius:4px;border:1px solid #1a19172e;background:none;font:500 13px Geist,system-ui;cursor:pointer;color:#1a1917}
.raw-dlg footer button.p{background:#1a1917;color:#fbfaf8;border-color:#1a1917}.raw-dlg footer button.p:hover{background:#ff4f00;border-color:#ff4f00}`;
    document.head.appendChild(st);
    dlg = document.createElement("dialog"); dlg.className = "raw-dlg";
    dlg.innerHTML = `<header><h3></h3><div class="tabs"></div><button data-x aria-label="Close">✕</button></header><p class="note"></p><pre></pre><footer><span></span><button data-dl>Download .html</button><button class="p" data-cp>Copy</button></footer>`;
    dlg.addEventListener("click", e => { if (e.target === dlg || e.target.closest("[data-x]")) dlg.close(); });
    document.body.appendChild(dlg);
    return dlg;
  }

  async function open(live, { title = "Raw code", html } = {}) {
    const d = dialog();
    d.querySelector("h3").textContent = title; d.querySelector("pre").textContent = "Extracting…"; d.querySelector(".tabs").innerHTML = "";
    if (!d.open) d.showModal();
    let r;
    try { r = await extract(live, html ?? live.innerHTML); }
    catch (e) { d.querySelector("pre").textContent = "Couldn't load lib/raw-src.js (" + e + ")."; return; }
    const doc = single(r);
    const parts = [["Single file", doc], ["HTML", r.wrap ? `<div data-uv-theme="${r.wrap}">\n${r.html}\n</div>` : r.html], ["CSS", r.css]].concat(r.js ? [["JS", r.js]] : []);
    d.querySelector(".note").innerHTML = `Plain HTML + CSS${r.js ? " + JS" : ""}. <b>No UI Vault files needed.</b> Only the rules, variables and keyframes this piece uses are included.` + (r.wrap ? ` It keeps its <code>${r.wrap}</code> theme wrapper.` : "");
    const pre = d.querySelector("pre"), tabs = d.querySelector(".tabs"), info = d.querySelector("footer span");
    let cur = parts[0][1];
    const show = k => { cur = parts[k][1]; pre.textContent = cur; info.textContent = (cur.length / 1024).toFixed(1) + " KB · " + cur.split("\n").length + " lines"; tabs.querySelectorAll("button").forEach((b, j) => b.setAttribute("aria-selected", j === k)); };
    parts.forEach(([n], k) => { const b = document.createElement("button"); b.textContent = n; b.onclick = () => show(k); tabs.appendChild(b); });
    show(0);
    d.querySelector("[data-cp]").onclick = () => (window.UV?.copy ? UV.copy(cur, "Raw code copied") : navigator.clipboard.writeText(cur));
    d.querySelector("[data-dl]").onclick = () => { const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([doc], { type: "text/html" })); a.download = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") + ".html"; a.click(); };
  }

  window.RawCode = { open, extract };
})();
