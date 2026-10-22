"""UI Vault for Python — the same 12 design themes as the web library, for desktop and terminal UIs.

    import uivault
    t = uivault.theme("neon")
    t.accent            # '#00f0ff'
    uivault.qss(t)      # Qt / PySide / PyQt stylesheet
    uivault.apply_tk(root, "brutal")       # Tkinter / ttk
    uivault.tcss("terminal")               # Textual CSS
    uivault.apply_gtk("luxe")              # GTK4 / libadwaita
    uivault.dearpygui_theme("soft")        # Dear PyGui
    uivault.apply_matplotlib("swiss")      # matplotlib charts

Element designs (the same 270+ "parts" as the web library, approximated for native toolkits) and kits:

    uivault.qss("editorial", parts={"btn": "pearl", "input": "underline"})
    uivault.apply_tk(root, kit="deep-metal")   # a kit = a theme + one design per element
    uivault.parts("btn"), uivault.kits(), uivault.part("btn", "chrome")

No dependencies; each toolkit is imported only when you call its function. MIT.
"""
from __future__ import annotations

import json
from pathlib import Path

__version__ = "3.1.0"
__all__ = ["theme", "themes", "categories", "custom", "Theme", "families", "parts", "part", "kits", "kit", "parts_qss", "css", "qss", "apply_qt", "apply_tk", "tcss", "textual_theme", "gtk_css",
           "apply_gtk", "dearpygui_theme", "matplotlib_rc", "apply_matplotlib", "rich_theme"]

_DATA = json.loads((Path(__file__).with_name("tokens.json")).read_text())
_PARTS = json.loads((Path(__file__).with_name("parts.json")).read_text())
_FAM = {f["key"]: f for f in _PARTS["families"]}
_KITS = {k["name"]: k for k in _PARTS["kits"]}


class Theme:
    """A design theme. Colour tokens are attributes: bg, surface, surface_2, surface_3, line, line_2, text,
    muted, dim, accent, accent_2, success, warn, danger, info. Use .solid(name) for an opaque version
    (alpha already blended over the background) and .rgba(name) for a 0–1 float tuple."""

    def __init__(self, data: dict):
        self.name: str = data["name"]
        self.description: str = data["desc"]
        self.dark: bool = data["dark"]
        self.colors: dict = data["colors"]
        self._solid: dict = data["solid"]
        self.fonts: dict = data["fonts"]
        self.shape: dict = data["shape"]
        self.category: str = data.get("category", "Custom")
        self.style: dict = data.get("style", {})   # recipes: background, heading, button, hover, card

    def __getattr__(self, key):
        k = key.replace("_", "-")
        if k in self.colors:
            c = self.colors[k]
            return c[:7] if c.endswith("ff") else c
        raise AttributeError(key)

    def solid(self, key: str) -> str:
        return self._solid[key.replace("_", "-")]

    def rgba(self, key: str) -> tuple:
        c = self.colors[key.replace("_", "-")].lstrip("#")
        return tuple(int(c[i:i + 2], 16) / 255 for i in (0, 2, 4, 6))

    def rgba255(self, key: str) -> tuple:
        return tuple(round(v * 255) for v in self.rgba(key))

    def css_rgba(self, key: str) -> str:
        r, g, b, a = self.rgba255(key)
        return f"rgba({r}, {g}, {b}, {a / 255:.3f})"

    @property
    def font(self) -> str: return self.fonts.get("font-family", "sans-serif")
    @property
    def font_head(self) -> str: return self.fonts.get("font-head-family", self.font)
    @property
    def mono(self) -> str: return self.fonts.get("mono-family", "monospace")
    @property
    def radius(self) -> float: return min(self.shape.get("r", 6), 24)
    @property
    def radius_sm(self) -> float: return min(self.shape.get("r-sm", 4), 24)
    @property
    def border(self) -> float: return self.shape.get("bw", 1)

    def __repr__(self): return f"<uivault.Theme {self.name!r}: {self.description}>"


def themes(category: str | None = None) -> list[str]:
    """Names of all themes, optionally only one category (see categories())."""
    return [n for n, t in _DATA["themes"].items() if category is None or t.get("category") == category]


def categories() -> list[str]:
    return sorted({t.get("category", "Custom") for t in _DATA["themes"].values()})


def _mix(a, b, t):
    a, b = a.lstrip("#"), b.lstrip("#")
    return "#" + "".join("%02x" % round(int(a[i:i + 2], 16) + (int(b[i:i + 2], 16) - int(a[i:i + 2], 16)) * t) for i in (0, 2, 4))


