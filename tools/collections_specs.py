"""UI Vault collections — big libraries of ready-made pieces, each one a single class:
gradients (.uv-g-*), patterns (.uv-p-*), loaders (.uv-l-*), text effects (.uv-t-*), shadows (.uv-sh-*),
image hovers (.uv-hv-*), dividers (.uv-dv-*), tooltip styles (.uv-tip-*), charts (.uv-ch-*) and icons (inline SVG).

Each item: (name, label, css, sample_html). In css and html, `.X` is the item's class (expanded by build).
Theme tokens (var(--uv-accent) …) keep every piece in step with the active theme.
"""
import math, re
import collections_more

A, A2, T, BG, S, S2, S3, L, M = ("var(--uv-accent)", "var(--uv-accent-2)", "var(--uv-text)", "var(--uv-bg)", "var(--uv-surface)",
                                "var(--uv-surface-2)", "var(--uv-surface-3)", "var(--uv-line-2)", "var(--uv-muted)")
mixa = lambda c, p: f"color-mix(in srgb, {c} {p}%, transparent)"

# ── Gradients ────────────────────────────────────────────────────────────────
PALETTES = [
    ("sunset", ["#ff512f", "#f09819", "#ffd86f"]), ("ocean", ["#2e3192", "#1bffff"]), ("aurora", ["#00c9a7", "#845ec2", "#ff6f91"]),
    ("peach", ["#ffecd2", "#fcb69f"]), ("lagoon", ["#43cea2", "#185a9d"]), ("berry", ["#8e2de2", "#4a00e0"]), ("citrus", ["#f7971e", "#ffd200"]),
    ("mint", ["#d4fc79", "#96e6a1"]), ("candy", ["#ff9a9e", "#fecfef", "#a18cd1"]), ("ember", ["#ff416c", "#ff4b2b"]), ("deep-space", ["#000428", "#004e92"]),
    ("lavender", ["#e0c3fc", "#8ec5fc"]), ("coral", ["#ff7e5f", "#feb47b"]), ("forest", ["#134e5e", "#71b280"]), ("royal", ["#141e30", "#243b55"]),
    ("flamingo", ["#ee9ca7", "#ffdde1"]), ("neon-dream", ["#f72585", "#7209b7", "#3a0ca3", "#4cc9f0"]), ("gold-rush", ["#f9d423", "#ff4e50"]),
    ("arctic", ["#e0eafc", "#cfdef3"]), ("cosmic", ["#ff00cc", "#333399"]), ("lime-punch", ["#a8ff78", "#78ffd6"]), ("velvet", ["#3a1c71", "#d76d77", "#ffaf7b"]),
    ("steel", ["#bdc3c7", "#2c3e50"]), ("mango", ["#ffe259", "#ffa751"]), ("rose-gold", ["#b76e79", "#e8c4a0", "#f6e0c8"]), ("sky", ["#56ccf2", "#2f80ed"]),
    ("toxic", ["#bff098", "#6fd6ff"]), ("dusk", ["#2c3e50", "#fd746c"]), ("plum", ["#614385", "#516395"]), ("tropic", ["#00f260", "#0575e6"]),
    ("fire", ["#f12711", "#f5af19"]), ("blush", ["#ffafbd", "#ffc3a0"]), ("midnight-city", ["#232526", "#414345"]), ("sea-glass", ["#a1ffce", "#faffd1"]),
    ("vapor", ["#ff6ad5", "#c774e8", "#ad8cff", "#8795e8", "#94d0ff"]), ("printstream", ["#ffffff", "#e9e1f7", "#d6efff", "#fff1d6"]),
    ("deep-metal", ["#a9cbff", "#3f74dc", "#0a2560", "#1d4cad", "#86b4ff"]), ("chrome", ["#ffffff", "#dfe3ea", "#8a919c", "#c9ced6", "#f4f6f9"]),
    ("gold-leaf", ["#fff3c4", "#e6c25a", "#9a6f12", "#d8b04a"]), ("holo", ["#ff9ae6", "#9ad3ff", "#b8ff9a", "#fff59a"]),
]
GRADIENTS = []
for name, cols in PALETTES:
    st = ", ".join(cols)
    GRADIENTS.append((f"{name}", name.replace("-", " ").title(), f".X {{ background: linear-gradient(135deg, {st}); }}"))
    GRADIENTS.append((f"{name}-glow", name.replace("-", " ").title() + " glow",
                      f".X {{ background: radial-gradient(120% 90% at 20% 10%, {cols[0]} 0%, transparent 55%), radial-gradient(100% 90% at 90% 100%, {cols[-1]} 0%, transparent 60%), {cols[len(cols) // 2] if len(cols) > 2 else '#0b0b10'}; }}"))
    GRADIENTS.append((f"{name}-conic", name.replace("-", " ").title() + " conic", f".X {{ background: conic-gradient(from 200deg at 60% 40%, {st}, {cols[0]}); }}"))
GRAD_SAMPLE = '<div class="X" style="width:100%;height:120px;border-radius:12px"></div>'
GRADIENTS += [
    ("theme", "Theme accent", f".X {{ background: linear-gradient(135deg, {A}, {A2}); }}"),
    ("theme-mesh", "Theme mesh", f".X {{ background: radial-gradient(at 15% 15%, {mixa(A, 60)} 0, transparent 50%), radial-gradient(at 85% 20%, {mixa(A2, 55)} 0, transparent 50%), radial-gradient(at 50% 100%, {mixa(A, 40)} 0, transparent 60%), {S}; }}"),
    ("animated", "Animated flow", ".X { background: linear-gradient(120deg, #ff6ad5, #8795e8, #94d0ff, #ff6ad5) 0 0 / 300% 300%; animation: uv-c-flow 8s ease infinite; }"),
]

# ── Patterns ─────────────────────────────────────────────────────────────────
def pat(name, label, bg, extra=""):
    return [(name, label, f".X {{ background: {bg.format(c=mixa(A, 35), d=A)}, {S}; {extra} }}"),
            (name + "-ink", label + " (ink)", f".X {{ background: {bg.format(c=mixa(T, 18), d=T)}, {BG}; {extra} }}")]
PATTERNS = []
for args in [
    ("dots", "Dots", "radial-gradient({c} 1.5px, transparent 1.6px) 0 0 / 16px 16px"),
    ("dots-offset", "Offset dots", "radial-gradient({c} 1.5px, transparent 1.6px) 0 0 / 20px 20px, radial-gradient({c} 1.5px, transparent 1.6px) 10px 10px / 20px 20px"),
    ("grid", "Grid", "linear-gradient({c} 1px, transparent 1px) 0 0 / 24px 24px, linear-gradient(90deg, {c} 1px, transparent 1px) 0 0 / 24px 24px"),
    ("graph", "Graph paper", "linear-gradient({c} 1px, transparent 1px) 0 0 / 100px 100px, linear-gradient(90deg, {c} 1px, transparent 1px) 0 0 / 100px 100px, linear-gradient({c} .5px, transparent .5px) 0 0 / 20px 20px, linear-gradient(90deg, {c} .5px, transparent .5px) 0 0 / 20px 20px"),
    ("lines", "Horizontal lines", "repeating-linear-gradient(0deg, {c} 0 1px, transparent 1px 12px)"),
    ("vlines", "Vertical lines", "repeating-linear-gradient(90deg, {c} 0 1px, transparent 1px 12px)"),
    ("diagonal", "Diagonal", "repeating-linear-gradient(45deg, {c} 0 2px, transparent 2px 12px)"),
    ("crosshatch", "Crosshatch", "repeating-linear-gradient(45deg, {c} 0 1px, transparent 1px 10px), repeating-linear-gradient(-45deg, {c} 0 1px, transparent 1px 10px)"),
    ("checker", "Checkerboard", "conic-gradient({c} 25%, transparent 0 50%, {c} 0 75%, transparent 0) 0 0 / 24px 24px"),
    ("zigzag", "Zigzag", "linear-gradient(135deg, {c} 25%, transparent 25%) -12px 0 / 24px 24px, linear-gradient(225deg, {c} 25%, transparent 25%) -12px 0 / 24px 24px, linear-gradient(315deg, {c} 25%, transparent 25%) 0 0 / 24px 24px, linear-gradient(45deg, {c} 25%, transparent 25%) 0 0 / 24px 24px"),
    ("triangles", "Triangles", "linear-gradient(60deg, {c} 25%, transparent 25.5%, transparent 75%, {c} 75%) 0 0 / 28px 48px, linear-gradient(120deg, {c} 25%, transparent 25.5%, transparent 75%, {c} 75%) 0 0 / 28px 48px"),
    ("waves", "Waves", "radial-gradient(circle at 50% 100%, transparent 9px, {c} 10px 11px, transparent 12px) 0 0 / 24px 12px"),
    ("circles", "Rings", "radial-gradient(circle, transparent 6px, {c} 7px 8px, transparent 9px) 0 0 / 24px 24px"),
    ("plus", "Plus signs", "linear-gradient({c} 0 0) 50% 50% / 2px 10px no-repeat, linear-gradient({c} 0 0) 50% 50% / 10px 2px no-repeat"),
    ("diamonds", "Diamonds", "linear-gradient(45deg, {c} 25%, transparent 25%, transparent 75%, {c} 75%) 0 0 / 20px 20px, linear-gradient(45deg, {c} 25%, transparent 25%, transparent 75%, {c} 75%) 10px 10px / 20px 20px"),
    ("bricks", "Bricks", "linear-gradient({c} 1px, transparent 1px) 0 0 / 40px 20px, linear-gradient(90deg, {c} 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, {c} 1px, transparent 1px) 20px 20px / 40px 40px"),
    ("stripes-wide", "Wide stripes", "repeating-linear-gradient(-45deg, {c} 0 14px, transparent 14px 28px)"),
    ("halftone", "Halftone", "radial-gradient({c} 30%, transparent 32%) 0 0 / 12px 12px"),
    ("scales", "Scales", "radial-gradient(circle at 100% 150%, transparent 24%, {c} 25% 28%, transparent 29%) 0 0 / 24px 24px, radial-gradient(circle at 0 150%, transparent 24%, {c} 25% 28%, transparent 29%) 0 0 / 24px 24px"),
    ("blueprint", "Blueprint", "linear-gradient({c} 2px, transparent 2px) -2px -2px / 100px 100px, linear-gradient(90deg, {c} 2px, transparent 2px) -2px -2px / 100px 100px, linear-gradient({c} 1px, transparent 1px) -1px -1px / 20px 20px, linear-gradient(90deg, {c} 1px, transparent 1px) -1px -1px / 20px 20px"),
    ("isometric", "Isometric", "linear-gradient(30deg, {c} 12%, transparent 12.5%, transparent 87%, {c} 87.5%) 0 0 / 40px 70px, linear-gradient(150deg, {c} 12%, transparent 12.5%, transparent 87%, {c} 87.5%) 0 0 / 40px 70px, linear-gradient(30deg, {c} 12%, transparent 12.5%, transparent 87%, {c} 87.5%) 20px 35px / 40px 70px, linear-gradient(150deg, {c} 12%, transparent 12.5%, transparent 87%, {c} 87.5%) 20px 35px / 40px 70px"),
    ("pinstripe", "Pinstripe", "repeating-linear-gradient(90deg, transparent 0 18px, {c} 18px 19px)"),
    ("tartan", "Tartan", "repeating-linear-gradient(0deg, {c} 0 6px, transparent 6px 20px), repeating-linear-gradient(90deg, {c} 0 6px, transparent 6px 20px)"),
    ("noise", "Film grain", "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .18 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")"),
    ("sunburst", "Sunburst", "repeating-conic-gradient(from 0deg at 50% 100%, {c} 0 6deg, transparent 6deg 12deg)"),
    ("spotlight", "Spotlight", "radial-gradient(60% 50% at 50% 0%, {c}, transparent 70%)"),
    ("dashes", "Dashes", "linear-gradient(90deg, {c} 50%, transparent 0) 0 0 / 16px 8px"),
    ("cross-dots", "Cross dots", "radial-gradient({c} 1px, transparent 1.5px) 0 0 / 10px 10px, linear-gradient({c} 1px, transparent 1px) 0 0 / 40px 40px"),
    ("hex", "Honeycomb", "radial-gradient(circle farthest-side at 0% 50%, transparent 47%, {c} 48% 52%, transparent 53%) 0 0 / 28px 48px, radial-gradient(circle farthest-side at 100% 50%, transparent 47%, {c} 48% 52%, transparent 53%) 0 0 / 28px 48px"),
    ("rain", "Rain", "linear-gradient(transparent 70%, {c} 70%) 0 0 / 3px 18px"),
]:
    PATTERNS += pat(*args)
