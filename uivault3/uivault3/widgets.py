"""UiVault3 widgets for PySide6 — custom-painted from the web library's designs (no QSS approximations)."""
from __future__ import annotations

import math
import re
import time

from PySide6.QtCore import QEasingCurve, QPointF, QRectF, QSize, Qt, QTimer, QVariantAnimation, Signal
from PySide6.QtGui import QColor, QFont, QFontMetricsF, QPainter, QPainterPath, QPalette, QPen
from PySide6.QtWidgets import QAbstractButton, QDialog, QFrame, QLineEdit, QProgressBar, QSizePolicy, QSlider, QTabBar, QVBoxLayout, QWidget

from .engine import Anim, Style, anim_state, length, paint_box, paint_layers, paint_text, parse_background, rounded_path, shape_of, split_ws
from .style import STYLE

_T0 = time.monotonic()
now = lambda: time.monotonic() - _T0


# ── shared ticker (one timer for every animated widget, ~30 fps, only visible widgets) ─
class _Ticker:
    def __init__(self): self.timer = None; self.widgets = set()

    def want(self, w, on: bool):
        if on: self.widgets.add(w)
        else: self.widgets.discard(w)
        if self.timer is None:
            self.timer = QTimer(); self.timer.setInterval(33); self.timer.timeout.connect(self._tick)
        if self.widgets and not self.timer.isActive(): self.timer.start()
        elif not self.widgets and self.timer.isActive(): self.timer.stop()

    def _tick(self):
        for w in list(self.widgets):
            try:
                if w.isVisible(): w.update()
            except RuntimeError: self.widgets.discard(w)


TICK = _Ticker()


def transform_of(st: Style) -> tuple[float, float, float, float, float]:
    dx = dy = rot = 0.0; sx = sy = 1.0
    for fn, args in re.findall(r"(\w+)\(([^)]*)\)", st.transform or ""):
        a = [x.strip() for x in args.split(",")]
        if fn == "translateY": dy += length(a[0])
        elif fn == "translateX": dx += length(a[0])
        elif fn == "translate": dx += length(a[0]); dy += length(a[1]) if len(a) > 1 else 0
        elif fn == "scale": sx *= float(a[0]); sy *= float(a[1] if len(a) > 1 else a[0])
        elif fn == "rotate": rot += float(a[0].replace("deg", ""))
    if st.translate and st.translate != "none":
        t = split_ws(st.translate); dx += length(t[0]); dy += length(t[1]) if len(t) > 1 else 0
    if st.scale and st.scale != "none":
        t = split_ws(st.scale); sx *= float(t[0]); sy *= float(t[1] if len(t) > 1 else t[0])
    if st.rotate and st.rotate != "none": rot += float(st.rotate.replace("deg", ""))
    return dx, dy, sx, sy, rot


def lerp(a, b, t): return a + (b - a) * t


