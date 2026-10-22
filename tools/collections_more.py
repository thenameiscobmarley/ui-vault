"""UI Vault collections, part 2: 3D & depth (.uv-depth-*), CSS motion (.uv-an-*) and animated borders (.uv-bd-*).
Pure CSS, no JavaScript. `.X` is the item's class (expanded by collections_specs.collections()).
Items are (name, label, css) or (name, label, css, html) when a piece needs its own markup.
"""
A, A2, T, BG, S, S2, S3, L, M = ("var(--uv-accent)", "var(--uv-accent-2)", "var(--uv-text)", "var(--uv-bg)", "var(--uv-surface)",
                                "var(--uv-surface-2)", "var(--uv-surface-3)", "var(--uv-line-2)", "var(--uv-muted)")
mixa = lambda c, p: f"color-mix(in srgb, {c} {p}%, transparent)"
GRAD = f"linear-gradient(135deg, {A}, {A2})"
FACE = f"display: grid; place-items: center; font: 700 12px var(--uv-mono); color: {T};"

KEYFRAMES = """@property --uv-x-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes uv-x-a { to { --uv-x-a: 360deg; } }
@keyframes uv-x-cube { to { transform: rotateX(360deg) rotateY(720deg); } }
@keyframes uv-x-turn { to { transform: rotateY(360deg); } }
@keyframes uv-x-turnx { to { transform: rotateX(360deg); } }
@keyframes uv-x-coin { to { transform: rotateY(360deg); } }
@keyframes uv-x-orbit3d { to { transform: rotateX(70deg) rotateZ(360deg); } }
@keyframes uv-x-unorbit { to { transform: rotateZ(-360deg) rotateX(-70deg); } }
@keyframes uv-x-wave3d { 50% { transform: translateZ(26px); } }
@keyframes uv-x-tunnel { from { transform: translateZ(-300px); opacity: 0; } 30% { opacity: 1; } to { transform: translateZ(120px); opacity: 0; } }
@keyframes uv-x-crawl { from { transform: rotateX(58deg) translateY(110%); } to { transform: rotateX(58deg) translateY(-160%); } }
@keyframes uv-x-gyro1 { to { transform: rotateX(360deg) rotateY(180deg); } }
@keyframes uv-x-gyro2 { to { transform: rotateY(360deg) rotateZ(180deg); } }
@keyframes uv-x-gyro3 { to { transform: rotateZ(360deg) rotateX(180deg); } }
@keyframes uv-x-float { 50% { transform: translateY(-10px); } }
@keyframes uv-x-bob { 50% { transform: translateY(-6px) rotate(-2deg); } }
@keyframes uv-x-breathe { 50% { transform: scale(1.08); } }
@keyframes uv-x-glowpulse { 50% { box-shadow: 0 0 0 0 transparent, 0 0 34px 6px color-mix(in srgb, var(--uv-accent) 55%, transparent); } }
@keyframes uv-x-wiggle { 0%, 100% { transform: rotate(0); } 20% { transform: rotate(-7deg); } 40% { transform: rotate(6deg); } 60% { transform: rotate(-4deg); } 80% { transform: rotate(2deg); } }
@keyframes uv-x-jello { 0%, 100% { transform: none; } 30% { transform: skewX(-12deg) skewY(-6deg); } 50% { transform: skewX(8deg) skewY(4deg); } 70% { transform: skewX(-4deg) skewY(-2deg); } }
@keyframes uv-x-rubber { 0%, 100% { transform: scale(1); } 30% { transform: scale(1.25, .75); } 40% { transform: scale(.75, 1.25); } 50% { transform: scale(1.15, .85); } 65% { transform: scale(.95, 1.05); } 75% { transform: scale(1.05, .95); } }
@keyframes uv-x-heart { 0%, 40%, 100% { transform: scale(1); } 10%, 30% { transform: scale(1.14); } 20% { transform: scale(1.02); } }
@keyframes uv-x-tada { 0%, 100% { transform: none; } 10%, 20% { transform: scale(.9) rotate(-3deg); } 30%, 50%, 70%, 90% { transform: scale(1.1) rotate(3deg); } 40%, 60%, 80% { transform: scale(1.1) rotate(-3deg); } }
@keyframes uv-x-swing { 20% { transform: rotate(14deg); } 40% { transform: rotate(-10deg); } 60% { transform: rotate(5deg); } 80% { transform: rotate(-4deg); } 100% { transform: rotate(0); } }
@keyframes uv-x-spin { to { transform: rotate(360deg); } }
@keyframes uv-x-spiny { to { transform: perspective(500px) rotateY(360deg); } }
@keyframes uv-x-flipx { 0%, 20% { transform: perspective(500px) rotateX(0); } 50%, 70% { transform: perspective(500px) rotateX(180deg); } 100% { transform: perspective(500px) rotateX(360deg); } }
@keyframes uv-x-sway3d { 50% { transform: perspective(500px) rotateY(28deg) rotateX(8deg); } 0%, 100% { transform: perspective(500px) rotateY(-28deg) rotateX(-8deg); } }
@keyframes uv-x-ping { 75%, 100% { transform: scale(1.9); opacity: 0; } }
@keyframes uv-x-ripple { from { transform: scale(.6); opacity: .9; } to { transform: scale(2.2); opacity: 0; } }
@keyframes uv-x-sweep { 0%, 55% { transform: translateX(-120%) skewX(-20deg); } 100% { transform: translateX(220%) skewX(-20deg); } }
@keyframes uv-x-flowbg { 50% { background-position: 100% 50%; } }
@keyframes uv-x-caret { 50% { opacity: 0; } }
@keyframes uv-x-morph { 0%, 100% { border-radius: 42% 58% 70% 30% / 45% 45% 55% 55%; } 33% { border-radius: 70% 30% 46% 54% / 30% 29% 71% 70%; } 66% { border-radius: 28% 72% 34% 66% / 55% 66% 34% 45%; } }
@keyframes uv-x-flicker { 0%, 19%, 21%, 23%, 25%, 54%, 56%, 100% { opacity: 1; filter: drop-shadow(0 0 10px var(--uv-accent)); } 20%, 24%, 55% { opacity: .35; filter: none; } }
@keyframes uv-x-glitchy { 0%, 86%, 100% { transform: none; clip-path: none; } 88% { transform: translate(-4px, 2px); clip-path: inset(10% 0 55% 0); } 90% { transform: translate(4px, -2px); clip-path: inset(60% 0 10% 0); } 92% { transform: translate(-2px, 0); clip-path: inset(30% 0 40% 0); } }
@keyframes uv-x-shadowwalk { 0%, 100% { box-shadow: 8px 8px 0 var(--uv-accent); } 25% { box-shadow: -8px 8px 0 var(--uv-accent); } 50% { box-shadow: -8px -8px 0 var(--uv-accent); } 75% { box-shadow: 8px -8px 0 var(--uv-accent); } }
@keyframes uv-x-hue { to { filter: hue-rotate(360deg); } }
@keyframes uv-x-levitate { 50% { transform: translateY(-12px); } }
@keyframes uv-x-levshadow { 50% { transform: scale(.7); opacity: .35; } }
@keyframes uv-x-orbitdot { to { transform: rotate(360deg) translateX(58px) rotate(-360deg); } }
@keyframes uv-x-stretch { 0%, 100% { transform: scaleX(1); } 50% { transform: scaleX(1.25) scaleY(.85); } }
@keyframes uv-x-pendulum { 0%, 100% { transform: rotate(25deg); } 50% { transform: rotate(-25deg); } }
@keyframes uv-x-march { to { background-position: 16px 0, -16px 100%, 0 -16px, 100% 16px; } }
@keyframes uv-x-pulse-ring { 0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--uv-accent) 70%, transparent); } 100% { box-shadow: 0 0 0 16px transparent; } }
@keyframes uv-x-trace { to { offset-distance: 100%; } }
@keyframes uv-x-colorcycle { 0%, 100% { border-color: var(--uv-accent); } 50% { border-color: var(--uv-accent-2); } }
"""

