"""UI Vault theme recipes + specs → lib/css/themes.gen.css.

A theme = colours (bg / fg / accent / accent2, the rest is derived) + fonts + shape + one recipe each for
background, heading, primary button, hover motion and cards. Signature themes add `extra` CSS.
Every recipe only uses --uv-* tokens and the theme's own colours, so all components follow automatically.
"""
import re

# ── fonts: key → (CSS stack, Google Fonts family spec or None) ──────────────
FONTS = {
    "geist": ('"Geist", system-ui, sans-serif', "Geist:wght@400;500;600;700;800"),
    "manrope": ('"Manrope", system-ui, sans-serif', "Manrope:wght@400;500;700;800"),
    "outfit": ('"Outfit", system-ui, sans-serif', "Outfit:wght@400;500;700;800"),
    "grotesk": ('"Space Grotesk", system-ui, sans-serif', "Space+Grotesk:wght@400;500;700"),
    "bricolage": ('"Bricolage Grotesque", system-ui, sans-serif', "Bricolage+Grotesque:wght@400;600;800"),
    "rajdhani": ('"Rajdhani", system-ui, sans-serif', "Rajdhani:wght@500;600;700"),
    "mono": ('"Geist Mono", ui-monospace, monospace', "Geist+Mono:wght@400;500"),
    "serif": ('"Instrument Serif", Georgia, serif', "Instrument+Serif:ital@0;1"),
    "fraunces": ('"Fraunces", Georgia, serif', "Fraunces:ital,wght@0,400;0,700;1,400"),
    "playfair": ('"Playfair Display", Georgia, serif', "Playfair+Display:ital,wght@0,500;0,800;1,500"),
    "cormorant": ('"Cormorant Garamond", Georgia, serif', "Cormorant+Garamond:ital,wght@0,500;0,700;1,500"),
    "dmserif": ('"DM Serif Display", Georgia, serif', "DM+Serif+Display:ital@0;1"),
    "syne": ('"Syne", system-ui, sans-serif', "Syne:wght@500;700;800"),
    "unbounded": ('"Unbounded", system-ui, sans-serif', "Unbounded:wght@400;600;800"),
    "orbitron": ('"Orbitron", system-ui, sans-serif', "Orbitron:wght@500;700;900"),
    "audiowide": ('"Audiowide", system-ui, sans-serif', "Audiowide"),
    "bebas": ('"Bebas Neue", Impact, sans-serif', "Bebas+Neue"),
    "pixel": ('"VT323", ui-monospace, monospace', "VT323"),
    "press": ('"Press Start 2P", ui-monospace, monospace', "Press+Start+2P"),
    "hand": ('"Patrick Hand", "Comic Neue", cursive', "Patrick+Hand"),
    "majormono": ('"Major Mono Display", ui-monospace, monospace', "Major+Mono+Display"),
    "cinzel": ('"Cinzel", Georgia, serif', "Cinzel:wght@500;700"),
    "bungee": ('"Bungee", Impact, sans-serif', "Bungee"),
    "creepster": ('"Creepster", Impact, cursive', "Creepster"),
    "pacifico": ('"Pacifico", cursive', "Pacifico"),
    "monoton": ('"Monoton", Impact, sans-serif', "Monoton"),
    "silkscreen": ('"Silkscreen", ui-monospace, monospace', "Silkscreen:wght@400;700"),
}
SHAPES = {"sharp": (0, 0, 0, 0), "crisp": (2, 3, 4, 6), "soft": (4, 6, 8, 12), "round": (8, 12, 16, 22), "pill": (999, 999, 18, 26)}


# ── colour helpers ───────────────────────────────────────────────────────────
def _rgb(h):
    h = h.lstrip("#")
    if len(h) == 3: h = "".join(c * 2 for c in h)
    return [int(h[i:i + 2], 16) for i in (0, 2, 4)]


def rnd(v): return int(v + .5) if v >= 0 else -int(-v + .5)   # half up, like JS Math.round (Python's round() is half-even)
def hexc(rgb): return "#%02x%02x%02x" % tuple(max(0, min(255, rnd(v))) for v in rgb)
def mix(a, b, t): return hexc([x + (y - x) * t for x, y in zip(_rgb(a), _rgb(b))])
def alpha(h, a): return h[:7] + "%02x" % rnd(a * 255)
def lum(h): r, g, b = _rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
def on(h): return "#111111" if lum(h) > 0.55 else "#ffffff"
def lighten(h, t): return mix(h, "#ffffff", t)
def darken(h, t): return mix(h, "#000000", t)


def derive(s):
    bg, fg = s["bg"], s["fg"]
    dark = lum(bg) < 0.5
    c = {"bg": bg, "text": fg, "accent": s["ac"], "accent-2": s.get("ac2", s["ac"]), "on-accent": on(s["ac"])}
    c["surface"] = s.get("surface") or (mix(bg, fg, .05) if dark else mix(bg, "#ffffff", .55))
    c["surface-2"] = mix(bg, fg, .09 if dark else .06)
    c["surface-3"] = mix(bg, fg, .15 if dark else .11)
    c["line"] = alpha(fg, .14 if dark else .10)
    c["line-2"] = alpha(fg, .26 if dark else .18)
    c["muted"] = mix(fg, bg, .32)
    c["dim"] = mix(fg, bg, .52)
    c["success"], c["warn"], c["danger"] = (("#4ade80", "#fbbf24", "#f87171") if dark else ("#2f7d4f", "#b7791f", "#c4321f"))
    c.update(s.get("colors", {}))
    return c, dark


