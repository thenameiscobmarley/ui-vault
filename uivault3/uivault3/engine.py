"""UiVault3 engine: resolves the web library's design rules against a theme and paints them with QPainter.

The same rule data drives the web CSS, so a "pearl" button here is painted from the very same gradients, borders,
shadows and animations — no approximations through Qt stylesheets. Supported: solid/linear/radial/conic/repeating
gradients with sizes and positions, padding-box/border-box layers, multi-layer backgrounds, outer and inset box
shadows (blurred), drop-shadow filters, per-side borders (solid/dashed/dotted/double), per-corner radii (incl. blob
shapes), polygon clip-paths with calc(), gradient/stroked/glowing text, transforms, opacity, brightness, and the
library's animations (sheen, holo pan, spinning borders, jelly, float, pulse, flicker, spinners…).
"""
from __future__ import annotations

import colorsys
import math
import re
from functools import lru_cache

from PySide6.QtCore import QPointF, QRectF, Qt
from PySide6.QtGui import (QBrush, QColor, QConicalGradient, QFont, QFontMetricsF, QGradient, QImage, QLinearGradient, QPainter,
                           QPainterPath, QPen, QPixmap, QPolygonF, QRadialGradient, QTransform)

# ── small parsing helpers ───────────────────────────────────────────────────
def split_top(s: str, sep: str = ",") -> list[str]:
    out, depth, cur = [], 0, []
    for ch in s:
        if ch == "(": depth += 1
        elif ch == ")": depth -= 1
        if ch == sep and depth == 0:
            out.append("".join(cur).strip()); cur = []
        else:
            cur.append(ch)
    if "".join(cur).strip(): out.append("".join(cur).strip())
    return out


def split_ws(s: str) -> list[str]:
    out, depth, cur = [], 0, ""
    for ch in s:
        if ch == "(": depth += 1
        elif ch == ")": depth -= 1
        if ch.isspace() and depth == 0:
            if cur: out.append(cur); cur = ""
        else:
            cur += ch
    if cur: out.append(cur)
    return out


NAMED = {"white": "#ffffff", "black": "#000000", "transparent": "#00000000", "red": "#ff0000", "currentcolor": None}


def parse_color(s: str, current: QColor | None = None) -> QColor | None:
    s = s.strip()
    low = s.lower()
    if low in NAMED:
        return QColor(current) if NAMED[low] is None and current is not None else (QColor(NAMED[low]) if NAMED[low] else None)
    if s.startswith("#"):
        h = s[1:]
        if len(h) in (3, 4): h = "".join(c * 2 for c in h)
        if len(h) == 6: return QColor("#" + h)
        if len(h) == 8:
            c = QColor("#" + h[:6]); c.setAlpha(int(h[6:], 16)); return c
        return None
    m = re.match(r"rgba?\(([^)]*)\)", s)
    if m:
        parts = [p for p in re.split(r"[\s,/]+", m[1].strip()) if p]
        v = [float(p.rstrip("%")) * (2.55 if p.endswith("%") else 1) for p in parts[:3]]
        a = parts[3] if len(parts) > 3 else "1"
        a = float(a.rstrip("%")) / 100 if a.endswith("%") else float(a)
        c = QColor(int(v[0]), int(v[1]), int(v[2])); c.setAlphaF(max(0, min(1, a))); return c
    m = re.match(r"color-mix\(\s*in\s+srgb\s*,(.*)\)$", s, re.S)
    if m:
        a, b = split_top(m[1])
        def part(x):
            t = split_ws(x); pct = None
            if t and t[-1].endswith("%"): pct = float(t[-1][:-1]); t = t[:-1]
            return parse_color(" ".join(t), current), pct
        (ca, pa), (cb, pb) = part(a), part(b)
        if ca is None or cb is None: return ca or cb
        if pa is None and pb is None: pa, pb = 50, 50
        elif pa is None: pa = 100 - pb
        elif pb is None: pb = 100 - pa
        tot = pa + pb or 1; wa = pa / tot
        # premultiplied mix like browsers do
        aa, ab = ca.alphaF(), cb.alphaF(); alpha = aa * wa + ab * (1 - wa)
        if alpha <= 0: return QColor(0, 0, 0, 0)
        ch = lambda x, y: (x * aa * wa + y * ab * (1 - wa)) / alpha
        out = QColor(int(round(ch(ca.red(), cb.red()))), int(round(ch(ca.green(), cb.green()))), int(round(ch(ca.blue(), cb.blue()))))
        out.setAlphaF(min(1, alpha * min(1, tot / 100)))
        return out
    return None


def length(s: str, ref: float = 0, em: float = 14) -> float:
    s = s.strip()
    if not s or s in ("auto", "none"): return 0.0
    if s.startswith("calc("):
        expr = s[5:-1]
        expr = re.sub(r"(-?[\d.]+)%", lambda m: str(float(m[1]) * ref / 100), expr)
        expr = re.sub(r"(-?[\d.]+)px", r"\1", expr)
        expr = re.sub(r"(-?[\d.]+)em", lambda m: str(float(m[1]) * em), expr)
        try: return float(eval(expr, {"__builtins__": {}}))
        except Exception: return 0.0
    m = re.match(r"(-?[\d.]+)(px|%|em|deg)?$", s)
    if not m: return 0.0
    v = float(m[1])
    return v * ref / 100 if m[2] == "%" else v * em if m[2] == "em" else v


# ── variables ────────────────────────────────────────────────────────────────
class Vars:
    """CSS custom properties: theme tokens plus per-widget ones (--k badge colour, --v slider value, --uv-a spin angle)."""
    def __init__(self, base: dict):
        self.v = dict(base)

    def child(self, **kw) -> "Vars":
        c = Vars(self.v); c.v.update({("--" + k.replace("_", "-")): str(v) for k, v in kw.items()}); return c

    def resolve(self, s: str, depth: int = 0) -> str:
        if "var(" not in s or depth > 6: return s
        def rep(m):
            name, _, fb = m[1].partition(",")
            v = self.v.get(name.strip())
            return v if v is not None else fb.strip()
        out = re.sub(r"var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\)",
                     lambda m: self.v.get(m[1], (m[2] or "").strip()) if True else "", s)
        return self.resolve(out, depth + 1)