def custom(name: str, bg: str, fg: str, accent: str, accent2: str | None = None, font: str = "Geist", font_head: str | None = None,
           radius: float = 6, border: float = 1, register: bool = True) -> Theme:
    """Make your own theme from four colours (the theme builder on the site exports this call).
    Surfaces, lines and muted text are derived the same way the web themes are."""
    lum = lambda h: (0.2126 * int(h[1:3], 16) + 0.7152 * int(h[3:5], 16) + 0.0722 * int(h[5:7], 16)) / 255
    dark = lum(bg) < .5
    a2 = accent2 or accent
    c = {"bg": bg, "text": fg, "accent": accent, "accent-2": a2,
         "surface": _mix(bg, fg, .05) if dark else _mix(bg, "#ffffff", .55), "surface-2": _mix(bg, fg, .09 if dark else .06),
         "surface-3": _mix(bg, fg, .15 if dark else .11), "line": fg + ("24" if dark else "1a"), "line-2": fg + ("42" if dark else "2e"),
         "muted": _mix(fg, bg, .32), "dim": _mix(fg, bg, .52)}
    c.update(dict(zip(("success", "warn", "danger", "info"), ("#4ade80", "#fbbf24", "#f87171", "#60a5fa") if dark else ("#2f7d4f", "#b7791f", "#c4321f", "#2b5fb4"))))
    colors = {k: (v + "ff" if len(v) == 7 else v) for k, v in c.items()}
    solid = {}
    for k, v in colors.items():
        f = int(v[7:9], 16) / 255
        solid[k] = _mix(bg, v[:7], f)
    data = {"name": name, "desc": "custom theme", "dark": dark, "category": "Custom", "colors": colors, "solid": solid,
            "fonts": {"font": f'"{font}", sans-serif', "font-family": font, "font-head": f'"{font_head or font}", serif', "font-head-family": font_head or font,
                      "mono": '"Geist Mono", monospace', "mono-family": "Geist Mono"},
            "shape": {"r-xs": radius / 2, "r-sm": radius * .66, "r": radius, "r-lg": radius * 1.33, "bw": border}, "style": {}}
    if register:
        _DATA["themes"][name] = data
    return Theme(data)


# ── Element designs ("parts") and kits ───────────────────────────────────────
def families() -> list[str]:
    """Element families: btn, card, input, switch, check, range, tabs, nav, badge, alert, modal, spinner, progress, head, bg."""
    return list(_FAM)


def parts(family: str) -> list[str]:
    """Design names for one family, e.g. parts("btn") → ['solid', 'pill', …, 'pearl', 'deep-metal', …]."""
    return [p["name"] for p in _FAM[family]["parts"]]


def part(family: str, name: str) -> dict:
    """One design: label, desc and `approx` (r radius px, 999 = pill · bw border · fill · w weight · up uppercase)."""
    for p in _FAM[family]["parts"]:
        if p["name"] == name:
            return dict(p, family=family)
    raise ValueError(f"unknown {family} design {name!r}; choose from {', '.join(parts(family))}")


def kits() -> list[str]:
    return list(_KITS)


def kit(name: str) -> dict:
    """A kit: {'name', 'label', 'desc', 'theme', 'parts': {family: design}}."""
    try:
        return _KITS[name]
    except KeyError:
        raise ValueError(f"unknown kit {name!r}; choose from {', '.join(_KITS)}") from None


def _resolve(t, parts_=None, kit_=None):
    """(Theme, {family: approx}) from a theme name, a parts dict and/or a kit name."""
    mix = {}
    if kit_:
        k = kit(kit_); mix.update(k["parts"]); t = t or k["theme"]
    mix.update(parts_ or {})
    return theme(t or "editorial"), {f: part(f, n)["approx"] for f, n in mix.items() if n}


def _fill(t: Theme, fill: str) -> dict:
    """Colours for a native approximation of a fill style: top/bottom gradient stops, text, border (hex)."""
    s = t.solid; a, a2, tx, bg = s("accent"), s("accent-2"), s("text"), s("bg")
    lum = lambda h: (0.2126 * int(h[1:3], 16) + 0.7152 * int(h[3:5], 16) + 0.0722 * int(h[5:7], 16)) / 255
    on = "#111111" if lum(a) > .55 else "#ffffff"
    F = {"solid": (a, a, on, a), "hard": (a, a, on, tx), "grad": (a, a2, "#ffffff", a),
         "metal": (_mix(a, "#ffffff", .45), _mix(a, "#000000", .3), "#ffffff", _mix(a, "#000000", .45)),
         "deepmetal": ("#3f74dc", "#0a2560", "#f2f7ff", "#071a45"), "chrome": ("#f4f6f9", "#8a919c", "#1b1f26", "#7d848f"),
         "pearl": ("#f3e8ff", "#e0f4ff", "#3a2f5a", "#d9cfee"), "holo": ("#ff9ae6", "#9ad3ff", "#2a1f3d", "#ffffff"),
         "gold": ("#fff3c4", "#9a6f12", "#2a1a00", "#8a5f0c"), "printstream": ("#fbfaff", "#e9e1f7", "#101014", "#0d0d10"),
         "glass": (_mix(s("surface"), "#ffffff", .25), _mix(s("surface"), "#ffffff", .1), tx, _mix(s("line-2"), "#ffffff", .4)),
         "bevel": ("#c3c3c3", "#c3c3c3", "#000000", "#0a0a0a"), "neon": (bg, bg, _mix(a, "#ffffff", .35), a), "inverse": (tx, tx, bg, tx),
         "soft": (_mix(bg, a, .18), _mix(bg, a, .18), _mix(a, "#ffffff", .3) if t.dark else _mix(a, "#000000", .25), _mix(bg, a, .18)),
         "clay": (_mix(s("surface-2"), "#ffffff", .15), s("surface-2"), tx, s("surface-2")),
         "sunken": (_mix(s("surface-2"), "#000000", .06), s("surface-2"), tx, s("surface-2")),
         "outline": (bg, bg, a, a), "ghost": (bg, bg, a, bg), "underline": (bg, bg, a, bg)}
    top, bottom, text, border = F.get(fill, (s("surface"), s("surface"), tx, s("line-2")))
    return {"top": top, "bottom": bottom, "text": text, "border": border}


