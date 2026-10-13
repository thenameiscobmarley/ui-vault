"""UI Vault parts — element designs you can mix and match (buttons, cards, inputs, switches, …).

Each family is applied with an attribute on any element (usually <html>):
    <html data-uv-btn="pearl" data-uv-card="glass" data-uv-input="underline">
or on a single element:  <button class="uv-btn" data-uv-btn="chrome">
Colours always come from the current theme's tokens, so every part works with every theme.

CSS shorthand used below (expanded by expand()):
    $      the family's elements, e.g. :is(.uv-btn, .btn):not(#_)   ($P = primary buttons, $I = nav items, $A = active nav item)
    %A %A2 %T %BG %S %S2 %S3 %L %L1 %M %OA   theme tokens (accent, accent-2, text, bg, surface…, line-2, line, muted, on-accent)
    ~A40   the token at 40% opacity          DK(A,30) / LT(A,30)   token darkened / lightened 30%
Each part also has an `approx` used by the Python and C++ exporters (Qt, Tk, ImGui, raygui, JUCE):
    r radius px (999 = pill) · bw border px · fill (see FILLS) · w font weight · up uppercase
"""
import re

FILLS = ["solid", "outline", "ghost", "soft", "grad", "metal", "deepmetal", "chrome", "pearl", "holo", "gold", "glass", "bevel",
         "hard", "neon", "inverse", "flat", "sunken", "underline", "printstream", "clay"]

PEARL = "linear-gradient(115deg, #ffffff 0%, #f3e8ff 22%, #e0f4ff 42%, #fff4dc 62%, #ffe6f4 80%, #ffffff 100%)"
CHROME = "linear-gradient(180deg, #ffffff 0%, #dfe3ea 40%, #8a919c 50%, #c9ced6 62%, #f4f6f9 100%)"
GOLD = "linear-gradient(180deg, #fff3c4 0%, #e6c25a 40%, #9a6f12 52%, #d8b04a 66%, #fff0b8 100%)"
DEEP = "linear-gradient(180deg, #a9cbff 0%, #3f74dc 30%, #0a2560 50%, #1d4cad 64%, #86b4ff 100%)"
HOLO = "linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6, #9ad3ff)"
CLIP = "-webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent;"


def P(name, label, desc, css, r=8, bw=1, fill="solid", w=600, up=False):
    return {"name": name, "label": label, "desc": desc, "css": css, "approx": {"r": r, "bw": bw, "fill": fill, "w": w, "up": up}}


