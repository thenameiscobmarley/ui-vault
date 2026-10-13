"""UI Vault effect layers — stackable effects you can put on any element type (or one element).

A layer stack is   {type: {kind: {"o": option, "c": colour, "c2": colour, "s": size, "t": speed}}}
e.g.  {"btn": {"glow": {"o": "neon", "c": "accent", "s": 18}, "hover": {"o": "jelly"}, "fill": {"o": "pearl"}}}

Options are DATA, not CSS, so three renderers share them:
  web     lib/js/layers.js turns them into CSS at runtime (UV.layers.apply(stack))
  Python  uivault3 (PySide6) paints them with QPainter
  C++     uivault3.h/.cpp (Qt 6 Widgets) paints them the same way

Fields an option may use (sizes are expressions of s, colours are c / c2 / c@40 = 40% alpha / any CSS colour):
  drop     [[x, y, blur, colour], …]   glow & shadow (filter: drop-shadow — stacks on top of the design's own shadow)
  outline  [width, style, colour, offset]
  ring     "gradient" | "spin" | "holo" | "dash"   a painted border ring (web: ::after with a mask)
  bg       background (CSS syntax; %A %A2 %T %BG %S tokens and c / c2) · fg text colour
  backdrop [blur px, tint alpha 0-1]
  radius   CSS length or "pill" / "blob"
  font     {tt, ls, ff (mono|serif|display), fw, glow (text glow colour)}
  hover / active   {y, x, scale, rot, bright, anim, drop}
  anim     keyframe name (idle loops; enter plays once when scrolled into view)
  js       runtime behaviour: ripple, confetti, sound, magnetic, tilt, spotlight, sparkle
  fx       an existing uv-fx-* class
  page     page-level: canvas effect, cursor effect, scroll behaviour
"""
import re

COLORS = ["accent", "accent-2", "text", "white", "black", "success", "warn", "danger", "info"]


def O(name, label, **f):
    return dict(name=name, label=label, **f)


