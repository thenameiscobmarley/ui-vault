// UI Vault theme engine (browser port of tools/theme_specs.py — keep the two in sync).
// ThemeEngine.css(spec) → scoped CSS for [data-uv-theme="name"];  ThemeEngine.tokens(spec) → colours/solid/fonts/shape.
(() => {
  "use strict";
  const FONTS = {
    geist: '"Geist", system-ui, sans-serif', manrope: '"Manrope", system-ui, sans-serif', outfit: '"Outfit", system-ui, sans-serif',
    grotesk: '"Space Grotesk", system-ui, sans-serif', bricolage: '"Bricolage Grotesque", system-ui, sans-serif', rajdhani: '"Rajdhani", system-ui, sans-serif',
    mono: '"Geist Mono", ui-monospace, monospace', serif: '"Instrument Serif", Georgia, serif', fraunces: '"Fraunces", Georgia, serif',
    playfair: '"Playfair Display", Georgia, serif', cormorant: '"Cormorant Garamond", Georgia, serif', dmserif: '"DM Serif Display", Georgia, serif',
    syne: '"Syne", system-ui, sans-serif', unbounded: '"Unbounded", system-ui, sans-serif', orbitron: '"Orbitron", system-ui, sans-serif',
    audiowide: '"Audiowide", system-ui, sans-serif', bebas: '"Bebas Neue", Impact, sans-serif', pixel: '"VT323", ui-monospace, monospace',
    press: '"Press Start 2P", ui-monospace, monospace', hand: '"Patrick Hand", "Comic Neue", cursive', majormono: '"Major Mono Display", ui-monospace, monospace',
  };
  const SHAPES = { sharp: [0, 0, 0, 0], crisp: [2, 3, 4, 6], soft: [4, 6, 8, 12], round: [8, 12, 16, 22], pill: [999, 999, 18, 26] };
  const RECIPES = {
    background: ["flat", "aurora", "pearl", "mesh", "grid", "blueprint", "dots", "lines", "carbon", "brushed", "galaxy", "marble", "sunset", "noise", "halftone", "checker", "stripes", "scan", "vignette", "tiger", "web", "damascus"],
    heading: ["plain", "metal", "chrome", "gradient", "holo", "pearl", "outline", "glow", "shadow3d", "duotone", "fire"],
    button: ["solid", "ink", "outline", "hard", "glow", "gradient", "metal", "chrome", "pearl", "glass", "bevel", "soft", "3d", "neon", "underline", "stamp"],
    hover: ["lift", "shine", "glow", "press", "fill", "invert", "wobble", "jelly", "bounce", "tilt", "pop", "sink", "ring", "pulse", "flicker"],
    card: ["flat", "soft", "hard", "glass", "bevel", "gradient-border", "inset", "outline", "glow", "notch", "double", "metal", "pearl", "paper"],
  };

  const rgb = h => { h = h.replace("#", ""); if (h.length === 3) h = [...h].map(c => c + c).join(""); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); };
  const hex = a => "#" + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("");
  const mix = (a, b, t) => { const x = rgb(a), y = rgb(b); return hex(x.map((v, i) => v + (y[i] - v) * t)); };
  const alpha = (h, a) => h.slice(0, 7) + Math.round(a * 255).toString(16).padStart(2, "0");
  const lum = h => { const [r, g, b] = rgb(h); return (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255; };
  const on = h => lum(h) > 0.55 ? "#111111" : "#ffffff";
  const lighten = (h, t) => mix(h, "#ffffff", t), darken = (h, t) => mix(h, "#000000", t);

  function derive(s) {
    const bg = s.bg, fg = s.fg, dark = lum(bg) < 0.5;
    const c = { bg, text: fg, accent: s.ac, "accent-2": s.ac2 || s.ac };
    c.surface = dark ? mix(bg, fg, .05) : mix(bg, "#ffffff", .55);
    c["surface-2"] = mix(bg, fg, dark ? .09 : .06); c["surface-3"] = mix(bg, fg, dark ? .15 : .11);
    c.line = alpha(fg, dark ? .14 : .10); c["line-2"] = alpha(fg, dark ? .26 : .18);
    c.muted = mix(fg, bg, .32); c.dim = mix(fg, bg, .52);
    [c.success, c.warn, c.danger, c.info] = dark ? ["#4ade80", "#fbbf24", "#f87171", "#60a5fa"] : ["#2f7d4f", "#b7791f", "#c4321f", "#2b5fb4"];
    return [c, dark];
  }

  function bgCss(k, c, dark) {
    const a = c.accent, b = c["accent-2"], t = c.text;
    switch (k) {
      case "aurora": return `background-image: radial-gradient(45% 55% at 12% 10%, ${alpha(a, .45)}, transparent 70%), radial-gradient(40% 50% at 88% 22%, ${alpha(b, .38)}, transparent 70%), radial-gradient(55% 50% at 55% 100%, ${alpha(mix(a, b, .5), .35)}, transparent 70%);`;
      case "pearl": return "background-image: radial-gradient(55% 45% at 18% 8%, #ffd9f3cc, transparent 70%), radial-gradient(45% 50% at 88% 14%, #cdeeffcc, transparent 70%), radial-gradient(60% 55% at 70% 95%, #e7ffdccc, transparent 70%), radial-gradient(40% 40% at 30% 75%, #fff2d6aa, transparent 70%), conic-gradient(from 200deg at 65% 55%, #ffffff, #f4ecff, #e8f7ff, #fdf8ea, #ffffff);";
      case "mesh": return `background-image: radial-gradient(at 15% 15%, ${alpha(a, .55)} 0, transparent 50%), radial-gradient(at 85% 10%, ${alpha(b, .5)} 0, transparent 50%), radial-gradient(at 60% 100%, ${alpha(mix(a, b, .5), .45)} 0, transparent 55%);`;
      case "grid": { const g = alpha(t, .07); return `background-image: linear-gradient(${g} 1px, transparent 1px), linear-gradient(90deg, ${g} 1px, transparent 1px); background-size: 32px 32px;`; }
      case "blueprint": { const g = alpha(t, .09), g2 = alpha(t, .18); return `background-image: linear-gradient(${g2} 1px, transparent 1px), linear-gradient(90deg, ${g2} 1px, transparent 1px), linear-gradient(${g} 1px, transparent 1px), linear-gradient(90deg, ${g} 1px, transparent 1px); background-size: 100px 100px, 100px 100px, 20px 20px, 20px 20px;`; }
      case "dots": return `background-image: radial-gradient(${alpha(t, .16)} 1px, transparent 1.4px); background-size: 18px 18px;`;
      case "lines": return `background-image: linear-gradient(${alpha(b, .16)} 1px, transparent 1px); background-size: 100% 28px;`;
      case "carbon": { const k1 = mix(c.bg, "#ffffff", .06), k2 = mix(c.bg, "#000000", .25); return `background-image: linear-gradient(27deg, ${k2} 5px, transparent 5px) 0 5px, linear-gradient(207deg, ${k2} 5px, transparent 5px) 10px 0, linear-gradient(27deg, ${k1} 5px, transparent 5px) 0 10px, linear-gradient(207deg, ${k1} 5px, transparent 5px) 10px 5px, linear-gradient(90deg, ${k2} 10px, transparent 10px), linear-gradient(${k2} 25%, ${k1} 25%, ${k1} 50%, transparent 50%, transparent 75%, ${k1} 75%, ${k1}); background-size: 20px 20px;`; }
      case "brushed": return `background-image: repeating-linear-gradient(90deg, ${alpha("#ffffff", .05)} 0 1px, transparent 1px 3px), linear-gradient(180deg, ${lighten(c.bg, .12)}, ${c.bg} 45%, ${darken(c.bg, .1)});`;
      case "galaxy": return `background-image: radial-gradient(1px 1px at 20% 30%, #fff, transparent), radial-gradient(1px 1px at 70% 60%, #fff, transparent), radial-gradient(1.5px 1.5px at 40% 80%, #ffffffcc, transparent), radial-gradient(1px 1px at 85% 15%, #fff, transparent), radial-gradient(60% 50% at 30% 30%, ${alpha(a, .45)}, transparent 70%), radial-gradient(50% 60% at 80% 70%, ${alpha(b, .45)}, transparent 70%); background-size: 220px 220px, 260px 260px, 300px 300px, 180px 180px, 100% 100%, 100% 100%;`;
      case "marble": return `background-image: radial-gradient(120% 60% at 10% 20%, ${alpha(a, .25)} 0 20%, transparent 21% 40%, ${alpha(b, .2)} 41% 46%, transparent 47%), radial-gradient(90% 70% at 90% 80%, ${alpha(b, .25)} 0 18%, transparent 19% 36%, ${alpha(a, .2)} 37% 40%, transparent 41%);`;
      case "sunset": return `background-image: linear-gradient(180deg, ${alpha(a, .55)}, ${alpha(b, .35)} 45%, ${alpha(c.bg, 0)} 85%);`;
      case "noise": return `background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 .5 0 0 0 0 .5 0 0 0 0 .5 0 0 0 .09 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");`;
      case "halftone": return `background-image: radial-gradient(${alpha(a, .3)} 1.4px, transparent 1.6px); background-size: 10px 10px;`;
      case "checker": return `background-image: conic-gradient(${c["surface-2"]} 25%, transparent 0 50%, ${c["surface-2"]} 0 75%, transparent 0); background-size: 28px 28px;`;
      case "stripes": return `background-image: repeating-linear-gradient(-45deg, ${alpha(a, .08)} 0 12px, transparent 12px 24px);`;
      case "scan": return `background-image: repeating-linear-gradient(0deg, ${alpha("#000000", .18)} 0 1px, transparent 1px 3px), radial-gradient(ellipse at center, transparent 55%, ${alpha("#000000", .45)});`;
      case "vignette": return `background-image: radial-gradient(ellipse at 50% 35%, transparent 40%, ${alpha(darken(c.bg, .5), .55)});`;
      case "tiger": return `background-image: repeating-linear-gradient(115deg, transparent 0 18px, ${alpha("#000000", .35)} 18px 24px, transparent 24px 46px, ${alpha("#000000", .25)} 46px 50px), linear-gradient(135deg, ${a}, ${b});`;
      case "web": return `background-image: repeating-radial-gradient(circle at 0 0, transparent 0 34px, ${alpha("#000000", .55)} 35px 36px), repeating-conic-gradient(from 0deg at 0 0, transparent 0 9deg, ${alpha("#000000", .45)} 9deg 9.6deg);`;
      case "damascus": return `background-image: repeating-radial-gradient(ellipse 120% 40% at 50% 120%, ${alpha("#ffffff", .07)} 0 6px, transparent 6px 14px), linear-gradient(180deg, ${lighten(c.bg, .08)}, ${c.bg});`;
      default: return "";
    }
  }

  function headCss(k, c, dark) {
    const a = c.accent, b = c["accent-2"], clip = "-webkit-background-clip: text; background-clip: text; color: transparent;";
    switch (k) {
      case "metal": { let d = darken(a, .45); const l = lighten(a, .55); if (dark && lum(d) < .32) d = mix(d, l, .42); return `background-image: linear-gradient(100deg, transparent 35%, ${alpha("#ffffff", .55)} 50%, transparent 65%), linear-gradient(180deg, ${d} 28%, ${l} 50%, ${mix(d, l, .35)} 54%, ${d} 74%); background-size: 250% 100%, 100% 100%; ${clip} animation: uvt-sheen 7s ease-in-out infinite;`; }
      case "chrome": return dark ? `background-image: linear-gradient(180deg, #ffffff 0%, #c9ced6 38%, #3b4048 50%, #dfe3ea 62%, #ffffff 100%); ${clip} filter: drop-shadow(0 1px 0 ${alpha("#000000", .35)});` : `background-image: linear-gradient(180deg, #3a404a 0%, #9aa3b0 40%, #1e232b 52%, #6b7480 68%, #2a2f38 100%); ${clip} filter: drop-shadow(0 1px 0 #ffffff);`;
      case "gradient": return `background-image: linear-gradient(90deg, ${a}, ${b}); ${clip}`;
      case "holo": return `background-image: linear-gradient(115deg, ${dark ? "#ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6" : "#c2369f, #2f7fc4, #2f9e45, #b8901a, #c2369f"}); background-size: 300% 100%; ${clip} animation: uvt-holo 8s linear infinite;`;
      case "pearl": return `background-image: linear-gradient(115deg, #4f3f86, #9a86d8 30%, #3f93b8 50%, #a88a3e 70%, #4f3f86); background-size: 250% 100%; ${clip} animation: uvt-holo 10s linear infinite;`;
      case "outline": return `color: transparent; -webkit-text-stroke: 1.5px ${c.text};`;
      case "glow": return `color: ${lighten(a, .55)}; text-shadow: 0 0 6px ${alpha(a, .9)}, 0 0 22px ${alpha(a, .6)}, 0 0 48px ${alpha(a, .35)};`;
      case "shadow3d": return "text-shadow: " + [1, 2, 3, 4, 5].map(i => `${i}px ${i}px 0 ${a}`).join(", ") + ";";
      case "duotone": return `color: ${c.text}; text-shadow: 3px 3px 0 ${alpha(a, .9)};`;
      case "fire": return `background-image: linear-gradient(0deg, #ff3d00, #ffb300 55%, #fff3c4); ${clip}`;
      default: return "";
    }
  }

  function btnCss(k, c, dark) {
    const a = c.accent, b = c["accent-2"], t = c.text, bg = c.bg;
    switch (k) {
      case "solid": return `background: ${a}; color: ${on(a)}; border-color: ${a};`;
      case "ink": return `background: ${t}; color: ${bg}; border-color: ${t};`;
      case "outline": return `background: transparent; color: ${lum(a) < .8 || dark ? a : t}; border: 1.5px solid currentColor;`;
      case "hard": return `background: ${a}; color: ${on(a)}; border: 2px solid ${t}; box-shadow: 4px 4px 0 ${t};`;
      case "glow": return `background: ${a}; color: ${on(a)}; border-color: ${a}; box-shadow: 0 0 18px -2px ${a}, inset 0 1px 0 ${alpha("#ffffff", .35)};`;
      case "gradient": return `background: linear-gradient(135deg, ${a}, ${b}); color: ${on(mix(a, b, .5))}; border-color: transparent;`;
      case "metal": return `background: linear-gradient(180deg, ${lighten(a, .55)} 0%, ${lighten(a, .15)} 45%, ${darken(a, .25)} 55%, ${lighten(a, .1)} 100%); color: #fff; text-shadow: 0 1px 0 ${alpha("#000000", .45)}; border: 1px solid ${darken(a, .4)}; box-shadow: inset 0 1px 0 ${alpha("#ffffff", .7)}, 0 4px 12px -4px ${alpha(darken(a, .4), .6)};`;
      case "chrome": return "background: linear-gradient(180deg, #ffffff, #d7dbe2 45%, #8b929c 52%, #e9ecf1); color: #1b1f26; border: 1px solid #8b929c; box-shadow: inset 0 1px 0 #fff, 0 3px 10px -4px #0007;";
      case "pearl": return "background: linear-gradient(115deg, #ffffff, #f2e6ff 30%, #e2f5ff 55%, #fff5e1 80%, #ffffff); background-size: 200% 100%; color: #3a2f5a; border: 1px solid #d9cfee; box-shadow: inset 0 1px 0 #fff, 0 6px 16px -8px #7a6a9e88;";
      case "glass": return `background: ${alpha("#ffffff", dark ? .16 : .45)}; color: ${t}; border: 1px solid ${alpha("#ffffff", dark ? .38 : .8)}; backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px); box-shadow: inset 0 1px 0 ${alpha("#ffffff", .4)};`;
      case "bevel": return `background: ${c["surface-2"]}; color: ${t}; border: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px #fff, inset -2px -2px ${mix(c["surface-2"], "#000000", .35)}, inset 2px 2px ${mix(c["surface-2"], "#ffffff", .5)};`;
      case "soft": return `background: ${alpha(a, .16)}; color: ${dark ? lighten(a, .3) : darken(a, .25)}; border-color: transparent;`;
      case "3d": return `background: ${a}; color: ${on(a)}; border-color: ${a}; box-shadow: 0 5px 0 ${darken(a, .35)};`;
      case "neon": return `background: transparent; color: ${lighten(a, .3)}; border: 1.5px solid ${a}; text-shadow: 0 0 8px ${a}; box-shadow: 0 0 12px -2px ${a}, inset 0 0 10px -4px ${a};`;
      case "underline": return `background: transparent; color: ${t}; border-color: transparent; text-decoration: underline; text-decoration-color: ${a}; text-decoration-thickness: 2px; text-underline-offset: 5px;`;
      case "stamp": return `background: transparent; color: ${a}; border: 2px double ${a}; text-transform: uppercase; letter-spacing: .14em;`;
      default: return "";
    }
  }

  function hoverCss(k, sel, c) {
    const a = c.accent, t = c.text, h = `${sel} .uv-btn:hover`;
    const base = `${sel} .uv-btn { transition: translate .2s cubic-bezier(.2,.8,.2,1), scale .2s cubic-bezier(.3,1.5,.5,1), rotate .2s, background .2s, color .2s, box-shadow .25s, border-color .2s, filter .2s; }\n`;
    const r = {
      lift: `${h} { translate: 0 -2px; filter: brightness(1.05); } ${sel} .uv-btn:active { translate: 0 1px; }`,
      shine: `${sel} .uv-btn::after { content: ''; position: absolute; inset: 0; z-index: 0; pointer-events: none; background: linear-gradient(110deg, transparent 35%, ${alpha("#ffffff", .5)} 50%, transparent 65%); translate: -120% 0; transition: translate .7s; } ${h}::after { translate: 120% 0; }`,
      glow: `${h} { box-shadow: 0 0 0 3px ${alpha(a, .25)}, 0 0 26px -2px ${alpha(a, .7)}; }`,
      press: `${h} { filter: brightness(1.08); } ${sel} .uv-btn:active { scale: .94; }`,
      fill: `${sel} .uv-btn--ghost:hover, ${sel} .uv-btn:not(.uv-btn--primary):hover { background: ${a}; color: ${on(a)}; border-color: ${a}; }`,
      invert: `${h} { background: ${t}; color: ${c.bg}; border-color: ${t}; }`,
      wobble: `${h} { animation: uvt-wob .5s; }`, jelly: `${h} { animation: uvt-jelly .55s; }`, bounce: `${h} { animation: uvt-bounce .5s; }`,
      tilt: `${h} { rotate: -2deg; scale: 1.03; }`, pop: `${h} { scale: 1.06; } ${sel} .uv-btn:active { scale: .96; }`,
      sink: `${h} { translate: 2px 2px; box-shadow: 1px 1px 0 ${t}; } ${sel} .uv-btn:active { translate: 4px 4px; box-shadow: none; }`,
      ring: `${h} { outline: 2px solid ${a}; outline-offset: 3px; }`,
      pulse: `${h} { box-shadow: 0 0 0 0 ${alpha(a, .55)}; animation: uvt-pulse 1.2s infinite; }`,
      flicker: `${h} { animation: uv-flick 1.6s infinite; filter: brightness(1.25); }`,
    };
    const card = { tilt: `${sel} .uv-card--hover:hover { rotate: -1deg; }`, glow: `${sel} .uv-card--hover:hover { box-shadow: 0 0 0 1px ${alpha(a, .5)}, 0 0 30px -8px ${a}; }`, sink: `${sel} .uv-card--hover:hover { translate: 3px 3px; }`, pop: `${sel} .uv-card--hover:hover { scale: 1.02; }` };
    return base + (r[k] || "") + "\n" + (card[k] || `${sel} .uv-card--hover:hover { translate: 0 -4px; }`);
  }

  function cardCss(k, c, dark) {
    const a = c.accent, b = c["accent-2"], t = c.text;
    switch (k) {
      case "soft": return `border-color: transparent; box-shadow: 0 1px 2px ${alpha(t, .06)}, 0 14px 34px -14px ${alpha(dark ? darken(c.bg, .6) : t, .35)};`;
      case "hard": return `border: 2px solid ${t}; box-shadow: 6px 6px 0 ${t};`;
      case "glass": return `background: ${alpha("#ffffff", dark ? .08 : .45)}; border: 1px solid ${alpha("#ffffff", dark ? .22 : .75)}; backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3); box-shadow: inset 0 1px 0 ${alpha("#ffffff", .3)}, 0 18px 40px -20px ${alpha("#000000", .45)};`;
      case "bevel": return `border: 0; box-shadow: inset -1px -1px #0a0a0a, inset 1px 1px ${mix(c.surface, "#ffffff", .6)}, inset -2px -2px ${mix(c.surface, "#000000", .3)}, inset 2px 2px #fff;`;
      case "gradient-border": return `border: 1.5px solid transparent; background: linear-gradient(${c.surface}, ${c.surface}) padding-box, linear-gradient(135deg, ${a}, ${b}) border-box;`;
      case "inset": return `background: ${c["surface-2"]}; border-color: transparent; box-shadow: inset 0 2px 8px ${alpha("#000000", .18)};`;
      case "outline": return `border: 2px solid ${t}; box-shadow: none;`;
      case "glow": return `border-color: ${alpha(a, .45)}; box-shadow: 0 0 0 1px ${alpha(a, .2)}, 0 0 40px -14px ${a};`;
      case "notch": return `border: 0; border-radius: 0; background: linear-gradient(135deg, transparent 14px, ${c.surface} 14px); clip-path: polygon(14px 0, 100% 0, 100% calc(100% - 14px), calc(100% - 14px) 100%, 0 100%, 0 14px); box-shadow: inset 0 0 0 1px ${alpha(a, .5)};`;
      case "double": return `border: 3px double ${alpha(t, .6)};`;
      case "metal": return `background: repeating-linear-gradient(90deg, ${alpha("#ffffff", .04)} 0 1px, transparent 1px 3px), linear-gradient(180deg, ${lighten(c.surface, .08)}, ${c.surface}); border-color: ${alpha("#ffffff", .18)}; box-shadow: inset 0 1px 0 ${alpha("#ffffff", .25)};`;
      case "pearl": return "background: linear-gradient(135deg, #ffffffee, #f6efffdd 40%, #eaf8ffdd 70%, #fffaf0ee); border: 1px solid #e3d8f5; box-shadow: inset 0 1px 0 #fff, 0 18px 40px -22px #7a6a9e88;";
      case "paper": return `background: ${c.surface} linear-gradient(${alpha(b, .14)} 1px, transparent 1px) 0 0 / 100% 26px; box-shadow: 2px 3px 0 ${alpha(t, .12)};`;
      default: return "";
    }
  }

  /** Same as tools/build.py scope_nearest(): theme rules stop at nested themes, so the closest theme wins. */
  function scopeNearest(css, name) {
    const root = `[data-uv-theme="${name}"]`, guard = `:not(${root} [data-uv-theme]:not(${root}) *)`;
    return css.replace(/([^{}]+)\{/g, (m, sels) => {
      if (sels.trim().startsWith("@")) return m;
      return sels.split(",").map(part => {
        const p = part.trim();
        if (!p.startsWith(root + " ")) return part;
        const pe = p.match(/::[\w-]+$/);
        return " " + (pe ? p.slice(0, pe.index) + guard + pe[0] : p + guard);
      }).join(",") + " {";
    });
  }

  /** spec: {name, bg, fg, ac, ac2, font, head, shape, bw, weight, upper, background, heading, button, hover, card} */
  function css(s) {
    const [c, dark] = derive(s), sel = `[data-uv-theme="${s.name}"]`, r = SHAPES[s.shape || "soft"];
    const toks = Object.entries(c).map(([k, v]) => `--uv-${k}: ${v}`).join("; ");
    const head = FONTS[s.head || "serif"], body = FONTS[s.font || "geist"];
    const w = s.weight || (["serif", "cormorant", "dmserif"].includes(s.head) ? 400 : 700);
    const out = [`${sel} {\n  ${toks};\n  --uv-font: ${body}; --uv-font-head: ${head}; --uv-serif: ${head}; --uv-btn-font: ${body};\n  --uv-r-xs: ${r[0]}px; --uv-r-sm: ${r[0]}px; --uv-r: ${r[1]}px; --uv-r-lg: ${r[2]}px; --uv-bw: ${s.bw ?? 1}px;\n  --uv-head-weight: ${w}; --uv-head-case: ${s.upper ? "uppercase" : "none"};${dark ? "\n  color-scheme: dark;" : ""}\n  ${bgCss(s.background, c, dark)}\n}`];
    const hc = headCss(s.heading, c, dark); if (hc) out.push(`${sel} .uv-h1, ${sel} .uv-h2 { ${hc} }`);
    if (s.upper) out.push(`${sel} .uv-btn { text-transform: uppercase; letter-spacing: .08em; }`);
    const bc = btnCss(s.button, c, dark); if (bc) out.push(`${sel} .uv-btn--primary, ${sel} .uv-btn--grad { ${bc} }`);
    out.push(`${sel} .uv-btn--primary:hover { filter: brightness(1.06); }`);
    const cc = cardCss(s.card, c, dark); if (cc) out.push(`${sel} .uv-card { ${cc} }`);
    out.push(`${sel} .uv-tabs > .uv-tabs__ind { background: ${c.accent}; } ${sel} .uv-tabs > button[aria-selected="true"] { color: ${on(c.accent)}; }`);
    out.push(`${sel} .uv-switch input:checked + i, ${sel} .uv-check input:checked { background: ${c.accent}; border-color: ${c.accent}; }`);
    out.push(`${sel} .uv-progress > i { background: ${c.accent}; } ${sel} .uv-ring { background: conic-gradient(${c.accent} calc(var(--v) * 1%), var(--uv-line-2) 0); }`);
    out.push(`${sel} .uv-input:focus, ${sel} .uv-select:focus { border-color: ${c.accent}; box-shadow: 0 0 0 3px ${alpha(c.accent, .22)}; }`);
    out.push(hoverCss(s.hover, sel, c));
    return scopeNearest(out.join("\n") + "\n", s.name);
  }

  function tokens(s) {
    const [c, dark] = derive(s), solid = {};
    const bgc = rgb(c.bg);
    for (const [k, v] of Object.entries(c)) {
      const [r, g, b] = rgb(v.slice(0, 7)), a = v.length > 7 ? parseInt(v.slice(7, 9), 16) / 255 : 1;
      solid[k] = hex([r, g, b].map((x, i) => x * a + bgc[i] * (1 - a)));
    }
    return { colors: c, solid, dark, shape: SHAPES[s.shape || "soft"], fonts: { font: FONTS[s.font || "geist"], head: FONTS[s.head || "serif"] } };
  }

  window.ThemeEngine = { css, tokens, derive, FONTS, SHAPES, RECIPES, mix, alpha, lum };
})();
