#!/usr/bin/env python3
"""Build UI Vault: per-theme CSS, full bundles, manifest.json and the downloadable zip.

Run from the repo root after editing anything in lib/css or lib/js:
    python3 tools/build.py
"""
import json, re, zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
LIB, CSS, JS, DL = ROOT / "lib", ROOT / "lib" / "css", ROOT / "lib" / "js", ROOT / "downloads"
VERSION = "3.0.0"
CSS_ORDER = ["core", "components", "fx", "blocks"]
JS_ORDER = ["core", "motion", "feedback", "forms", "fx"]
DESC = {
    "core.css": "Tokens, light/dark, base helpers. Required.",
    "components.css": "Buttons, cards, forms, tabs, badges, overlays, nav, data, loaders, backgrounds.",
    "fx.css": "60+ uv-fx-* effect mixins: glitch, chrome, holo, neon, CRT, sticker, stamp, jelly…",
    "blocks.css": "Section layouts (b-*) used by the 38 page blocks. Container-query responsive.",
    "themes.css": "All 12 themes in one file.",
    "core.js": "UV namespace, module registry, UV.init, UV.theme, UV.skin. Required.",
    "motion.js": "countUp, typewriter, scramble, reveal, tilt, magnetic, spotlight, ripple, parallax, ring.",
    "feedback.js": "toast, modal, ⌘K palette, confetti, synthesized sounds, copy.",
    "forms.js": "Tabs with sliding indicator, OTP, range, file drop.",
    "fx.js": "Canvas + pointer effects: matrix, starfield, particles, snow, cursor trail/blob, sparkles, magnet, gravity, fireworks.",
}


def split_themes():
    src = (CSS / "themes.src.css").read_text()
    parts = re.split(r"/\* @theme (\w[\w-]*) — (.*?) \*/\n", src)
    themes, out_dir = [], CSS / "themes"
    out_dir.mkdir(exist_ok=True)
    for i in range(1, len(parts), 3):
        name, desc, body = parts[i], parts[i + 1], parts[i + 2].strip() + "\n"
        (out_dir / f"{name}.css").write_text(f"/*! UI Vault {VERSION} · theme: {name} — {desc}. Needs core.css. MIT */\n{body}")
        themes.append({"name": name, "desc": desc, "file": f"css/themes/{name}.css"})
    (CSS / "themes.css").write_text(f"/*! UI Vault {VERSION} · all themes. MIT */\n" + "\n".join((out_dir / f"{t['name']}.css").read_text() for t in themes))
    return themes


def bundle(themes):
    css = "\n".join((CSS / f"{m}.css").read_text() for m in CSS_ORDER) + "\n" + (CSS / "themes.css").read_text()
    banner = f"/*! UI Vault {VERSION} — full bundle (core + components + fx + blocks + {len(themes)} themes). MIT. https://thenameiscobmarley.github.io/ui-vault/ */\n"
    (LIB / "uivault.css").write_text(banner + css)
    js = "\n".join((JS / f"{m}.js").read_text() for m in JS_ORDER)
    (LIB / "uivault.js").write_text(f"/*! UI Vault {VERSION} — full bundle ({', '.join(JS_ORDER)}). MIT */\n" + js)


STARTER = """<!doctype html>
<html lang="en" data-uv-theme="editorial">
<head>
  <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
  <title>UI Vault starter</title>
  <link href="https://fonts.googleapis.com/css2?family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500&family=Instrument+Serif:ital@0;1&family=Space+Grotesk:wght@500;700&family=VT323&family=Patrick+Hand&display=swap" rel="stylesheet">
  <!-- Option A: everything -->
  <link rel="stylesheet" href="../uivault.css">
  <!-- Option B: pick modules instead (comment out Option A):
  <link rel="stylesheet" href="../css/core.css">
  <link rel="stylesheet" href="../css/components.css">
  <link rel="stylesheet" href="../css/fx.css">
  <link rel="stylesheet" href="../css/themes/neon.css"> -->
</head>
<body class="uv" style="margin:0">
  <main style="max-width:880px;margin:0 auto;padding:64px 24px;display:grid;gap:24px">
    <p class="uv-eyebrow">UI Vault starter</p>
    <h1 class="uv-h1">Hello, <em class="uv-muted">mix and match.</em></h1>
    <div class="uv-row">
      <button class="uv-btn uv-btn--primary" data-uv="ripple" data-uv-confetti>Primary</button>
      <button class="uv-btn uv-btn--ghost" data-uv="magnetic">Magnetic</button>
      <button class="uv-btn" onclick="UV.toast('It works!', {type:'success'})">Toast</button>
    </div>
    <!-- Any element can carry its own theme: -->
    <section data-uv-theme="neon" style="padding:28px;border-radius:12px">
      <h2 class="uv-h2 uv-fx-glitch">Neon section</h2>
      <p class="uv-muted">This block uses the neon theme inside an editorial page.</p>
      <button class="uv-btn uv-btn--primary">Neon button</button>
    </section>
    <section data-uv-theme="brutal" style="padding:28px">
      <h2 class="uv-h2">Brutal section</h2>
      <div class="uv-card uv-fx-wobble" style="margin-top:12px">Cards, buttons and inputs all adapt.</div>
    </section>
    <section data-uv-theme="terminal" data-uv-fx="matrix" style="padding:28px;min-height:160px">
      <h2 class="uv-h2" style="position:relative">Terminal + matrix rain</h2>
    </section>
  </main>
  <script src="../uivault.js"></script>
</body>
</html>
"""