class _UV:
    """Mixin: hover/press progress, animation registration, enter animation, ripple."""
    FAM = "btn"
    BLEED = 10

    def _uv_init(self):
        self._h = 0.0; self._hanim = QVariantAnimation(self); self._hanim.setDuration(180); self._hanim.setEasingCurve(QEasingCurve.OutCubic)
        self._hanim.valueChanged.connect(self._set_h)
        self._enter_t0 = None; self._ripples = []
        self.setAttribute(Qt.WA_Hover, True)
        if self.FAM in ("btn", "switch", "check", "badge", "spinner", "head"): self.setSizePolicy(QSizePolicy.Fixed, QSizePolicy.Fixed)
        STYLE.changed.connect(self._restyle)
        self._restyle()

    def _set_h(self, v): self._h = float(v); self.update()

    def _restyle(self):
        self._extras = STYLE.extras(self.FAM)
        self.updateGeometry(); self.update()

    def _animate_hover(self, on: bool):
        self._hanim.stop(); self._hanim.setStartValue(self._h); self._hanim.setEndValue(1.0 if on else 0.0); self._hanim.start()

    def enterEvent(self, e): self._animate_hover(True); super().enterEvent(e)
    def leaveEvent(self, e): self._animate_hover(False); super().leaveEvent(e)

    def showEvent(self, e):
        super().showEvent(e)
        if self._extras.get("enter") and self._enter_t0 is None: self._enter_t0 = now()

    def _needs_tick(self, *styles: Style) -> bool:
        busy = any(s.anim for s in styles) or bool(self._ripples) or (self._enter_t0 is not None and now() - self._enter_t0 < 3)
        TICK.want(self, busy)
        return busy

    def _enter(self) -> tuple[float, float, float, float]:
        """→ (dx, dy, scale, opacity) for the entrance animation."""
        e = self._extras.get("enter")
        if not e or self._enter_t0 is None: return 0, 0, 1, 1
        from .engine import keyframe
        p = min(1.0, (now() - self._enter_t0) / max(.05, e[1]))
        k = keyframe(e[0], 1 - (1 - p) ** 3)
        return (k[0], k[1], k[2], k[5]) if k else (0, 0, 1, 1)

    def _paint_states(self, p: QPainter, r: QRectF, sub: str, flags: set, **vars_):
        """Cross-fade the normal and hover styles of one part; returns the dominant style."""
        f0 = frozenset(flags - {"hover"}); f1 = frozenset(flags | {"hover"})
        s0 = STYLE.style(self.FAM, sub, f0, **vars_); s1 = STYLE.style(self.FAM, sub, f1, **vars_)
        h = self._h if self.isEnabled() else 0
        t = now()
        if h < .999: paint_box(p, s0, r, anim_state(s0, t), 1 - h if h > .001 else 1)
        if h > .001: paint_box(p, s1, r, anim_state(s1, t), h)
        return s1 if h > .5 else s0, s0, s1

    def _transform(self, p: QPainter, r: QRectF, s0: Style, s1: Style, sa: Style | None = None):
        a, b = transform_of(s0), transform_of(s1)
        h = self._h
        dx, dy, sx, sy, rot = (lerp(a[i], b[i], h) for i in range(5))
        if sa is not None: dx, dy, sx, sy, rot = transform_of(sa)
        an = anim_state(s1 if h > .5 else s0, now())
        ex, ey, es, eo = self._enter()
        dx += an.dx + ex; dy += an.dy + ey; sx *= an.sx * es; sy *= an.sy * es; rot += an.rot
        c = r.center()
        p.translate(c.x() + dx, c.y() + dy); p.rotate(rot); p.scale(sx, sy); p.translate(-c.x(), -c.y())
        p.setOpacity(p.opacity() * eo)

    def _paint_ring(self, p: QPainter, r: QRectF, st: Style):
        ring = self._extras.get("ring")
        if not ring: return
        kind, w, c1, c2 = ring
        shape = shape_of(st, r)
        inner = shape_of(st, r.adjusted(w, w, -w, -w))
        p.save(); p.setClipPath(shape.subtracted(inner), Qt.IntersectClip)
        grad = {"gradient": f"linear-gradient(135deg, {c1}, {c2})", "spin": f"conic-gradient(from 0deg, {c1}, {c2}, transparent 45%, {c1})",
                "holo": "conic-gradient(from 0deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6)", "dash": f"repeating-linear-gradient(90deg, {c1} 0 8px, transparent 8px 16px)"}[kind]
        tmp = Style({"background": grad}, STYLE.vars, st.color)
        a = Anim(); a.angle = (now() * 120) % 360 if kind in ("spin", "holo") else 0; a.roll = (now() % 1) if kind == "dash" else 0
        paint_layers(p, tmp, r, r, a)
        p.restore()
        if kind in ("spin", "holo", "dash"): TICK.want(self, True)

    def _paint_ripples(self, p: QPainter, r: QRectF, st: Style):
        if not self._ripples: return
        p.save(); p.setClipPath(shape_of(st, r), Qt.IntersectClip)
        keep = []
        for (x, y, t0) in self._ripples:
            k = (now() - t0) / .6
            if k >= 1: continue
            keep.append((x, y, t0)); rad = max(r.width(), r.height()) * 2 * k
            p.setBrush(QColor(255, 255, 255, int(85 * (1 - k)))); p.setPen(Qt.NoPen); p.drawEllipse(QPointF(x, y), rad, rad)
        self._ripples = keep; p.restore()


def _base_font(px: float, family: str | None = None) -> QFont:
    f = QFont(family or STYLE.font_family()); f.setPixelSize(int(px)); return f