# ── computed style ───────────────────────────────────────────────────────────
SIDES = ("top", "right", "bottom", "left")


def merge(rules: list[dict]) -> dict:
    """Cascade declarations (later wins) with shorthands expanded into the longhands the painter reads."""
    d: dict = {}
    for decl in rules:
        for k, v in decl.items():
            v = re.sub(r"\s*!important$", "", v)
            if k == "background":
                for x in ("background-image", "background-color", "background-size", "background-position", "background-clip-layers"): d.pop(x, None)
                d["background"] = v
            elif k == "background-image":
                d["background-image"] = v
            elif k == "border":
                for sd in SIDES: d[f"border-{sd}"] = v
            elif k in ("border-top", "border-right", "border-bottom", "border-left"):
                d[k] = v
            elif k == "border-color":
                vals = split_ws(v); vals = (vals * 4)[:4] if len(vals) == 1 else (vals + vals)[:4] if len(vals) == 2 else vals
                for sd, c in zip(SIDES, vals): d[f"border-{sd}-color"] = c
            elif k == "border-width":
                vals = split_ws(v); vals = vals * 4 if len(vals) == 1 else (vals + vals)[:4] if len(vals) == 2 else (vals + [vals[1]])[:4]
                for sd, w in zip(SIDES, vals): d[f"border-{sd}-width"] = w
            elif re.match(r"border-(top|right|bottom|left)-color$", k) or re.match(r"border-(top|right|bottom|left)-width$", k):
                d[k] = v
            elif k == "padding":
                vals = split_ws(v); vals = vals * 4 if len(vals) == 1 else (vals + vals)[:4] if len(vals) == 2 else (vals + [vals[1]])[:4]
                for sd, w in zip(SIDES, vals): d[f"padding-{sd}"] = w
            elif k == "padding-inline":
                d["padding-left"] = d["padding-right"] = v
            elif k == "inset":
                vals = split_ws(v); vals = vals * 4 if len(vals) == 1 else (vals + vals)[:4]
                for sd, w in zip(SIDES, vals): d[sd] = w
            elif k == "font":
                t = split_ws(v)
                for x in t:
                    if re.match(r"^\d{3}$", x): d["font-weight"] = x
                    elif x in ("italic",): d["font-style"] = x
                    elif re.match(r"^[\d.]+px", x): d["font-size"] = x.split("/")[0]
                fam = [x for x in t if x.startswith("var(") or x.startswith('"')]
                if fam: d["font-family"] = " ".join(fam)
            else:
                d[k] = v
    return d


class Layer:
    __slots__ = ("kind", "args", "size", "pos", "repeat", "box", "fixed", "color")

    def __init__(self): self.kind = "color"; self.args = []; self.size = None; self.pos = None; self.repeat = True; self.box = "border"; self.fixed = False; self.color = None


def parse_background(v: str, cur: QColor) -> tuple[list[Layer], QColor | None]:
    """→ image layers (top first) and the base colour."""
    layers, color = [], None
    if not v or v.strip() == "none": return layers, None
    for raw in split_top(v):
        L = Layer()
        m = re.match(r"((?:repeating-)?(?:linear|radial|conic)-gradient)\((.*)\)\s*(.*)$", raw, re.S)
        rest = raw
        if m:
            fn, inner, rest = m[1], m[2], m[3]
            # find the matching paren properly (the regex above is greedy)
            depth = 0
            for i, ch in enumerate(raw):
                if ch == "(": depth += 1
                elif ch == ")":
                    depth -= 1
                    if depth == 0:
                        inner = raw[len(fn) + 1:i]; rest = raw[i + 1:]; break
            L.kind = fn; L.args = split_top(inner)
        else:
            # colour (possibly with trailing keywords)
            toks = split_ws(raw)
            col = None
            for t in toks:
                c = parse_color(t, cur)
                if c is not None: col = c
            if col is not None: color = col
            continue
        toks = split_ws(rest.replace("/", " / "))
        pos, size, after = [], [], False
        for t in toks:
            if t == "/": after = True
            elif t in ("no-repeat",): L.repeat = False
            elif t in ("repeat", "repeat-x", "repeat-y"): L.repeat = True
            elif t == "fixed": L.fixed = True
            elif t in ("padding-box", "content-box"): L.box = "padding"
            elif t == "border-box": L.box = "border"
            elif t in ("scroll", "local"): pass
            else:
                c = parse_color(t, cur)
                if c is not None and not re.match(r"^-?[\d.]", t): color = c
                else: (size if after else pos).append(t)
        if pos: L.pos = pos
        if size: L.size = size
        layers.append(L)
    return layers, color


def parse_shadows(v: str, cur: QColor) -> list[tuple]:
    """box-shadow / text-shadow → [(inset, x, y, blur, spread, QColor)]"""
    out = []
    if not v or v.strip() == "none": return out
    for part in split_top(v):
        toks = split_ws(part); inset = "inset" in toks; toks = [t for t in toks if t != "inset"]
        nums, col = [], None
        for t in toks:
            if re.match(r"^-?[\d.]+(px)?$", t) or t == "0": nums.append(float(t.replace("px", "")))
            else:
                c = parse_color(t, cur)
                if c is not None: col = c
        nums += [0] * (4 - len(nums))
        out.append((inset, nums[0], nums[1], max(0, nums[2]), nums[3], col or QColor(cur)))
    return out


def parse_drops(filter_v: str, cur: QColor) -> tuple[list[tuple], float]:
    drops, bright = [], 1.0
    for m in re.finditer(r"drop-shadow\(((?:[^()]|\([^()]*\))*)\)", filter_v or ""):
        sh = parse_shadows(m[1], cur)
        drops += [(False, x, y, b, 0, c) for _, x, y, b, _, c in sh]
    for m in re.finditer(r"brightness\(([\d.]+)\)", filter_v or ""): bright *= float(m[1])
    return drops, bright


def parse_border_side(v: str, cur: QColor) -> tuple[float, str, QColor | None]:
    w, style, col = 0.0, "solid", None
    for t in split_ws(v or ""):
        if re.match(r"^[\d.]+(px)?$", t): w = float(t.replace("px", ""))
        elif t in ("solid", "dashed", "dotted", "double", "none", "groove", "ridge"): style = t
        else:
            c = parse_color(t, cur)
            if c is not None: col = c
    if style == "none": w = 0
    return w, style, col