README = f"""# UI Vault {VERSION}

Modular, framework-free UI kit. Mix themes, components and effects per element.

## Quick start
1. Copy `uivault.css` and `uivault.js` into your project (or pick modules from `css/` and `js/`).
2. Add them to your page:
   <link rel="stylesheet" href="uivault.css">
   <script src="uivault.js" defer></script>
3. Use classes and attributes:
   <button class="uv-btn uv-btn--primary" data-uv="ripple">Hello</button>
   <section data-uv-theme="neon">Any element can have its own theme.</section>
   <h1 class="uv-fx-glitch">Effects are stackable classes.</h1>

Open `examples/index.html` for a working page.

## Modules
CSS (load core first): core, components, fx, blocks, themes/<name>  (or uivault.css = all)
JS  (load core first): core, motion, feedback, forms, fx            (or uivault.js = all)

Themes: editorial, brutal, neon, glass, terminal, soft, retro, swiss, y2k, mono, sketch, luxe
Docs: https://thenameiscobmarley.github.io/ui-vault/quickstart.html

MIT licensed.
"""


TOKEN_KEYS = ["bg", "surface", "surface-2", "surface-3", "line", "line-2", "text", "muted", "dim", "accent", "accent-2",
              "success", "warn", "danger", "info", "font", "font-head", "mono", "r-xs", "r-sm", "r", "r-lg", "bw"]


def _hex(c):
    c = c.strip().lstrip("#")
    if len(c) in (3, 4): c = "".join(ch * 2 for ch in c)
    if len(c) == 6: c += "ff"
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4, 6))


def export_tokens(themes):
    """lib/tokens.json — every theme as plain values for the Python and C++ APIs."""
    decl = lambda block: dict(re.findall(r"--uv-([\w-]+):\s*([^;]+);", block))
    core = (CSS / "core.css").read_text()
    base = decl(core[core.index(":root {"):core.index("}", core.index(":root {"))])
    base.update(decl(core[core.index(":root, [data-uv-theme] {"):]))
    src = (CSS / "themes.src.css").read_text()
    out = {}
    for t in themes:
        m = re.search(r'\[data-uv-theme="%s"\] \{(.*?)\n\}' % t["name"], src, re.S)
        vals = dict(base); vals.update(decl(m.group(1)))
        for _ in range(3):  # resolve var(--uv-x) references
            vals = {k: re.sub(r"var\(--uv-([\w-]+)\)", lambda mm: vals.get(mm.group(1), ""), v) for k, v in vals.items()}
        bg = _hex(vals["bg"])
        tok = {"name": t["name"], "desc": t["desc"], "colors": {}, "solid": {}, "fonts": {}, "shape": {}}
        for k in TOKEN_KEYS:
            v = vals.get(k, "").strip()
            if v.startswith("#"):
                r, g, b, a = _hex(v)
                tok["colors"][k] = "#%02x%02x%02x%02x" % (r, g, b, a)
                f = a / 255  # composite over bg → opaque colour for toolkits without alpha
                tok["solid"][k] = "#%02x%02x%02x" % tuple(round(c * f + bc * (1 - f)) for c, bc in zip((r, g, b), bg[:3]))
            elif k in ("font", "font-head", "mono"):
                tok["fonts"][k] = v
                tok["fonts"][k + "-family"] = re.sub(r'^["\']|["\']$', "", v.split(",")[0].strip())
            elif k.startswith("r") or k == "bw":
                num = re.match(r"[\d.]+", v)
                tok["shape"][k] = float(num.group()) if num else 0.0
        lum = (0.2126 * bg[0] + 0.7152 * bg[1] + 0.0722 * bg[2]) / 255
        tok["dark"] = lum < 0.5
        out[t["name"]] = tok
    data = {"version": VERSION, "themes": out}
    (LIB / "tokens.json").write_text(json.dumps(data, indent=1))
    py = ROOT / "python" / "uivault"
    if py.exists(): (py / "tokens.json").write_text(json.dumps(data, indent=1))
    return data


