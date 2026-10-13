"""Gallery of every UiVault3 widget with live theme / kit / per-element design pickers."""
from __future__ import annotations

from PySide6.QtCore import Qt
from PySide6.QtWidgets import QApplication, QComboBox, QGridLayout, QHBoxLayout, QLabel, QScrollArea, QVBoxLayout, QWidget

import uivault3 as uv


def build() -> QWidget:
    root = uv.Surface()
    outer = QVBoxLayout(root); outer.setContentsMargins(24, 18, 24, 18)
    bar = QHBoxLayout(); outer.addLayout(bar)
    bar.addWidget(uv.Heading("UiVault3", 40)); bar.addStretch(1)
    theme = QComboBox(); theme.addItems(uv.themes()); theme.setCurrentText(uv.style().theme)
    kit = QComboBox(); kit.addItems(["(no kit)"] + uv.kits())
    bar.addWidget(QLabel("Theme")); bar.addWidget(theme); bar.addWidget(QLabel("Kit")); bar.addWidget(kit)
    theme.currentTextChanged.connect(lambda t: uv.apply(QApplication.instance(), theme=t, parts=uv.style().parts))
    kit.currentTextChanged.connect(lambda k: uv.apply(QApplication.instance(), kit=None if k.startswith("(") else k, parts=None if not k.startswith("(") else {}))

    grid = QGridLayout(); outer.addLayout(grid); grid.setHorizontalSpacing(18); grid.setVerticalSpacing(6)
    nav = uv.NavBar(["Home", "Projects", "Team", "Settings"]); grid.addWidget(nav, 0, 0, 1, 2)
    tabs = uv.TabBar(["Overview", "Activity", "Settings"]); grid.addWidget(tabs, 0, 2)
    row = QHBoxLayout(); [row.addWidget(w) for w in (uv.Button("Primary", primary=True), uv.Button("Secondary"), uv.Button("Small", True, "sm"))]; row.addStretch(1)
    grid.addLayout(row, 1, 0, 1, 2)
    badges = QHBoxLayout(); [badges.addWidget(uv.Badge(t, k)) for t, k in (("New", "accent"), ("Live", "success"), ("Beta", "warn"), ("3 issues", "danger"))]; badges.addStretch(1)
    grid.addLayout(badges, 1, 2)
    card = uv.Card(); card.layout().addWidget(QLabel("<b>Weekly report</b>")); card.layout().addWidget(QLabel("12 new sign-ups and 3 issues closed."))
    card.layout().addWidget(uv.ProgressBar(68)); grid.addWidget(card, 2, 0)
    form = QVBoxLayout(); form.addWidget(uv.LineEdit(placeholder="you@example.com")); form.addWidget(uv.Slider(62))
    sw = QHBoxLayout(); sw.addWidget(uv.Switch("Notifications", True)); sw.addWidget(uv.Switch("Auto-update")); form.addLayout(sw)
    ck = QHBoxLayout(); ck.addWidget(uv.CheckBox("Remember me", True)); ck.addWidget(uv.RadioButton("Daily", True)); ck.addWidget(uv.RadioButton("Weekly")); form.addLayout(ck)
    grid.addLayout(form, 2, 1)
    side = QVBoxLayout(); side.addWidget(uv.Alert("Saved. Your changes are live.", "success")); side.addWidget(uv.Alert("Upload failed, try again", "danger", toast=True))
    sp = QHBoxLayout(); sp.addWidget(uv.Spinner(28)); sp.addWidget(uv.Spinner(40)); sp.addStretch(1); side.addLayout(sp)
    grid.addLayout(side, 2, 2)
    outer.addStretch(1)
    return root


def main(argv=()):
    argv = list(argv)
    opt = lambda k: argv[argv.index(k) + 1] if k in argv and argv.index(k) + 1 < len(argv) else None
    app = QApplication.instance() or QApplication([])
    uv.apply(app, theme=opt("--theme"), kit=opt("--kit"), parts=dict(x.split("=") for x in (opt("--parts") or "").split(",") if "=" in x) or None)
    w = build(); w.resize(1180, 640); w.setWindowTitle("UiVault3 gallery")
    if opt("--shot"):
        w.show(); app.processEvents(); w.grab().save(opt("--shot")); return
    w.show(); app.exec()