# ── 3D & depth ───────────────────────────────────────────────────────────────
CARD2 = lambda a, b: f'<div class="X"><div><b>{a}</b><b>{b}</b></div></div>'
FACES6 = '<div class="X"><div><i>1</i><i>2</i><i>3</i><i>4</i><i>5</i><i>6</i></div></div>'
RING = lambda n: '<div class="X"><div>' + "".join(f'<i style="--i:{i}"></i>' for i in range(n)) + "</div></div>"
cube_faces = lambda s: "".join(f".X i:nth-child({k + 1}) {{ transform: {tf} translateZ({s}px); }} " for k, tf in enumerate(
    ["rotateY(0)", "rotateY(90deg)", "rotateY(180deg)", "rotateY(-90deg)", "rotateX(90deg)", "rotateX(-90deg)"]))
FLIP_BASE = (".X { perspective: 900px; width: 180px; height: 116px; } .X > div { position: relative; width: 100%; height: 100%; transform-style: preserve-3d; transition: transform .8s cubic-bezier(.3, 1.3, .5, 1); } "
             f".X > div > * {{ position: absolute; inset: 0; display: grid; place-items: center; border-radius: 14px; backface-visibility: hidden; -webkit-backface-visibility: hidden; font: 700 15px var(--uv-font); }} "
             f".X > div > :first-child {{ background: {S2}; color: {T}; border: 1px solid {L}; }} .X > div > :last-child {{ background: {GRAD}; color: #fff; }} ")