PAT_SAMPLE = '<div class="X" style="width:100%;height:120px;border-radius:12px;border:1px solid var(--uv-line)"></div>'

# ── Shadows ──────────────────────────────────────────────────────────────────
SHADOWS = []
for i in range(1, 9):
    y, b = i * i * .9 + 1, i * i * 2 + 2
    SHADOWS.append((f"e{i}", f"Elevation {i}", f".X {{ box-shadow: 0 {y:.0f}px {b:.0f}px -{i}px rgb(0 0 0 / {.08 + i * .03:.2f}), 0 1px 2px rgb(0 0 0 / .08); }}"))
for n, l, v in [("glow-accent", "Accent glow", f"0 0 0 1px {mixa(A, 40)}, 0 0 28px -4px {A}"), ("glow-accent-2", "Accent-2 glow", f"0 0 0 1px {mixa(A2, 40)}, 0 0 28px -4px {A2}"),
                ("neon", "Neon double", f"0 0 6px {A}, 0 0 18px {A}, 0 0 40px {mixa(A, 50)}"), ("halo", "Halo rings", f"0 0 0 4px {mixa(A, 25)}, 0 0 0 9px {mixa(A, 10)}"),
                ("hard", "Hard offset", f"6px 6px 0 {T}"), ("hard-accent", "Hard accent", f"6px 6px 0 {A}"), ("hard-stack", "Stacked", f"4px 4px 0 {A}, 8px 8px 0 {T}"),
                ("long", "Long shadow", ", ".join(f"{k}px {k}px 0 {mixa(T, max(4, 40 - k * 3))}" for k in range(1, 13))), ("layered", "Layered soft", "0 1px 1px #0000000f, 0 2px 2px #0000000f, 0 4px 4px #0000000f, 0 8px 8px #0000000f, 0 16px 16px #0000000f, 0 32px 32px #0000000f"),
                ("inner", "Inner", "inset 0 2px 10px #00000040"), ("inner-deep", "Inner deep", "inset 0 6px 20px #00000066"), ("pressed", "Pressed", "inset 0 3px 0 #00000033, inset 0 -1px 0 #ffffff20"),
                ("bevel", "Bevel", "inset 1px 1px 0 #ffffff60, inset -1px -1px 0 #00000040"), ("win98", "Win98 bevel", "inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf"),
                ("neumorph", "Neumorphic", f"8px 8px 18px color-mix(in srgb, {BG}, #000 22%), -8px -8px 18px color-mix(in srgb, {BG}, #fff 40%)"),
                ("neumorph-in", "Neumorphic inset", f"inset 6px 6px 12px color-mix(in srgb, {BG}, #000 22%), inset -6px -6px 12px color-mix(in srgb, {BG}, #fff 40%)"),
                ("lifted", "Lifted", "0 22px 40px -16px #00000080, 0 6px 12px -6px #00000040"), ("floating", "Floating", "0 40px 80px -30px #000000a0"),
                ("ambient", "Ambient", "0 0 60px -10px #00000060"), ("ring", "Ring", f"0 0 0 2px {T}"), ("ring-offset", "Offset ring", f"0 0 0 3px {BG}, 0 0 0 5px {A}"),
                ("sharp-bottom", "Sharp bottom", "0 4px 0 #00000040"), ("3d-key", "3D key", f"0 6px 0 color-mix(in srgb, {A}, #000 40%), 0 10px 18px -6px #000000a0"),
                ("rainbow", "Rainbow", "-4px -4px 14px #ff6ad5aa, 4px -4px 14px #94d0ffaa, 4px 4px 14px #b8ff9aaa, -4px 4px 14px #fff59aaa"),
                ("sunset", "Sunset glow", "0 10px 30px -8px #ff512fa0, 0 20px 50px -20px #f09819a0"), ("ice", "Ice glow", "0 0 0 1px #bfe6ff, 0 10px 30px -8px #2a8be0a0"),
                ("gold", "Gold glow", "0 0 0 1px #d8b04a, 0 12px 30px -10px #9a6f12"), ("paper", "Paper", "0 1px 1px #0001, 2px 3px 0 #0000001a, 4px 6px 10px -4px #0003"),
                ("curl", "Page curl", "0 15px 10px -10px #0000004d, 0 1px 4px #0000001a"), ("outline-glow", "Outline glow", f"inset 0 0 0 1px {mixa(A, 60)}, 0 0 20px -6px {A}"),
                ("dreamy", "Dreamy", "0 30px 60px -12px #3c8cff40, 0 18px 36px -18px #ff3cac50"), ("double-border", "Double border", f"0 0 0 2px {BG}, 0 0 0 4px {T}, 0 0 0 6px {BG}, 0 0 0 8px {T}")]:
    SHADOWS.append((n, l, f".X {{ box-shadow: {v}; }}"))
SH_SAMPLE = '<div class="X" style="width:70%;height:90px;border-radius:12px;background:var(--uv-surface);display:grid;place-items:center;font:500 13px var(--uv-mono);color:var(--uv-muted)">shadow</div>'