# ── Button ───────────────────────────────────────────────────────────────────
class Button(_UV, QAbstractButton):
    """A button painted with the active button design. Button("Save", primary=True, size="md"|"sm"|"lg")."""
    FAM = "btn"

    def __init__(self, text: str = "", primary: bool = False, size: str = "md", parent=None):
        QAbstractButton.__init__(self, parent)
        self.setText(text); self.primary = primary; self.size = size; self.loading = False
        self.setCursor(Qt.PointingHandCursor); self.setFocusPolicy(Qt.StrongFocus)
        self._uv_init()

    def _flags(self):
        f = set()
        if self.primary: f.add("primary")
        if self.isDown(): f.add("active")
        if self.loading: f.add("loading")
        return f

    def _dims(self):
        return {"sm": (34, 12, 13), "md": (42, 18, 14), "lg": (52, 26, 16)}[self.size]

    def sizeHint(self) -> QSize:
        h, pad, fs = self._dims()
        st = STYLE.style("btn", "main", frozenset(self._flags()))
        font = st.font(_base_font(fs), fs)
        text = self.text().upper() if st.upper else self.text()
        w = QFontMetricsF(font).horizontalAdvance(self._decorated(text)) + 2 * pad
        if st.padding.get("left"): w += length(st.padding["left"], em=fs) - pad
        if st.padding.get("right"): w += length(st.padding["right"], em=fs) - pad
        return QSize(int(w + 2 * self.BLEED + 2), int(h + 2 * self.BLEED))

    def _decorated(self, text):
        f = frozenset(self._flags())
        b, a = STYLE.style("btn", "::before", f), STYLE.style("btn", "::after", f)
        pre = b.content if b.content and not b.position_abs else ""
        post = a.content if a.content and not a.position_abs else ""
        return f"{pre}{text}{post}"

    def mousePressEvent(self, e):
        if self._extras.get("ripple"):
            self._ripples.append((e.position().x(), e.position().y(), now())); TICK.want(self, True)
        super().mousePressEvent(e)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing); p.setRenderHint(QPainter.TextAntialiasing)
        h, pad, fs = self._dims()
        r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        flags = self._flags()
        if not self.isEnabled(): p.setOpacity(.45)
        sa = STYLE.style("btn", "main", frozenset(flags | ({"hover"} if self._h > .5 else set()))) if "active" in flags else None
        s0 = STYLE.style("btn", "main", frozenset(flags - {"hover"})); s1 = STYLE.style("btn", "main", frozenset(flags | {"hover"}))
        self._transform(p, r, s0, s1, sa)
        dom, s0, s1 = self._paint_states(p, r, "main", flags)
        self._paint_ring(p, r, dom)
        # positioned pseudo boxes (gel highlight, split chip, price-tag hole…)
        for sub in ("::before", "::after"):
            fl = frozenset(flags | ({"hover"} if self._h > .5 else set()))
            ps = STYLE.style("btn", sub, fl)
            if ps.content is not None and ps.position_abs:
                pr = _pseudo_rect(ps, r)
                p.save(); p.setClipPath(shape_of(dom, r), Qt.IntersectClip); paint_box(p, ps, pr, anim_state(ps, now()))
                if ps.content: paint_text(p, ps, pr, ps.content, ps.font(_base_font(fs), fs))
                p.restore()
        self._paint_ripples(p, r, dom)
        # label
        text = self.text()
        font = dom.font(_base_font(fs), fs)
        if self.loading:
            p.setPen(QPen(dom.color, 2)); c = r.center(); a = (now() * 360 * 1.4) % 360
            p.drawArc(QRectF(c.x() - 8, c.y() - 8, 16, 16), int(-a * 16), 270 * 16); TICK.want(self, True)
        else:
            lr = r.adjusted(length(dom.padding.get("left", "0"), em=fs) * 0 , 0, -(length(dom.padding.get("right", "0"), em=fs) - pad if dom.padding.get("right") else 0), 0)
            if dom.padding.get("left") and length(dom.padding["left"], em=fs) > pad: lr.adjust(length(dom.padding["left"], em=fs) - pad, 0, 0, 0)
            pre = STYLE.style("btn", "::before", frozenset(flags)); post = STYLE.style("btn", "::after", frozenset(flags))
            label = (pre.content if pre.content and not pre.position_abs else "") + (dom.upper and text.upper() or text) + (post.content if post.content and not post.position_abs else "")
            for s in (s0, s1):
                if s is dom or self._h in (0.0, 1.0): pass
            if self._h <= .001 or self._h >= .999: paint_text(p, dom, lr, label, font)
            else:
                paint_text(p, s0, lr, label, s0.font(_base_font(fs), fs), opacity=1 - self._h)
                paint_text(p, s1, lr, label, s1.font(_base_font(fs), fs), opacity=self._h)
        if self.hasFocus() and self.focusPolicy() != Qt.NoFocus and self._kbd_focus:
            p.setPen(QPen(STYLE.color("accent"), 2)); p.setBrush(Qt.NoBrush); p.drawPath(rounded_path(r.adjusted(-3, -3, 3, 3), [(x + 3, y + 3) for x, y in dom.radii(r)]))
        self._needs_tick(s0, s1)
        p.end()

    _kbd_focus = False
    def focusInEvent(self, e): self._kbd_focus = e.reason() in (Qt.TabFocusReason, Qt.BacktabFocusReason); super().focusInEvent(e)


def _pseudo_rect(ps: Style, r: QRectF) -> QRectF:
    g = ps.geom; W, H = r.width(), r.height()
    l = length(g["left"], W) if "left" in g else None; rt = length(g["right"], W) if "right" in g else None
    t = length(g["top"], H) if "top" in g else None; b = length(g["bottom"], H) if "bottom" in g else None
    w = length(g["width"], W) if "width" in g else None; h = length(g["height"], H) if "height" in g else None
    if w is None: w = W - (l or 0) - (rt or 0)
    if h is None: h = H - (t or 0) - (b or 0)
    x = r.x() + (l if l is not None else (W - rt - w if rt is not None else 0))
    y = r.y() + (t if t is not None else (H - b - h if b is not None else 0))
    if "margin-top" in g: y += length(g["margin-top"], h)
    return QRectF(x, y, max(0, w), max(0, h))


