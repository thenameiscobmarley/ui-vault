// UI Vault — snippet pack 2 (30 more). Same format as demos.js; appended to window.DEMOS.
window.DEMO_GROUPS.splice(window.DEMO_GROUPS.indexOf("Feedback"), 0, "Navigation");
window.DEMOS.push(
  // ── Buttons ──
  { group: "Buttons", title: "Slide-fill hover",
    html: `<button class="d-fill"><span>Explore</span></button>`,
    css: `.d-fill{position:relative;overflow:hidden;border:1.5px solid #ff6a26;border-radius:12px;padding:13px 30px;background:none;color:#ff6a26;font:600 15px system-ui,sans-serif;cursor:pointer;transition:color .35s}
.d-fill::before{content:"";position:absolute;inset:0;background:linear-gradient(120deg,#ff6a26,#d9d6cf);transform:scaleX(0);transform-origin:right;transition:transform .45s cubic-bezier(.7,0,.2,1)}
.d-fill:hover{color:#fff}.d-fill:hover::before{transform:scaleX(1);transform-origin:left}
.d-fill span{position:relative}` },
  { group: "Buttons", title: "Arrow slide CTA",
    html: `<a class="d-arrow" href="#">Start building <i>→</i></a>`,
    css: `.d-arrow{display:inline-flex;align-items:center;gap:10px;padding:14px 22px;border-radius:999px;background:#fff;color:#0b0b12;font:700 15px system-ui,sans-serif;text-decoration:none;box-shadow:0 10px 30px -10px #fff8;transition:gap .3s cubic-bezier(.3,1.6,.5,1),padding .3s}
.d-arrow i{font-style:normal;display:grid;place-items:center;width:26px;height:26px;border-radius:50%;background:#0b0b12;color:#fff;transition:transform .3s}
.d-arrow:hover{gap:18px;padding-right:16px}.d-arrow:hover i{transform:rotate(-45deg)}` },
  { group: "Buttons", title: "Pulse ring CTA",
    html: `<button class="d-pulse">▶</button>`,
    css: `.d-pulse{position:relative;width:72px;height:72px;border:0;border-radius:50%;background:linear-gradient(135deg,#c9a96e,#ff8f5a);color:#fff;font-size:24px;cursor:pointer;box-shadow:0 10px 30px -6px #f43f5eaa}
.d-pulse::before,.d-pulse::after{content:"";position:absolute;inset:0;border-radius:50%;border:2px solid #c9a96e;animation:d-pr 2s ease-out infinite}
.d-pulse::after{animation-delay:1s}
@keyframes d-pr{to{transform:scale(1.9);opacity:0}}` },
  { group: "Buttons", title: "Copy → check morph",
    html: `<button class="d-copy" data-text="npm i ui-vault"><code>npm i ui-vault</code><span>⧉</span></button>`,
    css: `.d-copy{display:inline-flex;align-items:center;gap:14px;padding:10px 10px 10px 16px;border-radius:12px;border:1px solid #ffffff22;background:#ffffff08;color:#e5e5f0;cursor:pointer;font:14px ui-monospace,monospace}
.d-copy span{display:grid;place-items:center;width:30px;height:30px;border-radius:8px;background:#ffffff12;transition:background .3s,transform .3s cubic-bezier(.3,1.8,.5,1)}
.d-copy.ok span{background:#22c55e;color:#04120a;transform:rotate(360deg)}`,
    js: `const b = root.querySelector(".d-copy");
b.addEventListener("click", () => {
  navigator.clipboard && navigator.clipboard.writeText(b.dataset.text).catch(() => {});
  b.classList.add("ok"); b.lastElementChild.textContent = "✓";
  setTimeout(() => { b.classList.remove("ok"); b.lastElementChild.textContent = "⧉"; }, 1400);
});` },

  // ── Cards ──
  { group: "Cards", title: "Orbiting beam border",
    html: `<div class="d-beam"><h4>Beam card</h4><p>A light travels around the edge.</p></div>`,
    css: `@property --d-a{syntax:"<angle>";initial-value:0deg;inherits:false}
.d-beam{position:relative;width:260px;padding:24px;border-radius:18px;background:#12121b;color:#eee;font:14px/1.5 system-ui,sans-serif}
.d-beam::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding:1.5px;background:conic-gradient(from var(--d-a),transparent 70%,#d9d6cf,#ff6a26,transparent);-webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);-webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box exclude,linear-gradient(#000 0 0);animation:d-ba 4s linear infinite}
.d-beam h4{margin:0 0 6px;font-size:17px}.d-beam p{margin:0;color:#9b9bb0}
@keyframes d-ba{to{--d-a:360deg}}` },
  { group: "Cards", title: "3D flip card",
    html: `<div class="d-flip"><div><div class="f">Hover to flip</div><div class="b">✨ Surprise!</div></div></div>`,
    css: `.d-flip{width:220px;height:140px;perspective:800px}
.d-flip>div{position:relative;width:100%;height:100%;transform-style:preserve-3d;transition:transform .7s cubic-bezier(.4,1.4,.5,1)}
.d-flip:hover>div{transform:rotateY(180deg)}
.d-flip .f,.d-flip .b{position:absolute;inset:0;display:grid;place-items:center;border-radius:16px;backface-visibility:hidden;font:700 17px system-ui,sans-serif;color:#fff}
.d-flip .f{background:#1b1b28;border:1px solid #ffffff1a}
.d-flip .b{background:linear-gradient(135deg,#c9a96e,#ff6a26);transform:rotateY(180deg)}` },
  { group: "Cards", title: "Fan-out card stack",
    html: `<div class="d-fan"><i></i><i></i><i></i></div>`,
    css: `.d-fan{position:relative;width:150px;height:200px;cursor:pointer}
.d-fan i{position:absolute;inset:0;border-radius:16px;border:1px solid #ffffff30;box-shadow:0 10px 30px #0008;transition:transform .5s cubic-bezier(.3,1.4,.5,1)}
.d-fan i:nth-child(1){background:linear-gradient(160deg,#d9d6cf,#d9d6cf)}
.d-fan i:nth-child(2){background:linear-gradient(160deg,#ff6a26,#ff6a26)}
.d-fan i:nth-child(3){background:linear-gradient(160deg,#c9a96e,#c9a96e)}
.d-fan:hover i:nth-child(1){transform:translateX(-70px) rotate(-14deg)}
.d-fan:hover i:nth-child(3){transform:translateX(70px) rotate(14deg)}
.d-fan:hover i:nth-child(2){transform:translateY(-14px)}` },
  { group: "Cards", title: "Expanding panels",
    html: `<div class="d-panels"><div style="--c:#c9a96e">Ember</div><div style="--c:#ff6a26">Violet</div><div style="--c:#d9d6cf">Ocean</div><div style="--c:#22c55e">Forest</div></div>`,
    css: `.d-panels{display:flex;gap:8px;width:100%;max-width:420px;height:160px}
.d-panels div{flex:1;display:flex;align-items:flex-end;padding:12px;border-radius:16px;background:linear-gradient(160deg,var(--c),#0b0b12);color:#fff;font:700 14px system-ui,sans-serif;overflow:hidden;white-space:nowrap;transition:flex .5s cubic-bezier(.3,1,.3,1)}
.d-panels div:hover{flex:4}` },

  // ── Text ──
  { group: "Text", title: "Decoder scramble",
    html: `<h3 class="d-scr">HOVER TO DECODE</h3>`,
    css: `.d-scr{margin:0;font:700 26px ui-monospace,monospace;color:#d9d6cf;letter-spacing:.06em;cursor:default}`,
    js: `const el = root.querySelector(".d-scr"), text = el.textContent, chars = "!<>-_/[]{}=+*^?#01";
el.addEventListener("mouseenter", () => {
  let f = 0; const total = 24;
  const tick = () => {
    el.textContent = [...text].map((c, i) => c === " " || i / text.length < f / total ? c : chars[Math.random() * chars.length | 0]).join("");
    if (++f <= total) requestAnimationFrame(tick); else el.textContent = text;
  }; tick();
});` },
  { group: "Text", title: "Fill wipe on hover",
    html: `<h3 class="d-wipe" data-t="CREATIVE">CREATIVE</h3>`,
    css: `.d-wipe{position:relative;margin:0;font:900 52px/1 system-ui,sans-serif;color:transparent;-webkit-text-stroke:1.5px #ffffff70;cursor:default}
.d-wipe::before{content:attr(data-t);position:absolute;inset:0;color:#fbbf24;-webkit-text-stroke:0;clip-path:inset(0 100% 0 0);transition:clip-path .6s cubic-bezier(.7,0,.2,1)}
.d-wipe:hover::before{clip-path:inset(0 0 0 0)}` },
  { group: "Text", title: "Wavy letters",
    html: `<h3 class="d-wave">Loading vibes</h3>`,
    css: `.d-wave{margin:0;font:800 32px system-ui,sans-serif;color:#fff}
.d-wave span{display:inline-block;animation:d-wv 1.4s ease-in-out infinite;animation-delay:calc(var(--i) * 70ms)}
@keyframes d-wv{0%,60%,100%{transform:none;color:#fff}30%{transform:translateY(-10px);color:#ff6a26}}`,
    js: `const h = root.querySelector(".d-wave");
h.innerHTML = [...h.textContent].map((c, i) => '<span style="--i:' + i + '">' + (c === " " ? "&nbsp;" : c) + "</span>").join("");` },
  { group: "Text", title: "Gradient underline link",
    html: `<a class="d-ul" href="#">Read the full story</a>`,
    css: `.d-ul{color:#e5e5f0;font:600 20px system-ui,sans-serif;text-decoration:none;background:linear-gradient(90deg,#c9a96e,#d9d6cf) 0 100%/0 2px no-repeat;padding-bottom:4px;transition:background-size .4s cubic-bezier(.7,0,.2,1)}
.d-ul:hover{background-size:100% 2px}` },

  // ── Inputs ──
  { group: "Inputs", title: "Expanding search",
    html: `<label class="d-search"><input placeholder="Search…"><span>⌕</span></label>`,
    css: `.d-search{position:relative;display:inline-block}
.d-search input{width:46px;height:46px;padding:0 0 0 46px;border-radius:999px;border:1px solid #ffffff26;background:#ffffff0a;color:#fff;font:15px system-ui,sans-serif;outline:none;transition:width .45s cubic-bezier(.3,1.2,.4,1),border-color .2s;cursor:pointer}
.d-search input:focus{width:260px;border-color:#ff6a26;cursor:text}
.d-search span{position:absolute;left:0;top:0;width:46px;height:46px;display:grid;place-items:center;color:#ff6a26;font-size:20px;pointer-events:none}` },
  { group: "Inputs", title: "Star rating (pure CSS)",
    html: `<div class="d-stars"><input type="radio" name="ds" id="ds5"><label for="ds5">★</label><input type="radio" name="ds" id="ds4" checked><label for="ds4">★</label><input type="radio" name="ds" id="ds3"><label for="ds3">★</label><input type="radio" name="ds" id="ds2"><label for="ds2">★</label><input type="radio" name="ds" id="ds1"><label for="ds1">★</label></div>`,
    css: `.d-stars{display:inline-flex;flex-direction:row-reverse;gap:4px}
.d-stars input{position:absolute;opacity:0}
.d-stars label{font-size:34px;color:#33334a;cursor:pointer;transition:color .15s,transform .2s cubic-bezier(.3,1.8,.5,1)}
.d-stars label:hover,.d-stars label:hover~label,.d-stars input:checked~label{color:#fbbf24;text-shadow:0 0 14px #fbbf2488}
.d-stars label:hover{transform:scale(1.25) rotate(-8deg)}` },
  { group: "Inputs", title: "Drawn checkbox",
    html: `<label class="d-chk"><input type="checkbox"><svg viewBox="0 0 24 24"><rect x="2" y="2" width="20" height="20" rx="6"/><path d="M6 12.5l4 4 8-9"/></svg>Ship it</label>`,
    css: `.d-chk{display:inline-flex;align-items:center;gap:12px;color:#e5e5f0;font:500 16px system-ui,sans-serif;cursor:pointer}
.d-chk input{position:absolute;opacity:0}
.d-chk svg{width:28px;height:28px;fill:none;stroke-width:2;stroke-linecap:round;stroke-linejoin:round}
.d-chk rect{stroke:#ffffff40;transition:fill .3s,stroke .3s}
.d-chk path{stroke:#fff;stroke-dasharray:22;stroke-dashoffset:22;transition:stroke-dashoffset .4s .1s cubic-bezier(.6,0,.2,1)}
.d-chk input:checked+svg rect{fill:#ff6a26;stroke:#ff6a26}
.d-chk input:checked+svg path{stroke-dashoffset:0}` },
  { group: "Inputs", title: "OTP code input",
    html: `<div class="d-otp"><input maxlength="1"><input maxlength="1"><input maxlength="1"><input maxlength="1"></div>`,
    css: `.d-otp{display:flex;gap:10px}
.d-otp input{width:52px;height:60px;text-align:center;border-radius:14px;border:1px solid #ffffff26;background:#ffffff08;color:#fff;font:700 24px system-ui,sans-serif;outline:none;transition:border-color .2s,transform .2s,box-shadow .2s}
.d-otp input:focus{border-color:#ff6a26;transform:translateY(-3px);box-shadow:0 8px 20px -8px #ff6a26}
.d-otp.done input{border-color:#22c55e;box-shadow:0 0 0 3px #22c55e33}`,
    js: `const ins = [...root.querySelectorAll(".d-otp input")];
ins.forEach((inp, k) => {
  inp.addEventListener("input", () => { inp.value = inp.value.replace(/\\D/g, ""); if (inp.value && ins[k + 1]) ins[k + 1].focus(); root.querySelector(".d-otp").classList.toggle("done", ins.every(i => i.value)); });
  inp.addEventListener("keydown", e => { if (e.key === "Backspace" && !inp.value && ins[k - 1]) ins[k - 1].focus(); });
});` },

  // ── Loaders ──
  { group: "Loaders", title: "Gradient ring spinner",
    html: `<div class="d-ring"></div>`,
    css: `.d-ring{width:56px;height:56px;border-radius:50%;background:conic-gradient(transparent 20%,#ff6a26,#d9d6cf);-webkit-mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));mask:radial-gradient(farthest-side,transparent calc(100% - 6px),#000 calc(100% - 5px));animation:d-rr 1s linear infinite}
@keyframes d-rr{to{transform:rotate(360deg)}}` },
  { group: "Loaders", title: "Bouncing dots",
    html: `<div class="d-dots"><i></i><i></i><i></i></div>`,
    css: `.d-dots{display:flex;gap:8px}
.d-dots i{width:14px;height:14px;border-radius:50%;background:#c9a96e;animation:d-bd .9s cubic-bezier(.4,0,.6,1) infinite}
.d-dots i:nth-child(2){animation-delay:.15s;background:#ff6a26}.d-dots i:nth-child(3){animation-delay:.3s;background:#d9d6cf}
@keyframes d-bd{0%,80%,100%{transform:translateY(0) scale(1)}40%{transform:translateY(-16px) scale(1.1)}}` },
  { group: "Loaders", title: "Progress with label",
    html: `<div class="d-prog"><div><span>Uploading assets</span><b>0%</b></div><i><s></s></i></div>`,
    css: `.d-prog{width:280px;color:#e5e5f0;font:500 14px system-ui,sans-serif}
.d-prog div{display:flex;justify-content:space-between;margin-bottom:8px}
.d-prog b{font-variant-numeric:tabular-nums}
.d-prog i{display:block;height:8px;border-radius:99px;background:#ffffff14;overflow:hidden}
.d-prog s{display:block;height:100%;width:0;border-radius:inherit;background:linear-gradient(90deg,#ff6a26,#d9d6cf);box-shadow:0 0 12px #ff6a26;transition:width .25s}`,
    js: `const s = root.querySelector(".d-prog s"), b = root.querySelector(".d-prog b"); let v = 0;
setInterval(() => { v = v >= 100 ? 0 : Math.min(100, v + Math.random() * 9); s.style.width = v + "%"; b.textContent = Math.round(v) + "%"; }, 260);` },
  { group: "Loaders", title: "Morphing square",
    html: `<div class="d-morph"></div>`,
    css: `.d-morph{width:48px;height:48px;background:linear-gradient(135deg,#fbbf24,#c9a96e);animation:d-mo 2s cubic-bezier(.7,0,.3,1) infinite}
@keyframes d-mo{0%{border-radius:8px;transform:rotate(0)}50%{border-radius:50%;transform:rotate(180deg) scale(.7)}100%{border-radius:8px;transform:rotate(360deg)}}` },

  // ── Backgrounds ──
  { group: "Backgrounds", title: "Aurora blobs",
    html: `<div class="d-aur"><i></i><i></i><i></i><b>Aurora</b></div>`,
    css: `.d-aur{position:relative;display:grid;place-items:center;width:100%;height:160px;border-radius:16px;overflow:hidden;background:#121211}
.d-aur i{position:absolute;width:180px;height:180px;border-radius:50%;filter:blur(40px);opacity:.7;animation:d-au 8s ease-in-out infinite alternate}
.d-aur i:nth-child(1){background:#ff6a26;left:5%;top:-30%}
.d-aur i:nth-child(2){background:#d9d6cf;right:5%;top:10%;animation-delay:-3s}
.d-aur i:nth-child(3){background:#c9a96e;left:35%;bottom:-50%;animation-delay:-5s}
.d-aur b{position:relative;color:#fff;font:800 28px system-ui,sans-serif}
@keyframes d-au{to{transform:translate(40px,20px) scale(1.2)}}` },
  { group: "Backgrounds", title: "Retro perspective grid",
    html: `<div class="d-floor"><i></i></div>`,
    css: `.d-floor{position:relative;width:100%;height:160px;border-radius:16px;overflow:hidden;background:linear-gradient(#141413,#2b2620 60%,#141413);perspective:200px}
.d-floor::before{content:"";position:absolute;left:50%;top:22%;width:90px;height:90px;margin-left:-45px;border-radius:50%;background:linear-gradient(#fde047,#c9a96e);box-shadow:0 0 40px #c9a96e}
.d-floor i{position:absolute;left:-50%;right:-50%;bottom:-40%;height:120%;transform:rotateX(70deg);background:linear-gradient(#c9a96e 1px,transparent 1px) 0 0/40px 40px,linear-gradient(90deg,#c9a96e 1px,transparent 1px) 0 0/40px 40px;animation:d-fl 1s linear infinite;-webkit-mask-image:linear-gradient(transparent,#000 40%);mask-image:linear-gradient(transparent,#000 40%)}
@keyframes d-fl{to{background-position:0 40px,0 40px}}` },
  { group: "Backgrounds", title: "Twinkling starfield",
    html: `<div class="d-sky"></div>`,
    css: `.d-sky{position:relative;width:100%;height:160px;border-radius:16px;overflow:hidden;background:radial-gradient(ellipse at bottom,#22201c,#121211)}
.d-sky i{position:absolute;width:2px;height:2px;border-radius:50%;background:#fff;animation:d-tw 3s ease-in-out infinite}
@keyframes d-tw{50%{opacity:.2}}`,
    js: `const sky = root.querySelector(".d-sky");
for (let i = 0; i < 70; i++) { const s = document.createElement("i"); s.style.cssText = "left:" + Math.random() * 100 + "%;top:" + Math.random() * 100 + "%;animation-delay:" + -Math.random() * 3 + "s;transform:scale(" + (.5 + Math.random()) + ")"; sky.appendChild(s); }` },
  { group: "Backgrounds", title: "Conic spotlight sweep",
    html: `<div class="d-sweep"><b>SPOTLIGHT</b></div>`,
    css: `.d-sweep{position:relative;display:grid;place-items:center;width:100%;height:160px;border-radius:16px;overflow:hidden;background:#121211}
.d-sweep::before{content:"";position:absolute;inset:-60%;background:conic-gradient(from 0deg at 50% 50%,transparent 0 40%,#ffffff22 45%,transparent 50%);animation:d-sw 6s linear infinite}
.d-sweep b{position:relative;color:#fff;font:800 26px system-ui,sans-serif;letter-spacing:.2em}
@keyframes d-sw{to{transform:rotate(360deg)}}` },

  // ── Navigation ──
  { group: "Navigation", title: "macOS-style dock",
    html: `<nav class="d-dock"><a>🗂</a><a>🎵</a><a>🌄</a><a>⌨</a><a>✉</a><a>🎮</a></nav>`,
    css: `.d-dock{display:flex;align-items:flex-end;gap:8px;padding:8px 10px;border-radius:20px;background:#ffffff12;border:1px solid #ffffff22}
.d-dock a{display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#1d1d2a;font-size:20px;cursor:pointer;transform-origin:bottom;transition:transform .25s cubic-bezier(.3,1.5,.5,1),margin .25s cubic-bezier(.3,1.5,.5,1)}
.d-dock a:hover{transform:scale(1.4) translateY(-6px);margin:0 10px}
.d-dock a:hover+a,.d-dock a:has(+a:hover){transform:scale(1.15) translateY(-2px);margin:0 4px}` },
  { group: "Navigation", title: "Mobile tab bar",
    html: `<nav class="d-tabbar"><button class="on">⌂<span>Home</span></button><button>⌕<span>Search</span></button><button>♡<span>Saved</span></button><button>◉<span>Me</span></button></nav>`,
    css: `.d-tabbar{display:flex;gap:4px;padding:6px;border-radius:22px;background:#15151f;border:1px solid #ffffff14;box-shadow:0 20px 40px -10px #000}
.d-tabbar button{display:flex;align-items:center;gap:0;padding:10px 14px;border:0;border-radius:16px;background:none;color:#8a8aa0;font:600 18px system-ui,sans-serif;cursor:pointer;transition:all .35s cubic-bezier(.3,1.3,.5,1)}
.d-tabbar span{max-width:0;overflow:hidden;font-size:13px;white-space:nowrap;transition:max-width .35s,margin .35s}
.d-tabbar button.on{background:#a78bfa22;color:#ff6a26}
.d-tabbar button.on span{max-width:70px;margin-left:8px}`,
    js: `const bs = root.querySelectorAll(".d-tabbar button");
bs.forEach(b => b.addEventListener("click", () => bs.forEach(x => x.classList.toggle("on", x === b))));` },
  { group: "Navigation", title: "Hamburger → X",
    html: `<button class="d-burger" aria-label="Menu"><i></i><i></i><i></i></button>`,
    css: `.d-burger{display:grid;gap:6px;padding:14px;border:1px solid #ffffff22;border-radius:12px;background:#ffffff08;cursor:pointer}
.d-burger i{display:block;width:24px;height:2px;border-radius:2px;background:#fff;transition:transform .4s cubic-bezier(.6,0,.2,1.4),opacity .2s}
.d-burger.open i:nth-child(1){transform:translateY(8px) rotate(45deg)}
.d-burger.open i:nth-child(2){opacity:0;transform:scaleX(0)}
.d-burger.open i:nth-child(3){transform:translateY(-8px) rotate(-45deg)}`,
    js: `root.querySelector(".d-burger").addEventListener("click", e => e.currentTarget.classList.toggle("open"));` },
  { group: "Navigation", title: "Smooth-height accordion",
    html: `<div class="d-acc"><button>What makes this smooth? <span>+</span></button><div><p>The grid-template-rows 0fr → 1fr trick animates to the content's real height. No JS measuring needed.</p></div></div>`,
    css: `.d-acc{width:320px;border-radius:14px;border:1px solid #ffffff1a;background:#12121b;color:#e5e5f0;font:15px/1.5 system-ui,sans-serif}
.d-acc button{display:flex;justify-content:space-between;width:100%;padding:16px 18px;border:0;background:none;color:inherit;font:600 15px system-ui,sans-serif;cursor:pointer}
.d-acc button span{transition:transform .3s cubic-bezier(.3,1.6,.5,1)}
.d-acc>div{display:grid;grid-template-rows:0fr;transition:grid-template-rows .4s cubic-bezier(.3,1,.3,1)}
.d-acc>div>p{overflow:hidden;margin:0;padding:0 18px;color:#9b9bb0}
.d-acc.open>div{grid-template-rows:1fr}.d-acc.open>div>p{padding-bottom:16px}
.d-acc.open button span{transform:rotate(45deg)}`,
    js: `root.querySelector(".d-acc button").addEventListener("click", e => e.currentTarget.parentElement.classList.toggle("open"));` },

  // ── Feedback ──
  { group: "Feedback", title: "Like burst",
    html: `<button class="d-like" aria-label="Like">♥</button>`,
    css: `.d-like{position:relative;width:64px;height:64px;border:0;border-radius:50%;background:#ffffff0a;color:#55556a;font-size:30px;cursor:pointer;transition:color .2s}
.d-like.on{color:#c9a96e;animation:d-lk .45s cubic-bezier(.3,1.8,.5,1)}
.d-like.on::before{content:"";position:absolute;inset:-6px;border-radius:50%;border:3px solid #c9a96e;animation:d-lr .5s forwards}
.d-like.on::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 -34px 0 -10px #fbbf24,24px -24px 0 -10px #d9d6cf,34px 0 0 -10px #ff6a26,24px 24px 0 -10px #c9a96e,0 34px 0 -10px #fbbf24,-24px 24px 0 -10px #d9d6cf,-34px 0 0 -10px #ff6a26,-24px -24px 0 -10px #c9a96e;animation:d-ls .6s forwards}
@keyframes d-lk{40%{transform:scale(1.3)}}
@keyframes d-lr{to{transform:scale(1.6);opacity:0}}
@keyframes d-ls{from{transform:scale(.4)}to{transform:scale(1.2);opacity:0}}`,
    js: `root.querySelector(".d-like").addEventListener("click", e => e.currentTarget.classList.toggle("on"));` },
  { group: "Feedback", title: "Bell with badge shake",
    html: `<button class="d-bell">🔔<b>3</b></button>`,
    css: `.d-bell{position:relative;width:56px;height:56px;border:1px solid #ffffff22;border-radius:16px;background:#ffffff08;font-size:24px;cursor:pointer}
.d-bell b{position:absolute;top:-6px;right:-6px;min-width:22px;height:22px;padding:0 6px;border-radius:99px;background:#ef4444;color:#fff;font:700 12px/22px system-ui,sans-serif;box-shadow:0 0 0 3px #0b0b12}
.d-bell:hover{animation:d-sh .6s}
@keyframes d-sh{20%{transform:rotate(14deg)}40%{transform:rotate(-12deg)}60%{transform:rotate(8deg)}80%{transform:rotate(-4deg)}}`,
    js: `const b = root.querySelector(".d-bell b"); root.querySelector(".d-bell").addEventListener("click", () => { b.textContent = +b.textContent + 1; });` },
  { group: "Feedback", title: "CSS tooltip",
    html: `<button class="d-tip" data-tip="Saved to your library">Hover me</button>`,
    css: `.d-tip{position:relative;padding:12px 20px;border:1px solid #ffffff22;border-radius:12px;background:#ffffff08;color:#fff;font:600 14px system-ui,sans-serif;cursor:pointer}
.d-tip::after{content:attr(data-tip);position:absolute;left:50%;bottom:calc(100% + 10px);transform:translate(-50%,6px) scale(.95);padding:7px 11px;border-radius:9px;background:#fff;color:#111;font-size:12px;white-space:nowrap;opacity:0;pointer-events:none;transition:all .2s cubic-bezier(.3,1.4,.5,1)}
.d-tip::before{content:"";position:absolute;left:50%;bottom:calc(100% + 4px);border:6px solid transparent;border-top-color:#fff;transform:translateX(-50%);opacity:0;transition:opacity .2s}
.d-tip:hover::after{opacity:1;transform:translate(-50%,0) scale(1)}.d-tip:hover::before{opacity:1}` },
  { group: "Feedback", title: "Animated stepper",
    html: `<div class="d-steps"><i class="on">1</i><s></s><i>2</i><s></s><i>3</i><button>Next →</button></div>`,
    css: `.d-steps{display:flex;align-items:center;gap:8px;flex-wrap:wrap;justify-content:center}
.d-steps i{display:grid;place-items:center;width:34px;height:34px;border-radius:50%;border:2px solid #ffffff26;color:#8a8aa0;font:700 14px system-ui,sans-serif;font-style:normal;transition:all .35s}
.d-steps i.on{border-color:#ff6a26;background:#ff6a26;color:#fff;box-shadow:0 0 0 5px #8b5cf633}
.d-steps s{width:44px;height:3px;border-radius:2px;background:linear-gradient(90deg,#ff6a26 var(--p,0%),#ffffff1f var(--p,0%));transition:--p .4s}
.d-steps s.on{--p:100%;background:#ff6a26}
.d-steps button{margin-left:14px;padding:9px 16px;border:0;border-radius:10px;background:#ffffff14;color:#fff;font:600 13px system-ui,sans-serif;cursor:pointer}`,
    js: `const dots = [...root.querySelectorAll(".d-steps i")], bars = [...root.querySelectorAll(".d-steps s")]; let n = 0;
root.querySelector(".d-steps button").addEventListener("click", () => {
  n = (n + 1) % dots.length;
  dots.forEach((d, k) => d.classList.toggle("on", k <= n)); bars.forEach((b, k) => b.classList.toggle("on", k < n));
});` }
);
