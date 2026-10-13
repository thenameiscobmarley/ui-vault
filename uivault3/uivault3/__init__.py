"""UiVault3 — the UI Vault designs as real, custom-painted PySide6 widgets (no stylesheet approximations).

    from PySide6.QtWidgets import QApplication
    import uivault3 as uv

    app = QApplication([])
    uv.apply(app, kit="deep-metal")                      # or theme="neon", parts={"btn": "pearl"}, layers={...}
    win = uv.Surface()                                   # page background
    btn = uv.Button("Save", primary=True)                # every widget follows uv.apply() live
    uv.apply(app, parts={"btn": "chrome", "card": "glass"})

Widgets: Button, Card, LineEdit, Switch, CheckBox, RadioButton, Slider, TabBar, ProgressBar, Spinner, Badge, Alert,
Heading, NavBar, Surface, Dialog. Same names as the C++ library (uivault3.h). Designs, kits and effect layers are the
exact data the website uses: uv.parts("btn"), uv.kits(), uv.load("my-style.json") (exported from the site's inspector).
"""
from __future__ import annotations

import json
from pathlib import Path

from .style import FAMILIES, KITS, LAYERS, NATIVE, STYLE, TOKENS
from .widgets import (Alert, Badge, Button, Card, CheckBox, Dialog, Heading, LineEdit, NavBar, ProgressBar, RadioButton, Slider, Spinner,
                      Surface, Switch, TabBar)

__version__ = "1.0.0"
__all__ = ["apply", "load", "themes", "parts", "kits", "families", "style", "Alert", "Badge", "Button", "Card", "CheckBox", "Dialog", "Heading",
           "LineEdit", "NavBar", "ProgressBar", "RadioButton", "Slider", "Spinner", "Surface", "Switch", "TabBar"]


def themes() -> list[str]: return list(TOKENS)
def families() -> list[str]: return list(FAMILIES)
def parts(family: str) -> list[str]: return list(NATIVE["families"][family]["parts"])
def kits() -> list[str]: return list(KITS)
def style(): return STYLE


def apply(app=None, theme: str | None = None, kit: str | None = None, parts: dict | None = None, layers: dict | None = None, font_size: int = 14):
    """Set the global look. Every UiVault3 widget restyles immediately; plain Qt widgets get a matching palette."""
    STYLE.set(theme=theme, parts=parts, kit=kit, layers=layers)
    if app is not None:
        from PySide6.QtGui import QFont, QPalette
        pal = app.palette(); c = STYLE.color
        for role, tok in ((QPalette.Window, "bg"), (QPalette.WindowText, "text"), (QPalette.Base, "surface"), (QPalette.AlternateBase, "surface-2"),
                          (QPalette.Text, "text"), (QPalette.Button, "surface-2"), (QPalette.ButtonText, "text"), (QPalette.Highlight, "accent"),
                          (QPalette.PlaceholderText, "muted"), (QPalette.ToolTipBase, "text"), (QPalette.ToolTipText, "bg")):
            pal.setColor(role, c(tok))
        app.setPalette(pal)
        f = QFont(STYLE.font_family()); f.setPixelSize(font_size); app.setFont(f)
    return STYLE


def load(config, app=None):
    """Apply a style exported from the website (Library → Export, or the inspector): a path, JSON text or dict
    with keys theme, parts, layers."""
    if isinstance(config, (str, Path)) and Path(str(config)).exists(): config = json.loads(Path(config).read_text())
    elif isinstance(config, str): config = json.loads(config)
    layers = {k: v for k, v in (config.get("layers") or {}).items() if k != "@el"}
    return apply(app, theme=config.get("theme") or None, parts=config.get("parts") or {}, layers=layers)
