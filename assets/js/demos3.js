// UI Vault — snippet pack 3 (40 more). Palette: ink #1a1917, paper #ecebe8, stone #8f8a82, signal #ff6a26.
window.DEMO_GROUPS.splice(window.DEMO_GROUPS.indexOf("Feedback"), 0, "Data");
const F = "font-family:system-ui,sans-serif;";
window.DEMOS.push(
  // ── Buttons (6) ──
  { group: "Buttons", title: "Underline link button", html: `<a class="e-ul" href="#">View case study</a>`,
    css: `.e-ul{position:relative;color:#ecebe8;${F}font-weight:500;font-size:17px;text-decoration:none;padding:4px 0}
.e-ul::after{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:#ecebe8;transform-origin:right;transition:transform .5s cubic-bezier(.7,0,.2,1)}
.e-ul:hover::after{transform:scaleX(0)}
.e-ul::before{content:"";position:absolute;left:0;right:0;bottom:0;height:1px;background:#ff6a26;transform:scaleX(0);transform-origin:left;transition:transform .5s .15s cubic-bezier(.7,0,.2,1)}
.e-ul:hover::before{transform:scaleX(1)}` },
  { group: "Buttons", title: "Text roll button", html: `<button class="e-roll"><span data-t="Get in touch">Get in touch</span></button>`,
    css: `.e-roll{border:0;border-radius:999px;padding:14px 26px;background:#ecebe8;color:#1a1917;${F}font-weight:600;font-size:15px;cursor:pointer;overflow:hidden}
.e-roll span{position:relative;display:inline-block;transition:transform .45s cubic-bezier(.7,0,.2,1)}
.e-roll span::after{content:attr(data-t);position:absolute;left:0;top:100%;color:#ff4f00}
.e-roll:hover span{transform:translateY(-100%)}` },
  { group: "Buttons", title: "Corner brackets", html: `<button class="e-brk">Launch</button>`,
    css: `.e-brk{position:relative;border:0;background:none;padding:14px 28px;color:#ecebe8;font:500 14px ui-monospace,monospace;letter-spacing:.12em;text-transform:uppercase;cursor:pointer}
.e-brk::before,.e-brk::after{content:"";position:absolute;width:10px;height:10px;border:1.5px solid #ff6a26;transition:all .35s cubic-bezier(.3,1.4,.5,1)}
.e-brk::before{left:0;top:0;border-right:0;border-bottom:0}.e-brk::after{right:0;bottom:0;border-left:0;border-top:0}
.e-brk:hover::before,.e-brk:hover::after{width:100%;height:100%}` },
  { group: "Buttons", title: "Hold to confirm", html: `<button class="e-hold"><i></i><span>Hold to delete</span></button>`,
    css: `.e-hold{position:relative;overflow:hidden;border:1px solid #ffffff30;border-radius:6px;padding:13px 24px;background:#1f1f1d;color:#ecebe8;${F}font-weight:500;cursor:pointer;user-select:none}
.e-hold i{position:absolute;inset:0;background:#c4321f;transform:scaleX(0);transform-origin:left;transition:transform .3s}
.e-hold.on i{transform:scaleX(1);transition:transform 1.2s linear}
.e-hold span{position:relative}`,
    js: `const b = root.querySelector(".e-hold"), s = b.querySelector("span"); let t;
const up = () => { b.classList.remove("on"); clearTimeout(t); };
b.addEventListener("pointerdown", () => { b.classList.add("on"); t = setTimeout(() => { s.textContent = "Deleted"; up(); setTimeout(() => s.textContent = "Hold to delete", 1500); }, 1200); });
["pointerup", "pointerleave"].forEach(e => b.addEventListener(e, up));` },
  { group: "Buttons", title: "Split icon button", html: `<button class="e-split"><span>Download</span><i>↓</i></button>`,
    css: `.e-split{display:inline-flex;border:1px solid #ecebe8;border-radius:4px;padding:0;background:none;color:#ecebe8;${F}font-weight:500;cursor:pointer;overflow:hidden}
.e-split span{padding:12px 18px}.e-split i{display:grid;place-items:center;width:44px;border-left:1px solid #ecebe8;font-style:normal;transition:background .25s,color .25s}
.e-split:hover i{background:#ff6a26;color:#1a1917}
.e-split:hover i{animation:e-dl .6s}
@keyframes e-dl{40%{transform:translateY(4px)}}` },
  { group: "Buttons", title: "Toggle follow button", html: `<button class="e-follow">Follow</button>`,
    css: `.e-follow{min-width:120px;border:1px solid #ecebe8;border-radius:999px;padding:11px 20px;background:#ecebe8;color:#1a1917;${F}font-weight:600;cursor:pointer;transition:all .25s}
.e-follow.on{background:transparent;color:#ecebe8}
.e-follow.on:hover{border-color:#c4321f;color:#ff8a7a}`,
    js: `const b = root.querySelector(".e-follow");
b.addEventListener("click", () => { b.classList.toggle("on"); b.textContent = b.classList.contains("on") ? "Following" : "Follow"; });
b.addEventListener("mouseenter", () => { if (b.classList.contains("on")) b.textContent = "Unfollow"; });
b.addEventListener("mouseleave", () => { if (b.classList.contains("on")) b.textContent = "Following"; });` },

  // ── Cards (6) ──
  { group: "Cards", title: "Editorial article card", html: `<a class="e-art" href="#"><div></div><small>ESSAY · 6 MIN</small><h4>Why we stopped doing standups</h4></a>`,
    css: `.e-art{display:block;width:260px;text-decoration:none;color:#ecebe8}
.e-art div{aspect-ratio:4/3;border-radius:4px;background:repeating-linear-gradient(-45deg,#2b2b29 0 1px,transparent 1px 10px),#222220;transition:transform .5s cubic-bezier(.2,.8,.2,1)}
.e-art small{display:block;margin:14px 0 6px;color:#8f8a82;font:500 11px ui-monospace,monospace;letter-spacing:.05em}
.e-art h4{margin:0;font:400 26px/1.1 Georgia,serif}
.e-art:hover div{transform:scale(.97)}.e-art:hover h4{text-decoration:underline;text-decoration-color:#ff6a26;text-underline-offset:4px}` },
  { group: "Cards", title: "Ticket stub", html: `<div class="e-tkt"><div><small>ADMIT ONE</small><b>Design Systems Day</b><span>Oct 24 · Lisbon</span></div><div><small>SEAT</small><b>F-12</b></div></div>`,
    css: `.e-tkt{display:flex;color:#1a1917;${F}filter:drop-shadow(0 10px 20px #0006)}
.e-tkt>div{background:#ecebe8;padding:18px 20px;display:grid;gap:4px}
.e-tkt>div:first-child{border-radius:8px 0 0 8px;border-right:2px dashed #1a191740;-webkit-mask:radial-gradient(circle at 100% 0,transparent 8px,#000 9px) top/100% 51% no-repeat,radial-gradient(circle at 100% 100%,transparent 8px,#000 9px) bottom/100% 51% no-repeat}
.e-tkt>div:last-child{border-radius:0 8px 8px 0;text-align:center;background:#ff6a26}
.e-tkt small{font:500 10px ui-monospace,monospace;letter-spacing:.1em;opacity:.6}
.e-tkt b{font-size:18px}.e-tkt span{font-size:13px;opacity:.7}` },
  { group: "Cards", title: "Stacked notification cards", html: `<div class="e-stack"><div>Deploy finished · main</div><div>3 new comments</div><div>Build passed · v4.0</div></div>`,
    css: `.e-stack{display:grid;width:280px;cursor:pointer}
.e-stack div{grid-area:1/1;padding:16px 18px;border-radius:8px;background:#ecebe8;color:#1a1917;${F}font-size:14px;font-weight:500;box-shadow:0 8px 24px #0005;transition:transform .45s cubic-bezier(.3,1.3,.5,1),opacity .3s}
.e-stack div:nth-child(1){transform:translateY(-16px) scale(.9);opacity:.5}
.e-stack div:nth-child(2){transform:translateY(-8px) scale(.95);opacity:.8}
.e-stack:hover div:nth-child(1){transform:translateY(-112px);opacity:1}
.e-stack:hover div:nth-child(2){transform:translateY(-56px);opacity:1}` },
  { group: "Cards", title: "Spec sheet card", html: `<div class="e-spec"><h4>AR—01 Runner</h4><dl><dt>Weight</dt><dd>212 g</dd><dt>Drop</dt><dd>8 mm</dd><dt>Upper</dt><dd>Recycled knit</dd><dt>Colour</dt><dd>Signal</dd></dl></div>`,
    css: `.e-spec{width:280px;padding:20px;border:1px solid #ffffff26;border-radius:6px;color:#ecebe8;${F}}
.e-spec h4{margin:0 0 14px;font:400 28px Georgia,serif}
.e-spec dl{display:grid;grid-template-columns:1fr auto;margin:0}
.e-spec dt,.e-spec dd{margin:0;padding:9px 0;border-top:1px solid #ffffff1a;font-size:14px}
.e-spec dt{color:#8f8a82}.e-spec dd{font-family:ui-monospace,monospace}` },
  { group: "Cards", title: "Hover reveal card", html: `<div class="e-rev"><h4>Studio Halden</h4><p>Identity, web and motion for cultural institutions. Based in Copenhagen since 2014.</p></div>`,
    css: `.e-rev{width:260px;height:200px;padding:20px;border-radius:6px;background:#ff6a26;color:#1a1917;${F}display:flex;flex-direction:column;justify-content:flex-end;overflow:hidden;cursor:pointer}
.e-rev h4{margin:0;font:400 32px/1 Georgia,serif;transition:transform .45s cubic-bezier(.3,1,.3,1)}
.e-rev p{margin:0;max-height:0;opacity:0;font-size:14px;line-height:1.45;transition:all .45s cubic-bezier(.3,1,.3,1)}
.e-rev:hover p{max-height:100px;opacity:1;margin-top:10px}` },
  { group: "Cards", title: "Weather mini", html: `<div class="e-wx"><span>LISBON</span><b>23°</b><i></i><small>Partly cloudy · H 25° L 17°</small></div>`,
    css: `.e-wx{position:relative;width:220px;padding:18px;border-radius:8px;background:#ecebe8;color:#1a1917;${F}display:grid;gap:4px}
.e-wx span{font:500 11px ui-monospace,monospace;letter-spacing:.08em;color:#5f5b54}
.e-wx b{font:400 64px/1 Georgia,serif}
.e-wx i{position:absolute;right:18px;top:18px;width:30px;height:30px;border-radius:50%;background:#ff6a26;box-shadow:12px 10px 0 -4px #ecebe8,12px 10px 0 -2px #d8d4cc;animation:e-sun 6s ease-in-out infinite}
.e-wx small{font-size:12px;color:#5f5b54}
@keyframes e-sun{50%{transform:translateY(-4px)}}` },

  // ── Text (5) ──
  { group: "Text", title: "Rotating word", html: `<h3 class="e-rot">We build <span><i>tools.</i><i>brands.</i><i>products.</i><i>tools.</i></span></h3>`,
    css: `.e-rot{margin:0;color:#ecebe8;font:400 40px/1.1 Georgia,serif;display:flex;gap:.25em}
.e-rot span{display:inline-block;height:1.1em;overflow:hidden}
.e-rot i{display:block;color:#ff6a26;animation:e-rw 6s cubic-bezier(.7,0,.2,1) infinite}
@keyframes e-rw{0%,25%{transform:translateY(0)}33%,58%{transform:translateY(-100%)}66%,91%{transform:translateY(-200%)}100%{transform:translateY(-300%)}}` },
  { group: "Text", title: "Marker highlight on hover", html: `<p class="e-mark">Good design is <span>as little design</span> as possible.</p>`,
    css: `.e-mark{margin:0;max-width:320px;color:#ecebe8;font:400 30px/1.2 Georgia,serif}
.e-mark span{background:linear-gradient(#ff6a26,#ff6a26) 0 85%/0 .35em no-repeat;transition:background-size .6s cubic-bezier(.7,0,.2,1)}
.e-mark:hover span{background-size:100% .35em}` },
  { group: "Text", title: "Split reveal heading", html: `<h3 class="e-split-h"><span>Quiet</span><span>software</span></h3>`,
    css: `.e-split-h{margin:0;color:#ecebe8;font:400 52px/1 Georgia,serif;cursor:pointer}
.e-split-h span{display:block;overflow:hidden}
.e-split-h span:last-child{font-style:italic;color:#8f8a82;transform:translateX(0);transition:transform .5s cubic-bezier(.7,0,.2,1),color .3s}
.e-split-h:hover span:last-child{transform:translateX(40px);color:#ff6a26}` },
  { group: "Text", title: "Numbered list", html: `<ol class="e-ol"><li>Connect your tools</li><li>Invite your team</li><li>Work in the open</li></ol>`,
    css: `.e-ol{margin:0;padding:0;list-style:none;counter-reset:n;width:280px;color:#ecebe8;${F}}
.e-ol li{counter-increment:n;display:flex;gap:16px;align-items:baseline;padding:14px 0;border-top:1px solid #ffffff26;font-size:16px}
.e-ol li::before{content:counter(n,decimal-leading-zero);font:400 26px Georgia,serif;color:#ff6a26}` },
  { group: "Text", title: "Live clock", html: `<div class="e-clock"><b>00:00</b><small>LISBON · GMT+1</small></div>`,
    css: `.e-clock{color:#ecebe8;text-align:center}
.e-clock b{display:block;font:400 72px/1 Georgia,serif;font-variant-numeric:tabular-nums}
.e-clock small{font:500 11px ui-monospace,monospace;letter-spacing:.08em;color:#8f8a82}`,
    js: `const b = root.querySelector(".e-clock b");
const t = () => { const d = new Date(); b.textContent = String(d.getHours()).padStart(2, "0") + (d.getSeconds() % 2 ? " " : ":") + String(d.getMinutes()).padStart(2, "0"); };
t(); setInterval(t, 1000);` },

  // ── Inputs (6) ──
  { group: "Inputs", title: "Underline input", html: `<label class="e-uin"><input placeholder=" "><span>Your name</span><i></i></label>`,
    css: `.e-uin{position:relative;display:block;width:280px;padding-top:16px}
.e-uin input{width:100%;border:0;border-bottom:1px solid #ffffff40;background:none;padding:8px 0;color:#ecebe8;font:20px Georgia,serif;outline:none}
.e-uin span{position:absolute;left:0;top:24px;color:#8f8a82;${F}font-size:15px;pointer-events:none;transition:all .25s}
.e-uin input:focus+span,.e-uin input:not(:placeholder-shown)+span{top:0;font:500 11px ui-monospace,monospace;letter-spacing:.06em;text-transform:uppercase}
.e-uin i{position:absolute;left:0;bottom:0;height:1px;width:100%;background:#ff6a26;transform:scaleX(0);transition:transform .4s cubic-bezier(.7,0,.2,1)}
.e-uin input:focus~i{transform:scaleX(1)}` },
  { group: "Inputs", title: "Stepper (− / +)", html: `<div class="e-step"><button>−</button><output>1</output><button>+</button></div>`,
    css: `.e-step{display:inline-flex;align-items:center;border:1px solid #ffffff30;border-radius:4px}
.e-step button{width:44px;height:44px;border:0;background:none;color:#ecebe8;font-size:20px;cursor:pointer}
.e-step button:hover{background:#ffffff10}
.e-step output{min-width:48px;text-align:center;color:#ecebe8;font:400 24px Georgia,serif;font-variant-numeric:tabular-nums}`,
    js: `const o = root.querySelector("output"), [m, p] = root.querySelectorAll("button");
m.onclick = () => o.textContent = Math.max(0, +o.textContent - 1); p.onclick = () => o.textContent = +o.textContent + 1;` },
  { group: "Inputs", title: "Tag input", html: `<div class="e-tags"><span>design</span><span>css</span><input placeholder="Add tag…"></div>`,
    css: `.e-tags{display:flex;flex-wrap:wrap;gap:6px;width:300px;padding:8px;border:1px solid #ffffff30;border-radius:4px}
.e-tags span{display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:3px;background:#ecebe8;color:#1a1917;font:500 12px ui-monospace,monospace;cursor:pointer}
.e-tags span::after{content:"×";opacity:.5}
.e-tags input{flex:1;min-width:80px;border:0;background:none;color:#ecebe8;font:14px system-ui,sans-serif;outline:none}`,
    js: `const box = root.querySelector(".e-tags"), inp = box.querySelector("input");
box.addEventListener("click", e => { if (e.target.tagName === "SPAN") e.target.remove(); else inp.focus(); });
inp.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === ",") && inp.value.trim()) { e.preventDefault(); const s = document.createElement("span"); s.textContent = inp.value.trim(); box.insertBefore(s, inp); inp.value = ""; } if (e.key === "Backspace" && !inp.value && inp.previousElementSibling) inp.previousElementSibling.remove(); });` },
  { group: "Inputs", title: "Password strength", html: `<div class="e-pw"><input type="password" placeholder="Password"><i><b></b></i><small>Too short</small></div>`,
    css: `.e-pw{width:280px;display:grid;gap:8px}
.e-pw input{height:42px;padding:0 12px;border:1px solid #ffffff30;border-radius:4px;background:none;color:#ecebe8;font:15px system-ui,sans-serif;outline:none}
.e-pw input:focus{border-color:#ecebe8}
.e-pw i{height:3px;background:#ffffff1a}.e-pw b{display:block;height:100%;width:0;transition:width .3s,background .3s}
.e-pw small{font:500 11px ui-monospace,monospace;color:#8f8a82;text-transform:uppercase;letter-spacing:.05em}`,
    js: `const i = root.querySelector("input"), b = root.querySelector("b"), s = root.querySelector("small");
i.addEventListener("input", () => { const v = i.value; let sc = (v.length >= 8) + /[A-Z]/.test(v) + /\\d/.test(v) + /[^\\w]/.test(v);
  if (!v) sc = -1; const L = [["Too short", "#c4321f"], ["Weak", "#c4321f"], ["Fair", "#c9a96e"], ["Good", "#ecebe8"], ["Strong", "#ff6a26"]][Math.max(0, sc)];
  b.style.width = (Math.max(0, sc) + 1) * 20 + "%"; b.style.background = L[1]; s.textContent = L[0]; });` },
  { group: "Inputs", title: "Segmented radio (pills)", html: `<div class="e-seg"><label><input type="radio" name="e-seg" checked>Day</label><label><input type="radio" name="e-seg">Week</label><label><input type="radio" name="e-seg">Month</label></div>`,
    css: `.e-seg{display:inline-flex;gap:4px}
.e-seg label{padding:8px 14px;border:1px solid #ffffff30;border-radius:999px;color:#8f8a82;font:500 13px system-ui,sans-serif;cursor:pointer;transition:all .2s}
.e-seg input{display:none}
.e-seg label:has(input:checked){background:#ecebe8;color:#1a1917;border-color:#ecebe8}` },
  { group: "Inputs", title: "Color swatch picker", html: `<div class="e-sw"><button style="--c:#ff6a26" class="on"></button><button style="--c:#ecebe8"></button><button style="--c:#8f8a82"></button><button style="--c:#c9a96e"></button><button style="--c:#2f7d4f"></button></div>`,
    css: `.e-sw{display:flex;gap:10px}
.e-sw button{width:30px;height:30px;border-radius:50%;border:0;background:var(--c);cursor:pointer;transition:transform .2s cubic-bezier(.3,1.8,.5,1),box-shadow .2s}
.e-sw button:hover{transform:scale(1.12)}
.e-sw button.on{box-shadow:0 0 0 3px #141413,0 0 0 4px var(--c)}`,
    js: `const bs = root.querySelectorAll(".e-sw button"); bs.forEach(b => b.onclick = () => bs.forEach(x => x.classList.toggle("on", x === b)));` },

  // ── Loaders (4) ──
  { group: "Loaders", title: "Typographic loader", html: `<div class="e-tl">Loading<span>.</span><span>.</span><span>.</span></div>`,
    css: `.e-tl{color:#ecebe8;font:italic 400 40px Georgia,serif}
.e-tl span{color:#ff6a26;animation:e-tl 1.2s infinite}.e-tl span:nth-child(2){animation-delay:.2s}.e-tl span:nth-child(3){animation-delay:.4s}
@keyframes e-tl{0%,60%,100%{opacity:.15}30%{opacity:1}}` },
  { group: "Loaders", title: "Line scanner", html: `<div class="e-scan"></div>`,
    css: `.e-scan{position:relative;width:220px;height:2px;background:#ffffff1a;overflow:hidden}
.e-scan::after{content:"";position:absolute;inset:0;width:30%;background:#ff6a26;animation:e-sc 1.4s cubic-bezier(.7,0,.3,1) infinite}
@keyframes e-sc{from{transform:translateX(-100%)}to{transform:translateX(340%)}}` },
  { group: "Loaders", title: "Grid pulse", html: `<div class="e-grid">${"<i></i>".repeat(9)}</div>`,
    css: `.e-grid{display:grid;grid-template-columns:repeat(3,12px);gap:4px}
.e-grid i{width:12px;height:12px;background:#ecebe8;animation:e-gp 1.2s ease-in-out infinite}
${[0,1,2,3,4,5,6,7,8].map(k => `.e-grid i:nth-child(${k + 1}){animation-delay:${((k % 3) + Math.floor(k / 3)) * .1}s}`).join("")}
@keyframes e-gp{0%,70%,100%{transform:scale(1);opacity:1}35%{transform:scale(.3);opacity:.3;background:#ff6a26}}` },
  { group: "Loaders", title: "Percentage counter", html: `<div class="e-pct"><b>0</b><span>%</span></div>`,
    css: `.e-pct{color:#ecebe8;display:flex;align-items:flex-start}
.e-pct b{font:400 96px/1 Georgia,serif;font-variant-numeric:tabular-nums;min-width:2ch;text-align:right}
.e-pct span{font:500 14px ui-monospace,monospace;color:#ff6a26;margin-top:12px}`,
    js: `const b = root.querySelector("b"); let v = 0; setInterval(() => { v = v >= 100 ? 0 : v + 1; b.textContent = v; }, 40);` },

  // ── Backgrounds (3) ──
  { group: "Backgrounds", title: "Blueprint grid", html: `<div class="e-bp"><span>FIG. 01 — LAYOUT</span></div>`,
    css: `.e-bp{position:relative;width:100%;height:160px;border-radius:6px;background:#1a1917 linear-gradient(#ffffff10 1px,transparent 1px) 0 0/16px 16px,#1a1917 linear-gradient(90deg,#ffffff10 1px,transparent 1px) 0 0/16px 16px;background-color:#1a1917}
.e-bp::before{content:"";position:absolute;inset:0;background:linear-gradient(#ffffff1f 1px,transparent 1px) 0 0/80px 80px,linear-gradient(90deg,#ffffff1f 1px,transparent 1px) 0 0/80px 80px}
.e-bp span{position:absolute;left:12px;bottom:10px;font:500 10px ui-monospace,monospace;letter-spacing:.08em;color:#8f8a82}` },
  { group: "Backgrounds", title: "Halftone fade", html: `<div class="e-ht"></div>`,
    css: `.e-ht{width:100%;height:160px;border-radius:6px;background:radial-gradient(#ff6a26 1.4px,transparent 1.6px) 0 0/10px 10px;-webkit-mask:linear-gradient(90deg,#000,transparent);mask:linear-gradient(90deg,#000,transparent)}` },
  { group: "Backgrounds", title: "Paper texture", html: `<div class="e-paper"><h4>Field notes</h4></div>`,
    css: `.e-paper{position:relative;display:grid;place-items:center;width:100%;height:160px;border-radius:6px;background:#ecebe8;overflow:hidden}
.e-paper::after{content:"";position:absolute;inset:0;opacity:.35;mix-blend-mode:multiply;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.7' numOctaves='4'/%3E%3CfeColorMatrix values='0 0 0 0 .4 0 0 0 0 .35 0 0 0 0 .3 0 0 0 .5 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}
.e-paper h4{position:relative;margin:0;color:#1a1917;font:italic 400 44px Georgia,serif}` },

  // ── Navigation (4) ──
  { group: "Navigation", title: "Pagination", html: `<nav class="e-pg"><button>←</button><button>1</button><button class="on">2</button><button>3</button><span>…</span><button>12</button><button>→</button></nav>`,
    css: `.e-pg{display:flex;gap:4px;align-items:center;color:#8f8a82}
.e-pg button{min-width:36px;height:36px;border:1px solid transparent;border-radius:4px;background:none;color:#ecebe8;font:500 13px ui-monospace,monospace;cursor:pointer}
.e-pg button:hover{border-color:#ffffff30}.e-pg button.on{background:#ecebe8;color:#1a1917}`,
    js: `const bs = [...root.querySelectorAll(".e-pg button")].filter(b => /\\d/.test(b.textContent));
bs.forEach(b => b.onclick = () => bs.forEach(x => x.classList.toggle("on", x === b)));` },
  { group: "Navigation", title: "Vertical side nav", html: `<nav class="e-vn"><a class="on">Overview</a><a>Issues <span>12</span></a><a>Docs</a><a>Releases</a><a>Settings</a></nav>`,
    css: `.e-vn{display:grid;width:200px;${F}font-size:14px}
.e-vn a{display:flex;justify-content:space-between;padding:8px 12px;color:#8f8a82;cursor:pointer;border-left:1px solid #ffffff1f;transition:color .2s,border-color .2s}
.e-vn a:hover{color:#ecebe8}.e-vn a.on{color:#ecebe8;border-left:2px solid #ff6a26;padding-left:11px}
.e-vn span{font:500 11px ui-monospace,monospace}`,
    js: `const as = root.querySelectorAll(".e-vn a"); as.forEach(a => a.onclick = () => as.forEach(x => x.classList.toggle("on", x === a)));` },
  { group: "Navigation", title: "Floating pill nav", html: `<nav class="e-pn"><a class="on">Work</a><a>About</a><a>Journal</a><a>Contact</a></nav>`,
    css: `.e-pn{display:flex;gap:2px;padding:4px;border-radius:999px;background:#ecebe8;box-shadow:0 10px 30px #0006}
.e-pn a{padding:8px 16px;border-radius:999px;color:#5f5b54;${F}font-size:14px;font-weight:500;cursor:pointer;transition:all .25s}
.e-pn a.on{background:#1a1917;color:#ecebe8}`,
    js: `const as = root.querySelectorAll(".e-pn a"); as.forEach(a => a.onclick = () => as.forEach(x => x.classList.toggle("on", x === a)));` },
  { group: "Navigation", title: "Scroll progress bar", html: `<div class="e-sp"><i></i><div><p>Scroll this box ↓</p>${"<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>".repeat(8)}</div></div>`,
    css: `.e-sp{position:relative;width:300px;height:160px;border:1px solid #ffffff26;border-radius:6px;overflow:hidden}
.e-sp i{position:absolute;top:0;left:0;height:2px;width:100%;background:#ff6a26;transform-origin:left;transform:scaleX(0);z-index:1}
.e-sp div{height:100%;overflow:auto;padding:4px 16px;color:#a19d95;${F}font-size:14px}`,
    js: `const d = root.querySelector(".e-sp div"), i = root.querySelector(".e-sp i");
d.addEventListener("scroll", () => i.style.transform = "scaleX(" + d.scrollTop / (d.scrollHeight - d.clientHeight) + ")");` },

  // ── Data (4) ──
  { group: "Data", title: "Bar chart (CSS)", html: `<div class="e-bars">${[42,68,55,90,74,61,83].map((v, i) => `<i style="--v:${v}%" data-l="${"MTWTFSS"[i]}"></i>`).join("")}</div>`,
    css: `.e-bars{display:flex;align-items:flex-end;gap:10px;height:140px;padding-bottom:18px;border-bottom:1px solid #ffffff26}
.e-bars i{position:relative;width:22px;height:var(--v);background:#ecebe8;transform-origin:bottom;animation:e-gr .8s cubic-bezier(.2,.9,.3,1.1) both}
.e-bars i:nth-child(4){background:#ff6a26}
.e-bars i::after{content:attr(data-l);position:absolute;bottom:-18px;left:0;right:0;text-align:center;font:500 10px ui-monospace,monospace;color:#8f8a82}
${[1,2,3,4,5,6,7].map(k => `.e-bars i:nth-child(${k}){animation-delay:${k * 60}ms}`).join("")}
@keyframes e-gr{from{transform:scaleY(0)}}` },
  { group: "Data", title: "Donut chart (conic)", html: `<div class="e-donut"><b>72%</b></div>`,
    css: `.e-donut{display:grid;place-items:center;width:140px;height:140px;border-radius:50%;background:conic-gradient(#ff6a26 0 72%,#ffffff1a 0);-webkit-mask:radial-gradient(farthest-side,transparent 62%,#000 63%);mask:radial-gradient(farthest-side,transparent 62%,#000 63%)}
.e-donut{position:relative}.e-donut b{position:absolute;color:#ecebe8;font:400 32px Georgia,serif}` },
  { group: "Data", title: "Sparkline row", html: `<div class="e-spark"><span>AAPL</span><svg viewBox="0 0 100 30"><path d="M0 22 L12 18 L24 20 L36 12 L48 15 L60 8 L72 11 L84 4 L100 6"/></svg><b>+2.4%</b></div>`,
    css: `.e-spark{display:grid;grid-template-columns:60px 1fr auto;align-items:center;gap:14px;width:300px;padding:12px 0;border-top:1px solid #ffffff26;border-bottom:1px solid #ffffff26;color:#ecebe8}
.e-spark span{font:500 13px ui-monospace,monospace}.e-spark b{font:500 13px ui-monospace,monospace;color:#7fc49a}
.e-spark svg{height:30px;width:100%;overflow:visible}
.e-spark path{fill:none;stroke:#ecebe8;stroke-width:1.5;stroke-dasharray:200;stroke-dashoffset:200;animation:e-draw 1.5s ease forwards}
@keyframes e-draw{to{stroke-dashoffset:0}}` },
  { group: "Data", title: "Contribution heatmap", html: `<div class="e-heat"></div>`,
    css: `.e-heat{display:grid;grid-template-rows:repeat(7,10px);grid-auto-flow:column;grid-auto-columns:10px;gap:3px}
.e-heat i{border-radius:2px;background:#ffffff12}
.e-heat i[data-l="1"]{background:#ff6a2640}.e-heat i[data-l="2"]{background:#ff6a2680}.e-heat i[data-l="3"]{background:#ff6a26c0}.e-heat i[data-l="4"]{background:#ff6a26}`,
    js: `const h = root.querySelector(".e-heat"); let s = 7;
for (let k = 0; k < 7 * 22; k++) { s = (s * 9301 + 49297) % 233280; const i = document.createElement("i"); i.dataset.l = Math.floor((s / 233280) ** 1.6 * 5); i.title = i.dataset.l + " contributions"; h.appendChild(i); }` },

  // ── Feedback (2) ──
  { group: "Feedback", title: "Inline confirm", html: `<div class="e-ic"><button class="a">Remove item</button><span><button class="n">Cancel</button><button class="y">Yes, remove</button></span></div>`,
    css: `.e-ic{${F}}.e-ic span{display:none;gap:6px}.e-ic.ask .a{display:none}.e-ic.ask span{display:inline-flex}
.e-ic button{padding:10px 16px;border-radius:4px;border:1px solid #ffffff30;background:none;color:#ecebe8;font-weight:500;cursor:pointer}
.e-ic .y{background:#c4321f;border-color:#c4321f}`,
    js: `const w = root.querySelector(".e-ic");
w.querySelector(".a").onclick = () => w.classList.add("ask"); w.querySelector(".n").onclick = () => w.classList.remove("ask");
w.querySelector(".y").onclick = () => { w.classList.remove("ask"); w.querySelector(".a").textContent = "Removed"; };` },
  { group: "Feedback", title: "Banner with dismiss", html: `<div class="e-ban"><b>New</b><span>Release 4.0 is out — faster builds and a new editor.</span><button aria-label="Dismiss">×</button></div>`,
    css: `.e-ban{display:flex;align-items:center;gap:12px;width:100%;max-width:440px;padding:12px 14px;border-radius:6px;background:#ecebe8;color:#1a1917;${F}font-size:14px;transition:opacity .3s,transform .3s}
.e-ban b{padding:2px 7px;border-radius:3px;background:#ff4f00;color:#fff;font:500 11px ui-monospace,monospace;text-transform:uppercase}
.e-ban span{flex:1}.e-ban button{border:0;background:none;font-size:20px;cursor:pointer;color:#5f5b54}
.e-ban.gone{opacity:0;transform:translateY(-8px)}`,
    js: `const b = root.querySelector(".e-ban"); b.querySelector("button").onclick = () => { b.classList.add("gone"); setTimeout(() => b.classList.remove("gone"), 1800); };` }
);