# ── Card (container) ─────────────────────────────────────────────────────────
class Card(_UV, QFrame):
    """A container painted with the active card design. Add children with card.layout() (a QVBoxLayout)."""
    FAM = "card"
    BLEED = 14

    def __init__(self, parent=None, padding: int = 20):
        QFrame.__init__(self, parent); self._pad = padding
        QVBoxLayout(self)
        self._uv_init()

    def _restyle(self):
        super()._restyle()
        st = STYLE.style("card", "main", frozenset())
        pad = {sd: int(length(st.padding.get(sd, f"{self._pad}px"))) for sd in ("top", "right", "bottom", "left")}
        self.layout().setContentsMargins(self.BLEED + pad["left"], self.BLEED + pad["top"], self.BLEED + pad["right"], self.BLEED + pad["bottom"])
        pal = self.palette(); pal.setColor(QPalette.WindowText, st.color); pal.setColor(QPalette.Text, st.color); self.setPalette(pal)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        s0 = STYLE.style("card", "main", frozenset()); s1 = STYLE.style("card", "main", frozenset({"hover"}))
        self._transform(p, r, s0, s1)
        dom, s0, s1 = self._paint_states(p, r, "main", set())
        for sub in ("::before", "::after"):
            ps = STYLE.style("card", sub, frozenset())
            if ps.content is not None and ps.position_abs: paint_box(p, ps, _pseudo_rect(ps, r))
        self._paint_ring(p, r, dom)
        self._needs_tick(s0, s1); p.end()


# ── Text field ───────────────────────────────────────────────────────────────
class LineEdit(_UV, QLineEdit):
    FAM = "input"
    BLEED = 6

    def __init__(self, text: str = "", placeholder: str = "", parent=None):
        QLineEdit.__init__(self, text, parent)
        self.setPlaceholderText(placeholder); self.setFrame(False)
        self._uv_init()

    def _restyle(self):
        super()._restyle()
        st = STYLE.style("input", "main", frozenset())
        ph = STYLE.style("input", "placeholder", frozenset())
        pad = 16 if "999" in (st.radius_raw or "") else 12
        self.setTextMargins(self.BLEED + pad, 0, self.BLEED + pad, 0)
        self.setStyleSheet(f"QLineEdit {{ background: transparent; border: none; color: {st.color.name()}; selection-background-color: {STYLE.color('accent').name()}; }}")
        f = st.font(_base_font(15), 15); self.setFont(f)
        pal = self.palette(); pal.setColor(QPalette.PlaceholderText, ph.color if ph.decl.get("color") else STYLE.color("muted")); self.setPalette(pal)

    def sizeHint(self): s = super().sizeHint(); return QSize(max(200, s.width()), 44 + 2 * self.BLEED)
    def focusInEvent(self, e): super().focusInEvent(e); self.update()
    def focusOutEvent(self, e): super().focusOutEvent(e); self.update()

    def paintEvent(self, e):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        flags = {"focus"} if self.hasFocus() else set()
        self._paint_states(p, r, "main", flags)
        p.end()
        super().paintEvent(e)


# ── Switch ───────────────────────────────────────────────────────────────────
class Switch(_UV, QAbstractButton):
    FAM = "switch"
    BLEED = 6

    def __init__(self, text: str = "", checked: bool = False, parent=None):
        QAbstractButton.__init__(self, parent)
        self.setText(text); self.setCheckable(True); self.setChecked(checked); self.setCursor(Qt.PointingHandCursor)
        self._c = 1.0 if checked else 0.0
        self._canim = QVariantAnimation(self); self._canim.setDuration(260); self._canim.setEasingCurve(QEasingCurve.OutBack)
        self._canim.valueChanged.connect(lambda v: (setattr(self, "_c", float(v)), self.update()))
        self.toggled.connect(lambda on: (self._canim.stop(), self._canim.setStartValue(self._c), self._canim.setEndValue(1.0 if on else 0.0), self._canim.start()))
        self._uv_init()

    def _track(self):
        st = STYLE.style("switch", "i", frozenset())
        return length(st.geom.get("width", "46px")), length(st.geom.get("height", "26px"))

    def sizeHint(self):
        w, h = self._track()
        tw = QFontMetricsF(_base_font(14)).horizontalAdvance(self.text()) + 10 if self.text() else 0
        return QSize(int(w + tw + 2 * self.BLEED + 2), int(max(h, 22) + 2 * self.BLEED))

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        w, h = self._track()
        tr = QRectF(self.BLEED, (self.height() - h) / 2, w, h)
        c = self._c
        off, on = STYLE.style("switch", "i", frozenset()), STYLE.style("switch", "i", frozenset({"checked"}))
        if c < .999: paint_box(p, off, tr, None, 1 - max(0, min(1, c)))
        if c > .001: paint_box(p, on, tr, None, max(0, min(1, c)))
        for sub in ("i::before",):
            a, b = STYLE.style("switch", sub, frozenset()), STYLE.style("switch", sub, frozenset({"checked"}))
            ps = b if c > .5 else a
            if ps.content: paint_text(p, ps, _pseudo_rect(ps, tr), ps.content, ps.font(_base_font(9), 9))
        k0, k1 = STYLE.style("switch", "i::after", frozenset()), STYLE.style("switch", "i::after", frozenset({"checked"}))
        kr = _pseudo_rect(k0, tr)
        dx0, dx1 = transform_of(k0)[0], transform_of(k1)[0]
        kr.translate(lerp(dx0, dx1, c), 0)
        paint_box(p, k0 if c < .5 else k1, kr)
        if self.text():
            ts = STYLE.style("btn", "main", frozenset())  # plain text colour
            p.setPen(STYLE.color("text")); p.setFont(_base_font(14))
            p.drawText(QRectF(tr.right() + 10, 0, self.width() - tr.right() - 10, self.height()), Qt.AlignVCenter | Qt.AlignLeft, self.text())
        p.end()