KINDS = [
    dict(key="glow", label="Glow", params=["c", "s"], defaults={"c": "accent", "s": 18}, options=[
        O("soft", "Soft", drop=[[0, 0, "s", "c@55"]]),
        O("neon", "Neon", drop=[[0, 0, ".25*s", "c"], [0, 0, "s", "c@80"], [0, 0, "2*s", "c@40"]]),
        O("halo", "Halo", drop=[[0, 0, ".5*s", "c@70"], [0, 0, "1.6*s", "c@30"]]),
        O("under", "Under-glow", drop=[[0, ".6*s", "s", "c@70"]]),
        O("duo", "Two-tone", drop=[["-.4*s", 0, ".8*s", "c@70"], [".4*s", 0, ".8*s", "c2@70"]]),
        O("rainbow", "Rainbow (animated)", drop=[[0, 0, ".8*s", "c"]], anim="uvl-hue"),
        O("pulse", "Pulsing", drop=[[0, 0, ".8*s", "c@70"]], anim="uvl-glowpulse"),
        O("hover", "Only on hover", hover={"drop": [[0, 0, "s", "c"], [0, 0, "2*s", "c@40"]]}),
    ]),
    dict(key="shadow", label="Shadow", params=["c", "s"], defaults={"c": "black", "s": 16}, options=[
        O("soft", "Soft", drop=[[0, ".4*s", "s", "c@35"]]),
        O("float", "Floating", drop=[[0, "s", "1.4*s", "c@30"], [0, ".15*s", ".3*s", "c@20"]]),
        O("hard", "Hard offset", drop=[[".3*s", ".3*s", 0, "c"]]),
        O("hard-accent", "Hard offset (colour 2)", drop=[[".3*s", ".3*s", 0, "c2"]]),
        O("long", "Long", drop=[[".1*s", ".1*s", 0, "c@60"], [".2*s", ".2*s", 0, "c@45"], [".3*s", ".3*s", 0, "c@30"], [".4*s", ".4*s", 0, "c@18"]]),
        O("stacked", "Stacked", drop=[[".2*s", ".2*s", 0, "c2"], [".4*s", ".4*s", 0, "c"]]),
        O("lifted", "Lifted on hover", hover={"y": "-.2*s", "drop": [[0, ".6*s", "1.2*s", "c@35"]]}),
        O("sharp", "Sharp bottom", drop=[[0, ".2*s", 0, "c@50"]]),
    ]),
    dict(key="border", label="Border", params=["c", "c2", "s"], defaults={"c": "accent", "c2": "accent-2", "s": 2}, options=[
        O("ring", "Ring", outline=["s", "solid", "c", "s"]),
        O("tight", "Tight line", outline=["s", "solid", "c", "-s"]),
        O("double", "Double", outline=["2*s+1", "double", "c", "s"]),
        O("dashed", "Dashed", outline=["s", "dashed", "c", "s"]),
        O("dotted", "Dotted", outline=["s", "dotted", "c", "s"]),
        O("gradient", "Gradient", ring="gradient"),
        O("spin", "Spinning gradient", ring="spin"),
        O("holo", "Holographic", ring="holo"),
        O("march", "Marching ants", ring="dash"),
        O("focus", "Ring on hover", hover={"outline": ["s", "solid", "c", "s"]}),
    ]),
    dict(key="backdrop", label="Backdrop", params=["s"], defaults={"s": 12}, options=[
        O("blur", "Blur", backdrop=["s", 0.35]),
        O("frost", "Frosted glass", backdrop=["s", 0.5], extra={"border-color": "#ffffff40"}),
        O("tint", "Tinted glass", backdrop=["s", 0.25], bg="color-mix(in srgb, %A 22%, transparent)"),
        O("dark", "Smoked glass", backdrop=["s", 0.0], bg="#0b0b10a6", fg="#f2f2f5"),
        O("clear", "Clear (no fill)", backdrop=[0, 0.0], bg="transparent"),
    ]),
    dict(key="fill", label="Fill", params=["c", "c2"], defaults={"c": "accent", "c2": "accent-2"}, options=[
        O("solid", "Solid colour", bg="c", fg="on(c)"),
        O("soft", "Soft tint", bg="c@16", fg="mix(c,%T,60)"),
        O("gradient", "Gradient", bg="linear-gradient(135deg, c, c2)", fg="#ffffff"),
        O("sweep", "Animated gradient", bg="linear-gradient(110deg, c, c2, c) 0 0 / 200% 100%", fg="#ffffff", anim="uvl-pan"),
        O("pearl", "Pearlescent", bg="linear-gradient(115deg, #ffffff 0%, #f3e8ff 22%, #e0f4ff 42%, #fff4dc 62%, #ffe6f4 80%, #ffffff 100%) 0 0 / 220% 100%", fg="#3a2f5a", hover={"anim": "uvl-pan"}),
        O("holo", "Holo foil", bg="linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6, #9ad3ff) 0 0 / 300% 100%", fg="#2a1f3d", anim="uvl-pan"),
        O("chrome", "Chrome", bg="linear-gradient(180deg, #ffffff 0%, #dfe3ea 40%, #8a919c 50%, #c9ced6 62%, #f4f6f9 100%)", fg="#1b1f26"),
        O("gold", "Gold", bg="linear-gradient(180deg, #fff3c4 0%, #e6c25a 40%, #9a6f12 52%, #d8b04a 66%, #fff0b8 100%)", fg="#2a1a00"),
        O("deep-metal", "Deep blue metal", bg="linear-gradient(180deg, #a9cbff 0%, #3f74dc 30%, #0a2560 50%, #1d4cad 64%, #86b4ff 100%)", fg="#f2f7ff"),
        O("metal", "Anodised (colour)", bg="linear-gradient(180deg, mix(c,#ffffff,55) 0%, mix(c,#ffffff,12) 44%, mix(c,#000000,30) 54%, mix(c,#ffffff,8) 100%)", fg="#ffffff"),
        O("ink", "Ink", bg="%T", fg="%BG"),
        O("paper", "Paper", bg="%S", fg="%T"),
        O("stripes", "Stripes", bg="repeating-linear-gradient(-45deg, c 0 10px, mix(c,#ffffff,25) 10px 20px)", fg="#ffffff"),
        O("carbon", "Carbon", bg="repeating-linear-gradient(45deg, #1a1a1d 0 4px, #232327 4px 8px)", fg="#f2f2f5"),
        O("sunset", "Sunset", bg="linear-gradient(180deg, #ffe66d, #ff6ec7 50%, #7b2ff7)", fg="#ffffff"),
        O("mesh", "Mesh", bg="radial-gradient(at 15% 20%, c@70, transparent 55%), radial-gradient(at 85% 80%, c2@70, transparent 55%), %S", fg="%T"),
    ]),
    dict(key="shape", label="Shape", params=[], defaults={}, options=[
        O("square", "Square", radius="0px"), O("crisp", "Crisp 4px", radius="4px"), O("soft", "Soft 10px", radius="10px"),
        O("round", "Round 18px", radius="18px"), O("pill", "Pill", radius="pill"), O("blob", "Blob", radius="blob"),
        O("notch", "Notched corners", clip="notch"), O("ticket", "Cut corners", clip="cut"),
    ]),
    dict(key="text", label="Text", params=["c"], defaults={"c": "accent"}, options=[
        O("upper", "Uppercase", font={"tt": "uppercase", "ls": ".08em"}),
        O("wide", "Wide tracking", font={"ls": ".18em"}),
        O("mono", "Monospace", font={"ff": "mono"}),
        O("serif", "Serif italic", font={"ff": "serif", "fs": "italic"}),
        O("heavy", "Heavy", font={"fw": 800}),
        O("glow", "Glowing text", font={"glow": "c"}),
        O("gradient", "Gradient text", font={"grad": "linear-gradient(90deg, c, c2)"}),
        O("outline", "Outlined", font={"stroke": "c"}),
        O("emboss", "Embossed", font={"emboss": True}),
        O("small-caps", "Small caps", font={"sc": True}),
    ]),
    dict(key="hover", label="Hover", params=["s"], defaults={"s": 1}, options=[
        O("lift", "Lift", hover={"y": "-3*s"}),
        O("sink", "Sink", hover={"y": "2*s"}),
        O("pop", "Pop", hover={"scale": "1+.06*s"}),
        O("shrink", "Shrink", hover={"scale": "1-.04*s"}),
        O("tilt", "Tilt", hover={"rot": "-2*s", "scale": "1+.03*s"}),
        O("jelly", "Jelly", hover={"anim": "uvl-jelly"}),
        O("wobble", "Wobble", hover={"anim": "uvl-wobble"}),
        O("bounce", "Bounce", hover={"anim": "uvl-bounce"}),
        O("rubber", "Rubber band", hover={"anim": "uvl-rubber"}),
        O("heartbeat", "Heartbeat", hover={"anim": "uvl-heart"}),
        O("shake", "Shake", hover={"anim": "uvl-shake"}),
        O("swing", "Swing", hover={"anim": "uvl-swing"}),
        O("brighten", "Brighten", hover={"bright": 1.15}),
        O("shine", "Shine sweep", hover={"shine": True}),
        O("float", "Float while hovered", hover={"anim": "uvl-float"}),
        O("magnetic", "Magnetic (follows cursor)", js="magnetic"),
        O("tilt3d", "3D tilt (follows cursor)", js="tilt"),
        O("spotlight", "Spotlight", js="spotlight"),
    ]),
    dict(key="press", label="Press", params=["s"], defaults={"s": 1}, options=[
        O("sink", "Sink", active={"y": "2*s"}),
        O("squish", "Squish", active={"scale": "1-.06*s"}),
        O("dim", "Dim", active={"bright": 0.85}),
        O("ripple", "Ripple", js="ripple"),
        O("confetti", "Confetti", js="confetti"),
        O("click", "Click sound", js="sound"),
        O("sparkle", "Sparkle burst", js="sparkle"),
        O("pop", "Pop", active={"anim": "uvl-pop"}),
    ]),
    dict(key="enter", label="Entrance", params=["t"], defaults={"t": 0.6}, options=[
        O("fade", "Fade in", anim="uvl-in-fade"), O("rise", "Rise", anim="uvl-in-rise"), O("drop", "Drop", anim="uvl-in-drop"),
        O("zoom", "Zoom", anim="uvl-in-zoom"), O("blur", "Blur in", anim="uvl-in-blur"), O("left", "Slide from left", anim="uvl-in-left"),
        O("right", "Slide from right", anim="uvl-in-right"), O("flip", "Flip up", anim="uvl-in-flip"), O("pop", "Pop in", anim="uvl-in-pop"),
        O("swing", "Swing in", anim="uvl-in-swing"),
    ]),
    dict(key="idle", label="Idle motion", params=["t"], defaults={"t": 3}, options=[
        O("float", "Float", anim="uvl-float"), O("pulse", "Pulse", anim="uvl-pulse"), O("breathe", "Breathe", anim="uvl-breathe"),
        O("sway", "Sway", anim="uvl-sway"), O("bob", "Bob", anim="uvl-bob"), O("hue", "Colour cycle", anim="uvl-hue"),
        O("flicker", "Neon flicker", anim="uvl-flicker"), O("wiggle", "Wiggle now and then", anim="uvl-wiggle"),
        O("spin", "Slow spin", anim="uvl-spin"), O("blink", "Blink", anim="uvl-blink"),
    ]),
]