# ── Loaders (single element unless noted) ────────────────────────────────────
LOADERS = [
    ("spin", "Spin", ".X { width: 36px; height: 36px; border-radius: 50%; border: 4px solid var(--uv-line-2); border-top-color: var(--uv-accent); animation: uv-c-rot .8s linear infinite; }"),
    ("spin-duo", "Two-tone spin", ".X { width: 36px; height: 36px; border-radius: 50%; border: 4px solid transparent; border-top-color: var(--uv-accent); border-bottom-color: var(--uv-accent-2); animation: uv-c-rot 1s linear infinite; }"),
    ("spin-thin", "Thin arc", ".X { width: 40px; height: 40px; border-radius: 50%; border: 2px solid transparent; border-left-color: var(--uv-accent); animation: uv-c-rot .6s linear infinite; }"),
    ("arc-gradient", "Gradient arc", ".X { width: 40px; height: 40px; border-radius: 50%; background: conic-gradient(transparent 10%, var(--uv-accent)); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0); mask: radial-gradient(farthest-side, transparent calc(100% - 5px), #000 0); animation: uv-c-rot .9s linear infinite; }"),
    ("pulse-dot", "Pulse dot", ".X { width: 18px; height: 18px; border-radius: 50%; background: var(--uv-accent); box-shadow: 0 0 0 0 var(--uv-accent); animation: uv-c-ping 1.3s infinite; }"),
    ("breathe", "Breathe", ".X { width: 34px; height: 34px; border-radius: 50%; background: var(--uv-accent); animation: uv-c-breathe 1.2s ease-in-out infinite; }"),
    ("ripple", "Ripple rings", ".X { position: relative; width: 44px; height: 44px; } .X::before, .X::after { content: ''; position: absolute; inset: 0; border: 3px solid var(--uv-accent); border-radius: 50%; animation: uv-c-ripple 1.4s cubic-bezier(.2,.6,.3,1) infinite; } .X::after { animation-delay: -.7s; }"),
    ("dots3", "Three dots", ".X { width: 54px; height: 14px; background: radial-gradient(circle closest-side, var(--uv-accent) 90%, transparent) 0 50% / 33.3% 100% no-repeat, radial-gradient(circle closest-side, var(--uv-accent) 90%, transparent) 50% 50% / 33.3% 100% no-repeat, radial-gradient(circle closest-side, var(--uv-accent) 90%, transparent) 100% 50% / 33.3% 100% no-repeat; animation: uv-c-dots 1s steps(1) infinite; }"),
    ("bars", "Equaliser", ".X { width: 40px; height: 32px; background: linear-gradient(var(--uv-accent) 0 0) 0 100% / 20% 100% no-repeat, linear-gradient(var(--uv-accent) 0 0) 50% 100% / 20% 100% no-repeat, linear-gradient(var(--uv-accent) 0 0) 100% 100% / 20% 100% no-repeat; animation: uv-c-bars 1s infinite ease-in-out; }"),
    ("bar-slide", "Sliding bar", ".X { width: 120px; height: 6px; border-radius: 99px; background: linear-gradient(var(--uv-accent) 0 0) 0 0 / 30% 100% no-repeat, var(--uv-line-2); animation: uv-c-slide 1.2s ease-in-out infinite; }"),
    ("bar-stripes", "Striped bar", ".X { width: 140px; height: 12px; border-radius: 6px; background: repeating-linear-gradient(-45deg, var(--uv-accent) 0 8px, color-mix(in srgb, var(--uv-accent), #fff 30%) 8px 16px); background-size: 22.6px 100%; animation: uv-c-roll .6s linear infinite; }"),
    ("bar-fill", "Filling bar", ".X { width: 140px; height: 8px; border-radius: 99px; background: linear-gradient(var(--uv-accent) 0 0) 0 0 / 0 100% no-repeat, var(--uv-line-2); animation: uv-c-fill 1.6s ease-in-out infinite; }"),
    ("square-flip", "Flipping square", ".X { width: 30px; height: 30px; background: var(--uv-accent); animation: uv-c-flip 1.2s ease-in-out infinite; }"),
    ("square-spin", "Spinning square", ".X { width: 28px; height: 28px; border: 4px solid var(--uv-accent); animation: uv-c-sqspin 1.6s ease-in-out infinite; }"),
    ("orbit", "Orbit", ".X { position: relative; width: 44px; height: 44px; border-radius: 50%; border: 2px dashed var(--uv-line-2); animation: uv-c-rot 1.4s linear infinite; } .X::after { content: ''; position: absolute; top: -6px; left: 50%; width: 10px; height: 10px; margin-left: -5px; border-radius: 50%; background: var(--uv-accent); box-shadow: 0 0 10px var(--uv-accent); }"),
    ("atom", "Atom", ".X { position: relative; width: 48px; height: 48px; } .X::before, .X::after { content: ''; position: absolute; inset: 0; border: 2px solid var(--uv-accent); border-radius: 50%; transform: rotateX(70deg); animation: uv-c-rot 1s linear infinite; } .X::after { border-color: var(--uv-accent-2); transform: rotateY(70deg); animation-delay: -.5s; }"),
    ("clock", "Clock", ".X { position: relative; width: 40px; height: 40px; border-radius: 50%; border: 3px solid var(--uv-accent); } .X::before, .X::after { content: ''; position: absolute; left: 50%; bottom: 50%; width: 3px; margin-left: -1.5px; transform-origin: 50% 100%; background: var(--uv-accent); border-radius: 2px; } .X::before { height: 13px; animation: uv-c-rot 1s linear infinite; } .X::after { height: 9px; animation: uv-c-rot 6s linear infinite; }"),
    ("hourglass", "Hourglass", ".X { width: 0; height: 0; border: 16px solid; border-color: var(--uv-accent) transparent; animation: uv-c-hg 1.4s infinite ease-in-out; }"),
    ("heart", "Heart", ".X { width: 22px; height: 22px; background: var(--uv-danger); transform: rotate(45deg); position: relative; animation: uv-c-heart 1s infinite; } .X::before, .X::after { content: ''; position: absolute; width: 22px; height: 22px; border-radius: 50%; background: inherit; } .X::before { left: -11px; } .X::after { top: -11px; }"),
    ("bounce-ball", "Bouncing ball", ".X { width: 18px; height: 18px; border-radius: 50%; background: var(--uv-accent); animation: uv-c-bounce .6s cubic-bezier(.5,0,.5,1) infinite alternate; }"),
    ("typing", "Typing", ".X { width: 60px; height: 26px; border-radius: 13px; background: radial-gradient(circle closest-side, var(--uv-muted) 90%, transparent) 10px 50% / 10px 10px no-repeat, radial-gradient(circle closest-side, var(--uv-muted) 90%, transparent) 25px 50% / 10px 10px no-repeat, radial-gradient(circle closest-side, var(--uv-muted) 90%, transparent) 40px 50% / 10px 10px no-repeat, var(--uv-surface-2); animation: uv-c-typing 1.2s infinite; }"),
    ("half-moon", "Half moon", ".X { width: 36px; height: 36px; border-radius: 50%; background: linear-gradient(90deg, var(--uv-accent) 50%, transparent 50%); box-shadow: inset 0 0 0 2px var(--uv-accent); animation: uv-c-rot 1s linear infinite; }"),
    ("pie", "Pie", ".X { width: 36px; height: 36px; border-radius: 50%; background: conic-gradient(var(--uv-accent) var(--uv-c-p, 0%), var(--uv-line-2) 0); animation: uv-c-pie 1.8s linear infinite; }"),
    ("grid9", "Grid", ".X { width: 36px; height: 36px; background: conic-gradient(from 90deg at 2px 2px, transparent 90deg, var(--uv-accent) 0) 0 0 / calc((100% - 6px) / 3 + 2px) calc((100% - 6px) / 3 + 2px); animation: uv-c-blink 1s steps(2) infinite; }"),
    ("pixel", "Pixel chase", ".X { width: 32px; height: 32px; background: conic-gradient(var(--uv-accent) 0 25%, color-mix(in srgb, var(--uv-accent) 50%, transparent) 0 50%, color-mix(in srgb, var(--uv-accent) 25%, transparent) 0 75%, color-mix(in srgb, var(--uv-accent) 10%, transparent) 0); animation: uv-c-rot 1s steps(4) infinite; }"),
    ("dash-circle", "Dash circle", ".X { width: 40px; height: 40px; border-radius: 50%; border: 4px dotted var(--uv-accent); animation: uv-c-rot 2s linear infinite; }"),
    ("wave-bar", "Wave", ".X { width: 60px; height: 20px; background: radial-gradient(circle closest-side, var(--uv-accent) 90%, transparent) 0 50% / 20% 50% repeat-x; -webkit-mask: linear-gradient(90deg, #000 0 100%); animation: uv-c-wave 1s linear infinite; }"),
    ("neon-ring", "Neon ring", ".X { width: 40px; height: 40px; border-radius: 50%; border: 3px solid color-mix(in srgb, var(--uv-accent) 15%, transparent); border-top-color: var(--uv-accent); box-shadow: 0 0 14px -2px var(--uv-accent), inset 0 0 8px -3px var(--uv-accent); animation: uv-c-rot .7s linear infinite; }"),
    ("pearl-ring", "Pearl ring", ".X { width: 42px; height: 42px; border-radius: 50%; background: conic-gradient(#ffd9f3, #cdeeff, #e7ffdc, #fff2d6, #ffd9f3); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0); mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0); animation: uv-c-rot 1.4s linear infinite; }"),
    ("metal-ring", "Deep metal ring", ".X { width: 42px; height: 42px; border-radius: 50%; background: conic-gradient(#a9cbff, #3f74dc, #0a2560, #1d4cad, #86b4ff, #a9cbff); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0); mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 0); animation: uv-c-rot 1.1s linear infinite; }"),
    ("skeleton-line", "Skeleton line", ".X { width: 160px; height: 14px; border-radius: 6px; background: linear-gradient(90deg, var(--uv-surface-2) 25%, var(--uv-surface-3) 50%, var(--uv-surface-2) 75%) 0 0 / 200% 100%; animation: uv-c-shimmer 1.4s infinite; }"),
    ("skeleton-card", "Skeleton card", ".X { width: 170px; height: 90px; border-radius: 10px; background: linear-gradient(90deg, transparent 25%, #ffffff18 50%, transparent 75%) 0 0 / 200% 100%, radial-gradient(circle 14px at 22px 22px, var(--uv-surface-3) 98%, transparent), linear-gradient(var(--uv-surface-3) 0 0) 46px 14px / 90px 8px no-repeat, linear-gradient(var(--uv-surface-3) 0 0) 46px 28px / 60px 8px no-repeat, linear-gradient(var(--uv-surface-3) 0 0) 12px 54px / 140px 8px no-repeat, linear-gradient(var(--uv-surface-3) 0 0) 12px 68px / 110px 8px no-repeat, var(--uv-surface-2); animation: uv-c-shimmer 1.4s infinite; }"),
    ("text-loading", "Loading text", ".X { font: 700 16px var(--uv-mono); color: transparent; background: linear-gradient(90deg, var(--uv-muted) 40%, var(--uv-text) 50%, var(--uv-muted) 60%) 0 0 / 300% 100%; -webkit-background-clip: text; background-clip: text; animation: uv-c-shimmer 1.6s linear infinite; } .X::before { content: 'LOADING…'; }"),
    ("letters", "Letter bounce", ".X { font: 800 18px var(--uv-font); letter-spacing: .2em; color: var(--uv-accent); animation: uv-c-bounce-t 1s ease-in-out infinite alternate; } .X::before { content: 'WAIT'; }"),
    ("gear", "Gear", ".X { width: 40px; height: 40px; border-radius: 50%; background: radial-gradient(circle, var(--uv-bg) 30%, transparent 31%), repeating-conic-gradient(var(--uv-accent) 0 15deg, transparent 15deg 30deg); -webkit-mask: radial-gradient(circle, #000 64%, transparent 65%), repeating-conic-gradient(#000 0 15deg, transparent 15deg 30deg); -webkit-mask-composite: source-over; animation: uv-c-rot 2.4s linear infinite; }"),
    ("radar", "Radar", ".X { width: 46px; height: 46px; border-radius: 50%; border: 1px solid color-mix(in srgb, var(--uv-accent) 40%, transparent); background: conic-gradient(from 0deg, color-mix(in srgb, var(--uv-accent) 60%, transparent), transparent 30%), repeating-radial-gradient(circle, transparent 0 7px, color-mix(in srgb, var(--uv-accent) 25%, transparent) 7px 8px); animation: uv-c-rot 1.6s linear infinite; }"),
    ("battery", "Battery", ".X { width: 50px; height: 22px; border: 3px solid var(--uv-text); border-radius: 4px; background: linear-gradient(var(--uv-success) 0 0) 0 0 / 0 100% no-repeat; position: relative; animation: uv-c-fill 1.6s steps(5) infinite; } .X::after { content: ''; position: absolute; right: -7px; top: 4px; width: 4px; height: 8px; border-radius: 0 2px 2px 0; background: var(--uv-text); }"),
    ("cube", "Cube", ".X { width: 26px; height: 26px; background: var(--uv-accent); animation: uv-c-cube 1.8s ease-in-out infinite; }"),
    ("spiral", "Spiral", ".X { width: 40px; height: 40px; border-radius: 50%; background: repeating-conic-gradient(from 0deg, var(--uv-accent) 0 20deg, transparent 20deg 40deg); -webkit-mask: radial-gradient(circle, transparent 30%, #000 31%); animation: uv-c-rot 1.2s linear infinite; }"),
    ("dna", "DNA", ".X { width: 70px; height: 30px; background: radial-gradient(circle 4px, var(--uv-accent) 98%, transparent) 0 0 / 14px 50%, radial-gradient(circle 4px, var(--uv-accent-2) 98%, transparent) 7px 100% / 14px 50%; background-repeat: repeat-x; animation: uv-c-dna 1s linear infinite; }"),
    ("glitch-bar", "Glitch bar", ".X { width: 140px; height: 10px; background: linear-gradient(90deg, #ff2bd6, #00f0ff); animation: uv-c-glitch .4s steps(2) infinite; }"),
]
LOADER_SAMPLE = '<div class="X" role="status" aria-label="Loading"></div>'