# ── recipes shared with the browser theme builder ───────────────────────────
# build.py writes these to assets/js/theme-recipes.js, so tools/theme_specs.py and assets/js/theme-engine.js
# render them identically. CSS with [[expr]] holes; expr sees the colours a (accent), b (accent-2), t (text), bg, s, s2, s3,
# the flag dark, and al(c, x) mx(c1, c2, x) lt(c, x) dk(c, x) on(c) iff(cond, x, y) u(c) (url-encoded colour).
# Hover recipes also use SEL (the theme selector) and H (its hovered buttons).
SHARED = {
    "background": {
        "topo": "background-image: repeating-radial-gradient(circle at 28% 38%, transparent 0 22px, [[al(t, .07)]] 22px 23px), repeating-radial-gradient(circle at 82% 88%, transparent 0 30px, [[al(a, .09)]] 30px 31px);",
        "waves": "background-image: radial-gradient(circle at 50% 100%, transparent 10px, [[al(a, .16)]] 11px 12px, transparent 13px); background-size: 28px 14px;",
        "conic": "background-image: conic-gradient(from 210deg at 72% 18%, [[al(a, .26)]], transparent 25%, [[al(b, .2)]] 50%, transparent 75%, [[al(a, .26)]]);",
        "plaid": "background-image: repeating-linear-gradient(0deg, [[al(a, .10)]] 0 6px, transparent 6px 40px), repeating-linear-gradient(90deg, [[al(a, .10)]] 0 6px, transparent 6px 40px), repeating-linear-gradient(0deg, transparent 0 20px, [[al(b, .09)]] 20px 22px, transparent 22px 40px), repeating-linear-gradient(90deg, transparent 0 20px, [[al(b, .09)]] 20px 22px, transparent 22px 40px);",
        "iso": "background-image: linear-gradient(30deg, [[al(t, .05)]] 12%, transparent 12.5%, transparent 87%, [[al(t, .05)]] 87.5%), linear-gradient(150deg, [[al(t, .05)]] 12%, transparent 12.5%, transparent 87%, [[al(t, .05)]] 87.5%), linear-gradient(30deg, [[al(t, .05)]] 12%, transparent 12.5%, transparent 87%, [[al(t, .05)]] 87.5%), linear-gradient(150deg, [[al(t, .05)]] 12%, transparent 12.5%, transparent 87%, [[al(t, .05)]] 87.5%), linear-gradient(60deg, [[al(a, .07)]] 25%, transparent 25.5%, transparent 75%, [[al(a, .07)]] 75%), linear-gradient(60deg, [[al(a, .07)]] 25%, transparent 25.5%, transparent 75%, [[al(a, .07)]] 75%); background-size: 40px 70px; background-position: 0 0, 0 0, 20px 35px, 20px 35px, 0 0, 20px 35px;",
        "bokeh": "background-image: radial-gradient(circle 90px at 14% 22%, [[al(a, .30)]], transparent), radial-gradient(circle 140px at 72% 14%, [[al(b, .24)]], transparent), radial-gradient(circle 110px at 88% 72%, [[al(a, .20)]], transparent), radial-gradient(circle 70px at 34% 86%, [[al(b, .26)]], transparent), radial-gradient(circle 220px at 50% 55%, [[al(a, .10)]], transparent);",
        "rays": "background-image: repeating-conic-gradient(from 0deg at 50% 115%, [[al(a, .09)]] 0 5deg, transparent 5deg 11deg), radial-gradient(ellipse at 50% 115%, [[al(a, .28)]], transparent 62%);",
        "hex": "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='100'%3E%3Cpath d='M28 66L0 50L0 16L28 0L56 16L56 50L28 66L28 100' fill='none' stroke='[[u(t)]]' stroke-opacity='.10'/%3E%3Cpath d='M28 0L28 34L0 50L0 84L28 100L56 84L56 50L28 34' fill='none' stroke='[[u(a)]]' stroke-opacity='.12'/%3E%3C/svg%3E\"); background-size: 56px 100px;",
        "terrazzo": "background-image: radial-gradient(circle at 20% 30%, [[al(a, .55)]] 0 3px, transparent 3.5px), radial-gradient(circle at 70% 62%, [[al(b, .5)]] 0 2px, transparent 2.5px), radial-gradient(circle at 42% 80%, [[al(t, .16)]] 0 2.5px, transparent 3px), radial-gradient(circle at 86% 16%, [[al(a, .4)]] 0 1.5px, transparent 2px), radial-gradient(circle at 10% 76%, [[al(b, .4)]] 0 4px, transparent 4.5px), radial-gradient(circle at 58% 22%, [[al(t, .12)]] 0 1.5px, transparent 2px); background-size: 120px 120px;",
        "rain": "background-image: repeating-linear-gradient(100deg, transparent 0 22px, [[al(a, .07)]] 22px 23px, transparent 23px 47px, [[al(t, .05)]] 47px 48px), linear-gradient(180deg, [[al(a, .08)]], transparent 40%);",
        "wash": "background-image: linear-gradient(160deg, [[al(a, .22)]], transparent 42%, transparent 60%, [[al(b, .2)]]);",
    },
    "heading": {
        "emboss": "color: [[t]]; text-shadow: 0 1px 0 [[iff(dark, al('#ffffff', .14), '#ffffff')]], 0 -1px 0 [[al('#000000', iff(dark, .7, .2))]];",
        "neon-outline": "color: transparent; -webkit-text-stroke: 1.5px [[lt(a, .45)]]; filter: drop-shadow(0 0 4px [[a]]) drop-shadow(0 0 14px [[al(a, .6)]]);",
        "gold": "background-image: linear-gradient(180deg, #fff3c4 0%, #e6c25a 38%, #9a6f12 52%, #d8b04a 66%, #fff0b8 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 1px 0 [[al('#000000', iff(dark, .5, .25))]]);",
        "ice": "background-image: linear-gradient(180deg, [[iff(dark, '#ffffff', '#0b4f74')]] 0%, [[iff(dark, '#bfefff', '#2a9fd6')]] 40%, [[iff(dark, '#4fb6e8', '#083650')]] 55%, [[iff(dark, '#d9f6ff', '#3fb4e8')]] 72%, [[iff(dark, '#ffffff', '#0b4f74')]] 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 0 12px #6fd6ff55);",
        "rainbow": "background-image: linear-gradient(90deg, #ff5f6d, #ffc371, #e8e85a, #4fe0a0, #4fb8ff, #a77bff, #ff5f6d); background-size: 300% 100%; -webkit-background-clip: text; background-clip: text; color: transparent; animation: uvt-holo 9s linear infinite;",
        "split": "background-image: linear-gradient(180deg, [[t]] 54%, [[a]] 54%); -webkit-background-clip: text; background-clip: text; color: transparent;",
        "retro": "background-image: linear-gradient(180deg, #f2fbff 0%, #8ad1ff 46%, #2b1055 50%, #ff6ec7 76%, #ffe0f4 100%); -webkit-background-clip: text; background-clip: text; color: transparent; filter: drop-shadow(0 2px 0 [[a]]) drop-shadow(0 0 16px [[al(a, .55)]]);",
        "fade3d": "text-shadow: 1px 1px 0 [[al(a, .95)]], 2px 2px 0 [[al(a, .85)]], 3px 3px 0 [[al(a, .72)]], 4px 4px 0 [[al(a, .6)]], 5px 5px 0 [[al(a, .48)]], 6px 6px 0 [[al(a, .36)]], 7px 7px 0 [[al(a, .24)]], 8px 8px 0 [[al(a, .12)]];",
        "rgb": "color: [[t]]; text-shadow: 2px 0 [[al(a, .85)]], -2px 0 [[al(b, .85)]];",
        "offset": "color: transparent; -webkit-text-stroke: 2px [[a]]; filter: drop-shadow(4px 4px 0 [[al(b, .65)]]);",
    },
    "button": {
        "clay": "background: [[a]]; color: [[on(a)]]; border: 0; border-radius: 999px; box-shadow: inset 0 -4px 8px [[al(dk(a, .4), .55)]], inset 0 4px 8px [[al('#ffffff', .45)]], 0 8px 18px -8px [[al(dk(a, .3), .75)]];",
        "candy": "background: linear-gradient(180deg, [[lt(a, .35)]], [[a]] 50%, [[dk(a, .1)]] 51%, [[lt(a, .12)]]); color: [[on(a)]]; border: 1px solid [[dk(a, .3)]]; box-shadow: inset 0 1px 0 [[al('#ffffff', .7)]], 0 3px 8px -3px [[al(dk(a, .4), .7)]]; text-shadow: 0 1px 0 [[al('#000000', .22)]];",
        "gel": "background: linear-gradient(180deg, [[lt(a, .55)]] 0%, [[lt(a, .2)]] 48%, [[a]] 52%, [[lt(a, .35)]] 100%); color: [[on(a)]]; border: 1px solid [[dk(a, .25)]]; border-radius: 999px; box-shadow: inset 0 1px 1px [[al('#ffffff', .9)]], 0 4px 10px -4px [[a]];",
        "pixel": "background: [[a]]; color: [[on(a)]]; border: 0; border-radius: 0; box-shadow: inset 0 -4px 0 [[dk(a, .35)]], 4px 0 0 [[t]], -4px 0 0 [[t]], 0 4px 0 [[t]], 0 -4px 0 [[t]];",
        "neu": "background: [[s]]; color: [[iff(dark, lt(a, .2), dk(a, .1))]]; border: 0; box-shadow: 6px 6px 14px [[al(dk(bg, .35), .7)]], -6px -6px 14px [[al(lt(bg, iff(dark, .08, .9)), .8)]];",
        "duo": "background: [[a]]; color: [[on(a)]]; border: 2px solid [[t]]; box-shadow: 5px 5px 0 [[b]];",
        "holo": "background: linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6) 0 0 / 300% 100%; color: #1d1d2b; border: 1px solid [[al('#ffffff', .6)]]; animation: uvt-holo 6s linear infinite;",
        "gold": "background: linear-gradient(180deg, #fff3c4 0%, #e6c25a 40%, #9a6f12 52%, #d8b04a 66%, #fff0b8 100%); color: #3a2600; border: 1px solid #9a6f12; text-shadow: 0 1px 0 #ffffff66; box-shadow: inset 0 1px 0 #ffffff, 0 6px 16px -8px #9a6f12;",
    },
    "card": {
        "clay": "border: 0; background: [[s]]; box-shadow: inset 0 -6px 14px [[al('#000000', iff(dark, .35, .08))]], inset 0 6px 14px [[al('#ffffff', iff(dark, .06, .7))]], 0 18px 34px -18px [[al(iff(dark, '#000000', dk(a, .5)), .55)]];",
        "neu": "border: 0; background: [[bg]]; box-shadow: 9px 9px 22px [[al(dk(bg, .4), .6)]], -9px -9px 22px [[al(lt(bg, iff(dark, .07, .8)), .85)]];",
        "ticket": "border: 0; background: radial-gradient(circle at 0 50%, transparent 12px, [[s]] 12.5px) left / 51% 100% no-repeat, radial-gradient(circle at 100% 50%, transparent 12px, [[s]] 12.5px) right / 51% 100% no-repeat; filter: drop-shadow(0 6px 14px [[al('#000000', .18)]]);",
        "stack": "box-shadow: 6px 6px 0 -1px [[s2]], 6px 6px 0 0 [[al(t, .18)]], 12px 12px 0 -1px [[s3]], 12px 12px 0 0 [[al(t, .12)]];",
        "duo": "border: 2px solid [[t]]; box-shadow: 8px 8px 0 [[a]];",
        "holo": "border: 2px solid transparent; background: linear-gradient([[s]], [[s]]) padding-box, linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6) border-box;",
        "dashed": "border: 1.5px dashed [[al(a, .6)]]; background: linear-gradient([[al(a, .05)]], [[al(a, .05)]]), [[s]];",
        "float": "border-color: [[al(t, .08)]]; box-shadow: inset 0 1px 0 [[al('#ffffff', iff(dark, .06, .9))]], 0 30px 60px -30px [[al('#000000', iff(dark, .8, .35))]], 0 18px 36px -18px [[al(a, .35)]];",
        "frame": "border: 1px solid [[al(t, .28)]]; outline: 1px solid [[al(t, .14)]]; outline-offset: 5px;",
    },
    "hover": {
        "swing": "H { animation: uvt-swing .7s; transform-origin: 50% 0; }",
        "squish": "H { animation: uvt-squish .45s; }",
        "rise": "H { translate: 0 -4px; box-shadow: 0 14px 28px -12px [[a]]; } SEL .uv-btn:active { translate: 0 0; }",
        "shake": "H { animation: uvt-shake .4s; }",
        "skew": "H { transform: skewX(-8deg); }",
        "float": "H { animation: uvt-float 1.4s ease-in-out infinite; }",
    },
}


def u(h): return h.replace("#", "%23")


def fill(tpl, c, dark, sel=""):
    """Evaluate the [[expr]] holes of a SHARED recipe (assets/js/theme-engine.js has the same evaluator)."""
    env = {"a": c["accent"], "b": c["accent-2"], "t": c["text"], "bg": c["bg"], "s": c["surface"], "s2": c["surface-2"], "s3": c["surface-3"],
           "dark": dark, "al": alpha, "mx": mix, "lt": lighten, "dk": darken, "on": on, "u": u, "iff": lambda q, x, y: x if q else y}
    out = re.sub(r"\[\[(.+?)\]\]", lambda m: str(eval(m.group(1), {"__builtins__": {}}, env)), tpl)
    return out.replace("SEL", sel).replace("H {", f"{sel} .uv-btn:hover {{") if sel else out