def parts_qss(t=None, parts: dict | None = None, kit: str | None = None) -> str:
    """Qt rules for element designs; qss(..., parts=/kit=) appends this for you.
    Mark widgets with properties: primary buttons setProperty("primary", True), QLabel badge/alert, QFrame card."""
    t, mix = _resolve(t, parts, kit)
    lin = lambda c: c["top"] if c["top"] == c["bottom"] else f"qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 {c['top']}, stop:1 {c['bottom']})"
    rad = lambda a, cap=14: min(a["r"], cap)
    out = []

    def rule(fam, sel, fill=True, cap=14):
        a = mix.get(fam)
        if not a: return
        c = _fill(t, a["fill"])
        r = f"{sel} {{ border-radius: {rad(a, cap):g}px; border: {a['bw']:g}px solid {c['border']}; font-weight: {a['w']}; "
        if fill: r += f"background: {lin(c)}; color: {c['text']}; "
        if a["fill"] == "hard": r += f"border-bottom-width: {a['bw'] + 3:g}px; "
        if a["fill"] == "underline": r += f"border-width: 0 0 {max(a['bw'], 1):g}px 0; border-radius: 0; "
        out.append(r + "}")

    rule("btn", 'QPushButton[primary="true"]')
    if "btn" in mix: out.append(f"QPushButton {{ border-radius: {rad(mix['btn']):g}px; }}")
    rule("input", "QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QComboBox", fill=mix.get("input", {}).get("fill") not in ("outline", "underline", "ghost", "solid", "hard", "neon", "inverse"))
    rule("card", 'QGroupBox, QFrame[card="true"]', fill=False)
    rule("modal", "QDialog, QMessageBox", fill=False)
    rule("badge", 'QLabel[badge="true"]', cap=999)
    rule("alert", 'QLabel[alert="true"]')
    if "progress" in mix:
        c = _fill(t, mix["progress"]["fill"]); out.append(f"QProgressBar::chunk {{ background: {lin(c)}; border-radius: {rad(mix['progress'], 4):g}px; }}")
    if "tabs" in mix:
        c = _fill(t, mix["tabs"]["fill"]); out.append(f"QTabBar::tab:selected {{ background: {lin(c)}; color: {c['text']}; border-radius: {rad(mix['tabs'], 10):g}px; }}")
    if "check" in mix:
        a = mix["check"]; c = _fill(t, a["fill"])
        out.append(f"QCheckBox::indicator {{ border-radius: {rad(a, 8):g}px; }} QCheckBox::indicator:checked, QRadioButton::indicator:checked {{ background: {lin(c)}; border-color: {c['border']}; }}")
    if "range" in mix:
        a = mix["range"]; c = _fill(t, a["fill"])
        out.append(f"QSlider::handle:horizontal {{ border-radius: {min(a['r'], 7):g}px; background: {lin(c)}; border: {a['bw']:g}px solid {c['border']}; }}")
    return "\n".join(out)


def theme(name: str | Theme = "editorial") -> Theme:
    """Get a theme by name (editorial, brutal, neon, glass, terminal, soft, retro, swiss, y2k, mono, sketch, luxe)."""
    if isinstance(name, Theme):
        return name
    try:
        return Theme(_DATA["themes"][name])
    except KeyError:
        raise ValueError(f"unknown theme {name!r}; choose from {', '.join(themes())}") from None


# ── Web / generic ────────────────────────────────────────────────────────────
def css(t="editorial", selector=":root") -> str:
    """CSS custom properties (--uv-*) — drop into any web view (pywebview, NiceGUI, Flet web, Eel…)."""
    t = theme(t)
    lines = [f"  --uv-{k}: {t.css_rgba(k) if not v.endswith('ff') else v[:7]};" for k, v in t.colors.items()]
    lines += [f"  --uv-{k}: {v};" for k, v in t.fonts.items() if not k.endswith("family")]
    lines += [f"  --uv-{k}: {v:g}px;" for k, v in t.shape.items()]
    return f"{selector} {{\n" + "\n".join(lines) + "\n}\n"


