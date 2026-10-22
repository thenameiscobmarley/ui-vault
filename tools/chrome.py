#!/usr/bin/env python3
"""Write the shared site chrome (header, mobile sheet, footer) into every top-level page.

Idempotent: everything it writes sits between <!-- uvc:NAME --> / <!-- /uvc:NAME --> markers,
so run it again after editing NAV or FOOT below.  Styles: assets/css/chrome.css,
behaviour (menus, mobile sheet, Ctrl/Cmd+K search): assets/js/chrome.js.

    python3 tools/chrome.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPO = "https://github.com/thenameiscobmarley/ui-vault"
VERSION = "3.1"

ICON = {
    "bolt": '<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',
    "book": '<path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 21.5A2.5 2.5 0 0 1 6.5 19H20"/>',
    "list": '<path d="M8 6h13M8 12h13M8 18h13"/><circle cx="3.5" cy="6" r="1"/><circle cx="3.5" cy="12" r="1"/><circle cx="3.5" cy="18" r="1"/>',
    "grid": '<rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/>',
    "palette": '<path d="M12 3a9 9 0 1 0 0 18c1 0 1.6-.8 1.6-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-.9.8-1.7 1.7-1.7H16a5 5 0 0 0 5-5C21 6.6 17 3 12 3z"/><circle cx="7.5" cy="11" r="1.2"/><circle cx="10" cy="7" r="1.2"/><circle cx="15" cy="7" r="1.2"/>',
    "toggle": '<rect x="2" y="7" width="20" height="10" rx="5"/><circle cx="16" cy="12" r="3"/>',
    "cube": '<path d="m12 2 9 5v10l-9 5-9-5V7z"/><path d="m3 7 9 5 9-5M12 12v10"/>',
    "layers": '<path d="m12 2 10 5-10 5L2 7z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
    "frame": '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M9 21V9"/>',
    "star": '<path d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1L3.2 9.5l6.1-.9z"/>',
    "flask": '<path d="M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3"/><path d="M7 15h10"/>',
    "scroll": '<rect x="6" y="2" width="12" height="20" rx="6"/><path d="M12 6v4"/>',
    "code": '<path d="m8 7-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"/>',
    "download": '<path d="M12 3v12m0 0-5-5m5 5 5-5M4 21h16"/>',
}


def svg(name, size=None):
    s = f' width="{size}" height="{size}"' if size else ""
    return f'<svg viewBox="0 0 24 24"{s} fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{ICON[name]}</svg>'


# (label, [(title, href, blurb, icon)], featured (title, href, blurb, tag) | None)
NAV = [
    ("Start", [
        ("Quick start", "quickstart.html", "Install in two minutes, zip only what you use", "bolt"),
        ("Docs", "docs.html", "Every component and function, with live examples", "book"),
        ("Python & C++", "code.html", "The same themes for Qt, Tk, GTK, ImGui and JUCE", "code"),
        ("Index", "directory.html", "Search all 1,700 things on the site", "list"),
    ], ("Download the API", "downloads/uivault-latest.zip", "uivault.css + uivault.js, MIT, no build step", ".zip")),
    ("Design", [
        ("Library", "library.html", "Everything live in one catalogue, pick and pack", "grid"),
        ("Themes", "themes.html", "87 complete styles and a theme builder", "palette"),
        ("Elements", "elements.html", "273 designs across 15 element families", "toggle"),
        ("3D skins", "skins.html", "26 animated WebGL materials", "cube"),
    ], None),
    ("Build", [
        ("Blocks", "blocks.html", "41 page sections, ready to paste", "layers"),
        ("Showcase", "showcase.html", "30 finished pieces built with the API", "star"),
        ("Test page", "lab.html", "Try any theme on four real layouts", "flask"),
        ("Examples", "examples.html", "Seven scroll-animated websites", "scroll"),
    ], None),
]
LINKS = [("Examples", "examples.html"), ("Library", "library.html")]

FOOT = [
    ("Start", [("Quick start", "quickstart.html"), ("Docs", "docs.html"), ("Python & C++", "code.html"), ("Index", "directory.html")]),
    ("Design", [("Library", "library.html"), ("Themes", "themes.html"), ("Elements", "elements.html"), ("3D skins", "skins.html")]),
    ("Build", [("Blocks", "blocks.html"), ("Showcase", "showcase.html"), ("Test page", "lab.html"), ("Examples", "examples.html")]),
    ("Project", [("GitHub", REPO), ("Releases", REPO + "/tree/main/downloads"), ("Report an issue", REPO + "/issues"), ("MIT licence", REPO + "/blob/main/LICENSE")]),
]

LOGO = ('<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true"><rect x="1" y="1" width="22" height="22" rx="4"/>'
        '<path d="M7 6.5v6.5a5 5 0 0 0 10 0V6.5" fill="none" stroke-width="2.4"/><circle cx="18.5" cy="5.5" r="2.5"/></svg>')
GH = ('<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 0 0-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.5-3.9-1.5-.5-1.3-1.3-1.7-1.3-1.7-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.4 11.4 0 0 1 6 0C17.3 4.7 18.3 5 18.3 5c.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.2c0 .3.2.7.8.6A11.5 11.5 0 0 0 12 .5z"/></svg>')
SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>'
CARET = '<svg viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" aria-hidden="true"><path d="m2 3.5 3 3 3-3"/></svg>'
BURGER = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 8h16M4 16h16"/></svg>'


SITE = "https://thenameiscobmarley.github.io/ui-vault/"


def social(t, page):
    """Open Graph / Twitter tags so shared links get a title, blurb and the hero image."""
    title = re.search(r"<title>(.*?)</title>", t, re.S)
    desc = re.search(r'<meta name="description" content="([^"]*)"', t)
    title = title.group(1).strip() if title else "UI Vault"
    desc = desc.group(1) if desc else "87 themes, 1,200 live pieces and one small CSS + JS API. Free, MIT licensed."
    url = SITE + ("" if page == "./" else page)
    return (f'<meta property="og:type" content="website" /><meta property="og:site_name" content="UI Vault" />'
            f'<meta property="og:title" content="{title}" /><meta property="og:description" content="{desc}" />'
            f'<meta property="og:url" content="{url}" /><meta property="og:image" content="{SITE}assets/og.jpg" />'
            f'<meta property="og:image:width" content="1200" /><meta property="og:image:height" content="630" />'
            f'<meta name="twitter:card" content="summary_large_image" />')


def cur(page, href):
    return ' aria-current="page"' if href == page else ""


def header(page):
    dds = []
    for label, items, feat in NAV:
        here = " cur" if any(h == page for _, h, _, _ in items) and all(h != page for _, h in LINKS) else ""
        links = "".join(f'<a href="{h}"{cur(page, h)}><i>{svg(ic)}</i><b>{t}</b><span>{d}</span></a>' for t, h, d, ic in items)
        if feat:
            t, h, d, tag = feat
            links += f'<a class="uvc-feat" href="{h}" download><b>{t}</b><span>{d}</span><em>{tag} ↓</em></a>'
        dds.append(f'<div class="uvc-dd{here}"><button type="button" aria-expanded="false" aria-haspopup="true">{label}{CARET}</button>'
                   f'<div class="uvc-menu" role="menu">{links}</div></div>')
    plain = "".join(f'<a href="{h}"{cur(page, h)}>{t}</a>' for t, h in LINKS)
    return (f'<header class="uvc-top" id="uvc-top">'
            f'<a class="uvc-brand" href="./" aria-label="UI Vault home">{LOGO}UI&nbsp;Vault<small>{VERSION}</small></a>'
            f'<nav class="uvc-nav" aria-label="Site">{"".join(dds)}{plain}</nav>'
            f'<div class="uvc-end">'
            f'<button class="uvc-search" type="button" data-uvc-search aria-label="Search the site">{SEARCH}<span>Search…</span><kbd>Ctrl K</kbd></button>'
            f'<a class="uvc-icon uvc-gh" href="{REPO}" aria-label="GitHub">{GH}</a>'
            f'<a class="uvc-cta" href="quickstart.html">Get the API</a>'
            f'<button class="uvc-icon uvc-burger" type="button" aria-label="Menu" aria-expanded="false" data-uvc-burger>{BURGER}</button>'
            f'</div></header>'
            f'<div class="uvc-sheet" id="uvc-sheet" aria-label="Site menu">'
            + "".join(f'<h3>{label}</h3>' + "".join(f'<a href="{h}"{cur(page, h)}>{t}<span>{d}</span></a>' for t, h, d, _ in items) for label, items, _ in NAV)
            + f'<h3>Project</h3><a href="{REPO}">GitHub<span>Source, issues, releases</span></a>'
            f'<a href="downloads/uivault-latest.zip" download>Download .zip<span>uivault.css + uivault.js</span></a></div>')


def footer():
    cols = "".join(f'<div><h4>{t}</h4><ul>' + "".join(f'<li><a href="{h}">{n}</a></li>' for n, h in items) + "</ul></div>" for t, items in FOOT)
    return (f'<footer class="uvc-foot"><div class="uvc-foot__in">'
            f'<div class="uvc-foot__lead"><a class="uvc-brand" href="./">{LOGO}UI&nbsp;Vault</a>'
            f'<p>An open interface library: 87 themes, 1,200 pieces and one small API for the web, Python and C++. Free to copy, MIT licensed.</p>'
            f'<div class="uvc-foot__btns"><a href="{REPO}">{GH}Star on GitHub</a><a href="downloads/uivault-latest.zip" download>{svg("download")}Download</a></div></div>'
            f'{cols}</div>'
            f'<div class="uvc-foot__mark" aria-hidden="true">UI Vault<em>.</em></div>'
            f'<div class="uvc-foot__base"><span>© UI Vault contributors · MIT</span><span>Listed third-party projects belong to their authors</span>'
            f'<span>No trackers · no cookies · works offline</span></div></footer>')


def block(name, html):
    return f"<!-- uvc:{name} -->{html}<!-- /uvc:{name} -->"


def put(text, name, html, fallback):
    """Replace an existing marked block, else run fallback(text, block)."""
    pat = re.compile(rf"<!-- uvc:{name} -->.*?<!-- /uvc:{name} -->", re.S)
    b = block(name, html)
    if pat.search(text):
        return pat.sub(lambda _: b, text, count=1)
    return fallback(text, b)


OLD_HEADER = re.compile(r'<header class="(?:top|topbar|bar)"[^>]*>.*?</header>', re.S)
OLD_FOOTERS = [
    re.compile(r'\s*<footer class="footer">.*?</footer>', re.S),                                   # index
    re.compile(r'\s*<footer class="wrap"[^>]*>UI Vault.*?</footer>', re.S),                         # code, quickstart
    re.compile(r'\s*<footer style="max-width:1280px[^>]*>UI Vault Showcase.*?</footer>', re.S),     # showcase
]
APP_PAGES = {"lab.html"}   # full-screen tools: keep their own header, add search only


def before_last_body(s, b):
    """Insert before the real </body> (the last one; earlier ones can sit inside JS template strings)."""
    i = s.rindex("</body>")
    return s[:i] + b + "\n" + s[i:]


def process(path):
    page = "./" if path.name == "index.html" else path.name
    t = path.read_text()
    orig = t
    t = put(t, "css", '<link rel="stylesheet" href="assets/css/chrome.css" />' + social(t, page),
            lambda s, b: s.replace("</head>", f"  {b}\n</head>", 1))
    if path.name in APP_PAGES:
        t = put(t, "header", f'<button class="uvc-icon" type="button" data-uvc-search aria-label="Search the site" title="Search (Ctrl K)">{SEARCH}</button>',
                lambda s, b: s.replace('<nav class="links">', b + '<nav class="links">', 1))
    else:
        t = put(t, "header", header(page), lambda s, b: OLD_HEADER.sub(lambda _: b, s, count=1))
        for rx in OLD_FOOTERS:
            t = rx.sub("", t)
        # footer goes right after the page's last top-level content, before dialogs/scripts
        def add_footer(s, b):
            m = list(re.finditer(r"</main>(?:\s*</div>)?", s))
            if m:
                i = m[-1].end()
                return s[:i] + "\n" + b + s[i:]
            return before_last_body(s, b)
        t = put(t, "footer", footer(), add_footer)
    t = put(t, "js", '<script src="assets/js/chrome.js" defer></script>', before_last_body)
    if t != orig:
        path.write_text(t)
        print("chrome:", path.name)


if __name__ == "__main__":
    for p in sorted(ROOT.glob("*.html")):
        process(p)