# ── recipes ──────────────────────────────────────────────────────────────────
def bg_css(kind, c, dark, args):
    a, b = c["accent"], c["accent-2"]
    if kind == "flat": return ""
    if kind == "aurora":
        c1, c2, c3 = (args + [a, b, mix(a, b, .5)])[:3]
        return f"background-image: radial-gradient(45% 55% at 12% 10%, {alpha(c1, .45)}, transparent 70%), radial-gradient(40% 50% at 88% 22%, {alpha(c2, .38)}, transparent 70%), radial-gradient(55% 50% at 55% 100%, {alpha(c3, .35)}, transparent 70%);"
    if kind == "pearl":
        return ("background-image: radial-gradient(55% 45% at 18% 8%, #ffd9f3cc, transparent 70%), radial-gradient(45% 50% at 88% 14%, #cdeeffcc, transparent 70%), "
                "radial-gradient(60% 55% at 70% 95%, #e7ffdccc, transparent 70%), radial-gradient(40% 40% at 30% 75%, #fff2d6aa, transparent 70%), "
                "conic-gradient(from 200deg at 65% 55%, #ffffff, #f4ecff, #e8f7ff, #fdf8ea, #ffffff);")
    if kind == "mesh":
        return f"background-image: radial-gradient(at 15% 15%, {alpha(a, .55)} 0, transparent 50%), radial-gradient(at 85% 10%, {alpha(b, .5)} 0, transparent 50%), radial-gradient(at 60% 100%, {alpha(mix(a, b, .5), .45)} 0, transparent 55%);"
    if kind == "grid":
        g = alpha(c["text"], .07)
        return f"background-image: linear-gradient({g} 1px, transparent 1px), linear-gradient(90deg, {g} 1px, transparent 1px); background-size: 32px 32px;"
    if kind == "blueprint":
        g, g2 = alpha(c["text"], .09), alpha(c["text"], .18)
        return f"background-image: linear-gradient({g2} 1px, transparent 1px), linear-gradient(90deg, {g2} 1px, transparent 1px), linear-gradient({g} 1px, transparent 1px), linear-gradient(90deg, {g} 1px, transparent 1px); background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;"
    if kind == "dots": return f"background-image: radial-gradient({alpha(c['text'], .16)} 1px, transparent 1.4px); background-size: 18px 18px;"
    if kind == "lines": return f"background-image: linear-gradient({alpha(b, .16)} 1px, transparent 1px); background-size: 100% 28px;"
    if kind == "carbon":
        k1, k2 = mix(c["bg"], "#ffffff", .06), mix(c["bg"], "#000000", .25)
        return f"background-image: linear-gradient(27deg, {k2} 5px, transparent 5px) 0 5px, linear-gradient(207deg, {k2} 5px, transparent 5px) 10px 0, linear-gradient(27deg, {k1} 5px, transparent 5px) 0 10px, linear-gradient(207deg, {k1} 5px, transparent 5px) 10px 5px, linear-gradient(90deg, {k2} 10px, transparent 10px), linear-gradient({k2} 25%, {k1} 25%, {k1} 50%, transparent 50%, transparent 75%, {k1} 75%, {k1}); background-size: 20px 20px;"
    if kind == "brushed":
        return f"background-image: repeating-linear-gradient(90deg, {alpha('#ffffff', .05)} 0 1px, transparent 1px 3px), linear-gradient(180deg, {lighten(c['bg'], .12)}, {c['bg']} 45%, {darken(c['bg'], .1)});"
    if kind == "galaxy":
        return (f"background-image: radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #ffffffcc, transparent), "
                f"radial-gradient(1px 1px at 85% 15%, #fff, transparent), radial-gradient(60% 50% at 30% 30%, {alpha(a, .45)}, transparent 70%), radial-gradient(50% 60% at 80% 70%, {alpha(b, .45)}, transparent 70%); "
                "background-size: 220px 220px, 260px 260px, 300px 300px, 180px 180px, 100% 100%, 100% 100%;")
    if kind == "marble":
        return (f"background-image: radial-gradient(120% 60% at 10% 20%, {alpha(a, .25)} 0 20%, transparent 21% 40%, {alpha(b, .2)} 41% 46%, transparent 47%), "
                f"radial-gradient(90% 70% at 90% 80%, {alpha(b, .25)} 0 18%, transparent 19% 36%, {alpha(a, .2)} 37% 40%, transparent 41%);")
    if kind == "sunset":
        c1, c2, c3 = (args + [a, b, c["bg"]])[:3]
        return f"background-image: linear-gradient(180deg, {alpha(c1, .55)}, {alpha(c2, .35)} 45%, {alpha(c3, 0)} 85%);"
    if kind == "noise":
        return "background-image: url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\");"
    if kind == "halftone": return f"background-image: radial-gradient({alpha(a, .3)} 1.4px, transparent 1.6px); background-size: 10px 10px;"
    if kind == "checker": return f"background-image: conic-gradient({c['surface-2']} 25%, transparent 0 50%, {c['surface-2']} 0 75%, transparent 0); background-size: 28px 28px;"
    if kind == "stripes": return f"background-image: repeating-linear-gradient(-45deg, {alpha(a, .08)} 0 12px, transparent 12px 24px);"
    if kind == "scan": return f"background-image: repeating-linear-gradient(0deg, {alpha('#000000', .18)} 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 55%, {alpha('#000000', .45)});"
    if kind == "vignette": return f"background-image: radial-gradient(ellipse at 50% 35%, transparent 40%, {alpha(darken(c['bg'], .5), .55)});"
    if kind == "tiger":
        return f"background-image: repeating-linear-gradient(115deg, transparent 0 18px, {alpha('#000000', .35)} 18px 24px, transparent 24px 46px, {alpha('#000000', .25)} 46px 50px), linear-gradient(135deg, {a}, {b});"
    if kind == "web":
        return f"background-image: repeating-radial-gradient(circle at 0 0, transparent 0 34px, {alpha('#000000', .55)} 35px 36px), repeating-conic-gradient(from 0deg at 0 0, transparent 0 9deg, {alpha('#000000', .45)} 9deg 9.6deg);"
    if kind == "damascus":
        return f"background-image: repeating-radial-gradient(ellipse 120% 40% at 50% 120%, {alpha('#ffffff', .07)} 0 6px, transparent 6px 14px), linear-gradient(180deg, {lighten(c['bg'], .08)}, {c['bg']});"
    return fill(SHARED["background"].get(kind, ""), c, dark)


def head_css(kind, c, dark, args):
    a, b = c["accent"], c["accent-2"]
    clip = "-webkit-background-clip: text; background-clip: text; color: transparent;"
    if kind == "plain": return ""
    if kind == "metal":  # deep → bright band → deep, like polished anodised metal
        d, l = (args + [darken(a, .45), lighten(a, .55)])[:2]
        if dark and lum(d) < .32: d = mix(d, l, .42)   # keep the dark band readable on dark backgrounds
        return f"background-image: linear-gradient(100deg, transparent 35%, {alpha('#ffffff', .55)} 50%, transparent 65%), linear-gradient(180deg, {d} 28%, {l} 50%, {mix(d, l, .35)} 54%, {d} 74%); background-size: 250% 100%, 100% 100%; {clip} animation: uvt-sheen 7s ease-in-out infinite;"
    if kind == "chrome":
        if not dark: return f"background-image: linear-gradient(180deg, #3a404a 0%, #9aa3b0 40%, #1e232b 52%, #6b7480 68%, #2a2f38 100%); {clip} filter: drop-shadow(0 1px 0 #ffffff);"
        return f"background-image: linear-gradient(180deg, #ffffff 0%, #c9ced6 38%, #3b4048 50%, #dfe3ea 62%, #ffffff 100%); {clip} filter: drop-shadow(0 1px 0 {alpha('#000000', .35)});"
    if kind == "gradient": return f"background-image: linear-gradient(90deg, {a}, {b}); {clip}"
    if kind == "holo":
        stops = "#ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6" if dark else "#c2369f, #2f7fc4, #2f9e45, #b8901a, #c2369f"
        return f"background-image: linear-gradient(115deg, {stops}); background-size: 300% 100%; {clip} animation: uvt-holo 8s linear infinite;"
    if kind == "pearl": return f"background-image: linear-gradient(115deg, #4f3f86, #9a86d8 30%, #3f93b8 50%, #a88a3e 70%, #4f3f86); background-size: 250% 100%; {clip} animation: uvt-holo 10s linear infinite;"
    if kind == "outline": return f"color: transparent; -webkit-text-stroke: 1.5px {c['text']};"
    if kind == "glow": return f"color: {lighten(a, .55)}; text-shadow: 0 0 6px {alpha(a, .9)}, 0 0 22px {alpha(a, .6)}, 0 0 48px {alpha(a, .35)};"
    if kind == "shadow3d":
        sc = args[0] if args else a
        return "text-shadow: " + ", ".join(f"{i}px {i}px 0 {sc}" for i in range(1, 6)) + ";"
    if kind == "duotone": return f"color: {c['text']}; text-shadow: 3px 3px 0 {alpha(a, .9)};"
    if kind == "fire": return f"background-image: linear-gradient(0deg, #ff3d00, #ffb300 55%, #fff3c4); {clip}"
    return fill(SHARED["heading"].get(kind, ""), c, dark)


def btn_css(kind, c, dark, args):
    a, b, t, bg = c["accent"], c["accent-2"], c["text"], c["bg"]
    if kind == "solid": return f"background: {a}; color: {on(a)}; border-color: {a};"
    if kind == "ink": return f"background: {t}; color: {bg}; border-color: {t};"
    if kind == "outline": return f"background: transparent; color: {a if lum(a) < .8 or dark else t}; border: 1.5px solid currentColor;"
    if kind == "hard": return f"background: {a}; color: {on(a)}; border: 2px solid {t}; box-shadow: 4px 4px 0 {t};"
    if kind == "glow": return f"background: {a}; color: {on(a)}; border-color: {a}; box-shadow: 0 0 18px -2px {a}, inset 0 1px 0 {alpha('#ffffff', .35)};"
    if kind == "gradient": return f"background: linear-gradient(135deg, {a}, {b}); color: {on(mix(a, b, .5))}; border-color: transparent;"
    if kind == "metal":
        return (f"background: linear-gradient(180deg, {lighten(a, .55)} 0%, {lighten(a, .15)} 45%, {darken(a, .25)} 55%, {lighten(a, .1)} 100%); color: #fff; "
                f"text-shadow: 0 1px 0 {alpha('#000000', .45)}; border: 1px solid {darken(a, .4)}; box-shadow: inset 0 1px 0 {alpha('#ffffff', .7)}, 0 4px 12px -4px {alpha(darken(a, .4), .6)};")
    if kind == "chrome":
        return f"background: linear-gradient(180deg, #ffffff, #d7dbe2 45%, #8b929c 52%, #e9ecf1); color: #1b1f26; border: 1px solid #8b929c; box-shadow: inset 0 1px 0 #fff, 0 3px 10px -4px #0007;"
    if kind == "pearl":
        return f"background: linear-gradient(115deg, #ffffff, #f2e6ff 30%, #e2f5ff 55%, #fff5e1 80%, #ffffff); background-size: 200% 100%; color: #3a2f5a; border: 1px solid #d9cfee; box-shadow: inset 0 1px 0 #fff, 0 6px 16px -8px #7a6a9e88;"
    if kind == "glass":
        return f"background: {alpha('#ffffff', .16 if dark else .45)}; color: {t}; border: 1px solid {alpha('#ffffff', .38 if dark else .8)}; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 {alpha('#ffffff', .4)};"
    if kind == "bevel": return f"background: {c['surface-2']}; color: {t}; border: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px {mix(c['surface-2'], '#000000', .35)}, inset 2px 2px {mix(c['surface-2'], '#ffffff', .5)};"
    if kind == "soft": return f"background: {alpha(a, .16)}; color: {darken(a, .25) if not dark else lighten(a, .3)}; border-color: transparent;"
    if kind == "3d": return f"background: {a}; color: {on(a)}; border-color: {a}; box-shadow: 0 5px 0 {darken(a, .35)};"
    if kind == "neon": return f"background: transparent; color: {lighten(a, .3)}; border: 1.5px solid {a}; text-shadow: 0 0 8px {a}; box-shadow: 0 0 12px -2px {a}, inset 0 0 10px -4px {a};"
    if kind == "underline": return f"background: transparent; color: {t}; border-color: transparent; text-decoration: underline; text-decoration-color: {a}; text-decoration-thickness: 2px; text-underline-offset: 5px;"
    if kind == "stamp": return f"background: transparent; color: {a}; border: 2px double {a}; text-transform: uppercase; letter-spacing: .14em;"
    return fill(SHARED["button"].get(kind, ""), c, dark)