# every existing uv-fx-* effect becomes a layer option too
FX_ONLY = ["3d", "bevel", "blob", "blur-in", "bounce-in", "breathe", "checker", "chrome", "corners", "crt", "dashed-march", "dither", "fill-hover",
           "flip", "float", "frost", "glitch", "glow", "gradient-text", "grid-floor", "halftone", "hard-shadow", "highlight", "holo", "holo-card",
           "inset", "jelly", "lift", "long-shadow", "mesh-anim", "mirror", "neon", "neumorph", "noise", "paper", "pixel", "pop", "pulse-ring",
           "rainbow-border", "redacted", "rgb", "scanlines", "shake", "shine", "spin-hover", "spotlight", "squiggle", "stamp", "sticker", "stripes",
           "stroke", "swing", "tape", "torn", "vhs", "wave", "wobble"]
KINDS.append(dict(key="fx", label="Effect (uv-fx)", params=[], defaults={}, options=[O(n, n.replace("-", " ").capitalize(), fx="uv-fx-" + n) for n in FX_ONLY]))

# page-level kinds (type "page")
PAGE_KINDS = [
    dict(key="canvas", label="Animated background", params=[], defaults={}, options=[
        O(n, l, page={"canvas": n}) for n, l in [("waterfall", "Waterfall"), ("matrix", "Matrix rain"), ("starfield", "Starfield"), ("particles", "Particles"), ("snow", "Snow")]]),
    dict(key="cursor", label="Cursor", params=[], defaults={}, options=[
        O("trail", "Trail", page={"cursor": "cursor-trail"}), O("blob", "Blob", page={"cursor": "cursor-blob"}), O("sparkles", "Sparkles", page={"cursor": "sparkles"})]),
    dict(key="scroll", label="Scrolling", params=[], defaults={}, options=[
        O("smooth", "Smooth scrolling", page={"scroll": "smooth"}), O("progress", "Progress bar", page={"scroll": "progress"}),
        O("both", "Smooth + progress bar", page={"scroll": "both"})]),
]

