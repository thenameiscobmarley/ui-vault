# UI Vault v2 plan (resume here)

Goal: turn UI Vault into a real UI library ("the API") + lots of cool things built with it.
Each step is committed + pushed when done, so `git log` shows progress too.

- [x] 1. `lib/uivault.css` — design tokens + components (uv-btn variants, uv-card, uv-tabs, uv-input, uv-switch, uv-badge, uv-avatar, uv-progress, uv-ring, uv-kbd, uv-tooltip, uv-glass, uv-grad-text, uv-marquee, uv-skeleton, uv-dock, uv-accordion, backgrounds)
- [x] 2. `lib/uivault.js` — `UV` API: toast, confetti, tilt, magnetic, spotlight, ripple, countUp, typewriter, scramble, reveal, tabs, parallax, sound(click), copy, modal, cmdk palette, auto-init via data-uv attributes
- [x] 3. `docs.html` — API reference with a live example + code for every component/function
- [x] 4. `showcase.html` — 20+ composed pieces made ONLY with the library (pricing, login, dashboard, music player, game HUD, profile, chat, settings, hero sections, notifications, file upload, stats, timeline, cmd palette...)
- [x] 5. Add 20+ new Playground snippets to `assets/js/demos.js`
- [x] 6. Link Docs/Showcase in index.html nav + hero CTA, update README, push, verify Pages

Rules: keep it static (no build), light on the GPU (UHD 600), dark+light themes.

Status: ALL DONE (v2 shipped). Ideas for v3: more showcase pieces, npm/CDN package, React wrappers.

# v3 — "less AI, more designed" restyle (resume here)
Direction: editorial/technical. Paper bg #f4f2ee, ink #1a1917, ONE accent signal-orange #ff4f00.
Fonts: Instrument Serif (display) + Geist (UI) + Geist Mono (labels). Radius 4–6px, hairline rules,
no glows, no gradient text, no emoji, no aurora blobs, no hype copy. Light default, dark optional.
- [x] A. site.css + index.html (homepage: tokens, hero copy, brand mark, sections)
- [x] B. lib/uivault.css tokens/components (flatten grads/glows, new fonts) — drives docs+showcase
- [x] C. showcase.html cleanup (strip emoji + hardcoded neon gradients, calmer copy)
- [x] D. docs.html copy/fonts
- [x] E. app/ (Flow) restyle to match
- [x] F. Playground stage frame + demo snippet colors toned to the palette

v3 status: ALL DONE (A–F). Next ideas: hero specimen column on homepage, Post-FX scene recolor, Pulse (Python app) restyle to match.

# v4 — "10x more, 10x better" (resume here)
- [x] A. blocks.html + assets/js/blocks.js + assets/css/blocks.css — 40 full-page section templates (navbars, heroes, logos, features, stats, testimonials, pricing, CTA, FAQ, team, blog, footers) with desktop/tablet/mobile preview (container queries) + Copy HTML
- [ ] B. assets/js/demos3.js — 40 more playground snippets (→100)
- [ ] C. Homepage: hero specimen column, playground search + paper/ink stage toggle, Blocks in nav
- [ ] D. assets/js/resources2.js — 60+ more resources (→250)
- [ ] E. Link everything, README, push, verify live
