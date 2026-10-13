# UiVault3

The UI Vault designs as **real, custom-painted widgets**. They're painted from the exact gradients, borders, shadows and
animations the website uses, so they aren't Qt-stylesheet approximations. It comes in two forms:

* **PySide6**: `pip install "git+https://github.com/thenameiscobmarley/ui-vault#subdirectory=uivault3"`
* **Qt 6 C++**: `uivault3.h` + `uivault3.cpp` (see `cpp/`), with the same class names

```python
from PySide6.QtWidgets import QApplication, QVBoxLayout
import uivault3 as uv

app = QApplication([])
uv.apply(app, kit="deep-metal")                       # theme + one design per element
win = uv.Surface(); lay = QVBoxLayout(win)
lay.addWidget(uv.Heading("Hello", 44))
lay.addWidget(uv.Button("Save", primary=True))
lay.addWidget(uv.Switch("Notifications", True))
uv.apply(app, parts={"btn": "pearl", "card": "glass"}, layers={"btn": {"glow": {"o": "neon", "s": 18}, "hover": {"o": "jelly"}}})
win.show(); app.exec()
```

* **Widgets:** Button, Card, LineEdit, Switch, CheckBox, RadioButton, Slider, TabBar, ProgressBar, Spinner, Badge, Alert, Heading, NavBar, Surface, Dialog.
* **Themes:** all 87 web themes, via `uv.themes()`.
* **Designs:** the 273 element designs, via `uv.parts("btn")`.
* **Kits:** 18, via `uv.kits()`.
* **Effect layers:** glow, shadow, border rings, fills, shapes, text, hover and press motion, entrance and idle animation.
* **Loading a site export:** `uv.load("my-style.json")` applies a style exported from the site's inspector or Library.
* **Gallery:** `python -m uivault3 --kit pearl` opens a gallery of every widget.

Web-only for now: backdrop blur behind a widget, cursor and canvas page effects, and the `uv-fx-*` CSS effects.