TYPES = [  # element types you can layer (targets come from the parts families, plus a few extras)
    ("btn", "Buttons"), ("card", "Cards"), ("input", "Text fields"), ("switch", "Switches"), ("check", "Checkboxes"), ("range", "Sliders"),
    ("tabs", "Tabs"), ("nav", "Navigation"), ("badge", "Badges"), ("alert", "Alerts & toasts"), ("modal", "Modals"), ("spinner", "Spinners"),
    ("progress", "Progress"), ("head", "Headings"), ("link", "Links"), ("img", "Images"), ("text", "Paragraphs"), ("page", "Whole page"),
]
EXTRA_TARGETS = {"link": "a:not(.uv-btn):not(.btn)", "img": "img, .uv-avatar", "text": "p", "page": "html"}

KEYFRAMES = """@keyframes uvl-hue { to { filter: hue-rotate(360deg); } }
@keyframes uvl-glowpulse { 50% { opacity: .85; scale: 1.015; } }
@keyframes uvl-pan { to { background-position: 100% 0; } }
@keyframes uvl-jelly { 30% { scale: 1.12 .88; } 50% { scale: .92 1.08; } 70% { scale: 1.04 .96; } }
@keyframes uvl-wobble { 25% { rotate: -4deg; } 50% { rotate: 3deg; } 75% { rotate: -1.5deg; } }
@keyframes uvl-bounce { 40% { translate: 0 -8px; } 60% { translate: 0 0; } 75% { translate: 0 -3px; } }
@keyframes uvl-rubber { 30% { scale: 1.2 .8; } 40% { scale: .8 1.2; } 60% { scale: 1.1 .9; } 75% { scale: .97 1.03; } }
@keyframes uvl-heart { 15%, 45% { scale: 1.1; } 30% { scale: 1; } }
@keyframes uvl-shake { 20%, 60% { translate: -4px 0; } 40%, 80% { translate: 4px 0; } }
@keyframes uvl-swing { 20% { rotate: 8deg; } 40% { rotate: -6deg; } 60% { rotate: 3deg; } 80% { rotate: -2deg; } }
@keyframes uvl-float { 50% { translate: 0 -6px; } }
@keyframes uvl-pop { 50% { scale: 1.12; } }
@keyframes uvl-pulse { 50% { scale: 1.05; } }
@keyframes uvl-breathe { 50% { opacity: .65; } }
@keyframes uvl-sway { 50% { rotate: 2deg; } } @keyframes uvl-bob { 50% { translate: 0 3px; } }
@keyframes uvl-flicker { 0%, 19%, 21%, 23%, 55%, 57%, 100% { opacity: 1; } 20%, 22%, 56% { opacity: .5; } }
@keyframes uvl-wiggle { 0%, 88%, 100% { rotate: 0deg; } 90% { rotate: -5deg; } 93% { rotate: 5deg; } 96% { rotate: -3deg; } }
@keyframes uvl-spin { to { rotate: 360deg; } } @keyframes uvl-blink { 50% { opacity: .35; } }
@keyframes uvl-in-fade { from { opacity: 0; } } @keyframes uvl-in-rise { from { opacity: 0; translate: 0 24px; } }
@keyframes uvl-in-drop { from { opacity: 0; translate: 0 -24px; } } @keyframes uvl-in-zoom { from { opacity: 0; scale: .85; } }
@keyframes uvl-in-blur { from { opacity: 0; filter: blur(10px); } } @keyframes uvl-in-left { from { opacity: 0; translate: -40px 0; } }
@keyframes uvl-in-right { from { opacity: 0; translate: 40px 0; } } @keyframes uvl-in-flip { from { opacity: 0; transform: perspective(600px) rotateX(-60deg); } }
@keyframes uvl-in-pop { 0% { opacity: 0; scale: .6; } 70% { scale: 1.06; } } @keyframes uvl-in-swing { from { opacity: 0; rotate: -8deg; translate: -20px 0; } }
@keyframes uvl-shine { from { translate: -120% 0; } to { translate: 120% 0; } }
@keyframes uvl-spin-a { to { --uvl-a: 360deg; } } @keyframes uvl-march { to { background-position: 16px 0, -16px 100%, 0 -16px, 100% 16px; } }
@property --uvl-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
"""


def meta(parts_meta):
    fams = {f["key"]: f for f in parts_meta["families"]}
    types = []
    for key, label in TYPES:
        t = {"key": key, "label": label, "targets": EXTRA_TARGETS.get(key) or fams[key]["targets"]}
        types.append(t)
    return {"kinds": KINDS, "pageKinds": PAGE_KINDS, "types": types, "colors": COLORS, "keyframes": KEYFRAMES}