CPP_KEYS = [("bg", "bg"), ("surface", "surface"), ("surface-2", "surface2"), ("surface-3", "surface3"), ("line", "line"),
            ("line-2", "line2"), ("text", "text"), ("muted", "muted"), ("dim", "dim"), ("accent", "accent"), ("accent-2", "accent2"),
            ("success", "success"), ("warn", "warn"), ("danger", "danger"), ("info", "info")]


def export_cpp(tokens):
    """cpp/uivault.hpp — single-header C++ API generated from tools/uivault.hpp.in + tokens."""
    def col(h):
        h = h.lstrip("#"); h = h + "ff" if len(h) == 6 else h
        return "Color{%d, %d, %d, %d}" % tuple(int(h[i:i + 2], 16) for i in (0, 2, 4, 6))
    q = lambda v: '"' + v.replace("\\", "\\\\").replace('"', '\\"') + '"'
    out = []
    for name, t in tokens["themes"].items():
        pal = lambda src: "Palette{" + ", ".join(col(src.get(k, t["colors"]["text"])) for k, _ in CPP_KEYS) + "}"
        sh = t["shape"]
        out.append(f"/// {t['desc']}\ninline constexpr Theme {name}{{ {q(name)}, {q(t['desc'])}, {'true' if t['dark'] else 'false'},\n"
                   f"    {pal(t['colors'])},\n    {pal(t['solid'])},\n"
                   f"    {q(t['fonts'].get('font', ''))}, {q(t['fonts'].get('font-head', ''))}, {q(t['fonts'].get('mono', ''))},\n"
                   f"    {float(sh.get('r-xs', 0))!r}f, {float(sh.get('r-sm', 0))!r}f, {float(sh.get('r', 0))!r}f, {float(sh.get('r-lg', 0))!r}f, {float(sh.get('bw', 1))!r}f }};")
    names = list(tokens["themes"])
    out.append("inline constexpr const Theme* themes[] = { " + ", ".join("&" + n for n in names) + " };")
    out.append(f"inline constexpr int themeCount = {len(names)};")
    out.append("/// Find a theme by name; returns nullptr if unknown.\ninline const Theme* find(const char* name) {\n"
               "    for (const Theme* t : themes) if (std::strcmp(t->name, name) == 0) return t;\n    return nullptr;\n}")
    tpl = (ROOT / "tools" / "uivault.hpp.in").read_text()
    (ROOT / "cpp").mkdir(exist_ok=True)
    (ROOT / "cpp" / "uivault.hpp").write_text(tpl.replace("@VERSION@", VERSION).replace("@THEMES@", "\n\n".join(out)))


def raw_src():
    """lib/raw-src.js: CSS bundle text + JS module sources, used by the site's "Raw code" view."""
    src = {"css": (LIB / "uivault.css").read_text(), "js": {m: (JS / f"{m}.js").read_text() for m in JS_ORDER}}
    (LIB / "raw-src.js").write_text("window.UV_SRC = " + json.dumps(src, ensure_ascii=False) + ";\n")


def manifest(themes):
    files = []
    for p in sorted(LIB.rglob("*")):
        if p.is_file() and p.suffix in (".css", ".js") and p.name not in ("themes.src.css", "manifest.js", "raw-src.js"):
            rel = p.relative_to(LIB).as_posix()
            files.append({"path": rel, "bytes": p.stat().st_size, "desc": DESC.get(p.name, "")})
    m = {"version": VERSION, "css": CSS_ORDER, "js": JS_ORDER, "themes": themes, "files": files}
    (LIB / "manifest.json").write_text(json.dumps(m, indent=1, ensure_ascii=False))
    (LIB / "manifest.js").write_text("window.UV_MANIFEST = " + json.dumps(m, ensure_ascii=False) + ";\n")
    return m


def make_zip(m):
    DL.mkdir(exist_ok=True)
    for name in (f"uivault-{VERSION}.zip", "uivault-latest.zip"):
        with zipfile.ZipFile(DL / name, "w", zipfile.ZIP_DEFLATED) as z:
            for f in m["files"]:
                z.write(LIB / f["path"], f"uivault/{f['path']}")
            z.writestr("uivault/manifest.json", (LIB / "manifest.json").read_text())
            z.writestr("uivault/examples/index.html", STARTER)
            z.writestr("uivault/README.md", README)
            z.write(ROOT / "LICENSE", "uivault/LICENSE")


if __name__ == "__main__":
    themes = split_themes()
    bundle(themes)
    tokens = export_tokens(themes)
    export_cpp(tokens)
    raw_src()
    m = manifest(themes)
    make_zip(m)
    total = sum(f["bytes"] for f in m["files"])
    print(f"UI Vault {VERSION}: {len(themes)} themes, {len(m['files'])} files, {total // 1024} KB → downloads/uivault-{VERSION}.zip")
