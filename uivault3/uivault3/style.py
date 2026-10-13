"""UiVault3 style state: theme tokens + one design per element family + effect layers → resolved Styles."""
from __future__ import annotations

import json
import math
import re
from pathlib import Path

from PySide6.QtCore import QObject, Signal
from PySide6.QtGui import QColor

from .engine import Style, Vars, merge

_HERE = Path(__file__).parent
TOKENS = json.loads((_HERE / "data" / "tokens.json").read_text())["themes"]
NATIVE = json.loads((_HERE / "data" / "native.json").read_text())
LAYERS = json.loads((_HERE / "data" / "layers.json").read_text())
KITS = {k["name"]: k for k in NATIVE["kits"]}
FAMILIES = list(NATIVE["families"])
KIND = {k["key"]: k for k in LAYERS["kinds"] + LAYERS["pageKinds"]}


def _theme_vars(name: str) -> dict:
    t = TOKENS[name]
    v = {}
    for k, c in t["colors"].items():
        v["--uv-" + k] = c
    f = t["fonts"]
    v["--uv-font"] = f'"{f.get("font-family", "Geist")}"'
    v["--uv-font-head"] = v["--uv-serif"] = v["--uv-display"] = f'"{f.get("font-head-family", f.get("font-family", "Geist"))}"'
    v["--uv-mono"] = f'"{f.get("mono-family", "Geist Mono")}"'
    if "--uv-on-accent" not in v:
        a = QColor(t["solid"]["accent"]); lum = (0.2126 * a.red() + 0.7152 * a.green() + 0.0722 * a.blue()) / 255
        v["--uv-on-accent"] = "#111111" if lum > .55 else "#ffffff"
    for k, n in t["shape"].items(): v["--uv-" + k] = f"{n:g}px"
    return v


# ── layers → rules (mirrors lib/js/layers.js) ────────────────────────────────
TOK = {"accent": "var(--uv-accent)", "accent-2": "var(--uv-accent-2)", "text": "var(--uv-text)", "white": "#ffffff", "black": "#000000",
       "success": "var(--uv-success)", "warn": "var(--uv-warn)", "danger": "var(--uv-danger)", "info": "var(--uv-info)"}


def _col(v): return TOK.get(v, v or "var(--uv-accent)")


def _num(expr, s):
    if isinstance(expr, (int, float)): return expr
    return float(eval(str(expr), {"__builtins__": {}}, {"s": s}))


def _val(text, p):
    c, c2 = _col(p.get("c")), _col(p.get("c2") or "accent-2")
    t = str(text)
    for a, b in (("%A2", "var(--uv-accent-2)"), ("%A", "var(--uv-accent)"), ("%T", "var(--uv-text)"), ("%BG", "var(--uv-bg)"), ("%S", "var(--uv-surface)")): t = t.replace(a, b)
    t = t.replace("on(c)", "#111111" if p.get("c") == "white" else "var(--uv-on-accent, #fff)" if p.get("c", "accent") == "accent" else "#ffffff")
    t = re.sub(r"mix\(([^,]+),([^,]+),(\d+)\)", lambda m: f"color-mix(in srgb, {m[1].strip()}, {m[2].strip()} {m[3]}%)", t)
    t = re.sub(r"\bc2@(\d+)", lambda m: f"color-mix(in srgb, {c2} {m[1]}%, transparent)", t)
    t = re.sub(r"\bc@(\d+)", lambda m: f"color-mix(in srgb, {c} {m[1]}%, transparent)", t)
    t = re.sub(r"\bc2\b", c2, t)
    return re.sub(r"\bc\b", c, t)


def _drops(lst, p):
    return " ".join(f"drop-shadow({_num(x, p['s']):g}px {_num(y, p['s']):g}px {max(0, _num(b, p['s'])):g}px {_val(cc, p)})" for x, y, b, cc in (lst or []))


RADIUS = {"pill": "999px", "blob": "30% 70% 70% 30% / 30% 30% 70% 70%"}
CLIP = {"notch": "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
        "cut": "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))"}