DEPTH = [
    ("flip", "Flip card", FLIP_BASE + ".X:hover > div { transform: rotateY(180deg); } .X > div > :last-child { transform: rotateY(180deg); }", CARD2("Hover me", "Back side")),
    ("flip-up", "Flip up", FLIP_BASE + ".X:hover > div { transform: rotateX(-180deg); } .X > div > :last-child { transform: rotateX(180deg); }", CARD2("Hover me", "Flipped up")),
    ("cube", "Spinning cube", f".X {{ width: 84px; height: 84px; perspective: 600px; }} .X > div {{ position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: uv-x-cube 9s linear infinite; }} "
     f".X:hover > div {{ animation-play-state: paused; }} .X i {{ position: absolute; inset: 0; {FACE} border: 1.5px solid {A}; background: {mixa(A, 16)}; }} " + cube_faces(42), FACES6),
    ("wire-cube", "Neon wireframe cube", f".X {{ width: 84px; height: 84px; perspective: 500px; }} .X > div {{ position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: uv-x-cube 12s linear infinite reverse; }} "
     f".X i {{ position: absolute; inset: 0; border: 2px solid {A}; box-shadow: 0 0 12px {A}, inset 0 0 12px {mixa(A, 50)}; font-size: 0; }} " + cube_faces(42), FACES6),
    ("carousel", "3D carousel", f".X {{ width: 240px; height: 130px; perspective: 700px; display: grid; place-items: center; }} .X > div {{ position: relative; width: 56px; height: 76px; transform-style: preserve-3d; animation: uv-x-turn 14s linear infinite; }} "
     f".X:hover > div {{ animation-duration: 40s; }} .X i {{ position: absolute; inset: 0; border-radius: 8px; background: {GRAD}; border: 1px solid #ffffff55; opacity: .9; transform: rotateY(calc(var(--i) * 45deg)) translateZ(96px); }} .X i:nth-child(odd) {{ background: {S3}; }}", RING(8)),
    ("cylinder", "Cylinder", f".X {{ width: 160px; height: 120px; perspective: 600px; display: grid; place-items: center; }} .X > div {{ position: relative; width: 22px; height: 100px; transform-style: preserve-3d; animation: uv-x-turn 8s linear infinite; }} "
     f".X i {{ position: absolute; inset: 0; background: linear-gradient(180deg, {A}, {A2}); opacity: .85; transform: rotateY(calc(var(--i) * 30deg)) translateZ(41px); }} .X i:nth-child(even) {{ filter: brightness(.7); }}", RING(12)),
    ("prism", "Prism", f".X {{ width: 100px; height: 110px; perspective: 600px; }} .X > div {{ position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: uv-x-turn 7s linear infinite; }} "
     f".X i {{ position: absolute; inset: 0; {FACE} background: {mixa(A, 30)}; border: 1px solid {A}; transform: rotateY(calc(var(--i) * 120deg)) translateZ(29px); }}", '<div class="X"><div><i style="--i:0">A</i><i style="--i:1">B</i><i style="--i:2">C</i></div></div>'),
    ("pyramid", "Pyramid", f".X {{ width: 110px; height: 110px; perspective: 500px; display: grid; place-items: center; }} .X > div {{ position: relative; width: 90px; height: 90px; transform-style: preserve-3d; animation: uv-x-turn 8s linear infinite; }} "
     f".X i {{ position: absolute; inset: 0; clip-path: polygon(50% 0, 100% 100%, 0 100%); background: linear-gradient(180deg, {A}, {A2}); transform-origin: 50% 100%; transform: rotateY(calc(var(--i) * 90deg)) translateZ(45px) rotateX(27deg); opacity: .9; }} .X i:nth-child(even) {{ filter: brightness(.75); }}", RING(4)),
    ("coin", "Spinning coin", f".X {{ width: 80px; height: 80px; perspective: 400px; }} .X > div {{ position: relative; width: 100%; height: 100%; transform-style: preserve-3d; animation: uv-x-coin 3s linear infinite; }} "
     f".X b {{ position: absolute; inset: 0; border-radius: 50%; display: grid; place-items: center; font: 800 26px var(--uv-font); color: #6b4a00; background: radial-gradient(circle at 35% 30%, #fff3c4, #e6c25a 45%, #9a6f12); border: 4px solid #c99a2e; backface-visibility: hidden; }} .X b:last-child {{ transform: rotateY(180deg); }}",
     '<div class="X"><div><b>★</b><b>1</b></div></div>'),
    ("gyro", "Gyroscope", f".X {{ width: 100px; height: 100px; perspective: 500px; position: relative; transform-style: preserve-3d; }} .X i {{ position: absolute; inset: 0; border-radius: 50%; border: 2px solid {A}; }} "
     f".X i:nth-child(1) {{ animation: uv-x-gyro1 4s linear infinite; }} .X i:nth-child(2) {{ inset: 10px; border-color: {A2}; animation: uv-x-gyro2 5s linear infinite; }} .X i:nth-child(3) {{ inset: 20px; border-color: {T}; animation: uv-x-gyro3 6s linear infinite; }} .X i:nth-child(4) {{ inset: 42px; border: 0; background: {A}; box-shadow: 0 0 16px {A}; }}",
     '<div class="X"><i></i><i></i><i></i><i></i></div>'),
    ("orbit", "Orbit", f".X {{ width: 150px; height: 110px; perspective: 600px; display: grid; place-items: center; }} .X > div {{ position: relative; width: 120px; height: 120px; border-radius: 50%; border: 1px dashed {L}; transform-style: preserve-3d; animation: uv-x-orbit3d 6s linear infinite; }} "
     f".X > b {{ position: absolute; width: 34px; height: 34px; border-radius: 50%; background: radial-gradient(circle at 35% 30%, #fff8, transparent 50%), {GRAD}; box-shadow: 0 0 24px {mixa(A, 60)}; }} .X i {{ position: absolute; top: -8px; left: calc(50% - 8px); width: 16px; height: 16px; border-radius: 50%; background: {A2}; animation: uv-x-unorbit 6s linear infinite; }}",
     '<div class="X"><div><i></i></div><b></b></div>'),
    ("layers", "Exploded layers", f".X {{ position: relative; width: 150px; height: 96px; transform-style: preserve-3d; transform: perspective(800px); transition: transform .7s cubic-bezier(.3, 1.2, .5, 1); }} .X:hover {{ transform: perspective(800px) rotateX(55deg) rotateZ(-35deg); }} "
     f".X i {{ position: absolute; inset: 0; border-radius: 12px; border: 1px solid #ffffff40; transition: transform .7s cubic-bezier(.3, 1.2, .5, 1); }} .X i:nth-child(1) {{ background: {S3}; }} .X i:nth-child(2) {{ background: {mixa(A, 55)}; }} .X i:nth-child(3) {{ background: {mixa(A2, 70)}; {FACE} }} "
     ".X:hover i:nth-child(2) { transform: translateZ(28px); } .X:hover i:nth-child(3) { transform: translateZ(56px); }", '<div class="X"><i></i><i></i><i>hover</i></div>'),
    ("iso", "Isometric tile", f".X {{ width: 96px; height: 96px; margin: 20px; border-radius: 10px; background: {GRAD}; transform: rotateX(55deg) rotateZ(-45deg); box-shadow: 1px 1px 0 {A2}, 2px 2px 0 {A2}, 3px 3px 0 {A2}, 4px 4px 0 {A2}, 5px 5px 0 {A2}, 6px 6px 0 {A2}, 20px 24px 24px #0006; transition: transform .4s, box-shadow .4s; }} "
     f".X:hover {{ transform: rotateX(55deg) rotateZ(-45deg) translate(-8px, -8px); box-shadow: 1px 1px 0 {A2}, 2px 2px 0 {A2}, 3px 3px 0 {A2}, 4px 4px 0 {A2}, 5px 5px 0 {A2}, 6px 6px 0 {A2}, 7px 7px 0 {A2}, 8px 8px 0 {A2}, 9px 9px 0 {A2}, 10px 10px 0 {A2}, 11px 11px 0 {A2}, 12px 12px 0 {A2}, 13px 13px 0 {A2}, 14px 14px 0 {A2}, 36px 40px 30px #0005; }}", '<div class="X"></div>'),
    ("tilt", "Hover tilt", f".X {{ width: 170px; height: 110px; border-radius: 14px; {FACE} background: {S2}; border: 1px solid {L}; transform: perspective(600px); transition: transform .5s cubic-bezier(.3, 1.3, .5, 1), box-shadow .5s; box-shadow: 0 10px 20px -12px #0007; }} "
     f".X:hover {{ transform: perspective(600px) rotateX(14deg) rotateY(-18deg) translateZ(10px); box-shadow: 18px 22px 30px -14px #0008, 0 0 0 1px {A}; }}", '<div class="X">tilt</div>'),
    ("book", "Book", f".X {{ position: relative; width: 96px; height: 130px; perspective: 700px; transform-style: preserve-3d; transform: perspective(700px) rotateY(-28deg); transition: transform .6s; }} .X:hover {{ transform: perspective(700px) rotateY(-8deg); }} "
     f".X > * {{ position: absolute; inset: 0; border-radius: 2px 6px 6px 2px; }} .X > i {{ background: repeating-linear-gradient(90deg, #f5efe2 0 2px, #e2dacb 2px 3px); transform: translateZ(-18px) translateX(4px); }} "
     f".X > b {{ display: grid; place-items: center; font: 800 15px var(--uv-font); color: #fff; background: linear-gradient(90deg, #0004 0 6px, transparent 9px), {GRAD}; box-shadow: 8px 10px 20px -8px #0008; transform-origin: 0 50%; transition: transform .6s; }} .X:hover > b {{ transform: rotateY(-38deg); }}",
     '<div class="X"><i></i><b>VAULT</b></div>'),
    ("fold", "Paper fold", f".X {{ position: relative; width: 160px; height: 120px; perspective: 700px; }} .X > i {{ position: absolute; left: 0; right: 0; height: 50%; {FACE} background: {S2}; border: 1px solid {L}; }} .X > i:first-child {{ top: 0; border-radius: 12px 12px 0 0; transform-origin: 50% 100%; transition: transform .7s cubic-bezier(.3, 1.2, .5, 1); background: {GRAD}; color: #fff; z-index: 1; backface-visibility: hidden; }} "
     ".X > i:last-child { bottom: 0; border-radius: 0 0 12px 12px; } .X:hover > i:first-child { transform: rotateX(-180deg); }", '<div class="X"><i>hover to open</i><i>surprise</i></div>'),
    ("crawl", "Space crawl", f".X {{ width: 220px; height: 130px; overflow: hidden; perspective: 260px; -webkit-mask: linear-gradient(transparent, #000 45%); mask: linear-gradient(transparent, #000 45%); }} .X p {{ margin: 0; text-align: center; font: 800 15px/1.4 var(--uv-font); color: {A}; transform-origin: 50% 100%; animation: uv-x-crawl 14s linear infinite; }}",
     '<div class="X"><p>A long time ago, in a library far, far away, every interface was one attribute away. The vault opened.</p></div>'),
    ("wave-grid", "Wave grid", f".X {{ display: grid; grid-template-columns: repeat(7, 14px); gap: 10px; transform: perspective(500px) rotateX(58deg) rotateZ(35deg); transform-style: preserve-3d; }} .X i {{ width: 14px; height: 14px; border-radius: 3px; background: {A}; box-shadow: 0 0 8px {mixa(A, 60)}; animation: uv-x-wave3d 1.8s ease-in-out infinite; animation-delay: calc((var(--x) + var(--y)) * -.12s); }}",
     '<div class="X">' + "".join(f'<i style="--x:{i % 7};--y:{i // 7}"></i>' for i in range(49)) + "</div>"),
    ("tunnel", "Square tunnel", f".X {{ position: relative; width: 150px; height: 110px; perspective: 300px; overflow: hidden; border-radius: 10px; background: {BG}; }} .X i {{ position: absolute; inset: 20px 35px; border: 2px solid {A}; border-radius: 6px; animation: uv-x-tunnel 3s linear infinite; animation-delay: calc(var(--i) * -.5s); }} .X i:nth-child(even) {{ border-color: {A2}; }}", RING(6).replace("<div></div>", "")),
    ("fan", "Card fan", f".X {{ position: relative; width: 170px; height: 120px; }} .X i {{ position: absolute; left: calc(50% - 30px); bottom: 6px; width: 60px; height: 86px; border-radius: 8px; border: 1px solid #ffffff55; background: {GRAD}; transform-origin: 50% 120%; transition: transform .5s cubic-bezier(.3, 1.4, .5, 1); box-shadow: 0 6px 14px -6px #0007; transform: rotate(calc((var(--i) - 2) * 4deg)); }} "
     ".X:hover i { transform: rotate(calc((var(--i) - 2) * 18deg)); } .X i:nth-child(odd) { filter: brightness(.85); }", RING(5).replace("<div>", "").replace("</div></div>", "</div>")),
    ("stack", "Glass stack", f".X {{ position: relative; width: 150px; height: 110px; }} .X i {{ position: absolute; inset: 0; border-radius: 14px; border: 1px solid #ffffff40; background: {mixa(A, 22)}; backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px); transition: transform .5s cubic-bezier(.3, 1.3, .5, 1); transform: translate(calc(var(--i) * 6px), calc(var(--i) * -6px)); }} "
     ".X:hover i { transform: translate(calc(var(--i) * 22px), calc(var(--i) * -14px)) rotate(calc(var(--i) * 4deg)); }", RING(4).replace("<div>", "").replace("</div></div>", "</div>")),
    ("float", "Floating card", f".X {{ position: relative; width: 150px; height: 96px; border-radius: 14px; {FACE} background: {S2}; border: 1px solid {L}; animation: uv-x-levitate 3s ease-in-out infinite; }} .X::after {{ content: \"\"; position: absolute; left: 12%; right: 12%; bottom: -30px; height: 12px; border-radius: 50%; background: radial-gradient(closest-side, #0007, transparent); animation: uv-x-levshadow 3s ease-in-out infinite; }}",
     '<div class="X">floating</div>'),
    ("holo-card", "Holo card", f".X {{ position: relative; width: 120px; height: 160px; border-radius: 12px; overflow: hidden; background: {S2}; border: 1px solid {L}; transform: perspective(600px); transition: transform .5s; {FACE} }} "
     f".X::after {{ content: \"\"; position: absolute; inset: 0; background: linear-gradient(115deg, transparent 25%, #ff9ae688 38%, #9ad3ff88 46%, #b8ff9a88 54%, #fff59a88 62%, transparent 75%) 100% 0 / 260% 100%; mix-blend-mode: color-dodge; transition: background-position .8s; }} "
     ".X:hover { transform: perspective(600px) rotateY(-18deg) rotateX(8deg); } .X:hover::after { background-position: 0 0; }", '<div class="X">RARE</div>'),
    ("split", "Split reveal", f".X {{ position: relative; width: 170px; height: 110px; border-radius: 14px; perspective: 600px; {FACE} background: {mixa(A, 20)}; }} .X i {{ position: absolute; top: 0; bottom: 0; width: 50%; background: {S3}; border: 1px solid {L}; transition: transform .6s cubic-bezier(.3, 1.2, .5, 1); }} "
     ".X i:first-of-type { left: 0; border-radius: 14px 0 0 14px; transform-origin: 0 50%; } .X i:last-of-type { right: 0; border-radius: 0 14px 14px 0; transform-origin: 100% 50%; } .X:hover i:first-of-type { transform: rotateY(-75deg); } .X:hover i:last-of-type { transform: rotateY(75deg); }",
     '<div class="X">hello<i></i><i></i></div>'),
    ("room", "Isometric room", f".X {{ position: relative; width: 120px; height: 120px; transform: rotateX(60deg) rotateZ(-45deg); transform-style: preserve-3d; margin: 10px; }} .X i {{ position: absolute; inset: 0; }} .X i:nth-child(1) {{ background: repeating-conic-gradient({S3} 0 25%, {S2} 0 50%) 0 0 / 30px 30px; }} "
     f".X i:nth-child(2) {{ background: {mixa(A, 45)}; transform-origin: 0 0; transform: rotateX(-90deg); height: 70px; }} .X i:nth-child(3) {{ background: {mixa(A2, 45)}; transform-origin: 0 0; transform: rotateY(90deg); width: 70px; }} .X i:nth-child(4) {{ inset: 40px; background: {GRAD}; transform: translateZ(20px); box-shadow: 0 0 20px {A}; }}",
     '<div class="X"><i></i><i></i><i></i><i></i></div>'),
    ("sway", "3D sway", f".X {{ width: 120px; height: 120px; border-radius: 18px; {FACE} color: #fff; background: {GRAD}; animation: uv-x-sway3d 4s ease-in-out infinite; box-shadow: 0 20px 30px -16px #0008; }}", '<div class="X">sway</div>'),
    ("press", "Deep press", f".X {{ width: 140px; padding: 16px 0; border: 0; border-radius: 14px; font: 700 15px var(--uv-font); color: #fff; background: {A}; cursor: pointer; transform: translateY(-8px); box-shadow: 0 8px 0 color-mix(in srgb, {A} 55%, #000), 0 14px 18px -6px #0008; transition: transform .12s, box-shadow .12s; }} "
     f".X:hover {{ transform: translateY(-10px); box-shadow: 0 10px 0 color-mix(in srgb, {A} 55%, #000), 0 18px 22px -6px #0008; }} .X:active {{ transform: translateY(0); box-shadow: 0 0 0 color-mix(in srgb, {A} 55%, #000), 0 2px 4px #0006; }}", '<button class="X" type="button">Press</button>'),
    ("extrude-text", "Extruded type", f".X {{ margin: 0; font: 900 46px/1 var(--uv-font); color: {A}; letter-spacing: -.02em; text-shadow: " + ", ".join(f"{i}px {i}px 0 color-mix(in srgb, {A} {100 - i * 7}%, #000)" for i in range(1, 9)) + ", 10px 14px 18px #0007; transition: transform .4s; }} .X:hover {{ transform: translate(-3px, -3px); }}",
     '<h2 class="X">3D</h2>'),
    ("perspective-text", "Floor text", f".X {{ margin: 0; font: 900 40px/1 var(--uv-font); color: {T}; transform: perspective(300px) rotateX(38deg); text-shadow: 0 18px 14px #0006; letter-spacing: .04em; }}", '<h2 class="X">VAULT</h2>'),
]

