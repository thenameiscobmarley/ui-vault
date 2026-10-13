# UI Vault

**→ [Quick start](https://thenameiscobmarley.github.io/ui-vault/quickstart.html)** · [Themes (87)](https://thenameiscobmarley.github.io/ui-vault/themes.html) · [Elements (273)](https://thenameiscobmarley.github.io/ui-vault/elements.html) · [Test page](https://thenameiscobmarley.github.io/ui-vault/lab.html) · [Python & C++](https://thenameiscobmarley.github.io/ui-vault/code.html) · [Docs](https://thenameiscobmarley.github.io/ui-vault/docs.html) · [Download .zip](https://thenameiscobmarley.github.io/ui-vault/downloads/uivault-latest.zip)


A curated vault of open-source UI resources: component kits, copy-paste blocks, motion, effects, post-processing, 3D, icons, logos, fonts, color, charts and native/game UI. It also has live, copy-ready snippets.

- **Themes** (`themes.html`): 87 complete design styles (12 core + 50 regular + 25 signature, e.g. pearl, sapphire-metal, fade, doppler, case-hardened) covering buttons, headings, cards, hover motion and backgrounds; gallery with categories, full component preview, web/Python/C++ code, and a theme builder. A floating theme picker on every page tries any style live. Themes are generated from `tools/theme_specs.py` (keep `assets/js/theme-engine.js` in sync).
- **Elements** (`elements.html`) and **Test page** (`lab.html`): 273 element designs in 15 families, picked per family with `data-uv-<family>="name"` on `<html>` or any element (nearest wins), plus 18 kits (a theme + one design per family). Generated from `tools/parts_specs.py` into `lib/css/parts/*.css`; the floating picker's Elements tab applies a mix site-wide. Python: `uivault.qss(kit="deep-metal")`, `parts={"btn": "pearl"}`; C++: `uivault::findKit`, `qss(theme, kit)`, `imgui::apply(theme, kit)`.
- **Waterfall** (`lib/js/waterfall.js`): procedural, blurred WebGL waterfall background on the homepage and Quick start.
- **Code APIs** (`code.html`): the same 12 themes for **Python** (`python/`: Qt, Tkinter, Textual, GTK4, Dear PyGui, matplotlib, Rich, CLI) and **C++** (`cpp/uivault.hpp`: Dear ImGui, JUCE, raygui, Qt). `pip install "git+https://github.com/thenameiscobmarley/ui-vault#subdirectory=python"`
- **Quick start** (`quickstart.html`): 3-step setup, zip download, module table, 12-theme gallery, mix-and-match playground, 70+ effect gallery, custom bundle builder
- **UV library (`lib/`)**: modular (`lib/css/*`, `lib/css/themes/*`, `lib/js/*`) or bundled (`uivault.css` / `uivault.js`). 12 scoped themes, 60+ `uv-fx-*` CSS effects, 13 JS effects. Rebuild bundles, zips, tokens, the Python tokens and the C++ header with `python3 tools/build.py`. Scroll API: `data-uv-scrub` (sets `--p`), `data-uv-speed`, `UV.steps()`, `.uv-scrollbar`. Older summary: `uivault.css` + `uivault.js`, 40+ components and a `UV.*` JS API (toast, modal, ⌘K palette, confetti, tilt, magnetic, count-up, typewriter, scramble, reveal, tabs, sounds). See `docs.html`
- **Blocks** (`blocks.html`): 41 responsive page sections (navbars, heroes, features, testimonials, FAQ, footers, app screens) with desktop/tablet/mobile and light/dark preview
- **Showcase** (`showcase.html`): 30 interface pieces built only with the library (login, music player, game HUD, dashboard, chat, onboarding, and more)
- **Library**: 270+ links with search, category tabs and favorites (saved in your browser)
- **Playground**: 100 zero-dependency HTML/CSS snippets (tabs, buttons, cards, text effects, inputs, loaders, backgrounds, toasts)
- **Post-FX Lab**: a real WebGL post pass (bloom, chromatic aberration, vignette, grain, scanlines, CRT). You can load your own image and copy the GLSL
- **Logo Forge**: build a gradient logo and download it as SVG
- **Flow** (`/app`): a focus-timer app built with the same techniques

Plain static files with no build step.

## Run locally
Open `index.html`, or run `python3 -m http.server` and go to http://localhost:8000. Clipboard copy works best over http.

## Publish on GitHub Pages
```sh
gh repo create ui-vault --public --source . --push
gh api -X POST repos/{owner}/ui-vault/pages -f "source[branch]=main" -f "source[path]=/"
```
The site will be at `https://<you>.github.io/ui-vault/`.

## Add a resource
Append a row to `assets/js/resources.js`:
```js
["Name", "https://url", "category", "License", "One-line description.", ["tag", "tag"]],
```
Snippets go in `assets/js/demos.js` or `demos2.js` as `{ group, title, html, css, js? }`.

## License
MIT for this site's code. Each listed project keeps its own license.