# ── Checkbox / radio ─────────────────────────────────────────────────────────
class CheckBox(_UV, QAbstractButton):
    FAM = "check"
    BLEED = 4

    def __init__(self, text: str = "", checked: bool = False, radio: bool = False, parent=None):
        QAbstractButton.__init__(self, parent)
        self.setText(text); self.setCheckable(True); self.setChecked(checked); self.radio = radio; self.setCursor(Qt.PointingHandCursor)
        if radio: self.setAutoExclusive(True)
        self._uv_init()

    def _flags(self):
        f = set()
        if self.isChecked(): f.add("checked")
        if self.radio: f.add("radio")
        return frozenset(f)

    def sizeHint(self):
        tw = QFontMetricsF(_base_font(14)).horizontalAdvance(self.text()) + 10 if self.text() else 0
        return QSize(int(26 + tw + 2 * self.BLEED), 30)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = STYLE.style("check", "input", self._flags())
        s = length(st.geom.get("width", "20px")) or 20
        br = QRectF(self.BLEED, (self.height() - s) / 2, s, s)
        paint_box(p, st, br)
        mk = STYLE.style("check", "input::after", self._flags())
        if self.isChecked():
            has_box = mk.bg_color is not None and mk.bg_color.alpha() or mk.layers
            if has_box and mk.geom.get("width"):
                mw = length(mk.geom["width"]); mh = length(mk.geom.get("height", mk.geom["width"]))
                paint_box(p, mk, QRectF(br.center().x() - mw / 2, br.center().y() - mh / 2, mw, mh))
            else:
                col = mk.borders["top"][2] if mk.decl.get("border-top-color") else STYLE.color("bg")
                c = br.center(); k = s / 20
                if self.radio:
                    p.setPen(Qt.NoPen); p.setBrush(col); p.drawEllipse(c, 3.6 * k, 3.6 * k); p.end(); return self._label()
                pen = QPen(col, max(2.0, s / 8), Qt.SolidLine, Qt.RoundCap, Qt.RoundJoin); p.setPen(pen)
                path = QPainterPath(QPointF(c.x() - 4.5 * k, c.y() + .2 * k)); path.lineTo(c.x() - 1.2 * k, c.y() + 3.5 * k); path.lineTo(c.x() + 5 * k, c.y() - 3.5 * k)
                p.drawPath(path)
        p.end(); self._label()

    def _label(self):
        if not self.text(): return
        p = QPainter(self); p.setRenderHint(QPainter.TextAntialiasing)
        st = STYLE.style("check", "input", self._flags()); s = length(st.geom.get("width", "20px")) or 20
        p.setPen(STYLE.color("text")); p.setFont(_base_font(14))
        p.drawText(QRectF(self.BLEED + s + 10, 0, self.width(), self.height()), Qt.AlignVCenter | Qt.AlignLeft, self.text()); p.end()


class RadioButton(CheckBox):
    def __init__(self, text: str = "", checked: bool = False, parent=None): super().__init__(text, checked, True, parent)


# ── Slider ───────────────────────────────────────────────────────────────────
class Slider(_UV, QSlider):
    FAM = "range"
    BLEED = 6

    def __init__(self, value: int = 50, minimum: int = 0, maximum: int = 100, parent=None):
        QSlider.__init__(self, Qt.Horizontal, parent); self.setRange(minimum, maximum); self.setValue(value)
        self._uv_init()

    def sizeHint(self): return QSize(220, 34)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        f = (self.value() - self.minimum()) / max(1, self.maximum() - self.minimum())
        st = STYLE.style("range", "main", frozenset(), v=f"{f * 100:.2f}%")
        th = STYLE.style("range", "thumb", frozenset())
        tw, thh = length(th.geom.get("width", "16px")) or 16, length(th.geom.get("height", "16px")) or 16
        h = length(st.geom.get("height", "6px")) or 6
        r = QRectF(self.BLEED + tw / 2, (self.height() - h) / 2, self.width() - 2 * self.BLEED - tw, h)
        paint_box(p, st, r)
        x = r.x() + r.width() * f
        paint_box(p, th, QRectF(x - tw / 2, self.height() / 2 - thh / 2, tw, thh))
        p.end()


