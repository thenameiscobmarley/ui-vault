// UI Vault — live, copy-ready snippets. Each demo is self-contained HTML + CSS (+ optional JS).
// `js` runs with `root` bound to the demo's container element.

window.DEMO_GROUPS = ["Tabs", "Buttons", "Cards", "Text", "Inputs", "Loaders", "Backgrounds", "Feedback"];

window.DEMOS = [
  // ── Tabs ──────────────────────────────────────────────────────
  {
    group: "Tabs", title: "Sliding pill tabs",
    html: `<div class="vt-pill" role="tablist">
  <span class="vt-pill__ind"></span>
  <button role="tab" aria-selected="true">Overview</button>
  <button role="tab">Analytics</button>
  <button role="tab">Reports</button>
</div>`,
    css: `.vt-pill{position:relative;display:inline-flex;gap:4px;padding:4px;border-radius:999px;background:#16161f;border:1px solid #ffffff14}
.vt-pill button{position:relative;z-index:1;border:0;background:none;color:#9a9ab0;font:600 14px/1 system-ui,sans-serif;padding:10px 18px;border-radius:999px;cursor:pointer;transition:color .25s}
.vt-pill button[aria-selected=true]{color:#fff}
.vt-pill__ind{position:absolute;top:4px;bottom:4px;left:0;width:0;border-radius:999px;background:linear-gradient(135deg,#ff6a26,#d9d6cf);box-shadow:0 4px 18px #7c5cff66;transition:transform .45s cubic-bezier(.65,0,.25,1.3),width .45s cubic-bezier(.65,0,.25,1.3)}`,
    js: `const ind = root.querySelector(".vt-pill__ind");
const tabs = [...root.querySelectorAll("[role=tab]")];
const move = t => { ind.style.width = t.offsetWidth + "px"; ind.style.transform = "translateX(" + t.offsetLeft + "px)"; };
tabs.forEach(t => t.addEventListener("click", () => {
  tabs.forEach(x => x.setAttribute("aria-selected", x === t));
  move(t);
}));
requestAnimationFrame(() => move(tabs[0]));`,
  },
  {
    group: "Tabs", title: "Glowing underline tabs",
    html: `<div class="vt-line" role="tablist">
  <button role="tab" aria-selected="true">Profile</button>
  <button role="tab">Security</button>
  <button role="tab">Billing</button>
  <button role="tab">Team</button>
  <span class="vt-line__bar"></span>
</div>`,
    css: `.vt-line{position:relative;display:flex;gap:28px;border-bottom:1px solid #ffffff1a}
.vt-line button{border:0;background:none;color:#8a8aa0;font:500 15px/1 system-ui,sans-serif;padding:14px 2px;cursor:pointer;transition:color .2s}
.vt-line button:hover{color:#d6d6e6}
.vt-line button[aria-selected=true]{color:#fff}
.vt-line__bar{position:absolute;bottom:-1px;left:0;height:2px;width:0;background:#d9d6cf;box-shadow:0 0 12px 1px #d9d6cf,0 0 2px #d9d6cf;border-radius:2px;transition:all .35s cubic-bezier(.3,.7,.2,1)}`,
    js: `const bar = root.querySelector(".vt-line__bar");
const tabs = [...root.querySelectorAll("[role=tab]")];
const move = t => { bar.style.width = t.offsetWidth + "px"; bar.style.left = t.offsetLeft + "px"; };
tabs.forEach(t => t.addEventListener("click", () => { tabs.forEach(x => x.setAttribute("aria-selected", x === t)); move(t); }));
requestAnimationFrame(() => move(tabs[0]));`,
  },
  {
    group: "Tabs", title: "Segmented control (pure CSS)",
    html: `<div class="vt-seg">
  <input type="radio" name="vt-seg" id="vs1" checked><label for="vs1">Day</label>
  <input type="radio" name="vt-seg" id="vs2"><label for="vs2">Week</label>
  <input type="radio" name="vt-seg" id="vs3"><label for="vs3">Month</label>
  <span></span>
</div>`,
    css: `.vt-seg{position:relative;display:grid;grid-template-columns:repeat(3,1fr);width:300px;padding:3px;border-radius:12px;background:#ffffff0d;border:1px solid #ffffff12}
.vt-seg input{position:absolute;opacity:0;pointer-events:none}
.vt-seg label{position:relative;z-index:1;text-align:center;padding:9px 0;font:600 13px/1 system-ui,sans-serif;color:#a0a0b8;cursor:pointer;transition:color .2s}
.vt-seg input:checked+label{color:#111}
.vt-seg span{position:absolute;top:3px;bottom:3px;left:3px;width:calc((100% - 6px)/3);border-radius:9px;background:#fff;box-shadow:0 2px 8px #0006;transition:transform .35s cubic-bezier(.4,0,.2,1)}
.vt-seg:has(#vs2:checked) span{transform:translateX(100%)}
.vt-seg:has(#vs3:checked) span{transform:translateX(200%)}`,
  },

  // ── Buttons ───────────────────────────────────────────────────
  {
    group: "Buttons", title: "Shine sweep",
    html: `<button class="vb-shine">Get started →</button>`,
    css: `.vb-shine{position:relative;overflow:hidden;border:0;border-radius:12px;padding:14px 28px;font:600 15px/1 system-ui,sans-serif;color:#fff;background:linear-gradient(180deg,#ff6a26,#ff6a26);box-shadow:inset 0 1px 0 #ffffff40,0 8px 24px -6px #6d5dfcaa;cursor:pointer;transition:transform .15s}
.vb-shine::after{content:"";position:absolute;inset:0;background:linear-gradient(110deg,transparent 30%,#ffffff70 50%,transparent 70%);transform:translateX(-120%);transition:transform .7s}
.vb-shine:hover::after{transform:translateX(120%)}
.vb-shine:active{transform:scale(.97)}`,
  },
  {
    group: "Buttons", title: "Spinning gradient border",
    html: `<button class="vb-border"><span>Upgrade to Pro</span></button>`,
    css: `@property --vb-a{syntax:"<angle>";initial-value:0deg;inherits:false}
.vb-border{position:relative;border:0;padding:2px;border-radius:14px;cursor:pointer;background:conic-gradient(from var(--vb-a),#c9a96e,#c9a96e,#d9d6cf,#d9d6cf,#ff6a26,#c9a96e);animation:vb-spin 3s linear infinite}
.vb-border span{display:block;padding:13px 26px;border-radius:12px;background:#0d0d14;color:#fff;font:600 15px/1 system-ui,sans-serif}
.vb-border:hover{filter:drop-shadow(0 0 12px #b84dff88)}
@keyframes vb-spin{to{--vb-a:360deg}}`,
  },
  {
    group: "Buttons", title: "Neon glow",
    html: `<button class="vb-glow">Launch</button>`,
    css: `.vb-glow{border:1.5px solid #d9d6cf;border-radius:10px;padding:13px 30px;background:#22d3ee10;color:#d9d6cf;font:600 15px/1 system-ui,sans-serif;letter-spacing:.08em;text-transform:uppercase;cursor:pointer;text-shadow:0 0 8px #d9d6cf;box-shadow:0 0 12px #22d3ee55,inset 0 0 12px #22d3ee33;transition:all .25s}
.vb-glow:hover{background:#d9d6cf;color:#04141a;text-shadow:none;box-shadow:0 0 30px #d9d6cf,0 0 60px #22d3ee66}`,
  },
  {
    group: "Buttons", title: "Tactile 3D press",
    html: `<button class="vb-press">Press me</button>`,
    css: `.vb-press{border:0;border-radius:14px;padding:14px 30px;background:#c9a96e;color:#fff;font:700 15px/1 system-ui,sans-serif;cursor:pointer;box-shadow:0 6px 0 #8a2b00,0 10px 20px #0007;transform:translateY(0);transition:transform .08s,box-shadow .08s}
.vb-press:hover{filter:brightness(1.06)}
.vb-press:active{transform:translateY(5px);box-shadow:0 1px 0 #8a2b00,0 3px 8px #0007}`,
  },
  {
    group: "Buttons", title: "Magnetic hover",
    html: `<button class="vb-mag"><span>Hover near me</span></button>`,
    css: `.vb-mag{border:1px solid #ffffff26;border-radius:999px;padding:16px 30px;background:#ffffff0a;color:#fff;font:600 15px/1 system-ui,sans-serif;cursor:pointer;transition:transform .3s cubic-bezier(.2,.8,.2,1),background .2s}
.vb-mag span{display:inline-block;transition:transform .3s cubic-bezier(.2,.8,.2,1)}
.vb-mag:hover{background:#ffffff18}`,
    js: `const b = root.querySelector(".vb-mag"), s = b.firstElementChild;
b.addEventListener("pointermove", e => {
  const r = b.getBoundingClientRect(), x = e.clientX - r.left - r.width / 2, y = e.clientY - r.top - r.height / 2;
  b.style.transform = "translate(" + x * .3 + "px," + y * .4 + "px)";
  s.style.transform = "translate(" + x * .15 + "px," + y * .2 + "px)";
});
b.addEventListener("pointerleave", () => { b.style.transform = s.style.transform = ""; });`,
  },
  {
    group: "Buttons", title: "Material ripple",
    html: `<button class="vb-ripple">Click anywhere</button>`,
    css: `.vb-ripple{position:relative;overflow:hidden;border:0;border-radius:10px;padding:14px 28px;background:#10b981;color:#fff;font:600 15px/1 system-ui,sans-serif;cursor:pointer}
.vb-ripple i{position:absolute;border-radius:50%;background:#fff6;transform:scale(0);animation:vb-rip .6s ease-out forwards;pointer-events:none}
@keyframes vb-rip{to{transform:scale(4);opacity:0}}`,
    js: `root.querySelector(".vb-ripple").addEventListener("pointerdown", e => {
  const b = e.currentTarget, r = b.getBoundingClientRect(), d = Math.max(r.width, r.height), i = document.createElement("i");
  i.style.cssText = "width:" + d + "px;height:" + d + "px;left:" + (e.clientX - r.left - d / 2) + "px;top:" + (e.clientY - r.top - d / 2) + "px";
  b.appendChild(i); setTimeout(() => i.remove(), 600);
});`,
  },

  // ── Cards ─────────────────────────────────────────────────────
  {
    group: "Cards", title: "Spotlight card",
    html: `<div class="vc-spot">
  <h4>Edge network</h4>
  <p>Move your cursor over this card — a soft light follows it.</p>
</div>`,
    css: `.vc-spot{--x:50%;--y:50%;position:relative;width:280px;padding:24px;border-radius:16px;background:#12121a;border:1px solid #ffffff14;color:#e7e7f0;font:14px/1.5 system-ui,sans-serif;overflow:hidden}
.vc-spot::before{content:"";position:absolute;inset:0;background:radial-gradient(240px circle at var(--x) var(--y),#8b5cf633,transparent 60%);opacity:0;transition:opacity .3s}
.vc-spot:hover::before{opacity:1}
.vc-spot h4{margin:0 0 6px;font-size:17px}
.vc-spot p{margin:0;color:#9b9bb0}`,
    js: `const c = root.querySelector(".vc-spot");
c.addEventListener("pointermove", e => { const r = c.getBoundingClientRect(); c.style.setProperty("--x", e.clientX - r.left + "px"); c.style.setProperty("--y", e.clientY - r.top + "px"); });`,
  },
  {
    group: "Cards", title: "Frosted glass",
    html: `<div class="vc-glass-wrap"><div class="vc-glass">
  <small>Balance</small><strong>$12,480.20</strong><span>+4.2% this week</span>
</div></div>`,
    css: `.vc-glass-wrap{position:relative;padding:28px 34px;border-radius:20px;background:radial-gradient(circle at 20% 30%,#c9a96e,transparent 45%),radial-gradient(circle at 80% 70%,#8f8a82,transparent 45%),#1a1917}
.vc-glass{display:grid;gap:4px;width:220px;padding:20px 22px;border-radius:16px;background:#ffffff1a;border:1px solid #ffffff33;backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);box-shadow:0 8px 32px #0004,inset 0 1px 0 #ffffff40;color:#fff;font-family:system-ui,sans-serif}
.vc-glass small{opacity:.7;font-size:12px}
.vc-glass strong{font-size:26px;letter-spacing:-.02em}
.vc-glass span{font-size:12px;color:#7dffb3}`,
  },
  {
    group: "Cards", title: "3D tilt + glare",
    html: `<div class="vc-tilt"><div class="vc-tilt__glare"></div><b>RARE</b><h4>Neon Drift</h4></div>`,
    css: `.vc-tilt{position:relative;width:200px;height:260px;border-radius:18px;padding:18px;box-sizing:border-box;display:flex;flex-direction:column;justify-content:flex-end;color:#fff;font-family:system-ui,sans-serif;background:linear-gradient(160deg,#ff4f00,#c9a96e 50%,#ff6a26);box-shadow:0 20px 40px -10px #e52e7188;transform:perspective(700px) rotateX(var(--rx,0)) rotateY(var(--ry,0));transition:transform .15s ease-out;overflow:hidden}
.vc-tilt b{position:absolute;top:16px;left:18px;font-size:11px;letter-spacing:.2em;background:#0004;padding:4px 8px;border-radius:6px}
.vc-tilt h4{margin:0;font-size:22px}
.vc-tilt__glare{position:absolute;inset:0;background:radial-gradient(circle at var(--gx,50%) var(--gy,50%),#ffffff55,transparent 50%);mix-blend-mode:overlay;pointer-events:none}`,
    js: `const c = root.querySelector(".vc-tilt");
c.addEventListener("pointermove", e => {
  const r = c.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
  c.style.setProperty("--ry", (px - .5) * 24 + "deg"); c.style.setProperty("--rx", (.5 - py) * 24 + "deg");
  c.style.setProperty("--gx", px * 100 + "%"); c.style.setProperty("--gy", py * 100 + "%");
});
c.addEventListener("pointerleave", () => { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); });`,
  },

  // ── Text ──────────────────────────────────────────────────────
  {
    group: "Text", title: "Shimmer text",
    html: `<h3 class="vx-shimmer">Ship something beautiful</h3>`,
    css: `.vx-shimmer{margin:0;font:800 30px/1.1 system-ui,sans-serif;letter-spacing:-.03em;background:linear-gradient(100deg,#6b6b80 40%,#fff 50%,#6b6b80 60%) 0 0/250% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vx-sh 3s linear infinite}
@keyframes vx-sh{from{background-position:100% 0}to{background-position:-150% 0}}`,
  },
  {
    group: "Text", title: "Aurora gradient text",
    html: `<h3 class="vx-aurora">Aurora</h3>`,
    css: `.vx-aurora{margin:0;font:900 56px/1 system-ui,sans-serif;letter-spacing:-.04em;background:linear-gradient(90deg,#c9a96e,#c9a96e,#d9d6cf,#d9d6cf,#ff6a26,#c9a96e) 0 0/300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:vx-au 6s ease-in-out infinite alternate;filter:drop-shadow(0 4px 20px #b84dff55)}
@keyframes vx-au{to{background-position:100% 0}}`,
  },
  {
    group: "Text", title: "Typewriter",
    html: `<p class="vx-type">npm install delight</p>`,
    css: `.vx-type{margin:0;font:500 20px/1.2 ui-monospace,monospace;color:#d9d6cf;width:19ch;white-space:nowrap;overflow:hidden;border-right:2px solid #d9d6cf;animation:vx-ty 2.4s steps(19) infinite alternate,vx-caret .7s step-end infinite}
@keyframes vx-ty{from{width:0}}
@keyframes vx-caret{50%{border-color:transparent}}`,
  },
  {
    group: "Text", title: "Glitch",
    html: `<h3 class="vx-glitch" data-text="SYSTEM ERROR">SYSTEM ERROR</h3>`,
    css: `.vx-glitch{position:relative;margin:0;font:900 36px/1 system-ui,sans-serif;color:#fff;letter-spacing:.04em}
.vx-glitch::before,.vx-glitch::after{content:attr(data-text);position:absolute;inset:0}
.vx-glitch::before{color:#ff6a26;animation:vx-g1 2s infinite steps(2);clip-path:inset(0 0 60% 0)}
.vx-glitch::after{color:#d9d6cf;animation:vx-g2 1.7s infinite steps(2);clip-path:inset(55% 0 0 0)}
@keyframes vx-g1{0%,90%{transform:none}92%{transform:translate(-4px,-2px)}96%{transform:translate(3px,1px)}}
@keyframes vx-g2{0%,88%{transform:none}91%{transform:translate(4px,2px)}95%{transform:translate(-3px,-1px)}}`,
  },

  // ── Inputs ────────────────────────────────────────────────────
  {
    group: "Inputs", title: "Floating label input",
    html: `<label class="vi-float"><input placeholder=" " /><span>Email address</span></label>`,
    css: `.vi-float{position:relative;display:block;width:280px}
.vi-float input{width:100%;box-sizing:border-box;padding:22px 14px 8px;border-radius:12px;border:1px solid #ffffff26;background:#ffffff08;color:#fff;font:15px system-ui,sans-serif;outline:none;transition:border-color .2s,box-shadow .2s}
.vi-float input:focus{border-color:#ff6a26;box-shadow:0 0 0 4px #818cf833}
.vi-float span{position:absolute;left:14px;top:15px;color:#8b8ba3;font:15px system-ui,sans-serif;pointer-events:none;transform-origin:left;transition:transform .2s,color .2s}
.vi-float input:focus+span,.vi-float input:not(:placeholder-shown)+span{transform:translateY(-9px) scale(.75);color:#ff6a26}`,
  },
  {
    group: "Inputs", title: "Smooth switch",
    html: `<label class="vi-switch"><input type="checkbox" checked><i></i> Dark mode</label>`,
    css: `.vi-switch{display:inline-flex;align-items:center;gap:12px;color:#e5e5f0;font:500 15px system-ui,sans-serif;cursor:pointer}
.vi-switch input{position:absolute;opacity:0}
.vi-switch i{position:relative;width:48px;height:28px;border-radius:999px;background:#3a3a4a;transition:background .25s}
.vi-switch i::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:50%;background:#fff;box-shadow:0 2px 6px #0005;transition:transform .3s cubic-bezier(.3,1.4,.6,1)}
.vi-switch input:checked+i{background:#22c55e}
.vi-switch input:checked+i::after{transform:translateX(20px)}
.vi-switch input:focus-visible+i{outline:2px solid #22c55e;outline-offset:3px}`,
  },
  {
    group: "Inputs", title: "Gradient range slider",
    html: `<input class="vi-range" type="range" min="0" max="100" value="62">`,
    css: `.vi-range{--v:62%;-webkit-appearance:none;appearance:none;width:260px;height:8px;border-radius:999px;background:linear-gradient(90deg,#c9a96e,#ff6a26 var(--v),#2a2a38 var(--v));outline:none;cursor:pointer}
.vi-range::-webkit-slider-thumb{-webkit-appearance:none;width:22px;height:22px;border-radius:50%;background:#fff;border:0;box-shadow:0 0 0 5px #a78bfa44,0 2px 8px #0006}
.vi-range::-moz-range-thumb{width:22px;height:22px;border-radius:50%;background:#fff;border:0;box-shadow:0 0 0 5px #a78bfa44,0 2px 8px #0006}`,
    js: `const r = root.querySelector(".vi-range");
r.addEventListener("input", () => r.style.setProperty("--v", r.value + "%"));`,
  },

  // ── Loaders ───────────────────────────────────────────────────
  {
    group: "Loaders", title: "Orbit",
    html: `<div class="vl-orbit"><i></i><i></i><i></i></div>`,
    css: `.vl-orbit{position:relative;width:56px;height:56px;animation:vl-o 1.4s linear infinite}
.vl-orbit i{position:absolute;width:14px;height:14px;border-radius:50%;background:#d9d6cf;box-shadow:0 0 12px #d9d6cf}
.vl-orbit i:nth-child(1){top:0;left:21px}
.vl-orbit i:nth-child(2){bottom:2px;left:3px;background:#c9a96e;box-shadow:0 0 12px #c9a96e}
.vl-orbit i:nth-child(3){bottom:2px;right:3px;background:#34d399;box-shadow:0 0 12px #34d399}
@keyframes vl-o{to{transform:rotate(360deg)}}`,
  },
  {
    group: "Loaders", title: "Equalizer bars",
    html: `<div class="vl-bars"><i></i><i></i><i></i><i></i><i></i></div>`,
    css: `.vl-bars{display:flex;align-items:flex-end;gap:5px;height:44px}
.vl-bars i{width:7px;height:100%;border-radius:4px;background:linear-gradient(#fbbf24,#f97316);transform-origin:bottom;animation:vl-b 1s ease-in-out infinite}
.vl-bars i:nth-child(2){animation-delay:-.8s}.vl-bars i:nth-child(3){animation-delay:-.6s}
.vl-bars i:nth-child(4){animation-delay:-.4s}.vl-bars i:nth-child(5){animation-delay:-.2s}
@keyframes vl-b{0%,100%{transform:scaleY(.25)}50%{transform:scaleY(1)}}`,
  },
  {
    group: "Loaders", title: "Skeleton shimmer",
    html: `<div class="vl-skel"><i class="a"></i><div><i></i><i class="s"></i></div></div>`,
    css: `.vl-skel{display:flex;gap:14px;align-items:center;width:280px}
.vl-skel div{flex:1;display:grid;gap:8px}
.vl-skel i{display:block;height:12px;border-radius:6px;background:linear-gradient(90deg,#22222e 25%,#33334a 50%,#22222e 75%) 0 0/200% 100%;animation:vl-s 1.4s ease infinite}
.vl-skel i.a{width:48px;height:48px;border-radius:50%;flex:none}
.vl-skel i.s{width:60%}
@keyframes vl-s{to{background-position:-200% 0}}`,
  },

  // ── Backgrounds ───────────────────────────────────────────────
  {
    group: "Backgrounds", title: "Mesh gradient",
    html: `<div class="vg-mesh"></div>`,
    css: `.vg-mesh{width:100%;height:150px;border-radius:14px;background:radial-gradient(at 10% 20%,#c9a96e 0,transparent 50%),radial-gradient(at 80% 0%,#ff6a26 0,transparent 50%),radial-gradient(at 0% 100%,#ff6a26 0,transparent 50%),radial-gradient(at 90% 90%,#d9d6cf 0,transparent 50%),#1a1917}`,
  },
  {
    group: "Backgrounds", title: "Dot grid with fade",
    html: `<div class="vg-dots"><span>Your hero here</span></div>`,
    css: `.vg-dots{display:grid;place-items:center;width:100%;height:150px;border-radius:14px;background:#0a0a10 radial-gradient(#ffffff38 1px,transparent 1px) 0 0/18px 18px;color:#fff;font:700 20px system-ui,sans-serif;-webkit-mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%);mask-image:radial-gradient(ellipse at center,#000 30%,transparent 75%)}`,
  },
  {
    group: "Backgrounds", title: "Film grain overlay",
    html: `<div class="vg-grain">Grain adds texture + kills banding</div>`,
    css: `.vg-grain{position:relative;display:grid;place-items:center;width:100%;height:150px;border-radius:14px;overflow:hidden;background:linear-gradient(135deg,#3a352e,#1a1917);color:#fff;font:600 16px system-ui,sans-serif}
.vg-grain::after{content:"";position:absolute;inset:0;opacity:.35;mix-blend-mode:overlay;pointer-events:none;background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")}`,
  },
  {
    group: "Backgrounds", title: "Infinite logo marquee",
    html: `<div class="vg-marquee"><div>
  <span>◆ Nova</span><span>● Orbit</span><span>▲ Peak</span><span>■ Block</span><span>✦ Spark</span>
  <span>◆ Nova</span><span>● Orbit</span><span>▲ Peak</span><span>■ Block</span><span>✦ Spark</span>
</div></div>`,
    css: `.vg-marquee{width:100%;overflow:hidden;-webkit-mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent);mask-image:linear-gradient(90deg,transparent,#000 15%,#000 85%,transparent)}
.vg-marquee div{display:flex;gap:48px;width:max-content;animation:vg-m 14s linear infinite}
.vg-marquee span{color:#8d8da5;font:700 20px system-ui,sans-serif;white-space:nowrap}
.vg-marquee:hover div{animation-play-state:paused}
@keyframes vg-m{to{transform:translateX(calc(-50% - 24px))}}`,
  },

  // ── Feedback ──────────────────────────────────────────────────
  {
    group: "Feedback", title: "Live status badge",
    html: `<span class="vm-badge"><i></i>All systems operational</span>`,
    css: `.vm-badge{display:inline-flex;align-items:center;gap:10px;padding:8px 14px 8px 12px;border-radius:999px;background:#22c55e14;border:1px solid #22c55e40;color:#86efac;font:500 13px system-ui,sans-serif}
.vm-badge i{position:relative;width:8px;height:8px;border-radius:50%;background:#22c55e}
.vm-badge i::after{content:"";position:absolute;inset:0;border-radius:50%;background:#22c55e;animation:vm-p 1.6s ease-out infinite}
@keyframes vm-p{to{transform:scale(3);opacity:0}}`,
  },
  {
    group: "Feedback", title: "Stacking toast",
    html: `<div class="vm-toast"><button>Show toast</button><ol class="vm-toast__list"></ol></div>`,
    css: `.vm-toast button{border:1px solid #ffffff26;border-radius:10px;padding:11px 20px;background:#ffffff0d;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer}
.vm-toast__list{position:fixed;right:20px;bottom:20px;z-index:99;display:grid;gap:8px;margin:0;padding:0;list-style:none}
.vm-toast__list li{display:flex;gap:10px;align-items:center;min-width:260px;padding:14px 16px;border-radius:12px;background:#1b1b26;border:1px solid #ffffff1a;box-shadow:0 10px 30px #0008;color:#eee;font:14px system-ui,sans-serif;animation:vm-in .35s cubic-bezier(.2,1.2,.4,1)}
.vm-toast__list li::before{content:"✓";display:grid;place-items:center;width:22px;height:22px;border-radius:50%;background:#22c55e;color:#04120a;font-weight:800;font-size:12px}
.vm-toast__list li.out{animation:vm-out .3s forwards}
@keyframes vm-in{from{transform:translateY(20px) scale(.95);opacity:0}}
@keyframes vm-out{to{transform:translateX(30px);opacity:0}}`,
    js: `document.querySelectorAll("body > .vm-toast__list").forEach(l => l.remove());
const list = root.querySelector(".vm-toast__list"); let n = 0;
document.body.appendChild(list); // escape transformed parents so position:fixed works
root.querySelector("button").addEventListener("click", () => {
  const li = document.createElement("li"); li.textContent = "Changes saved (#" + ++n + ")";
  list.appendChild(li);
  setTimeout(() => { li.classList.add("out"); setTimeout(() => li.remove(), 300); }, 2600);
});`,
  },
];
