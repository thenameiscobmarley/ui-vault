"""Command line: python -m uivault [list [--CATEGORY] | show THEME | parts [FAMILY] | kits | export FORMAT THEME [--kit KIT] | demo [THEME] [--kit KIT]]"""
import sys

import uivault

FORMATS = {"css": uivault.css, "qss": uivault.qss, "tcss": uivault.tcss, "gtk": uivault.gtk_css}


def swatch(hexcol, label):
    r, g, b = (int(hexcol[i:i + 2], 16) for i in (1, 3, 5))
    return f"\x1b[48;2;{r};{g};{b}m      \x1b[0m {label:<10} {hexcol}"


def main(argv):
    kit = None
    if "--kit" in argv:
        i = argv.index("--kit"); kit = argv[i + 1] if i + 1 < len(argv) else None; argv = argv[:i] + argv[i + 2:]
    cmd = argv[0] if argv else "list"
    if cmd == "list":
        flt = next((a.lstrip("-") for a in argv[1:]), None)
        cat = next((c for c in uivault.categories() if flt and c.lower() == flt.lower()), None)
        for n in uivault.themes(cat):
            t = uivault.theme(n)
            r, g, b = (int(t.solid("accent")[i:i + 2], 16) for i in (1, 3, 5))
            print(f"\x1b[38;2;{r};{g};{b}m●\x1b[0m {n:<10} {t.description}")
    elif cmd == "show":
        t = uivault.theme(argv[1] if len(argv) > 1 else "editorial")
        print(f"{t.name} — {t.description}  ({'dark' if t.dark else 'light'})\n")
        for k in t.colors:
            print(swatch(t.solid(k), k))
        print(f"\nfonts: {t.font} / {t.font_head} / {t.mono}   radius: {t.radius:g}px   border: {t.border:g}px")
    elif cmd == "parts":
        fams = [argv[1]] if len(argv) > 1 else uivault.families()
        for f in fams:
            names = uivault.parts(f)
            print(f"\x1b[1m{f}\x1b[0m ({len(names)}): " + ", ".join(names))
    elif cmd == "kits":
        for n in uivault.kits():
            k = uivault.kit(n)
            print(f"\x1b[1m{n:<12}\x1b[0m {k['label']} · theme {k['theme']} · {k['desc']}")
    elif cmd == "export":
        if len(argv) < 2 or argv[1] not in FORMATS:
            sys.exit(f"usage: python -m uivault export {{{'|'.join(FORMATS)}}} THEME [--kit KIT]")
        t = argv[2] if len(argv) > 2 else None
        if argv[1] == "qss": print(uivault.qss(t, kit=kit))
        elif argv[1] == "gtk": print(uivault.gtk_css(t, kit=kit))
        else: print(FORMATS[argv[1]](t or "editorial"))
    elif cmd == "demo":
        from uivault.demo_tk import run
        run(argv[1] if len(argv) > 1 else None, kit=kit)
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