# ── Qt (PySide6 / PyQt5 / PyQt6) ─────────────────────────────────────────────
def qss(t=None, font_size=14, parts: dict | None = None, kit: str | None = None) -> str:
    """A complete Qt stylesheet. Mark a primary button with button.setProperty("primary", True).
    parts={"btn": "chrome", …} and/or kit="deep-metal" add element designs (kit also picks the theme if t is None)."""
    if parts or kit:
        return qss(_resolve(t, parts, kit)[0], font_size) + "\n" + parts_qss(t, parts, kit)
    t = theme(t or "editorial"); r, rs, bw = t.radius, t.radius_sm, max(1, int(t.border))
    c = t.css_rgba
    return f"""
* {{ font-family: "{t.font}"; font-size: {font_size}px; }}
QWidget {{ background: {t.bg}; color: {t.text}; selection-background-color: {t.accent}; selection-color: {t.bg}; }}
QLabel[muted="true"] {{ color: {t.muted}; }}
QLabel[heading="true"] {{ font-family: "{t.font_head}"; font-size: {font_size * 2}px; }}
QPushButton {{ background: {c('surface-2')}; color: {t.text}; border: {bw}px solid {c('line-2')}; border-radius: {rs}px; padding: 7px 16px; }}
QPushButton:hover {{ border-color: {t.text}; }}
QPushButton:pressed {{ background: {c('surface-3')}; }}
QPushButton:disabled {{ color: {t.dim}; }}
QPushButton[primary="true"] {{ background: {t.text if not t.dark else t.accent}; color: {t.bg}; border-color: transparent; }}
QPushButton[primary="true"]:hover {{ background: {t.accent}; color: {'#ffffff' if not t.dark else t.bg}; }}
{_qss_primary(t)}
QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QDoubleSpinBox, QComboBox {{ background: {c('surface')}; border: {bw}px solid {c('line-2')}; border-radius: {rs}px; padding: 6px 8px; }}
QLineEdit:focus, QTextEdit:focus, QPlainTextEdit:focus, QSpinBox:focus, QComboBox:focus {{ border-color: {t.accent}; }}
QComboBox QAbstractItemView, QMenu {{ background: {t.solid('surface')}; border: 1px solid {c('line-2')}; }}
QMenu::item:selected {{ background: {t.accent}; color: {t.bg}; }}
QCheckBox::indicator, QRadioButton::indicator {{ width: 16px; height: 16px; border: {bw}px solid {c('line-2')}; background: {c('surface')}; }}
QCheckBox::indicator {{ border-radius: {min(rs, 4)}px; }} QRadioButton::indicator {{ border-radius: 9px; }}
QCheckBox::indicator:checked, QRadioButton::indicator:checked {{ background: {t.accent}; border-color: {t.accent}; }}
QTabWidget::pane {{ border: {bw}px solid {c('line-2')}; border-radius: {r}px; top: -1px; }}
QTabBar::tab {{ background: transparent; color: {t.muted}; padding: 8px 16px; border-bottom: 2px solid transparent; }}
QTabBar::tab:selected {{ color: {t.text}; border-bottom-color: {t.accent}; }}
QProgressBar {{ background: {c('line-2')}; border: none; border-radius: 2px; height: 6px; text-align: center; color: transparent; }}
QProgressBar::chunk {{ background: {t.accent}; border-radius: 2px; }}
QSlider::groove:horizontal {{ height: 3px; background: {c('line-2')}; }}
QSlider::sub-page:horizontal {{ background: {t.accent}; }}
QSlider::handle:horizontal {{ width: 14px; height: 14px; margin: -6px 0; border-radius: 7px; background: {t.bg}; border: 2px solid {t.text}; }}
QScrollBar:vertical, QScrollBar:horizontal {{ background: transparent; width: 10px; height: 10px; }}
QScrollBar::handle {{ background: {c('line-2')}; border-radius: 5px; min-height: 24px; min-width: 24px; }}
QScrollBar::add-line, QScrollBar::sub-line {{ width: 0; height: 0; }}
QGroupBox {{ border: {bw}px solid {c('line-2')}; border-radius: {r}px; margin-top: 14px; padding: 12px; }}
QGroupBox::title {{ subcontrol-origin: margin; left: 10px; color: {t.muted}; }}
QListView, QTreeView, QTableView {{ background: {c('surface')}; border: {bw}px solid {c('line-2')}; border-radius: {rs}px; alternate-background-color: {c('surface-2')}; }}
QHeaderView::section {{ background: {c('surface-2')}; color: {t.muted}; border: none; padding: 6px; }}
QToolTip {{ background: {t.text}; color: {t.bg}; border: none; padding: 5px 8px; }}
""".strip()


def _qss_primary(t: Theme) -> str:
    """Translate the theme's button recipe into Qt gradients where Qt can express it."""
    b, a, a2 = t.style.get("button"), t.solid("accent"), t.solid("accent_2")
    lin = lambda stops: "qlineargradient(x1:0, y1:0, x2:0, y2:1, " + ", ".join(f"stop:{p} {c}" for p, c in stops) + ")"
    if b == "metal":
        g = lin([(0, _mix(a, "#ffffff", .55)), (.45, _mix(a, "#ffffff", .15)), (.55, _mix(a, "#000000", .25)), (1, _mix(a, "#ffffff", .1))])
        return f'QPushButton[primary="true"] {{ background: {g}; color: #ffffff; border: 1px solid {_mix(a, "#000000", .4)}; }}'
    if b == "chrome":
        return f'QPushButton[primary="true"] {{ background: {lin([(0, "#ffffff"), (.45, "#d7dbe2"), (.52, "#8b929c"), (1, "#e9ecf1")])}; color: #1b1f26; border: 1px solid #8b929c; }}'
    if b == "pearl":
        g = "qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #ffffff, stop:.3 #f2e6ff, stop:.55 #e2f5ff, stop:.8 #fff5e1, stop:1 #ffffff)"
        return f'QPushButton[primary="true"] {{ background: {g}; color: #3a2f5a; border: 1px solid #d9cfee; }}'
    if b == "gradient":
        return f'QPushButton[primary="true"] {{ background: qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 {a}, stop:1 {a2}); color: #ffffff; border: none; }}'
    if b == "gold":
        return f'QPushButton[primary="true"] {{ background: {lin([(0, "#fff3c4"), (.4, "#e6c25a"), (.52, "#9a6f12"), (.66, "#d8b04a"), (1, "#fff0b8")])}; color: #3a2600; border: 1px solid #9a6f12; }}'
    if b in ("candy", "gel"):
        g = lin([(0, _mix(a, "#ffffff", .45)), (.49, _mix(a, "#ffffff", .15)), (.51, a), (1, _mix(a, "#ffffff", .3))])
        return f'QPushButton[primary="true"] {{ background: {g}; border: 1px solid {_mix(a, "#000000", .25)}; }}'
    if b == "holo":
        g = "qlineargradient(x1:0, y1:0, x2:1, y2:1, stop:0 #ff9ae6, stop:.33 #9ad3ff, stop:.66 #b8ff9a, stop:1 #fff59a)"
        return f'QPushButton[primary="true"] {{ background: {g}; color: #1d1d2b; border: none; }}'
    if b in ("hard", "3d", "duo", "pixel"):
        return f'QPushButton[primary="true"] {{ background: {a}; border: 2px solid {t.solid("text")}; border-bottom-width: 5px; }}'
    if b in ("outline", "neon", "stamp"):
        return f'QPushButton[primary="true"] {{ background: transparent; color: {a}; border: 2px solid {a}; }}'
    return ""