HOVER_KF = """@keyframes uvt-wob { 25% { rotate: -4deg; } 50% { rotate: 3deg; } 75% { rotate: -1.5deg; } }
@keyframes uvt-jelly { 30% { scale: 1.12 .88; } 50% { scale: .92 1.08; } 70% { scale: 1.04 .96; } }
@keyframes uvt-bounce { 40% { translate: 0 -6px; } 60% { translate: 0 0; } 75% { translate: 0 -2px; } }
@keyframes uvt-sheen { 0%, 60% { background-position: 150% 0, 0 0; } 100% { background-position: -50% 0, 0 0; } }
@keyframes uvt-holo { to { background-position: 300% 0; } }
@keyframes uvt-pulse { 50% { box-shadow: 0 0 0 6px transparent; } }
"""


def hover_css(kind, sel, c, dark):
    a, t = c["accent"], c["text"]
    base = f"{sel} .uv-btn {{ transition: translate .2s cubic-bezier(.2,.8,.2,1), scale .2s cubic-bezier(.3,1.5,.5,1), rotate .2s, background .2s, color .2s, box-shadow .25s, border-color .2s, filter .2s; }}\n"
    h = f"{sel} .uv-btn:hover"
    rules = {
        "lift": f"{h} {{ translate: 0 -2px; filter: brightness(1.05); }} {sel} .uv-btn:active {{ translate: 0 1px; }}",
        "shine": f"{sel} .uv-btn::after {{ content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(110deg, transparent 35%, {alpha('#ffffff', .5)} 50%, transparent 65%); translate: -120% 0; transition: translate .7s; }} {h}::after {{ translate: 120% 0; }}",
        "glow": f"{h} {{ box-shadow: 0 0 0 3px {alpha(a, .25)}, 0 0 26px -2px {alpha(a, .7)}; }}",
        "press": f"{h} {{ filter: brightness(1.08); }} {sel} .uv-btn:active {{ scale: .94; }}",
        "fill": f"{sel} .uv-btn--ghost:hover, {sel} .uv-btn:not(.uv-btn--primary):hover {{ background: {a}; color: {on(a)}; border-color: {a}; }}",
        "invert": f"{h} {{ background: {t}; color: {c['bg']}; border-color: {t}; }}",
        "wobble": f"{h} {{ animation: uvt-wob .5s; }}",
        "jelly": f"{h} {{ animation: uvt-jelly .55s; }}",
        "bounce": f"{h} {{ animation: uvt-bounce .5s; }}",
        "tilt": f"{h} {{ rotate: -2deg; scale: 1.03; }}",
        "pop": f"{h} {{ scale: 1.06; }} {sel} .uv-btn:active {{ scale: .96; }}",
        "sink": f"{h} {{ translate: 2px 2px; box-shadow: 1px 1px 0 {t}; }} {sel} .uv-btn:active {{ translate: 4px 4px; box-shadow: none; }}",
        "ring": f"{h} {{ outline: 2px solid {a}; outline-offset: 3px; }}",
        "pulse": f"{h} {{ box-shadow: 0 0 0 0 {alpha(a, .55)}; animation: uvt-pulse 1.2s infinite; }}",
        "flicker": f"{h} {{ animation: uv-flick 1.6s infinite; filter: brightness(1.25); }}",
    }
    card = {"lift": f"{sel} .uv-card--hover:hover {{ translate: 0 -4px; }}", "tilt": f"{sel} .uv-card--hover:hover {{ rotate: -1deg; }}",
            "glow": f"{sel} .uv-card--hover:hover {{ box-shadow: 0 0 0 1px {alpha(a, .5)}, 0 0 30px -8px {a}; }}",
            "sink": f"{sel} .uv-card--hover:hover {{ translate: 3px 3px; }}", "pop": f"{sel} .uv-card--hover:hover {{ scale: 1.02; }}"}
    rule = rules.get(kind) or fill(SHARED["hover"].get(kind, ""), c, dark, sel)
    return base + rule + "\n" + card.get(kind, card["lift"] if kind in ("shine", "press", "jelly", "bounce", "wobble", "fill", "ring", "pulse", "swing", "squish", "rise", "shake", "skew", "float") else "")


def card_css(kind, c, dark):
    a, b, t = c["accent"], c["accent-2"], c["text"]
    if kind == "flat": return ""
    if kind == "soft": return f"border-color: transparent; box-shadow: 0 1px 2px {alpha(t, .06)}, 0 14px 34px -14px {alpha(darken(c['bg'], .6) if dark else t, .35)};"
    if kind == "hard": return f"border: 2px solid {t}; box-shadow: 6px 6px 0 {t};"
    if kind == "glass": return f"background: {alpha('#ffffff', .08 if dark else .45)}; border: 1px solid {alpha('#ffffff', .22 if dark else .75)}; backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3); box-shadow: inset 0 1px 0 {alpha('#ffffff', .3)}, 0 18px 40px -20px {alpha('#000000', .45)};"
    if kind == "bevel": return f"border: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px {mix(c['surface'], '#ffffff', .6)}, inset -2px -2px {mix(c['surface'], '#000000', .3)}, inset 2px 2px #fff;"
    if kind == "gradient-border": return f"border: 1.5px solid transparent; background: linear-gradient({c['surface']}, {c['surface']}) padding-box, linear-gradient(135deg, {a}, {b}) border-box;"
    if kind == "inset": return f"background: {c['surface-2']}; border-color: transparent; box-shadow: inset 0 2px 8px {alpha('#000000', .18)};"
    if kind == "outline": return f"border: 2px solid {t}; box-shadow: none;"
    if kind == "glow": return f"border-color: {alpha(a, .45)}; box-shadow: 0 0 0 1px {alpha(a, .2)}, 0 0 40px -14px {a};"
    if kind == "notch": return f"border: 0; border-radius: 0; background: linear-gradient(135deg, transparent 14px, {c['surface']} 14px) ; clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px); box-shadow: inset 0 0 0 1px {alpha(a, .5)};"
    if kind == "double": return f"border: 3px double {alpha(t, .6)};"
    if kind == "metal": return f"background: repeating-linear-gradient(90deg, {alpha('#ffffff', .04)} 0 1px, transparent 1px 3px), linear-gradient(180deg, {lighten(c['surface'], .08)}, {c['surface']}); border-color: {alpha('#ffffff', .18)}; box-shadow: inset 0 1px 0 {alpha('#ffffff', .25)};"
    if kind == "pearl": return f"background: linear-gradient(135deg, #ffffffee, #f6efffdd 40%, #eaf8ffdd 70%, #fffaf0ee); border: 1px solid #e3d8f5; box-shadow: inset 0 1px 0 #fff, 0 18px 40px -22px #7a6a9e88;"
    if kind == "paper": return f"background: {c['surface']} linear-gradient({alpha(b, .14)} 1px, transparent 1px) 0 0 / 100% 26px; box-shadow: 2px 3px 0 {alpha(t, .12)};"
    return fill(SHARED["card"].get(kind, ""), c, dark)


# ── the themes ───────────────────────────────────────────────────────────────
def T(name, cat, desc, bg, fg, ac, ac2=None, font="geist", head="serif", shape="soft", bw=1, bgfx="flat", headfx="plain",
      btn="solid", hover="lift", card="flat", case="none", tracking=None, weight=None, extra="", **kw):
    return dict(name=name, cat=cat, desc=desc, bg=bg, fg=fg, ac=ac, ac2=ac2 or ac, font=font, head=head, shape=shape, bw=bw,
                bgfx=bgfx if isinstance(bgfx, tuple) else (bgfx,), headfx=headfx if isinstance(headfx, tuple) else (headfx,),
                btn=btn, hover=hover, card=card, case=case, tracking=tracking, weight=weight, extra=extra, **kw)