# ── Buttons ──────────────────────────────────────────────────────────────────
BTN = [
    P("solid", "Solid", "the accent, filled; lifts a touch on hover", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 10px; }
$:hover { border-color: %T; }
$P { background: %A; color: %OA; border-color: %A; }
$P:hover { background: DK(A,12); transform: translateY(-1px); }
$:active { transform: translateY(1px); }""", 10, 1, "solid"),
    P("pill", "Pill", "fully round, soft shadow", """
$ { border-radius: 999px; background: %S2; color: %T; border: 1px solid %L; padding-inline: 1.4em; }
$:hover { background: %S3; }
$P { background: %A; color: %OA; border-color: transparent; box-shadow: 0 6px 18px -8px %A; }
$P:hover { box-shadow: 0 10px 26px -8px %A; transform: translateY(-1px); }""", 999, 1, "solid"),
    P("outline", "Outline", "1.5px accent border, fills on hover", """
$ { background: transparent; color: %T; border: 1.5px solid %L; border-radius: 8px; }
$:hover { border-color: %A; color: %A; }
$P { color: %A; border-color: %A; }
$P:hover { background: %A; color: %OA; }""", 8, 2, "outline"),
    P("soft", "Soft", "tinted accent background, no border", """
$ { background: ~T6; color: %T; border: 1px solid transparent; border-radius: 10px; }
$:hover { background: ~T12; }
$P { background: ~A18; color: color-mix(in srgb, %A 70%, %T); }
$P:hover { background: ~A28; }""", 10, 0, "soft"),
    P("ghost", "Ghost", "text only until you hover", """
$ { background: transparent; color: %T; border: 1px solid transparent; border-radius: 8px; }
$:hover { background: ~T8; }
$P { color: %A; }
$P:hover { background: ~A12; }""", 8, 0, "ghost"),
    P("gradient", "Gradient", "accent → accent-2 sweep that slides on hover", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 10px; }
$:hover { border-color: %A; }
$P { border: 0; color: #fff; background-image: linear-gradient(110deg, %A, %A2, %A); background-size: 200% 100%; text-shadow: 0 1px 1px #0003; }
$P:hover { background-position: 100% 0; }""", 10, 0, "grad"),
    P("glow", "Glow", "neon halo that brightens on hover", """
$ { background: ~A8; color: %T; border: 1px solid ~A40; border-radius: 10px; box-shadow: 0 0 12px -4px ~A60; }
$:hover { box-shadow: 0 0 22px -4px %A; border-color: %A; }
$P { background: %A; color: %OA; border-color: %A; box-shadow: 0 0 18px -2px %A, inset 0 1px 0 #ffffff55; }
$P:hover { box-shadow: 0 0 34px 0 %A, inset 0 1px 0 #ffffff55; }""", 10, 1, "neon"),
    P("neon-tube", "Neon tube", "outlined glass tube with glowing text, flickers on hover", """
$ { background: transparent; color: LT(A,40); border: 2px solid %A; border-radius: 999px; text-shadow: 0 0 6px %A, 0 0 14px %A; box-shadow: 0 0 10px -2px %A, inset 0 0 10px -3px %A; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .12em; }
$:hover { animation: uvp-flicker 1.4s linear infinite; }
$P { border-color: %A2; color: LT(A2,45); text-shadow: 0 0 6px %A2, 0 0 14px %A2; box-shadow: 0 0 12px -2px %A2, inset 0 0 12px -3px %A2; }""", 999, 2, "neon", 500, True),
    P("3d", "3D press", "raised key that physically presses down", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 10px; box-shadow: 0 4px 0 %L, 0 6px 12px -6px #0006; }
$:hover { transform: translateY(-1px); box-shadow: 0 5px 0 %L, 0 8px 14px -6px #0006; }
$:active { transform: translateY(4px); box-shadow: 0 0 0 %L; }
$P { background: %A; color: %OA; border-color: DK(A,20); box-shadow: 0 5px 0 DK(A,40), 0 8px 16px -6px #0007; }
$P:hover { box-shadow: 0 6px 0 DK(A,40), 0 10px 18px -6px #0007; }
$P:active { box-shadow: 0 0 0 DK(A,40); transform: translateY(5px); }""", 10, 1, "hard"),
    P("brutal", "Brutal", "thick ink border, hard offset shadow", """
$ { background: %BG; color: %T; border: 2px solid %T; border-radius: 0; box-shadow: 4px 4px 0 %T; font-weight: 700; }
$:hover { transform: translate(-1px, -1px); box-shadow: 5px 5px 0 %T; }
$:active { transform: translate(4px, 4px); box-shadow: 0 0 0 %T; }
$P { background: %A; color: %OA; }""", 0, 2, "hard", 700),
    P("brutal-pop", "Brutal pop", "two-colour stacked shadow that grows on hover", """
$ { background: %S; color: %T; border: 2.5px solid %T; border-radius: 12px; box-shadow: 3px 3px 0 %A2, 6px 6px 0 %T; font-weight: 800; }
$:hover { transform: translate(-2px, -2px); box-shadow: 5px 5px 0 %A2, 9px 9px 0 %T; }
$:active { transform: translate(4px, 4px); box-shadow: 0 0 0 %A2, 0 0 0 %T; }
$P { background: %A; color: %OA; }""", 12, 3, "hard", 800),
    P("metal", "Anodised metal", "the accent as polished anodised metal with a moving sheen", """
$ { border: 1px solid DK(A,45); border-radius: 8px; color: #fff; text-shadow: 0 1px 0 #0008; overflow: hidden;
    background: linear-gradient(100deg, transparent 35%, #ffffff66 50%, transparent 65%) 150% 0 / 250% 100% no-repeat, linear-gradient(180deg, LT(A,55) 0%, LT(A,12) 44%, DK(A,30) 54%, LT(A,8) 100%);
    box-shadow: inset 0 1px 0 #ffffffaa, 0 4px 12px -4px DK(A,50); transition: background-position .8s, transform .15s; }
$:hover { background-position: -50% 0, 0 0; }
$:active { transform: translateY(1px); }""", 8, 1, "metal"),
    P("deep-metal", "Deep blue metal", "dark navy chrome — the deep-blue metal look", """
$ { border: 1px solid #071a45; border-radius: 8px; color: #f2f7ff; text-shadow: 0 -1px 0 #031030, 0 0 8px #6fa3ff66; overflow: hidden; letter-spacing: .04em;
    background: linear-gradient(100deg, transparent 35%, #ffffff55 50%, transparent 65%) 150% 0 / 250% 100% no-repeat, DEEP;
    box-shadow: inset 0 1px 0 #d6e6ff, inset 0 -1px 0 #021033, 0 6px 16px -6px #0a2a7a; transition: background-position .9s, transform .15s, box-shadow .25s; }
$:hover { background-position: -50% 0, 0 0; box-shadow: inset 0 1px 0 #d6e6ff, inset 0 -1px 0 #021033, 0 8px 24px -6px #2f6bff; }
$:active { transform: translateY(1px); }""", 8, 1, "deepmetal"),
    P("chrome", "Chrome", "mirror-polished silver with a dark horizon line", """
$ { background: CHROME; color: #1b1f26; border: 1px solid #7d848f; border-radius: 999px; text-shadow: 0 1px 0 #fff; box-shadow: inset 0 1px 0 #fff, inset 0 -2px 3px #0002, 0 4px 10px -4px #0008; }
$:hover { filter: brightness(1.06) contrast(1.05); transform: translateY(-1px); }
$:active { transform: translateY(1px); box-shadow: inset 0 2px 4px #0004; }""", 999, 1, "chrome"),
    P("pearl", "Pearlescent", "Y2K mother-of-pearl; colours drift as you hover", """
$ { background: PEARL; background-size: 220% 100%; color: #3a2f5a; border: 1px solid #d9cfee; border-radius: 999px; box-shadow: inset 0 1px 0 #fff, inset 0 -6px 12px -6px #c8b6ff66, 0 6px 16px -8px #7a6a9e88; transition: background-position 1.2s, transform .2s, box-shadow .3s; }
$:hover { background-position: 100% 0; box-shadow: inset 0 1px 0 #fff, inset 0 -6px 12px -6px #9fd8ff88, 0 10px 24px -8px #7a6a9eaa; transform: translateY(-1px); }
$P { border-color: #b9a6ea; font-weight: 700; }""", 999, 1, "pearl"),
    P("holo", "Holo foil", "holographic foil that shifts hue under the cursor", """
$ { background: HOLO; background-size: 300% 100%; color: #2a1f3d; border: 1px solid #ffffffaa; border-radius: 12px; box-shadow: inset 0 1px 0 #fff, 0 6px 18px -8px #b07cff; transition: background-position 1.6s ease, transform .2s; }
$:hover { background-position: 100% 0; transform: translateY(-1px) rotate(-.6deg); }""", 12, 1, "holo"),
    P("printstream", "Printstream", "pearl white panel, black frame, iridescent sheen — like the CS2 skin", """
$ { color: #101014; border: 2px solid #0d0d10; border-radius: 4px; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; overflow: hidden;
    background: linear-gradient(115deg, transparent 30%, #e7d9ff99 42%, #c9ecff99 50%, #fff1d699 58%, transparent 70%) 160% 0 / 260% 100% no-repeat, linear-gradient(135deg, #0d0d10 0 10px, #fbfaff 10px calc(100% - 10px), #0d0d10 calc(100% - 10px));
    box-shadow: 0 6px 18px -8px #6a5a9a; transition: background-position 1s, transform .2s; }
$:hover { background-position: -60% 0, 0 0; transform: translateY(-1px); }""", 4, 2, "printstream", 700, True),
    P("glass", "Frosted glass", "translucent pane with a bright top edge", """
$ { background: ~S45; color: %T; border: 1px solid #ffffff40; border-radius: 12px; backdrop-filter: blur(10px) saturate(1.4); -webkit-backdrop-filter: blur(10px) saturate(1.4); box-shadow: inset 0 1px 0 #ffffff66, 0 8px 24px -12px #0008; }
$:hover { background: ~S65; }
$P { background: ~A55; color: #fff; border-color: #ffffff66; }
$P:hover { background: ~A75; }""", 12, 1, "glass"),
    P("aqua", "Aqua gel", "2001 glossy gel pill with a wet highlight", """
$ { border-radius: 999px; border: 1px solid DK(A,40); color: #fff; text-shadow: 0 1px 1px #0006; overflow: hidden;
    background: radial-gradient(120% 60% at 50% 115%, LT(A,45), transparent 60%), linear-gradient(180deg, LT(A,25), %A 55%, DK(A,15));
    box-shadow: inset 0 -3px 6px DK(A,25), 0 3px 8px -2px DK(A,30); }
$::before { content: ""; position: absolute; left: 10%; right: 10%; top: 2px; height: 45%; border-radius: 999px; background: linear-gradient(#ffffffd0, #ffffff20); pointer-events: none; }
$:hover { filter: brightness(1.08) saturate(1.1); }
$:active { filter: brightness(.95); }""", 999, 1, "grad"),
    P("win98", "Windows 98", "system-grey bevel, presses in", """
$ { background: #c3c3c3; color: #000; border: 0; border-radius: 0; font-weight: 400; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf; }
$:active { box-shadow: inset -1px -1px #fff, inset 1px 1px #0a0a0a, inset -2px -2px #dfdfdf, inset 2px 2px #808080; padding-top: 2px; }
$:focus-visible { outline: 1px dotted #000; outline-offset: -5px; }
$P { font-weight: 700; }""", 0, 2, "bevel", 400),
    P("pixel", "Pixel", "8-bit stepped corners and a chunky drop", """
$ { border: 0; border-radius: 0; background: %S2; color: %T; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .06em;
    clip-path: polygon(0 4px, 4px 4px, 4px 0, calc(100% - 4px) 0, calc(100% - 4px) 4px, 100% 4px, 100% calc(100% - 4px), calc(100% - 4px) calc(100% - 4px), calc(100% - 4px) 100%, 4px 100%, 4px calc(100% - 4px), 0 calc(100% - 4px));
    box-shadow: inset -4px -4px 0 #0004, inset 4px 4px 0 #ffffff30; }
$:hover { filter: brightness(1.12); }
$:active { box-shadow: inset 4px 4px 0 #0004; }
$P { background: %A; color: %OA; }""", 0, 0, "hard", 600, True),
    P("terminal", "Terminal", "mono prompt: > run_ with a blinking caret", """
$ { background: transparent; color: %A; border: 1px solid ~A50; border-radius: 0; font-family: var(--uv-mono); }
$::before { content: "> "; white-space: pre; opacity: .7; }
$:hover { background: ~A12; }
$:hover::after { content: "_"; animation: uvp-blink 1s steps(1) infinite; }
$P { background: %A; color: %BG; border-color: %A; }
$P:hover { background: LT(A,15); }""", 0, 1, "outline", 500),
    P("clay", "Clay", "puffy claymorphism with inner light and a soft drop", """
$ { background: %S2; color: %T; border: 0; border-radius: 18px; box-shadow: inset 0 -4px 8px #0000001f, inset 0 4px 8px #ffffff70, 0 10px 20px -10px #0006; }
$:hover { transform: translateY(-2px) scale(1.02); }
$:active { transform: scale(.97); }
$P { background: LT(A,10); color: %OA; box-shadow: inset 0 -5px 10px DK(A,30), inset 0 5px 10px LT(A,45), 0 12px 22px -10px DK(A,30); }""", 18, 0, "clay"),
    P("neumorph", "Neumorphic", "soft UI: extruded from the background, sinks when pressed", """
$ { background: %BG; color: %T; border: 0; border-radius: 14px; box-shadow: 5px 5px 12px DK(BG,22), -5px -5px 12px LT(BG,40); }
$:hover { color: %A; }
$:active { box-shadow: inset 4px 4px 10px DK(BG,22), inset -4px -4px 10px LT(BG,40); }
$P { color: %A; font-weight: 700; }""", 14, 0, "flat"),
    P("gold", "Gold foil", "embossed gold leaf, black lacquer text", """
$ { background: GOLD; color: #2a1a00; border: 1px solid #8a5f0c; border-radius: 2px; text-transform: uppercase; letter-spacing: .14em; text-shadow: 0 1px 0 #fff6; box-shadow: inset 0 1px 0 #fff8, 0 4px 14px -6px #6b4a0a; font-weight: 700; }
$:hover { filter: brightness(1.08) saturate(1.15); }""", 2, 1, "gold", 700, True),
    P("liquid", "Liquid", "blobby radius that morphs on hover", """
$ { border-radius: 30% 70% 70% 30% / 30% 30% 70% 70%; background: %S2; color: %T; border: 1px solid %L; transition: border-radius .6s var(--uv-spring), transform .3s, background .3s; }
$:hover { border-radius: 70% 30% 30% 70% / 60% 40% 60% 40%; transform: scale(1.04); }
$P { background: linear-gradient(135deg, %A, %A2); color: #fff; border: 0; }""", 999, 1, "grad"),
    P("slide-fill", "Slide fill", "accent fill sweeps in from the left", """
$ { background: linear-gradient(%A, %A) no-repeat 0 0 / 0% 100%, transparent; color: %T; border: 1.5px solid %A; border-radius: 6px; transition: background-size .35s var(--uv-ease), color .3s; }
$:hover { background-size: 100% 100%; color: %OA; }
$P { background-color: ~A12; }""", 6, 2, "outline"),
    P("underline", "Underline", "text with an underline that draws itself", """
$ { background: linear-gradient(currentColor, currentColor) no-repeat 0 calc(100% - 6px) / 0% 2px; color: %T; border: 0; border-radius: 0; padding-inline: 2px; transition: background-size .35s var(--uv-ease), color .2s; }
$:hover { background-size: 100% 2px; }
$P { color: %A; background-size: 100% 2px; }
$P:hover { background-size: 0% 2px; }""", 0, 0, "underline", 600),
    P("bracket", "Brackets", "[ label ] — brackets slide in on hover", """
$ { background: transparent; color: %T; border: 0; border-radius: 0; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .08em; }
$::before, $::after { content: "["; display: inline-block; color: %A; transition: transform .25s var(--uv-spring); }
$::after { content: "]"; }
$:hover::before { transform: translateX(-5px); }
$:hover::after { transform: translateX(5px); }
$P { color: %A; }""", 0, 0, "ghost", 600, True),
    P("arrow", "Arrow link", "label → arrow that nudges forward", """
$ { background: transparent; color: %T; border: 0; border-bottom: 1px solid %L; border-radius: 0; padding-inline: 0; }
$::after { content: "→"; display: inline-block; transition: transform .25s var(--uv-spring); }
$:hover { border-color: %T; }
$:hover::after { transform: translateX(5px); }
$P { color: %A; border-color: %A; }""", 0, 1, "underline", 500),
    P("split", "Split", "label + a separate arrow chip", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 8px; padding-right: 3.2em; overflow: hidden; }
$::after { content: "↗"; position: absolute; right: 0; top: 0; bottom: 0; width: 2.4em; display: grid; place-items: center; border-left: 1px solid %L; background: ~T6; transition: background .2s, color .2s; }
$:hover::after { background: %A; color: %OA; }
$P { background: %A; color: %OA; border-color: %A; }
$P::after { background: DK(A,18); border-color: DK(A,25); }""", 8, 1, "solid"),
    P("sticker", "Sticker", "die-cut sticker with a white edge; peels on hover", """
$ { background: %A; color: %OA; border: 3px solid #fff; border-radius: 14px; box-shadow: 0 3px 0 #0002, 0 8px 18px -6px #0006; transform: rotate(-1.5deg); font-weight: 800; }
$:hover { transform: rotate(1deg) scale(1.05); box-shadow: 0 6px 0 #0002, 0 16px 26px -8px #0007; }
$:not($P) { background: %S; color: %T; }""", 14, 3, "solid", 800),
    P("stamp", "Stamp", "rubber stamp: double border, rotated, uppercase", """
$ { background: transparent; color: %A; border: 3px double %A; border-radius: 4px; text-transform: uppercase; letter-spacing: .16em; font-weight: 800; transform: rotate(-2deg); opacity: .9; }
$:hover { opacity: 1; transform: rotate(0deg) scale(1.03); }
$P { background: ~A10; }""", 4, 3, "outline", 800, True),
    P("candy", "Candy stripe", "barber-pole stripes that roll on hover", """
$ { color: #fff; border: 2px solid DK(A,25); border-radius: 999px; text-shadow: 0 1px 2px #0007; font-weight: 800;
    background: repeating-linear-gradient(-45deg, %A 0 12px, LT(A,25) 12px 24px); background-size: 34px 34px; }
$:hover { animation: uvp-roll .6s linear infinite; }
$:not($P) { background: repeating-linear-gradient(-45deg, %S2 0 12px, %S3 12px 24px); color: %T; text-shadow: none; border-color: %L; }""", 999, 2, "grad", 800),
    P("jelly", "Jelly", "squishes like jelly when hovered", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 14px; }
$:hover { animation: uvp-jelly .55s; }
$P { background: %A; color: %OA; border-color: transparent; }""", 14, 1, "solid"),
    P("shine", "Shine sweep", "a highlight sweeps across on hover", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 8px; overflow: hidden; }
$::after { content: ""; position: absolute; inset: 0; background: linear-gradient(110deg, transparent 30%, #ffffff70 50%, transparent 70%); transform: translateX(-120%); transition: transform .7s; pointer-events: none; }
$:hover::after { transform: translateX(120%); }
$P { background: %A; color: %OA; border-color: %A; }""", 8, 1, "solid"),
    P("border-spin", "Spinning border", "a gradient border that rotates around the button", """
$ { border: 2px solid transparent; border-radius: 10px; color: %T; background: linear-gradient(%S, %S) padding-box, conic-gradient(from var(--uv-a, 0deg), %A, %A2, transparent 40%, %A) border-box; animation: uv-spin-a 3s linear infinite; }
$:hover { animation-duration: 1.2s; }
$P { background: linear-gradient(~A20, ~A20) padding-box, conic-gradient(from var(--uv-a, 0deg), %A, %A2, transparent 40%, %A) border-box; }""", 10, 2, "outline"),
    P("cyber", "Cyber", "clipped corners, hazard yellow edge, glitch on hover", """
$ { border: 0; border-radius: 0; background: %S2; color: %T; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .1em; padding-inline: 1.6em; box-shadow: inset 3px 0 0 %A;
    clip-path: polygon(0 0, calc(100% - 12px) 0, 100% 12px, 100% 100%, 12px 100%, 0 calc(100% - 12px)); }
$:hover { animation: uvp-glitch .35s steps(2) 2; }
$P { background: %A; color: %OA; box-shadow: inset -4px 0 0 DK(A,35); }""", 0, 0, "solid", 600, True),
    P("synth", "Synthwave", "80s sunset gradient with a chrome-pink glow", """
$ { color: #fff; border: 0; border-radius: 6px; font-weight: 800; text-transform: uppercase; letter-spacing: .12em; font-style: italic;
    background: linear-gradient(180deg, #ff3cac 0%, #784ba0 55%, #2b86c5 100%); text-shadow: 0 0 8px #ff6ec7, 0 2px 0 #3a0a4a; box-shadow: 0 0 0 2px #ff6ec7aa, 0 0 22px -2px #ff3cac; }
$:hover { box-shadow: 0 0 0 2px #fff, 0 0 32px 0 #ff3cac; transform: translateY(-1px); }""", 6, 2, "grad", 800, True),
    P("ink", "Ink", "inverted: text-colour block that flips to accent", """
$ { background: %T; color: %BG; border: 1px solid %T; border-radius: 3px; }
$:hover { background: %A; border-color: %A; color: %OA; }
$:not($P) { background: transparent; color: %T; }
$:not($P):hover { background: %T; color: %BG; }""", 3, 1, "inverse", 500),
    P("paper", "Paper cut", "paper card with a lifted corner shadow", """
$ { background: %S; color: %T; border: 1px solid %L1; border-radius: 2px; box-shadow: 0 1px 1px #0001, 2px 3px 0 ~T12, 4px 6px 10px -4px #0003; }
$:hover { transform: translate(-1px, -2px) rotate(-.5deg); box-shadow: 0 1px 1px #0001, 4px 6px 0 ~T12, 8px 12px 16px -6px #0003; }
$P { border-bottom: 3px solid %A; }""", 2, 1, "flat", 500),
    P("arcade", "Arcade", "chunky round cabinet button with a hot top highlight", """
$ { border-radius: 16px; border: 3px solid DK(A,45); background: radial-gradient(80% 50% at 50% 10%, #ffffff80, transparent 60%), %A; color: %OA; font-weight: 900; text-transform: uppercase; letter-spacing: .06em; box-shadow: 0 6px 0 DK(A,50), 0 10px 18px -6px #000a; }
$:active { transform: translateY(6px); box-shadow: 0 0 0 DK(A,50); }
$:not($P) { background: radial-gradient(80% 50% at 50% 10%, #ffffff60, transparent 60%), %A2; border-color: DK(A2,45); box-shadow: 0 6px 0 DK(A2,50), 0 10px 18px -6px #000a; }""", 16, 3, "hard", 900, True),
    P("halo", "Halo ring", "a ring blooms around the button on hover", """
$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 999px; box-shadow: 0 0 0 0 ~A50; transition: box-shadow .35s var(--uv-ease), background .2s; }
$:hover { box-shadow: 0 0 0 5px ~A25, 0 0 0 10px ~A10; }
$P { background: %A; color: %OA; border-color: %A; }""", 999, 1, "solid"),
    P("duo-shadow", "Duo shadow", "two offset accent shadows, swap on hover", """
$ { background: %S; color: %T; border: 1.5px solid %T; border-radius: 6px; box-shadow: -3px -3px 0 %A2, 3px 3px 0 %A; }
$:hover { box-shadow: 3px 3px 0 %A2, -3px -3px 0 %A; }
$P { background: %T; color: %BG; }""", 6, 2, "hard", 700),
    P("lava", "Lava gloss", "molten orange-red gloss with a hot core", """
$ { color: #fff; border: 1px solid #6b1200; border-radius: 12px; text-shadow: 0 1px 0 #5a0d00; font-weight: 700;
    background: radial-gradient(90% 70% at 50% 120%, #ffd166, transparent 60%), linear-gradient(180deg, #ff7a3d, #e3261b 60%, #a30f0f); box-shadow: inset 0 1px 0 #ffd8b0, 0 6px 20px -6px #ff3b1f; }
$:hover { filter: saturate(1.25) brightness(1.06); box-shadow: inset 0 1px 0 #ffd8b0, 0 8px 30px -4px #ff3b1f; }""", 12, 1, "grad", 700),
    P("ice", "Ice", "frosted crystal blue with a cold rim light", """
$ { color: #083049; border: 1px solid #bfe6ff; border-radius: 10px; font-weight: 700;
    background: linear-gradient(160deg, #ffffff 0%, #dff4ff 35%, #a9dcff 70%, #e9f8ff 100%); box-shadow: inset 0 1px 0 #fff, inset 0 -8px 16px -8px #56b4ff, 0 8px 22px -10px #2a8be0; }
$:hover { box-shadow: inset 0 1px 0 #fff, inset 0 -8px 16px -8px #56b4ff, 0 10px 30px -8px #2a8be0, 0 0 0 3px #bfe6ff66; }""", 10, 1, "pearl", 700),
    P("minimal", "Minimal", "hairline border, no fill, no fuss", """
$ { background: transparent; color: %T; border: 1px solid %L1; border-radius: 4px; font-weight: 500; }
$:hover { border-color: %T; }
$P { border-color: %T; }
$P:hover { background: %T; color: %BG; }""", 4, 1, "outline", 500),
    P("emboss", "Letterpress", "pressed into the page: inset shadow, debossed text", """
$ { background: %S2; color: DK(S2,45); border: 0; border-radius: 8px; text-shadow: 0 1px 0 #ffffff70; box-shadow: inset 0 2px 4px #0003, inset 0 -1px 0 #ffffff60; }
$:hover { color: %T; }
$P { color: %A; }""", 8, 0, "sunken"),
    P("tag", "Price tag", "notched tag shape with a punched hole", """
$ { border: 0; border-radius: 4px; background: %S2; color: %T; padding-left: 2em; clip-path: polygon(14px 0, 100% 0, 100% 100%, 14px 100%, 0 50%); }
$::before { content: ""; position: absolute; left: 12px; top: 50%; width: 6px; height: 6px; margin-top: -3px; border-radius: 50%; background: %BG; }
$:hover { filter: brightness(1.1); }
$P { background: %A; color: %OA; }""", 4, 0, "solid"),
]

# ── Cards ────────────────────────────────────────────────────────────────────
CARD = [
    P("flat", "Flat", "hairline border, no shadow", "$ { background: %S; border: 1px solid %L1; border-radius: 8px; }", 8, 1, "flat"),
    P("outline", "Outline", "a confident 1.5px text-colour border", "$ { background: transparent; border: 1.5px solid %T; border-radius: 6px; }", 6, 2, "outline"),
    P("elevated", "Elevated", "no border, layered soft shadow; lifts on hover", """
$ { background: %S; border: 1px solid transparent; border-radius: 14px; box-shadow: 0 1px 2px #0000000f, 0 12px 32px -14px #0000004d; transition: transform .3s var(--uv-ease), box-shadow .3s; }
$:hover { transform: translateY(-3px); box-shadow: 0 2px 4px #0000000f, 0 20px 44px -16px #00000066; }""", 14, 0, "flat"),
    P("brutal", "Brutal", "thick border, hard offset shadow", """
$ { background: %S; border: 2.5px solid %T; border-radius: 0; box-shadow: 6px 6px 0 %T; }
$:hover { transform: translate(-2px, -2px); box-shadow: 8px 8px 0 %T; }""", 0, 3, "hard"),
    P("glass", "Frosted glass", "blurred translucent pane", """
$ { background: ~S45; border: 1px solid #ffffff30; border-radius: 16px; backdrop-filter: blur(16px) saturate(1.4); -webkit-backdrop-filter: blur(16px) saturate(1.4); box-shadow: inset 0 1px 0 #ffffff40, 0 18px 40px -20px #0008; }""", 16, 1, "glass"),
    P("pearl", "Pearlescent", "mother-of-pearl panel with a lavender edge", """
$ { background: linear-gradient(135deg, #ffffffee, #f6efffdd 40%, #eaf8ffdd 70%, #fffaf0ee); color: #2c2547; border: 1px solid #e3d8f5; border-radius: 18px; box-shadow: inset 0 1px 0 #fff, 0 18px 40px -22px #7a6a9e88; }
$ :is(.uv-muted, .uv-dim, p) { color: #5d5478; }""", 18, 1, "pearl"),
    P("holo-border", "Holo border", "a holographic border that slowly orbits", """
$ { border: 2px solid transparent; border-radius: 16px; background: linear-gradient(%S, %S) padding-box, conic-gradient(from var(--uv-a, 0deg), #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6) border-box; animation: uv-spin-a 8s linear infinite; }""", 16, 2, "holo"),
    P("metal", "Brushed metal", "brushed steel with an engraved top edge", """
$ { border: 1px solid #ffffff26; border-radius: 6px; background: repeating-linear-gradient(90deg, #ffffff08 0 1px, transparent 1px 3px), linear-gradient(180deg, LT(S,10), %S 40%, DK(S,8)); box-shadow: inset 0 1px 0 #ffffff40, inset 0 -1px 0 #0005, 0 10px 24px -14px #000a; }""", 6, 1, "metal"),
    P("deep-metal", "Deep blue metal", "navy anodised plate with a blue rim light", """
$ { color: #e8f0ff; border: 1px solid #1b3f8f; border-radius: 10px; background: repeating-linear-gradient(90deg, #ffffff07 0 1px, transparent 1px 3px), linear-gradient(180deg, #1a3f8a 0%, #0b1d48 45%, #08163a 100%); box-shadow: inset 0 1px 0 #7fa8ff88, 0 14px 34px -16px #0a2a7a; }
$ :is(.uv-muted, .uv-dim, p) { color: #a9bde6; }""", 10, 1, "deepmetal"),
    P("gradient-border", "Gradient border", "accent → accent-2 frame", "$ { border: 1.5px solid transparent; border-radius: 14px; background: linear-gradient(%S, %S) padding-box, linear-gradient(135deg, %A, %A2) border-box; }", 14, 2, "grad"),
    P("glow", "Glow", "accent outline with a bloom", "$ { background: %S; border: 1px solid ~A45; border-radius: 12px; box-shadow: 0 0 0 1px ~A20, 0 0 40px -14px %A; }", 12, 1, "neon"),
    P("neon", "Neon", "glowing tube frame on a dark pane", """
$ { background: ~BG80; border: 1.5px solid %A; border-radius: 10px; box-shadow: 0 0 12px -2px %A, inset 0 0 18px -8px %A; }
$ :is(.uv-h3, h3, h4) { color: LT(A,35); text-shadow: 0 0 8px %A; }""", 10, 2, "neon"),
    P("bevel", "Windows 98", "raised grey bevel", """
$ { background: #c3c3c3; color: #000; border: 0; border-radius: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #fff; }
$ :is(.uv-muted, .uv-dim, p) { color: #222; }""", 0, 2, "bevel"),
    P("cyber", "Cyber notch", "clipped corners with an accent rail", """
$ { border: 0; border-radius: 0; background: %S; box-shadow: inset 0 0 0 1px ~A50, inset 4px 0 0 %A; clip-path: polygon(16px 0, 100% 0, 100% calc(100% - 16px), calc(100% - 16px) 100%, 0 100%, 0 16px); }""", 0, 1, "outline"),
    P("paper", "Lined paper", "notebook lines and a margin rule", """
$ { border: 1px solid %L1; border-radius: 2px; background: linear-gradient(90deg, transparent 30px, ~A40 30px 31px, transparent 31px), repeating-linear-gradient(%S 0 25px, ~T12 25px 26px), %S; box-shadow: 2px 3px 0 ~T10; padding-left: 44px; }""", 2, 1, "flat"),
    P("sticky", "Sticky note", "post-it yellow, slightly crooked", """
$ { background: linear-gradient(170deg, #fff7a8, #ffe873); color: #3a3200; border: 0; border-radius: 2px 2px 18px 2px; transform: rotate(-1deg); box-shadow: 0 12px 20px -12px #0007; }
$ :is(.uv-muted, .uv-dim, p) { color: #5a4f10; }
$:hover { transform: rotate(0); }""", 2, 0, "solid"),
    P("clay", "Clay", "puffy clay tile", "$ { background: %S2; border: 0; border-radius: 26px; box-shadow: inset 0 -6px 12px #0000001a, inset 0 6px 12px #ffffff80, 0 16px 30px -16px #0007; }", 26, 0, "clay"),
    P("neumorph", "Neumorphic", "extruded from the page", "$ { background: %BG; border: 0; border-radius: 20px; box-shadow: 8px 8px 18px DK(BG,20), -8px -8px 18px LT(BG,40); }", 20, 0, "flat"),
    P("inset", "Inset", "sunken well", "$ { background: %S2; border: 1px solid transparent; border-radius: 12px; box-shadow: inset 0 2px 10px #00000030; }", 12, 0, "sunken"),
    P("double", "Double rule", "classic double border", "$ { background: %S; border: 4px double ~T50; border-radius: 4px; }", 4, 4, "outline"),
    P("blueprint", "Blueprint", "dashed technical frame on a grid", """
$ { background: linear-gradient(~A12 1px, transparent 1px) 0 0 / 16px 16px, linear-gradient(90deg, ~A12 1px, transparent 1px) 0 0 / 16px 16px, %S; border: 1.5px dashed ~A70; border-radius: 0; }""", 0, 2, "outline"),
    P("accent-bar", "Accent bar", "flat card with a coloured top bar", "$ { background: %S; border: 1px solid %L1; border-top: 4px solid %A; border-radius: 4px; }", 4, 1, "flat"),
    P("ticket", "Ticket", "perforated ticket with punched sides", """
$ { background: %S; border: 0; border-radius: 10px; -webkit-mask: radial-gradient(circle 10px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat; mask: radial-gradient(circle 10px at 0 50%, #0000 98%, #000) left / 51% 100% no-repeat, radial-gradient(circle 10px at 100% 50%, #0000 98%, #000) right / 51% 100% no-repeat; box-shadow: inset 0 0 0 1px %L; }""", 10, 0, "flat"),
    P("polaroid", "Polaroid", "white instant-photo frame with a deep bottom", "$ { background: #fbfaf7; color: #1d1d1d; border: 0; border-radius: 2px; padding-bottom: 46px; box-shadow: 0 1px 2px #0002, 0 14px 30px -14px #0008; }\n$ :is(.uv-muted, .uv-dim, p) { color: #555; }", 2, 0, "flat"),
    P("window", "App window", "a title bar with traffic-light dots", """
$ { background: %S; border: 1px solid %L; border-radius: 10px; padding-top: 44px; box-shadow: 0 16px 40px -20px #0009; }
$::before { content: ""; position: absolute; left: 0; right: 0; top: 0; height: 30px; border-bottom: 1px solid %L1; background: radial-gradient(circle 5px at 16px 15px, #ff5f57 98%, transparent), radial-gradient(circle 5px at 32px 15px, #febc2e 98%, transparent), radial-gradient(circle 5px at 48px 15px, #28c840 98%, transparent), %S2; opacity: 1; }""", 10, 1, "flat"),
    P("terminal", "Terminal", "green phosphor console pane", """
$ { background: #071107; color: #9dff9d; border: 1px solid #1f5f1f; border-radius: 4px; font-family: var(--uv-mono); box-shadow: inset 0 0 30px #00ff4410, 0 0 0 1px #000; }
$ :is(.uv-muted, .uv-dim, p) { color: #5fbf5f; }""", 4, 1, "flat"),
]

# ── Text inputs ─────────────────────────────────────────────────────────────
INPUT = [
    P("boxed", "Boxed", "classic rounded box, accent focus ring", "$ { background: %S; border: 1px solid %L; border-radius: 8px; }\n$:focus { border-color: %A; box-shadow: 0 0 0 3px ~A22; }", 8, 1, "flat"),
    P("underline", "Underline", "just a bottom rule that thickens on focus", "$ { background: transparent; border: 0; border-bottom: 1.5px solid %L; border-radius: 0; padding-inline: 2px; }\n$:focus { border-bottom-color: %A; box-shadow: 0 1.5px 0 %A; }", 0, 1, "underline"),
    P("filled", "Filled", "Material-style filled field", "$ { background: ~T7; border: 0; border-bottom: 2px solid %L; border-radius: 8px 8px 0 0; }\n$:focus { background: ~T10; border-bottom-color: %A; box-shadow: none; }", 4, 2, "soft"),
    P("pill", "Pill", "fully round, soft fill", "$ { background: %S2; border: 1px solid transparent; border-radius: 999px; padding-inline: 18px; }\n$:focus { border-color: %A; background: %S; box-shadow: 0 0 0 4px ~A18; }", 999, 1, "soft"),
    P("brutal", "Brutal", "thick ink border, hard shadow on focus", "$ { background: %BG; border: 2px solid %T; border-radius: 0; }\n$:focus { box-shadow: 4px 4px 0 %T; transform: translate(-2px, -2px); }", 0, 2, "hard"),
    P("glass", "Glass", "translucent frosted field", "$ { background: ~S35; border: 1px solid #ffffff38; border-radius: 12px; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); }\n$:focus { border-color: #ffffff90; box-shadow: 0 0 0 3px #ffffff22; }", 12, 1, "glass"),
    P("neon", "Neon", "dark well that glows on focus", "$ { background: ~BG70; border: 1px solid ~A45; border-radius: 6px; color: LT(A,40); font-family: var(--uv-mono); }\n$:focus { border-color: %A; box-shadow: 0 0 0 1px %A, 0 0 18px -2px %A; }", 6, 1, "neon"),
    P("inset", "Inset", "sunken soft-UI field", "$ { background: %BG; border: 0; border-radius: 12px; box-shadow: inset 3px 3px 7px DK(BG,20), inset -3px -3px 7px LT(BG,40); }\n$:focus { box-shadow: inset 3px 3px 7px DK(BG,20), inset -3px -3px 7px LT(BG,40), 0 0 0 2px ~A40; }", 12, 0, "sunken"),
    P("terminal", "Terminal", "green mono on black", "$ { background: #050c05; color: #9dff9d; caret-color: #9dff9d; border: 1px solid #1f5f1f; border-radius: 0; font-family: var(--uv-mono); }\n$:focus { border-color: #3cff6a; box-shadow: 0 0 12px -4px #3cff6a; }\n$::placeholder { color: #3f8f3f; }", 0, 1, "flat", 500),
    P("pearl", "Pearl", "pearlescent field, lavender focus", "$ { background: PEARL; color: #2c2547; border: 1px solid #e0d4f4; border-radius: 999px; padding-inline: 18px; }\n$:focus { border-color: #a18ae0; box-shadow: 0 0 0 4px #c8b6ff55; }\n$::placeholder { color: #8a7fae; }", 999, 1, "pearl"),
    P("win98", "Windows 98", "sunken white field", "$ { background: #fff; color: #000; border: 0; border-radius: 0; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a; }\n$:focus { outline: none; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a; }", 0, 2, "bevel"),
    P("minimal", "Minimal", "no chrome until you focus", "$ { background: transparent; border: 1px solid transparent; border-radius: 4px; }\n$:hover { border-color: %L1; }\n$:focus { border-color: %T; box-shadow: none; }", 4, 1, "ghost"),
    P("gradient", "Gradient focus", "an accent gradient frame appears on focus", "$ { border: 1.5px solid transparent; border-radius: 10px; background: linear-gradient(%S, %S) padding-box, linear-gradient(%L, %L) border-box; }\n$:focus { background: linear-gradient(%S, %S) padding-box, linear-gradient(135deg, %A, %A2) border-box; box-shadow: 0 6px 20px -10px %A; }", 10, 2, "grad"),
    P("paper", "Paper", "written on a ruled line", "$ { background: transparent; border: 0; border-bottom: 1px dashed ~T40; border-radius: 0; font-family: var(--uv-serif); font-size: 1.1em; font-style: italic; }\n$:focus { border-bottom: 1px solid %A; box-shadow: none; }", 0, 1, "underline", 400),
    P("cyber", "Cyber", "notched field with an accent rail", "$ { background: %S2; border: 0; border-radius: 0; box-shadow: inset 3px 0 0 %A; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); font-family: var(--uv-mono); }\n$:focus { box-shadow: inset 3px 0 0 %A, inset 0 -2px 0 %A; }", 0, 0, "solid", 500),
    P("clay", "Clay", "puffy inset clay", "$ { background: %S2; border: 0; border-radius: 16px; box-shadow: inset 0 3px 6px #0000001f, inset 0 -2px 4px #ffffff70; }\n$:focus { box-shadow: inset 0 3px 6px #0000001f, inset 0 -2px 4px #ffffff70, 0 0 0 3px ~A35; }", 16, 0, "clay"),
    P("deep-metal", "Deep metal", "navy metal bezel around a dark field", "$ { background: #071535; color: #e8f0ff; border: 2px solid transparent; border-radius: 8px; background: linear-gradient(#071535, #0b1d48) padding-box, DEEP border-box; }\n$:focus { box-shadow: 0 0 0 3px #3f74dc55, 0 0 18px -4px #3f74dc; }\n$::placeholder { color: #6f8cc8; }", 8, 2, "deepmetal"),
    P("chrome", "Chrome bezel", "silver bezel, bright field", "$ { border: 2px solid transparent; border-radius: 999px; background: linear-gradient(%S, %S) padding-box, CHROME border-box; padding-inline: 18px; }\n$:focus { box-shadow: 0 0 0 3px #c9ced688; }", 999, 2, "chrome"),
    P("thick", "Thick outline", "2px text-colour outline, accent when focused", "$ { background: %BG; border: 2px solid %L; border-radius: 6px; }\n$:focus { border-color: %A; box-shadow: none; }", 6, 2, "outline"),
    P("ghost-label", "Floating", "transparent with a soft glow and accent caret", "$ { background: ~T4; border: 1px solid ~T10; border-radius: 10px; caret-color: %A; }\n$:focus { background: ~A6; border-color: ~A50; box-shadow: 0 8px 24px -14px %A; }", 10, 1, "soft"),
]

# ── Switches ─────────────────────────────────────────────────────────────────
# markup: <label class="uv-switch"><input type="checkbox"><i></i> Label</label>
SWITCH = [
    P("classic", "Classic", "round track, white knob", "$ i { width: 46px; height: 26px; border-radius: 99px; background: %S3; border: 1px solid %L; }\n$ i::after { top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; }\n$ input:checked + i { background: %A; border-color: %A; }\n$ input:checked + i::after { transform: translateX(20px); }", 999, 1, "solid"),
    P("ios", "iOS", "large, green-on, springy knob", "$ i { width: 51px; height: 31px; border-radius: 99px; background: ~T18; border: 0; }\n$ i::after { top: 2px; left: 2px; width: 27px; height: 27px; border-radius: 50%; background: #fff; box-shadow: 0 3px 8px #0003, 0 1px 1px #0002; }\n$ input:checked + i { background: #34c759; }\n$ input:checked + i::after { transform: translateX(20px); }", 999, 0, "solid"),
    P("material", "Material", "thin track, oversized knob", "$ i { width: 36px; height: 14px; margin: 5px 4px; border-radius: 99px; background: ~T25; border: 0; overflow: visible; }\n$ i::after { top: -5px; left: -4px; width: 22px; height: 22px; border-radius: 50%; background: #f5f5f5; box-shadow: 0 1px 4px #0006; }\n$ input:checked + i { background: ~A50; }\n$ input:checked + i::after { transform: translateX(20px); background: %A; }", 999, 0, "soft"),
    P("square", "Square", "squared track and knob", "$ i { width: 46px; height: 24px; border-radius: 3px; background: %S3; border: 1px solid %L; }\n$ i::after { top: 2px; left: 2px; width: 18px; height: 18px; border-radius: 2px; background: %T; }\n$ input:checked + i { background: %A; border-color: %A; }\n$ input:checked + i::after { transform: translateX(22px); background: %OA; }", 3, 1, "solid"),
    P("brutal", "Brutal", "thick ink outline, hard shadow", "$ i { width: 52px; height: 28px; border-radius: 0; background: %BG; border: 2.5px solid %T; box-shadow: 3px 3px 0 %T; }\n$ i::after { top: 2px; left: 2px; width: 19px; height: 19px; border-radius: 0; background: %T; box-shadow: none; }\n$ input:checked + i { background: %A; border-color: %T; }\n$ input:checked + i::after { transform: translateX(24px); }", 0, 3, "hard"),
    P("neon", "Neon", "glowing tube, knob lights up", "$ i { width: 48px; height: 24px; border-radius: 99px; background: transparent; border: 1.5px solid ~A50; }\n$ i::after { top: 3px; left: 3px; width: 16px; height: 16px; border-radius: 50%; background: ~A40; box-shadow: none; }\n$ input:checked + i { background: ~A12; border-color: %A; box-shadow: 0 0 12px -2px %A, inset 0 0 8px -3px %A; }\n$ input:checked + i::after { transform: translateX(24px); background: %A; box-shadow: 0 0 10px %A; }", 999, 2, "neon"),
    P("pearl", "Pearl", "pearlescent knob in a lilac track", "$ i { width: 50px; height: 28px; border-radius: 99px; background: #e9e2f7; border: 1px solid #d6caef; box-shadow: inset 0 2px 4px #7a6a9e33; }\n$ i::after { top: 2px; left: 2px; width: 22px; height: 22px; border-radius: 50%; background: PEARL; background-size: 200% 100%; box-shadow: inset 0 1px 0 #fff, 0 2px 6px #7a6a9e66; }\n$ input:checked + i { background: linear-gradient(90deg, #c6b2ff, #9fd8ff); }\n$ input:checked + i::after { transform: translateX(22px); background-position: 100% 0; }", 999, 1, "pearl"),
    P("metal", "Metal", "brushed metal knob over an anodised track", "$ i { width: 50px; height: 26px; border-radius: 99px; background: linear-gradient(180deg, DK(S3,25), %S3); border: 1px solid %L; box-shadow: inset 0 2px 4px #0005; }\n$ i::after { top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: CHROME; box-shadow: 0 2px 4px #0007; }\n$ input:checked + i { background: linear-gradient(180deg, DK(A,30), LT(A,10)); }\n$ input:checked + i::after { transform: translateX(24px); }", 999, 1, "metal"),
    P("labels", "On / Off", "says ON or OFF inside the track", "$ i { width: 58px; height: 26px; border-radius: 99px; background: %S3; border: 1px solid %L; }\n$ i::before { content: \"OFF\"; position: absolute; right: 8px; top: 50%; transform: translateY(-50%); font: 700 9px var(--uv-mono); color: %M; }\n$ i::after { top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; }\n$ input:checked + i { background: %A; border-color: %A; }\n$ input:checked + i::before { content: \"ON\"; right: auto; left: 9px; color: %OA; }\n$ input:checked + i::after { transform: translateX(32px); }", 999, 1, "solid"),
    P("day-night", "Day / night", "sun turns into moon, sky turns to night", "$ i { width: 54px; height: 28px; border-radius: 99px; background: linear-gradient(180deg, #8fd3ff, #d9f1ff); border: 0; }\n$ i::after { top: 3px; left: 3px; width: 22px; height: 22px; border-radius: 50%; background: #ffd23f; box-shadow: 0 0 10px #ffb300; }\n$ input:checked + i { background: linear-gradient(180deg, #0b1440, #24306b); }\n$ input:checked + i::after { transform: translateX(26px); background: #e8ecff; box-shadow: inset -6px -2px 0 #b7c0e6; }", 999, 0, "grad"),
    P("glass", "Glass", "translucent track, white glass knob", "$ i { width: 50px; height: 28px; border-radius: 99px; background: ~S35; border: 1px solid #ffffff40; backdrop-filter: blur(8px); }\n$ i::after { top: 3px; left: 3px; width: 20px; height: 20px; border-radius: 50%; background: #ffffffcc; box-shadow: inset 0 1px 0 #fff, 0 2px 6px #0004; }\n$ input:checked + i { background: ~A55; }\n$ input:checked + i::after { transform: translateX(22px); }", 999, 1, "glass"),
    P("line", "Line", "a minimal line with a dot", "$ i { width: 40px; height: 16px; border-radius: 0; background: linear-gradient(%L, %L) center / 100% 2px no-repeat; border: 0; }\n$ i::after { top: 2px; left: 0; width: 12px; height: 12px; border-radius: 50%; background: %BG; border: 2px solid %M; box-shadow: none; }\n$ input:checked + i { background: linear-gradient(%A, %A) center / 100% 2px no-repeat; }\n$ input:checked + i::after { transform: translateX(26px); border-color: %A; background: %A; }", 999, 0, "underline"),
    P("3d", "3D rocker", "a chunky rocker with depth", "$ i { width: 52px; height: 28px; border-radius: 8px; background: %S3; border: 1px solid %L; box-shadow: inset 0 3px 6px #0004; }\n$ i::after { top: 2px; left: 2px; width: 24px; height: 22px; border-radius: 6px; background: linear-gradient(180deg, #fff, #d8d8d8); box-shadow: 0 3px 0 #9a9a9a, 0 4px 6px #0005; }\n$ input:checked + i { background: %A; }\n$ input:checked + i::after { transform: translateX(22px); }", 8, 1, "hard"),
    P("aqua", "Aqua gel", "glossy gel track", "$ i { width: 50px; height: 26px; border-radius: 99px; background: linear-gradient(180deg, #bcbcbc, #ececec); border: 1px solid #8a8a8a; box-shadow: inset 0 2px 3px #0004; }\n$ i::after { top: 1px; left: 1px; width: 22px; height: 22px; border-radius: 50%; background: radial-gradient(circle at 50% 30%, #fff, #dcdcdc 60%, #b0b0b0); box-shadow: 0 1px 3px #0006; }\n$ input:checked + i { background: radial-gradient(120% 70% at 50% 120%, LT(A,45), transparent 60%), linear-gradient(180deg, LT(A,25), %A 55%, DK(A,15)); border-color: DK(A,40); }\n$ input:checked + i::after { transform: translateX(24px); }", 999, 1, "grad"),
    P("pixel", "Pixel", "8-bit blocks", "$ i { width: 48px; height: 24px; border-radius: 0; background: %S3; border: 0; box-shadow: inset 0 0 0 3px %T; }\n$ i::after { top: 5px; left: 5px; width: 14px; height: 14px; border-radius: 0; background: %T; box-shadow: none; transition: transform .15s steps(3); }\n$ input:checked + i { background: %A; }\n$ input:checked + i::after { transform: translateX(24px); }", 0, 3, "hard"),
    P("deep-metal", "Deep metal", "navy metal track with a chrome knob", "$ i { width: 50px; height: 26px; border-radius: 99px; background: #0b1d48; border: 1px solid #1b3f8f; box-shadow: inset 0 2px 5px #000a; }\n$ i::after { top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: CHROME; }\n$ input:checked + i { background: DEEP; }\n$ input:checked + i::after { transform: translateX(24px); }", 999, 1, "deepmetal"),
]

# ── Checkboxes & radios ─────────────────────────────────────────────────────
# markup: <label class="uv-check"><input type="checkbox"> Label</label>
CHECK = [
    P("classic", "Classic", "rounded box, white tick", "$ input { border-radius: 5px; border: 2px solid %L; background: transparent; }\n$ input:checked { background: %A; border-color: %A; }\n$ input::after { border-color: %OA; }\n$ input[type=radio] { border-radius: 50%; }", 5, 2, "solid"),
    P("round", "Round", "circles everywhere", "$ input { border-radius: 50%; border: 2px solid %L; }\n$ input:checked { background: %A; border-color: %A; }\n$ input::after { border-color: %OA; }", 999, 2, "solid"),
    P("brutal", "Brutal", "ink box with a hard shadow", "$ input { width: 22px; height: 22px; border-radius: 0; border: 2.5px solid %T; background: %BG; box-shadow: 2px 2px 0 %T; }\n$ input:checked { background: %A; border-color: %T; }\n$ input::after { border-color: %T; }", 0, 3, "hard"),
    P("neon", "Neon", "glowing outline, glowing tick", "$ input { border-radius: 4px; border: 1.5px solid ~A50; background: transparent; }\n$ input:checked { background: ~A15; border-color: %A; box-shadow: 0 0 10px -1px %A; }\n$ input::after { border-color: %A; }", 4, 2, "neon"),
    P("pearl", "Pearl", "pearlescent bead", "$ input { border-radius: 50%; border: 1px solid #d6caef; background: #f6f2ff; box-shadow: inset 0 1px 2px #7a6a9e33; }\n$ input:checked { background: PEARL; background-size: 200% 100%; border-color: #a18ae0; box-shadow: inset 0 1px 0 #fff, 0 2px 6px #7a6a9e66; }\n$ input::after { border-color: #4f3f86; }", 999, 1, "pearl"),
    P("cross", "Cross", "an × instead of a tick", "$ input { border-radius: 2px; border: 2px solid %T; }\n$ input::after { width: 12px; height: 12px; border: 0; background: linear-gradient(45deg, transparent 43%, %T 43% 57%, transparent 57%), linear-gradient(-45deg, transparent 43%, %T 43% 57%, transparent 57%); transform: scale(0); }\n$ input:checked { background: transparent; border-color: %T; }\n$ input:checked::after { transform: scale(1); }", 2, 2, "outline"),
    P("win98", "Windows 98", "sunken white box", "$ input { border-radius: 0; border: 0; background: #fff; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a; }\n$ input:checked { background: #fff; }\n$ input::after { border-color: #000; }", 0, 2, "bevel"),
    P("dot", "Dot", "an outlined ring with a centre dot", "$ input { border-radius: 50%; border: 2px solid %L; }\n$ input::after { width: 10px; height: 10px; border: 0; border-radius: 50%; background: %A; transform: scale(0); }\n$ input:checked { background: transparent; border-color: %A; }\n$ input:checked::after { transform: scale(1); }", 999, 2, "outline"),
    P("pop", "Pop", "bounces and bursts when checked", "$ input { border-radius: 6px; border: 2px solid %L; transition: transform .3s var(--uv-spring), background .2s; }\n$ input:checked { background: %A; border-color: %A; animation: uvp-pop .4s var(--uv-spring); box-shadow: 0 0 0 6px ~A0; }\n$ input::after { border-color: %OA; }", 6, 2, "solid"),
    P("metal", "Metal", "chrome bezel, accent fill", "$ input { border-radius: 4px; border: 0; background: CHROME; box-shadow: inset 0 1px 2px #0005; }\n$ input:checked { background: linear-gradient(180deg, LT(A,30), DK(A,20)); box-shadow: inset 0 1px 0 #fff8; }\n$ input::after { border-color: #fff; }", 4, 0, "metal"),
    P("square-fill", "Square fill", "the box fills with an inner square", "$ input { border-radius: 0; border: 2px solid %T; }\n$ input::after { width: 10px; height: 10px; border: 0; background: %A; transform: scale(0); }\n$ input:checked { background: transparent; border-color: %T; }\n$ input:checked::after { transform: scale(1); }", 0, 2, "outline"),
    P("glass", "Glass", "frosted bubble", "$ input { border-radius: 7px; border: 1px solid #ffffff50; background: ~S35; backdrop-filter: blur(6px); }\n$ input:checked { background: ~A60; border-color: #ffffff90; }\n$ input::after { border-color: #fff; }", 7, 1, "glass"),
]

# ── Range sliders ────────────────────────────────────────────────────────────
_TH = lambda css: f"$::-webkit-slider-thumb {{ {css} }}\n$::-moz-range-thumb {{ {css} }}"
RANGE = [
    P("classic", "Classic", "rounded track with an accent fill", "$ { height: 6px; border-radius: 99px; background: linear-gradient(90deg, %A var(--v), %S3 var(--v)); }\n" + _TH("width: 18px; height: 18px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 4px ~A30, 0 2px 6px #0006;"), 999, 0, "solid"),
    P("thick", "Thick", "a fat pill track", "$ { height: 14px; border-radius: 99px; background: linear-gradient(90deg, %A var(--v), %S3 var(--v)); }\n" + _TH("width: 22px; height: 22px; border: 3px solid %A; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px #0005;"), 999, 0, "solid"),
    P("gradient", "Gradient", "accent → accent-2 fill", "$ { height: 8px; border-radius: 99px; background: linear-gradient(90deg, %A, %A2 var(--v), %S3 var(--v)); }\n" + _TH("width: 20px; height: 20px; border: 0; border-radius: 50%; background: #fff; box-shadow: 0 0 0 3px %A2, 0 3px 8px #0006;"), 999, 0, "grad"),
    P("neon", "Neon", "glowing filament", "$ { height: 3px; border-radius: 99px; background: linear-gradient(90deg, %A var(--v), ~A20 var(--v)); box-shadow: 0 0 8px -1px %A; }\n" + _TH("width: 14px; height: 14px; border: 2px solid %A; border-radius: 50%; background: %BG; box-shadow: 0 0 10px %A;"), 999, 0, "neon"),
    P("pearl", "Pearl", "pearl bead on a lilac track", "$ { height: 8px; border-radius: 99px; background: linear-gradient(90deg, #c6b2ff, #9fd8ff var(--v), #e9e2f7 var(--v)); }\n" + _TH("width: 22px; height: 22px; border: 1px solid #d6caef; border-radius: 50%; background: " + PEARL + "; box-shadow: inset 0 1px 0 #fff, 0 3px 8px #7a6a9e77;"), 999, 1, "pearl"),
    P("metal", "Metal fader", "a studio fader cap", "$ { height: 6px; border-radius: 2px; background: linear-gradient(90deg, %A var(--v), DK(S3,30) var(--v)); box-shadow: inset 0 1px 2px #0007; }\n" + _TH("width: 14px; height: 26px; border: 1px solid #555; border-radius: 3px; background: linear-gradient(180deg, #f4f4f4, #b8b8b8 48%, #555 50%, #b8b8b8 52%, #f0f0f0); box-shadow: 0 3px 6px #0007;"), 3, 1, "metal"),
    P("square", "Square", "square thumb, flat track", "$ { height: 4px; border-radius: 0; background: linear-gradient(90deg, %T var(--v), %L var(--v)); }\n" + _TH("width: 16px; height: 16px; border: 2px solid %T; border-radius: 0; background: %BG; box-shadow: none;"), 0, 2, "outline"),
    P("line", "Hairline", "a hairline and a small dot", "$ { height: 1px; border-radius: 0; background: linear-gradient(90deg, %T var(--v), %L var(--v)); }\n" + _TH("width: 10px; height: 10px; border: 0; border-radius: 50%; background: %T; box-shadow: none;"), 999, 0, "flat"),
    P("brutal", "Brutal", "chunky block thumb", "$ { height: 10px; border-radius: 0; border: 2px solid %T; background: linear-gradient(90deg, %A var(--v), %BG var(--v)); }\n" + _TH("width: 20px; height: 26px; border: 2.5px solid %T; border-radius: 0; background: %BG; box-shadow: 3px 3px 0 %T;"), 0, 3, "hard"),
    P("win98", "Windows 98", "grey slider with a notched thumb", "$ { height: 4px; border-radius: 0; background: #808080; box-shadow: inset 1px 1px #0a0a0a, inset -1px -1px #fff; }\n" + _TH("width: 11px; height: 21px; border: 0; border-radius: 0; background: #c3c3c3; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf;"), 0, 2, "bevel"),
    P("glass", "Glass", "frosted track, glass bead", "$ { height: 10px; border-radius: 99px; background: linear-gradient(90deg, ~A60 var(--v), ~S35 var(--v)); border: 1px solid #ffffff38; }\n" + _TH("width: 22px; height: 22px; border: 1px solid #ffffffaa; border-radius: 50%; background: #ffffffcc; box-shadow: inset 0 1px 0 #fff, 0 3px 8px #0005;"), 999, 1, "glass"),
    P("deep-metal", "Deep metal", "navy groove, chrome knob", "$ { height: 6px; border-radius: 99px; background: linear-gradient(90deg, #3f74dc var(--v), #0b1d48 var(--v)); box-shadow: inset 0 1px 3px #000a; }\n" + _TH("width: 20px; height: 20px; border: 1px solid #5d6a7e; border-radius: 50%; background: " + CHROME + "; box-shadow: 0 2px 6px #000a;"), 999, 1, "deepmetal"),
]

# ── Tabs / segmented ─────────────────────────────────────────────────────────
# markup: <div class="uv-tabs"><button aria-selected="true">…</button>…<i class="uv-tabs__ind"></i></div>
TABS = [
    P("slide", "Sliding pill", "a pill slides between tabs", "$ { background: %S; border: 1px solid %L1; border-radius: 12px; padding: 4px; }\n$ > button { border-radius: 9px; color: %M; }\n$ > button[aria-selected=\"true\"] { color: %OA; }\n$ > .uv-tabs__ind { background: %A; border-radius: 9px; box-shadow: 0 6px 16px -8px %A; }", 12, 1, "solid"),
    P("underline", "Underline", "an accent bar slides under the active tab", "$ { background: transparent; border: 0; border-bottom: 1px solid %L; border-radius: 0; padding: 0; gap: 18px; }\n$ > button { padding-inline: 2px; border-radius: 0; color: %M; }\n$ > button[aria-selected=\"true\"] { color: %T; }\n$ > .uv-tabs__ind { top: auto; bottom: -1px; height: 2px; background: %A; border-radius: 2px; box-shadow: none; }", 0, 1, "underline"),
    P("segmented", "Segmented", "iOS segmented control", "$ { background: ~T8; border: 0; border-radius: 10px; padding: 2px; }\n$ > button { border-radius: 8px; color: %T; font-weight: 500; }\n$ > button[aria-selected=\"true\"] { color: %T; font-weight: 600; }\n$ > .uv-tabs__ind { top: 2px; bottom: 2px; background: %S; border-radius: 8px; box-shadow: 0 2px 6px #0002, 0 0 0 .5px #0001; }", 10, 0, "soft"),
    P("folder", "Folder tabs", "file-folder tabs that sit on the panel", "$ { background: transparent; border: 0; border-bottom: 1px solid %L; border-radius: 0; padding: 0; gap: 2px; }\n$ > button { border: 1px solid transparent; border-bottom: 0; border-radius: 8px 8px 0 0; color: %M; margin-bottom: -1px; }\n$ > button[aria-selected=\"true\"] { color: %T; background: %S; border-color: %L; }\n$ > .uv-tabs__ind { display: none; }", 8, 1, "flat"),
    P("brutal", "Brutal", "boxed tabs, active one pops", "$ { background: %BG; border: 2px solid %T; border-radius: 0; padding: 4px; box-shadow: 4px 4px 0 %T; }\n$ > button { border-radius: 0; color: %T; font-weight: 700; }\n$ > button[aria-selected=\"true\"] { color: %OA; }\n$ > .uv-tabs__ind { background: %A; border: 2px solid %T; border-radius: 0; box-shadow: none; }", 0, 2, "hard"),
    P("neon", "Neon", "glowing active tab", "$ { background: ~BG70; border: 1px solid ~A35; border-radius: 10px; }\n$ > button { color: ~A70; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }\n$ > button[aria-selected=\"true\"] { color: LT(A,40); text-shadow: 0 0 8px %A; }\n$ > .uv-tabs__ind { background: ~A15; border: 1px solid %A; box-shadow: 0 0 14px -2px %A; border-radius: 7px; }", 10, 1, "neon", 500, True),
    P("pearl", "Pearl", "pearl bead slides over a lilac rail", "$ { background: #efe9fb; border: 1px solid #ddd2f2; border-radius: 999px; }\n$ > button { color: #6a5f8e; border-radius: 999px; }\n$ > button[aria-selected=\"true\"] { color: #2c2547; }\n$ > .uv-tabs__ind { background: PEARL; background-size: 200% 100%; border-radius: 999px; box-shadow: inset 0 1px 0 #fff, 0 4px 12px -4px #7a6a9e88; }", 999, 1, "pearl"),
    P("glass", "Glass", "frosted rail, bright glass tab", "$ { background: ~S30; border: 1px solid #ffffff30; border-radius: 14px; backdrop-filter: blur(10px); }\n$ > button { color: %T; opacity: .75; }\n$ > button[aria-selected=\"true\"] { color: %T; opacity: 1; }\n$ > .uv-tabs__ind { background: #ffffff40; border: 1px solid #ffffff60; border-radius: 10px; box-shadow: inset 0 1px 0 #ffffff80; }", 14, 1, "glass"),
    P("terminal", "Terminal", "[ active ] in mono", "$ { background: transparent; border: 1px dashed ~A50; border-radius: 0; }\n$ > button { color: ~A60; font-family: var(--uv-mono); border-radius: 0; }\n$ > button[aria-selected=\"true\"] { color: %BG; }\n$ > .uv-tabs__ind { background: %A; border-radius: 0; box-shadow: none; }", 0, 1, "outline", 500),
    P("win98", "Windows 98", "raised grey property-sheet tabs", "$ { background: transparent; border: 0; border-radius: 0; padding: 0; gap: 0; }\n$ > button { background: #c3c3c3; color: #000; border-radius: 3px 3px 0 0; box-shadow: inset -1px 0 #0a0a0a, inset 1px 1px #fff, inset -2px 0 #808080; font-weight: 400; margin-top: 3px; }\n$ > button[aria-selected=\"true\"] { color: #000; margin-top: 0; padding-bottom: 12px; }\n$ > .uv-tabs__ind { display: none; }", 0, 2, "bevel", 400),
    P("bubble", "Bubbles", "every tab is its own bubble", "$ { background: transparent; border: 0; gap: 8px; padding: 0; }\n$ > button { background: %S2; border-radius: 999px; color: %T; }\n$ > button[aria-selected=\"true\"] { color: %OA; background: %A; box-shadow: 0 6px 14px -6px %A; }\n$ > .uv-tabs__ind { display: none; }", 999, 0, "soft"),
    P("ink", "Ink", "inverted active tab", "$ { background: transparent; border: 1px solid %T; border-radius: 4px; padding: 3px; }\n$ > button { color: %T; border-radius: 2px; }\n$ > button[aria-selected=\"true\"] { color: %BG; }\n$ > .uv-tabs__ind { background: %T; border-radius: 2px; box-shadow: none; }", 4, 1, "inverse"),
    P("gradient", "Gradient", "a gradient pill with a glow", "$ { background: %S; border: 1px solid %L1; border-radius: 999px; }\n$ > button { color: %M; border-radius: 999px; }\n$ > button[aria-selected=\"true\"] { color: #fff; }\n$ > .uv-tabs__ind { background: linear-gradient(135deg, %A, %A2); border-radius: 999px; box-shadow: 0 6px 20px -6px %A; }", 999, 1, "grad"),
    P("cyber", "Cyber", "notched active tab with an accent rail", "$ { background: %S2; border: 0; border-radius: 0; clip-path: polygon(0 0, calc(100% - 10px) 0, 100% 10px, 100% 100%, 0 100%); }\n$ > button { color: %M; font-family: var(--uv-mono); text-transform: uppercase; border-radius: 0; font-size: 12px; letter-spacing: .08em; }\n$ > button[aria-selected=\"true\"] { color: %OA; }\n$ > .uv-tabs__ind { background: %A; border-radius: 0; box-shadow: none; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%); }", 0, 0, "solid", 600, True),
    P("metal", "Metal", "brushed rail, chrome active tab", "$ { background: linear-gradient(180deg, DK(S3,20), %S3); border: 1px solid %L; border-radius: 8px; box-shadow: inset 0 2px 4px #0004; }\n$ > button { color: %M; border-radius: 6px; }\n$ > button[aria-selected=\"true\"] { color: #1b1f26; text-shadow: 0 1px 0 #fff; }\n$ > .uv-tabs__ind { background: CHROME; border-radius: 6px; box-shadow: 0 2px 4px #0006; }", 8, 1, "chrome"),
    P("minimal", "Minimal", "bold active label, nothing else", "$ { background: transparent; border: 0; padding: 0; gap: 16px; }\n$ > button { color: %M; font-weight: 500; padding-inline: 0; }\n$ > button[aria-selected=\"true\"] { color: %T; font-weight: 700; }\n$ > .uv-tabs__ind { display: none; }", 0, 0, "ghost", 500),
]

# ── Navigation (navbar, side nav, pagination, menus) ─────────────────────────
NAV = [
    P("pills", "Pills", "rounded hover and active pills", "$ { background: ~S80; border: 1px solid %L1; border-radius: 14px; }\n$I { border-radius: 999px; color: %M; }\n$I:hover { color: %T; background: ~T7; }\n$A { color: %OA; background: %A; }", 14, 1, "solid"),
    P("underline", "Underline", "active link gets an accent underline", "$ { background: transparent; border: 0; border-bottom: 1px solid %L; border-radius: 0; }\n$I { border-radius: 0; color: %M; box-shadow: inset 0 -2px 0 transparent; }\n$I:hover { color: %T; background: transparent; }\n$A { color: %T; background: transparent; box-shadow: inset 0 -2px 0 %A; }", 0, 1, "underline"),
    P("boxed", "Boxed", "every link in its own box", "$ { background: %S; border: 1px solid %L; border-radius: 8px; }\n$I { border: 1px solid %L1; border-radius: 6px; color: %T; }\n$I:hover { border-color: %T; background: transparent; }\n$A { border-color: %A; color: %A; background: ~A8; }", 6, 1, "outline"),
    P("glass", "Floating glass", "a frosted floating bar", "$ { background: ~S45; border: 1px solid #ffffff30; border-radius: 999px; backdrop-filter: blur(14px) saturate(1.4); -webkit-backdrop-filter: blur(14px) saturate(1.4); box-shadow: 0 10px 30px -14px #0008, inset 0 1px 0 #ffffff40; }\n$I { border-radius: 999px; color: %T; opacity: .8; }\n$I:hover { opacity: 1; background: #ffffff1c; }\n$A { opacity: 1; background: #ffffff38; color: %T; }", 999, 1, "glass"),
    P("brutal", "Brutal", "thick border, active block", "$ { background: %BG; border: 2.5px solid %T; border-radius: 0; box-shadow: 5px 5px 0 %T; }\n$I { border-radius: 0; color: %T; font-weight: 700; }\n$I:hover { background: ~A25; color: %T; }\n$A { background: %A; color: %OA; box-shadow: inset 0 0 0 2px %T; }", 0, 3, "hard", 700),
    P("neon", "Neon", "glowing links on a dark bar", "$ { background: ~BG80; border: 1px solid ~A35; border-radius: 10px; box-shadow: 0 0 20px -10px %A; }\n$I { color: ~A70; font-family: var(--uv-mono); text-transform: uppercase; letter-spacing: .08em; font-size: 12px; }\n$I:hover { color: LT(A,40); background: transparent; text-shadow: 0 0 8px %A; }\n$A { color: LT(A,45); background: ~A12; text-shadow: 0 0 8px %A; box-shadow: inset 0 0 0 1px ~A60; }", 10, 1, "neon", 500, True),
    P("terminal", "Terminal", "> path style", "$ { background: #050c05; border: 1px solid #1f5f1f; border-radius: 0; }\n$I { color: #5fbf5f; font-family: var(--uv-mono); border-radius: 0; }\n$I:hover { color: #9dff9d; background: transparent; }\n$A { color: #050c05; background: #9dff9d; }", 0, 1, "flat", 500),
    P("win98", "Windows 98", "menu-bar look", "$ { background: #c3c3c3; border: 0; border-radius: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px #808080, inset 2px 2px #dfdfdf; }\n$I { color: #000; border-radius: 0; font-weight: 400; }\n$I:hover { background: #000080; color: #fff; }\n$A { background: #000080; color: #fff; }", 0, 2, "bevel", 400),
    P("pearl", "Pearl", "pearl rail with a pearl active bead", "$ { background: #f4effc; border: 1px solid #e0d4f4; border-radius: 999px; }\n$I { color: #6a5f8e; border-radius: 999px; }\n$I:hover { color: #2c2547; background: #ffffff90; }\n$A { color: #2c2547; background: PEARL; box-shadow: inset 0 1px 0 #fff, 0 4px 12px -4px #7a6a9e88; }", 999, 1, "pearl"),
    P("rail", "Side rail", "active link marked by a left rail", "$ { background: transparent; border: 0; border-radius: 0; }\n$I { border-radius: 0; color: %M; box-shadow: inset 2px 0 0 transparent; }\n$I:hover { color: %T; background: ~T5; }\n$A { color: %T; background: ~A8; box-shadow: inset 3px 0 0 %A; }", 0, 0, "ghost"),
    P("ink", "Ink", "inverted active link", "$ { background: %BG; border: 1px solid %T; border-radius: 3px; }\n$I { color: %T; border-radius: 2px; }\n$I:hover { background: ~T10; }\n$A { background: %T; color: %BG; }", 3, 1, "inverse"),
    P("gradient", "Gradient", "active link in a glowing gradient pill", "$ { background: %S; border: 1px solid %L1; border-radius: 14px; }\n$I { border-radius: 10px; color: %M; }\n$I:hover { color: %T; background: ~T6; }\n$A { color: #fff; background: linear-gradient(135deg, %A, %A2); box-shadow: 0 6px 18px -8px %A; }", 10, 1, "grad"),
    P("dots", "Dots", "a dot appears under the active link", "$ { background: transparent; border: 0; border-radius: 0; }\n$I { color: %M; background: radial-gradient(circle 2.5px at 50% calc(100% - 1px), transparent 98%, transparent) no-repeat; }\n$I:hover { color: %T; background-color: transparent; }\n$A { color: %T; background: radial-gradient(circle 2.5px at 50% calc(100% - 2px), %A 98%, transparent) no-repeat; }", 0, 0, "ghost", 500),
    P("metal", "Metal", "brushed metal bar, chrome active key", "$ { background: repeating-linear-gradient(90deg, #ffffff08 0 1px, transparent 1px 3px), linear-gradient(180deg, LT(S2,8), DK(S2,10)); border: 1px solid %L; border-radius: 8px; box-shadow: inset 0 1px 0 #ffffff30; }\n$I { color: %T; border-radius: 6px; }\n$I:hover { background: #ffffff12; }\n$A { background: CHROME; color: #1b1f26; text-shadow: 0 1px 0 #fff; box-shadow: 0 2px 4px #0006; }", 8, 1, "chrome"),
    P("deep-metal", "Deep metal", "navy metal bar, glowing blue active", "$ { background: linear-gradient(180deg, #1a3f8a, #0b1d48); border: 1px solid #1b3f8f; border-radius: 10px; box-shadow: inset 0 1px 0 #7fa8ff66; }\n$I { color: #a9bde6; border-radius: 7px; }\n$I:hover { color: #fff; background: #ffffff10; }\n$A { color: #fff; background: DEEP; text-shadow: 0 -1px 0 #031030; box-shadow: inset 0 1px 0 #d6e6ff, 0 0 14px -2px #3f74dc; }", 10, 1, "deepmetal"),
    P("cyber", "Cyber", "notched bar, hazard active", "$ { background: %S2; border: 0; border-radius: 0; box-shadow: inset 0 -2px 0 %A; clip-path: polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 0 100%); }\n$I { color: %M; font-family: var(--uv-mono); text-transform: uppercase; border-radius: 0; font-size: 12px; }\n$I:hover { color: %T; background: transparent; }\n$A { color: %OA; background: %A; clip-path: polygon(0 0, calc(100% - 8px) 0, 100% 8px, 100% 100%, 0 100%); }", 0, 0, "solid", 600, True),
]

# ── Badges & chips ───────────────────────────────────────────────────────────
BADGE = [
    P("soft", "Soft pill", "tinted pill", "$ { border-radius: 999px; border: 1px solid transparent; background: ~K14; color: var(--k); font: 600 12px var(--uv-font); text-transform: none; letter-spacing: 0; }", 999, 0, "soft"),
    P("solid", "Solid", "filled with the colour", "$ { border-radius: 6px; border: 0; background: var(--k); color: #fff; font: 700 11px var(--uv-font); }", 6, 0, "solid", 700),
    P("outline", "Outline", "coloured outline, mono caps", "$ { border-radius: 3px; border: 1px solid var(--k); background: transparent; color: var(--k); font: 500 11px var(--uv-mono); text-transform: uppercase; letter-spacing: .05em; }", 3, 1, "outline", 500, True),
    P("dot", "Status dot", "a dot then the label", "$ { border-radius: 999px; border: 1px solid %L; background: %S; color: %T; font: 500 12px var(--uv-font); }\n$::before { content: \"\"; width: 7px; height: 7px; border-radius: 50%; background: var(--k); box-shadow: 0 0 0 3px ~K20; }", 999, 1, "flat", 500),
    P("neon", "Neon", "glowing tag", "$ { border-radius: 4px; border: 1px solid var(--k); background: ~K10; color: var(--k); font: 600 11px var(--uv-mono); text-transform: uppercase; letter-spacing: .08em; text-shadow: 0 0 6px var(--k); box-shadow: 0 0 10px -3px var(--k); }", 4, 1, "neon", 600, True),
    P("pearl", "Pearl", "pearl bead tag", "$ { border-radius: 999px; border: 1px solid #ddd2f2; background: PEARL; color: #4f3f86; font: 700 11px var(--uv-font); box-shadow: inset 0 1px 0 #fff; }", 999, 1, "pearl", 700),
    P("brutal", "Brutal", "chunky boxed tag", "$ { border-radius: 0; border: 2px solid %T; background: var(--k); color: #fff; font: 800 11px var(--uv-font); text-transform: uppercase; box-shadow: 2px 2px 0 %T; }", 0, 2, "hard", 800, True),
    P("gradient", "Gradient", "accent gradient pill", "$ { border-radius: 999px; border: 0; background: linear-gradient(135deg, %A, %A2); color: #fff; font: 700 11px var(--uv-font); }", 999, 0, "grad", 700),
    P("glass", "Glass", "frosted chip", "$ { border-radius: 999px; border: 1px solid #ffffff40; background: ~S35; color: %T; backdrop-filter: blur(8px); font: 600 12px var(--uv-font); }", 999, 1, "glass"),
    P("metal", "Metal", "engraved chrome plate", "$ { border-radius: 3px; border: 1px solid #7d848f; background: CHROME; color: #1b1f26; text-shadow: 0 1px 0 #fff; font: 700 10px var(--uv-mono); text-transform: uppercase; letter-spacing: .1em; }", 3, 1, "chrome", 700, True),
    P("ribbon", "Ribbon", "a ribbon with a notched tail", "$ { border-radius: 0; border: 0; padding-right: 16px; background: var(--k); color: #fff; font: 700 11px var(--uv-font); clip-path: polygon(0 0, 100% 0, calc(100% - 8px) 50%, 100% 100%, 0 100%); }", 0, 0, "solid", 700),
    P("stamp", "Stamp", "inked rubber stamp", "$ { border-radius: 3px; border: 2px double var(--k); background: transparent; color: var(--k); font: 800 10px var(--uv-mono); text-transform: uppercase; letter-spacing: .14em; transform: rotate(-3deg); }", 3, 2, "outline", 800, True),
    P("holo", "Holo", "holographic sticker", "$ { border-radius: 6px; border: 1px solid #ffffffaa; background: HOLO; background-size: 300% 100%; color: #2a1f3d; font: 800 11px var(--uv-font); animation: uvt-holo 6s linear infinite; }", 6, 1, "holo", 800),
    P("terminal", "Terminal", "[TAG] in mono", "$ { border-radius: 0; border: 0; background: transparent; color: var(--k); font: 500 12px var(--uv-mono); padding-inline: 0; }\n$::before { content: \"[\"; } $::after { content: \"]\"; }", 0, 0, "ghost", 500, True),
    P("sticker", "Sticker", "white-edged die-cut", "$ { border-radius: 999px; border: 2px solid #fff; background: var(--k); color: #fff; font: 800 11px var(--uv-font); box-shadow: 0 3px 8px -2px #0006; transform: rotate(-2deg); }", 999, 2, "solid", 800),
    P("square", "Square", "flat square label", "$ { border-radius: 0; border: 0; background: ~K18; color: var(--k); font: 600 11px var(--uv-font); text-transform: uppercase; letter-spacing: .06em; }", 0, 0, "soft", 600, True),
]

# ── Alerts & toasts ──────────────────────────────────────────────────────────
ALERT = [
    P("bar", "Side bar", "a coloured bar down the left", "$ { border: 0; border-left: 4px solid var(--k); border-radius: 4px; background: %S; color: %T; }", 4, 4, "flat"),
    P("soft", "Soft", "tinted background, tinted border", "$ { border: 1px solid ~K35; border-radius: 10px; background: ~K12; color: %T; }", 10, 1, "soft"),
    P("filled", "Filled", "solid colour, white text", "$ { border: 0; border-radius: 8px; background: var(--k); color: #fff; }\n$ .uv-toast__icon { background: #fff3; color: #fff; }", 8, 0, "solid"),
    P("outline", "Outline", "outlined, transparent", "$ { border: 1.5px solid var(--k); border-radius: 6px; background: transparent; color: %T; }", 6, 2, "outline"),
    P("brutal", "Brutal", "thick ink box with a hard shadow", "$ { border: 2.5px solid %T; border-radius: 0; background: ~K25; color: %T; box-shadow: 5px 5px 0 %T; font-weight: 600; }", 0, 3, "hard"),
    P("neon", "Neon", "glowing console message", "$ { border: 1px solid var(--k); border-radius: 6px; background: ~BG80; color: var(--k); font-family: var(--uv-mono); box-shadow: 0 0 16px -6px var(--k), inset 0 0 12px -8px var(--k); }", 6, 1, "neon", 500),
    P("glass", "Glass", "frosted pane with a colour edge", "$ { border: 1px solid #ffffff30; border-top: 2px solid var(--k); border-radius: 12px; background: ~S45; color: %T; backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); box-shadow: 0 14px 34px -18px #0009; }", 12, 1, "glass"),
    P("pearl", "Pearl", "pearl pane, lavender text", "$ { border: 1px solid #e0d4f4; border-radius: 14px; background: PEARL; color: #2c2547; box-shadow: inset 0 1px 0 #fff, 0 10px 24px -14px #7a6a9e88; }", 14, 1, "pearl"),
    P("terminal", "Terminal", "! message in mono", "$ { border: 0; border-radius: 0; background: #050c05; color: var(--k); font-family: var(--uv-mono); }\n$:not(.uv-toast)::before { content: \"!\"; font-weight: 700; }", 0, 0, "flat", 500),
    P("win98", "Windows 98", "a grey system dialog", "$ { border: 0; border-radius: 0; background: #c3c3c3; color: #000; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #fff; }\n$ .uv-toast__icon { border-radius: 50%; }", 0, 2, "bevel", 400),
    P("banner", "Banner", "bold full-width stripe", "$ { border: 0; border-radius: 0; background: repeating-linear-gradient(-45deg, ~K15 0 10px, ~K8 10px 20px); color: %T; box-shadow: inset 0 3px 0 var(--k), inset 0 -3px 0 var(--k); font-weight: 600; }", 0, 3, "soft", 600),
    P("minimal", "Minimal", "just a coloured line of text", "$ { border: 0; border-radius: 0; background: transparent; color: var(--k); padding-inline: 0; }", 0, 0, "ghost"),
    P("metal", "Metal", "brushed plate with a coloured rivet edge", "$ { border: 1px solid #ffffff26; border-left: 6px solid var(--k); border-radius: 4px; background: repeating-linear-gradient(90deg, #ffffff08 0 1px, transparent 1px 3px), linear-gradient(180deg, LT(S2,8), DK(S2,10)); color: %T; box-shadow: inset 0 1px 0 #ffffff30; }", 4, 1, "metal"),
    P("sticky", "Sticky", "a crooked sticky note", "$ { border: 0; border-radius: 2px 2px 14px 2px; background: linear-gradient(170deg, #fff7a8, #ffe873); color: #3a3200; transform: rotate(-.6deg); box-shadow: 0 8px 16px -10px #0007; }", 2, 0, "solid"),
]

# ── Modals & command palette ─────────────────────────────────────────────────
MODAL = [
    P("classic", "Classic", "rounded card, dim backdrop", "$ { border: 1px solid %L; border-radius: 16px; background: %S; box-shadow: 0 30px 80px -20px #000b; }\n$::backdrop { background: #0008; }", 16, 1, "flat"),
    P("sheet", "Sheet", "slides up like a bottom sheet", "$ { border: 0; border-radius: 22px 22px 0 0; margin-bottom: 0; background: %S; box-shadow: 0 -10px 60px -10px #0009; }\n$[open] { animation: uvp-sheet .45s var(--uv-ease); }\n$::backdrop { background: #0007; }", 22, 0, "flat"),
    P("brutal", "Brutal", "ink border, hard shadow", "$ { border: 3px solid %T; border-radius: 0; background: %BG; box-shadow: 10px 10px 0 %T; }\n$::backdrop { background: ~A35; }", 0, 3, "hard"),
    P("glass", "Glass", "frosted over a blurred page", "$ { border: 1px solid #ffffff38; border-radius: 22px; background: ~S55; backdrop-filter: blur(20px) saturate(1.4); -webkit-backdrop-filter: blur(20px) saturate(1.4); box-shadow: inset 0 1px 0 #ffffff50, 0 30px 80px -20px #000a; }\n$::backdrop { background: #0004; backdrop-filter: blur(6px); }", 22, 1, "glass"),
    P("pearl", "Pearl", "pearl panel on a lilac haze", "$ { border: 1px solid #e0d4f4; border-radius: 24px; background: linear-gradient(135deg, #fffffff5, #f6efffee 40%, #eaf8ffee 70%, #fffaf0f5); color: #2c2547; box-shadow: inset 0 1px 0 #fff, 0 30px 80px -24px #7a6a9eaa; }\n$::backdrop { background: #c8b6ff44; }", 24, 1, "pearl"),
    P("neon", "Neon", "glowing frame in the dark", "$ { border: 1.5px solid %A; border-radius: 12px; background: ~BG92; box-shadow: 0 0 30px -6px %A, inset 0 0 30px -18px %A; }\n$::backdrop { background: #000c; }", 12, 2, "neon"),
    P("terminal", "Terminal", "a console window", "$ { border: 1px solid #1f5f1f; border-radius: 4px; background: #050c05; color: #9dff9d; font-family: var(--uv-mono); }\n$::backdrop { background: #000d; }", 4, 1, "flat"),
    P("win98", "Windows 98", "title bar and bevel", "$ { border: 0; border-radius: 0; padding-top: 22px; background: linear-gradient(90deg, #000080, #1084d0) 0 0 / 100% 22px no-repeat, #c3c3c3; color: #000; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #fff, 6px 6px 0 #0004; }\n$::backdrop { background: #00808088; }", 0, 2, "bevel"),
    P("metal", "Metal", "brushed metal plate", "$ { border: 1px solid #ffffff30; border-radius: 10px; background: repeating-linear-gradient(90deg, #ffffff08 0 1px, transparent 1px 3px), linear-gradient(180deg, LT(S,10), %S 40%, DK(S,10)); box-shadow: inset 0 1px 0 #ffffff40, 0 30px 80px -20px #000c; }\n$::backdrop { background: #000a; }", 10, 1, "metal"),
    P("deep-metal", "Deep metal", "navy metal panel with a blue rim", "$ { border: 1px solid #1b3f8f; border-radius: 14px; background: linear-gradient(180deg, #1a3f8a 0%, #0b1d48 40%, #08163a); color: #e8f0ff; box-shadow: inset 0 1px 0 #7fa8ff88, 0 0 40px -10px #2f6bff, 0 30px 80px -20px #000c; }\n$::backdrop { background: #020a20cc; }", 14, 1, "deepmetal"),
    P("paper", "Paper", "a sheet of paper, hard edge", "$ { border: 0; border-radius: 2px; background: %S; box-shadow: 0 1px 2px #0002, 0 24px 50px -20px #0008; }\n$::backdrop { background: ~T40; }", 2, 0, "flat"),
    P("cyber", "Cyber", "notched panel with an accent rail", "$ { border: 0; border-radius: 0; background: %S; box-shadow: inset 0 0 0 1px ~A60, inset 4px 0 0 %A; clip-path: polygon(20px 0, 100% 0, 100% calc(100% - 20px), calc(100% - 20px) 100%, 0 100%, 0 20px); }\n$::backdrop { background: #000c; }", 0, 1, "outline"),
]

# ── Spinners (single element: <div class="uv-spinner"></div>) ────────────────
SPINNER = [
    P("ring", "Ring", "a classic arc", "$ { border: 3px solid %L; border-top-color: %A; border-radius: 50%; animation: uv-rot .8s linear infinite; }", 999, 3, "solid"),
    P("dual", "Dual ring", "two arcs chasing each other", "$ { border: 3px solid transparent; border-top-color: %A; border-bottom-color: %A2; border-radius: 50%; animation: uv-rot 1s cubic-bezier(.6, .2, .4, .8) infinite; }", 999, 3, "solid"),
    P("gradient", "Gradient arc", "a tapered gradient arc", "$ { border: 0; border-radius: 50%; background: conic-gradient(from 0deg, transparent, %A); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)); mask: radial-gradient(farthest-side, transparent calc(100% - 4px), #000 calc(100% - 3px)); animation: uv-rot .9s linear infinite; }", 999, 0, "grad"),
    P("pulse", "Pulse", "a breathing dot", "$ { border: 0; border-radius: 50%; background: %A; animation: uvp-breathe 1.1s ease-in-out infinite; }", 999, 0, "solid"),
    P("ripple", "Ripple", "rings spreading outward", "$ { border: 0; border-radius: 50%; position: relative; }\n$::before, $::after { content: \"\"; position: absolute; inset: 0; border-radius: 50%; border: 2px solid %A; animation: uvp-ripple 1.4s cubic-bezier(.2, .6, .3, 1) infinite; }\n$::after { animation-delay: -.7s; }", 999, 2, "outline"),
    P("flip", "Flip", "a flipping square", "$ { border: 0; border-radius: 3px; background: %A; animation: uvp-flip 1.2s ease-in-out infinite; }", 3, 0, "solid"),
    P("dots", "Dots", "three bouncing dots", "$ { border: 0; border-radius: 0; width: calc(var(--s, 28px) * 1.8); background: radial-gradient(circle closest-side, %A 90%, transparent) 0 50% / 33.3% 33.3% no-repeat, radial-gradient(circle closest-side, %A 90%, transparent) 50% 50% / 33.3% 33.3% no-repeat, radial-gradient(circle closest-side, %A 90%, transparent) 100% 50% / 33.3% 33.3% no-repeat; animation: uvp-dots 1s infinite linear; }", 0, 0, "solid"),
    P("orbit", "Orbit", "a moon orbiting a planet", "$ { border: 0; border-radius: 50%; position: relative; background: radial-gradient(circle, %A 22%, transparent 24%); animation: uv-rot 1.1s linear infinite; }\n$::after { content: \"\"; position: absolute; top: 0; left: 50%; width: 22%; height: 22%; margin-left: -11%; border-radius: 50%; background: %A2; box-shadow: 0 0 8px %A2; }", 999, 0, "solid"),
    P("bars", "Bars", "equaliser bars", "$ { border: 0; border-radius: 0; background: linear-gradient(%A, %A) 0 50% / 20% 100% no-repeat, linear-gradient(%A, %A) 50% 50% / 20% 100% no-repeat, linear-gradient(%A, %A) 100% 50% / 20% 100% no-repeat; animation: uvp-bars 1s infinite ease-in-out; }", 0, 0, "solid"),
    P("square", "Square trace", "a square tracing its corners", "$ { border: 3px solid %L; border-radius: 2px; position: relative; }\n$::after { content: \"\"; position: absolute; width: 30%; height: 30%; background: %A; top: -3px; left: -3px; animation: uvp-trace 1.6s steps(1) infinite; }", 2, 3, "outline"),
    P("neon", "Neon ring", "a glowing neon arc", "$ { border: 3px solid ~A15; border-top-color: %A; border-radius: 50%; box-shadow: 0 0 12px -2px %A, inset 0 0 8px -3px %A; animation: uv-rot .7s linear infinite; }", 999, 3, "neon"),
    P("pearl", "Pearl", "a slowly turning pearl ring", "$ { border: 0; border-radius: 50%; background: conic-gradient(#ffd9f3, #cdeeff, #e7ffdc, #fff2d6, #ffd9f3); -webkit-mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px)); mask: radial-gradient(farthest-side, transparent calc(100% - 6px), #000 calc(100% - 5px)); animation: uv-rot 1.4s linear infinite; filter: drop-shadow(0 2px 4px #7a6a9e66); }", 999, 0, "pearl"),
    P("half", "Half moon", "a half-filled disc spinning", "$ { border: 0; border-radius: 50%; background: linear-gradient(90deg, %A 50%, ~A20 50%); animation: uv-rot .9s linear infinite; }", 999, 0, "solid"),
    P("pixel", "Pixel", "8-bit chasing blocks", "$ { border: 0; border-radius: 0; background: conic-gradient(%A 0 25%, ~A40 0 50%, ~A20 0 75%, ~A10 0); animation: uv-rot 1s steps(4) infinite; }", 0, 0, "solid"),
]

# ── Progress bars: <div class="uv-progress" style="--v:60%"><i></i></div> ─────
PROGRESS = [
    P("thin", "Thin", "a slim, quiet line", "$ { height: 4px; border-radius: 99px; background: %L; }\n$ > i { border-radius: inherit; background: %A; box-shadow: none; }", 999, 0, "solid"),
    P("thick", "Thick", "a chunky rounded bar", "$ { height: 14px; border-radius: 99px; background: %S3; }\n$ > i { border-radius: inherit; background: %A; box-shadow: inset 0 1px 0 #ffffff50; }", 999, 0, "solid"),
    P("striped", "Striped", "animated barber stripes", "$ { height: 12px; border-radius: 6px; background: %S3; }\n$ > i { border-radius: inherit; background: repeating-linear-gradient(-45deg, %A 0 8px, LT(A,25) 8px 16px); background-size: 22.6px 22.6px; animation: uvp-roll .8s linear infinite; }", 6, 0, "grad"),
    P("gradient", "Gradient", "accent → accent-2 with a glow", "$ { height: 8px; border-radius: 99px; background: %S3; }\n$ > i { border-radius: inherit; background: linear-gradient(90deg, %A, %A2); box-shadow: 0 0 12px -2px %A; }", 999, 0, "grad"),
    P("segments", "Segments", "split into blocks", "$ { height: 10px; border-radius: 0; background: repeating-linear-gradient(90deg, %S3 0 10%, transparent 10% calc(10% + 0px)); -webkit-mask: repeating-linear-gradient(90deg, #000 0 calc(10% - 3px), transparent calc(10% - 3px) 10%); mask: repeating-linear-gradient(90deg, #000 0 calc(10% - 3px), transparent calc(10% - 3px) 10%); }\n$ > i { border-radius: 0; background: %A; }", 0, 0, "solid"),
    P("neon", "Neon", "glowing filament", "$ { height: 4px; border-radius: 99px; background: ~A15; overflow: visible; }\n$ > i { border-radius: inherit; background: LT(A,30); box-shadow: 0 0 8px %A, 0 0 18px %A; }", 999, 0, "neon"),
    P("pearl", "Pearl", "pearlescent fill on a lilac rail", "$ { height: 12px; border-radius: 99px; background: #ece5f9; box-shadow: inset 0 1px 3px #7a6a9e33; }\n$ > i { border-radius: inherit; background: linear-gradient(90deg, #ffd9f3, #c6b2ff, #9fd8ff, #e7ffdc); box-shadow: inset 0 1px 0 #fff; }", 999, 0, "pearl"),
    P("brutal", "Brutal", "boxed bar with an ink edge", "$ { height: 18px; border-radius: 0; border: 2.5px solid %T; background: %BG; box-shadow: 3px 3px 0 %T; }\n$ > i { border-radius: 0; background: %A; border-right: 2.5px solid %T; }", 0, 3, "hard"),
    P("win98", "Windows 98", "blue blocks in a sunken well", "$ { height: 20px; border-radius: 0; padding: 3px; background: #fff; box-shadow: inset -1px -1px #fff, inset 1px 1px #808080, inset -2px -2px #dfdfdf, inset 2px 2px #0a0a0a; }\n$ > i { border-radius: 0; background: repeating-linear-gradient(90deg, #000080 0 10px, transparent 10px 12px); }", 0, 2, "bevel"),
    P("metal", "Metal", "a chrome fill in a dark groove", "$ { height: 10px; border-radius: 99px; background: DK(S3,30); box-shadow: inset 0 1px 3px #000a; }\n$ > i { border-radius: inherit; background: CHROME; }", 999, 0, "chrome"),
    P("deep-metal", "Deep metal", "the deep blue metal as a fill", "$ { height: 10px; border-radius: 99px; background: #0b1d48; box-shadow: inset 0 1px 3px #000c; }\n$ > i { border-radius: inherit; background: DEEP; box-shadow: 0 0 10px -2px #3f74dc; }", 999, 0, "deepmetal"),
    P("pixel", "Pixel", "8-bit stepped fill", "$ { height: 16px; border-radius: 0; background: %S3; box-shadow: inset 0 0 0 3px %T; padding: 3px; }\n$ > i { border-radius: 0; background: repeating-linear-gradient(90deg, %A 0 8px, transparent 8px 10px); transition: width .6s steps(8); }", 0, 3, "hard"),
]

# ── Headings: .uv-h1, .uv-h2, h1, h2 ─────────────────────────────────────────
HEAD = [
    P("plain", "Plain", "the theme's own heading, no effect", "$ { background: none; color: %T; -webkit-text-fill-color: currentColor; text-shadow: none; filter: none; animation: none; }", fill="flat"),
    P("deep-metal", "Deep blue metal", "dark navy chrome with a bright band and a slow sheen", f"$ {{ background-image: linear-gradient(100deg, transparent 35%, #ffffff8c 50%, transparent 65%), linear-gradient(180deg, color-mix(in srgb, #0a2560 72%, %T) 22%, #86b4ff 48%, #1d4cad 54%, color-mix(in srgb, #071a45 72%, %T) 76%); background-size: 250% 100%, 100% 100%; {CLIP} animation: uvt-sheen 7s ease-in-out infinite; }}", fill="deepmetal"),
    P("metal", "Accent metal", "the accent as anodised metal", f"$ {{ background-image: linear-gradient(100deg, transparent 35%, #ffffff80 50%, transparent 65%), linear-gradient(180deg, DK(A,40) 26%, LT(A,55) 50%, DK(A,10) 55%, DK(A,40) 76%); background-size: 250% 100%, 100% 100%; {CLIP} animation: uvt-sheen 7s ease-in-out infinite; }}", fill="metal"),
    P("chrome", "Chrome", "liquid chrome with a horizon line", f"$ {{ background-image: linear-gradient(180deg, %T 0%, color-mix(in srgb, %T 45%, %BG) 42%, %T 52%, color-mix(in srgb, %T 70%, %BG) 66%, %T 100%); {CLIP} filter: drop-shadow(0 1px 0 ~BG60); }}", fill="chrome"),
    P("gold", "Gold leaf", "embossed gold", f"$ {{ background-image: linear-gradient(180deg, #fff3c4 0%, #e6c25a 38%, #8a5f0c 52%, #d8b04a 64%, #fff0b8 100%); {CLIP} filter: drop-shadow(0 1px 0 #3a260066); }}", fill="gold"),
    P("pearl", "Pearl", "slow-drifting mother-of-pearl", f"$ {{ background-image: linear-gradient(115deg, color-mix(in srgb, #ffb3e8 55%, %T), color-mix(in srgb, #c6b2ff 55%, %T) 30%, color-mix(in srgb, #9fd8ff 55%, %T) 50%, color-mix(in srgb, #ffe2a8 55%, %T) 70%, color-mix(in srgb, #ffb3e8 55%, %T)); background-size: 250% 100%; {CLIP} animation: uvt-holo 10s linear infinite; }}", fill="pearl"),
    P("holo", "Holo", "rainbow holographic foil", f"$ {{ background-image: linear-gradient(115deg, color-mix(in srgb, #ff6ad5 65%, %T), color-mix(in srgb, #5fb8ff 65%, %T), color-mix(in srgb, #6dff8a 65%, %T), color-mix(in srgb, #ffe45c 65%, %T), color-mix(in srgb, #ff6ad5 65%, %T)); background-size: 300% 100%; {CLIP} animation: uvt-holo 8s linear infinite; }}", fill="holo"),
    P("printstream", "Printstream", "ink with a pearl sheen running through it", f"$ {{ background-image: linear-gradient(100deg, %T 0 38%, #b9a6ea 44%, #9fd8ff 50%, #ffe7b8 56%, %T 62%); background-size: 300% 100%; {CLIP} animation: uvt-holo 9s linear infinite; }}", fill="printstream"),
    P("gradient", "Gradient", "accent → accent-2", f"$ {{ background-image: linear-gradient(90deg, %A, %A2); {CLIP} }}", fill="grad"),
    P("outline", "Outline", "hollow letters", "$ { color: transparent; -webkit-text-fill-color: transparent; -webkit-text-stroke: 1.5px %T; background: none; }", fill="outline"),
    P("neon", "Neon", "glowing neon sign", "$ { color: LT(A,55); -webkit-text-fill-color: currentColor; background: none; text-shadow: 0 0 6px ~A90, 0 0 22px ~A60, 0 0 48px ~A35; }", fill="neon"),
    P("shadow3d", "3D block", "stacked block shadow", "$ { color: %T; -webkit-text-fill-color: currentColor; background: none; text-shadow: 1px 1px 0 %A, 2px 2px 0 %A, 3px 3px 0 %A, 4px 4px 0 %A, 5px 5px 0 %A; }", fill="hard"),
    P("long-shadow", "Long shadow", "a long fading diagonal shadow", "$ { color: %T; -webkit-text-fill-color: currentColor; background: none; text-shadow: 1px 1px 0 ~A60, 2px 2px 0 ~A55, 3px 3px 0 ~A50, 4px 4px 0 ~A45, 5px 5px 0 ~A40, 6px 6px 0 ~A35, 7px 7px 0 ~A30, 8px 8px 0 ~A25, 9px 9px 0 ~A20, 10px 10px 0 ~A15; }", fill="hard"),
    P("duotone", "Duotone", "offset print in two colours", "$ { color: %T; -webkit-text-fill-color: currentColor; background: none; text-shadow: 3px 3px 0 ~A90, -2px -2px 0 ~B50; }", fill="solid"),
    P("fire", "Fire", "white-hot to red", f"$ {{ background-image: linear-gradient(0deg, #ff3d00, #ffb300 55%, #fff3c4); {CLIP} filter: drop-shadow(0 0 10px #ff6a0066); }}", fill="grad"),
    P("ice", "Ice", "frozen crystal blue", f"$ {{ background-image: linear-gradient(180deg, #ffffff, #bfe6ff 40%, #3a9be0 55%, #dff4ff 70%, #ffffff); {CLIP} filter: drop-shadow(0 1px 0 #0b3a5a55); }}", fill="pearl"),
    P("glitch", "Glitch", "RGB split that jitters", "$ { color: %T; -webkit-text-fill-color: currentColor; background: none; text-shadow: 2px 0 #ff2bd6aa, -2px 0 #00f0ffaa; animation: uvp-glitch-text 2.4s steps(1) infinite; }", fill="neon"),
    P("letterpress", "Letterpress", "pressed into the paper", "$ { color: color-mix(in srgb, %T 55%, %BG); -webkit-text-fill-color: currentColor; background: none; text-shadow: 0 1px 0 ~BG80, 0 -1px 0 #00000030; }", fill="sunken"),
    P("marker", "Marker", "highlighter swipe behind the text", "$ { color: %T; -webkit-text-fill-color: currentColor; background: linear-gradient(100deg, transparent .2em, ~A40 .2em calc(100% - .2em), transparent calc(100% - .2em)) 0 85% / 100% 42% no-repeat; text-shadow: none; -webkit-box-decoration-break: clone; box-decoration-break: clone; }", fill="soft"),
    P("synth", "Synthwave", "sunset gradient with scan lines", f"$ {{ background-image: repeating-linear-gradient(180deg, transparent 0 3px, #0002 3px 4px), linear-gradient(180deg, #ffe66d 0%, #ff6ec7 45%, #7b2ff7 100%); {CLIP} filter: drop-shadow(0 0 12px #ff3cac66); font-style: italic; }}", fill="grad", up=True),
    P("sticker", "Sticker", "thick white outline like a die-cut sticker", "$ { color: %A; -webkit-text-fill-color: currentColor; background: none; -webkit-text-stroke: 6px #fff; paint-order: stroke fill; filter: drop-shadow(0 3px 4px #0005); }", fill="solid"),
]

# ── Page backgrounds (on the element carrying the attribute, usually <html>) ──
BG = [
    P("plain", "Plain", "solid theme background", "$ { background: %BG; }", fill="flat"),
    P("aurora", "Aurora", "soft accent auroras", "$ { background: radial-gradient(45% 55% at 12% 10%, ~A40, transparent 70%), radial-gradient(40% 50% at 88% 22%, ~B35, transparent 70%), radial-gradient(55% 50% at 55% 100%, ~A30, transparent 70%) fixed, %BG; }", fill="grad"),
    P("pearl", "Pearl", "Y2K mother-of-pearl", "$ { background: radial-gradient(55% 45% at 18% 8%, #ffb3e866, transparent 70%), radial-gradient(45% 50% at 88% 14%, #9fd8ff66, transparent 70%), radial-gradient(60% 55% at 70% 95%, #c8ffb466, transparent 70%), radial-gradient(40% 40% at 30% 75%, #ffe2a855, transparent 70%) fixed, conic-gradient(from 200deg at 65% 55%, %BG, color-mix(in srgb, #e9dcff 25%, %BG), color-mix(in srgb, #d6f0ff 25%, %BG), color-mix(in srgb, #fff3d6 20%, %BG), %BG) fixed; }", fill="pearl"),
    P("mesh", "Mesh", "accent gradient mesh", "$ { background: radial-gradient(at 15% 15%, ~A40 0, transparent 50%), radial-gradient(at 85% 10%, ~B40 0, transparent 50%), radial-gradient(at 60% 100%, ~A30 0, transparent 55%) fixed, %BG; }", fill="grad"),
    P("grid", "Grid", "graph paper", "$ { background: linear-gradient(~T7 1px, transparent 1px) 0 0 / 32px 32px, linear-gradient(90deg, ~T7 1px, transparent 1px) 0 0 / 32px 32px, %BG; }", fill="flat"),
    P("blueprint", "Blueprint", "architect's grid", "$ { background: linear-gradient(~A20 1px, transparent 1px) 0 0 / 100px 100px, linear-gradient(90deg, ~A20 1px, transparent 1px) 0 0 / 100px 100px, linear-gradient(~A10 1px, transparent 1px) 0 0 / 20px 20px, linear-gradient(90deg, ~A10 1px, transparent 1px) 0 0 / 20px 20px, %BG; }", fill="flat"),
    P("dots", "Dots", "dot grid", "$ { background: radial-gradient(~T16 1px, transparent 1.4px) 0 0 / 18px 18px, %BG; }", fill="flat"),
    P("lines", "Ruled", "notebook ruling", "$ { background: linear-gradient(~B15 1px, transparent 1px) 0 0 / 100% 28px, %BG; }", fill="flat"),
    P("carbon", "Carbon", "carbon fibre weave", "$ { background: linear-gradient(27deg, DK(BG,25) 5px, transparent 5px) 0 5px, linear-gradient(207deg, DK(BG,25) 5px, transparent 5px) 10px 0, linear-gradient(27deg, LT(BG,6) 5px, transparent 5px) 0 10px, linear-gradient(207deg, LT(BG,6) 5px, transparent 5px) 10px 5px, linear-gradient(90deg, DK(BG,25) 10px, transparent 10px), linear-gradient(DK(BG,25) 25%, LT(BG,6) 25%, LT(BG,6) 50%, transparent 50%, transparent 75%, LT(BG,6) 75%, LT(BG,6)) %BG; background-size: 20px 20px; }", fill="flat"),
    P("brushed", "Brushed metal", "fine brushed lines", "$ { background: repeating-linear-gradient(90deg, #ffffff0c 0 1px, transparent 1px 3px), linear-gradient(180deg, LT(BG,10), %BG 45%, DK(BG,10)) fixed; }", fill="metal"),
    P("deep-metal", "Deep metal", "deep navy anodised plate", "$ { background: repeating-linear-gradient(90deg, #ffffff06 0 1px, transparent 1px 3px), radial-gradient(80% 60% at 50% 0%, #1d4cad66, transparent 70%) fixed, linear-gradient(180deg, #0b1d48, #050d24) fixed; }", fill="deepmetal"),
    P("galaxy", "Galaxy", "stars and nebula", "$ { background: radial-gradient(1px 1px at 20% 30%, #fff, transparent) 0 0 / 220px 220px, radial-gradient(1px 1px at 70% 60%, #fff, transparent) 0 0 / 260px 260px, radial-gradient(1.5px 1.5px at 40% 80%, #ffffffcc, transparent) 0 0 / 300px 300px, radial-gradient(60% 50% at 30% 30%, ~A40, transparent 70%) fixed, radial-gradient(50% 60% at 80% 70%, ~B40, transparent 70%) fixed, #070712; }", fill="grad"),
    P("halftone", "Halftone", "comic-print dots", "$ { background: radial-gradient(~A30 1.4px, transparent 1.6px) 0 0 / 10px 10px, %BG; }", fill="flat"),
    P("checker", "Checker", "chequerboard", "$ { background: conic-gradient(%S2 25%, transparent 0 50%, %S2 0 75%, transparent 0) 0 0 / 28px 28px, %BG; }", fill="flat"),
    P("stripes", "Stripes", "diagonal stripes", "$ { background: repeating-linear-gradient(-45deg, ~A8 0 12px, transparent 12px 24px), %BG; }", fill="flat"),
    P("sunset", "Sunset", "synthwave sky", "$ { background: linear-gradient(180deg, #2b1055 0%, #7b2ff7 35%, #ff6ec7 70%, #ffd166 100%) fixed; }", fill="grad"),
    P("scan", "Scanlines", "CRT scanlines and a vignette", "$ { background: repeating-linear-gradient(0deg, #0000002e 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 55%, #00000073) fixed, %BG; }", fill="flat"),
]

FAMILIES = [
    # key, attribute label, group, targets, extra macros, base/reset css, parts, default (the look you get without a pick)
    dict(key="btn", label="Buttons", desc="Button designs for .uv-btn (and the site's own .btn)", targets=".uv-btn, .btn",
         macros={"$P": ".uv-btn--primary, .uv-btn--grad, .btn--primary, .btn.p"},
         reset="$ { position: relative; isolation: isolate; background-image: none; box-shadow: none; text-shadow: none; filter: none; animation: none; transform: none; translate: none; scale: none; rotate: none; clip-path: none; text-decoration: none; outline-offset: 3px; transition: transform .18s var(--uv-ease), background-color .2s, background-position .6s, background-size .35s, color .2s, border-color .2s, box-shadow .25s, border-radius .4s, filter .2s; }\n$::before, $::after { content: none; }\n$.is-loading::before { content: \"\"; }",
         parts=BTN, default="solid"),
    dict(key="card", label="Cards", desc="Card and panel designs for .uv-card (and the homepage's resource cards)", targets=".uv-card, .res",
         macros={}, reset="$ { box-shadow: none; backdrop-filter: none; -webkit-backdrop-filter: none; transform: none; translate: none; clip-path: none; -webkit-mask: none; mask: none; transition: transform .3s var(--uv-ease), box-shadow .3s, border-color .3s; }\n$::before { content: none; }",
         parts=CARD, default="flat"),
    dict(key="input", label="Text fields", desc="Inputs, selects and textareas", targets=".uv-input, .uv-select, .uv-textarea, .uv-otp input",
         macros={}, reset="$ { box-shadow: none; backdrop-filter: none; clip-path: none; transform: none; transition: border-color .2s, box-shadow .2s, background .2s, transform .2s; }\n$:focus { outline: none; }",
         parts=INPUT, default="boxed"),
    dict(key="switch", label="Switches", desc="Toggle switches (.uv-switch)", targets=".uv-switch", macros={},
         reset="$ i { overflow: visible; box-shadow: none; backdrop-filter: none; margin: 0; }\n$ i::before { content: none; }\n$ i::after { transition: transform .3s var(--uv-spring), background .25s, box-shadow .25s; }",
         parts=SWITCH, default="classic"),
    dict(key="check", label="Checkboxes", desc="Checkboxes and radios (.uv-check)", targets=".uv-check", macros={},
         reset="$ input { box-shadow: none; animation: none; backdrop-filter: none; }\n$ input::after { background: none; border-radius: 0; }",
         parts=CHECK, default="classic"),
    dict(key="range", label="Sliders", desc="Range sliders (.uv-range)", targets=".uv-range", macros={},
         reset="$ { border: 0; box-shadow: none; }", parts=RANGE, default="classic"),
    dict(key="tabs", label="Tabs", desc="Tab bars and segmented controls (.uv-tabs)", targets=".uv-tabs", macros={},
         reset="$ { box-shadow: none; clip-path: none; backdrop-filter: none; }\n$ > button { background: none; box-shadow: none; text-shadow: none; }\n$ > .uv-tabs__ind { display: block; border: 0; clip-path: none; }",
         parts=TABS, default="slide"),
    dict(key="nav", label="Navigation", desc="Navbars, side navs, pagination and menus", targets=".uv-nav, .uv-sidenav, .uv-pages, .uv-menu",
         macros={"$I": ".uv-nav a, .uv-sidenav a, .uv-pages > :is(a, button, span), .uv-menu > :is(a, button)",
                 "$A": ":is(.uv-nav, .uv-sidenav) a:is(.is-active, [aria-current]), :is(.uv-pages, .uv-menu) > :is(a, button, span):is(.is-active, [aria-current])"},
         reset="$ { box-shadow: none; clip-path: none; backdrop-filter: none; }\n$I { box-shadow: none; text-shadow: none; background: transparent; clip-path: none; transition: color .2s, background .2s, box-shadow .2s; }\n$:is(.uv-pages) { background: transparent; border: 0; box-shadow: none; clip-path: none; }",
         parts=NAV, default="pills"),
    dict(key="badge", label="Badges", desc="Badges and chips (.uv-badge, .uv-chip)", targets=".uv-badge, .uv-chip, .chip", macros={},
         reset="$ { --k: var(--uv-accent); box-shadow: none; text-shadow: none; transform: none; clip-path: none; animation: none; backdrop-filter: none; }\n$::before, $::after { content: none; }\n$:is(.uv-badge--success) { --k: var(--uv-success); } $:is(.uv-badge--warn) { --k: var(--uv-warn); } $:is(.uv-badge--danger) { --k: var(--uv-danger); } $:is(.uv-badge:not(.uv-badge--accent, .uv-badge--success, .uv-badge--warn, .uv-badge--danger), .uv-chip, .chip) { --k: var(--uv-muted); } $:is(.is-active) { --k: var(--uv-accent); }\n$.uv-badge--live::before { content: \"\"; }",
         parts=BADGE, default="soft"),
    dict(key="alert", label="Alerts & toasts", desc="Alerts (.uv-alert) and toasts (.uv-toast)", targets=".uv-alert, .uv-toast", macros={},
         reset="$ { --k: var(--uv-accent); box-shadow: none; backdrop-filter: none; transform: none; }\n$:not(.uv-toast)::before { content: none; }\n$:is(.uv-alert--info) { --k: var(--uv-info); } $:is(.uv-alert--success, .uv-toast--success) { --k: var(--uv-success); } $:is(.uv-alert--warn, .uv-toast--warn) { --k: var(--uv-warn); } $:is(.uv-alert--danger, .uv-toast--error) { --k: var(--uv-danger); }\n$ .uv-toast__icon { background: var(--k); color: #fff; }",
         parts=ALERT, default="bar"),
    dict(key="modal", label="Modals", desc="Dialogs (.uv-modal) and the command palette (.uv-cmdk)", targets=".uv-modal, .uv-cmdk", macros={},
         reset="$ { box-shadow: none; backdrop-filter: none; clip-path: none; }\n$::backdrop { backdrop-filter: none; }", parts=MODAL, default="classic"),
    dict(key="spinner", label="Spinners", desc="Loading spinners (.uv-spinner)", targets=".uv-spinner", macros={},
         reset="$ { box-shadow: none; background: none; filter: none; -webkit-mask: none; mask: none; animation: none; position: relative; }\n$::before, $::after { content: none; }", parts=SPINNER, default="ring"),
    dict(key="progress", label="Progress", desc="Progress bars (.uv-progress)", targets=".uv-progress", macros={},
         reset="$ { box-shadow: none; border: 0; padding: 0; -webkit-mask: none; mask: none; overflow: hidden; }\n$ > i { box-shadow: none; border: 0; animation: none; }", parts=PROGRESS, default="thin"),
    dict(key="head", label="Headings", desc="Heading effects for .uv-h1, .uv-h2 and every h1/h2", targets=".uv-h1, .uv-h2, h1, h2", macros={},
         reset="$ { -webkit-text-stroke: 0; paint-order: normal; }", parts=HEAD, default="plain"),
    dict(key="bg", label="Backgrounds", desc="Page backgrounds (on the element with the attribute — usually <html>)", targets="SELF", macros={},
         reset="$ body { background-color: transparent; }", parts=BG, default="plain"),
]

KITS = [
    # name, label, desc, theme, {family: part}
    ("pearl", "Pearlescent Y2K", "mother-of-pearl everything, lilac and sky", "y2k",
     dict(btn="pearl", card="pearl", input="pearl", switch="pearl", check="pearl", range="pearl", tabs="pearl", nav="pearl", badge="pearl", alert="pearl", modal="pearl", spinner="pearl", progress="pearl", head="pearl", bg="pearl")),
    ("printstream", "Printstream", "pearl white, black frames, iridescent sheen", "y2k",
     dict(btn="printstream", card="pearl", input="chrome", switch="pearl", check="pearl", range="pearl", tabs="ink", nav="ink", badge="metal", alert="pearl", modal="pearl", spinner="pearl", progress="pearl", head="printstream", bg="pearl")),
    ("deep-metal", "Deep Blue Metal", "navy anodised metal and chrome", "midnight",
     dict(btn="deep-metal", card="deep-metal", input="deep-metal", switch="deep-metal", check="metal", range="deep-metal", tabs="metal", nav="deep-metal", badge="metal", alert="metal", modal="deep-metal", spinner="neon", progress="deep-metal", head="deep-metal", bg="deep-metal")),
    ("brutal", "Neo-Brutal", "thick ink, hard shadows, loud fills", "brutal",
     dict(btn="brutal", card="brutal", input="brutal", switch="brutal", check="brutal", range="brutal", tabs="brutal", nav="brutal", badge="brutal", alert="brutal", modal="brutal", spinner="square", progress="brutal", head="shadow3d", bg="dots")),
    ("cyber-neon", "Cyber Neon", "glowing tubes in the dark", "neon",
     dict(btn="neon-tube", card="neon", input="neon", switch="neon", check="neon", range="neon", tabs="neon", nav="neon", badge="neon", alert="neon", modal="neon", spinner="neon", progress="neon", head="neon", bg="grid")),
    ("glass", "Frosted Glass", "translucent panes over colour", "glass",
     dict(btn="glass", card="glass", input="glass", switch="glass", check="glass", range="glass", tabs="glass", nav="glass", badge="glass", alert="glass", modal="glass", spinner="gradient", progress="gradient", head="gradient", bg="aurora")),
    ("terminal", "Terminal", "green phosphor console", "terminal",
     dict(btn="terminal", card="terminal", input="terminal", switch="square", check="square-fill", range="square", tabs="terminal", nav="terminal", badge="terminal", alert="terminal", modal="terminal", spinner="pixel", progress="pixel", head="plain", bg="scan")),
    ("win98", "Windows 98", "system grey bevels", "retro",
     dict(btn="win98", card="bevel", input="win98", switch="3d", check="win98", range="win98", tabs="win98", nav="win98", badge="square", alert="win98", modal="win98", spinner="pixel", progress="win98", head="plain", bg="plain")),
    ("aqua", "Aqua 2001", "glossy gel and pinstripes", "soft",
     dict(btn="aqua", card="elevated", input="pill", switch="aqua", check="round", range="thick", tabs="segmented", nav="glass", badge="soft", alert="soft", modal="sheet", spinner="dual", progress="striped", head="chrome", bg="lines")),
    ("clay", "Claymorphism", "puffy, rounded, friendly", "soft",
     dict(btn="clay", card="clay", input="clay", switch="ios", check="pop", range="thick", tabs="bubble", nav="pills", badge="soft", alert="soft", modal="sheet", spinner="dots", progress="thick", head="plain", bg="plain")),
    ("neumorph", "Neumorphic", "soft UI extruded from the page", "fog",
     dict(btn="neumorph", card="neumorph", input="inset", switch="classic", check="round", range="classic", tabs="segmented", nav="pills", badge="soft", alert="soft", modal="classic", spinner="ring", progress="thick", head="letterpress", bg="plain")),
    ("luxe", "Luxe Gold", "black lacquer and gold leaf", "luxe",
     dict(btn="gold", card="double", input="underline", switch="metal", check="metal", range="metal", tabs="underline", nav="underline", badge="metal", alert="metal", modal="metal", spinner="ring", progress="metal", head="gold", bg="brushed")),
    ("swiss", "Swiss Minimal", "grid, ink and one red", "swiss",
     dict(btn="ink", card="accent-bar", input="underline", switch="square", check="square-fill", range="line", tabs="minimal", nav="underline", badge="outline", alert="bar", modal="paper", spinner="ring", progress="thin", head="plain", bg="grid")),
    ("paper", "Paper & Ink", "notebook, marker and stamps", "sketch",
     dict(btn="paper", card="paper", input="paper", switch="line", check="cross", range="line", tabs="folder", nav="dots", badge="stamp", alert="sticky", modal="paper", spinner="ring", progress="segments", head="marker", bg="lines")),
    ("cyberpunk", "Cyberpunk", "notched panels and hazard rails", "neon",
     dict(btn="cyber", card="cyber", input="cyber", switch="square", check="square-fill", range="square", tabs="cyber", nav="cyber", badge="ribbon", alert="banner", modal="cyber", spinner="bars", progress="segments", head="glitch", bg="carbon")),
    ("synthwave", "Synthwave", "80s sunsets and chrome", "neon",
     dict(btn="synth", card="glow", input="neon", switch="day-night", check="neon", range="gradient", tabs="gradient", nav="gradient", badge="gradient", alert="neon", modal="neon", spinner="orbit", progress="gradient", head="synth", bg="sunset")),
    ("arcade", "Arcade", "chunky cabinet buttons and pixels", "brutal",
     dict(btn="arcade", card="brutal", input="thick", switch="pixel", check="pop", range="brutal", tabs="bubble", nav="brutal", badge="sticker", alert="brutal", modal="brutal", spinner="pixel", progress="pixel", head="sticker", bg="checker")),
    ("holo", "Holo Foil", "rainbow foil and orbiting borders", "y2k",
     dict(btn="holo", card="holo-border", input="gradient", switch="pearl", check="pearl", range="gradient", tabs="gradient", nav="gradient", badge="holo", alert="glass", modal="glass", spinner="pearl", progress="pearl", head="holo", bg="mesh")),
]

KEYFRAMES = """@keyframes uvp-flicker { 0%, 19%, 21%, 23%, 55%, 57%, 100% { opacity: 1; } 20%, 22%, 56% { opacity: .55; } }
@keyframes uvp-blink { 50% { opacity: 0; } }
@keyframes uvp-roll { to { background-position: 34px 0; } }
@keyframes uvp-jelly { 30% { transform: scale(1.12, .88); } 50% { transform: scale(.92, 1.08); } 70% { transform: scale(1.04, .96); } }
@keyframes uvp-glitch { 0% { transform: translate(0); } 33% { transform: translate(-2px, 1px); filter: hue-rotate(40deg); } 66% { transform: translate(2px, -1px); } }
@keyframes uvp-glitch-text { 0%, 92%, 100% { text-shadow: 2px 0 #ff2bd6aa, -2px 0 #00f0ffaa; transform: none; } 94% { text-shadow: -3px 0 #ff2bd6, 3px 0 #00f0ff; transform: translateX(2px); } 97% { text-shadow: 3px 0 #ff2bd6, -3px 0 #00f0ff; transform: translateX(-2px); } }
@keyframes uvp-pop { 40% { transform: scale(1.25); } }
@keyframes uvp-sheet { from { transform: translateY(40px); opacity: 0; } }
@keyframes uvp-breathe { 50% { transform: scale(.55); opacity: .5; } }
@keyframes uvp-ripple { from { transform: scale(.1); opacity: 1; } to { transform: scale(1); opacity: 0; } }
@keyframes uvp-flip { 0% { transform: perspective(80px) rotateX(0) rotateY(0); } 50% { transform: perspective(80px) rotateX(-180deg) rotateY(0); } 100% { transform: perspective(80px) rotateX(-180deg) rotateY(-180deg); } }
@keyframes uvp-dots { 0% { background-size: 33.3% 33.3%, 33.3% 33.3%, 33.3% 33.3%; } 33% { background-size: 33.3% 80%, 33.3% 33.3%, 33.3% 33.3%; } 66% { background-size: 33.3% 33.3%, 33.3% 80%, 33.3% 33.3%; } 100% { background-size: 33.3% 33.3%, 33.3% 33.3%, 33.3% 80%; } }
@keyframes uvp-bars { 0% { background-size: 20% 100%, 20% 40%, 20% 70%; } 33% { background-size: 20% 40%, 20% 100%, 20% 40%; } 66% { background-size: 20% 70%, 20% 40%, 20% 100%; } 100% { background-size: 20% 100%, 20% 40%, 20% 70%; } }
@keyframes uvp-trace { 0% { top: -3px; left: -3px; } 25% { top: -3px; left: calc(70% + 3px); } 50% { top: calc(70% + 3px); left: calc(70% + 3px); } 75% { top: calc(70% + 3px); left: -3px; } }
@keyframes uvt-sheen { 0%, 60% { background-position: 150% 0, 0 0; } 100% { background-position: -50% 0, 0 0; } }
@keyframes uvt-holo { to { background-position: 300% 0; } }
@property --uv-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
@keyframes uv-spin-a { to { --uv-a: 360deg; } }
@keyframes uv-rot { to { transform: rotate(360deg); } }
"""

TOK = {"A2": "--uv-accent-2", "B": "--uv-accent-2", "A": "--uv-accent", "T": "--uv-text", "BG": "--uv-bg", "S2": "--uv-surface-2", "S3": "--uv-surface-3",
       "S": "--uv-surface", "L1": "--uv-line", "L": "--uv-line-2", "M": "--uv-muted", "OA": "--uv-on-accent", "K": "--k"}
TOKF = {"OA": "var(--uv-on-accent, #fff)"}


def tok(k):
    return TOKF.get(k) or f"var({TOK[k]})"


def expand(css, fam, name=None):
    """Expand the shorthand. Element selectors become attribute-scoped selectors where the NEAREST
    data-uv-<family> wins (an inner area or element can pick a different design than <html>):
        :is([data-uv-btn="x"] E, E[data-uv-btn="x"]):not( inside a different design that sits inside x ):not(#_)
    :not(#_) lifts every part rule above theme rules. name=None builds the family's shared reset."""
    css = css.replace("PEARL", PEARL).replace("CHROME", CHROME).replace("GOLD", GOLD).replace("DEEP", DEEP).replace("HOLO", HOLO)
    keys = "A2|BG|S2|S3|L1|OA|A|T|S|L|M|K"
    css = re.sub(r"DK\((" + keys + r"),(\d+)\)", lambda m: f"color-mix(in srgb, {tok(m[1])}, #000 {m[2]}%)", css)
    css = re.sub(r"LT\((" + keys + r"),(\d+)\)", lambda m: f"color-mix(in srgb, {tok(m[1])}, #fff {m[2]}%)", css)
    # ~A40 → accent at 40% opacity (~B40 = accent-2)
    css = re.sub(r"~(BG|S2|S3|OA|A|B|T|S|K)(\d+)", lambda m: f"color-mix(in srgb, {tok(m[1])} {m[2]}%, transparent)", css)
    css = re.sub(r"%(" + keys + r")\b", lambda m: tok(m[1]), css)
    k = fam["key"]
    ANY = f"[data-uv-{k}]"
    if name is None:
        root = f'{ANY}:not([data-uv-{k}=""])'
        wrap = lambda sel: f":is({root} :is({sel}), :is({sel}){root}):not(#_)"
        self_ = f"{root}:not(#_)"
    else:
        A = f'[data-uv-{k}="{name}"]'
        guard = f":not({A} {ANY}:not({A}) *, {A} {ANY}:not({A}))"
        wrap = lambda sel: f":is({A} :is({sel}), :is({sel}){A}){guard}:not(#_)"
        self_ = f"{A}{guard}:not(#_)"
    for mac in sorted(fam["macros"], key=len, reverse=True):
        css = css.replace(mac, wrap(fam["macros"][mac]))
    return css.replace("$", self_ if fam["targets"] == "SELF" else wrap(fam["targets"]))


def family_css(fam, version):
    k = fam["key"]
    out = [f"/*! UI Vault {version} · parts: {fam['label'].lower()} — {len(fam['parts'])} designs. Use data-uv-{k}=\"NAME\" on <html> or any element. Needs core.css. MIT */"]
    out.append(f"/* shared reset for every {k} design */\n{expand(fam['reset'], fam)}")
    for p in fam["parts"]:
        css = p["css"].strip()
        if k == "nav" and p["approx"]["r"] >= 999:   # pill bars stay pills, but tall side navs and menus get a sane radius
            css += "\n$:is(.uv-sidenav, .uv-menu) { border-radius: 18px; }"
        out.append(f"/* @part {k}/{p['name']} — {p['desc']} */\n{expand(css, fam, p['name'])}")
    return "\n".join(out) + "\n"


def keyframes_css(version):
    return f"/*! UI Vault {version} · parts: shared keyframes. MIT */\n" + KEYFRAMES


def meta():
    fams = [{"key": f["key"], "label": f["label"], "desc": f["desc"], "targets": f["targets"], "default": f["default"],
             "parts": [{k: p[k] for k in ("name", "label", "desc", "approx")} for p in f["parts"]]} for f in FAMILIES]
    kits = [{"name": n, "label": l, "desc": d, "theme": t, "parts": ps} for n, l, d, t, ps in KITS]
    names = {f["key"]: {p["name"] for p in f["parts"]} for f in FAMILIES}
    for kit in kits:
        for fk, pn in kit["parts"].items():
            assert pn in names[fk], f"kit {kit['name']}: unknown {fk} part {pn!r}"
    return {"families": fams, "kits": kits}


# ── Native export (UiVault3 for PySide6 / Qt C++) ────────────────────────────
# Each design's CSS becomes rules {"sub": part of the widget, "when": [states], "decl": {property: value}}.
# Values keep var(--uv-*) / color-mix() so the native engine resolves them against any theme.
NATIVE_BASE = {
    "btn": "$ { background: %S2; color: %T; border: 1px solid %L; border-radius: 8px; font-weight: 500; }\n$:hover { border-color: %T; }\n$P { background: %T; color: %BG; border-color: %T; }\n$P:hover { background: %A; color: #fff; border-color: %A; }\n$:active { transform: translateY(1px); }",
    "card": "$ { background: %S; border: 1px solid %L; border-radius: 10px; }",
    "input": "$ { background: %S; border: 1px solid %L; border-radius: 6px; color: %T; }\n$:focus { border-color: %A; box-shadow: 0 0 0 3px ~A22; }\n$::placeholder { color: %M; }",
    "switch": "$ i { width: 46px; height: 26px; border-radius: 99px; background: %S3; border: 1px solid %L; }\n$ i::after { top: 2px; left: 2px; width: 20px; height: 20px; border-radius: 50%; background: #fff; box-shadow: 0 2px 6px #0005; }\n$ input:checked + i { background: %A; border-color: %A; }\n$ input:checked + i::after { transform: translateX(20px); }",
    "check": "$ input { width: 20px; height: 20px; border-radius: 4px; border: 2px solid %L; background: transparent; }\n$ input:checked { background: %A; border-color: %A; }\n$ input::after { border-color: %OA; }\n$ input[type=radio] { border-radius: 50%; }",
    "range": "$ { height: 4px; border-radius: 99px; background: linear-gradient(90deg, %A var(--v), %L var(--v)); }\n$::-webkit-slider-thumb { width: 16px; height: 16px; border-radius: 50%; background: %BG; border: 2px solid %T; }",
    "tabs": "$ { background: transparent; border: 1px solid %L; border-radius: 10px; }\n$ > button { color: %M; border-radius: 7px; }\n$ > button[aria-selected=\"true\"] { color: %OA; }\n$ > .uv-tabs__ind { background: %A; border-radius: 7px; }",
    "nav": "$ { background: %S; border: 1px solid %L1; border-radius: 12px; }\n$I { color: %M; border-radius: 8px; }\n$I:hover { color: %T; background: %S2; }\n$A { color: %T; background: %S2; }",
    "badge": "$ { border-radius: 4px; border: 1px solid var(--k); background: transparent; color: var(--k); font: 500 11px var(--uv-mono); text-transform: uppercase; }",
    "alert": "$ { border: 0; border-left: 3px solid var(--k); border-radius: 6px; background: %S; color: %T; }",
    "modal": "$ { background: %S; border: 1px solid %L; border-radius: 12px; box-shadow: 0 30px 80px -20px #000b; }",
    "spinner": "$ { border: 3px solid %L; border-top-color: %A; border-radius: 50%; animation: uv-rot .8s linear infinite; }",
    "progress": "$ { height: 6px; border-radius: 99px; background: %L; }\n$ > i { border-radius: 99px; background: %A; }",
    "head": "$ { color: %T; }",
    "bg": "$ { background: %BG; }",
}

_SUB = [  # (regex on the selector remainder, sub-element name)
    (r"^$", "main"), (r"^::before$", "::before"), (r"^::after$", "::after"), (r"^::placeholder$", "placeholder"), (r"^::backdrop$", "backdrop"),
    (r"^ i$", "i"), (r"^ i::after$", "i::after"), (r"^ i::before$", "i::before"), (r"^ input \+ i$", "i"), (r"^ input \+ i::after$", "i::after"), (r"^ input \+ i::before$", "i::before"),
    (r"^ input$", "input"), (r"^ input::after$", "input::after"),
    (r"^ > button$", "button"), (r"^ > \.uv-tabs__ind$", "ind"), (r"^ > i$", "bar"), (r"^::-webkit-slider-thumb$", "thumb"),
    (r"^ \.uv-toast__icon$", "icon"), (r"^ :is\(\.uv-muted, \.uv-dim, p\)$", "muted"), (r"^ :is\(\.uv-h3, h3, h4\)$", "title"),
]
_COND = [(":not($P)", "notprimary"), (":hover", "hover"), (":active", "active"), (":focus-visible", "focus"), (":focus", "focus"), (":checked", "checked"),
         ('[aria-selected="true"]', "selected"), ("[type=radio]", "radio"), (".is-loading", "loading"), ("[open]", "open"), (":is(.uv-sidenav, .uv-menu)", "vertical")]


def _norm_selector(sel):
    s = sel.strip()
    when = set()
    if s.startswith("$P"): when.add("primary"); s = s[2:]
    elif s.startswith("$A"): when.add("current"); s = s[2:]; sub_prefix = "item"
    elif s.startswith("$I"): s = s[2:]; sub_prefix = "item"
    elif s.startswith("$"): s = s[1:]
    else: return None
    sub_prefix = "item" if sel.strip().startswith(("$I", "$A")) else None
    for tok, c in _COND:
        if tok in s: when.add(c); s = s.replace(tok, "")
    if ":is(" in s.replace(":is(.uv-muted, .uv-dim, p)", "").replace(":is(.uv-h3, h3, h4)", "") or "::-moz" in s: return None
    for rx, sub in _SUB:
        if re.match(rx, s):
            if sub_prefix: sub = "item" if sub == "main" else None
            return (sub, sorted(when)) if sub else None
    return None


def _rules(css, fam):
    out = []
    css = expand_values(css)
    for chunk in css.split("}"):
        if "{" not in chunk: continue
        sels, body = chunk.split("{", 1)
        decl = {}
        for d in re.split(r";(?![^(]*\))", body):
            if ":" in d:
                k, v = d.split(":", 1); decl[k.strip()] = v.strip()
        if not decl: continue
        for sel in re.split(r",(?![^(]*\))", sels):
            n = _norm_selector(sel.strip())
            if n: out.append({"sub": n[0], "when": n[1], "decl": decl})
    return out


def expand_values(css):
    """The value half of expand(): tokens, colour helpers and gradient constants (selectors stay in $ shorthand)."""
    css = css.replace("PEARL", PEARL).replace("CHROME", CHROME).replace("GOLD", GOLD).replace("DEEP", DEEP).replace("HOLO", HOLO)
    keys = "A2|BG|S2|S3|L1|OA|A|T|S|L|M|K"
    css = re.sub(r"DK\((" + keys + r"),(\d+)\)", lambda m: f"color-mix(in srgb, {tok(m[1])}, #000 {m[2]}%)", css)
    css = re.sub(r"LT\((" + keys + r"),(\d+)\)", lambda m: f"color-mix(in srgb, {tok(m[1])}, #fff {m[2]}%)", css)
    css = re.sub(r"~(BG|S2|S3|OA|A|B|T|S|K)(\d+)", lambda m: f"color-mix(in srgb, {tok(m[1])} {m[2]}%, transparent)", css)
    return re.sub(r"%(" + keys + r")\b", lambda m: tok(m[1]), css)


def native():
    fams = {}
    for f in FAMILIES:
        k = f["key"]
        fams[k] = {"base": _rules(NATIVE_BASE[k], f), "reset": _rules(f["reset"], f),
                   "parts": {p["name"]: _rules(p["css"], f) for p in f["parts"]}}
    return {"families": fams, "kits": [{"name": n, "label": l, "theme": t, "parts": ps} for n, l, _, t, ps in KITS]}