# ── Text effects ─────────────────────────────────────────────────────────────
CLIP = "-webkit-background-clip: text; background-clip: text; color: transparent;"
TEXTS = [
    ("gradient", "Gradient", f".X {{ background: linear-gradient(90deg, {A}, {A2}); {CLIP} }}"),
    ("sunset", "Sunset", f".X {{ background: linear-gradient(90deg, #ff512f, #f09819, #ffd86f); {CLIP} }}"),
    ("rainbow", "Rainbow", f".X {{ background: linear-gradient(90deg, #ff4d8d, #ffb84d, #4dffb8, #4db8ff, #b84dff) 0 0 / 200% 100%; {CLIP} animation: uv-c-pan 4s linear infinite; }}"),
    ("chrome", "Chrome", f".X {{ background: linear-gradient(180deg, #fff 0%, #c9ced6 38%, #3b4048 50%, #dfe3ea 62%, #fff 100%); {CLIP} filter: drop-shadow(0 1px 0 #0006); }}"),
    ("gold", "Gold", f".X {{ background: linear-gradient(180deg, #fff3c4 0%, #e6c25a 38%, #8a5f0c 52%, #d8b04a 64%, #fff0b8 100%); {CLIP} }}"),
    ("deep-metal", "Deep blue metal", f".X {{ background: linear-gradient(100deg, transparent 35%, #ffffff8c 50%, transparent 65%) 150% 0 / 250% 100%, linear-gradient(180deg, #3f74dc 22%, #d6e6ff 48%, #5b8ce8 54%, #23489a 76%); {CLIP} animation: uv-c-sheen 6s ease-in-out infinite; }}"),
    ("holo", "Holographic", f".X {{ background: linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6) 0 0 / 300% 100%; {CLIP} animation: uv-c-pan 6s linear infinite; }}"),
    ("pearl", "Pearl", f".X {{ background: linear-gradient(115deg, #cdb8ff, #ffd9f3, #b8ecff, #fff2c6, #cdb8ff) 0 0 / 250% 100%; {CLIP} animation: uv-c-pan 9s linear infinite; }}"),
    ("fire", "Fire", f".X {{ background: linear-gradient(0deg, #ff3d00, #ffb300 55%, #fff3c4); {CLIP} filter: drop-shadow(0 0 10px #ff6a0066); }}"),
    ("ice", "Ice", f".X {{ background: linear-gradient(180deg, #fff, #bfe6ff 40%, #3a9be0 55%, #dff4ff 70%, #fff); {CLIP} }}"),
    ("neon", "Neon", f".X {{ color: color-mix(in srgb, {A}, #fff 55%); text-shadow: 0 0 6px {A}, 0 0 20px {A}, 0 0 44px {mixa(A, 50)}; }}"),
    ("neon-flicker", "Neon flicker", f".X {{ color: color-mix(in srgb, {A2}, #fff 55%); text-shadow: 0 0 6px {A2}, 0 0 20px {A2}; animation: uv-c-flicker 2.4s linear infinite; }}"),
    ("outline", "Outline", f".X {{ color: transparent; -webkit-text-stroke: 1.5px {T}; }}"),
    ("outline-fill", "Outline fills on hover", f".X {{ color: transparent; -webkit-text-stroke: 1.5px {T}; background: linear-gradient({T} 0 0) 0 0 / 0 100% no-repeat; {CLIP} transition: background-size .5s; }} .X:hover {{ background-size: 100% 100%; }}"),
    ("3d", "3D block", f".X {{ color: {T}; text-shadow: {', '.join(f'{k}px {k}px 0 {A}' for k in range(1, 7))}; }}"),
    ("long", "Long shadow", f".X {{ color: {T}; text-shadow: {', '.join(f'{k}px {k}px 0 {mixa(A, max(5, 60 - k * 4))}' for k in range(1, 15))}; }}"),
    ("retro", "Retro offset", f".X {{ color: #ffe66d; text-shadow: 3px 3px 0 #ff6ec7, 6px 6px 0 #7b2ff7; font-style: italic; }}"),
    ("glitch", "RGB glitch", ".X { text-shadow: 2px 0 #ff2bd6, -2px 0 #00f0ff; animation: uv-c-tglitch 2.4s steps(1) infinite; }"),
    ("emboss", "Emboss", ".X { color: color-mix(in srgb, var(--uv-text) 55%, var(--uv-bg)); text-shadow: 0 1px 0 #ffffff50, 0 -1px 0 #00000060; }"),
    ("letterpress", "Letterpress", ".X { color: color-mix(in srgb, var(--uv-bg), #000 35%); text-shadow: 0 1px 1px #ffffff30; }"),
    ("marker", "Highlighter", f".X {{ background: linear-gradient(100deg, transparent .2em, {mixa(A, 40)} .2em calc(100% - .2em), transparent 0) 0 85% / 100% 42% no-repeat; }}"),
    ("underline-draw", "Drawing underline", f".X {{ background: linear-gradient({A} 0 0) 0 100% / 0 3px no-repeat; transition: background-size .4s; }} .X:hover {{ background-size: 100% 3px; }}"),
    ("sticker", "Sticker", f".X {{ color: {A}; -webkit-text-stroke: 6px #fff; paint-order: stroke fill; filter: drop-shadow(0 3px 4px #0006); }}"),
    ("shimmer", "Shimmer", f".X {{ background: linear-gradient(100deg, {M} 40%, {T} 50%, {M} 60%) 0 0 / 250% 100%; {CLIP} animation: uv-c-pan 2.6s linear infinite reverse; }}"),
    ("wave", "Wavy", ".X { display: inline-block; animation: uv-c-waveText 1.6s ease-in-out infinite; }"),
    ("blur-in", "Blur in", ".X { animation: uv-c-blurin 1.4s ease both infinite alternate; }"),
    ("spaced", "Spaced out", ".X { letter-spacing: .35em; text-transform: uppercase; font-weight: 300; }"),
    ("condensed", "Squeezed", ".X { letter-spacing: -.06em; font-weight: 900; }"),
    ("mirror", "Mirror", f".X {{ -webkit-box-reflect: below -8px linear-gradient(transparent 40%, #0005); }}"),
    ("stroke-gradient", "Gradient stroke", f".X {{ color: {BG}; -webkit-text-stroke: 2px {A}; text-shadow: 3px 3px 0 {A2}; }}"),
    ("pop-shadow", "Pop shadow", f".X {{ color: #fff; text-shadow: 0 4px 0 {A}, 0 8px 0 {T}; }}"),
    ("vapor", "Vaporwave", f".X {{ background: linear-gradient(180deg, #ffe66d 0%, #ff6ec7 45%, #7b2ff7 100%); {CLIP} font-style: italic; filter: drop-shadow(0 0 12px #ff3cac66); }}"),
    ("matrix", "Matrix", ".X { color: #3cff6a; font-family: var(--uv-mono); text-shadow: 0 0 8px #3cff6a; }"),
    ("glass", "Glass", ".X { color: #ffffff26; -webkit-text-stroke: 1px #ffffffaa; text-shadow: 0 8px 20px #0008; }"),
    ("shadow-soft", "Soft shadow", ".X { text-shadow: 0 6px 20px rgb(0 0 0 / .45); }"),
    ("cut", "Cut-out", ".X { background: linear-gradient(var(--uv-text) 50%, var(--uv-accent) 50%); -webkit-background-clip: text; background-clip: text; color: transparent; }"),
]
TEXT_SAMPLE = '<h2 class="X" style="margin:0;font:800 40px/1.1 var(--uv-font);text-align:center">Vault</h2>'