def apply_qt(app, t=None, font_size=14, parts: dict | None = None, kit: str | None = None):
    """app.setStyleSheet(qss(t, parts=, kit=)) — works with PySide6, PyQt6 and PyQt5."""
    app.setStyleSheet(qss(t, font_size, parts, kit))
    return app


# ── Tkinter / ttk ────────────────────────────────────────────────────────────
def apply_tk(root, t=None, font_size=11, parts: dict | None = None, kit: str | None = None):
    """Style a Tk root with ttk ('clam' base). Use style='Accent.TButton' for primary buttons.
    parts=/kit= add element designs (as close as ttk can draw). Returns the ttk.Style so you can tweak it further."""
    import tkinter.font as tkfont
    from tkinter import ttk
    t, mix = _resolve(t, parts, kit); s = t.solid
    fams = set(tkfont.families(root))
    default = tkfont.nametofont("TkDefaultFont").actual("family")
    pick = lambda *names: next((n for n in names if n in fams), default)
    body = (pick(t.font, "Inter", "Cantarell", "Segoe UI", "Helvetica", "DejaVu Sans"), font_size)
    head = (pick(t.font_head, t.font, "Georgia", "DejaVu Serif"), font_size * 2)
    st = ttk.Style(root); st.theme_use("clam")
    root.configure(bg=s("bg"))
    st.configure(".", background=s("bg"), foreground=s("text"), fieldbackground=s("surface"), bordercolor=s("line-2"),
                 lightcolor=s("bg"), darkcolor=s("bg"), troughcolor=s("line"), focuscolor=s("accent"),
                 selectbackground=s("accent"), selectforeground=s("bg"), font=body, insertcolor=s("text"))
    st.configure("TFrame", background=s("bg"))
    st.configure("Card.TFrame", background=s("surface"), relief="solid", borderwidth=max(1, int(t.border)))
    st.configure("TLabel", background=s("bg"), foreground=s("text"))
    st.configure("Card.TLabel", background=s("surface"))
    st.configure("Muted.TLabel", foreground=s("muted"))
    st.configure("Heading.TLabel", font=head)
    st.configure("TButton", background=s("surface-2"), foreground=s("text"), borderwidth=max(1, int(t.border)), padding=(14, 7), relief="flat")
    st.map("TButton", background=[("pressed", s("surface-3")), ("active", s("surface-3"))], bordercolor=[("active", s("text"))])
    primary_bg = s("accent") if t.dark else s("text")
    st.configure("Accent.TButton", background=primary_bg, foreground=s("bg"), bordercolor=primary_bg)
    st.map("Accent.TButton", background=[("pressed", s("accent-2")), ("active", s("accent"))], foreground=[("active", "#ffffff" if not t.dark else s("bg"))])
    st.configure("TEntry", fieldbackground=s("surface"), padding=6, bordercolor=s("line-2"))
    st.map("TEntry", bordercolor=[("focus", s("accent"))], lightcolor=[("focus", s("accent"))])
    st.configure("TCombobox", fieldbackground=s("surface"), background=s("surface-2"), arrowcolor=s("text"), foreground=s("text"))
    st.map("TCombobox", fieldbackground=[("readonly", s("surface"))], foreground=[("readonly", s("text"))], selectbackground=[("readonly", s("surface"))], selectforeground=[("readonly", s("text"))])
    root.option_add("*TCombobox*Listbox.background", s("surface")); root.option_add("*TCombobox*Listbox.foreground", s("text"))
    for w in ("TCheckbutton", "TRadiobutton"):
        st.configure(w, background=s("bg"), indicatorbackground=s("surface"), indicatorforeground=s("bg"))
        st.map(w, indicatorbackground=[("selected", s("accent"))], background=[("active", s("bg"))])
    st.configure("TNotebook", background=s("bg"), borderwidth=0, tabmargins=0)
    st.configure("TNotebook.Tab", background=s("bg"), foreground=s("muted"), padding=(14, 6), borderwidth=0)
    st.map("TNotebook.Tab", background=[("selected", s("surface"))], foreground=[("selected", s("text"))])
    st.configure("Horizontal.TProgressbar", background=s("accent"), troughcolor=s("line-2"), bordercolor=s("line-2"), thickness=6)
    st.configure("Horizontal.TScale", background=s("accent"), troughcolor=s("line-2"))
    st.configure("Treeview", background=s("surface"), fieldbackground=s("surface"), foreground=s("text"), rowheight=26)
    st.configure("Treeview.Heading", background=s("surface-2"), foreground=s("muted"), relief="flat")
    st.map("Treeview", background=[("selected", s("accent"))], foreground=[("selected", s("bg"))])
    for cls in ("Text", "Listbox", "Entry", "Label", "Button"): root.option_add(f"*{cls}.Font", body)
    root.option_add("*Text.background", s("surface")); root.option_add("*Text.foreground", s("text"))
    root.option_add("*Listbox.background", s("surface")); root.option_add("*Listbox.foreground", s("text"))
    _tk_parts(st, t, mix, body)
    return st


