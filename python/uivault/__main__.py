"""Command line: python -m uivault [list | show THEME | export FORMAT THEME | demo [THEME]]"""
import sys

import uivault

FORMATS = {"css": uivault.css, "qss": uivault.qss, "tcss": uivault.tcss, "gtk": uivault.gtk_css}


def swatch(hexcol, label):
    r, g, b = (int(hexcol[i:i + 2], 16) for i in (1, 3, 5))
    return f"\x1b[48;2;{r};{g};{b}m      \x1b[0m {label:<10} {hexcol}"


def main(argv):
    cmd = argv[0] if argv else "list"
    if cmd == "list":
        for n in uivault.themes():
            t = uivault.theme(n)
            r, g, b = (int(t.solid("accent")[i:i + 2], 16) for i in (1, 3, 5))
            print(f"\x1b[38;2;{r};{g};{b}m●\x1b[0m {n:<10} {t.description}")
    elif cmd == "show":
        t = uivault.theme(argv[1] if len(argv) > 1 else "editorial")
        print(f"{t.name} — {t.description}  ({'dark' if t.dark else 'light'})\n")
        for k in t.colors:
            print(swatch(t.solid(k), k))
        print(f"\nfonts: {t.font} / {t.font_head} / {t.mono}   radius: {t.radius:g}px   border: {t.border:g}px")
    elif cmd == "export":
        if len(argv) < 3 or argv[1] not in FORMATS:
            sys.exit(f"usage: python -m uivault export {{{'|'.join(FORMATS)}}} THEME")
        print(FORMATS[argv[1]](argv[2]))
    elif cmd == "demo":
        from uivault.demo_tk import run
        run(argv[1] if len(argv) > 1 else "editorial")
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main(sys.argv[1:])
