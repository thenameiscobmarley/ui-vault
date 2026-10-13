// Prints every UI Vault theme as true-colour swatches.  g++ -std=c++17 -I.. swatches.cpp -o swatches && ./swatches
#include "../uivault.hpp"
#include <cstdio>

static void sw(uivault::Color c) { std::printf("\x1b[48;2;%d;%d;%dm    \x1b[0m", c.r, c.g, c.b); }

int main() {
    for (const uivault::Theme* t : uivault::themes) {
        const auto& p = t->solid;
        std::printf("%-10s ", t->name);
        for (auto c : {p.bg, p.surface, p.surface2, p.line2, p.text, p.muted, p.accent, p.accent2}) sw(c);
        std::printf("  %s, r=%gpx\n", t->dark ? "dark " : "light", t->radius);
    }
    const uivault::Theme* neon = uivault::find("neon");
    std::printf("\nfind(\"neon\")->color.accent = %s   qss() = %zu chars\n", neon->color.accent.hex().c_str(), uivault::qss(*neon).size());
}