def _tk_parts(st, t, mix, body):
    """ttk has no gradients or radii: use the middle colour of each fill, relief for depth, bold for weight."""
    mid = lambda c: _mix(c["top"], c["bottom"], .5)
    relief = lambda a: "raised" if a["fill"] in ("bevel", "hard", "clay", "metal", "deepmetal", "chrome") else "sunken" if a["fill"] == "sunken" else "flat"
    if "btn" in mix:
        a = mix["btn"]; c = _fill(t, a["fill"]); bw = max(1, int(a["bw"]))
        f = (body[0], body[1], "bold") if a["w"] >= 700 else body
        st.configure("Accent.TButton", background=mid(c), foreground=c["text"], bordercolor=c["border"], borderwidth=bw, relief=relief(a), font=f)
        st.map("Accent.TButton", background=[("pressed", c["bottom"]), ("active", c["top"])], foreground=[("active", c["text"])])
        st.configure("TButton", borderwidth=bw, relief=relief(a) if a["fill"] in ("bevel", "hard") else "flat")
    if "input" in mix:
        a = mix["input"]; c = _fill(t, a["fill"])
        if a["fill"] not in ("outline", "underline", "ghost", "solid", "hard", "neon", "inverse"): st.configure("TEntry", fieldbackground=mid(c))
        st.configure("TEntry", bordercolor=c["border"], borderwidth=max(1, int(a["bw"])))
    if "card" in mix:
        a = mix["card"]; c = _fill(t, a["fill"])
        st.configure("Card.TFrame", relief=relief(a) if a["bw"] else "flat", borderwidth=max(0, int(a["bw"])), bordercolor=c["border"])
    if "progress" in mix:
        c = _fill(t, mix["progress"]["fill"]); st.configure("Horizontal.TProgressbar", background=mid(c), lightcolor=c["top"], darkcolor=c["bottom"])
    if "tabs" in mix:
        c = _fill(t, mix["tabs"]["fill"]); st.map("TNotebook.Tab", background=[("selected", mid(c))], foreground=[("selected", c["text"])])
    if "check" in mix:
        c = _fill(t, mix["check"]["fill"])
        for w in ("TCheckbutton", "TRadiobutton"): st.map(w, indicatorbackground=[("selected", mid(c))])
    if "range" in mix:
        c = _fill(t, mix["range"]["fill"]); st.configure("Horizontal.TScale", background=mid(c))


# ── Textual (terminal UIs) ───────────────────────────────────────────────────
def tcss(t="editorial") -> str:
    """Textual CSS. In your App: CSS = uivault.tcss("neon")."""
    t = theme(t); s = t.solid
    return f"""
Screen {{ background: {s('bg')}; color: {s('text')}; }}
Header, Footer {{ background: {s('surface-2')}; color: {s('text')}; }}
Button {{ background: {s('surface-2')}; color: {s('text')}; border: tall {s('line-2')}; }}
Button:hover {{ border: tall {s('text')}; }}
Button.-primary {{ background: {s('accent')}; color: {s('bg')}; border: tall {s('accent')}; }}
Button.-error {{ background: {s('danger')}; color: {s('bg')}; }}
Input, TextArea {{ background: {s('surface')}; border: tall {s('line-2')}; }}
Input:focus, TextArea:focus {{ border: tall {s('accent')}; }}
ProgressBar Bar > .bar--bar {{ color: {s('accent')}; }}
Switch.-on > .switch--slider {{ color: {s('accent')}; }}
DataTable > .datatable--header {{ background: {s('surface-2')}; color: {s('muted')}; }}
DataTable > .datatable--cursor {{ background: {s('accent')}; color: {s('bg')}; }}
.muted {{ color: {s('muted')}; }}
.card {{ background: {s('surface')}; border: round {s('line-2')}; padding: 1 2; }}
""".strip()


def textual_theme(t="editorial"):
    """A textual.theme.Theme (Textual ≥ 0.86): app.register_theme(...); app.theme = name."""
    from textual.theme import Theme as TTheme
    t = theme(t); s = t.solid
    return TTheme(name="uivault-" + t.name, primary=s("accent"), secondary=s("accent-2"), accent=s("accent"),
                  foreground=s("text"), background=s("bg"), surface=s("surface"), panel=s("surface-2"),
                  success=s("success"), warning=s("warn"), error=s("danger"), dark=t.dark)


