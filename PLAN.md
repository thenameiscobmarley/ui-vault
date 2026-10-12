# UI Vault v2 plan (resume here)

Goal: turn UI Vault into a real UI library ("the API") + lots of cool things built with it.
Each step is committed + pushed when done, so `git log` shows progress too.

- [x] 1. `lib/uivault.css` — design tokens + components (uv-btn variants, uv-card, uv-tabs, uv-input, uv-switch, uv-badge, uv-avatar, uv-progress, uv-ring, uv-kbd, uv-tooltip, uv-glass, uv-grad-text, uv-marquee, uv-skeleton, uv-dock, uv-accordion, backgrounds)
- [x] 2. `lib/uivault.js` — `UV` API: toast, confetti, tilt, magnetic, spotlight, ripple, countUp, typewriter, scramble, reveal, tabs, parallax, sound(click), copy, modal, cmdk palette, auto-init via data-uv attributes
- [x] 3. `docs.html` — API reference with a live example + code for every component/function
- [x] 4. `showcase.html` — 20+ composed pieces made ONLY with the library (pricing, login, dashboard, music player, game HUD, profile, chat, settings, hero sections, notifications, file upload, stats, timeline, cmd palette...)
- [ ] 5. Add 20+ new Playground snippets to `assets/js/demos.js`
- [~] 6. (nav+hero+promo done; README pending) Link Docs/Showcase in index.html nav + hero CTA, update README, push, verify Pages

Rules: keep it static (no build), light on the GPU (UHD 600), dark+light themes.
