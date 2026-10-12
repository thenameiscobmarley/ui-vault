# UI Vault

A curated vault of open-source UI resources: component kits, copy-paste blocks, motion, effects, post-processing, 3D, icons, logos, fonts, color, charts and native/game UI. It also has live, copy-ready snippets.

- **Quick start** (`quickstart.html`): 3-step setup, zip download, module table, 12-theme gallery, mix-and-match playground, 70+ effect gallery, custom bundle builder
- **UV library (`lib/`)**: modular (`lib/css/*`, `lib/css/themes/*`, `lib/js/*`) or bundled (`uivault.css` / `uivault.js`). 12 scoped themes, 60+ `uv-fx-*` CSS effects, 13 JS effects. Rebuild bundles + zip with `python3 tools/build.py`. Older summary: `uivault.css` + `uivault.js`, 40+ components and a `UV.*` JS API (toast, modal, ⌘K palette, confetti, tilt, magnetic, count-up, typewriter, scramble, reveal, tabs, sounds). See `docs.html`
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
