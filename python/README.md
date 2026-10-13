# uivault (Python)

The 12 UI Vault design themes for Python desktop and terminal UIs. No dependencies.

```sh
pip install "git+https://github.com/thenameiscobmarley/ui-vault#subdirectory=python"
python -m uivault list          # all themes
python -m uivault show neon     # colour swatches in your terminal
python -m uivault demo brutal   # Tkinter demo window
```

```python
import uivault
uivault.apply_qt(app, "neon")            # PySide6 / PyQt
uivault.apply_tk(root, "brutal")         # Tkinter / ttk
CSS = uivault.tcss("terminal")           # Textual
uivault.apply_gtk("luxe")                # GTK4 / libadwaita
dpg.bind_theme(uivault.dearpygui_theme("soft"))   # Dear PyGui
uivault.apply_matplotlib("swiss")        # charts
Console(theme=uivault.rich_theme("y2k")) # Rich
```

Docs: https://thenameiscobmarley.github.io/ui-vault/code.html · MIT
