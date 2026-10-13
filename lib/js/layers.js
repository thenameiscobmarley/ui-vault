/*! UI Vault 3.1.0 · layers.js — stackable effect layers (glow, shadow, border, backdrop, fill, shape, text, hover,
 *  press, entrance, idle, every uv-fx effect, page backgrounds/cursor/scroll) on any element type or a single element.
 *  UV.layers.apply({ btn: { glow: { o: "neon", c: "accent", s: 18 }, hover: { o: "jelly" } }, page: { canvas: { o: "starfield" } } })
 *  UV.layers.css(stack) → the static CSS (for exporting). Needs core.js; uses motion/feedback/fx when present. MIT */
(function (UV) {
  "use strict";
  const DEFS = {"kinds": [{"key": "glow", "label": "Glow", "params": ["c", "s"], "defaults": {"c": "accent", "s": 18}, "options": [{"name": "soft", "label": "Soft", "drop": [[0, 0, "s", "c@55"]]}, {"name": "neon", "label": "Neon", "drop": [[0, 0, ".25*s", "c"], [0, 0, "s", "c@80"], [0, 0, "2*s", "c@40"]]}, {"name": "halo", "label": "Halo", "drop": [[0, 0, ".5*s", "c@70"], [0, 0, "1.6*s", "c@30"]]}, {"name": "under", "label": "Under-glow", "drop": [[0, ".6*s", "s", "c@70"]]}, {"name": "duo", "label": "Two-tone", "drop": [["-.4*s", 0, ".8*s", "c@70"], [".4*s", 0, ".8*s", "c2@70"]]}, {"name": "rainbow", "label": "Rainbow (animated)", "drop": [[0, 0, ".8*s", "c"]], "anim": "uvl-hue"}, {"name": "pulse", "label": "Pulsing", "drop": [[0, 0, ".8*s", "c@70"]], "anim": "uvl-glowpulse"}, {"name": "hover", "label": "Only on hover", "hover": {"drop": [[0, 0, "s", "c"], [0, 0, "2*s", "c@40"]]}}]}, {"key": "shadow", "label": "Shadow", "params": ["c", "s"], "defaults": {"c": "black", "s": 16}, "options": [{"name": "soft", "label": "Soft", "drop": [[0, ".4*s", "s", "c@35"]]}, {"name": "float", "label": "Floating", "drop": [[0, "s", "1.4*s", "c@30"], [0, ".15*s", ".3*s", "c@20"]]}, {"name": "hard", "label": "Hard offset", "drop": [[".3*s", ".3*s", 0, "c"]]}, {"name": "hard-accent", "label": "Hard offset (colour 2)", "drop": [[".3*s", ".3*s", 0, "c2"]]}, {"name": "long", "label": "Long", "drop": [[".1*s", ".1*s", 0, "c@60"], [".2*s", ".2*s", 0, "c@45"], [".3*s", ".3*s", 0, "c@30"], [".4*s", ".4*s", 0, "c@18"]]}, {"name": "stacked", "label": "Stacked", "drop": [[".2*s", ".2*s", 0, "c2"], [".4*s", ".4*s", 0, "c"]]}, {"name": "lifted", "label": "Lifted on hover", "hover": {"y": "-.2*s", "drop": [[0, ".6*s", "1.2*s", "c@35"]]}}, {"name": "sharp", "label": "Sharp bottom", "drop": [[0, ".2*s", 0, "c@50"]]}]}, {"key": "border", "label": "Border", "params": ["c", "c2", "s"], "defaults": {"c": "accent", "c2": "accent-2", "s": 2}, "options": [{"name": "ring", "label": "Ring", "outline": ["s", "solid", "c", "s"]}, {"name": "tight", "label": "Tight line", "outline": ["s", "solid", "c", "-s"]}, {"name": "double", "label": "Double", "outline": ["2*s+1", "double", "c", "s"]}, {"name": "dashed", "label": "Dashed", "outline": ["s", "dashed", "c", "s"]}, {"name": "dotted", "label": "Dotted", "outline": ["s", "dotted", "c", "s"]}, {"name": "gradient", "label": "Gradient", "ring": "gradient"}, {"name": "spin", "label": "Spinning gradient", "ring": "spin"}, {"name": "holo", "label": "Holographic", "ring": "holo"}, {"name": "march", "label": "Marching ants", "ring": "dash"}, {"name": "focus", "label": "Ring on hover", "hover": {"outline": ["s", "solid", "c", "s"]}}]}, {"key": "backdrop", "label": "Backdrop", "params": ["s"], "defaults": {"s": 12}, "options": [{"name": "blur", "label": "Blur", "backdrop": ["s", 0.35]}, {"name": "frost", "label": "Frosted glass", "backdrop": ["s", 0.5], "extra": {"border-color": "#ffffff40"}}, {"name": "tint", "label": "Tinted glass", "backdrop": ["s", 0.25], "bg": "color-mix(in srgb, %A 22%, transparent)"}, {"name": "dark", "label": "Smoked glass", "backdrop": ["s", 0.0], "bg": "#0b0b10a6", "fg": "#f2f2f5"}, {"name": "clear", "label": "Clear (no fill)", "backdrop": [0, 0.0], "bg": "transparent"}]}, {"key": "fill", "label": "Fill", "params": ["c", "c2"], "defaults": {"c": "accent", "c2": "accent-2"}, "options": [{"name": "solid", "label": "Solid colour", "bg": "c", "fg": "on(c)"}, {"name": "soft", "label": "Soft tint", "bg": "c@16", "fg": "mix(c,%T,60)"}, {"name": "gradient", "label": "Gradient", "bg": "linear-gradient(135deg, c, c2)", "fg": "#ffffff"}, {"name": "sweep", "label": "Animated gradient", "bg": "linear-gradient(110deg, c, c2, c) 0 0 / 200% 100%", "fg": "#ffffff", "anim": "uvl-pan"}, {"name": "pearl", "label": "Pearlescent", "bg": "linear-gradient(115deg, #ffffff 0%, #f3e8ff 22%, #e0f4ff 42%, #fff4dc 62%, #ffe6f4 80%, #ffffff 100%) 0 0 / 220% 100%", "fg": "#3a2f5a", "hover": {"anim": "uvl-pan"}}, {"name": "holo", "label": "Holo foil", "bg": "linear-gradient(115deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6, #9ad3ff) 0 0 / 300% 100%", "fg": "#2a1f3d", "anim": "uvl-pan"}, {"name": "chrome", "label": "Chrome", "bg": "linear-gradient(180deg, #ffffff 0%, #dfe3ea 40%, #8a919c 50%, #c9ced6 62%, #f4f6f9 100%)", "fg": "#1b1f26"}, {"name": "gold", "label": "Gold", "bg": "linear-gradient(180deg, #fff3c4 0%, #e6c25a 40%, #9a6f12 52%, #d8b04a 66%, #fff0b8 100%)", "fg": "#2a1a00"}, {"name": "deep-metal", "label": "Deep blue metal", "bg": "linear-gradient(180deg, #a9cbff 0%, #3f74dc 30%, #0a2560 50%, #1d4cad 64%, #86b4ff 100%)", "fg": "#f2f7ff"}, {"name": "metal", "label": "Anodised (colour)", "bg": "linear-gradient(180deg, mix(c,#ffffff,55) 0%, mix(c,#ffffff,12) 44%, mix(c,#000000,30) 54%, mix(c,#ffffff,8) 100%)", "fg": "#ffffff"}, {"name": "ink", "label": "Ink", "bg": "%T", "fg": "%BG"}, {"name": "paper", "label": "Paper", "bg": "%S", "fg": "%T"}, {"name": "stripes", "label": "Stripes", "bg": "repeating-linear-gradient(-45deg, c 0 10px, mix(c,#ffffff,25) 10px 20px)", "fg": "#ffffff"}, {"name": "carbon", "label": "Carbon", "bg": "repeating-linear-gradient(45deg, #1a1a1d 0 4px, #232327 4px 8px)", "fg": "#f2f2f5"}, {"name": "sunset", "label": "Sunset", "bg": "linear-gradient(180deg, #ffe66d, #ff6ec7 50%, #7b2ff7)", "fg": "#ffffff"}, {"name": "mesh", "label": "Mesh", "bg": "radial-gradient(at 15% 20%, c@70, transparent 55%), radial-gradient(at 85% 80%, c2@70, transparent 55%), %S", "fg": "%T"}]}, {"key": "shape", "label": "Shape", "params": [], "defaults": {}, "options": [{"name": "square", "label": "Square", "radius": "0px"}, {"name": "crisp", "label": "Crisp 4px", "radius": "4px"}, {"name": "soft", "label": "Soft 10px", "radius": "10px"}, {"name": "round", "label": "Round 18px", "radius": "18px"}, {"name": "pill", "label": "Pill", "radius": "pill"}, {"name": "blob", "label": "Blob", "radius": "blob"}, {"name": "notch", "label": "Notched corners", "clip": "notch"}, {"name": "ticket", "label": "Cut corners", "clip": "cut"}]}, {"key": "text", "label": "Text", "params": ["c"], "defaults": {"c": "accent"}, "options": [{"name": "upper", "label": "Uppercase", "font": {"tt": "uppercase", "ls": ".08em"}}, {"name": "wide", "label": "Wide tracking", "font": {"ls": ".18em"}}, {"name": "mono", "label": "Monospace", "font": {"ff": "mono"}}, {"name": "serif", "label": "Serif italic", "font": {"ff": "serif", "fs": "italic"}}, {"name": "heavy", "label": "Heavy", "font": {"fw": 800}}, {"name": "glow", "label": "Glowing text", "font": {"glow": "c"}}, {"name": "gradient", "label": "Gradient text", "font": {"grad": "linear-gradient(90deg, c, c2)"}}, {"name": "outline", "label": "Outlined", "font": {"stroke": "c"}}, {"name": "emboss", "label": "Embossed", "font": {"emboss": true}}, {"name": "small-caps", "label": "Small caps", "font": {"sc": true}}]}, {"key": "hover", "label": "Hover", "params": ["s"], "defaults": {"s": 1}, "options": [{"name": "lift", "label": "Lift", "hover": {"y": "-3*s"}}, {"name": "sink", "label": "Sink", "hover": {"y": "2*s"}}, {"name": "pop", "label": "Pop", "hover": {"scale": "1+.06*s"}}, {"name": "shrink", "label": "Shrink", "hover": {"scale": "1-.04*s"}}, {"name": "tilt", "label": "Tilt", "hover": {"rot": "-2*s", "scale": "1+.03*s"}}, {"name": "jelly", "label": "Jelly", "hover": {"anim": "uvl-jelly"}}, {"name": "wobble", "label": "Wobble", "hover": {"anim": "uvl-wobble"}}, {"name": "bounce", "label": "Bounce", "hover": {"anim": "uvl-bounce"}}, {"name": "rubber", "label": "Rubber band", "hover": {"anim": "uvl-rubber"}}, {"name": "heartbeat", "label": "Heartbeat", "hover": {"anim": "uvl-heart"}}, {"name": "shake", "label": "Shake", "hover": {"anim": "uvl-shake"}}, {"name": "swing", "label": "Swing", "hover": {"anim": "uvl-swing"}}, {"name": "brighten", "label": "Brighten", "hover": {"bright": 1.15}}, {"name": "shine", "label": "Shine sweep", "hover": {"shine": true}}, {"name": "float", "label": "Float while hovered", "hover": {"anim": "uvl-float"}}, {"name": "magnetic", "label": "Magnetic (follows cursor)", "js": "magnetic"}, {"name": "tilt3d", "label": "3D tilt (follows cursor)", "js": "tilt"}, {"name": "spotlight", "label": "Spotlight", "js": "spotlight"}]}, {"key": "press", "label": "Press", "params": ["s"], "defaults": {"s": 1}, "options": [{"name": "sink", "label": "Sink", "active": {"y": "2*s"}}, {"name": "squish", "label": "Squish", "active": {"scale": "1-.06*s"}}, {"name": "dim", "label": "Dim", "active": {"bright": 0.85}}, {"name": "ripple", "label": "Ripple", "js": "ripple"}, {"name": "confetti", "label": "Confetti", "js": "confetti"}, {"name": "click", "label": "Click sound", "js": "sound"}, {"name": "sparkle", "label": "Sparkle burst", "js": "sparkle"}, {"name": "pop", "label": "Pop", "active": {"anim": "uvl-pop"}}]}, {"key": "enter", "label": "Entrance", "params": ["t"], "defaults": {"t": 0.6}, "options": [{"name": "fade", "label": "Fade in", "anim": "uvl-in-fade"}, {"name": "rise", "label": "Rise", "anim": "uvl-in-rise"}, {"name": "drop", "label": "Drop", "anim": "uvl-in-drop"}, {"name": "zoom", "label": "Zoom", "anim": "uvl-in-zoom"}, {"name": "blur", "label": "Blur in", "anim": "uvl-in-blur"}, {"name": "left", "label": "Slide from left", "anim": "uvl-in-left"}, {"name": "right", "label": "Slide from right", "anim": "uvl-in-right"}, {"name": "flip", "label": "Flip up", "anim": "uvl-in-flip"}, {"name": "pop", "label": "Pop in", "anim": "uvl-in-pop"}, {"name": "swing", "label": "Swing in", "anim": "uvl-in-swing"}]}, {"key": "idle", "label": "Idle motion", "params": ["t"], "defaults": {"t": 3}, "options": [{"name": "float", "label": "Float", "anim": "uvl-float"}, {"name": "pulse", "label": "Pulse", "anim": "uvl-pulse"}, {"name": "breathe", "label": "Breathe", "anim": "uvl-breathe"}, {"name": "sway", "label": "Sway", "anim": "uvl-sway"}, {"name": "bob", "label": "Bob", "anim": "uvl-bob"}, {"name": "hue", "label": "Colour cycle", "anim": "uvl-hue"}, {"name": "flicker", "label": "Neon flicker", "anim": "uvl-flicker"}, {"name": "wiggle", "label": "Wiggle now and then", "anim": "uvl-wiggle"}, {"name": "spin", "label": "Slow spin", "anim": "uvl-spin"}, {"name": "blink", "label": "Blink", "anim": "uvl-blink"}]}, {"key": "fx", "label": "Effect (uv-fx)", "params": [], "defaults": {}, "options": [{"name": "3d", "label": "3d", "fx": "uv-fx-3d"}, {"name": "bevel", "label": "Bevel", "fx": "uv-fx-bevel"}, {"name": "blob", "label": "Blob", "fx": "uv-fx-blob"}, {"name": "blur-in", "label": "Blur in", "fx": "uv-fx-blur-in"}, {"name": "bounce-in", "label": "Bounce in", "fx": "uv-fx-bounce-in"}, {"name": "breathe", "label": "Breathe", "fx": "uv-fx-breathe"}, {"name": "checker", "label": "Checker", "fx": "uv-fx-checker"}, {"name": "chrome", "label": "Chrome", "fx": "uv-fx-chrome"}, {"name": "corners", "label": "Corners", "fx": "uv-fx-corners"}, {"name": "crt", "label": "Crt", "fx": "uv-fx-crt"}, {"name": "dashed-march", "label": "Dashed march", "fx": "uv-fx-dashed-march"}, {"name": "dither", "label": "Dither", "fx": "uv-fx-dither"}, {"name": "fill-hover", "label": "Fill hover", "fx": "uv-fx-fill-hover"}, {"name": "flip", "label": "Flip", "fx": "uv-fx-flip"}, {"name": "float", "label": "Float", "fx": "uv-fx-float"}, {"name": "frost", "label": "Frost", "fx": "uv-fx-frost"}, {"name": "glitch", "label": "Glitch", "fx": "uv-fx-glitch"}, {"name": "glow", "label": "Glow", "fx": "uv-fx-glow"}, {"name": "gradient-text", "label": "Gradient text", "fx": "uv-fx-gradient-text"}, {"name": "grid-floor", "label": "Grid floor", "fx": "uv-fx-grid-floor"}, {"name": "halftone", "label": "Halftone", "fx": "uv-fx-halftone"}, {"name": "hard-shadow", "label": "Hard shadow", "fx": "uv-fx-hard-shadow"}, {"name": "highlight", "label": "Highlight", "fx": "uv-fx-highlight"}, {"name": "holo", "label": "Holo", "fx": "uv-fx-holo"}, {"name": "holo-card", "label": "Holo card", "fx": "uv-fx-holo-card"}, {"name": "inset", "label": "Inset", "fx": "uv-fx-inset"}, {"name": "jelly", "label": "Jelly", "fx": "uv-fx-jelly"}, {"name": "lift", "label": "Lift", "fx": "uv-fx-lift"}, {"name": "long-shadow", "label": "Long shadow", "fx": "uv-fx-long-shadow"}, {"name": "mesh-anim", "label": "Mesh anim", "fx": "uv-fx-mesh-anim"}, {"name": "mirror", "label": "Mirror", "fx": "uv-fx-mirror"}, {"name": "neon", "label": "Neon", "fx": "uv-fx-neon"}, {"name": "neumorph", "label": "Neumorph", "fx": "uv-fx-neumorph"}, {"name": "noise", "label": "Noise", "fx": "uv-fx-noise"}, {"name": "paper", "label": "Paper", "fx": "uv-fx-paper"}, {"name": "pixel", "label": "Pixel", "fx": "uv-fx-pixel"}, {"name": "pop", "label": "Pop", "fx": "uv-fx-pop"}, {"name": "pulse-ring", "label": "Pulse ring", "fx": "uv-fx-pulse-ring"}, {"name": "rainbow-border", "label": "Rainbow border", "fx": "uv-fx-rainbow-border"}, {"name": "redacted", "label": "Redacted", "fx": "uv-fx-redacted"}, {"name": "rgb", "label": "Rgb", "fx": "uv-fx-rgb"}, {"name": "scanlines", "label": "Scanlines", "fx": "uv-fx-scanlines"}, {"name": "shake", "label": "Shake", "fx": "uv-fx-shake"}, {"name": "shine", "label": "Shine", "fx": "uv-fx-shine"}, {"name": "spin-hover", "label": "Spin hover", "fx": "uv-fx-spin-hover"}, {"name": "spotlight", "label": "Spotlight", "fx": "uv-fx-spotlight"}, {"name": "squiggle", "label": "Squiggle", "fx": "uv-fx-squiggle"}, {"name": "stamp", "label": "Stamp", "fx": "uv-fx-stamp"}, {"name": "sticker", "label": "Sticker", "fx": "uv-fx-sticker"}, {"name": "stripes", "label": "Stripes", "fx": "uv-fx-stripes"}, {"name": "stroke", "label": "Stroke", "fx": "uv-fx-stroke"}, {"name": "swing", "label": "Swing", "fx": "uv-fx-swing"}, {"name": "tape", "label": "Tape", "fx": "uv-fx-tape"}, {"name": "torn", "label": "Torn", "fx": "uv-fx-torn"}, {"name": "vhs", "label": "Vhs", "fx": "uv-fx-vhs"}, {"name": "wave", "label": "Wave", "fx": "uv-fx-wave"}, {"name": "wobble", "label": "Wobble", "fx": "uv-fx-wobble"}]}], "pageKinds": [{"key": "canvas", "label": "Animated background", "params": [], "defaults": {}, "options": [{"name": "waterfall", "label": "Waterfall", "page": {"canvas": "waterfall"}}, {"name": "matrix", "label": "Matrix rain", "page": {"canvas": "matrix"}}, {"name": "starfield", "label": "Starfield", "page": {"canvas": "starfield"}}, {"name": "particles", "label": "Particles", "page": {"canvas": "particles"}}, {"name": "snow", "label": "Snow", "page": {"canvas": "snow"}}]}, {"key": "cursor", "label": "Cursor", "params": [], "defaults": {}, "options": [{"name": "trail", "label": "Trail", "page": {"cursor": "cursor-trail"}}, {"name": "blob", "label": "Blob", "page": {"cursor": "cursor-blob"}}, {"name": "sparkles", "label": "Sparkles", "page": {"cursor": "sparkles"}}]}, {"key": "scroll", "label": "Scrolling", "params": [], "defaults": {}, "options": [{"name": "smooth", "label": "Smooth scrolling", "page": {"scroll": "smooth"}}, {"name": "progress", "label": "Progress bar", "page": {"scroll": "progress"}}, {"name": "both", "label": "Smooth + progress bar", "page": {"scroll": "both"}}]}], "types": [{"key": "btn", "label": "Buttons", "targets": ".uv-btn, .btn"}, {"key": "card", "label": "Cards", "targets": ".uv-card, .res"}, {"key": "input", "label": "Text fields", "targets": ".uv-input, .uv-select, .uv-textarea, .uv-otp input"}, {"key": "switch", "label": "Switches", "targets": ".uv-switch"}, {"key": "check", "label": "Checkboxes", "targets": ".uv-check"}, {"key": "range", "label": "Sliders", "targets": ".uv-range"}, {"key": "tabs", "label": "Tabs", "targets": ".uv-tabs"}, {"key": "nav", "label": "Navigation", "targets": ".uv-nav, .uv-sidenav, .uv-pages, .uv-menu"}, {"key": "badge", "label": "Badges", "targets": ".uv-badge, .uv-chip, .chip"}, {"key": "alert", "label": "Alerts & toasts", "targets": ".uv-alert, .uv-toast"}, {"key": "modal", "label": "Modals", "targets": ".uv-modal, .uv-cmdk"}, {"key": "spinner", "label": "Spinners", "targets": ".uv-spinner"}, {"key": "progress", "label": "Progress", "targets": ".uv-progress"}, {"key": "head", "label": "Headings", "targets": ".uv-h1, .uv-h2, h1, h2"}, {"key": "link", "label": "Links", "targets": "a:not(.uv-btn):not(.btn)"}, {"key": "img", "label": "Images", "targets": "img, .uv-avatar"}, {"key": "text", "label": "Paragraphs", "targets": "p"}, {"key": "page", "label": "Whole page", "targets": "html"}], "colors": ["accent", "accent-2", "text", "white", "black", "success", "warn", "danger", "info"], "keyframes": "@keyframes uvl-hue { to { filter: hue-rotate(360deg); } }\n@keyframes uvl-glowpulse { 50% { opacity: .85; scale: 1.015; } }\n@keyframes uvl-pan { to { background-position: 100% 0; } }\n@keyframes uvl-jelly { 30% { scale: 1.12 .88; } 50% { scale: .92 1.08; } 70% { scale: 1.04 .96; } }\n@keyframes uvl-wobble { 25% { rotate: -4deg; } 50% { rotate: 3deg; } 75% { rotate: -1.5deg; } }\n@keyframes uvl-bounce { 40% { translate: 0 -8px; } 60% { translate: 0 0; } 75% { translate: 0 -3px; } }\n@keyframes uvl-rubber { 30% { scale: 1.2 .8; } 40% { scale: .8 1.2; } 60% { scale: 1.1 .9; } 75% { scale: .97 1.03; } }\n@keyframes uvl-heart { 15%, 45% { scale: 1.1; } 30% { scale: 1; } }\n@keyframes uvl-shake { 20%, 60% { translate: -4px 0; } 40%, 80% { translate: 4px 0; } }\n@keyframes uvl-swing { 20% { rotate: 8deg; } 40% { rotate: -6deg; } 60% { rotate: 3deg; } 80% { rotate: -2deg; } }\n@keyframes uvl-float { 50% { translate: 0 -6px; } }\n@keyframes uvl-pop { 50% { scale: 1.12; } }\n@keyframes uvl-pulse { 50% { scale: 1.05; } }\n@keyframes uvl-breathe { 50% { opacity: .65; } }\n@keyframes uvl-sway { 50% { rotate: 2deg; } } @keyframes uvl-bob { 50% { translate: 0 3px; } }\n@keyframes uvl-flicker { 0%, 19%, 21%, 23%, 55%, 57%, 100% { opacity: 1; } 20%, 22%, 56% { opacity: .5; } }\n@keyframes uvl-wiggle { 0%, 88%, 100% { rotate: 0deg; } 90% { rotate: -5deg; } 93% { rotate: 5deg; } 96% { rotate: -3deg; } }\n@keyframes uvl-spin { to { rotate: 360deg; } } @keyframes uvl-blink { 50% { opacity: .35; } }\n@keyframes uvl-in-fade { from { opacity: 0; } } @keyframes uvl-in-rise { from { opacity: 0; translate: 0 24px; } }\n@keyframes uvl-in-drop { from { opacity: 0; translate: 0 -24px; } } @keyframes uvl-in-zoom { from { opacity: 0; scale: .85; } }\n@keyframes uvl-in-blur { from { opacity: 0; filter: blur(10px); } } @keyframes uvl-in-left { from { opacity: 0; translate: -40px 0; } }\n@keyframes uvl-in-right { from { opacity: 0; translate: 40px 0; } } @keyframes uvl-in-flip { from { opacity: 0; transform: perspective(600px) rotateX(-60deg); } }\n@keyframes uvl-in-pop { 0% { opacity: 0; scale: .6; } 70% { scale: 1.06; } } @keyframes uvl-in-swing { from { opacity: 0; rotate: -8deg; translate: -20px 0; } }\n@keyframes uvl-shine { from { translate: -120% 0; } to { translate: 120% 0; } }\n@keyframes uvl-spin-a { to { --uvl-a: 360deg; } } @keyframes uvl-march { to { background-position: 16px 0, -16px 100%, 0 -16px, 100% 16px; } }\n@property --uvl-a { syntax: \"<angle>\"; initial-value: 0deg; inherits: false; }\n"};
  const KIND = Object.fromEntries([...DEFS.kinds, ...DEFS.pageKinds].map(k => [k.key, k]));
  const TYPE = Object.fromEntries(DEFS.types.map(t => [t.key, t]));
  const UI = ".uvp, .uvp *, .uvp-btn, .uvi, .uvi *";            // the editors themselves never get layered
  const NO_PSEUDO = /^(input|img|range|switch|check|page)$/;     // replaced elements / composites: no ::before/::after rings
  const opt = (kind, name) => (KIND[kind] && KIND[kind].options.find(o => o.name === name)) || null;

  // ── value helpers ────────────────────────────────────────────────────────
  const TOK = { accent: "var(--uv-accent)", "accent-2": "var(--uv-accent-2)", text: "var(--uv-text)", white: "#ffffff", black: "#000000",
    success: "var(--uv-success)", warn: "var(--uv-warn)", danger: "var(--uv-danger)", info: "var(--uv-info)" };
  const col = v => TOK[v] || v || "var(--uv-accent)";
  const num = (expr, s) => typeof expr === "number" ? expr : Function("s", "return " + String(expr))(s);
  function val(str, p) {
    const c = col(p.c), c2 = col(p.c2 || "accent-2");
    return String(str)
      .replace(/%A2/g, "var(--uv-accent-2)").replace(/%A/g, "var(--uv-accent)").replace(/%T/g, "var(--uv-text)").replace(/%BG/g, "var(--uv-bg)").replace(/%S/g, "var(--uv-surface)")
      .replace(/on\(c\)/g, p.c === "white" ? "#111111" : (!p.c || p.c === "accent") ? "var(--uv-on-accent, #fff)" : "#ffffff")
      .replace(/mix\(([^,]+),([^,]+),(\d+)\)/g, (_, a, b, n) => `color-mix(in srgb, ${a.trim()}, ${b.trim()} ${n}%)`)
      .replace(/\bc2@(\d+)/g, (_, n) => `color-mix(in srgb, ${c2} ${n}%, transparent)`)
      .replace(/\bc@(\d+)/g, (_, n) => `color-mix(in srgb, ${c} ${n}%, transparent)`)
      .replace(/\bc2\b/g, c2).replace(/\bc\b/g, c);
  }
  const drops = (list, p) => (list || []).map(([x, y, b, cc]) => `drop-shadow(${num(x, p.s)}px ${num(y, p.s)}px ${Math.max(0, num(b, p.s))}px ${val(cc, p)})`);
  const RADIUS = { pill: "999px", blob: "30% 70% 70% 30% / 30% 30% 70% 70%" };
  const CLIP = { notch: "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)",
    cut: "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))" };
  const FONT = { mono: "var(--uv-mono)", serif: "var(--uv-serif)", display: "var(--uv-font-head)" };
  const RING = (kind, p) => ({
    gradient: `linear-gradient(135deg, ${col(p.c)}, ${col(p.c2 || "accent-2")})`,
    spin: `conic-gradient(from var(--uvl-a), ${col(p.c)}, ${col(p.c2 || "accent-2")}, transparent 45%, ${col(p.c)})`,
    holo: "conic-gradient(from var(--uvl-a), #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6)",
    dash: `linear-gradient(90deg, ${col(p.c)} 50%, transparent 0) 0 0 / 16px ${p.s}px repeat-x, linear-gradient(90deg, ${col(p.c)} 50%, transparent 0) 0 100% / 16px ${p.s}px repeat-x, linear-gradient(0deg, ${col(p.c)} 50%, transparent 0) 0 0 / ${p.s}px 16px repeat-y, linear-gradient(0deg, ${col(p.c)} 50%, transparent 0) 100% 0 / ${p.s}px 16px repeat-y`,
  }[kind]);

  // ── CSS for one target (a type's selector or one element's attribute selector) ─
  function block(sel, type, kinds) {
    const S = `:is(${sel}):not(${UI}):not(#_):not(#_)`;
    const P = k => Object.assign({}, (KIND[k] || {}).defaults, kinds[k]);
    const base = [], hov = [], act = [], out = [], filt = [], hfilt = [], afilt = [], anims = [], hanims = [];
    let pseudoBefore = "", pseudoAfter = "", needPos = false, enter = null;
    for (const k of Object.keys(kinds)) {
      const p = P(k), o = opt(k, p.o); if (!o || KIND[k].key === "fx" || o.page) continue;
      filt.push(...drops(o.drop, p));
      if (o.anim && k !== "enter") anims.push(o.anim === "uvl-hue" || o.anim === "uvl-spin" ? `${o.anim} ${k === "idle" ? p.t * 2 : 6}s linear infinite` : `${o.anim} ${k === "idle" ? p.t : 2.4}s ease-in-out infinite`);
      if (o.anim && k === "enter") enter = `${o.anim} ${p.t}s var(--uv-ease, ease) both`;
      if (o.outline) { const [w, st, c, off] = o.outline; base.push(`outline: ${num(w, p.s)}px ${st} ${val(c, p)}; outline-offset: ${num(off, p.s)}px`); }
      if (o.ring && !NO_PSEUDO.test(type)) {
        needPos = true;
        pseudoAfter = `content: ""; position: absolute; inset: 0; z-index: 2; border-radius: inherit; pointer-events: none; padding: ${o.ring === "dash" ? 0 : p.s}px; background: ${RING(o.ring, p)};` +
          (o.ring === "dash" ? " animation: uvl-march 1s linear infinite;" : ` -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);${o.ring !== "gradient" ? " animation: uvl-spin-a 3s linear infinite;" : ""}`);
      } else if (o.ring) base.push(`outline: ${p.s}px solid ${col(p.c)}; outline-offset: 1px`);
      if (o.bg) base.push(`background: ${val(o.bg, p)}`);
      if (o.fg) base.push(`color: ${val(o.fg, p)}`);
      if (o.backdrop) {
        const [b, a] = o.backdrop;
        base.push(`backdrop-filter: blur(${num(b, p.s)}px) saturate(1.4); -webkit-backdrop-filter: blur(${num(b, p.s)}px) saturate(1.4)`);
        if (!o.bg) base.push(`background: color-mix(in srgb, var(--uv-surface) ${Math.round(a * 100)}%, transparent)`);
      }
      if (o.extra) for (const [a, b] of Object.entries(o.extra)) base.push(`${a}: ${b}`);
      if (o.radius) base.push(`border-radius: ${RADIUS[o.radius] || o.radius}`);
      if (o.clip) base.push(`clip-path: ${CLIP[o.clip]}`);
      if (o.font) {
        const f = o.font;
        if (f.tt) base.push(`text-transform: ${f.tt}`); if (f.ls) base.push(`letter-spacing: ${f.ls}`);
        if (f.ff) base.push(`font-family: ${FONT[f.ff]}`); if (f.fw) base.push(`font-weight: ${f.fw}`); if (f.fs) base.push(`font-style: ${f.fs}`);
        if (f.sc) base.push("font-variant: small-caps");
        if (f.glow) base.push(`text-shadow: 0 0 6px ${val(f.glow, p)}, 0 0 18px ${val("c@60", p)}`);
        if (f.emboss) base.push("text-shadow: 0 1px 0 #ffffff70, 0 -1px 0 #00000040");
        if (f.stroke) base.push(`-webkit-text-stroke: 1.2px ${val(f.stroke, p)}; color: transparent; -webkit-text-fill-color: transparent`);
        if (f.grad) base.push(`background-image: ${val(f.grad, p)}; -webkit-background-clip: text; background-clip: text; color: transparent; -webkit-text-fill-color: transparent`);
      }
      for (const [state, list, fl, an] of [[o.hover, hov, hfilt, hanims], [o.active, act, afilt, null]]) {
        if (!state) continue;
        if (state.y != null || state.x != null) list.push(`translate: ${num(state.x || 0, p.s)}px ${num(state.y || 0, p.s)}px`);
        if (state.scale != null) list.push(`scale: ${num(state.scale, p.s)}`);
        if (state.rot != null) list.push(`rotate: ${num(state.rot, p.s)}deg`);
        if (state.bright) fl.push(`brightness(${state.bright})`);
        if (state.drop) fl.push(...drops(state.drop, p));
        if (state.outline) { const [w, st, c, off] = state.outline; list.push(`outline: ${num(w, p.s)}px ${st} ${val(c, p)}; outline-offset: ${num(off, p.s)}px`); }
        if (state.anim) (an || list).push(an ? `${state.anim} ${state.anim === "uvl-pan" ? "1.2s ease forwards" : state.anim === "uvl-float" ? "1.6s ease-in-out infinite" : ".55s ease"}` : `animation: ${state.anim} .4s ease`);
        if (state.shine && !NO_PSEUDO.test(type)) { needPos = true; base.push("overflow: hidden"); pseudoBefore = `content: ""; position: absolute; inset: 0; z-index: 1; border-radius: inherit; pointer-events: none; background: linear-gradient(110deg, transparent 35%, #ffffff70 50%, transparent 65%); translate: -120% 0;`; out.push(`${S}:hover::before { animation: uvl-shine .7s ease; }`); }
      }
      if (o.js === "tilt") base.push("transform: perspective(700px) rotateX(var(--uvl-rx, 0deg)) rotateY(var(--uvl-ry, 0deg))");
      if (o.js === "magnetic") base.push("translate: var(--uvl-mx, 0px) var(--uvl-my, 0px)");
      if (o.js === "spotlight" && !NO_PSEUDO.test(type)) { needPos = true; base.push("overflow: hidden"); pseudoBefore = `content: ""; position: absolute; inset: 0; z-index: 1; pointer-events: none; border-radius: inherit; background: radial-gradient(220px circle at var(--uvl-x, 50%) var(--uvl-y, 50%), ${val("c@25", p)}, transparent 65%);`; }
    }
    if (filt.length) base.push(`filter: ${filt.join(" ")}`);
    if (hfilt.length) hov.push(`filter: ${[...filt, ...hfilt].join(" ")}`);
    if (afilt.length) act.push(`filter: ${[...filt, ...afilt].join(" ")}`);
    if (anims.length) base.push(`animation: ${anims.join(", ")}`);
    if (hanims.length) hov.push(`animation: ${[...hanims, ...anims].join(", ")}`);
    if (needPos && type !== "page") base.push("position: relative; isolation: isolate");
    if (hov.length || act.length) base.push("transition: translate .25s var(--uv-ease, ease), scale .25s var(--uv-spring, ease), rotate .25s ease, filter .25s ease, outline-color .2s, background-color .2s, background-position .6s, color .2s, border-color .2s, box-shadow .25s");
    const css = [];
    if (base.length) css.push(`${S} { ${base.join("; ")}; }`);
    if (hov.length) css.push(`${S}:hover { ${hov.join("; ")}; }`);
    if (act.length) css.push(`${S}:active { ${act.join("; ")}; }`);
    if (pseudoBefore) css.push(`${S}::before { ${pseudoBefore} }`);
    if (pseudoAfter) css.push(`${S}::after { ${pseudoAfter} }`);
    if (enter) {
      css.push(`html.uvl-js ${S}:not(.uvl-in) { opacity: 0; }`);
      css.push(`${S}.uvl-in { animation: ${enter}${anims.length ? ", " + anims.map(a => a + "").join(", ") : ""}; }`);
    }
    return css.concat(out).join("\n");
  }

  /** The static CSS for a stack (everything except JS behaviours, uv-fx classes and page effects). */
  function css(stack = {}) {
    const out = [DEFS.keyframes.trim()];
    for (const [type, kinds] of Object.entries(stack)) {
      if (type === "@el" || type === "page" || !TYPE[type]) continue;
      const b = block(TYPE[type].targets, type, kinds); if (b) out.push(`/* ${TYPE[type].label} */\n` + b);
    }
    for (const [key, v] of Object.entries(stack["@el"] || {})) {
      if (!v || !v.kinds || (v.page && v.page !== location.pathname)) continue;
      const b = block(`[data-uvl="${v.id}"]`, v.type, v.kinds); if (b) out.push(`/* one ${v.type} on ${v.page} */\n` + b);
    }
    return out.length > 1 ? out.join("\n") : "";
  }

  // ── runtime: JS behaviours, uv-fx classes, entrance observer, page effects ─
  let style, current = {}, stops = [], io, mo, pending = 0;
  const allTargets = () => {
    const list = [];
    for (const [type, kinds] of Object.entries(current)) if (TYPE[type] && type !== "page" && type !== "@el") list.push([TYPE[type].targets, type, kinds]);
    for (const v of Object.values(current["@el"] || {})) if (v && v.kinds && (!v.page || v.page === location.pathname)) list.push([`[data-uvl="${v.id}"]`, v.type, v.kinds]);
    return list;
  };
  const isUI = el => !!el.closest(".uvp, .uvi, .uvp-btn");
  function tagElements() {
    // per-element picks are stored as a CSS path; give the element its id attribute
    for (const v of Object.values(current["@el"] || {})) {
      if (!v || (v.page && v.page !== location.pathname)) continue;
      try { const el = document.querySelector(v.path); if (el) { el.setAttribute("data-uvl", v.id); if (v.design) el.setAttribute("data-uv-" + v.type, v.design); } } catch {}
    }
    const fxWanted = new Map();
    for (const [sel, , kinds] of allTargets()) {
      const els = [...document.querySelectorAll(sel)].filter(e => !isUI(e));
      const fx = kinds.fx && opt("fx", kinds.fx.o);
      if (fx) els.forEach(e => { (fxWanted.get(e) || fxWanted.set(e, new Set()).get(e)).add(fx.fx); });
      if (kinds.enter && kinds.enter.o) els.forEach(e => { if (!e.classList.contains("uvl-in") && !e._uvlSeen) { e._uvlSeen = 1; io.observe(e); } });
    }
    // add/remove uv-fx classes we manage
    document.querySelectorAll("[data-uvl-fx]").forEach(e => { if (!fxWanted.has(e)) { e.dataset.uvlFx.split(" ").forEach(c => e.classList.remove(c)); e.removeAttribute("data-uvl-fx"); } });
    fxWanted.forEach((set, e) => {
      const want = [...set], had = (e.dataset.uvlFx || "").split(" ").filter(Boolean);
      had.filter(c => !set.has(c)).forEach(c => e.classList.remove(c));
      want.forEach(c => e.classList.add(c));
      if (!e.dataset.text) e.dataset.text = e.textContent.trim().slice(0, 80);
      e.dataset.uvlFx = want.join(" ");
    });
  }
  const kindsFor = el => {
    const res = [];
    for (const [sel, , kinds] of allTargets()) { try { if (el.matches(sel)) res.push(kinds); } catch {} }
    return res;
  };
  const jsFor = (el, name) => kindsFor(el).some(ks => Object.entries(ks).some(([k, v]) => { const o = opt(k, v && v.o); return o && o.js === name; }));
  const hit = e => { const t = e.target.closest && e.target.closest("*"); if (!t || isUI(t)) return null; for (let el = t; el && el !== document; el = el.parentElement) { if (kindsFor(el).length) return el; } return null; };
  function onDown(e) {
    const el = hit(e); if (!el) return;
    if (jsFor(el, "ripple")) {
      const r = el.getBoundingClientRect(), d = Math.max(r.width, r.height), i = document.createElement("span");
      if (getComputedStyle(el).position === "static") el.style.position = "relative";
      el.style.overflow = "hidden";
      i.className = "uv-ripple"; i.style.cssText = `width:${d}px;height:${d}px;left:${e.clientX - r.left - d / 2}px;top:${e.clientY - r.top - d / 2}px`;
      el.appendChild(i); setTimeout(() => i.remove(), 650);
    }
    if (jsFor(el, "sound") && UV.sound) UV.sound("click");
  }
  function onClick(e) {
    const el = hit(e); if (!el) return;
    if (jsFor(el, "confetti") && UV.confetti) UV.confetti({ x: e.clientX, y: e.clientY, count: 80 });
    if (jsFor(el, "sparkle") && UV.confetti) UV.confetti({ x: e.clientX, y: e.clientY, count: 26, spread: .45, shapes: "circle" });
  }
  function onMove(e) {
    const el = hit(e); if (!el) return;
    const r = el.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
    if (jsFor(el, "tilt")) { el.style.setProperty("--uvl-rx", ((.5 - y / r.height) * 12).toFixed(2) + "deg"); el.style.setProperty("--uvl-ry", ((x / r.width - .5) * 14).toFixed(2) + "deg"); }
    if (jsFor(el, "magnetic")) { el.style.setProperty("--uvl-mx", ((x - r.width / 2) * .25).toFixed(1) + "px"); el.style.setProperty("--uvl-my", ((y - r.height / 2) * .3).toFixed(1) + "px"); }
    if (jsFor(el, "spotlight")) { el.style.setProperty("--uvl-x", x + "px"); el.style.setProperty("--uvl-y", y + "px"); }
    el._uvlMoved = 1;
  }
  function onOut(e) {
    const el = e.target; if (!el || !el._uvlMoved || (e.relatedTarget && el.contains(e.relatedTarget))) return;
    ["--uvl-rx", "--uvl-ry", "--uvl-mx", "--uvl-my"].forEach(p => el.style.removeProperty(p));
  }
  function page(p = {}) {
    stops.forEach(s => { try { s && s(); } catch {} }); stops = [];
    const o = k => p[k] && opt(k, p[k].o);
    const canvas = o("canvas"), cursor = o("cursor"), scroll = o("scroll");
    if (canvas && UV.fx) {
      const host = document.createElement("div"); host.className = "uvl-page-bg";
      host.style.cssText = "position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden";
      document.body.prepend(host);
      const run = UV.fx[canvas.page.canvas] || (canvas.page.canvas === "waterfall" && window.UVWaterfall && (el => window.UVWaterfall.mount(el)));
      let stop = null; try { stop = run && run(host); } catch {}
      stops.push(() => { try { typeof stop === "function" ? stop() : stop && stop.stop && stop.stop(); } catch {} host.remove(); });
    }
    if (cursor && UV.fx && UV.fx[cursor.page.cursor]) { try { stops.push(UV.fx[cursor.page.cursor](document.body)); } catch {} }
    if (scroll) {
      const s = scroll.page.scroll;
      if ((s === "smooth" || s === "both") && UV.smoothScroll && !document.documentElement.hasAttribute("data-uv-smooth")) { try { stops.push(UV.smoothScroll()); } catch {} }
      if ((s === "progress" || s === "both") && UV.scrollbar) { UV.scrollbar(); stops.push(() => document.querySelectorAll(".uv-scrollbar").forEach(b => b.remove())); }
    }
  }
  let lastPage = "";
  function apply(stack = {}) {
    current = stack || {};
    if (!style) { style = document.createElement("style"); style.id = "uv-layers"; document.head.appendChild(style); }
    style.textContent = css(current);
    document.documentElement.classList.add("uvl-js");
    if (!io) io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting) { en.target.classList.add("uvl-in"); io.unobserve(en.target); } }), { rootMargin: "0px 0px -6% 0px" });
    if (!mo) {
      mo = new MutationObserver(() => { if (!pending) pending = setTimeout(() => { pending = 0; tagElements(); }, 250); });
      const start = () => { mo.observe(document.body, { childList: true, subtree: true }); document.addEventListener("pointerdown", onDown, true); document.addEventListener("click", onClick, true); document.addEventListener("pointermove", onMove, { passive: true }); document.addEventListener("pointerout", onOut, true); };
      document.body ? start() : document.addEventListener("DOMContentLoaded", start);
    }
    const go = () => {
      tagElements();
      const pj = JSON.stringify(current.page || {}); if (pj !== lastPage) { lastPage = pj; page(current.page); }
    };
    document.body ? go() : document.addEventListener("DOMContentLoaded", go);
    return current;
  }
  /** A CSS path that finds this element again on this page. */
  function pathOf(el) {
    if (el.id) return "#" + CSS.escape(el.id);
    const parts = [];
    for (let e = el; e && e.nodeType === 1 && e !== document.body; e = e.parentElement) {
      if (e.id) { parts.unshift("#" + CSS.escape(e.id)); break; }
      let i = 1; for (let s = e.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === e.tagName) i++;
      parts.unshift(e.tagName.toLowerCase() + ":nth-of-type(" + i + ")");
    }
    return parts.join(" > ");
  }
  /** Which element type (btn, card, …) an element belongs to, or null. */
  function typeOf(el) {
    for (let e = el; e && e !== document.documentElement; e = e.parentElement) {
      if (isUI(e)) return null;
      for (const t of DEFS.types) { if (t.key === "page") continue; try { if (e.matches(t.targets)) return [t.key, e]; } catch {} }
    }
    return ["page", document.documentElement];
  }
  UV.layers = { defs: DEFS, kinds: KIND, types: TYPE, apply, css, get: () => current, pathOf, typeOf, option: opt };
})(window.UV);
