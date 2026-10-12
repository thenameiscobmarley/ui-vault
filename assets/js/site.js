// UI Vault — site logic. No dependencies.
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
  };
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  // ── Toasts + clipboard ────────────────────────────────────────
  function toast(msg) {
    const t = document.createElement("div");
    t.className = "toast"; t.textContent = msg;
    $("#toastHost").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 260); }, 1800);
  }
  async function copy(text, label = "Copied to clipboard") {
    try { await navigator.clipboard.writeText(text); }
    catch {
      const ta = document.createElement("textarea");
      ta.value = text; ta.style.position = "fixed"; ta.style.opacity = "0";
      document.body.appendChild(ta); ta.select(); document.execCommand("copy"); ta.remove();
    }
    toast("✓ " + label);
  }

  // ── Theme ─────────────────────────────────────────────────────
  $("#themeBtn").addEventListener("click", () => {
    const root = document.documentElement;
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("uiv-theme", next); } catch {}
    moveCatInd();
  });

  // ── Count-up stats ────────────────────────────────────────────
  function countUp(el, to) {
    const t0 = performance.now(), dur = 1100;
    const step = now => {
      const p = Math.min(1, (now - t0) / dur), e = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(to * e);
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  const RES = window.RESOURCES.map((r, i) => ({ name: r[0], url: r[1], cat: r[2], lic: r[3], desc: r[4], tags: r[5] || [], i }));
  const CATS = window.CATEGORIES;
  countUp($("#statRes"), RES.length);
  countUp($("#statCat"), CATS.length - 1);
  countUp($("#statDemo"), window.DEMOS.length);
  $("#specSnip").textContent = window.DEMOS.length;
  $("#specRes").textContent = RES.length;
  $("#demoCountBadge").textContent = window.DEMOS.length;

  // ── Library ───────────────────────────────────────────────────
  const state = { cat: "all", q: "", fav: false, sort: "curated" };
  const favs = new Set(store.get("uiv-favs", []));
  const catTabs = $("#catTabs"), ind = $(".cat-tabs__ind");

  CATS.forEach(c => {
    const n = c.id === "all" ? RES.length : RES.filter(r => r.cat === c.id).length;
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.dataset.cat = c.id;
    b.setAttribute("aria-selected", c.id === state.cat);
    b.innerHTML = `<span class="ic">${esc(c.icon)}</span>${esc(c.label)}<span class="n">${n}</span>`;
    b.addEventListener("click", () => { state.cat = c.id; syncCatTabs(); renderLib(); });
    catTabs.appendChild(b);
  });
  function moveCatInd() {
    const sel = $(`button[aria-selected="true"]`, catTabs);
    if (!sel) return;
    ind.style.width = sel.offsetWidth + "px";
    ind.style.transform = `translateX(${sel.offsetLeft}px)`;
  }
  function syncCatTabs() {
    $$("button", catTabs).forEach(b => b.setAttribute("aria-selected", b.dataset.cat === state.cat));
    moveCatInd();
    const sel = $(`button[aria-selected="true"]`, catTabs);
    sel && sel.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "smooth" });
  }
  window.addEventListener("resize", moveCatInd);
  document.fonts && document.fonts.ready.then(moveCatInd);
  requestAnimationFrame(moveCatInd);

  const hue = s => { let h = 0; for (const ch of s) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 360; };
  const host = u => { try { return new URL(u).host.replace(/^www\./, ""); } catch { return u; } };
  const hl = (text, q) => {
    const safe = esc(text);
    if (!q) return safe;
    const re = new RegExp("(" + q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "ig");
    return safe.replace(re, "<mark>$1</mark>");
  };
  const isFreeOnly = lic => /^free/i.test(lic);

  function matches(r, q) {
    if (!q) return true;
    const cat = CATS.find(c => c.id === r.cat);
    const hay = (r.name + " " + r.desc + " " + r.tags.join(" ") + " " + r.lic + " " + (cat ? cat.label : "")).toLowerCase();
    return q.split(/\s+/).every(w => hay.includes(w));
  }

  function renderLib() {
    const q = state.q.trim().toLowerCase();
    let list = RES.filter(r => (state.cat === "all" || r.cat === state.cat) && (!state.fav || favs.has(r.name)) && matches(r, q));
    if (state.sort === "az") list.sort((a, b) => a.name.localeCompare(b.name));
    else if (state.sort === "license") list.sort((a, b) => a.lic.localeCompare(b.lic) || a.name.localeCompare(b.name));

    const grid = $("#resGrid");
    grid.innerHTML = list.map((r, k) => {
      const h = hue(r.name), initials = r.name.replace(/[^A-Za-z0-9]/g, "").slice(0, 2) || "?";
      const fav = favs.has(r.name);
      return `<article class="res" style="animation-delay:${Math.min(k, 18) * 22}ms">
        <a class="res__link" href="${esc(r.url)}" target="_blank" rel="noopener" aria-label="${esc(r.name)}"></a>
        <div class="res__top">
          <span class="res__logo" style="background:linear-gradient(135deg,hsl(${h} 75% 58%),hsl(${(h + 50) % 360} 80% 45%))">${esc(initials[0].toUpperCase() + (initials[1] || "").toLowerCase())}</span>
          <div><h3 class="res__name">${hl(r.name, q)}</h3><span class="res__host">${esc(host(r.url))}</span></div>
          <button class="res__fav" data-fav="${esc(r.name)}" aria-pressed="${fav}" aria-label="Favorite ${esc(r.name)}">${fav ? "★" : "☆"}</button>
        </div>
        <p class="res__desc">${hl(r.desc, q)}</p>
        <div class="res__meta">
          <span class="tag ${isFreeOnly(r.lic) ? "tag--free" : "tag--lic"}">${esc(r.lic)}</span>
          ${r.tags.slice(0, 3).map(t => `<span class="tag">${hl(t, q)}</span>`).join("")}
        </div>
      </article>`;
    }).join("");
    $("#emptyState").hidden = list.length > 0;
    const cat = CATS.find(c => c.id === state.cat);
    $("#resultCount").textContent = `${list.length} ${list.length === 1 ? "resource" : "resources"}` +
      (state.cat !== "all" ? ` in ${cat.label}` : "") + (q ? ` matching “${state.q.trim()}”` : "");
  }

  $("#resGrid").addEventListener("click", e => {
    const b = e.target.closest(".res__fav");
    if (!b) return;
    e.preventDefault();
    const n = b.dataset.fav;
    favs.has(n) ? favs.delete(n) : favs.add(n);
    store.set("uiv-favs", [...favs]);
    const on = favs.has(n);
    b.setAttribute("aria-pressed", on); b.textContent = on ? "★" : "☆";
    b.classList.remove("pop"); void b.offsetWidth; b.classList.add("pop");
    if (state.fav && !on) renderLib();
  });
  // Spotlight follows the cursor (one delegated listener, CSS vars only)
  $("#resGrid").addEventListener("pointermove", e => {
    const c = e.target.closest(".res");
    if (!c) return;
    const r = c.getBoundingClientRect();
    c.style.setProperty("--x", e.clientX - r.left + "px");
    c.style.setProperty("--y", e.clientY - r.top + "px");
  });

  const search = $("#search");
  let qTimer;
  search.addEventListener("input", () => {
    clearTimeout(qTimer);
    qTimer = setTimeout(() => { state.q = search.value; renderLib(); }, 90);
  });
  search.addEventListener("keydown", e => {
    if (e.key === "Enter") $("#library").scrollIntoView({ behavior: "smooth" });
    if (e.key === "Escape") { search.value = ""; state.q = ""; renderLib(); search.blur(); }
  });
  document.addEventListener("keydown", e => {
    if (e.key === "/" && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { e.preventDefault(); search.focus(); }
  });
  ["tabs", "buttons", "bloom", "icons", "glass", "rust", "game", "fonts", "svelte"].forEach(w => {
    const b = document.createElement("button");
    b.className = "chip"; b.textContent = w;
    b.addEventListener("click", () => {
      search.value = w; state.q = w; state.cat = "all"; syncCatTabs(); renderLib();
      $("#library").scrollIntoView({ behavior: "smooth" });
    });
    $("#quickChips").appendChild(b);
  });
  $("#favOnly").addEventListener("change", e => { state.fav = e.target.checked; renderLib(); });
  $("#sortSel").addEventListener("change", e => { state.sort = e.target.value; renderLib(); });
  renderLib();

  // ── Playground ────────────────────────────────────────────────
  const DEMOS = window.DEMOS;
  const style = document.createElement("style");
  style.textContent = DEMOS.map(d => d.css).join("\n");
  document.head.appendChild(style);

  const groups = ["All", ...window.DEMO_GROUPS];
  let curGroup = "All";
  groups.forEach(g => {
    const b = document.createElement("button");
    b.setAttribute("role", "tab");
    b.textContent = g;
    b.setAttribute("aria-selected", g === curGroup);
    b.addEventListener("click", () => {
      curGroup = g;
      $$("#demoTabs button").forEach(x => x.setAttribute("aria-selected", x === b));
      renderDemos();
    });
    $("#demoTabs").appendChild(b);
  });

  $("#demoSearch").addEventListener("input", () => renderDemos());
  function renderDemos() {
    const grid = $("#demoGrid");
    grid.innerHTML = "";
    queueMicrotask(() => { $("#demoCount").textContent = grid.children.length + " of " + DEMOS.length; });
    DEMOS.forEach((d, i) => {
      if (curGroup !== "All" && d.group !== curGroup) return;
      const dq = ($("#demoSearch").value || "").trim().toLowerCase();
      if (dq && !(d.title + " " + d.group).toLowerCase().includes(dq)) return;
      const card = document.createElement("article");
      card.className = "demo";
      card.style.animationDelay = Math.min(grid.children.length, 12) * 35 + "ms";
      card.innerHTML = `<div class="demo__stage">${d.html}</div>
        <div class="demo__bar"><h3>${esc(d.title)}</h3><small>${esc(d.group)}</small>
          <button class="btn btn--ghost btn--sm" data-code="${i}">Code</button>
          <button class="btn btn--primary btn--sm" data-copy="${i}">Copy</button></div>`;
      grid.appendChild(card);
      if (d.js) {
        try { new Function("root", d.js)(card.querySelector(".demo__stage")); } catch (err) { console.warn(d.title, err); }
      }
    });
  }
  const fullSnippet = d => `<!-- ${d.title} — from UI Vault -->\n${d.html}\n\n<style>\n${d.css}\n</style>` +
    (d.js ? `\n\n<script>\n(() => {\n  const root = document;\n  ${d.js.replace(/\n/g, "\n  ")}\n})();\n<\/script>` : "");

  $("#demoGrid").addEventListener("click", e => {
    const c = e.target.closest("[data-copy]"), o = e.target.closest("[data-code]");
    if (c) copy(fullSnippet(DEMOS[+c.dataset.copy]), "Snippet copied");
    if (o) openCode(DEMOS[+o.dataset.code]);
  });
  renderDemos();

  // ── Code dialog ───────────────────────────────────────────────
  const dlg = $("#codeDlg");
  let dlgText = "";
  function openCode(d, extra) {
    $("#codeTitle").textContent = d.title;
    const parts = extra || [["HTML", d.html], ["CSS", d.css.replace(/\}/g, "}\n").replace(/\n\n/g, "\n")]].concat(d.js ? [["JS", d.js]] : []).concat([["All", fullSnippet(d)]]);
    const tabs = $("#codeTabs");
    tabs.innerHTML = "";
    const show = k => {
      dlgText = parts[k][1];
      $("#codeBody").textContent = dlgText;
      $$("button", tabs).forEach((b, j) => b.setAttribute("aria-selected", j === k));
    };
    parts.forEach((p, k) => {
      const b = document.createElement("button");
      b.textContent = p[0]; b.setAttribute("role", "tab");
      b.addEventListener("click", () => show(k));
      tabs.appendChild(b);
    });
    show(0);
    dlg.showModal();
  }
  $("#codeClose").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $("#codeCopy").addEventListener("click", () => copy(dlgText));

  // ── Post-FX Lab (WebGL) ───────────────────────────────────────
  initPostFX();

  function initPostFX() {
    const canvas = $("#fxCanvas");
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false, preserveDrawingBuffer: false });
    if (!gl) { $("#fxNoGL").hidden = false; return; }

    const VS = `attribute vec2 p; varying vec2 uv; void main(){ uv = p*.5+.5; gl_Position = vec4(p,0.,1.); }`;

    // Pass 1: a procedural synthwave scene (or the user's image, cover-fitted)
    const SCENE = `precision mediump float; varying vec2 uv;
uniform float uTime; uniform vec2 uRes; uniform sampler2D uImg; uniform float uUseImg; uniform float uImgAspect;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
void main(){
  if (uUseImg > .5) {
    float ca = uRes.x/uRes.y; vec2 t = uv;
    if (uImgAspect > ca) t.x = (t.x-.5)*ca/uImgAspect+.5; else t.y = (t.y-.5)*uImgAspect/ca+.5;
    gl_FragColor = texture2D(uImg, vec2(t.x, 1.-t.y)); return;
  }
  vec2 p = (uv - vec2(.5,.38)) * vec2(uRes.x/uRes.y, 1.);
  vec3 col = mix(vec3(.02,.01,.08), vec3(.35,.05,.35), smoothstep(.6,-.05,p.y));
  // stars
  vec2 g = floor(uv*vec2(160.,90.)); float s = hash(g);
  col += step(.993, s) * (.5+.5*sin(uTime*2.+s*40.)) * smoothstep(.0,.3,p.y);
  // sun with stripes
  float d = length(p - vec2(0.,.17));
  float stripes = step(.5, fract((p.y-.17)*22. - uTime*.4)) + step(.02, p.y-.04);
  vec3 sun = mix(vec3(1.,.15,.55), vec3(1.,.85,.25), smoothstep(-.1,.42,p.y));
  col = mix(col, sun*1.25, smoothstep(.255,.25,d) * clamp(stripes,0.,1.));
  col += sun * .08 / (d*d*14.+.4) * step(0., p.y);
  // mountains
  float m = .06 + .05*sin(p.x*7.+1.) + .03*sin(p.x*17.) + .015*sin(p.x*41.);
  if (p.y < m && p.y > 0.) col = mix(vec3(.05,.02,.12), vec3(.25,.05,.35), p.y/m*.6);
  // perspective grid floor
  if (p.y < 0.) {
    float z = .2 / -p.y; vec2 w = vec2(p.x*z, z + uTime*1.2);
    vec2 gl2 = abs(fract(w) - .5) / fwidth(w);
    float line = 1. - min(min(gl2.x, gl2.y), 1.);
    col = vec3(.03,.0,.08) + vec3(.95,.2,1.) * line * smoothstep(9.,0.,z) * 1.6;
    col += vec3(.6,.1,.6) * .12 * smoothstep(-.12, 0., p.y);
  }
  // floating neon ring
  float r = abs(length(p - vec2(-.55+.04*sin(uTime*.7), .3+.03*cos(uTime))) - .07);
  col += vec3(.1,.9,1.) * smoothstep(.008,.0,r) * 1.4 + vec3(.1,.8,1.)*.004/(r+.004);
  gl_FragColor = vec4(col, 1.);
}`;

    // Pass 2: bright-pass + blur at quarter resolution
    const BLOOM = `precision mediump float; varying vec2 uv;
uniform sampler2D uTex; uniform vec2 uPx; uniform float uThreshold;
vec3 bright(vec2 t){ vec3 c = texture2D(uTex, t).rgb; float l = max(c.r, max(c.g, c.b)); return c * smoothstep(uThreshold, uThreshold + .25, l); }
void main(){
  vec3 acc = vec3(0.); float wsum = 0.;
  for (int x = -3; x <= 3; x++) for (int y = -3; y <= 3; y++) {
    vec2 o = vec2(float(x), float(y)); float w = exp(-dot(o,o)/6.);
    acc += bright(uv + o * uPx * 2.2) * w; wsum += w;
  }
  gl_FragColor = vec4(acc / wsum, 1.);
}`;

    // Pass 3: the post-processing composite — this is what "Copy GLSL" gives you
    const POST = `precision mediump float;
varying vec2 uv;
uniform sampler2D uScene;     // full-res scene
uniform sampler2D uBloom;     // blurred bright pass
uniform vec2  uRes;
uniform float uTime;
uniform float uBloomAmt;      // 0..2
uniform float uChroma;        // 0..1   chromatic aberration
uniform float uVignette;      // 0..1
uniform float uGrain;         // 0..1
uniform float uScan;          // 0..1   CRT scanlines
uniform float uCurve;         // 0..1   CRT barrel curvature
uniform float uSat;           // 0..2
uniform float uExposure;      // 0.5..2
uniform float uBypass;

float hash(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }

void main(){
  if (uBypass > .5) { gl_FragColor = texture2D(uScene, uv); return; }
  // 1. CRT curvature (barrel distortion)
  vec2 c = uv * 2. - 1.;
  c *= 1. + uCurve * .18 * dot(c.yx, c.yx);
  vec2 t = c * .5 + .5;
  if (t.x < 0. || t.x > 1. || t.y < 0. || t.y > 1.) { gl_FragColor = vec4(0., 0., 0., 1.); return; }

  // 2. Chromatic aberration: split RGB along the radius
  vec2 dir = (t - .5) * uChroma * .018;
  vec3 col;
  col.r = texture2D(uScene, t + dir).r;
  col.g = texture2D(uScene, t).g;
  col.b = texture2D(uScene, t - dir).b;

  // 3. Bloom (additive)
  col += texture2D(uBloom, t).rgb * uBloomAmt;

  // 4. Exposure + ACES-ish tone map + saturation
  col *= uExposure;
  col = clamp((col * (2.51 * col + .03)) / (col * (2.43 * col + .59) + .14), 0., 1.);
  float l = dot(col, vec3(.2126, .7152, .0722));
  col = mix(vec3(l), col, uSat);

  // 5. Scanlines
  col *= 1. - uScan * .35 * (.5 + .5 * sin(t.y * uRes.y * 3.14159));

  // 6. Vignette
  vec2 v = t * (1. - t.yx);
  col *= mix(1., pow(v.x * v.y * 16., .35), uVignette);

  // 7. Film grain (animated)
  col += (hash(t * uRes + fract(uTime) * 100.) - .5) * uGrain * .18;

  gl_FragColor = vec4(col, 1.);
}`;

    function prog(fs) {
      const p = gl.createProgram();
      [[gl.VERTEX_SHADER, VS], [gl.FRAGMENT_SHADER, fs]].forEach(([type, src]) => {
        const s = gl.createShader(type);
        gl.shaderSource(s, src); gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) console.error(gl.getShaderInfoLog(s));
        gl.attachShader(p, s);
      });
      gl.bindAttribLocation(p, 0, "p");
      gl.linkProgram(p);
      const u = {}, n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const name = gl.getActiveUniform(p, i).name; u[name] = gl.getUniformLocation(p, name); }
      return { p, u };
    }
    gl.getExtension("OES_standard_derivatives");
    const sceneP = prog("#extension GL_OES_standard_derivatives : enable\n" + SCENE);
    const bloomP = prog(BLOOM), postP = prog(POST);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);

    function target(w, h) {
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
      [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
      [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
      const fb = gl.createFramebuffer();
      gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
      gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
      return { tex, fb, w, h };
    }
    const W = canvas.width, H = canvas.height;
    const sceneT = target(W, H), bloomT = target(W >> 2, H >> 2);

    const imgTex = gl.createTexture();
    let useImg = 0, imgAspect = 1;
    gl.bindTexture(gl.TEXTURE_2D, imgTex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 255]));

    const P = {
      bloom:     { label: "Bloom",              min: 0,  max: 2, v: .8 },
      threshold: { label: "Bloom threshold",    min: 0,  max: 1, v: .55 },
      chroma:    { label: "Chromatic aberration", min: 0, max: 1, v: .3 },
      vignette:  { label: "Vignette",           min: 0,  max: 1, v: .5 },
      grain:     { label: "Film grain",         min: 0,  max: 1, v: .2 },
      scan:      { label: "Scanlines",          min: 0,  max: 1, v: 0 },
      curve:     { label: "CRT curvature",      min: 0,  max: 1, v: 0 },
      sat:       { label: "Saturation",         min: 0,  max: 2, v: 1.1 },
      exposure:  { label: "Exposure",           min: .5, max: 2, v: 1 },
    };
    const PRESETS = {
      "Clean":     { bloom: 0, threshold: .6, chroma: 0, vignette: 0, grain: 0, scan: 0, curve: 0, sat: 1, exposure: 1 },
      "Cinematic": { bloom: .8, threshold: .55, chroma: .3, vignette: .5, grain: .2, scan: 0, curve: 0, sat: 1.1, exposure: 1 },
      "Retro CRT": { bloom: .7, threshold: .45, chroma: .7, vignette: .7, grain: .3, scan: .8, curve: .7, sat: 1.2, exposure: 1.15 },
      "Dreamy":    { bloom: 1.6, threshold: .25, chroma: .15, vignette: .35, grain: .1, scan: 0, curve: 0, sat: .85, exposure: 1.1 },
      "Cyberpunk": { bloom: 1.2, threshold: .4, chroma: 1, vignette: .6, grain: .25, scan: .25, curve: .15, sat: 1.5, exposure: 1.05 },
    };

    const sliders = $("#fxSliders");
    Object.entries(P).forEach(([k, s]) => {
      const lab = document.createElement("label");
      lab.className = "slider";
      lab.innerHTML = `<span>${s.label}<output></output></span><input type="range" min="${s.min}" max="${s.max}" step="0.01" value="${s.v}">`;
      const inp = $("input", lab), out = $("output", lab);
      s.sync = () => {
        inp.value = s.v; out.textContent = (+s.v).toFixed(2);
        inp.style.setProperty("--v", ((s.v - s.min) / (s.max - s.min)) * 100 + "%");
      };
      inp.addEventListener("input", () => { s.v = +inp.value; s.sync(); markPreset(null); kick(); });
      sliders.appendChild(lab);
      s.sync();
    });
    const presetBox = $("#fxPresets");
    function markPreset(name) { $$("button", presetBox).forEach(b => b.setAttribute("aria-pressed", b.textContent === name)); }
    Object.keys(PRESETS).forEach(name => {
      const b = document.createElement("button");
      b.className = "chip"; b.textContent = name;
      b.addEventListener("click", () => {
        const from = Object.fromEntries(Object.entries(P).map(([k, s]) => [k, s.v])), to = PRESETS[name], t0 = performance.now();
        const tween = now => {
          const p = Math.min(1, (now - t0) / 400), e = p * (2 - p);
          Object.entries(P).forEach(([k, s]) => { s.v = from[k] + (to[k] - from[k]) * e; s.sync(); });
          kick();
          if (p < 1) requestAnimationFrame(tween);
        };
        requestAnimationFrame(tween);
        markPreset(name);
      });
      presetBox.appendChild(b);
    });
    markPreset("Cinematic");

    let playing = true, visible = false, bypass = 0, time = 0, last = performance.now(), raf = 0;
    function draw() {
      // Scene pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, sceneT.fb); gl.viewport(0, 0, W, H);
      gl.useProgram(sceneP.p);
      gl.uniform1f(sceneP.u.uTime, time); gl.uniform2f(sceneP.u.uRes, W, H);
      gl.uniform1f(sceneP.u.uUseImg, useImg); gl.uniform1f(sceneP.u.uImgAspect, imgAspect);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, imgTex); gl.uniform1i(sceneP.u.uImg, 0);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Bloom pass
      gl.bindFramebuffer(gl.FRAMEBUFFER, bloomT.fb); gl.viewport(0, 0, bloomT.w, bloomT.h);
      gl.useProgram(bloomP.p);
      gl.bindTexture(gl.TEXTURE_2D, sceneT.tex); gl.uniform1i(bloomP.u.uTex, 0);
      gl.uniform2f(bloomP.u.uPx, 1 / bloomT.w, 1 / bloomT.h); gl.uniform1f(bloomP.u.uThreshold, P.threshold.v);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      // Composite
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, W, H);
      gl.useProgram(postP.p);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, sceneT.tex); gl.uniform1i(postP.u.uScene, 0);
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, bloomT.tex); gl.uniform1i(postP.u.uBloom, 1);
      gl.activeTexture(gl.TEXTURE0);
      gl.uniform2f(postP.u.uRes, W, H); gl.uniform1f(postP.u.uTime, time);
      gl.uniform1f(postP.u.uBloomAmt, P.bloom.v); gl.uniform1f(postP.u.uChroma, P.chroma.v);
      gl.uniform1f(postP.u.uVignette, P.vignette.v); gl.uniform1f(postP.u.uGrain, P.grain.v);
      gl.uniform1f(postP.u.uScan, P.scan.v); gl.uniform1f(postP.u.uCurve, P.curve.v);
      gl.uniform1f(postP.u.uSat, P.sat.v); gl.uniform1f(postP.u.uExposure, P.exposure.v);
      gl.uniform1f(postP.u.uBypass, bypass);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    }
    function loop(now) {
      raf = 0;
      if (playing) time += Math.min(.05, (now - last) / 1000);
      last = now;
      draw();
      if (playing && visible) raf = requestAnimationFrame(loop);
    }
    function kick() { if (!raf && visible) { last = performance.now(); raf = requestAnimationFrame(loop); } }
    // Only render while on screen — keeps integrated GPUs cool.
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); }).observe(canvas);

    $("#fxPlay").addEventListener("click", e => {
      playing = !playing;
      e.currentTarget.textContent = playing ? "❚❚ Pause" : "▶ Play";
      kick();
    });
    const cmp = $("#fxCompare");
    const on = () => { bypass = 1; kick(); }, off = () => { bypass = 0; kick(); };
    cmp.addEventListener("pointerdown", on);
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => cmp.addEventListener(ev, off));
    $("#fxFile").addEventListener("change", e => {
      const f = e.target.files[0];
      if (!f) return;
      const img = new Image();
      img.onload = () => {
        gl.bindTexture(gl.TEXTURE_2D, imgTex);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
        [gl.TEXTURE_MIN_FILTER, gl.TEXTURE_MAG_FILTER].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.LINEAR));
        [gl.TEXTURE_WRAP_S, gl.TEXTURE_WRAP_T].forEach(k => gl.texParameteri(gl.TEXTURE_2D, k, gl.CLAMP_TO_EDGE));
        useImg = 1; imgAspect = img.width / img.height;
        URL.revokeObjectURL(img.src);
        toast("Image loaded — tweak away");
        kick();
      };
      img.src = URL.createObjectURL(f);
    });
    $("#fxCopy").addEventListener("click", () => copy(POST, "GLSL shader copied"));
  }

  // ── Logo Forge ────────────────────────────────────────────────
  const MARKS = {
    chevron: "M6 7l6 11 6-11",
    bolt: "M13 3L5 14h6l-1 7 8-11h-6l1-7z",
    spark: "M12 3v18M3 12h18M6 6l12 12M18 6L6 18",
    hex: "M12 3l7.8 4.5v9L12 21l-7.8-4.5v-9z",
    wave: "M3 12c3-6 6-6 9 0s6 6 9 0",
    orbit: "M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0M3 12a9 4 0 1 0 18 0a9 4 0 1 0-18 0",
    peak: "M3 19l6-10 4 6 3-4 5 8z",
    stack: "M12 4l8 4-8 4-8-4zM4 12l8 4 8-4M4 16l8 4 8-4",
    target: "M5 12a7 7 0 1 0 14 0a7 7 0 1 0-14 0M10 12a2 2 0 1 0 4 0a2 2 0 1 0-4 0",
    drop: "M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z",
    loop: "M7 9a3 3 0 1 0 0 6c3 0 7-6 10-6a3 3 0 1 1 0 6c-3 0-7-6-10-6z",
    frame: "M5 5h14v14H5zM5 19L19 5",
  };
  const lg = { mark: "chevron" };
  const markBox = $("#lgMarks");
  Object.entries(MARKS).forEach(([k, d]) => {
    const b = document.createElement("button");
    b.setAttribute("aria-label", k); b.title = k;
    b.innerHTML = `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="${d}"/></svg>`;
    b.addEventListener("click", () => { lg.mark = k; renderLogo(); });
    markBox.appendChild(b);
  });

  function iconSVG(size, id) {
    const c1 = $("#lgC1").value, c2 = $("#lgC2").value, shape = $("#lgShape").value;
    const grad = `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>`;
    let bg = "", stroke = "#fff";
    if (shape === "squircle") bg = `<rect width="64" height="64" rx="18" fill="url(#${id})"/><rect x=".5" y=".5" width="63" height="63" rx="17.5" fill="none" stroke="#fff" stroke-opacity=".25"/>`;
    else if (shape === "circle") bg = `<circle cx="32" cy="32" r="32" fill="url(#${id})"/>`;
    else stroke = `url(#${id})`;
    const inset = shape === "none" ? `translate(2 2) scale(2.5)` : `translate(14 14) scale(1.5)`;
    return { defs: grad, body: `${bg}<g transform="${inset}" fill="none" stroke="${stroke}" stroke-width="${shape === "none" ? 2.2 : 2.4}" stroke-linecap="round" stroke-linejoin="round"><path d="${MARKS[lg.mark]}"/></g>`, size };
  }
  function logoSVG(textColor, id) {
    const name = $("#lgName").value.trim() || "Logo";
    const font = $("#lgFont").value, weight = $("#lgWeight").value;
    const ic = iconSVG(64, id);
    const tw = Math.ceil(name.length * 40 * (font === "JetBrains Mono" ? .62 : .56));
    const w = 64 + 18 + tw + 6;
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} 64" width="${w}" height="64"><defs>${ic.defs}</defs>${ic.body}` +
      `<text x="82" y="45" font-family="'${font}', system-ui, sans-serif" font-size="40" font-weight="${weight}" letter-spacing="-1.2" fill="${textColor}">${esc(name)}</text></svg>`;
  }
  function appIcon(px, id) {
    const ic = iconSVG(64, id);
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="${px}" height="${px}"><defs>${ic.defs}</defs>${ic.body}</svg>`;
  }
  function renderLogo() {
    $$("button", markBox).forEach(b => b.setAttribute("aria-pressed", b.title === lg.mark));
    $("#lgDark").innerHTML = logoSVG("#ffffff", "lgd");
    $("#lgLight").innerHTML = logoSVG("#111118", "lgl");
    $("#lgIcons").innerHTML = [96, 64, 32, 16].map((s, i) => `<figure>${appIcon(s, "lgi" + i)}<figcaption>${s}px</figcaption></figure>`).join("");
  }
  ["#lgName", "#lgC1", "#lgC2", "#lgShape", "#lgFont", "#lgWeight"].forEach(s => $(s).addEventListener("input", () => {
    if (s === "#lgWeight") $(s).style.setProperty("--v", (($(s).value - 400) / 300) * 100 + "%");
    renderLogo();
  }));
  $("#lgWeight").style.setProperty("--v", "100%");
  const exportSVG = () => logoSVG("currentColor", "logoGrad");
  $("#lgDownload").addEventListener("click", () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([exportSVG()], { type: "image/svg+xml" }));
    a.download = ($("#lgName").value.trim() || "logo").toLowerCase().replace(/\s+/g, "-") + ".svg";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast("✓ SVG downloaded");
  });
  $("#lgCopy").addEventListener("click", () => copy(exportSVG(), "SVG copied"));
  $("#lgRandom").addEventListener("click", () => {
    const keys = Object.keys(MARKS), h = Math.random() * 360;
    const hsl2hex = (h, s, l) => {
      s /= 100; l /= 100;
      const f = n => { const k = (n + h / 30) % 12, c = l - s * Math.min(l, 1 - l) * Math.max(-1, Math.min(k - 3, 9 - k, 1)); return Math.round(c * 255).toString(16).padStart(2, "0"); };
      return "#" + f(0) + f(8) + f(4);
    };
    lg.mark = keys[Math.floor(Math.random() * keys.length)];
    $("#lgC1").value = hsl2hex(h, 85, 62);
    $("#lgC2").value = hsl2hex((h + 40 + Math.random() * 80) % 360, 85, 50);
    const names = ["Nimbus", "Orbit", "Lumen", "Vertex", "Pulse", "Prism", "Halo", "Forge", "Drift", "Nova", "Ember", "Quill"];
    $("#lgName").value = names[Math.floor(Math.random() * names.length)];
    renderLogo();
  });
  renderLogo();
})();