SPECS = [
    # Minimal
    T("paper", "Minimal", "warm paper, graphite text, a quiet blue link", "#f7f5f0", "#2a2a28", "#2f5bd3", font="manrope", head="serif"),
    T("linen", "Minimal", "off-white linen with a terracotta accent", "#f3eee6", "#3b3530", "#c4623a", "#8a6d55", font="outfit", head="fraunces", bgfx="noise", card="soft"),
    T("fog", "Minimal", "cool grey haze, soft shadows, nothing loud", "#eef0f2", "#2b3036", "#5b6b7c", font="manrope", head="geist", shape="round", card="soft", btn="ink", hover="press", weight=700),
    T("porcelain", "Minimal", "white porcelain with a celadon glaze", "#fbfbf9", "#23302c", "#5f9e8f", font="geist", head="cormorant", card="soft", hover="lift"),
    T("newsprint", "Minimal", "newspaper grey, black columns, red headlines", "#ece8df", "#141414", "#b3261e", font="geist", head="playfair", shape="sharp", btn="ink", hover="invert", card="outline", bgfx="noise", weight=800),
    T("blueprint", "Minimal", "architect's blue sheet with a white grid", "#13427a", "#e9f2ff", "#ffd45c", font="mono", head="grotesk", shape="sharp", bgfx="blueprint", btn="outline", hover="fill", card="outline", case="uppercase"),
    T("sand", "Minimal", "dune beige, umber ink, sun-bleached calm", "#efe4d2", "#3e3227", "#b0743c", font="outfit", head="dmserif", card="soft", btn="ink"),
    T("concrete", "Minimal", "raw grey concrete, bold black type", "#d9d9d6", "#151515", "#ff5a1f", font="grotesk", head="grotesk", shape="sharp", bgfx="noise", btn="ink", hover="invert", weight=700, tracking="-.04em"),
    T("graphite", "Minimal", "pencil-lead greys with a mint highlight", "#2b2d30", "#e6e7e8", "#7de2b8", font="geist", head="geist", weight=700, card="flat", btn="solid", hover="press"),
    T("swiss-red", "Minimal", "international style: grid, black, a single red", "#ffffff", "#0a0a0a", "#e1251b", font="geist", head="geist", shape="sharp", bgfx="grid", btn="solid", hover="invert", weight=800, tracking="-.05em", card="outline"),
    # Dark
    T("midnight", "Dark", "deep navy night with a moonlit blue", "#0b1020", "#dfe6f5", "#6ea8ff", "#a78bfa", font="geist", head="geist", weight=700, bgfx="vignette", card="soft", btn="glow", hover="glow"),
    T("obsidian", "Dark", "volcanic black glass with violet edges", "#0a0a0d", "#e9e7f2", "#9d7bff", "#ff6ad5", font="outfit", head="syne", weight=800, card="gradient-border", btn="gradient", hover="lift"),
    T("ink", "Dark", "pure ink black, paper-white type, one red", "#0e0e0e", "#f2f0eb", "#ff3b2f", font="geist", head="serif", card="flat", btn="solid", hover="invert"),
    T("deep-sea", "Dark", "abyssal teal with bioluminescent cyan", "#041b22", "#d6f4f7", "#2de2e6", "#3d7cff", font="manrope", head="geist", weight=700, bgfx=("aurora", "#0a6a7a", "#122a6a", "#0b4a3a"), card="glass", btn="glow", hover="glow"),
    T("forest-night", "Dark", "pine shadows, moss green, firefly gold", "#0d1611", "#e2eadf", "#7cc36e", "#f2c14e", font="manrope", head="fraunces", card="soft", btn="solid", hover="lift"),
    T("espresso", "Dark", "dark roast brown with crema highlights", "#1b1310", "#f2e6da", "#d9a066", font="outfit", head="dmserif", card="soft", btn="solid", hover="press"),
    T("plum", "Dark", "velvet plum with rose-gold trim", "#1d1020", "#f4e6f0", "#e7a4c0", "#c9a96e", font="manrope", head="playfair", card="gradient-border", btn="soft", hover="lift"),
    T("vampire", "Dark", "gothic purple-black with blood-red accents", "#16101c", "#f0e6f5", "#ff4566", "#bd93f9", font="outfit", head="cormorant", weight=700, card="flat", btn="solid", hover="glow", headfx=("glow",)),
    T("nord-night", "Dark", "arctic slate with frost blues", "#2e3440", "#eceff4", "#88c0d0", "#b48ead", font="manrope", head="geist", weight=700, btn="solid", hover="lift"),
    T("charcoal", "Dark", "matte charcoal, amber indicators, studio calm", "#1e1f22", "#e8e6e3", "#ffb547", font="geist", head="geist", weight=600, card="inset", btn="solid", hover="press"),
    # Pastel
    T("lavender", "Pastel", "lilac fields, soft violet buttons", "#f3efff", "#2e2550", "#8b6cf0", "#f49ac1", font="outfit", head="outfit", shape="round", weight=800, card="soft", btn="solid", hover="pop", bw=0),
    T("mint", "Pastel", "fresh mint with a deep green ink", "#ecfbf3", "#173b2c", "#2fb37a", "#7ac7ff", font="outfit", head="outfit", shape="round", weight=800, card="soft", btn="solid", hover="bounce", bw=0),
    T("peach", "Pastel", "peach fuzz, apricot buttons, warm and soft", "#fff1e8", "#4a2c22", "#ff8a5c", "#ffc46b", font="manrope", head="fraunces", shape="round", card="soft", btn="solid", hover="pop", bw=0),
    T("sakura", "Pastel", "cherry-blossom pink with sumi ink", "#fff2f5", "#3a2430", "#e8668f", "#9ad0c2", font="manrope", head="cormorant", shape="round", card="soft", btn="soft", hover="lift", bw=0),
    T("sky", "Pastel", "cloud white and clear-sky blue", "#eef6ff", "#1b2f4a", "#4a9bff", "#9be7ff", font="outfit", head="outfit", shape="pill", weight=800, bgfx=("aurora", "#bfe0ff", "#e3f6ff", "#d9e8ff"), card="soft", btn="solid", hover="lift", bw=0),
    T("lemon", "Pastel", "lemon sorbet with a charcoal outline", "#fffbe0", "#2b2a1f", "#f5c400", "#ff7eb6", font="grotesk", head="grotesk", shape="round", weight=700, card="outline", btn="hard", hover="sink", bw=2),
    T("bubblegum", "Pastel", "bubblegum pink, candy blue, bouncy", "#ffeaf6", "#3d1236", "#ff4fb3", "#4fc3ff", font="outfit", head="unbounded", shape="pill", weight=800, card="soft", btn="3d", hover="jelly", bw=0),
    T("seafoam", "Pastel", "seafoam green with coral pops", "#e9faf6", "#163a36", "#ff7f6a", "#38c2a5", font="manrope", head="fraunces", shape="round", card="soft", btn="solid", hover="lift", bw=0),
    # Bold
    T("tangerine", "Bold", "loud orange, black type, no apologies", "#ff7a1a", "#1a0f06", "#1a0f06", "#fff3e0", font="grotesk", head="bebas", shape="sharp", btn="ink", hover="invert", card="outline", case="uppercase", tracking=".01em", bw=2),
    T("cobalt", "Bold", "electric cobalt field, white type, lemon accent", "#1d3fd8", "#ffffff", "#ffe14d", font="grotesk", head="unbounded", shape="crisp", weight=800, btn="solid", hover="pop", card="outline"),
    T("magenta", "Bold", "hot magenta with cyan clash", "#ff2d95", "#14001a", "#14001a", "#21e3ff", font="grotesk", head="syne", shape="sharp", weight=800, btn="ink", hover="tilt", card="hard", bw=2),
    T("risograph", "Bold", "two-ink riso print: fluoro pink + blue on paper", "#f6f1e7", "#2340c9", "#ff4f9a", "#2340c9", font="grotesk", head="grotesk", shape="sharp", bgfx="halftone", headfx=("duotone",), btn="solid", hover="wobble", card="outline", weight=700, bw=2),
    T("pop-art", "Bold", "comic-book halftones, primary colours, ink outlines", "#fff35c", "#111111", "#ff2b2b", "#2b6bff", font="grotesk", head="bebas", shape="sharp", bgfx="halftone", headfx=("shadow3d", "#ff2b2b"), btn="hard", hover="sink", card="hard", case="uppercase", bw=3),
    T("bauhaus", "Bold", "primary geometry: red, yellow, blue on cream", "#f2ead8", "#141414", "#d6281b", "#1f4fb5", font="geist", head="geist", shape="sharp", btn="solid", hover="tilt", card="outline", weight=800, tracking="-.05em", bw=2),
    T("memphis", "Bold", "80s memphis squiggles, teal and pink", "#fff8ef", "#1b1b2f", "#ff5ca8", "#21c4c4", font="grotesk", head="unbounded", shape="round", bgfx="dots", btn="hard", hover="wobble", card="hard", weight=800, bw=2),
    T("brutal-lime", "Bold", "acid lime neo-brutalism, thick black outlines", "#e8ff5a", "#000000", "#000000", "#ff5ec4", font="grotesk", head="grotesk", shape="sharp", btn="hard", hover="sink", card="hard", weight=700, bw=3),
    # Retro
    T("amber-crt", "Retro", "amber phosphor terminal from 1983", "#130c02", "#ffb627", "#ffb627", "#ffd98a", font="pixel", head="pixel", shape="sharp", bgfx="scan", headfx=("glow",), btn="outline", hover="fill", card="outline", case="uppercase"),
    T("gameboy", "Retro", "four shades of handheld green", "#9bbc0f", "#0f380f", "#306230", "#8bac0f", font="press", head="press", shape="sharp", btn="hard", hover="sink", card="outline", bw=3, colors={"surface": "#8bac0f"}),
    T("vaporwave", "Retro", "pastel grid sunsets, marble busts and chrome", "#2b1055", "#fdf2ff", "#ff71ce", "#01cdfe", font="grotesk", head="majormono", bgfx=("sunset", "#ff71ce", "#b967ff", "#2b1055"), headfx=("chrome",), btn="gradient", hover="glow", card="glass"),
    T("synthwave", "Retro", "outrun sunset, neon grid, chrome type", "#1a0933", "#ffe9ff", "#ff2fd6", "#ffb000", font="rajdhani", head="audiowide", bgfx=("sunset", "#ff2fd6", "#6a00ff", "#1a0933"), headfx=("chrome",), btn="neon", hover="flicker", card="glow", case="uppercase"),
    T("arcade", "Retro", "coin-op cabinet: black, neon red and yellow", "#0b0b14", "#f4f4ff", "#ff2e4d", "#ffd23f", font="press", head="press", shape="sharp", bgfx="scan", btn="3d", hover="press", card="outline", bw=2),
    T("teletext", "Retro", "broadcast teletext: black field, primary blocks", "#000000", "#ffffff", "#ffff00", "#00ffff", font="pixel", head="pixel", shape="sharp", btn="solid", hover="invert", card="outline", case="uppercase"),
    T("polaroid", "Retro", "faded instant-film creams and teal shadows", "#f1ebe1", "#2a3a3d", "#d96c4f", "#4f8a8b", font="hand", head="hand", shape="crisp", card="soft", btn="solid", hover="tilt", bgfx="noise"),
    T("win-classic", "Retro", "beige desktop era with bevelled grey chrome", "#c3c7cb", "#000000", "#000080", "#008080", font="geist", head="geist", shape="sharp", btn="bevel", hover="press", card="bevel", weight=700, bw=0),
    # Nature
    T("moss", "Nature", "damp forest floor and moss green", "#eef1e6", "#24301c", "#5a7d2f", "#b08a3e", font="manrope", head="fraunces", bgfx="noise", card="soft", btn="solid", hover="lift"),
    T("ocean", "Nature", "open ocean blues with whitecap foam", "#e7f3fa", "#0c2a40", "#0a7bbf", "#3fd0c9", font="outfit", head="dmserif", bgfx=("aurora", "#9fd5f2", "#c8f1ee", "#7fb6e6"), card="soft", btn="solid", hover="lift", shape="round"),
    T("desert", "Nature", "sandstone, cactus green and sunset clay", "#f4e3c8", "#3d2618", "#c8553d", "#5b8c5a", font="outfit", head="bebas", bgfx=("sunset", "#ffb36b", "#f4e3c8", "#f4e3c8"), card="soft", btn="solid", hover="press", case="uppercase"),
    T("glacier", "Nature", "glacial ice, cold blue light", "#eaf6fb", "#16324a", "#3a9bd9", "#a6e3ff", font="manrope", head="geist", weight=800, bgfx=("aurora", "#bfe8ff", "#ffffff", "#d3ecff"), card="glass", btn="glass", hover="lift", shape="round"),
    T("autumn", "Nature", "maple orange, oak brown, harvest gold", "#fbf1e4", "#3a2416", "#d2601a", "#c99a2e", font="manrope", head="playfair", card="soft", btn="solid", hover="lift"),
    T("volcano", "Nature", "basalt black, flowing lava, ember glow", "#140b08", "#f6e6dc", "#ff4d1a", "#ffb000", font="grotesk", head="unbounded", weight=800, bgfx=("sunset", "#3a0d00", "#140b08", "#140b08"), headfx=("fire",), btn="glow", hover="glow", card="glow"),
]