# ── GTK4 / libadwaita ────────────────────────────────────────────────────────
def gtk_css(t=None, parts: dict | None = None, kit: str | None = None) -> str:
    """GTK4 / libadwaita CSS: named colours + shapes. Load with apply_gtk() or your own Gtk.CssProvider.
    parts=/kit= add element designs; GTK CSS supports gradients, radii and shadows, so it gets closest to the web."""
    if parts or kit:
        tt, mix = _resolve(t, parts, kit)
        return gtk_css(tt) + _gtk_parts(tt, mix)
    t = theme(t or "editorial"); c = t.css_rgba; rs, r = t.radius_sm, t.radius
    named = {"window_bg_color": t.bg, "window_fg_color": t.text, "view_bg_color": c("surface"), "view_fg_color": t.text,
             "card_bg_color": c("surface"), "card_fg_color": t.text, "headerbar_bg_color": t.bg, "headerbar_fg_color": t.text,
             "popover_bg_color": t.solid("surface"), "dialog_bg_color": t.solid("surface"), "sidebar_bg_color": t.solid("surface"),
             "accent_bg_color": t.accent, "accent_color": t.accent, "accent_fg_color": t.bg if t.dark else "#ffffff",
             "destructive_bg_color": t.danger, "success_color": t.success, "warning_color": t.warn, "error_color": t.danger,
             "borders": c("line-2")}
    return "\n".join(f"@define-color {k} {v};" for k, v in named.items()) + f"""
window, .background {{ background-color: {t.bg}; color: {t.text}; font-family: "{t.font}"; }}
button, entry, spinbutton, dropdown > button, combobox > box > button {{ border-radius: {rs}px; }}
button.suggested-action {{ background: {t.accent}; color: @accent_fg_color; }}
.card, list.boxed-list, .boxed-list {{ border-radius: {r}px; }}
.title-1, .title-2, .title-3 {{ font-family: "{t.font_head}"; }}
progressbar > trough > progress, levelbar block.filled, scale highlight {{ background: {t.accent}; }}
switch:checked {{ background: {t.accent}; }}
"""


def _gtk_parts(t, mix):
    out = []
    grad = lambda c: f"background-image: linear-gradient(180deg, {c['top']}, {c['bottom']}); background-color: {c['top']};"

    def rule(fam, sel, fill=True):
        a = mix.get(fam)
        if not a: return
        c = _fill(t, a["fill"])
        r = f"{sel} {{ border-radius: {min(a['r'], 999):g}px; border: {a['bw']:g}px solid {c['border']}; font-weight: {a['w']}; "
        if fill: r += grad(c) + f" color: {c['text']}; "
        if a["fill"] == "hard": r += f"box-shadow: 0 3px 0 {t.solid('text')}; "
        if a["fill"] == "neon": r += f"box-shadow: 0 0 12px -2px {c['border']}; "
        if a["fill"] in ("metal", "deepmetal", "chrome", "pearl", "gold", "clay"): r += "box-shadow: inset 0 1px rgba(255,255,255,.6), 0 2px 6px rgba(0,0,0,.25); "
        if a["fill"] == "underline": r += f"border-width: 0 0 {max(a['bw'], 1):g}px 0; border-radius: 0; "
        if a["up"]: r += "text-transform: uppercase; letter-spacing: 1px; "
        out.append(r + "}")

    rule("btn", "button.suggested-action, button.uv-primary")
    if "btn" in mix: out.append(f"button {{ border-radius: {min(mix['btn']['r'], 999):g}px; }}")
    rule("input", "entry, spinbutton", fill=False)
    rule("card", ".card, frame > border", fill=False)
    rule("modal", "window.dialog, window.messagedialog", fill=False)
    rule("tabs", "notebook > header > tabs > tab:checked, stackswitcher > button:checked")
    rule("switch", "switch:checked")
    rule("check", "check:checked, radio:checked")
    if "switch" in mix: out.append(f"switch, switch > slider {{ border-radius: {min(mix['switch']['r'], 999):g}px; }}")
    if "progress" in mix:
        c = _fill(t, mix["progress"]["fill"]); out.append(f"progressbar > trough > progress, levelbar block.filled {{ {grad(c)} border-radius: {min(mix['progress']['r'], 999):g}px; }}")
    if "range" in mix:
        c = _fill(t, mix["range"]["fill"]); out.append(f"scale highlight {{ {grad(c)} }} scale slider {{ border-radius: {min(mix['range']['r'], 999):g}px; }}")
    if "badge" in mix: rule("badge", ".uv-badge, .tag")
    if "head" in mix: out.append(f".title-1, .title-2 {{ color: {_fill(t, mix['head']['fill'])['top'] if mix['head']['fill'] not in ('flat', 'outline', 'sunken', 'soft') else t.text}; }}")
    if "bg" in mix and mix["bg"]["fill"] not in ("flat",):
        c = _fill(t, mix["bg"]["fill"]); out.append(f"window.background {{ background-image: linear-gradient(180deg, {_mix(c['top'], t.solid('bg'), .8)}, {t.solid('bg')}); }}")
    return "\n" + "\n".join(out) + "\n"


