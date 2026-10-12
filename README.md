# UI Vault

A curated vault of open-source UI resources: component kits, copy-paste blocks, motion, effects, post-processing, 3D, icons, logos, fonts, color, charts and native/game UI. It also has live, copy-ready snippets.

- **Library**: 180+ links with search, category tabs and favorites (saved in your browser)
- **Playground**: 28 zero-dependency HTML/CSS snippets (tabs, buttons, cards, text effects, inputs, loaders, backgrounds, toasts)
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
Snippets go in `assets/js/demos.js` as `{ group, title, html, css, js? }`.

## License
MIT for this site's code. Each listed project keeps its own license.