class Style:
    """A resolved, ready-to-paint style for one widget part in one state."""

    def __init__(self, decl: dict, vars_: Vars, fg_default: QColor):
        R = lambda k, d="": vars_.resolve(decl.get(k, d))
        self.decl = {k: vars_.resolve(v) for k, v in decl.items()}
        g = self.decl.get
        self.color = parse_color(g("color", ""), fg_default) or QColor(fg_default)
        if g("-webkit-text-fill-color") and g("-webkit-text-fill-color") not in ("currentColor", "transparent"):
            c = parse_color(g("-webkit-text-fill-color"), self.color); self.color = c or self.color
        cur = self.color
        bg = g("background", "")
        self.layers, self.bg_color = parse_background(bg, cur)
        if g("background-image"):
            self.layers, _c = parse_background(g("background-image"), cur)
        if g("background-color"):
            self.bg_color = parse_color(g("background-color"), cur)
        if g("background-size") or g("background-position"):
            for L in self.layers:
                if g("background-size"): L.size = split_ws(split_top(g("background-size"))[0])
                if g("background-position"): L.pos = split_ws(split_top(g("background-position"))[0])
        self.text_clip = "text" in (g("-webkit-background-clip", "") + g("background-clip", ""))
        self.borders = {}
        for sd in SIDES:
            w, st, c = parse_border_side(g(f"border-{sd}", ""), cur)
            if g(f"border-{sd}-width"): w = length(g(f"border-{sd}-width"))
            if g(f"border-{sd}-color"): c = parse_color(g(f"border-{sd}-color"), cur) or c
            self.borders[sd] = (w, st, c or QColor(cur))
        self.radius_raw = g("border-radius", "0")
        self.shadows = parse_shadows(g("box-shadow", ""), cur)
        drops, self.bright = parse_drops(g("filter", ""), cur)
        self.drops = drops
        self.text_shadows = parse_shadows(g("text-shadow", ""), cur)
        self.opacity = float(g("opacity", "1") or 1) if re.match(r"^[\d.]+$", g("opacity", "1") or "1") else 1.0
        self.clip = g("clip-path", "")
        self.mask = g("-webkit-mask", "") or g("mask", "")
        self.outline = parse_border_side(g("outline", ""), cur) if g("outline") and g("outline") != "none" else None
        self.outline_offset = length(g("outline-offset", "0"))
        self.weight = int(g("font-weight", "0") or 0) if (g("font-weight", "") or "").isdigit() else (700 if g("font-weight") == "bold" else 0)
        self.family = g("font-family", "")
        self.italic = g("font-style", "") == "italic"
        self.upper = g("text-transform", "") == "uppercase"
        self.tracking = g("letter-spacing", "")
        self.stroke = None
        if g("-webkit-text-stroke"):
            t = split_ws(g("-webkit-text-stroke")); self.stroke = (length(t[0]), parse_color(t[1], cur) if len(t) > 1 else QColor(cur))
        self.transparent_text = g("color", "") == "transparent" or g("-webkit-text-fill-color", "") == "transparent"
        self.paint_order_stroke = "stroke" in g("paint-order", "")
        self.anim = None
        if g("animation") and g("animation") != "none":
            first = split_top(g("animation"))
            self.anim = []
            for a in first:
                toks = split_ws(a)
                name = next((t for t in toks if not re.match(r"^[\d.]+m?s$", t) and t not in ("linear", "infinite", "ease", "ease-in-out", "both", "forwards", "alternate") and not t.startswith(("steps", "cubic", "var("))), "")
                durs = [float(t[:-2]) / 1000 if t.endswith("ms") else float(t[:-1]) for t in toks if re.match(r"^[\d.]+m?s$", t)]
                self.anim.append((name, durs[0] if durs else 1.0, "infinite" in toks))
        self.transform = g("transform", "")
        self.translate = g("translate", ""); self.scale = g("scale", ""); self.rotate = g("rotate", "")
        self.content = None
        c = g("content")
        if c and c != "none":
            m = re.match(r'^"(.*)"$', c) or re.match(r"^'(.*)'$", c)
            self.content = m[1] if m else ""
        self.position_abs = g("position") == "absolute"
        self.geom = {k: g(k) for k in ("top", "left", "right", "bottom", "width", "height", "margin-top") if g(k)}
        self.padding = {sd: g(f"padding-{sd}") for sd in SIDES if g(f"padding-{sd}")}

    # geometry helpers
    def border_w(self) -> dict: return {sd: self.borders[sd][0] for sd in SIDES}

    def radii(self, r: QRectF) -> list[tuple[float, float]]:
        raw = self.radius_raw or "0"
        h_part, _, v_part = raw.partition("/")
        hs = split_ws(h_part); vs = split_ws(v_part) if v_part else hs
        ex = lambda a: (a * 4)[:4] if len(a) == 1 else (a + a)[:4] if len(a) == 2 else (a + [a[1]])[:4] if len(a) == 3 else a[:4]
        hs, vs = ex(hs), ex(vs)
        out = []
        for i in range(4):
            rx, ry = length(hs[i], r.width()), length(vs[i], r.height())
            out.append((rx, ry))
        # scale down like CSS when radii overlap
        f = 1.0
        for a, b, total in ((0, 1, r.width()), (3, 2, r.width())):
            s = out[a][0] + out[b][0]
            if s > total > 0: f = min(f, total / s)
        for a, b, total in ((0, 3, r.height()), (1, 2, r.height())):
            s = out[a][1] + out[b][1]
            if s > total > 0: f = min(f, total / s)
        return [(x * f, y * f) for x, y in out]

    def font(self, base: QFont, size: float | None = None) -> QFont:
        f = QFont(base)
        if self.family:
            fam = split_top(self.family)[0].strip().strip('"\'')
            if fam and not fam.startswith("var("): f.setFamily(fam)
        if self.weight: f.setWeight(QFont.Weight(min(900, max(100, self.weight))))
        if self.italic: f.setItalic(True)
        if size: f.setPixelSize(int(size))
        if self.tracking:
            px = self.tracking
            em = f.pixelSize() if f.pixelSize() > 0 else f.pointSizeF() * 1.33
            f.setLetterSpacing(QFont.AbsoluteSpacing, length(px, em=em) if not px.endswith("em") else float(px[:-2]) * em)
        return f