# ── Image hovers (on a figure with an image or gradient) ─────────────────────
IMG = "<figure class=\"X\" style=\"margin:0;width:100%;height:130px;border-radius:10px;overflow:hidden;position:relative\"><div class=\"img\" style=\"position:absolute;inset:0;background:linear-gradient(135deg,#ff512f,#845ec2,#2f80ed)\"></div><figcaption>Caption</figcaption></figure>"
HOVERS = []
for n, l, css in [
    ("zoom", "Zoom", ".X .img { transition: transform .5s; } .X:hover .img { transform: scale(1.12); }"),
    ("zoom-out", "Zoom out", ".X .img { transform: scale(1.15); transition: transform .5s; } .X:hover .img { transform: scale(1); }"),
    ("rotate", "Rotate zoom", ".X .img { transition: transform .5s; } .X:hover .img { transform: scale(1.2) rotate(4deg); }"),
    ("grayscale", "Colour on hover", ".X .img { filter: grayscale(1); transition: filter .4s; } .X:hover .img { filter: none; }"),
    ("blur", "Blur on hover", ".X .img { transition: filter .4s; } .X:hover .img { filter: blur(4px); }"),
    ("brighten", "Brighten", ".X .img { filter: brightness(.7); transition: filter .4s; } .X:hover .img { filter: brightness(1.1); }"),
    ("sepia", "Sepia fade", ".X .img { filter: sepia(.8); transition: filter .4s; } .X:hover .img { filter: none; }"),
    ("caption-up", "Caption slides up", ".X figcaption { position: absolute; left: 0; right: 0; bottom: 0; padding: 10px 14px; background: #000a; color: #fff; translate: 0 100%; transition: translate .35s; } .X:hover figcaption { translate: 0 0; }"),
    ("caption-fade", "Caption fades in", ".X figcaption { position: absolute; inset: 0; display: grid; place-items: center; background: #000a; color: #fff; opacity: 0; transition: opacity .35s; } .X:hover figcaption { opacity: 1; }"),
    ("overlay-accent", "Accent overlay", ".X figcaption { position: absolute; inset: 0; display: grid; place-items: center; background: color-mix(in srgb, var(--uv-accent) 75%, transparent); color: #fff; font-weight: 700; clip-path: circle(0 at 50% 50%); transition: clip-path .5s; } .X:hover figcaption { clip-path: circle(75% at 50% 50%); }"),
    ("wipe", "Wipe", ".X figcaption { position: absolute; inset: 0; display: grid; place-items: center; background: var(--uv-text); color: var(--uv-bg); clip-path: inset(0 100% 0 0); transition: clip-path .45s; } .X:hover figcaption { clip-path: inset(0 0 0 0); }"),
    ("curtain", "Curtain", ".X figcaption { position: absolute; inset: 0; display: grid; place-items: center; background: #000c; color: #fff; clip-path: inset(50% 0 50% 0); transition: clip-path .45s; } .X:hover figcaption { clip-path: inset(0 0 0 0); }"),
    ("tilt", "Tilt", ".X { transition: transform .35s; } .X:hover { transform: perspective(600px) rotateX(6deg) rotateY(-8deg); }"),
    ("lift", "Lift + shadow", ".X { transition: translate .3s, box-shadow .3s; } .X:hover { translate: 0 -6px; box-shadow: 0 20px 30px -14px #000a; }"),
    ("frame", "Inner frame", ".X::after { content: ''; position: absolute; inset: 10px; border: 2px solid #fff; opacity: 0; transform: scale(1.1); transition: all .35s; } .X:hover::after { opacity: 1; transform: none; }"),
    ("shine", "Shine", ".X::after { content: ''; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 35%, #ffffff60 50%, transparent 65%); translate: -120% 0; transition: translate .7s; } .X:hover::after { translate: 120% 0; }"),
    ("glow", "Glow", ".X { transition: box-shadow .35s; } .X:hover { box-shadow: 0 0 0 2px var(--uv-accent), 0 0 30px -4px var(--uv-accent); }"),
    ("duotone", "Duotone", ".X .img { filter: grayscale(1) contrast(1.2); } .X::after { content: ''; position: absolute; inset: 0; background: var(--uv-accent); mix-blend-mode: multiply; transition: opacity .4s; } .X:hover::after { opacity: 0; }"),
    ("scanlines", "Scanlines", ".X::after { content: ''; position: absolute; inset: 0; background: repeating-linear-gradient(0deg, #0004 0 1px, transparent 1px 3px); opacity: 0; transition: opacity .3s; } .X:hover::after { opacity: 1; }"),
    ("pixelate", "Pixel reveal", ".X::after { content: ''; position: absolute; inset: 0; background: conic-gradient(#000 25%, transparent 0 50%, #000 0 75%, transparent 0) 0 0 / 12px 12px; opacity: .6; transition: opacity .4s; } .X:hover::after { opacity: 0; }"),
    ("round", "Round to circle", ".X { transition: border-radius .5s; } .X:hover { border-radius: 50% !important; }"),
    ("skew", "Skew", ".X { transition: transform .35s; } .X:hover { transform: skewY(-3deg); }"),
    ("border-draw", "Border draws", ".X::after { content: ''; position: absolute; inset: 0; border-radius: inherit; background: linear-gradient(var(--uv-accent) 0 0) 0 0 / 0 3px no-repeat, linear-gradient(var(--uv-accent) 0 0) 100% 100% / 0 3px no-repeat; transition: background-size .5s; } .X:hover::after { background-size: 100% 3px; }"),
    ("hue", "Colour shift", ".X .img { transition: filter .6s; } .X:hover .img { filter: hue-rotate(120deg); }"),
]:
    HOVERS.append((n, l, css + " .X figcaption { font: 600 14px var(--uv-font); }"))

# ── Dividers ─────────────────────────────────────────────────────────────────
DIV_SAMPLE = '<hr class="X" style="width:100%">'
DIVIDERS = [(n, l, ".X { border: 0; margin: 12px 0; " + c + " }") for n, l, c in [
    ("hairline", "Hairline", "height: 1px; background: var(--uv-line-2);"), ("thick", "Thick", "height: 4px; background: var(--uv-text);"),
    ("accent", "Accent", "height: 3px; background: var(--uv-accent);"), ("fade", "Fade out", "height: 1px; background: linear-gradient(90deg, transparent, var(--uv-text), transparent);"),
    ("gradient", "Gradient", "height: 3px; border-radius: 3px; background: linear-gradient(90deg, var(--uv-accent), var(--uv-accent-2));"),
    ("dashed", "Dashed", "height: 0; border-top: 2px dashed var(--uv-line-2);"), ("dotted", "Dotted", "height: 6px; background: radial-gradient(circle, var(--uv-muted) 1.5px, transparent 2px) 0 0 / 12px 6px repeat-x;"),
    ("double", "Double", "height: 6px; border-top: 1px solid var(--uv-text); border-bottom: 1px solid var(--uv-text);"),
    ("zigzag", "Zigzag", "height: 10px; background: linear-gradient(135deg, var(--uv-accent) 25%, transparent 25%) -5px 0 / 10px 10px, linear-gradient(225deg, var(--uv-accent) 25%, transparent 25%) -5px 0 / 10px 10px;"),
    ("wave", "Wave", "height: 10px; background: radial-gradient(circle at 50% 0, transparent 6px, var(--uv-accent) 7px 8px, transparent 9px) 0 0 / 16px 10px repeat-x;"),
    ("stitch", "Stitched", "height: 2px; background: repeating-linear-gradient(90deg, var(--uv-muted) 0 8px, transparent 8px 14px);"),
    ("glow", "Glow line", "height: 2px; background: var(--uv-accent); box-shadow: 0 0 10px var(--uv-accent), 0 0 20px var(--uv-accent);"),
    ("diamond", "Diamond", "height: 12px; background: linear-gradient(var(--uv-line-2) 0 0) 0 50% / 100% 1px no-repeat, linear-gradient(45deg, transparent 40%, var(--uv-accent) 40% 60%, transparent 60%) 50% 50% / 12px 12px no-repeat, linear-gradient(-45deg, transparent 40%, var(--uv-accent) 40% 60%, transparent 60%) 50% 50% / 12px 12px no-repeat;"),
    ("dot-center", "Centre dots", "height: 8px; background: radial-gradient(circle, var(--uv-accent) 3px, transparent 3.5px) 50% 50% / 24px 8px no-repeat, radial-gradient(circle, var(--uv-muted) 2px, transparent 2.5px) calc(50% - 20px) 50% / 8px 8px no-repeat, radial-gradient(circle, var(--uv-muted) 2px, transparent 2.5px) calc(50% + 20px) 50% / 8px 8px no-repeat;"),
    ("rainbow", "Rainbow", "height: 4px; background: linear-gradient(90deg, #ff4d8d, #ffb84d, #4dffb8, #4db8ff, #b84dff);"),
    ("pearl", "Pearl", "height: 6px; border-radius: 6px; background: linear-gradient(90deg, #ffd9f3, #c6b2ff, #9fd8ff, #e7ffdc);"),
    ("chrome", "Chrome", "height: 6px; background: linear-gradient(180deg, #fff, #8a919c 50%, #f4f6f9);"),
    ("deep-metal", "Deep metal", "height: 6px; background: linear-gradient(180deg, #a9cbff, #0a2560 50%, #86b4ff);"),
    ("ticket", "Perforated", "height: 10px; background: radial-gradient(circle, var(--uv-bg) 4px, transparent 4.5px) 0 50% / 14px 10px repeat-x, var(--uv-line-2);"),
    ("scissors", "Cut here", "height: 2px; background: repeating-linear-gradient(90deg, var(--uv-muted) 0 6px, transparent 6px 10px); position: relative; overflow: visible;"),
    ("brush", "Brush stroke", "height: 8px; border-radius: 50% 40% 60% 30%; background: var(--uv-accent); opacity: .8;"),
    ("short", "Short accent", "width: 48px !important; height: 4px; background: var(--uv-accent); border-radius: 4px;"),
    ("arrow", "Arrow", "height: 12px; background: linear-gradient(var(--uv-line-2) 0 0) 0 50% / calc(100% - 10px) 2px no-repeat, linear-gradient(45deg, transparent 50%, var(--uv-line-2) 50%) right 0 top 50% / 10px 10px no-repeat;"),
    ("blur", "Soft glow", "height: 12px; background: radial-gradient(50% 50% at 50% 50%, color-mix(in srgb, var(--uv-accent) 60%, transparent), transparent);"),
]]