FONT = {"mono": "var(--uv-mono)", "serif": "var(--uv-serif)", "display": "var(--uv-font-head)"}


def layer_rules(kinds: dict) -> tuple[list[dict], dict]:
    """→ (rules like the parts ones, extras the widgets handle: enter/ripple/shine/ring)."""
    base, hov, act, extra = {}, {}, {}, {}
    filt, hfilt, afilt, anims, hanims = [], [], [], [], []
    for k, v in kinds.items():
        kd = KIND.get(k); o = next((x for x in (kd or {}).get("options", []) if x["name"] == (v or {}).get("o")), None)
        if not o or k == "fx" or o.get("page"): continue
        p = dict(kd.get("defaults", {})); p.update(v)
        if o.get("drop"): filt.append(_drops(o["drop"], p))
        if o.get("anim") and k != "enter": anims.append(f"{o['anim']} {p.get('t', 3) if k == 'idle' else 2.4}s {'linear' if o['anim'] in ('uvl-hue', 'uvl-spin') else 'ease-in-out'} infinite")
        if o.get("anim") and k == "enter": extra["enter"] = (o["anim"], p.get("t", .6))
        if o.get("outline"):
            w, st, c, off = o["outline"]; base["outline"] = f"{_num(w, p['s']):g}px {st} {_val(c, p)}"; base["outline-offset"] = f"{_num(off, p['s']):g}px"
        if o.get("ring"): extra["ring"] = (o["ring"], p.get("s", 2), _col(p.get("c")), _col(p.get("c2") or "accent-2"))
        if o.get("bg"): base["background"] = _val(o["bg"], p)
        if o.get("fg"): base["color"] = _val(o["fg"], p)
        if o.get("backdrop") and not o.get("bg"): base["background"] = f"color-mix(in srgb, var(--uv-surface) {round(o['backdrop'][1] * 100)}%, transparent)"
        for a, b in (o.get("extra") or {}).items(): base[a] = b
        if o.get("radius"): base["border-radius"] = RADIUS.get(o["radius"], o["radius"])
        if o.get("clip"): base["clip-path"] = CLIP[o["clip"]]
        f = o.get("font") or {}
        if f.get("tt"): base["text-transform"] = f["tt"]
        if f.get("ls"): base["letter-spacing"] = f["ls"]
        if f.get("ff"): base["font-family"] = FONT[f["ff"]]
        if f.get("fw"): base["font-weight"] = str(f["fw"])
        if f.get("fs"): base["font-style"] = f["fs"]
        if f.get("glow"): base["text-shadow"] = f"0 0 6px {_val(f['glow'], p)}, 0 0 18px {_val('c@60', p)}"
        if f.get("emboss"): base["text-shadow"] = "0 1px 0 #ffffff70, 0 -1px 0 #00000040"
        if f.get("stroke"): base["-webkit-text-stroke"] = f"1.2px {_val(f['stroke'], p)}"; base["color"] = "transparent"
        if f.get("grad"): base["background-image"] = _val(f["grad"], p); base["-webkit-background-clip"] = "text"
        for state, d, fl, an in ((o.get("hover"), hov, hfilt, hanims), (o.get("active"), act, afilt, None)):
            if not state: continue
            if state.get("y") is not None or state.get("x") is not None: d["translate"] = f"{_num(state.get('x', 0), p['s']):g}px {_num(state.get('y', 0), p['s']):g}px"
            if state.get("scale") is not None: d["scale"] = f"{_num(state['scale'], p['s']):g}"
            if state.get("rot") is not None: d["rotate"] = f"{_num(state['rot'], p['s']):g}deg"
            if state.get("bright"): fl.append(f"brightness({state['bright']})")
            if state.get("drop"): fl.append(_drops(state["drop"], p))
            if state.get("outline"):
                w, st, c, off = state["outline"]; d["outline"] = f"{_num(w, p['s']):g}px {st} {_val(c, p)}"; d["outline-offset"] = f"{_num(off, p['s']):g}px"
            if state.get("anim"):
                spec = f"{state['anim']} {'1.6s ease-in-out infinite' if state['anim'] == 'uvl-float' else '.55s ease'}"
                (an.append(spec) if an is not None else d.__setitem__("animation", spec))
            if state.get("shine"): extra["shine"] = True
        if o.get("js") == "ripple": extra["ripple"] = True
    if filt: base["filter"] = " ".join(filt)
    if hfilt: hov["filter"] = " ".join(filt + hfilt)
    if afilt: act["filter"] = " ".join(filt + afilt)
    if anims: base["animation"] = ", ".join(anims)
    if hanims: hov["animation"] = ", ".join(hanims + anims)
    rules = []
    if base: rules.append({"sub": "main", "when": [], "decl": base})
    if hov: rules.append({"sub": "main", "when": ["hover"], "decl": hov})
    if act: rules.append({"sub": "main", "when": ["active"], "decl": act})
    return rules, extra