# ── signature themes: one-of-a-kind, with custom extras ─────────────────────
SIGNATURE = [
    T("pearl", "Signature", "white pearlescent with iridescent pink, mint and blue, like a CS2 Printstream finish", "#fbfaff", "#2a2342", "#8f7fd6", "#7fc8e3",
      font="manrope", head="unbounded", shape="round", bgfx="pearl", headfx=("pearl",), btn="pearl", hover="shine", card="pearl", weight=800, tracking="-.04em",
      extra=".uv-btn--primary:hover { background-position: 100% 0; } .uv-badge--accent { background: linear-gradient(115deg,#ffe6f7,#e3f4ff,#f2ffe6); color: #5a4a8a; border-color: #d9cfee; }"),
    T("black-pearl", "Signature", "black pearlescent with an oil-slick sheen", "#0c0b12", "#efeaff", "#b59cff", "#5ee7d0", font="manrope", head="unbounded", shape="round",
      bgfx=("aurora", "#3b2a6b", "#0d4a52", "#5a1f4a"), headfx=("holo",), btn="gradient", hover="shine", card="glass", weight=800),
    T("sapphire-metal", "Signature", "deep sapphire with a polished metal band through the type", "#060b24", "#e3ecff", "#3d6bff", "#9fc0ff", font="geist", head="geist",
      bgfx=("aurora", "#1a2f8f", "#0b1550", "#2a4ad0"), headfx=("metal", "#0d1f6b", "#d9e6ff"), btn="metal", hover="shine", card="metal", weight=800, tracking="-.04em"),
    T("fade", "Signature", "pink to violet to gold candy fade, inspired by the Fade knife finish", "#fff4fb", "#3a1238", "#ff4fa3", "#ffc93c", font="outfit", head="unbounded",
      shape="round", bgfx=("aurora", "#ffb3d9", "#c9a2ff", "#ffe08a"), headfx=("gradient",), btn="gradient", hover="shine", card="soft", weight=800,
      extra="h1.uv-h1, h2.uv-h2 { background-image: linear-gradient(90deg, #ff4fa3, #a86bff 50%, #ffc93c); }"),
    T("doppler", "Signature", "deep space purple-blue with sparkling dust, inspired by Doppler blades", "#0a0420", "#ece6ff", "#8a5cff", "#29c6ff", font="manrope", head="syne",
      bgfx=("galaxy",), headfx=("gradient",), btn="glow", hover="glow", card="glass", weight=800),
    T("emerald", "Signature", "emerald gem green with a gamma glow", "#03150d", "#dcffee", "#19e38a", "#7affd1", font="manrope", head="cormorant",
      bgfx=("galaxy",), headfx=("metal", "#06402a", "#b7ffe0"), btn="metal", hover="glow", card="glass", weight=700),
    T("ruby", "Signature", "cut ruby red with internal fire", "#16020a", "#ffe3ea", "#ff1f4f", "#ff8aa3", font="manrope", head="cormorant",
      bgfx=("galaxy",), headfx=("metal", "#5a0018", "#ffd0db"), btn="metal", hover="glow", card="glass", weight=700),
    T("marble-fade", "Signature", "swirled red, yellow and blue marble, like a Marble Fade", "#fff8ee", "#2a1a1a", "#e8322f", "#2f6be8", font="outfit", head="unbounded",
      bgfx=("marble",), headfx=("gradient",), btn="gradient", hover="jelly", card="soft", shape="round", weight=800,
      extra="h1.uv-h1, h2.uv-h2 { background-image: linear-gradient(90deg, #e8322f, #f5c518 50%, #2f6be8); }"),
    T("case-hardened", "Signature", "heat-treated steel: blue, gold and bronze patina", "#1a1f2b", "#eef1f7", "#3f7bd9", "#d6a84a", font="rajdhani", head="rajdhani",
      bgfx=("mesh",), headfx=("metal", "#1d3f7a", "#f3d79a"), btn="metal", hover="shine", card="metal", case="uppercase", weight=700, shape="crisp"),
    T("tiger-tooth", "Signature", "molten gold with tiger stripes", "#ffb000", "#1f1200", "#1f1200", "#ff7a00", font="rajdhani", head="bebas", bgfx=("tiger",),
      headfx=("metal", "#3a2000", "#fff1b8"), btn="ink", hover="shine", card="glass", case="uppercase", shape="crisp"),
    T("damascus", "Signature", "folded steel with flowing grain", "#202326", "#e9ecef", "#9aa6b2", "#d0d7de", font="geist", head="grotesk", bgfx=("damascus",),
      headfx=("chrome",), btn="chrome", hover="shine", card="metal", weight=700, shape="crisp"),
    T("crimson-web", "Signature", "deep crimson with a black web pattern", "#3a0306", "#ffe6e6", "#ff2a35", "#000000", font="rajdhani", head="bebas", bgfx=("web",),
      headfx=("glow",), btn="solid", hover="glow", card="glass", case="uppercase", shape="crisp"),
    T("chameleon", "Signature", "colour-shift paint flipping teal to purple", "#0e0a1a", "#efe9ff", "#1fd1c1", "#a24bff", font="outfit", head="unbounded",
      bgfx=("aurora", "#1fd1c1", "#a24bff", "#2a3bff"), headfx=("holo",), btn="gradient", hover="glow", card="gradient-border", weight=800,
      extra=".uv-btn--primary { background-size: 200% 100%; transition: background-position .6s; } .uv-btn--primary:hover { background-position: 100% 0; }"),
    T("candy-apple", "Signature", "deep candy-apple red car paint with a clearcoat", "#1a0306", "#ffe9ec", "#e0102a", "#ff6b81", font="outfit", head="unbounded",
      bgfx=("aurora", "#7a0010", "#3a0008", "#b0001a"), headfx=("metal", "#5a0010", "#ffc2cc"), btn="metal", hover="shine", card="glass", weight=800, shape="round"),
    T("anodized", "Signature", "anodised aluminium in electric blue and violet", "#0d1022", "#e8ecff", "#4f6bff", "#c04bff", font="geist", head="grotesk",
      bgfx=("brushed",), headfx=("metal", "#1a2370", "#d4dcff"), btn="metal", hover="shine", card="metal", weight=700, shape="crisp"),
    T("titanium", "Signature", "brushed titanium greys, precision engineered", "#2c2f33", "#f1f3f5", "#c3cbd4", "#7d8a96", font="geist", head="geist",
      bgfx=("brushed",), headfx=("chrome",), btn="chrome", hover="press", card="metal", weight=700, shape="crisp", tracking="-.03em"),
    T("gunmetal", "Signature", "dark gunmetal with machined edges", "#1b1e22", "#e3e7ec", "#8fa3b8", "#c5d2df", font="rajdhani", head="orbitron",
      bgfx=("brushed",), headfx=("metal", "#3a4652", "#e9eff5"), btn="metal", hover="press", card="notch", case="uppercase", shape="sharp"),
    T("rose-gold", "Signature", "blush rose gold with soft champagne light", "#fff4f1", "#4a2a2a", "#d4877a", "#e8c39e", font="manrope", head="playfair",
      bgfx=("aurora", "#ffd6cc", "#ffe9d6", "#f7c8c0"), headfx=("metal", "#8a4a42", "#ffe2d6"), btn="metal", hover="shine", card="soft", shape="round"),
    T("gold-leaf", "Signature", "black lacquer with hammered gold leaf", "#0b0906", "#f6ead0", "#d4a63a", "#f7e08a", font="cormorant", head="cormorant",
      bgfx=("noise",), headfx=("metal", "#6a4a10", "#fff2c2"), btn="metal", hover="shine", card="double", case="uppercase", tracking=".06em", shape="sharp"),
    T("holo-foil", "Signature", "trading-card holographic foil", "#f4f4f8", "#1d1d2b", "#7a5cff", "#ff5cc8", font="outfit", head="unbounded",
      bgfx=("aurora", "#ff9ae6", "#9ad3ff", "#b8ff9a"), headfx=("holo",), btn="gradient", hover="shine", card="gradient-border", weight=800,
      extra=".uv-card { position: relative; } .uv-btn--primary { background-image: linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6); background-size: 300% 100%; color: #1d1d2b; animation: uvt-holo 6s linear infinite; }"),
    T("carbon-fiber", "Signature", "woven carbon fibre with a racing red accent", "#121314", "#eeeeee", "#ff2b2b", "#ffffff", font="rajdhani", head="orbitron",
      bgfx=("carbon",), headfx=("chrome",), btn="solid", hover="glow", card="notch", case="uppercase", shape="sharp"),
    T("aurora-borealis", "Signature", "northern lights rippling over a polar night", "#050d1a", "#e6fbff", "#3dffb4", "#7a5cff", font="manrope", head="fraunces",
      bgfx=("aurora", "#13d696", "#5b3dff", "#0e8f9a"), headfx=("gradient",), btn="glass", hover="glow", card="glass", shape="round"),
    T("nebula", "Signature", "cosmic dust clouds in magenta and cyan", "#07031a", "#f1e9ff", "#ff4fd8", "#4fd2ff", font="outfit", head="syne",
      bgfx=("galaxy",), headfx=("holo",), btn="glow", hover="glow", card="glass", weight=800),
    T("liquid-chrome", "Signature", "mirror chrome over a cool blue studio", "#dfe5ec", "#151a22", "#5a6b80", "#9fb2c8", font="geist", head="unbounded",
      bgfx=("aurora", "#ffffff", "#b9c7d8", "#e8eef5"), headfx=("chrome",), btn="chrome", hover="shine", card="soft", weight=800, shape="round",
      extra="h1.uv-h1, h2.uv-h2 { filter: drop-shadow(0 2px 0 #0003) drop-shadow(0 10px 20px #0002); }"),
    T("lava-lamp", "Signature", "groovy molten blobs in orange and magenta", "#2a0a1f", "#ffe8f3", "#ff7a1a", "#ff2d95", font="outfit", head="unbounded",
      bgfx=("mesh",), headfx=("fire",), btn="gradient", hover="jelly", card="glass", shape="pill", weight=800),
]