# ── Tooltip styles: <span data-tip="…" class="uv-tip-NAME"> ───────────────────
TIP_SAMPLE = '<button class="uv-btn X" data-tip="Hello there" type="button" style="margin-top:30px">Hover me</button>'
TIPS = [(n, l, ".X[data-tip]::after { " + c + " } .X[data-tip]:hover::after { opacity: 1; }") for n, l, c in [
    ("dark", "Dark", "background: #111; color: #fff; border-radius: 6px;"), ("light", "Light", "background: #fff; color: #111; border-radius: 6px; box-shadow: 0 6px 20px -6px #0006;"),
    ("accent", "Accent", "background: var(--uv-accent); color: var(--uv-on-accent, #fff); border-radius: 999px;"),
    ("glass", "Glass", "background: #ffffff26; color: var(--uv-text); backdrop-filter: blur(10px); border: 1px solid #ffffff40; border-radius: 10px;"),
    ("neon", "Neon", "background: #000; color: var(--uv-accent); border: 1px solid var(--uv-accent); box-shadow: 0 0 12px var(--uv-accent); font-family: var(--uv-mono);"),
    ("brutal", "Brutal", "background: var(--uv-accent); color: #000; border: 2px solid #000; box-shadow: 3px 3px 0 #000; border-radius: 0; font-weight: 800;"),
    ("pearl", "Pearl", "background: linear-gradient(115deg, #fff, #f3e8ff, #e0f4ff, #fff4dc); color: #3a2f5a; border: 1px solid #d9cfee; border-radius: 999px;"),
    ("terminal", "Terminal", "background: #050c05; color: #9dff9d; font-family: var(--uv-mono); border: 1px solid #1f5f1f; border-radius: 0;"),
    ("win98", "Windows 98", "background: #ffffe1; color: #000; border: 1px solid #000; border-radius: 0; font-family: Tahoma, sans-serif;"),
    ("big", "Big", "padding: 10px 14px; font-size: 14px; border-radius: 10px;"),
    ("mono", "Mono caps", "font: 500 10px var(--uv-mono); text-transform: uppercase; letter-spacing: .08em;"),
    ("deep-metal", "Deep metal", "background: linear-gradient(180deg, #1a3f8a, #0b1d48); color: #e8f0ff; border: 1px solid #3f74dc; border-radius: 6px;"),
]]

# ── Charts (CSS only) ────────────────────────────────────────────────────────
CHARTS = [
    ("bars", "Bar chart", ".X { display: flex; align-items: end; gap: 6px; height: 100px; width: 100%; } .X > i { flex: 1; height: var(--v); border-radius: 4px 4px 0 0; background: linear-gradient(var(--uv-accent), color-mix(in srgb, var(--uv-accent) 40%, transparent)); }",
     '<div class="X">' + "".join(f'<i style="--v:{v}%"></i>' for v in (40, 65, 50, 80, 60, 95, 70)) + "</div>"),
    ("hbars", "Horizontal bars", ".X { display: grid; gap: 8px; width: 100%; } .X > i { height: 12px; width: var(--v); border-radius: 6px; background: var(--uv-accent); }",
     '<div class="X">' + "".join(f'<i style="--v:{v}%"></i>' for v in (90, 70, 55, 35)) + "</div>"),
    ("donut", "Donut", ".X { width: 100px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(var(--uv-accent) 0 var(--a), var(--uv-accent-2) 0 var(--b), var(--uv-line-2) 0); -webkit-mask: radial-gradient(farthest-side, transparent 58%, #000 59%); mask: radial-gradient(farthest-side, transparent 58%, #000 59%); }",
     '<div class="X" style="--a:45%;--b:72%"></div>'),
    ("pie", "Pie", ".X { width: 100px; aspect-ratio: 1; border-radius: 50%; background: conic-gradient(var(--uv-accent) 0 35%, var(--uv-accent-2) 0 60%, var(--uv-muted) 0 82%, var(--uv-line-2) 0); }", '<div class="X"></div>'),
    ("gauge", "Gauge", ".X { width: 120px; aspect-ratio: 2; border-radius: 120px 120px 0 0; background: conic-gradient(from -90deg at 50% 100%, var(--uv-accent) 0 calc(var(--v) * 1.8deg), var(--uv-line-2) 0 180deg, transparent 0); -webkit-mask: radial-gradient(circle at 50% 100%, transparent 55%, #000 56%); mask: radial-gradient(circle at 50% 100%, transparent 55%, #000 56%); }",
     '<div class="X" style="--v:68"></div>'),
    ("spark", "Sparkline", ".X { width: 100%; height: 50px; } .X polyline { fill: none; stroke: var(--uv-accent); stroke-width: 2.5; stroke-linejoin: round; } .X polygon { fill: color-mix(in srgb, var(--uv-accent) 18%, transparent); }",
     '<svg class="X" viewBox="0 0 100 40" preserveAspectRatio="none"><polygon points="0,40 0,30 15,26 30,32 45,18 60,22 75,10 90,14 100,6 100,40"/><polyline points="0,30 15,26 30,32 45,18 60,22 75,10 90,14 100,6"/></svg>'),
    ("stacked", "Stacked bar", ".X { display: flex; width: 100%; height: 16px; border-radius: 8px; overflow: hidden; } .X > i { width: var(--v); } .X > i:nth-child(1) { background: var(--uv-accent); } .X > i:nth-child(2) { background: var(--uv-accent-2); } .X > i:nth-child(3) { background: var(--uv-muted); }",
     '<div class="X"><i style="--v:45%"></i><i style="--v:30%"></i><i style="--v:25%"></i></div>'),
    ("heatmap", "Heatmap", ".X { display: grid; grid-template-columns: repeat(12, 1fr); gap: 3px; width: 100%; } .X > i { aspect-ratio: 1; border-radius: 2px; background: color-mix(in srgb, var(--uv-accent) var(--v), var(--uv-surface-2)); }",
     '<div class="X">' + "".join(f'<i style="--v:{(k * 37) % 100}%"></i>' for k in range(36)) + "</div>"),
    ("ring", "Progress ring", ".X { width: 90px; aspect-ratio: 1; border-radius: 50%; display: grid; place-items: center; background: conic-gradient(var(--uv-accent) calc(var(--v) * 1%), var(--uv-line-2) 0); -webkit-mask: radial-gradient(farthest-side, transparent 78%, #000 79%); mask: radial-gradient(farthest-side, transparent 78%, #000 79%); }",
     '<div class="X" style="--v:72"></div>'),
    ("kpi", "KPI tile", ".X { display: grid; gap: 2px; padding: 14px 16px; border-radius: 10px; background: var(--uv-surface); border: 1px solid var(--uv-line); } .X small { color: var(--uv-muted); font: 500 11px var(--uv-mono); text-transform: uppercase; } .X b { font: 700 28px var(--uv-font); } .X em { font-style: normal; font-size: 12px; color: var(--uv-success); }",
     '<div class="X"><small>Revenue</small><b>$48.2k</b><em>▲ 12.4%</em></div>'),
    ("columns", "Grouped columns", ".X { display: flex; align-items: end; gap: 12px; height: 100px; } .X > span { display: flex; align-items: end; gap: 3px; height: 100%; } .X i { width: 10px; height: var(--v); border-radius: 3px 3px 0 0; background: var(--uv-accent); } .X i + i { background: var(--uv-accent-2); }",
     '<div class="X">' + "".join(f'<span><i style="--v:{a}%"></i><i style="--v:{b}%"></i></span>' for a, b in ((40, 60), (70, 50), (55, 85), (90, 65))) + "</div>"),
    ("meter", "Level meter", ".X { display: flex; gap: 3px; width: 100%; } .X > i { flex: 1; height: 18px; border-radius: 2px; background: var(--uv-line-2); } .X > i.on { background: var(--uv-success); } .X > i.on.w { background: var(--uv-warn); } .X > i.on.d { background: var(--uv-danger); }",
     '<div class="X">' + "".join(f'<i class="{"on" if k < 11 else ""}{" w" if 8 <= k < 10 else ""}{" d" if k >= 10 else ""}"></i>' for k in range(13)) + "</div>"),
]