def apply_gtk(t=None, display=None, parts: dict | None = None, kit: str | None = None):
    """Load gtk_css(t, parts=, kit=) for the whole display (call after Gtk.init / in your Adw.Application activate)."""
    import gi
    gi.require_version("Gtk", "4.0")
    from gi.repository import Gdk, Gtk
    p = Gtk.CssProvider()
    css_text = gtk_css(t, parts, kit)
    (p.load_from_string(css_text) if hasattr(p, "load_from_string") else p.load_from_data(css_text.encode()))
    Gtk.StyleContext.add_provider_for_display(display or Gdk.Display.get_default(), p, Gtk.STYLE_PROVIDER_PRIORITY_APPLICATION)
    return p


# ── Dear PyGui ───────────────────────────────────────────────────────────────
def dearpygui_theme(t="editorial"):
    """Create and return a Dear PyGui theme id: dpg.bind_theme(uivault.dearpygui_theme("neon"))."""
    import dearpygui.dearpygui as dpg
    t = theme(t); s = lambda k: tuple(int(t.solid(k)[i:i + 2], 16) for i in (1, 3, 5))
    with dpg.theme() as th:
        with dpg.theme_component(dpg.mvAll):
            C = dpg.add_theme_color; S = dpg.add_theme_style
            for col, key in [(dpg.mvThemeCol_WindowBg, "bg"), (dpg.mvThemeCol_ChildBg, "bg"), (dpg.mvThemeCol_PopupBg, "surface"),
                             (dpg.mvThemeCol_Text, "text"), (dpg.mvThemeCol_TextDisabled, "dim"), (dpg.mvThemeCol_Border, "line-2"),
                             (dpg.mvThemeCol_FrameBg, "surface"), (dpg.mvThemeCol_FrameBgHovered, "surface-2"), (dpg.mvThemeCol_FrameBgActive, "surface-3"),
                             (dpg.mvThemeCol_TitleBg, "surface-2"), (dpg.mvThemeCol_TitleBgActive, "surface-2"), (dpg.mvThemeCol_MenuBarBg, "surface"),
                             (dpg.mvThemeCol_Button, "surface-2"), (dpg.mvThemeCol_ButtonHovered, "surface-3"), (dpg.mvThemeCol_ButtonActive, "accent"),
                             (dpg.mvThemeCol_Header, "surface-2"), (dpg.mvThemeCol_HeaderHovered, "surface-3"), (dpg.mvThemeCol_HeaderActive, "accent"),
                             (dpg.mvThemeCol_CheckMark, "accent"), (dpg.mvThemeCol_SliderGrab, "accent"), (dpg.mvThemeCol_SliderGrabActive, "accent-2"),
                             (dpg.mvThemeCol_Tab, "surface"), (dpg.mvThemeCol_TabHovered, "surface-3"), (dpg.mvThemeCol_TabActive, "accent"),
                             (dpg.mvThemeCol_PlotHistogram, "accent"), (dpg.mvThemeCol_PlotLines, "accent"), (dpg.mvThemeCol_ScrollbarGrab, "line-2")]:
                C(col, s(key))
            for sty in (dpg.mvStyleVar_FrameRounding, dpg.mvStyleVar_GrabRounding, dpg.mvStyleVar_TabRounding):
                S(sty, t.radius_sm)
            S(dpg.mvStyleVar_WindowRounding, t.radius); S(dpg.mvStyleVar_ChildRounding, t.radius)
            S(dpg.mvStyleVar_FrameBorderSize, t.border); S(dpg.mvStyleVar_FramePadding, 10, 6); S(dpg.mvStyleVar_ItemSpacing, 10, 8)
    return th


# ── matplotlib ───────────────────────────────────────────────────────────────
def matplotlib_rc(t="editorial") -> dict:
    """rcParams for charts that match the theme: plt.rcParams.update(uivault.matplotlib_rc("swiss"))."""
    t = theme(t); s = t.solid
    cycle = [s("accent"), s("text"), s("accent-2"), s("muted"), s("success"), s("info") if "info" in t.colors else s("dim")]
    return {"figure.facecolor": s("bg"), "axes.facecolor": s("bg"), "savefig.facecolor": s("bg"), "axes.edgecolor": s("line-2"),
            "axes.labelcolor": s("muted"), "text.color": s("text"), "xtick.color": s("muted"), "ytick.color": s("muted"),
            "grid.color": s("line"), "axes.grid": True, "grid.linewidth": .6, "axes.spines.top": False, "axes.spines.right": False,
            "axes.prop_cycle": __import__("cycler").cycler(color=cycle) if _has("cycler") else None,
            "font.family": "sans-serif", "font.sans-serif": [t.font, "DejaVu Sans"], "lines.linewidth": 2}


def apply_matplotlib(t="editorial"):
    import matplotlib.pyplot as plt
    plt.rcParams.update({k: v for k, v in matplotlib_rc(t).items() if v is not None})


# ── Rich (terminal output) ───────────────────────────────────────────────────
def rich_theme(t="editorial"):
    """A rich.theme.Theme with styles: accent, muted, success, warn, danger. Console(theme=uivault.rich_theme("neon"))."""
    from rich.theme import Theme as RTheme
    t = theme(t); s = t.solid
    return RTheme({"accent": f"bold {s('accent')}", "muted": s("muted"), "success": s("success"), "warn": s("warn"),
                   "danger": f"bold {s('danger')}", "heading": f"bold {s('text')}", "repr.number": s("accent")})


def _has(mod):
    import importlib.util
    return importlib.util.find_spec(mod) is not None