# ── Motion (looping and hover animations, one class each) ────────────────────
BLOCK = f'<div class="X" style="width:84px;height:84px;border-radius:18px;background:{GRAD}"></div>'
MOTION = [
    ("float", "Float", ".X { animation: uv-x-float 3s ease-in-out infinite; }"),
    ("bob", "Bob", ".X { animation: uv-x-bob 2.4s ease-in-out infinite; }"),
    ("breathe", "Breathe", ".X { animation: uv-x-breathe 3.2s ease-in-out infinite; }"),
    ("glow-pulse", "Glow pulse", ".X { animation: uv-x-glowpulse 2.4s ease-in-out infinite; }"),
    ("pulse-ring", "Pulse ring", ".X { animation: uv-x-pulse-ring 1.6s cubic-bezier(.2, .7, .3, 1) infinite; }"),
    ("ping", "Ping", ".X { position: relative; } .X::after { content: \"\"; position: absolute; inset: 0; border-radius: inherit; border: 2px solid var(--uv-accent); animation: uv-x-ping 1.6s cubic-bezier(0, 0, .2, 1) infinite; }"),
    ("ripple", "Ripples", ".X { position: relative; } .X::before, .X::after { content: \"\"; position: absolute; inset: 0; border-radius: 50%; border: 2px solid var(--uv-accent); animation: uv-x-ripple 2.4s ease-out infinite; } .X::after { animation-delay: 1.2s; }"),
    ("wiggle", "Wiggle", ".X { animation: uv-x-wiggle 1.4s ease-in-out infinite; }"),
    ("jello", "Jello", ".X { animation: uv-x-jello 1.6s ease-in-out infinite; }"),
    ("rubber", "Rubber band", ".X { animation: uv-x-rubber 1.8s ease-in-out infinite; }"),
    ("heartbeat", "Heartbeat", ".X { animation: uv-x-heart 1.4s ease-in-out infinite; }"),
    ("tada", "Tada", ".X { animation: uv-x-tada 2s ease-in-out infinite; }"),
    ("swing", "Swing", ".X { transform-origin: 50% 0; animation: uv-x-swing 2s ease-in-out infinite; }"),
    ("pendulum", "Pendulum", ".X { transform-origin: 50% -40%; animation: uv-x-pendulum 2.2s ease-in-out infinite; }"),
    ("spin", "Slow spin", ".X { animation: uv-x-spin 8s linear infinite; }"),
    ("spin-y", "3D spin", ".X { animation: uv-x-spiny 4s linear infinite; }"),
    ("flip-x", "Flip loop", ".X { animation: uv-x-flipx 3.2s cubic-bezier(.6, 0, .3, 1) infinite; }"),
    ("stretch", "Stretch", ".X { animation: uv-x-stretch 1.6s ease-in-out infinite; }"),
    ("morph", "Blob morph", ".X { animation: uv-x-morph 8s ease-in-out infinite; }"),
    ("flicker", "Neon flicker", ".X { animation: uv-x-flicker 3s linear infinite; }"),
    ("glitch", "Glitch jump", ".X { animation: uv-x-glitchy 2.5s steps(1) infinite; }"),
    ("hue", "Hue cycle", ".X { animation: uv-x-hue 6s linear infinite; }"),
    ("flow", "Flowing gradient", f".X {{ background: linear-gradient(120deg, {A}, {A2}, {A}) 0 50% / 300% 300% !important; animation: uv-x-flowbg 5s ease infinite; }}"),
    ("shine", "Shine sweep", ".X { position: relative; overflow: hidden; } .X::after { content: \"\"; position: absolute; top: 0; bottom: 0; width: 40%; background: linear-gradient(90deg, transparent, #ffffff80, transparent); animation: uv-x-sweep 2.8s ease-in-out infinite; }"),
    ("shadow-walk", "Shadow walk", ".X { animation: uv-x-shadowwalk 3s steps(4) infinite; }"),
    ("orbit-dot", "Orbiting dot", ".X { position: relative; } .X::after { content: \"\"; position: absolute; left: calc(50% - 7px); top: calc(50% - 7px); width: 14px; height: 14px; border-radius: 50%; background: var(--uv-text); box-shadow: 0 0 10px var(--uv-accent); animation: uv-x-orbitdot 3s linear infinite; }"),
    ("caret", "Blinking caret", ".X::after { content: \"\"; display: inline-block; width: .08em; height: 1em; margin-left: .12em; vertical-align: -.12em; background: currentColor; animation: uv-x-caret 1s steps(1) infinite; }",
     f'<h2 class="X" style="margin:0;font:700 30px var(--uv-mono);color:{T}">typing</h2>'),
    ("levitate", "Levitate", ".X { position: relative; animation: uv-x-levitate 3s ease-in-out infinite; } .X::after { content: \"\"; position: absolute; left: 10%; right: 10%; bottom: -24px; height: 10px; border-radius: 50%; background: radial-gradient(closest-side, #0008, transparent); animation: uv-x-levshadow 3s ease-in-out infinite; }"),
    ("hover-lift", "Hover lift", ".X { transition: transform .35s cubic-bezier(.3, 1.5, .5, 1), box-shadow .35s; } .X:hover { transform: translateY(-8px) scale(1.03); box-shadow: 0 22px 30px -16px #0009; }"),
    ("hover-tilt", "Hover tilt", ".X { transition: transform .5s cubic-bezier(.3, 1.4, .5, 1); } .X:hover { transform: perspective(500px) rotateX(16deg) rotateY(-20deg); }"),
    ("hover-spin", "Hover spin", ".X { transition: transform .8s cubic-bezier(.5, 0, .2, 1); } .X:hover { transform: rotate(360deg) scale(1.08); }"),
    ("hover-squish", "Hover squish", ".X:hover { animation: uv-x-rubber .8s ease-in-out; }"),
]