# ── animation helpers ────────────────────────────────────────────────────────
KEYS = {  # transform keyframes: name → list of (t, dx, dy, sx, sy, rot, opacity)
    "uvp-jelly": [(0, 0, 0, 1, 1, 0, 1), (.3, 0, 0, 1.12, .88, 0, 1), (.5, 0, 0, .92, 1.08, 0, 1), (.7, 0, 0, 1.04, .96, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-jelly": "uvp-jelly", "uvt-jelly": "uvp-jelly",
    "uvl-wobble": [(0, 0, 0, 1, 1, 0, 1), (.25, 0, 0, 1, 1, -4, 1), (.5, 0, 0, 1, 1, 3, 1), (.75, 0, 0, 1, 1, -1.5, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-bounce": [(0, 0, 0, 1, 1, 0, 1), (.4, 0, -8, 1, 1, 0, 1), (.6, 0, 0, 1, 1, 0, 1), (.75, 0, -3, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-rubber": [(0, 0, 0, 1, 1, 0, 1), (.3, 0, 0, 1.2, .8, 0, 1), (.4, 0, 0, .8, 1.2, 0, 1), (.6, 0, 0, 1.1, .9, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-heart": [(0, 0, 0, 1, 1, 0, 1), (.15, 0, 0, 1.1, 1.1, 0, 1), (.3, 0, 0, 1, 1, 0, 1), (.45, 0, 0, 1.1, 1.1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-shake": [(0, 0, 0, 1, 1, 0, 1), (.2, -4, 0, 1, 1, 0, 1), (.4, 4, 0, 1, 1, 0, 1), (.6, -4, 0, 1, 1, 0, 1), (.8, 4, 0, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-swing": [(0, 0, 0, 1, 1, 0, 1), (.2, 0, 0, 1, 1, 8, 1), (.4, 0, 0, 1, 1, -6, 1), (.6, 0, 0, 1, 1, 3, 1), (.8, 0, 0, 1, 1, -2, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-float": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, -6, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-pop": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1.12, 1.12, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-pulse": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1.05, 1.05, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-glowpulse": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1.015, 1.015, 0, .85), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-breathe": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1, 1, 0, .65), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-sway": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1, 1, 2, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-bob": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 3, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-blink": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1, 1, 0, .35), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-spin": [(0, 0, 0, 1, 1, 0, 1), (1, 0, 0, 1, 1, 360, 1)], "uv-rot": "uvl-spin",
    "uvl-wiggle": [(0, 0, 0, 1, 1, 0, 1), (.88, 0, 0, 1, 1, 0, 1), (.9, 0, 0, 1, 1, -5, 1), (.93, 0, 0, 1, 1, 5, 1), (.96, 0, 0, 1, 1, -3, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvp-flicker": [(0, 0, 0, 1, 1, 0, 1), (.2, 0, 0, 1, 1, 0, .55), (.21, 0, 0, 1, 1, 0, 1), (.22, 0, 0, 1, 1, 0, .55), (.23, 0, 0, 1, 1, 0, 1), (.56, 0, 0, 1, 1, 0, .55), (.57, 0, 0, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-flicker": "uvp-flicker",
    "uvp-breathe": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, .55, .55, 0, .5), (1, 0, 0, 1, 1, 0, 1)],
    "uvp-glitch": [(0, 0, 0, 1, 1, 0, 1), (.33, -2, 1, 1, 1, 0, 1), (.66, 2, -1, 1, 1, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvp-ripple": [(0, 0, 0, .1, .1, 0, 1), (1, 0, 0, 1, 1, 0, 0)],
    "uvp-flip": [(0, 0, 0, 1, 1, 0, 1), (.5, 0, 0, 1, -1, 0, 1), (1, 0, 0, -1, -1, 0, 1)],
    "uvp-pop": [(0, 0, 0, 1, 1, 0, 1), (.4, 0, 0, 1.25, 1.25, 0, 1), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-in-fade": [(0, 0, 0, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)], "uvl-in-rise": [(0, 0, 24, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-in-drop": [(0, 0, -24, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)], "uvl-in-zoom": [(0, 0, 0, .85, .85, 0, 0), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-in-blur": [(0, 0, 0, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)], "uvl-in-left": [(0, -40, 0, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-in-right": [(0, 40, 0, 1, 1, 0, 0), (1, 0, 0, 1, 1, 0, 1)], "uvl-in-flip": [(0, 0, 16, 1, .6, 0, 0), (1, 0, 0, 1, 1, 0, 1)],
    "uvl-in-pop": [(0, 0, 0, .6, .6, 0, 0), (.7, 0, 0, 1.06, 1.06, 0, 1), (1, 0, 0, 1, 1, 0, 1)], "uvl-in-swing": [(0, -20, 0, 1, 1, -8, 0), (1, 0, 0, 1, 1, 0, 1)],
}
BGPOS = {  # background-position animations: name → function(progress) → x fraction (applied to the first oversized layer)
    "uvt-sheen": lambda p: 1.5 - 2.0 * max(0, (p - .6) / .4), "uvt-holo": lambda p: 3.0 * p, "uvl-pan": lambda p: p,
    "uvp-roll": None, "uvl-march": None,
}
ANGLE = {"uv-spin-a", "uvl-spin-a"}   # rotating conic gradients


def keyframe(name: str, p: float):
    k = KEYS.get(name)
    if isinstance(k, str): k = KEYS.get(k)
    if not k: return None
    for i in range(1, len(k)):
        if p <= k[i][0]:
            a, b = k[i - 1], k[i]; f = (p - a[0]) / max(1e-6, b[0] - a[0])
            return tuple(a[j] + (b[j] - a[j]) * f for j in range(1, 7))
    return k[-1][1:]


class Anim:
    """Per-paint animation inputs."""
    __slots__ = ("time", "bgx", "angle", "dx", "dy", "sx", "sy", "rot", "opacity", "hue", "roll")

    def __init__(self):
        self.time = 0.0; self.bgx = None; self.angle = 0.0; self.dx = self.dy = 0.0; self.sx = self.sy = 1.0; self.rot = 0.0; self.opacity = 1.0; self.hue = 0.0; self.roll = 0.0


def anim_state(style: Style, t: float, start: float = 0.0) -> Anim:
    a = Anim(); a.time = t
    for name, dur, inf in style.anim or []:
        p = ((t - start) / dur) % 1.0 if inf else min(1.0, max(0.0, (t - start) / dur))
        if name in BGPOS and BGPOS[name]: a.bgx = BGPOS[name](p)
        elif name == "uvp-roll": a.roll = p
        elif name == "uvl-march": a.roll = p
        elif name in ANGLE: a.angle = 360 * p
        elif name == "uvl-hue": a.hue = p
        else:
            k = keyframe(name, p)
            if k:
                a.dx += k[0]; a.dy += k[1]; a.sx *= k[2]; a.sy *= k[3]; a.rot += k[4]; a.opacity *= k[5]
    return a


def is_animated(style: Style) -> bool:
    return bool(style.anim)


# ── geometry ────────────────────────────────────────────────────────────────
def rounded_path(r: QRectF, radii: list[tuple[float, float]]) -> QPainterPath:
    p = QPainterPath()
    if all(x == 0 and y == 0 for x, y in radii):
        p.addRect(r); return p
    (tlx, tly), (trx, try_), (brx, bry), (blx, bly) = radii
    x, y, w, h = r.x(), r.y(), r.width(), r.height()
    p.moveTo(x + tlx, y)
    p.lineTo(x + w - trx, y)
    if trx or try_: p.arcTo(QRectF(x + w - 2 * trx, y, 2 * trx, 2 * try_), 90, -90)
    p.lineTo(x + w, y + h - bry)
    if brx or bry: p.arcTo(QRectF(x + w - 2 * brx, y + h - 2 * bry, 2 * brx, 2 * bry), 0, -90)
    p.lineTo(x + blx, y + h)
    if blx or bly: p.arcTo(QRectF(x, y + h - 2 * bly, 2 * blx, 2 * bly), -90, -90)
    p.lineTo(x, y + tly)
    if tlx or tly: p.arcTo(QRectF(x, y, 2 * tlx, 2 * tly), 180, -90)
    p.closeSubpath()
    return p


def clip_polygon(clip: str, r: QRectF) -> QPainterPath | None:
    m = re.match(r"polygon\((.*)\)$", clip.strip())
    if not m: return None
    pts = []
    for pair in split_top(m[1]):
        t = split_ws(pair)
        if len(t) < 2: continue
        pts.append(QPointF(r.x() + length(t[0], r.width()), r.y() + length(t[1], r.height())))
    path = QPainterPath(); path.addPolygon(QPolygonF(pts)); path.closeSubpath()
    return path


def shape_of(st: Style, r: QRectF) -> QPainterPath:
    if st.clip and st.clip.startswith("polygon"):
        p = clip_polygon(st.clip, r)
        if p is not None: return p
    return rounded_path(r, st.radii(r))


# ── gradients ────────────────────────────────────────────────────────────────
def _stops(args: list[str], cur: QColor, line_len: float) -> list[tuple[float, QColor]]:
    raw = []
    for a in args:
        t = split_ws(a)
        if not t: continue
        col = parse_color(t[0], cur)
        if col is None:
            # a bare position (colour hint) — ignore
            continue
        poss = [length(x, line_len) / line_len if line_len else 0 for x in t[1:3] if re.match(r"^-?[\d.]|^calc", x)]
        if not poss: raw.append([col, None])
        else:
            for p in poss: raw.append([col, p])
    if not raw: return []
    if raw[0][1] is None: raw[0][1] = 0.0
    if raw[-1][1] is None: raw[-1][1] = 1.0
    # fill gaps evenly, keep monotonic
    i = 0
    while i < len(raw):
        if raw[i][1] is None:
            j = i
            while raw[j][1] is None: j += 1
            a, b = raw[i - 1][1], raw[j][1]
            for k in range(i, j): raw[k][1] = a + (b - a) * (k - i + 1) / (j - i + 1)
            i = j
        i += 1
    last = -1e9
    for s in raw:
        s[1] = max(s[1], last); last = s[1]
    return [(p, c) for c, p in raw]


def _qt_stops(stops, scale=1.0, offset=0.0):
    out, prev = [], None
    for p, c in stops:
        q = (p - offset) / scale if scale else p
        if prev is not None and q <= prev: q = prev + 1e-5
        out.append((q, c)); prev = q
    lo, hi = out[0][0], out[-1][0]
    if lo < 0 or hi > 1:  # normalise into [0, 1] (caller adjusts the geometry instead)
        pass
    return out


def gradient_brush(L: Layer, rect: QRectF, cur: QColor, a: Anim) -> QBrush | None:
    kind, args = L.kind, list(L.args)
    rep = kind.startswith("repeating-")
    if kind.endswith("linear-gradient"):
        ang = 180.0
        if args and (re.match(r"^-?[\d.]+deg$", args[0]) or args[0].startswith("to ")):
            first = args.pop(0)
            if first.startswith("to "):
                ang = {"to top": 0, "to right": 90, "to bottom": 180, "to left": 270, "to top right": 45, "to right top": 45, "to bottom right": 135,
                       "to right bottom": 135, "to bottom left": 225, "to left bottom": 225, "to top left": 315, "to left top": 315}.get(first, 180)
            else:
                ang = float(first[:-3])
        th = math.radians(ang)
        dx, dy = math.sin(th), -math.cos(th)
        L_ = abs(rect.width() * math.sin(th)) + abs(rect.height() * math.cos(th))
        c = rect.center()
        stops = _stops(args, cur, L_ or 1)
        if not stops: return None
        p0 = QPointF(c.x() - dx * L_ / 2, c.y() - dy * L_ / 2)
        if rep:
            period = stops[-1][0] - stops[0][0] or 1
            off = stops[0][0] + (a.roll * period if a.roll else 0)
            g = QLinearGradient(QPointF(p0.x() + dx * L_ * off, p0.y() + dy * L_ * off), QPointF(p0.x() + dx * L_ * (off + period), p0.y() + dy * L_ * (off + period)))
            g.setSpread(QGradient.RepeatSpread)
            for p, col in _qt_stops([((p - stops[0][0]) / period, c_) for p, c_ in stops]): g.setColorAt(min(1, max(0, p)), col)
        else:
            lo, hi = min(0, stops[0][0]), max(1, stops[-1][0])
            g = QLinearGradient(QPointF(p0.x() + dx * L_ * lo, p0.y() + dy * L_ * lo), QPointF(p0.x() + dx * L_ * hi, p0.y() + dy * L_ * hi))
            g.setSpread(QGradient.PadSpread)
            for p, col in _qt_stops([((p - lo) / (hi - lo), c_) for p, c_ in stops]): g.setColorAt(min(1, max(0, p)), col)
        return QBrush(g)
    if kind.endswith("radial-gradient"):
        head = args[0] if args and parse_color(split_ws(args[0])[0], cur) is None else ""
        if head: args.pop(0)
        at = QPointF(rect.center())
        rx = ry = None
        if " at " in " " + head or head.startswith("at "):
            shape, _, pos = (" " + head).partition(" at ")
            pt = split_ws(pos)
            kw = {"center": "50%", "left": "0%", "right": "100%", "top": "0%", "bottom": "100%"}
            px = kw.get(pt[0], pt[0]) if pt else "50%"; py = kw.get(pt[1], pt[1]) if len(pt) > 1 else "50%"
            at = QPointF(rect.x() + length(px, rect.width()), rect.y() + length(py, rect.height()))
        else:
            shape = head
        st = [t for t in split_ws(shape) if t not in ("circle", "ellipse")]
        circle = "circle" in shape
        far = math.hypot(max(at.x() - rect.left(), rect.right() - at.x()), max(at.y() - rect.top(), rect.bottom() - at.y()))
        if st and st[0] in ("farthest-side", "closest-side"):
            fn = max if st[0] == "farthest-side" else min
            rx = fn(at.x() - rect.left(), rect.right() - at.x()); ry = fn(at.y() - rect.top(), rect.bottom() - at.y())
            if circle: rx = ry = min(rx, ry) if st[0] == "closest-side" else max(rx, ry)
        elif len(st) >= 2:
            rx, ry = length(st[0], rect.width()), length(st[1], rect.height())
        elif len(st) == 1 and re.match(r"^[\d.]", st[0]):
            rx = ry = length(st[0], rect.width())
        if rx is None:
            if circle: rx = ry = far
            else: rx, ry = far * rect.width() / max(1, math.hypot(rect.width(), rect.height())) * 1.414, far * rect.height() / max(1, math.hypot(rect.width(), rect.height())) * 1.414
        stops = _stops(args, cur, max(rx, 1))
        if not stops: return None
        g = QRadialGradient(QPointF(0, 0), 1.0)
        if rep:
            g.setSpread(QGradient.RepeatSpread)
        for p, col in _qt_stops(stops): g.setColorAt(min(1, max(0, p)), col)
        b = QBrush(g)
        tr = QTransform(); tr.translate(at.x(), at.y()); tr.scale(max(rx, .1), max(ry, .1))
        if rep and stops[-1][0] < 1:
            tr = QTransform(); tr.translate(at.x(), at.y()); tr.scale(max(rx * stops[-1][0], .1), max(ry * stops[-1][0], .1))
        b.setTransform(tr)
        return b
    if kind == "conic-gradient":
        frm, at = 0.0, rect.center()
        if args and (args[0].startswith("from") or args[0].startswith("at")):
            head = args.pop(0)
            m = re.search(r"from\s+(-?[\d.]+)deg", head)
            if m: frm = float(m[1])
            m = re.search(r"at\s+(\S+)\s+(\S+)", head)
            if m: at = QPointF(rect.x() + length(m[1], rect.width()), rect.y() + length(m[2], rect.height()))
        frm += a.angle
        stops = []
        for s in args:
            t = split_ws(s); col = parse_color(t[0], cur)
            if col is None: continue
            ps = [float(x[:-1]) / 100 if x.endswith("%") else float(x[:-3]) / 360 if x.endswith("deg") else None for x in t[1:3]]
            ps = [p for p in ps if p is not None]
            if not ps: stops.append([col, None])
            for p in ps: stops.append([col, p])
        if not stops: return None
        if stops[0][1] is None: stops[0][1] = 0.0
        if stops[-1][1] is None: stops[-1][1] = 1.0
        for i in range(1, len(stops) - 1):
            if stops[i][1] is None:
                j = i
                while stops[j][1] is None: j += 1
                for k in range(i, j): stops[k][1] = stops[i - 1][1] + (stops[j][1] - stops[i - 1][1]) * (k - i + 1) / (j - i + 1)
        # "transparent 0 50%" style hard repeats inside conic (checker etc.) are approximated
        g = QConicalGradient(at, 90 - frm)
        last = -1
        for col, p in stops:
            q = min(1.0, max(0.0, 1 - p))
            g.setColorAt(q, col)
        b = QBrush(g)
        return b
    return None


def layer_rect(L: Layer, box: QRectF) -> tuple[QRectF, bool]:
    """Where a background layer is drawn and whether it tiles."""
    w, h = box.width(), box.height()
    lw, lh = w, h
    if L.size:
        s = L.size
        lw = length(s[0], w) if s[0] != "auto" else w
        lh = length(s[1], h) if len(s) > 1 and s[1] != "auto" else (lh if s[0] == "auto" else (h if len(s) == 1 and s[0].endswith("%") else lw if len(s) == 1 else h))
    x, y = box.x(), box.y()
    if L.pos:
        kw = {"center": "50%", "left": "0%", "right": "100%", "top": "0%", "bottom": "100%"}
        px = kw.get(L.pos[0], L.pos[0]); py = kw.get(L.pos[1], L.pos[1]) if len(L.pos) > 1 else ("50%" if L.pos[0] in ("left", "right", "center") else "50%")
        x += (w - lw) * length(px, 100) / 100 if px.endswith("%") else length(px, w)
        y += (h - lh) * length(py, 100) / 100 if py.endswith("%") else length(py, h)
    tile = L.repeat and (lw < w - .5 or lh < h - .5) and lw > 0 and lh > 0
    return QRectF(x, y, max(lw, .5), max(lh, .5)), tile


def paint_layers(p: QPainter, st: Style, outer: QRectF, inner: QRectF, a: Anim):
    if st.bg_color is not None and st.bg_color.alpha():
        p.fillRect(outer, st.bg_color)
    for L in reversed(st.layers):
        box = inner if L.box == "padding" else outer
        lr, tile = layer_rect(L, box)
        if a.bgx is not None and L is st.layers[0] and lr.width() > box.width() + 1:
            lr.moveLeft(box.x() + (box.width() - lr.width()) * a.bgx)
        if a.roll and L.kind == "repeating-linear-gradient" and not tile:
            pass
        if tile:
            pm = QPixmap(max(1, int(math.ceil(lr.width()))), max(1, int(math.ceil(lr.height()))))
            pm.fill(Qt.transparent)
            q = QPainter(pm); q.setRenderHint(QPainter.Antialiasing)
            br = gradient_brush(L, QRectF(0, 0, lr.width(), lr.height()), st.color, a)
            if br: q.fillRect(QRectF(0, 0, lr.width(), lr.height()), br)
            q.end()
            tb = QBrush(pm); t = QTransform(); t.translate(lr.x() + (a.roll * lr.width() if a.roll else 0), lr.y()); tb.setTransform(t)
            p.save(); p.setClipRect(box, Qt.IntersectClip); p.fillRect(box, tb); p.restore()
        else:
            br = gradient_brush(L, lr, st.color, a)
            if br:
                p.save(); p.setClipRect(box.intersected(lr) if not L.repeat or lr.contains(box) or True else box, Qt.IntersectClip)
                p.fillRect(lr if not L.repeat else lr.united(box) if L.kind.startswith("repeating") else lr, br)
                p.restore()


# ── blur (cached) ────────────────────────────────────────────────────────────
_blur_cache: dict = {}


def blurred_shape(path: QPainterPath, color: QColor, blur: float) -> tuple[QImage, QPointF]:
    br = path.boundingRect()
    pad = int(blur * 1.5) + 2
    key = (round(br.width(), 1), round(br.height(), 1), path.elementCount(), round(blur, 1), color.rgba(), round(br.x() % 1, 2))
    if key in _blur_cache:
        img, off = _blur_cache[key]
        return img, QPointF(br.x() - pad, br.y() - pad)
    w, h = int(br.width()) + 2 * pad + 1, int(br.height()) + 2 * pad + 1
    img = QImage(max(1, w), max(1, h), QImage.Format_ARGB32_Premultiplied); img.fill(Qt.transparent)
    q = QPainter(img); q.setRenderHint(QPainter.Antialiasing); q.translate(pad - br.x(), pad - br.y()); q.fillPath(path, color); q.end()
    if blur > .5:
        f = max(1.0, blur / 2.2)
        for _ in range(2):
            small = img.scaled(max(1, int(w / f)), max(1, int(h / f)), Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
            img = small.scaled(w, h, Qt.IgnoreAspectRatio, Qt.SmoothTransformation)
    if len(_blur_cache) > 400: _blur_cache.clear()
    _blur_cache[key] = (img, None)
    return img, QPointF(br.x() - pad, br.y() - pad)


def paint_outer_shadow(p: QPainter, shape: QPainterPath, sh):
    inset, x, y, blur, spread, col = sh
    if inset or col.alpha() == 0: return
    s = QPainterPath(shape)
    if spread:
        br = shape.boundingRect()
        if br.width() > 0 and br.height() > 0:
            t = QTransform(); c = br.center()
            t.translate(c.x(), c.y()); t.scale((br.width() + 2 * spread) / br.width(), (br.height() + 2 * spread) / br.height()); t.translate(-c.x(), -c.y())
            s = t.map(s)
    s.translate(x, y)
    if blur < .5:
        p.fillPath(s, col); return
    img, at = blurred_shape(s, col, blur)
    p.drawImage(at, img)


def paint_inset_shadow(p: QPainter, shape: QPainterPath, sh, box: QRectF):
    inset, x, y, blur, spread, col = sh
    if not inset or col.alpha() == 0: return
    p.save(); p.setClipPath(shape, Qt.IntersectClip)
    outer = QPainterPath(); outer.addRect(box.adjusted(-60, -60, 60, 60))
    inner = QPainterPath(shape)
    if spread:
        br = shape.boundingRect(); t = QTransform(); c = br.center()
        t.translate(c.x(), c.y()); t.scale(max(.01, (br.width() - 2 * spread) / max(1, br.width())), max(.01, (br.height() - 2 * spread) / max(1, br.height()))); t.translate(-c.x(), -c.y())
        inner = t.map(inner)
    inner.translate(x, y)
    ring = outer.subtracted(inner)
    if blur < .5: p.fillPath(ring, col)
    else:
        img, at = blurred_shape(ring, col, blur); p.drawImage(at, img)
    p.restore()


# ── borders ──────────────────────────────────────────────────────────────────
def paint_borders(p: QPainter, st: Style, r: QRectF, shape: QPainterPath):
    b = st.borders
    ws = [b[sd][0] for sd in SIDES]
    if not any(ws): return
    cols = [b[sd][2] for sd in SIDES]; styles = [b[sd][1] for sd in SIDES]
    uniform = len(set(ws)) == 1 and len({c.rgba() for c in cols}) == 1 and len(set(styles)) == 1
    radii = st.radii(r)
    circle = abs(radii[0][0] - r.width() / 2) < 1 and abs(r.width() - r.height()) < 1
    if uniform or (circle and len(set(ws)) == 1):
        w = ws[0]
        if circle and not uniform:   # spinner rings: each side is a quarter arc
            rr = r.adjusted(w / 2, w / 2, -w / 2, -w / 2)
            for i, (start) in enumerate((45, -45, -135, 135)):
                pen = QPen(cols[i], w); pen.setCapStyle(Qt.FlatCap); p.setPen(pen); p.setBrush(Qt.NoBrush)
                if cols[i].alpha(): p.drawArc(rr, int(start * 16), int(90 * 16))
            return
        style = styles[0]
        p.save(); p.setClipPath(shape, Qt.IntersectClip)
        if style == "double" and w >= 3:
            t = w / 3
            for inset in (t / 2, w - t / 2):
                pen = QPen(cols[0], t); p.setPen(pen); p.setBrush(Qt.NoBrush)
                p.drawPath(_inset_shape(st, r, inset, shape))
        else:
            pen = QPen(cols[0], w)
            if style == "dashed": pen.setStyle(Qt.CustomDashLine); pen.setDashPattern([3, 2])
            elif style == "dotted": pen.setStyle(Qt.CustomDashLine); pen.setDashPattern([1, 1.5]); pen.setCapStyle(Qt.RoundCap)
            p.setPen(pen); p.setBrush(Qt.NoBrush)
            p.drawPath(_inset_shape(st, r, w / 2, shape))
        p.restore()
        return
    # per-side borders (side bars, bevel bottoms): filled strips clipped to the shape
    p.save(); p.setClipPath(shape, Qt.IntersectClip)
    t, rt, bt, lt = ws
    if t: p.fillRect(QRectF(r.x(), r.y(), r.width(), t), cols[0])
    if rt: p.fillRect(QRectF(r.right() - rt, r.y(), rt, r.height()), cols[1])
    if bt: p.fillRect(QRectF(r.x(), r.bottom() - bt, r.width(), bt), cols[2])
    if lt: p.fillRect(QRectF(r.x(), r.y(), lt, r.height()), cols[3])
    p.restore()


def _inset_shape(st: Style, r: QRectF, d: float, shape: QPainterPath) -> QPainterPath:
    if st.clip and st.clip.startswith("polygon"):
        return clip_polygon(st.clip, r.adjusted(d, d, -d, -d)) or shape
    rr = r.adjusted(d, d, -d, -d)
    return rounded_path(rr, [(max(0, x - d), max(0, y - d)) for x, y in st.radii(r)])


# ── the box painter ──────────────────────────────────────────────────────────
def paint_box(p: QPainter, st: Style, r: QRectF, a: Anim | None = None, opacity: float = 1.0):
    """Paint one CSS box (background layers, shadows, borders, outline) into r."""
    a = a or Anim()
    if r.width() <= 0 or r.height() <= 0: return
    p.save()
    p.setOpacity(p.opacity() * opacity * st.opacity * a.opacity)
    shape = shape_of(st, r)
    if not (st.mask and "farthest-side" in st.mask):
        for sh in st.drops: paint_outer_shadow(p, shape, sh)
    if any(not sh[0] for sh in st.shadows):
        p.save()   # CSS never paints a box-shadow underneath its own box
        big = QPainterPath(); big.addRect(r.adjusted(-200, -200, 200, 200)); p.setClipPath(big.subtracted(shape), Qt.IntersectClip)
        for sh in reversed(st.shadows): paint_outer_shadow(p, shape, sh)
        p.restore()
    bw = st.border_w()
    inner = r.adjusted(bw["left"], bw["top"], -bw["right"], -bw["bottom"])
    p.save(); p.setClipPath(shape, Qt.IntersectClip)
    if not st.text_clip:
        mask = st.mask
        if mask and "farthest-side" in mask:   # ring masks (spinners): keep only the outer band
            m = re.search(r"calc\(100% - ([\d.]+)px\)", mask)
            band = float(m[1]) if m else 4
            ring = QPainterPath(); ring.addEllipse(r); hole = QPainterPath(); hole.addEllipse(r.adjusted(band, band, -band, -band))
            p.setClipPath(ring.subtracted(hole), Qt.IntersectClip)
        paint_layers(p, st, r, inner, a)
    for sh in reversed(st.shadows): paint_inset_shadow(p, shape, sh, r)
    if st.bright and st.bright != 1:
        p.fillPath(shape, QColor(255, 255, 255, int(min(1, st.bright - 1) * 140)) if st.bright > 1 else QColor(0, 0, 0, int(min(1, 1 - st.bright) * 160)))
    p.restore()
    paint_borders(p, st, r, shape)
    if st.outline and st.outline[0] > 0:
        w, style, col = st.outline
        d = -(st.outline_offset + w / 2)
        pen = QPen(col, w)
        if style == "dashed": pen.setStyle(Qt.DashLine)
        elif style == "dotted": pen.setStyle(Qt.DotLine)
        p.setPen(pen); p.setBrush(Qt.NoBrush)
        rr = r.adjusted(d, d, -d, -d)
        p.drawPath(rounded_path(rr, [(max(0, x - d), max(0, y - d)) for x, y in st.radii(r)]))
    p.restore()


def paint_text(p: QPainter, st: Style, r: QRectF, text: str, font: QFont, align=Qt.AlignCenter, a: Anim | None = None, opacity: float = 1.0):
    """Text with gradient fill (background-clip: text), stroke, glow / long shadows."""
    a = a or Anim()
    if st.upper: text = text.upper()
    p.save(); p.setOpacity(p.opacity() * opacity * st.opacity * a.opacity)
    p.setFont(font)
    fm = QFontMetricsF(font)
    tw = fm.horizontalAdvance(text)
    x = r.x() if align & Qt.AlignLeft else r.right() - tw if align & Qt.AlignRight else r.center().x() - tw / 2
    y = r.center().y() + (fm.ascent() - fm.descent()) / 2
    if align & Qt.AlignTop: y = r.y() + fm.ascent()
    path = QPainterPath(); path.addText(QPointF(x, y), font, text)
    for inset, dx, dy, blur, spread, col in reversed(st.text_shadows):
        sp = QPainterPath(path); sp.translate(dx, dy)
        if blur < .5: p.fillPath(sp, col)
        else:
            img, at = blurred_shape(sp, col, blur); p.drawImage(at, img)
    for sh in st.drops:
        sp = QPainterPath(path); sp.translate(sh[1], sh[2])
        img, at = blurred_shape(sp, sh[5], sh[3]); p.drawImage(at, img)
    if st.stroke and st.paint_order_stroke:
        p.strokePath(path, QPen(st.stroke[1], st.stroke[0], Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin))
    if st.text_clip and (st.layers or st.bg_color):
        p.save(); p.setClipPath(path)
        br = path.boundingRect().adjusted(-2, -2, 2, 2)
        paint_layers(p, st, br, br, a)
        p.restore()
    elif not st.transparent_text or not st.stroke:
        if not st.transparent_text: p.fillPath(path, st.color)
    if st.stroke and not st.paint_order_stroke:
        p.strokePath(path, QPen(st.stroke[1], st.stroke[0]))
    p.restore()
    return tw