# v13: 62 more themes (new categories Gaming, Luxury, Tech and Seasonal) using the SHARED recipes too
MORE = [
    # Minimal
    T("museum", "Minimal", "gallery-white walls, black captions and one ochre label", "#fafaf7", "#161616", "#c08a2b", font="geist", head="cormorant", shape="sharp", card="frame", btn="ink", hover="invert", weight=600),
    T("oat", "Minimal", "oat-milk beige, cocoa type, soft extruded panels", "#efe7da", "#3d2f24", "#8a5a3b", font="outfit", head="fraunces", shape="round", card="neu", btn="neu", hover="squish", bw=0),
    T("zen", "Minimal", "rice paper, sumi ink and a single vermilion seal", "#f5f1e8", "#1c1a17", "#d4402b", font="manrope", head="cormorant", bgfx="noise", card="frame", btn="stamp", hover="press"),
    T("ledger", "Minimal", "bookkeeping cream with green rules and red totals", "#f6f4e8", "#1f2a22", "#2e7d4f", "#b03a2e", font="mono", head="serif", bgfx="lines", card="dashed", btn="outline", hover="fill", shape="crisp"),
    # Dark
    T("onyx", "Dark", "polished onyx black with chrome-silver type", "#08080a", "#e7e7ea", "#c9ced6", "#6f7680", font="geist", head="geist", headfx="chrome", btn="chrome", card="float", hover="rise", weight=800, tracking="-.04em"),
    T("abyss", "Dark", "the deep trench: soft bioluminescent violet and cyan", "#030614", "#d8e0ff", "#7c5cff", "#2de2e6", font="manrope", head="syne", bgfx="bokeh", btn="glow", card="glass", hover="glow", weight=800),
    T("noir", "Dark", "film noir: black, rain on the window, one ember", "#0d0d0d", "#e8e4dc", "#ff6a3d", font="geist", head="playfair", bgfx="rain", headfx="emboss", card="frame", btn="outline", hover="fill"),
    T("eclipse", "Dark", "a black sun with a corona of gold", "#050505", "#f3eee2", "#ffb43b", "#ff5a1f", font="manrope", head="unbounded", bgfx="rays", headfx="gold", btn="gold", card="glow", hover="rise", weight=800),
    T("ultraviolet", "Dark", "ultraviolet midnight with glossy lilac buttons", "#120a24", "#ece3ff", "#b07cff", "#ff7ad9", font="outfit", head="outfit", bgfx="conic", btn="gel", card="soft", hover="rise", weight=800, shape="round"),
    # Pastel
    T("cotton-candy", "Pastel", "pink and baby-blue spun sugar", "#fff0f7", "#4a2a4a", "#ff7fbf", "#7fcbff", font="outfit", head="unbounded", shape="pill", bgfx="bokeh", btn="candy", card="clay", hover="squish", bw=0, weight=800),
    T("macaron", "Pastel", "pistachio, rose and lemon macarons in a box", "#fbf6ee", "#3d3340", "#ee7fa6", "#9fd296", font="manrope", head="dmserif", shape="round", bgfx="terrazzo", btn="clay", card="clay", hover="pop", bw=0),
    T("periwinkle", "Pastel", "periwinkle blue with a coral pop", "#eef0ff", "#262a55", "#6c74f0", "#ff8a7a", font="outfit", head="outfit", shape="round", btn="gel", card="float", hover="rise", weight=800, bw=0),
    T("sorbet", "Pastel", "mango, raspberry and lime sorbet", "#fff6ea", "#4a2617", "#ff7a59", "#ffc23d", font="outfit", head="bricolage", shape="pill", bgfx="waves", btn="candy", card="soft", hover="bounce", weight=800),
    # Bold
    T("electric", "Bold", "electric blue, hazard yellow and hard pink shadows", "#1033ff", "#ffffff", "#ffe600", "#ff3d7f", font="grotesk", head="bricolage", shape="sharp", bgfx="halftone", btn="duo", card="duo", hover="sink", weight=800, case="uppercase", bw=2),
    T("comic", "Bold", "comic book: halftone dots, thick ink and a POW yellow", "#fff7d6", "#111111", "#ff3b30", "#ffd400", font="grotesk", head="bungee", shape="crisp", bgfx="halftone", headfx="offset", btn="duo", card="duo", hover="shake", bw=2, weight=400),
    T("poster", "Bold", "Swiss poster: huge black type on safety orange", "#ff5a1f", "#111111", "#111111", "#ffffff", font="geist", head="geist", shape="sharp", btn="ink", card="outline", hover="invert", weight=800, tracking="-.06em"),
    T("acid", "Bold", "acid lime on black, like a rave flyer", "#0a0a0a", "#efffd1", "#c6ff00", "#ff2bd6", font="grotesk", head="unbounded", bgfx="plaid", headfx="rgb", btn="duo", card="duo", hover="shake", shape="sharp", weight=800, case="uppercase"),
    # Retro
    T("cassette", "Retro", "70s cassette inlay: mustard, rust and cream", "#f3e7c9", "#3a2a1a", "#d9822b", "#c2452d", font="outfit", head="bricolage", shape="round", bgfx="stripes", btn="3d", card="soft", hover="bounce", weight=800),
    T("diner", "Retro", "50s diner: cherry red, mint and a checker floor", "#f7fbf8", "#222222", "#e2263b", "#5fd0b8", font="outfit", head="pacifico", shape="pill", bgfx="checker", btn="candy", card="float", hover="pop", weight=400),
    T("dos", "Retro", "DOS blue screen with yellow highlights", "#0000aa", "#ffffff", "#ffff55", "#55ffff", font="pixel", head="silkscreen", shape="sharp", btn="pixel", card="outline", hover="invert", case="uppercase"),
    T("pinball", "Retro", "pinball cabinet: chrome rails and flashing lights", "#140818", "#fff2fb", "#ff2e93", "#ffd23f", font="audiowide", head="monoton", bgfx="rays", headfx="retro", btn="candy", card="glow", hover="flicker", weight=400),
    T("vhs", "Retro", "VHS tracking lines with magenta and cyan bleed", "#0b0a12", "#f0eaff", "#ff3df2", "#3dfcff", font="mono", head="bebas", bgfx="scan", headfx="rgb", btn="neon", card="outline", hover="shake", case="uppercase", weight=400),
    T("sepia", "Retro", "an old photograph in warm sepia", "#e9dcc3", "#3b2a1a", "#8b5a2b", font="manrope", head="playfair", bgfx="noise", card="frame", btn="ink", hover="press"),
    # Nature
    T("meadow", "Nature", "spring meadow green with buttercup yellow", "#f2f8ea", "#1f3317", "#4f9d2d", "#f2c230", font="manrope", head="fraunces", shape="round", bgfx="bokeh", btn="clay", card="soft", hover="bounce"),
    T("canyon", "Nature", "red-rock canyon at golden hour, with contour lines", "#2a140c", "#ffe9d6", "#ff7a3d", "#ffc06b", font="outfit", head="dmserif", bgfx="topo", btn="gradient", card="soft", hover="rise"),
    T("rainforest", "Nature", "dense canopy, rain and a parrot-red accent", "#07170f", "#dcf2e2", "#2ecc71", "#ff4d4d", font="manrope", head="syne", bgfx="rain", btn="glow", card="glass", hover="glow", weight=800),
    T("coral-reef", "Nature", "turquoise shallows and living coral", "#e6fbfb", "#08363b", "#ff6f61", "#13b5b1", font="outfit", head="unbounded", shape="pill", bgfx="waves", btn="gel", card="float", hover="squish", weight=800, bw=0),
    T("tundra", "Nature", "snowy tundra, pale sky and lichen", "#eef3f5", "#24323a", "#4f7f90", "#93ad5c", font="geist", head="cormorant", bgfx="topo", btn="soft", card="frame", hover="lift"),
    # Gaming
    T("esports", "Gaming", "esports stage: black, team red and LED white", "#0a0b0f", "#f2f4f8", "#ff2d55", "#ffffff", font="rajdhani", head="orbitron", shape="sharp", bgfx="hex", headfx="metal", btn="solid", card="notch", hover="rise", case="uppercase", weight=900),
    T("rpg", "Gaming", "fantasy RPG: parchment, leather and quest gold", "#2a1d12", "#f2e4c8", "#e0b04a", "#8a2b1d", font="cormorant", head="cinzel", bgfx="noise", headfx="gold", btn="gold", card="double", hover="shine", case="uppercase", tracking=".06em"),
    T("pixel-plains", "Gaming", "8-bit console: sky blue, brick red and coin gold", "#5c94fc", "#ffffff", "#e45c10", "#ffcc00", font="silkscreen", head="press", shape="sharp", btn="pixel", card="outline", hover="sink", weight=400),
    T("hud", "Gaming", "starship HUD: cyan lines over deep space", "#020b14", "#cdeeff", "#38e1ff", "#ff9f1c", font="rajdhani", head="orbitron", shape="sharp", bgfx="grid", headfx="neon-outline", btn="neon", card="notch", hover="flicker", case="uppercase"),
    T("dropzone", "Gaming", "battle-royale map: tactical olive and safety orange", "#1f2219", "#eef0e4", "#ff7b1c", "#c9d16b", font="rajdhani", head="bebas", shape="crisp", bgfx="topo", btn="3d", card="notch", hover="press", case="uppercase", weight=400),
    T("pole-position", "Gaming", "racing sim: carbon, chequered flags and hot yellow", "#111214", "#f3f3f3", "#ffd400", "#ff2b2b", font="rajdhani", head="orbitron", shape="sharp", bgfx="carbon", headfx="offset", btn="solid", card="notch", hover="rise", case="uppercase", weight=900),
    T("harvest", "Gaming", "cozy farm sim: warm wood, cream and leaf green", "#f6ecd4", "#3f2b1a", "#5f9c45", "#e79f3c", font="hand", head="hand", shape="round", bgfx="plaid", btn="clay", card="clay", hover="squish", bw=2, weight=400),
    T("nightmare", "Gaming", "survival horror: rust, flicker and dried blood", "#120c0a", "#e8dcd0", "#c0141e", "#6b4c3b", font="mono", head="creepster", bgfx="noise", headfx="rgb", btn="outline", card="frame", hover="flicker", weight=400),
    # Luxury
    T("champagne", "Luxury", "champagne gold on ivory, with a gilt frame", "#fbf6ea", "#3a2e1d", "#a8822f", "#e6cf9a", font="manrope", head="cinzel", headfx="gold", btn="gold", card="frame", hover="shine", case="uppercase", tracking=".08em"),
    T("velvet-noir", "Luxury", "black velvet, burgundy and a touch of gold", "#0d0608", "#f3e6e8", "#b3123f", "#d4af37", font="manrope", head="playfair", bgfx="vignette", card="double", btn="solid", hover="rise"),
    T("carrara", "Luxury", "white Carrara marble with brushed brass", "#f6f5f2", "#222222", "#a7814a", "#8c8c8c", font="geist", head="cormorant", bgfx="marble", card="frame", btn="gold", hover="lift"),
    T("emerald-club", "Luxury", "private members' club: emerald leather and brass", "#06261c", "#f1ead6", "#d4af37", "#2f8f6a", font="manrope", head="playfair", bgfx="noise", headfx="gold", btn="gold", card="double", hover="shine"),
    T("royal", "Luxury", "royal purple velvet with a gold crest", "#1a0b2e", "#f5edff", "#e5b94c", "#8a5cff", font="cormorant", head="cinzel", bgfx="conic", headfx="gold", btn="gold", card="frame", hover="shine", case="uppercase", tracking=".05em"),
    T("atelier", "Luxury", "fashion atelier: blush, black and gilt", "#f8ece8", "#141010", "#141010", "#c79a5b", font="geist", head="dmserif", card="frame", btn="ink", hover="invert", tracking="-.03em", shape="sharp"),
    # Tech
    T("devtools", "Tech", "IDE dark: slate panels and syntax colours", "#1e1f29", "#e6e6f0", "#7aa2f7", "#f7768e", font="mono", head="mono", shape="crisp", bgfx="grid", btn="solid", card="flat", hover="press", weight=600),
    T("saas", "Tech", "crisp SaaS dashboard white with an indigo accent", "#f7f8fc", "#151a2d", "#4f46e5", "#06b6d4", font="geist", head="geist", shape="round", btn="solid", card="float", hover="rise", weight=800, tracking="-.04em"),
    T("fintech", "Tech", "fintech dark: deep navy and mint gains", "#0a1220", "#e6edf7", "#21d19f", "#5b8cff", font="manrope", head="geist", bgfx="conic", card="float", btn="glow", hover="rise", weight=800),
    T("neural", "Tech", "AI lab graphite with a violet-to-cyan gradient", "#0c0c12", "#ecebf5", "#8b5cf6", "#22d3ee", font="geist", head="geist", bgfx="mesh", headfx="gradient", btn="gradient", card="float", hover="rise", weight=800, tracking="-.04em"),
    T("pcb", "Tech", "green circuit board with copper traces", "#06331f", "#d9ffe9", "#e0a64a", "#3dff9a", font="mono", head="grotesk", bgfx="hex", btn="metal", card="dashed", hover="glow", shape="crisp"),
    T("quantum", "Tech", "white lab with iridescent particles", "#f8f9ff", "#1a1b3a", "#5b5bf0", "#ff5cc8", font="outfit", head="unbounded", bgfx="bokeh", headfx="holo", btn="holo", card="holo", hover="rise", weight=800, shape="round"),
    T("mainframe", "Tech", "green code rain on a black mainframe", "#000800", "#c8ffcf", "#00ff66", font="mono", head="mono", bgfx="rain", headfx="glow", btn="neon", card="outline", hover="flicker", shape="sharp"),
    T("hologram", "Tech", "blue hologram projection with scan lines", "#04101c", "#cff4ff", "#4fd8ff", "#9b7bff", font="rajdhani", head="orbitron", bgfx="scan", headfx="neon-outline", btn="neon", card="glow", hover="glow", case="uppercase"),
    # Seasonal
    T("pumpkin", "Seasonal", "pumpkin orange and witch purple at midnight", "#120a1c", "#fdeedd", "#ff7a00", "#8b3dff", font="outfit", head="creepster", bgfx="bokeh", headfx="glow", btn="3d", card="glow", hover="wobble", weight=400),
    T("frost", "Seasonal", "winter frost, ice blue and silver", "#eef6fb", "#16324a", "#2f8fc8", "#9fc6dd", font="manrope", head="cormorant", bgfx="bokeh", headfx="ice", btn="gel", card="float", hover="lift", weight=700),
    T("evergreen", "Seasonal", "evergreen, cranberry and gold ribbon", "#0f2a1d", "#fbf3e4", "#d62839", "#e9c46a", font="manrope", head="playfair", bgfx="plaid", headfx="gold", btn="candy", card="double", hover="bounce"),
    T("april", "Seasonal", "spring showers: fresh green, sky and tulip pink", "#f3faf6", "#1f3a33", "#2fae8a", "#ff7eb6", font="outfit", head="fraunces", bgfx="rain", btn="clay", card="soft", hover="bounce", shape="round"),
    T("beach", "Seasonal", "summer beach: sand, sea and sun", "#fff8e6", "#11414a", "#ff8a3d", "#18b8c9", font="outfit", head="pacifico", bgfx="waves", btn="candy", card="float", hover="squish", shape="pill", weight=400),
    T("midnight-gala", "Seasonal", "new year's eve: black tie and gold confetti", "#0a0a0f", "#f6f1e6", "#e8c15a", "#ffffff", font="manrope", head="playfair", bgfx="terrazzo", headfx="gold", btn="gold", card="glow", hover="shine"),
    # Signature
    T("fire-ice", "Signature", "half blazing orange, half glacier blue", "#0b0b14", "#f2f4ff", "#ff6a1a", "#3ab4ff", font="outfit", head="unbounded", bgfx="conic", headfx="gradient", btn="gradient", card="gradient-border", hover="rise", weight=800,
      extra="h1.uv-h1, h2.uv-h2 { background-image: linear-gradient(90deg, #ff3d00, #ffb300 35%, #9fe6ff 65%, #2f7bff); }"),
    T("toxic", "Signature", "radioactive green on hazard-striped black", "#0b0f05", "#eaffd6", "#a6ff00", "#ffd400", font="rajdhani", head="orbitron", bgfx="stripes", headfx="glow", btn="neon", card="notch", hover="flicker", case="uppercase", shape="sharp"),
    T("bismuth", "Signature", "bismuth crystal: stepped rainbow oxide terraces", "#14101e", "#f2ecff", "#ff6ad5", "#5ee7d0", font="outfit", head="unbounded", bgfx="iso", headfx="rainbow", btn="holo", card="holo", hover="rise", weight=800, shape="crisp"),
    T("opal", "Signature", "white opal with flashes of colour fire", "#f6f8fb", "#202436", "#6d7cff", "#ff7ab8", font="manrope", head="cormorant", bgfx="bokeh", headfx="holo", btn="pearl", card="pearl", hover="shine", weight=700),
    T("magma", "Signature", "cooling magma: black crust and glowing seams", "#0f0705", "#ffe8dc", "#ff4d00", "#ffb000", font="outfit", head="syne", bgfx="topo", headfx="fire", btn="glow", card="glow", hover="rise", weight=800),
    T("ronin", "Signature", "red lacquer armour and black steel", "#120404", "#ffece6", "#ff2a1a", "#d4af37", font="grotesk", head="bebas", bgfx="rays", headfx="glow", btn="solid", card="notch", hover="rise", case="uppercase", weight=400),
]

