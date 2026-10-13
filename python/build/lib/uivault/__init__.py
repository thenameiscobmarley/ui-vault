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

No dependencies; each toolkit is imported only when you call its function. MIT.
"""
from __future__ import annotations

import json
from pathlib import Path

__version__ = "3.0.0"
__all__ = ["theme", "themes", "Theme", "css", "qss", "apply_qt", "apply_tk", "tcss", "textual_theme", "gtk_css",
           "apply_gtk", "dearpygui_theme", "matplotlib_rc", "apply_matplotlib", "rich_theme"]

_DATA = json.loads((Path(__file__).with_name("tokens.json")).read_text())


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


def themes() -> list[str]:
    """Names of all themes."""
    return list(_DATA["themes"])


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
def qss(t="editorial", font_size=14) -> str:
    """A complete Qt stylesheet. Mark a primary button with button.setProperty("primary", True)."""
    t = theme(t); r, rs, bw = t.radius, t.radius_sm, max(1, int(t.border))
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


def apply_qt(app, t="editorial", font_size=14):
    """app.setStyleSheet(qss(t)) — works with PySide6, PyQt6 and PyQt5."""
    app.setStyleSheet(qss(t, font_size))
    return app


# ── Tkinter / ttk ────────────────────────────────────────────────────────────
def apply_tk(root, t="editorial", font_size=11):
    """Style a Tk root with ttk ('clam' base). Use style='Accent.TButton' for primary buttons.
    Returns the ttk.Style so you can tweak it further."""
    import tkinter.font as tkfont
    from tkinter import ttk
    t = theme(t); s = t.solid
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
    return st


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
def gtk_css(t="editorial") -> str:
    """GTK4 / libadwaita CSS: named colours + shapes. Load with apply_gtk() or your own Gtk.CssProvider."""
    t = theme(t); c = t.css_rgba; rs, r = t.radius_sm, t.radius
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


def apply_gtk(t="editorial", display=None):
    """Load gtk_css(t) for the whole display (call after Gtk.init / in your Adw.Application activate)."""
    import gi
    gi.require_version("Gtk", "4.0")
    from gi.repository import Gdk, Gtk
    p = Gtk.CssProvider()
    css_text = gtk_css(t)
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