# ── Animated & decorative borders ───────────────────────────────────────────
BOX = f'<div class="X" style="width:80%;height:92px;display:grid;place-items:center;font:600 13px var(--uv-font);color:{M}">border</div>'
RINGMASK = "-webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);"
def ring(bg, w=2, extra=""):
    return f".X {{ position: relative; border-radius: 14px; }} .X::before {{ content: \"\"; position: absolute; inset: 0; padding: {w}px; border-radius: inherit; background: {bg}; {RINGMASK} pointer-events: none; {extra} }}"
BORDERS = [
    ("spin", "Spinning gradient", ring(f"conic-gradient(from var(--uv-x-a), {A}, {A2}, {A})", 2, "animation: uv-x-a 4s linear infinite;")),
    ("comet", "Comet", ring(f"conic-gradient(from var(--uv-x-a), transparent 0 70%, {A} 95%, #fff 100%)", 2, "animation: uv-x-a 2.6s linear infinite;")),
    ("twin-comet", "Twin comets", ring(f"conic-gradient(from var(--uv-x-a), transparent 0 30%, {A} 48%, transparent 50% 80%, {A2} 98%, transparent)", 2, "animation: uv-x-a 3s linear infinite;")),
    ("rainbow", "Rainbow", ring("conic-gradient(from var(--uv-x-a), #ff4d4d, #ffb84d, #f5f54d, #4dff88, #4dc3ff, #9a4dff, #ff4d4d)", 3, "animation: uv-x-a 5s linear infinite;")),
    ("gradient", "Gradient", ring(GRAD, 2)),
    ("glow", "Glow", ring(f"conic-gradient(from var(--uv-x-a), {A}, {A2}, {A})", 2, "animation: uv-x-a 4s linear infinite;") + f" .X {{ box-shadow: 0 0 22px -4px {A}, 0 0 46px -12px {A2}; }}"),
    ("march", "Marching ants", f".X {{ border-radius: 2px; background: linear-gradient(90deg, {A} 50%, transparent 0) repeat-x 0 0 / 16px 2px, linear-gradient(90deg, {A} 50%, transparent 0) repeat-x 0 100% / 16px 2px, linear-gradient(0deg, {A} 50%, transparent 0) repeat-y 0 0 / 2px 16px, linear-gradient(0deg, {A} 50%, transparent 0) repeat-y 100% 0 / 2px 16px; animation: uv-x-march .8s linear infinite; }}"),
    ("corners", "Corner brackets", f".X {{ --c: {A}; background: linear-gradient(var(--c), var(--c)) 0 0 / 18px 2px, linear-gradient(var(--c), var(--c)) 0 0 / 2px 18px, linear-gradient(var(--c), var(--c)) 100% 0 / 18px 2px, linear-gradient(var(--c), var(--c)) 100% 0 / 2px 18px, linear-gradient(var(--c), var(--c)) 0 100% / 18px 2px, linear-gradient(var(--c), var(--c)) 0 100% / 2px 18px, linear-gradient(var(--c), var(--c)) 100% 100% / 18px 2px, linear-gradient(var(--c), var(--c)) 100% 100% / 2px 18px; background-repeat: no-repeat; transition: background-size .35s; }} "
     ".X:hover { background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%, 100% 2px, 2px 100%, 100% 2px, 2px 100%; }"),
    ("draw", "Draw on hover", f".X {{ background: linear-gradient({A}, {A}) 0 0 / 0 2px no-repeat, linear-gradient({A}, {A}) 100% 0 / 2px 0 no-repeat, linear-gradient({A}, {A}) 100% 100% / 0 2px no-repeat, linear-gradient({A}, {A}) 0 100% / 2px 0 no-repeat; box-shadow: inset 0 0 0 1px {L}; transition: background-size .25s linear; }} "
     ".X:hover { background-size: 100% 2px, 2px 100%, 100% 2px, 2px 100%; }"),
    ("neon", "Neon tube", f".X {{ border: 2px solid {A}; border-radius: 14px; box-shadow: 0 0 10px {A}, inset 0 0 10px {mixa(A, 60)}; animation: uv-x-flicker 4s linear infinite; }}"),
    ("pulse", "Pulse", f".X {{ border: 2px solid {A}; border-radius: 14px; animation: uv-x-pulse-ring 1.8s cubic-bezier(.2, .7, .3, 1) infinite; }}"),
    ("cycle", "Colour cycle", f".X {{ border: 2px solid {A}; border-radius: 14px; animation: uv-x-colorcycle 3s ease-in-out infinite; }}"),
    ("double", "Offset double", f".X {{ border: 2px solid {T}; border-radius: 4px; outline: 2px solid {A}; outline-offset: 6px; transition: outline-offset .3s; }} .X:hover {{ outline-offset: 2px; }}"),
    ("shadow-frame", "Hard shadow frame", f".X {{ border: 2px solid {T}; border-radius: 6px; box-shadow: 6px 6px 0 {A}, 6px 6px 0 2px {T}; transition: box-shadow .2s, transform .2s; }} .X:hover {{ transform: translate(3px, 3px); box-shadow: 3px 3px 0 {A}, 3px 3px 0 2px {T}; }}"),
    ("stitched", "Stitched", f".X {{ border-radius: 14px; background: {mixa(A, 12)}; outline: 2px dashed {mixa(A, 70)}; outline-offset: -8px; box-shadow: 0 0 0 4px {mixa(A, 25)}; }}"),
    ("sketch", "Hand-drawn", f".X {{ border: 2px solid {T}; border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px; transition: border-radius .5s; }} .X:hover {{ border-radius: 15px 225px 15px 255px / 255px 15px 225px 15px; }}"),
    ("notched", "Notched", f".X {{ position: relative; isolation: isolate; clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px); background: {A}; }} .X::after {{ content: \"\"; position: absolute; inset: 2px; z-index: -1; background: {S}; clip-path: polygon(13px 0, 100% 0, 100% calc(100% - 13px), calc(100% - 13px) 100%, 0 100%, 0 13px); }}"),
    ("pixel", "Pixel", f".X {{ border-radius: 0; box-shadow: 0 -4px 0 0 {T}, 0 4px 0 0 {T}, -4px 0 0 0 {T}, 4px 0 0 0 {T}, inset 0 -4px 0 0 {mixa(A, 60)}; margin: 4px; }}"),
    ("gold", "Gold frame", f".X {{ position: relative; border-radius: 6px; }} .X::before {{ content: \"\"; position: absolute; inset: 0; padding: 5px; border-radius: inherit; background: linear-gradient(180deg, #fff3c4, #e6c25a 40%, #9a6f12 52%, #d8b04a 66%, #fff0b8); {RINGMASK} box-shadow: 0 4px 10px #0005; }}"),
    ("chrome", "Chrome bezel", f".X {{ position: relative; border-radius: 16px; }} .X::before {{ content: \"\"; position: absolute; inset: 0; padding: 4px; border-radius: inherit; background: linear-gradient(180deg, #ffffff, #dfe3ea 40%, #8a919c 50%, #c9ced6 62%, #f4f6f9); {RINGMASK} }}"),
    ("glass-edge", "Glass edge", f".X {{ border-radius: 18px; border: 1px solid #ffffff40; background: linear-gradient(160deg, #ffffff1f, #ffffff05); box-shadow: inset 0 1px 1px #ffffff80, inset 0 -1px 1px #ffffff20, 0 16px 30px -18px #0009; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }}"),
    ("aurora-edge", "Aurora edge", ring(f"linear-gradient(90deg, {A}, {A2}, {A}) 0 0 / 200% 100%", 2, "animation: uv-x-flowbg 4s ease infinite;") + f" .X {{ box-shadow: 0 0 40px -12px {A}; }}"),
    ("dots", "Dotted rule", f".X {{ border-radius: 14px; background: radial-gradient(circle, {A} 1.5px, transparent 2px) 0 0 / 10px 10px repeat-x, radial-gradient(circle, {A} 1.5px, transparent 2px) 0 100% / 10px 10px repeat-x, radial-gradient(circle, {A} 1.5px, transparent 2px) 0 0 / 10px 10px repeat-y, radial-gradient(circle, {A} 1.5px, transparent 2px) 100% 0 / 10px 10px repeat-y; }}"),
    ("ticket", "Ticket edge", f".X {{ background: {S2}; -webkit-mask: radial-gradient(circle 6px at 0 50%, #0000 96%, #000) left / 51% 100% no-repeat, radial-gradient(circle 6px at 100% 50%, #0000 96%, #000) right / 51% 100% no-repeat; mask: radial-gradient(circle 6px at 0 50%, #0000 96%, #000) left / 51% 100% no-repeat, radial-gradient(circle 6px at 100% 50%, #0000 96%, #000) right / 51% 100% no-repeat; border-radius: 8px; }}"),
    ("zigzag", "Zigzag edge", f".X {{ background: {S2}; -webkit-mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 16px 100%; mask: conic-gradient(from -45deg at bottom, #0000, #000 1deg 89deg, #0000 90deg) 50% / 16px 100%; }}"),
]


def defs():
    """(key, label, prefix, desc, items, sample, wide) for collections_specs.collections()."""
    return [
        ("depth", "3D & depth", "depth", "Pure-CSS 3D: flip cards, spinning cubes, carousels, prisms, coins, orbits, exploded layers, isometric tiles, folds and more. Hover the previews. class=\"uv-depth-NAME\" with the markup shown.", DEPTH, None, True),
        ("motion", "CSS motion", "an", "Looping and hover animations you add with one class: float, breathe, jello, heartbeat, 3D spin, blob morph, neon flicker, shine sweep… class=\"uv-an-NAME\".", MOTION, BLOCK, False),
        ("borders", "Animated borders", "bd", "Borders that spin, glow, march, draw themselves or frame like gold and chrome. class=\"uv-bd-NAME\" on any box.", BORDERS, BOX, False),
    ]