KEYFRAMES = """@keyframes uv-c-rot { to { transform: rotate(360deg); } }
@keyframes uv-c-flow { 50% { background-position: 100% 50%; } }
@keyframes uv-c-ping { 70% { box-shadow: 0 0 0 14px transparent; } 100% { box-shadow: 0 0 0 0 transparent; } }
@keyframes uv-c-breathe { 50% { transform: scale(.55); opacity: .5; } }
@keyframes uv-c-ripple { from { transform: scale(.1); opacity: 1; } to { transform: scale(1); opacity: 0; } }
@keyframes uv-c-dots { 0% { background-size: 33.3% 40%, 33.3% 40%, 33.3% 40%; } 33% { background-size: 33.3% 100%, 33.3% 40%, 33.3% 40%; } 66% { background-size: 33.3% 40%, 33.3% 100%, 33.3% 40%; } 100% { background-size: 33.3% 40%, 33.3% 40%, 33.3% 100%; } }
@keyframes uv-c-bars { 0%, 100% { background-size: 20% 100%, 20% 40%, 20% 70%; } 33% { background-size: 20% 40%, 20% 100%, 20% 40%; } 66% { background-size: 20% 70%, 20% 40%, 20% 100%; } }
@keyframes uv-c-slide { 0% { background-position: -30% 0; } 100% { background-position: 130% 0; } }
@keyframes uv-c-roll { to { background-position: 22.6px 0; } }
@keyframes uv-c-fill { 0% { background-size: 0 100%; } 80%, 100% { background-size: 100% 100%; } }
@keyframes uv-c-flip { 0% { transform: perspective(80px) rotateX(0) rotateY(0); } 50% { transform: perspective(80px) rotateX(-180deg) rotateY(0); } 100% { transform: perspective(80px) rotateX(-180deg) rotateY(-180deg); } }
@keyframes uv-c-sqspin { 25% { transform: rotate(90deg); } 50% { transform: rotate(180deg) scale(.6); } 75% { transform: rotate(270deg); } 100% { transform: rotate(360deg); } }
@keyframes uv-c-hg { 50% { transform: rotate(180deg); } 100% { transform: rotate(180deg); } }
@keyframes uv-c-heart { 0%, 100% { transform: rotate(45deg) scale(1); } 30% { transform: rotate(45deg) scale(1.2); } }
@keyframes uv-c-bounce { from { transform: translateY(0) scale(1.1, .9); } to { transform: translateY(-26px); } }
@keyframes uv-c-typing { 0%, 100% { background-position: 10px 50%, 25px 50%, 40px 50%; } 20% { background-position: 10px 30%, 25px 50%, 40px 50%; } 40% { background-position: 10px 50%, 25px 30%, 40px 50%; } 60% { background-position: 10px 50%, 25px 50%, 40px 30%; } }
@property --uv-c-p { syntax: "<percentage>"; initial-value: 0%; inherits: false; }
@keyframes uv-c-pie { to { --uv-c-p: 100%; } }
@keyframes uv-c-blink { 50% { opacity: .3; } }
@keyframes uv-c-wave { to { background-position: 20% 50%; } }
@keyframes uv-c-shimmer { to { background-position: -200% 0; } }
@keyframes uv-c-bounce-t { to { transform: translateY(-6px); letter-spacing: .3em; } }
@keyframes uv-c-cube { 25% { transform: rotate(90deg) scale(.7); border-radius: 50%; } 50% { transform: rotate(180deg); border-radius: 0; } 75% { transform: rotate(270deg) scale(.7); border-radius: 50%; } 100% { transform: rotate(360deg); } }
@keyframes uv-c-dna { to { background-position: 14px 0, 21px 100%; } }
@keyframes uv-c-glitch { 0% { transform: translate(0); clip-path: inset(0 0 0 0); } 50% { transform: translate(-3px, 1px); clip-path: inset(0 30% 0 0); } 100% { transform: translate(2px, -1px); clip-path: inset(0 0 0 40%); } }
@keyframes uv-c-pan { to { background-position: 200% 0; } }
@keyframes uv-c-sheen { 0%, 60% { background-position: 150% 0, 0 0; } 100% { background-position: -50% 0, 0 0; } }
@keyframes uv-c-flicker { 0%, 19%, 21%, 23%, 55%, 57%, 100% { opacity: 1; } 20%, 22%, 56% { opacity: .45; } }
@keyframes uv-c-tglitch { 0%, 92%, 100% { text-shadow: 2px 0 #ff2bd6, -2px 0 #00f0ff; transform: none; } 94% { text-shadow: -3px 0 #ff2bd6, 3px 0 #00f0ff; transform: translateX(2px); } 97% { transform: translateX(-2px); } }
@keyframes uv-c-waveText { 0%, 100% { transform: translateY(0) rotate(-1deg); } 50% { transform: translateY(-6px) rotate(1deg); } }
@keyframes uv-c-blurin { from { filter: blur(8px); opacity: .2; letter-spacing: .3em; } }
"""
KEYFRAMES += collections_more.KEYFRAMES

