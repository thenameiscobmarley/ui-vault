"""Tkinter demo: python -m uivault demo [theme]. Switch themes live from the dropdown."""
import tkinter as tk
from tkinter import ttk

import uivault


def run(name="editorial"):
    root = tk.Tk()
    root.title("UI Vault · Tkinter")
    root.geometry("760x520")
    current = tk.StringVar(value=name)

    def build():
        for w in root.winfo_children():
            w.destroy()
        t = uivault.theme(current.get())
        uivault.apply_tk(root, t)
        page = ttk.Frame(root, padding=28); page.pack(fill="both", expand=True)

        top = ttk.Frame(page); top.pack(fill="x")
        ttk.Label(top, text="UI Vault for Python", style="Muted.TLabel").pack(side="left")
        box = ttk.Combobox(top, textvariable=current, values=uivault.themes(), state="readonly", width=12)
        box.pack(side="right"); box.bind("<<ComboboxSelected>>", lambda e: build())
        ttk.Label(top, text="Theme", style="Muted.TLabel").pack(side="right", padx=8)

        ttk.Label(page, text=f"{t.name.title()} theme", style="Heading.TLabel").pack(anchor="w", pady=(18, 2))
        ttk.Label(page, text=t.description, style="Muted.TLabel").pack(anchor="w")

        tabs = ttk.Notebook(page); tabs.pack(fill="both", expand=True, pady=18)
        one = ttk.Frame(tabs, padding=18); tabs.add(one, text="Controls")
        tabs.add(ttk.Frame(tabs, padding=18), text="Data"); tabs.add(ttk.Frame(tabs, padding=18), text="Settings")

        row = ttk.Frame(one); row.pack(fill="x")
        ttk.Button(row, text="Primary", style="Accent.TButton").pack(side="left")
        ttk.Button(row, text="Secondary").pack(side="left", padx=8)
        e = ttk.Entry(row, width=24); e.insert(0, "you@example.com"); e.pack(side="left", padx=8)

        row2 = ttk.Frame(one); row2.pack(fill="x", pady=16)
        v = tk.BooleanVar(value=True)
        ttk.Checkbutton(row2, text="Notifications", variable=v).pack(side="left")
        r = tk.StringVar(value="a")
        ttk.Radiobutton(row2, text="Daily", value="a", variable=r).pack(side="left", padx=12)
        ttk.Radiobutton(row2, text="Weekly", value="b", variable=r).pack(side="left")

        p = ttk.Progressbar(one, value=64, maximum=100); p.pack(fill="x", pady=(4, 14))
        ttk.Scale(one, from_=0, to=100, value=40).pack(fill="x")

        tree = ttk.Treeview(one, columns=("role", "commits"), show="headings", height=3)
        for col, w in (("role", 200), ("commits", 120)):
            tree.heading(col, text=col.title()); tree.column(col, width=w)
        for row_ in (("Maintainer", "1,204"), ("Reviewer", "418"), ("Contributor", "87")):
            tree.insert("", "end", values=row_)
        tree.pack(fill="x", pady=(16, 0))

    build()
    root.mainloop()


if __name__ == "__main__":
    run()