# ── Tabs ─────────────────────────────────────────────────────────────────────
class TabBar(_UV, QTabBar):
    """A QTabBar painted with the active tabs design (works inside QTabWidget via tabWidget.setTabBar(TabBar()))."""
    FAM = "tabs"
    BLEED = 6

    def __init__(self, tabs=(), parent=None):
        QTabBar.__init__(self, parent); self.setDrawBase(False); self.setExpanding(False)
        for t in tabs: self.addTab(t)
        self._ind = None
        self._ianim = QVariantAnimation(self); self._ianim.setDuration(420); self._ianim.setEasingCurve(QEasingCurve.OutBack)
        self._ianim.valueChanged.connect(lambda v: (setattr(self, "_ind", v), self.update()))
        self.currentChanged.connect(self._move)
        self._uv_init()

    def _move(self, i):
        tgt = QRectF(self.tabRect(i))
        if self._ind is None: self._ind = tgt; self.update(); return
        self._ianim.stop(); self._ianim.setStartValue(QRectF(self._ind)); self._ianim.setEndValue(tgt); self._ianim.start()

    def tabSizeHint(self, i):
        st = STYLE.style("tabs", "button", frozenset({"selected"}))
        w = QFontMetricsF(st.font(_base_font(14), 14)).horizontalAdvance(self.tabText(i).upper() if st.upper else self.tabText(i))
        return QSize(int(w + 34), 38)

    def minimumSizeHint(self): s = super().sizeHint(); return QSize(s.width() + 2 * self.BLEED, s.height() + 2 * self.BLEED)
    def sizeHint(self): return self.minimumSizeHint()

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        if self.count() == 0: return
        main = STYLE.style("tabs", "main", frozenset())
        pad = length(main.padding.get("top", "4px")) if main.padding else 4
        allr = QRectF(self.tabRect(0)).united(QRectF(self.tabRect(self.count() - 1))).adjusted(-pad, -pad, pad, pad)
        allr = allr.intersected(QRectF(self.rect()).adjusted(1, 1, -1, -1))
        paint_box(p, main, allr)
        if self._ind is None: self._ind = QRectF(self.tabRect(self.currentIndex()))
        ind = STYLE.style("tabs", "ind", frozenset())
        if ind.decl.get("display") != "none":
            ir = QRectF(self._ind).adjusted(0, 2, 0, -2)
            if ind.geom.get("height") and ind.geom.get("top") == "auto": ir = QRectF(ir.x(), allr.bottom() - length(ind.geom["height"]), ir.width(), length(ind.geom["height"]))
            paint_box(p, ind, ir)
        for i in range(self.count()):
            sel = i == self.currentIndex()
            bs = STYLE.style("tabs", "button", frozenset({"selected"} if sel else set()))
            tr = QRectF(self.tabRect(i)).adjusted(0, 2, 0, -2)
            if bs.bg_color is not None or bs.layers or any(bs.border_w().values()) or bs.shadows: paint_box(p, bs, tr)
            paint_text(p, bs, tr, self.tabText(i), bs.font(_base_font(14), 14))
        p.end()


# ── Progress ─────────────────────────────────────────────────────────────────
class ProgressBar(_UV, QProgressBar):
    FAM = "progress"
    BLEED = 4

    def __init__(self, value: int = 0, parent=None):
        QProgressBar.__init__(self, parent); self.setValue(value); self.setTextVisible(False)
        self._uv_init()

    def sizeHint(self):
        st = STYLE.style("progress", "main", frozenset())
        return QSize(220, int((length(st.geom.get("height", "8px")) or 8) + 2 * self.BLEED + 4))

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = STYLE.style("progress", "main", frozenset()); bar = STYLE.style("progress", "bar", frozenset())
        h = length(st.geom.get("height", "8px")) or 8
        r = QRectF(self.BLEED, (self.height() - h) / 2, self.width() - 2 * self.BLEED, h)
        paint_box(p, st, r)
        f = (self.value() - self.minimum()) / max(1, self.maximum() - self.minimum())
        bw = st.border_w(); inner = r.adjusted(bw["left"] + length(st.padding.get("left", "0")), bw["top"] + length(st.padding.get("top", "0")), -bw["right"] - length(st.padding.get("right", "0")), -bw["bottom"] - length(st.padding.get("bottom", "0")))
        br = QRectF(inner.x(), inner.y(), inner.width() * f, inner.height())
        p.save(); p.setClipPath(shape_of(st, r), Qt.IntersectClip)
        paint_box(p, bar, br, anim_state(bar, now()))
        p.restore()
        self._needs_tick(bar)
        p.end()


