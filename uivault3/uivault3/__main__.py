"""python -m uivault3 [demo] [--kit KIT] [--theme THEME] [--shot file.png]  — a gallery of every widget."""
import sys

from .demo import main

main(sys.argv[1:])