LAYER_TYPE = {"btn": "btn", "card": "card", "input": "input", "switch": "switch", "check": "check", "range": "range", "tabs": "tabs", "nav": "nav",
              "badge": "badge", "alert": "alert", "modal": "modal", "spinner": "spinner", "progress": "progress", "head": "head", "bg": "page"}


class UiStyle(QObject):
    """The global look: theme + parts + layers. Widgets repaint when it changes."""
    changed = Signal()

    def __init__(self):
        super().__init__()
        self.theme = "editorial"; self.parts: dict = {}; self.layers: dict = {}
        self._vars = Vars(_theme_vars("editorial")); self._cache: dict = {}

    def set(self, theme: str | None = None, parts: dict | None = None, kit: str | None = None, layers: dict | None = None):
        if kit:
            k = KITS[kit]; self.parts = dict(k["parts"]); theme = theme or k["theme"]
        if parts is not None: self.parts = {a: b for a, b in ({**(self.parts if kit else {}), **parts}).items() if b}
        if theme:
            if theme not in TOKENS: raise ValueError(f"unknown theme {theme!r}")
            self.theme = theme; self._vars = Vars(_theme_vars(theme))
        if layers is not None: self.layers = layers
        self._cache.clear(); self.changed.emit()

    @property
    def vars(self) -> Vars: return self._vars

    def color(self, token: str) -> QColor:
        return QColor(TOKENS[self.theme]["solid"].get(token, "#888888"))

    def font_family(self, which="font") -> str:
        f = TOKENS[self.theme]["fonts"]
        return {"font": f.get("font-family"), "head": f.get("font-head-family"), "mono": f.get("mono-family")}[which] or "Sans Serif"

    def extras(self, fam: str) -> dict:
        return layer_rules((self.layers or {}).get(LAYER_TYPE.get(fam, fam), {}))[1]

    def style(self, fam: str, sub: str = "main", flags: frozenset = frozenset(), **vars_) -> Style:
        key = (fam, sub, flags, tuple(sorted(vars_.items())))
        st = self._cache.get(key)
        if st is not None: return st
        F = NATIVE["families"][fam]
        rules = list(F["base"])
        part = self.parts.get(fam)
        if part and part in F["parts"]: rules += F["reset"] + F["parts"][part]
        rules += layer_rules((self.layers or {}).get(LAYER_TYPE.get(fam, fam), {}))[0]
        decls = []
        for r in rules:
            if r["sub"] != sub: continue
            ok = True
            for c in r["when"]:
                if c == "notprimary":
                    if "primary" in flags: ok = False; break
                elif c not in flags: ok = False; break
            if ok: decls.append(r["decl"])
        v = self._vars.child(**vars_) if vars_ else self._vars
        fg = QColor(TOKENS[self.theme]["solid"]["text"])
        st = Style(merge(decls), v, fg)
        if len(self._cache) > 2000: self._cache.clear()
        self._cache[key] = st
        return st


STYLE = UiStyle()