# ── Spinner ──────────────────────────────────────────────────────────────────
class Spinner(_UV, QWidget):
    FAM = "spinner"
    BLEED = 6

    def __init__(self, size: int = 28, parent=None):
        QWidget.__init__(self, parent); self._s = size
        self._uv_init(); TICK.want(self, True)

    def sizeHint(self): return QSize(int(self._s * 1.8) + 2 * self.BLEED, self._s + 2 * self.BLEED)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = STYLE.style("spinner", "main", frozenset())
        s = self._s
        wide = st.geom.get("width", "").startswith("calc")
        w = s * 1.8 if wide else s
        r = QRectF((self.width() - w) / 2, (self.height() - s) / 2, w, s)
        a = anim_state(st, now())
        c = r.center()
        p.save(); p.translate(c.x() + a.dx, c.y() + a.dy); p.rotate(a.rot); p.scale(a.sx, a.sy); p.translate(-c.x(), -c.y())
        a2 = Anim(); a2.angle = a.angle; a2.opacity = a.opacity
        paint_box(p, st, r, a2)
        p.restore()
        for sub in ("::before", "::after"):
            ps = STYLE.style("spinner", sub, frozenset())
            if ps.content is None: continue
            pr = _pseudo_rect(ps, r) if ps.position_abs else r
            pa = anim_state(ps, now() + (0.7 if sub == "::after" else 0))
            cc = pr.center(); p.save(); p.translate(cc); p.scale(pa.sx, pa.sy); p.translate(-cc)
            paint_box(p, ps, pr, None, pa.opacity); p.restore()
        p.end()


# ── Badge, Alert, Heading ────────────────────────────────────────────────────
KIND_VAR = {"accent": "var(--uv-accent)", "success": "var(--uv-success)", "warn": "var(--uv-warn)", "danger": "var(--uv-danger)",
            "info": "var(--uv-info)", "neutral": "var(--uv-muted)"}


class Badge(_UV, QWidget):
    FAM = "badge"
    BLEED = 4

    def __init__(self, text: str = "", kind: str = "accent", parent=None):
        QWidget.__init__(self, parent); self.text = text; self.kind = kind
        self._uv_init()

    def _st(self, sub="main"): return STYLE.style("badge", sub, frozenset(), k=KIND_VAR.get(self.kind, self.kind))

    def sizeHint(self):
        st = self._st(); f = st.font(_base_font(12), 12)
        t = self.text.upper() if st.upper else self.text
        extra = 14 if self._st("::before").content is not None else 0
        return QSize(int(QFontMetricsF(f).horizontalAdvance(t) + 22 + extra + 2 * self.BLEED), 22 + 2 * self.BLEED)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = self._st(); r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        a = anim_state(st, now()); c = r.center()
        p.translate(c); p.rotate(transform_of(st)[4]); p.translate(-c)
        paint_box(p, st, r, a)
        b, af = self._st("::before"), self._st("::after")
        f = st.font(_base_font(12), 12)
        tr = QRectF(r)
        if b.content is not None and b.geom.get("width"):
            d = length(b.geom["width"]); paint_box(p, b, QRectF(r.x() + 10, c.y() - d / 2, d, d)); tr.adjust(14, 0, 0, 0)
        text = (b.content or "") + self.text + (af.content or "")
        paint_text(p, st, tr, text, f)
        self._needs_tick(st); p.end()


class Alert(_UV, QWidget):
    FAM = "alert"
    BLEED = 6

    def __init__(self, text: str = "", kind: str = "info", toast: bool = False, parent=None):
        QWidget.__init__(self, parent); self.text = text; self.kind = kind; self.toast = toast
        self.setSizePolicy(QSizePolicy.Expanding, QSizePolicy.Fixed)
        self._uv_init()

    def _st(self, sub="main"): return STYLE.style("alert", sub, frozenset(), k=KIND_VAR.get(self.kind, self.kind))

    def sizeHint(self): return QSize(320, 48 + 2 * self.BLEED)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = self._st(); r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        c = r.center(); p.translate(c); p.rotate(transform_of(st)[4]); p.translate(-c)
        paint_box(p, st, r)
        tr = r.adjusted(16 + st.border_w()["left"], 0, -16, 0)
        if self.toast:
            ic = self._st("icon"); d = 22
            icr = QRectF(tr.x(), c.y() - d / 2, d, d)
            ic2 = Style({"background": ic.decl.get("background", KIND_VAR.get(self.kind, "")), "border-radius": "50%", "color": "#fff"}, STYLE.vars.child(k=KIND_VAR.get(self.kind, "")), st.color)
            paint_box(p, ic2, icr); paint_text(p, ic2, icr, {"success": "✓", "danger": "!", "warn": "!", "info": "i"}.get(self.kind, "i"), _base_font(12))
            tr.adjust(d + 10, 0, 0, 0)
        f = st.font(_base_font(14), 14)
        p.setFont(f); p.setPen(st.color)
        p.drawText(tr, Qt.AlignVCenter | Qt.AlignLeft | Qt.TextWordWrap, self.text)
        p.end()