ALL = SPECS + SIGNATURE + MORE


def gen_theme(s):
    c, dark = derive(s)
    sel = f'[data-uv-theme="{s["name"]}"]'
    rs = SHAPES[s["shape"]]
    f_body, f_head = FONTS[s["font"]][0], FONTS[s["head"]][0]
    toks = "; ".join(f"--uv-{k}: {v}" for k, v in c.items())
    lines = [f"/* @theme {s['name']} — {s['desc']} */",
             f"{sel} {{\n  {toks};\n  --uv-font: {f_body}; --uv-font-head: {f_head}; --uv-serif: {f_head}; --uv-btn-font: {f_body};\n"
             f"  --uv-r-xs: {min(rs[0], 999)}px; --uv-r-sm: {rs[0]}px; --uv-r: {rs[1]}px; --uv-r-lg: {rs[2]}px; --uv-bw: {s['bw']}px;\n"
             f"  --uv-head-weight: {s['weight'] or (400 if s['head'] in ('serif', 'cormorant', 'dmserif') else 700)}; --uv-head-case: {s['case']};"
             + (f" --uv-head-tracking: {s['tracking']};" if s["tracking"] else "")
             + ("\n  color-scheme: dark;" if dark else "") + "\n  " + bg_css(s["bgfx"][0], c, dark, list(s["bgfx"][1:])) + "\n}"]
    hc = head_css(s["headfx"][0], c, dark, list(s["headfx"][1:]))
    if hc: lines.append(f"{sel} .uv-h1, {sel} .uv-h2 {{ {hc} }}")
    if s["case"] == "uppercase": lines.append(f"{sel} .uv-btn {{ text-transform: uppercase; letter-spacing: .08em; }}")
    bc = btn_css(s["btn"], c, dark, [])
    if bc: lines.append(f"{sel} .uv-btn--primary, {sel} .uv-btn--grad {{ {bc} }}")
    lines.append(f"{sel} .uv-btn--primary:hover {{ filter: brightness(1.06); }}")
    cc = card_css(s["card"], c, dark)
    if cc: lines.append(f"{sel} .uv-card {{ {cc} }}")
    lines.append(f"{sel} .uv-tabs > .uv-tabs__ind {{ background: {c['accent']}; }} {sel} .uv-tabs > button[aria-selected=\"true\"] {{ color: {on(c['accent'])}; }}")
    lines.append(f"{sel} .uv-switch input:checked + i, {sel} .uv-check input:checked {{ background: {c['accent']}; border-color: {c['accent']}; }}")
    lines.append(f"{sel} .uv-progress > i {{ background: {c['accent']}; }} {sel} .uv-ring {{ background: conic-gradient({c['accent']} calc(var(--v) * 1%), var(--uv-line-2) 0); }}")
    lines.append(f"{sel} .uv-input:focus, {sel} .uv-select:focus, {sel} .uv-textarea:focus {{ border-color: {c['accent']}; box-shadow: 0 0 0 3px {alpha(c['accent'], .22)}; }}")
    lines.append(hover_css(s["hover"], sel, c, dark).strip())
    if s["extra"]:
        for rule in s["extra"].split("}"):
            if "{" not in rule: continue
            sels, body = rule.split("{", 1)
            lines.append(", ".join(f"{sel} {x.strip()}" for x in sels.split(",")) + " {" + body + "}")
    return "\n".join(lines) + "\n"


def generate():
    css = "/* UI Vault — generated themes (tools/theme_specs.py). Do not edit by hand. */\n" + "\n".join(gen_theme(s) for s in ALL)
    meta = {s["name"]: {"category": s["cat"], "style": {"background": s["bgfx"][0], "heading": s["headfx"][0], "button": s["btn"], "hover": s["hover"],
                                                        "card": s["card"], "font": s["font"], "head": s["head"], "shape": s["shape"]}} for s in ALL}
    families = sorted({FONTS[k][1] for k in FONTS if FONTS[k][1]})
    fonts_url = "https://fonts.googleapis.com/css2?" + "&".join("family=" + f for f in families) + "&display=swap"
    return css, meta, fonts_url


# metadata for the 12 hand-written themes in themes.src.css
CORE_META = {
    "editorial": ("Minimal", "flat", "plain", "ink", "lift", "flat"), "brutal": ("Bold", "flat", "plain", "hard", "sink", "hard"),
    "neon": ("Dark", "flat", "glow", "solid", "glow", "glow"), "glass": ("Dark", "aurora", "plain", "glass", "lift", "glass"),
    "terminal": ("Retro", "scan", "glow", "solid", "press", "outline"), "soft": ("Pastel", "flat", "plain", "solid", "lift", "soft"),
    "retro": ("Retro", "flat", "plain", "bevel", "press", "bevel"), "swiss": ("Minimal", "flat", "plain", "solid", "invert", "outline"),
    "y2k": ("Signature", "pearl", "metal", "pearl", "lift", "soft"), "mono": ("Minimal", "flat", "plain", "ink", "invert", "outline"),
    "sketch": ("Minimal", "lines", "plain", "solid", "wobble", "paper"), "luxe": ("Dark", "flat", "plain", "solid", "lift", "double"),
}