ICON_PATHS = {  # 24×24 stroke icons (stroke=currentColor, width 2, round caps)
    "home": "M3 11l9-8 9 8M5 10v10h14V10", "search": "M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM20 20l-4-4", "user": "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0",
    "users": "M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM2 21a7 7 0 0 1 14 0M17 3a4 4 0 0 1 0 8M22 21a7 7 0 0 0-4-6.3", "settings": "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-2.9 1.2V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-2.9-1.2l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 3 15.1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.3 8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 2.9-1.2V4a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 2.9 1.2l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1A1.7 1.7 0 0 0 21 9h.1a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.6 2z",
    "bell": "M6 8a6 6 0 1 1 12 0c0 7 3 9 3 9H3s3-2 3-9M10 21a2 2 0 0 0 4 0", "mail": "M3 5h18v14H3zM3 6l9 7 9-7", "heart": "M12 21s-8-5-8-11a5 5 0 0 1 8-3 5 5 0 0 1 8 3c0 6-8 11-8 11z",
    "star": "M12 3l2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9z", "check": "M5 12l5 5L20 7", "x": "M6 6l12 12M18 6L6 18", "plus": "M12 5v14M5 12h14", "minus": "M5 12h14",
    "arrow-right": "M5 12h14M13 6l6 6-6 6", "arrow-left": "M19 12H5M11 6l-6 6 6 6", "arrow-up": "M12 19V5M6 11l6-6 6 6", "arrow-down": "M12 5v14M6 13l6 6 6-6",
    "chevron-right": "M9 6l6 6-6 6", "chevron-left": "M15 6l-6 6 6 6", "chevron-up": "M6 15l6-6 6 6", "chevron-down": "M6 9l6 6 6-6", "menu": "M4 6h16M4 12h16M4 18h16",
    "more": "M5 12h.01M12 12h.01M19 12h.01", "grid": "M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z", "list": "M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01",
    "calendar": "M4 5h16v16H4zM4 10h16M9 3v4M15 3v4", "clock": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 3", "lock": "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
    "unlock": "M5 11h14v10H5zM8 11V7a4 4 0 0 1 7.5-2", "key": "M15 7a4 4 0 1 1-3.5 6L4 20.5V17h3v-3h3l1.5-1.5A4 4 0 0 1 15 7z", "shield": "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    "eye": "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12zM12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "eye-off": "M3 3l18 18M10.6 6.1A10 10 0 0 1 12 6c6 0 10 6 10 6a17 17 0 0 1-3.2 3.7M6.6 6.6A17 17 0 0 0 2 12s4 7 10 7a9 9 0 0 0 4.4-1.1",
    "trash": "M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3", "edit": "M4 20h4L19 9l-4-4L4 16zM14 6l4 4", "copy": "M8 8h12v12H8zM16 8V4H4v12h4", "link": "M10 14a5 5 0 0 0 7 0l3-3a5 5 0 0 0-7-7l-1 1M14 10a5 5 0 0 0-7 0l-3 3a5 5 0 0 0 7 7l1-1",
    "share": "M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4", "download": "M12 4v12M6 10l6 6 6-6M4 20h16",
    "upload": "M12 20V8M6 14l6-6 6 6M4 4h16", "cloud": "M7 18a5 5 0 1 1 1-9.9A6 6 0 0 1 19 10a4 4 0 0 1-1 8z", "folder": "M3 6h6l2 2h10v11H3z", "file": "M6 3h8l5 5v13H6zM14 3v5h5",
    "image": "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9h.01", "camera": "M4 8h4l2-3h4l2 3h4v11H4zM12 17a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "video": "M3 7h13v10H3zM16 10l5-3v10l-5-3",
    "music": "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0zM20 16a3 3 0 1 1-6 0 3 3 0 0 1 6 0z", "play": "M7 4l13 8-13 8z", "pause": "M7 4h4v16H7zM13 4h4v16h-4z", "stop": "M6 6h12v12H6z",
    "skip": "M5 4l10 8-10 8zM19 5v14", "volume": "M4 9h4l5-4v14l-5-4H4zM17 8a5 5 0 0 1 0 8M20 5a9 9 0 0 1 0 14", "mic": "M12 3a3 3 0 0 0-3 3v6a3 3 0 0 0 6 0V6a3 3 0 0 0-3-3zM5 11a7 7 0 0 0 14 0M12 18v3",
    "phone": "M5 3h4l2 5-3 2a12 12 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2z", "chat": "M4 5h16v11H9l-5 4z", "send": "M22 2L11 13M22 2l-7 20-4-9-9-4z",
    "globe": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18", "map-pin": "M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12zM12 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z",
    "compass": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM15.5 8.5l-2 5-5 2 2-5z", "sun": "M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4",
    "moon": "M21 13A9 9 0 1 1 11 3a7 7 0 0 0 10 10z", "cloud-rain": "M7 15a5 5 0 1 1 1-9.9A6 6 0 0 1 19 7a4 4 0 0 1-1 8M8 19l-1 2M12 19l-1 2M16 19l-1 2", "zap": "M13 2L4 14h7l-1 8 9-12h-7z",
    "fire": "M12 22a7 7 0 0 0 7-7c0-4-3-6-4-9-2 2-2 4-3 5-1-2-2-3-2-5-3 2-5 6-5 9a7 7 0 0 0 7 7z", "droplet": "M12 3s7 7.5 7 12a7 7 0 0 1-14 0c0-4.5 7-12 7-12z", "leaf": "M5 19C5 9 11 4 20 4c0 9-5 15-15 15zM5 19l7-7",
    "cart": "M3 4h2l2.5 11h11L21 7H6.5M9 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 20a1 1 0 1 0 0-2 1 1 0 0 0 0 2z", "bag": "M5 8h14l-1 13H6zM9 8V6a3 3 0 0 1 6 0v2", "gift": "M3 9h18v4H3zM5 13h14v8H5zM12 9v12M12 9S10 4 7.5 5.5 9 9 12 9zM12 9s2-5 4.5-3.5S15 9 12 9z",
    "card": "M3 6h18v12H3zM3 10h18M7 15h4", "tag": "M3 12V3h9l9 9-9 9zM8 8h.01", "chart": "M4 20V10M10 20V4M16 20v-7M22 20H2", "pie": "M12 3v9h9a9 9 0 1 1-9-9zM15 3.5A9 9 0 0 1 20.5 9H15z",
    "activity": "M3 12h4l3-8 4 16 3-8h4", "trend-up": "M3 17l6-6 4 4 8-8M15 7h6v6", "target": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM12 12h.01",
    "award": "M12 15a6 6 0 1 0 0-12 6 6 0 0 0 0 12zM8.5 14L7 22l5-3 5 3-1.5-8", "flag": "M5 21V4M5 4h12l-2 4 2 4H5", "bookmark": "M6 3h12v18l-6-4-6 4z", "book": "M4 4h7a3 3 0 0 1 3 3v14a2 2 0 0 0-2-2H4zM20 4h-6M20 4v15h-6",
    "code": "M8 7l-5 5 5 5M16 7l5 5-5 5", "terminal": "M4 17l6-5-6-5M12 19h8", "cpu": "M7 7h10v10H7zM10 2v3M14 2v3M10 19v3M14 19v3M2 10h3M2 14h3M19 10h3M19 14h3",
    "database": "M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3", "server": "M3 4h18v7H3zM3 13h18v7H3zM7 8h.01M7 17h.01",
    "wifi": "M2 9a15 15 0 0 1 20 0M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0M12 20h.01", "battery": "M3 7h16v10H3zM21 10v4M6 10v4M9 10v4", "bluetooth": "M7 7l10 10-5 4V3l5 4L7 17",
    "monitor": "M3 4h18v12H3zM8 20h8M12 16v4", "phone-device": "M7 2h10v20H7zM11 18h2", "printer": "M6 9V3h12v6M6 18H3V9h18v9h-3M6 14h12v7H6z", "refresh": "M21 12a9 9 0 1 1-3-6.7L21 8M21 3v5h-5",
    "filter": "M3 4h18l-7 9v6l-4 2v-8z", "sliders": "M4 21v-7M4 10V3M12 21v-9M12 8V3M20 21v-5M20 12V3M1 14h6M9 8h6M17 16h6", "toggle": "M7 7h10a5 5 0 0 1 0 10H7A5 5 0 0 1 7 7zM16 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
    "info": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 11v6M12 7h.01", "alert": "M12 3l10 18H2zM12 10v4M12 18h.01", "help": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6V14M12 17h.01",
    "smile": "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01", "thumbs-up": "M7 22V11M2 13v7a2 2 0 0 0 2 2h13a2 2 0 0 0 2-1.7l1.4-7A2 2 0 0 0 18.4 11H14V6a3 3 0 0 0-3-3l-4 8",
    "rocket": "M5 15c-1.5 1.3-2 5-2 5s3.7-.5 5-2M12 15l-3-3a20 20 0 0 1 11-9 20 20 0 0 1-8 12zM9 12H5l2-4h5M12 15v4l4-2v-5", "sparkles": "M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9z",
    "palette": "M12 21a9 9 0 1 1 9-9c0 2.5-2 3-3.5 3H16a2 2 0 0 0-1.5 3.3A2 2 0 0 1 12 21zM7.5 11h.01M10 7h.01M14.5 7h.01M17 11h.01", "layers": "M12 2l10 5-10 5L2 7zM2 12l10 5 10-5M2 17l10 5 10-5",
    "box": "M21 8l-9-5-9 5v8l9 5 9-5zM3 8l9 5 9-5M12 13v8", "crown": "M3 18h18L19 7l-4 4-3-6-3 6-4-4z", "diamond": "M6 3h12l4 6-10 12L2 9zM2 9h20M10 3l-2 6 4 12 4-12-2-6",
    "coffee": "M4 8h13v6a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5zM17 9h1a3 3 0 0 1 0 6h-1M8 2v3M12 2v3", "gamepad": "M6 11h4M8 9v4M15 12h.01M18 10h.01M17.3 5H6.7a4 4 0 0 0-4 3.6L2 15a3 3 0 0 0 5.6 1.4L9 14h6l1.4 2.4A3 3 0 0 0 22 15l-.7-6.4A4 4 0 0 0 17.3 5z",
    "headphones": "M3 18v-6a9 9 0 0 1 18 0v6M21 19a2 2 0 0 1-2 2h-1v-6h3zM3 19a2 2 0 0 0 2 2h1v-6H3z", "logout": "M9 21H5V3h4M16 17l5-5-5-5M21 12H9", "login": "M15 3h4v18h-4M10 17l5-5-5-5M15 12H3",
    "github": "M9 19c-5 1.5-5-2.5-7-3m14 6v-3.9a3.4 3.4 0 0 0-.9-2.6c3.1-.4 6.4-1.5 6.4-6.9a5.4 5.4 0 0 0-1.5-3.7 5 5 0 0 0-.1-3.8s-1.2-.3-3.9 1.5a13.4 13.4 0 0 0-7 0C6.3 1.8 5.1 2.1 5.1 2.1a5 5 0 0 0-.1 3.8A5.4 5.4 0 0 0 3.5 9.6c0 5.4 3.3 6.5 6.4 6.9a3.4 3.4 0 0 0-.9 2.6V23",
}


ICON_BASE = ".uv-icon { width: 1.5em; height: 1.5em; flex: none; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; vertical-align: middle; }"


def icon_svg(name, cls="uv-icon"):
    return f'<svg class="{cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="{ICON_PATHS[name]}"/></svg>'


def collections():
    """[{key, label, group, desc, prefix, wide/small, items: [{name, label, cls, css, html}]}]"""
    defs = [
        ("gradients", "Gradients", "g", "Ready-made backgrounds: linear, glow and conic versions of 40 palettes, plus theme-aware ones. class=\"uv-g-NAME\".", GRADIENTS, GRAD_SAMPLE),
        ("patterns", "Patterns", "p", "Pure-CSS background patterns that follow the theme colours, in accent and ink versions. class=\"uv-p-NAME\".", PATTERNS, PAT_SAMPLE),
        ("loaders", "CSS loaders", "l", "Single-element loaders and skeletons, no JS. class=\"uv-l-NAME\".", LOADERS, LOADER_SAMPLE),
        ("text", "Text effects", "t", "Headline styles: metals, foils, neon, glitch, 3D, highlighter… class=\"uv-t-NAME\".", TEXTS, TEXT_SAMPLE),
        ("shadows", "Shadows", "sh", "Elevation scale, glows, hard offsets, insets and neumorphic shadows. class=\"uv-sh-NAME\".", SHADOWS, SH_SAMPLE),
        ("hovers", "Image hovers", "hv", "Hover effects for images and media cards: zooms, captions, wipes, filters. class=\"uv-hv-NAME\" on the figure.", HOVERS, IMG),
        ("dividers", "Dividers", "dv", "Section dividers for <hr>. class=\"uv-dv-NAME\".", DIVIDERS, DIV_SAMPLE),
        ("tooltips", "Tooltip styles", "tip", "Styles for the data-tip tooltip. class=\"uv-tip-NAME\" next to data-tip=\"…\".", TIPS, TIP_SAMPLE),
    ]
    out = []
    for key, label, pre, desc, items, sample in defs:
        out.append({"key": key, "label": label, "prefix": f"uv-{pre}-", "desc": desc,
                    "items": [{"name": n, "label": l, "cls": f"uv-{pre}-{n}", "css": css.replace(".X", f".uv-{pre}-{n}"), "html": sample.replace("X", f"uv-{pre}-{n}")} for n, l, css in items]})
    for key, label, pre, desc, items, sample, wide in collections_more.defs():
        col = {"key": key, "label": label, "prefix": f"uv-{pre}-", "desc": desc, "items": []}
        if wide: col["wide"] = True
        for n, l, css, *h in items:
            cls = f"uv-{pre}-{n}"
            col["items"].append({"name": n, "label": l, "cls": cls, "css": css.replace(".X", "." + cls), "html": re.sub(r"\bX\b", cls, h[0] if h else sample)})
        out.append(col)
    out.append({"key": "charts", "label": "CSS charts", "prefix": "uv-ch-", "desc": "Charts with no JavaScript: bars, donuts, gauges, sparklines, heatmaps. Values are CSS variables.", "wide": True,
                "items": [{"name": n, "label": l, "cls": f"uv-ch-{n}", "css": css.replace(".X", f".uv-ch-{n}"), "html": html.replace('class="X"', f'class="uv-ch-{n}"')} for n, l, css, html in CHARTS]})
    out.append({"key": "icons", "label": "Icons", "prefix": "", "small": True, "desc": f"{len(ICON_PATHS)} stroke icons (24×24, currentColor). Paste the SVG, or use the sprite: <svg class=\"uv-icon\"><use href=\"icons.svg#home\"/></svg>.",
                "items": [{"name": n, "label": n.replace("-", " "), "cls": "uv-icon", "css": "", "html": icon_svg(n)} for n in ICON_PATHS]})
    return out


def sprite():
    return '<svg xmlns="http://www.w3.org/2000/svg" style="display:none">\n' + "\n".join(
        f'<symbol id="{n}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="{d}"/></symbol>' for n, d in ICON_PATHS.items()) + "\n</svg>\n"