class Heading(_UV, QWidget):
    """Big text painted with the active heading design (metal, chrome, pearl, holo, neon, glitch…)."""
    FAM = "head"
    BLEED = 10

    def __init__(self, text: str = "", size: int = 44, parent=None):
        QWidget.__init__(self, parent); self.text = text; self.px = size
        self._uv_init()

    def _font(self, st):
        f = st.font(_base_font(self.px, STYLE.font_family("head")), self.px)
        return f

    def sizeHint(self):
        st = STYLE.style("head", "main", frozenset()); f = self._font(st)
        fm = QFontMetricsF(f)
        return QSize(int(fm.horizontalAdvance(self.text.upper() if st.upper else self.text) + 2 * self.BLEED + 12), int(fm.height() + 2 * self.BLEED))

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        st = STYLE.style("head", "main", frozenset())
        r = QRectF(self.rect()).adjusted(self.BLEED, 0, -self.BLEED, 0)
        a = anim_state(st, now())
        p.translate(a.dx, a.dy)
        paint_text(p, st, r, self.text, self._font(st), Qt.AlignLeft | Qt.AlignVCenter, a)
        self._needs_tick(st); p.end()


# ── Navigation ───────────────────────────────────────────────────────────────
class NavBar(_UV, QWidget):
    """A row (or column, vertical=True) of navigation items painted with the active nav design."""
    FAM = "nav"
    BLEED = 6
    currentChanged = Signal(int)

    def __init__(self, items=(), current: int = 0, vertical: bool = False, parent=None):
        QWidget.__init__(self, parent); self.items = list(items); self.current = current; self.vertical = vertical; self._hi = -1
        self.setMouseTracking(True); self.setCursor(Qt.PointingHandCursor)
        self._uv_init()

    def _rects(self):
        f = _base_font(14); fm = QFontMetricsF(f); out = []
        x, y = self.BLEED + 8, self.BLEED + 8
        for t in self.items:
            w = fm.horizontalAdvance(t) + 24
            if self.vertical: out.append(QRectF(x, y, self.width() - 2 * x, 34)); y += 36
            else: out.append(QRectF(x, y, w, 34)); x += w + 4
        return out

    def sizeHint(self):
        rs = self._rects() if self.width() else []
        f = _base_font(14); fm = QFontMetricsF(f)
        if self.vertical: return QSize(200, int(len(self.items) * 36 + 16 + 2 * self.BLEED))
        return QSize(int(sum(fm.horizontalAdvance(t) + 28 for t in self.items) + 16 + 2 * self.BLEED), 50 + 2 * self.BLEED)

    def mouseMoveEvent(self, e):
        hi = next((i for i, r in enumerate(self._rects()) if r.contains(e.position())), -1)
        if hi != self._hi: self._hi = hi; self.update()

    def leaveEvent(self, e): self._hi = -1; self.update(); super().leaveEvent(e)

    def mousePressEvent(self, e):
        i = next((i for i, r in enumerate(self._rects()) if r.contains(e.position())), -1)
        if i >= 0 and i != self.current: self.current = i; self.update(); self.currentChanged.emit(i)

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        fl = frozenset({"vertical"}) if self.vertical else frozenset()
        main = STYLE.style("nav", "main", fl)
        paint_box(p, main, QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED))
        for i, (t, r) in enumerate(zip(self.items, self._rects())):
            f = set()
            if i == self.current: f.add("current")
            if i == self._hi: f.add("hover")
            st = STYLE.style("nav", "item", frozenset(f))
            if st.bg_color is not None or st.layers or st.shadows or any(st.border_w().values()): paint_box(p, st, r)
            paint_text(p, st, r, t, st.font(_base_font(14), 14), Qt.AlignLeft | Qt.AlignVCenter if self.vertical else Qt.AlignCenter) if not self.vertical else paint_text(p, st, r.adjusted(12, 0, 0, 0), t, st.font(_base_font(14), 14), Qt.AlignLeft | Qt.AlignVCenter)
        p.end()


# ── Page background & dialog ─────────────────────────────────────────────────
class Surface(_UV, QWidget):
    """A page/window background painted with the theme background and the active background design. Use as central widget."""
    FAM = "bg"
    BLEED = 0

    def __init__(self, parent=None):
        QWidget.__init__(self, parent); self._uv_init()

    def _restyle(self):
        super()._restyle()
        pal = self.palette(); pal.setColor(QPalette.WindowText, STYLE.color("text")); self.setPalette(pal)

    def paintEvent(self, _):
        p = QPainter(self)
        p.fillRect(self.rect(), STYLE.color("bg"))
        paint_box(p, STYLE.style("bg", "main", frozenset()), QRectF(self.rect()))
        p.end()


class Dialog(_UV, QDialog):
    """A frameless dialog painted with the active modal design."""
    FAM = "modal"
    BLEED = 24

    def __init__(self, parent=None):
        QDialog.__init__(self, parent)
        self.setWindowFlags(Qt.Dialog | Qt.FramelessWindowHint); self.setAttribute(Qt.WA_TranslucentBackground)
        lay = QVBoxLayout(self); lay.setContentsMargins(self.BLEED + 22, self.BLEED + 22, self.BLEED + 22, self.BLEED + 22)
        self._uv_init()

    def paintEvent(self, _):
        p = QPainter(self); p.setRenderHint(QPainter.Antialiasing)
        r = QRectF(self.rect()).adjusted(self.BLEED, self.BLEED, -self.BLEED, -self.BLEED)
        paint_box(p, STYLE.style("modal", "main", frozenset({"open"})), r)
        p.end()
