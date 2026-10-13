// uivault.hpp — UI Vault 3.0.0 for C++ · single header · MIT
// The 12 UI Vault design themes as constexpr data, plus one-call adapters for popular C++ UI toolkits.
// Adapters switch on automatically when the toolkit header is included BEFORE this one:
//
//   Dear ImGui   #include <imgui.h>            → uivault::imgui::apply(uivault::neon);
//   JUCE         #include <JuceHeader.h>       → uivault::juce_lf::LookAndFeel lf{ uivault::luxe }; setLookAndFeel(&lf);
//   raylib/raygui #include "raygui.h"          → uivault::raygui::apply(uivault::retro);
//   Qt (any)     (no include needed)           → app.setStyleSheet(QString::fromStdString(uivault::qss(uivault::swiss)));
//
// Docs: https://thenameiscobmarley.github.io/ui-vault/code.html
#pragma once
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <string>

namespace uivault {

struct Color {
    std::uint8_t r = 0, g = 0, b = 0, a = 255;
    constexpr float rf() const { return r / 255.0f; }
    constexpr float gf() const { return g / 255.0f; }
    constexpr float bf() const { return b / 255.0f; }
    constexpr float af() const { return a / 255.0f; }
    constexpr std::uint32_t rgba() const { return (std::uint32_t(r) << 24) | (std::uint32_t(g) << 16) | (std::uint32_t(b) << 8) | a; }
    constexpr std::uint32_t argb() const { return (std::uint32_t(a) << 24) | (std::uint32_t(r) << 16) | (std::uint32_t(g) << 8) | b; }  // JUCE Colour(uint32)
    constexpr std::uint32_t abgr() const { return (std::uint32_t(a) << 24) | (std::uint32_t(b) << 16) | (std::uint32_t(g) << 8) | r; }  // ImGui IM_COL32
    constexpr Color withAlpha(std::uint8_t na) const { return {r, g, b, na}; }
    std::string hex() const { char s[10]; std::snprintf(s, sizeof s, "#%02x%02x%02x", r, g, b); return s; }
    std::string css() const { char s[40]; std::snprintf(s, sizeof s, "rgba(%d, %d, %d, %.3f)", r, g, b, a / 255.0); return s; }
};

struct Palette {
    Color bg, surface, surface2, surface3, line, line2, text, muted, dim, accent, accent2, success, warn, danger, info;
};

struct Theme {
    const char* name;
    const char* description;
    bool dark;
    Palette color;   // as designed (may contain alpha)
    Palette solid;   // alpha pre-blended over bg — use for toolkits without transparency
    const char* font;
    const char* fontHead;
    const char* mono;
    float radiusXs, radiusSm, radius, radiusLg, border;
};

// ── Themes (generated from lib/css/themes.src.css by tools/build.py) ─────────
/// paper, ink, one signal accent (the default)
inline constexpr Theme editorial{ "editorial", "paper, ink, one signal accent (the default)", false,
    Palette{Color{244, 242, 238, 255}, Color{251, 250, 248, 255}, Color{236, 233, 227, 255}, Color{226, 222, 214, 255}, Color{26, 25, 23, 26}, Color{26, 25, 23, 46}, Color{26, 25, 23, 255}, Color{95, 91, 84, 255}, Color{143, 138, 130, 255}, Color{255, 79, 0, 255}, Color{196, 60, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 242, 238, 255}, Color{251, 250, 248, 255}, Color{236, 233, 227, 255}, Color{226, 222, 214, 255}, Color{222, 220, 216, 255}, Color{205, 203, 199, 255}, Color{26, 25, 23, 255}, Color{95, 91, 84, 255}, Color{143, 138, 130, 255}, Color{255, 79, 0, 255}, Color{196, 60, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    3.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// neo-brutalism: thick ink borders, hard offset shadows, loud fills
inline constexpr Theme brutal{ "brutal", "neo-brutalism: thick ink borders, hard offset shadows, loud fills", false,
    Palette{Color{255, 244, 224, 255}, Color{255, 255, 255, 255}, Color{255, 233, 194, 255}, Color{255, 217, 138, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{51, 51, 51, 255}, Color{85, 85, 85, 255}, Color{255, 94, 196, 255}, Color{255, 210, 63, 255}, Color{35, 163, 90, 255}, Color{183, 121, 31, 255}, Color{255, 59, 48, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 224, 255}, Color{255, 255, 255, 255}, Color{255, 233, 194, 255}, Color{255, 217, 138, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{51, 51, 51, 255}, Color{85, 85, 85, 255}, Color{255, 94, 196, 255}, Color{255, 210, 63, 255}, Color{35, 163, 90, 255}, Color{183, 121, 31, 255}, Color{255, 59, 48, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// cyber: deep night, cyan + magenta glow, mono uppercase
inline constexpr Theme neon{ "neon", "cyber: deep night, cyan + magenta glow, mono uppercase", true,
    Palette{Color{6, 6, 12, 255}, Color{13, 13, 25, 255}, Color{21, 21, 39, 255}, Color{31, 31, 56, 255}, Color{0, 240, 255, 31}, Color{0, 240, 255, 64}, Color{230, 251, 255, 255}, Color{143, 180, 196, 255}, Color{79, 107, 122, 255}, Color{0, 240, 255, 255}, Color{255, 43, 214, 255}, Color{57, 255, 136, 255}, Color{183, 121, 31, 255}, Color{255, 56, 100, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 6, 12, 255}, Color{13, 13, 25, 255}, Color{21, 21, 39, 255}, Color{31, 31, 56, 255}, Color{5, 34, 42, 255}, Color{4, 65, 73, 255}, Color{230, 251, 255, 255}, Color{143, 180, 196, 255}, Color{79, 107, 122, 255}, Color{0, 240, 255, 255}, Color{255, 43, 214, 255}, Color{57, 255, 136, 255}, Color{183, 121, 31, 255}, Color{255, 56, 100, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 4.0f, 6.0f, 1.0f };

/// frosted panels over a soft aurora
inline constexpr Theme glass{ "glass", "frosted panels over a soft aurora", true,
    Palette{Color{15, 16, 36, 255}, Color{255, 255, 255, 20}, Color{255, 255, 255, 28}, Color{255, 255, 255, 38}, Color{255, 255, 255, 31}, Color{255, 255, 255, 51}, Color{255, 255, 255, 255}, Color{255, 255, 255, 179}, Color{255, 255, 255, 115}, Color{185, 166, 255, 255}, Color{127, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{15, 16, 36, 255}, Color{34, 35, 53, 255}, Color{41, 42, 60, 255}, Color{51, 52, 69, 255}, Color{44, 45, 63, 255}, Color{63, 64, 80, 255}, Color{255, 255, 255, 255}, Color{183, 184, 190, 255}, Color{123, 124, 135, 255}, Color{185, 166, 255, 255}, Color{127, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 12.0f, 16.0f, 22.0f, 1.0f };

/// phosphor green CRT, monospace everything
inline constexpr Theme terminal{ "terminal", "phosphor green CRT, monospace everything", true,
    Palette{Color{5, 10, 5, 255}, Color{8, 17, 8, 255}, Color{12, 26, 12, 255}, Color{18, 38, 18, 255}, Color{51, 255, 102, 38}, Color{51, 255, 102, 85}, Color{77, 255, 122, 255}, Color{47, 191, 85, 255}, Color{29, 122, 54, 255}, Color{77, 255, 122, 255}, Color{182, 255, 202, 255}, Color{77, 255, 122, 255}, Color{255, 210, 77, 255}, Color{255, 90, 77, 255}, Color{43, 95, 180, 255}},
    Palette{Color{5, 10, 5, 255}, Color{8, 17, 8, 255}, Color{12, 26, 12, 255}, Color{18, 38, 18, 255}, Color{12, 47, 19, 255}, Color{20, 92, 37, 255}, Color{77, 255, 122, 255}, Color{47, 191, 85, 255}, Color{29, 122, 54, 255}, Color{77, 255, 122, 255}, Color{182, 255, 202, 255}, Color{77, 255, 122, 255}, Color{255, 210, 77, 255}, Color{255, 90, 77, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", \"Geist Mono\", ui-monospace, monospace", "\"VT323\", \"Geist Mono\", ui-monospace, monospace", "\"VT323\", \"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// pastel, pillowy radii, gentle shadows
inline constexpr Theme soft{ "soft", "pastel, pillowy radii, gentle shadows", false,
    Palette{Color{244, 241, 255, 255}, Color{255, 255, 255, 255}, Color{238, 234, 255, 255}, Color{226, 220, 255, 255}, Color{91, 75, 217, 20}, Color{91, 75, 217, 38}, Color{42, 37, 80, 255}, Color{107, 102, 144, 255}, Color{161, 156, 196, 255}, Color{124, 108, 242, 255}, Color{255, 143, 184, 255}, Color{63, 191, 143, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 241, 255, 255}, Color{255, 255, 255, 255}, Color{238, 234, 255, 255}, Color{226, 220, 255, 255}, Color{232, 228, 252, 255}, Color{221, 216, 249, 255}, Color{42, 37, 80, 255}, Color{107, 102, 144, 255}, Color{161, 156, 196, 255}, Color{124, 108, 242, 255}, Color{255, 143, 184, 255}, Color{63, 191, 143, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "ui-rounded, \"SF Pro Rounded\", \"Nunito\", system-ui, sans-serif", "ui-rounded, \"SF Pro Rounded\", \"Nunito\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 14.0f, 18.0f, 24.0f, 0.0f };

/// 1995 desktop: bevels, teal, system grey
inline constexpr Theme retro{ "retro", "1995 desktop: bevels, teal, system grey", true,
    Palette{Color{0, 128, 128, 255}, Color{192, 192, 192, 255}, Color{212, 208, 200, 255}, Color{223, 223, 223, 255}, Color{128, 128, 128, 255}, Color{128, 128, 128, 255}, Color{0, 0, 0, 255}, Color{34, 34, 34, 255}, Color{85, 85, 85, 255}, Color{0, 0, 128, 255}, Color{16, 132, 208, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 128, 128, 255}, Color{192, 192, 192, 255}, Color{212, 208, 200, 255}, Color{223, 223, 223, 255}, Color{128, 128, 128, 255}, Color{128, 128, 128, 255}, Color{0, 0, 0, 255}, Color{34, 34, 34, 255}, Color{85, 85, 85, 255}, Color{0, 0, 128, 255}, Color{16, 132, 208, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "Tahoma, \"MS Sans Serif\", Verdana, sans-serif", "Tahoma, \"MS Sans Serif\", Verdana, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 0.0f };

/// International Style: white, black, one red, grid discipline
inline constexpr Theme swiss{ "swiss", "International Style: white, black, one red, grid discipline", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{242, 242, 242, 255}, Color{230, 230, 230, 255}, Color{0, 0, 0, 31}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{68, 68, 68, 255}, Color{136, 136, 136, 255}, Color{227, 6, 19, 255}, Color{0, 0, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{242, 242, 242, 255}, Color{230, 230, 230, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{68, 68, 68, 255}, Color{136, 136, 136, 255}, Color{227, 6, 19, 255}, Color{0, 0, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Helvetica Neue\", Helvetica, Arial, sans-serif", "\"Helvetica Neue\", Helvetica, Arial, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// chrome, holographic gradients, bubbly pills
inline constexpr Theme y2k{ "y2k", "chrome, holographic gradients, bubbly pills", false,
    Palette{Color{236, 230, 255, 255}, Color{255, 255, 255, 204}, Color{246, 242, 255, 255}, Color{227, 220, 255, 255}, Color{122, 92, 255, 38}, Color{122, 92, 255, 77}, Color{27, 18, 64, 255}, Color{90, 79, 143, 255}, Color{153, 143, 207, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 230, 255, 255}, Color{251, 250, 255, 255}, Color{246, 242, 255, 255}, Color{227, 220, 255, 255}, Color{219, 209, 255, 255}, Color{202, 188, 255, 255}, Color{27, 18, 64, 255}, Color{90, 79, 143, 255}, Color{153, 143, 207, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 18.0f, 26.0f, 1.5f };

/// strictly black and white, monospaced
inline constexpr Theme mono{ "mono", "strictly black and white, monospaced", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{102, 102, 102, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{102, 102, 102, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// hand-drawn borders on notebook paper
inline constexpr Theme sketch{ "sketch", "hand-drawn borders on notebook paper", false,
    Palette{Color{253, 251, 244, 255}, Color{255, 253, 247, 255}, Color{244, 239, 225, 255}, Color{233, 226, 205, 255}, Color{43, 43, 43, 51}, Color{43, 43, 43, 255}, Color{43, 43, 43, 255}, Color{85, 85, 85, 255}, Color{136, 136, 136, 255}, Color{232, 89, 12, 255}, Color{28, 126, 214, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{253, 251, 244, 255}, Color{255, 253, 247, 255}, Color{244, 239, 225, 255}, Color{233, 226, 205, 255}, Color{211, 209, 204, 255}, Color{43, 43, 43, 255}, Color{43, 43, 43, 255}, Color{85, 85, 85, 255}, Color{136, 136, 136, 255}, Color{232, 89, 12, 255}, Color{28, 126, 214, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Patrick Hand\", \"Comic Neue\", \"Segoe Print\", cursive", "\"Patrick Hand\", \"Comic Neue\", \"Segoe Print\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    255.0f, 255.0f, 15.0f, 25.0f, 2.0f };

/// black lacquer, gold rules, spaced capitals
inline constexpr Theme luxe{ "luxe", "black lacquer, gold rules, spaced capitals", true,
    Palette{Color{12, 11, 9, 255}, Color{18, 17, 14, 255}, Color{26, 24, 19, 255}, Color{36, 33, 26, 255}, Color{201, 169, 110, 38}, Color{201, 169, 110, 102}, Color{239, 230, 210, 255}, Color{179, 168, 143, 255}, Color{122, 112, 92, 255}, Color{201, 169, 110, 255}, Color{232, 211, 162, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{12, 11, 9, 255}, Color{18, 17, 14, 255}, Color{26, 24, 19, 255}, Color{36, 33, 26, 255}, Color{40, 35, 24, 255}, Color{88, 74, 49, 255}, Color{239, 230, 210, 255}, Color{179, 168, 143, 255}, Color{122, 112, 92, 255}, Color{201, 169, 110, 255}, Color{232, 211, 162, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

inline constexpr const Theme* themes[] = { &editorial, &brutal, &neon, &glass, &terminal, &soft, &retro, &swiss, &y2k, &mono, &sketch, &luxe };

inline constexpr int themeCount = 12;

/// Find a theme by name; returns nullptr if unknown.
inline const Theme* find(const char* name) {
    for (const Theme* t : themes) if (std::strcmp(t->name, name) == 0) return t;
    return nullptr;
}

// ── Qt stylesheet (QSS) — no Qt include needed ───────────────────────────────
inline std::string qss(const Theme& t, int fontSize = 14) {
    const Palette& c = t.color; const Palette& s = t.solid;
    char rs[16], r[16], bw[16], fs[16], fs2[16];
    std::snprintf(rs, sizeof rs, "%g", t.radiusSm > 24 ? 24.0f : t.radiusSm);
    std::snprintf(r, sizeof r, "%g", t.radius > 24 ? 24.0f : t.radius);
    std::snprintf(bw, sizeof bw, "%d", t.border < 1 ? 1 : int(t.border));
    std::snprintf(fs, sizeof fs, "%d", fontSize); std::snprintf(fs2, sizeof fs2, "%d", fontSize * 2);
    const std::string primary = t.dark ? c.accent.hex() : c.text.hex();
    std::string q;
    q += "* { font-family: \"" + std::string(t.font) + "\"; font-size: " + fs + "px; }\n";
    q += "QWidget { background: " + c.bg.hex() + "; color: " + c.text.hex() + "; selection-background-color: " + c.accent.hex() + "; }\n";
    q += "QLabel[heading=\"true\"] { font-family: \"" + std::string(t.fontHead) + "\"; font-size: " + fs2 + "px; }\n";
    q += "QPushButton { background: " + c.surface2.css() + "; border: " + bw + "px solid " + c.line2.css() + "; border-radius: " + rs + "px; padding: 7px 16px; }\n";
    q += "QPushButton:hover { border-color: " + c.text.hex() + "; }\n";
    q += "QPushButton[primary=\"true\"] { background: " + primary + "; color: " + c.bg.hex() + "; border-color: transparent; }\n";
    q += "QPushButton[primary=\"true\"]:hover { background: " + c.accent.hex() + "; }\n";
    q += "QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QComboBox { background: " + c.surface.css() + "; border: " + bw + "px solid " + c.line2.css() + "; border-radius: " + rs + "px; padding: 6px 8px; }\n";
    q += "QLineEdit:focus, QTextEdit:focus, QComboBox:focus { border-color: " + c.accent.hex() + "; }\n";
    q += "QCheckBox::indicator:checked, QRadioButton::indicator:checked { background: " + c.accent.hex() + "; border-color: " + c.accent.hex() + "; }\n";
    q += "QTabBar::tab { background: transparent; color: " + c.muted.hex() + "; padding: 8px 16px; border-bottom: 2px solid transparent; }\n";
    q += "QTabBar::tab:selected { color: " + c.text.hex() + "; border-bottom-color: " + c.accent.hex() + "; }\n";
    q += "QProgressBar { background: " + c.line2.css() + "; border: none; height: 6px; color: transparent; }\nQProgressBar::chunk { background: " + c.accent.hex() + "; }\n";
    q += "QSlider::groove:horizontal { height: 3px; background: " + c.line2.css() + "; }\nQSlider::sub-page:horizontal { background: " + c.accent.hex() + "; }\n";
    q += "QSlider::handle:horizontal { width: 14px; margin: -6px 0; border-radius: 7px; background: " + c.bg.hex() + "; border: 2px solid " + c.text.hex() + "; }\n";
    q += std::string("QGroupBox { border: ") + bw + "px solid " + c.line2.css() + "; border-radius: " + r + "px; margin-top: 14px; padding: 12px; }\n";
    q += "QMenu, QComboBox QAbstractItemView { background: " + s.surface.hex() + "; }\nQMenu::item:selected { background: " + c.accent.hex() + "; color: " + c.bg.hex() + "; }\n";
    q += "QToolTip { background: " + c.text.hex() + "; color: " + c.bg.hex() + "; border: none; padding: 5px 8px; }\n";
    return q;
}

// ── Dear ImGui ───────────────────────────────────────────────────────────────
#if defined(IMGUI_VERSION)
namespace imgui {
inline ImVec4 v4(Color c) { return ImVec4(c.rf(), c.gf(), c.bf(), c.af()); }
/// Apply a theme to the current (or given) ImGuiStyle. Call once after ImGui::CreateContext().
inline void apply(const Theme& t, ImGuiStyle* dst = nullptr) {
    ImGuiStyle& st = dst ? *dst : ImGui::GetStyle();
    const Palette& p = t.solid;
    ImVec4* c = st.Colors;
    c[ImGuiCol_Text] = v4(p.text);                 c[ImGuiCol_TextDisabled] = v4(p.dim);
    c[ImGuiCol_WindowBg] = v4(p.bg);               c[ImGuiCol_ChildBg] = v4(p.bg);             c[ImGuiCol_PopupBg] = v4(p.surface);
    c[ImGuiCol_Border] = v4(p.line2);              c[ImGuiCol_BorderShadow] = ImVec4(0, 0, 0, 0);
    c[ImGuiCol_FrameBg] = v4(p.surface);           c[ImGuiCol_FrameBgHovered] = v4(p.surface2); c[ImGuiCol_FrameBgActive] = v4(p.surface3);
    c[ImGuiCol_TitleBg] = v4(p.surface);           c[ImGuiCol_TitleBgActive] = v4(p.surface2); c[ImGuiCol_TitleBgCollapsed] = v4(p.surface);
    c[ImGuiCol_MenuBarBg] = v4(p.surface);
    c[ImGuiCol_ScrollbarBg] = v4(p.bg);            c[ImGuiCol_ScrollbarGrab] = v4(p.line2);    c[ImGuiCol_ScrollbarGrabHovered] = v4(p.muted); c[ImGuiCol_ScrollbarGrabActive] = v4(p.accent);
    c[ImGuiCol_CheckMark] = v4(p.accent);          c[ImGuiCol_SliderGrab] = v4(p.accent);      c[ImGuiCol_SliderGrabActive] = v4(p.accent2);
    c[ImGuiCol_Button] = v4(p.surface2);           c[ImGuiCol_ButtonHovered] = v4(p.surface3); c[ImGuiCol_ButtonActive] = v4(p.accent);
    c[ImGuiCol_Header] = v4(p.surface2);           c[ImGuiCol_HeaderHovered] = v4(p.surface3); c[ImGuiCol_HeaderActive] = v4(p.accent);
    c[ImGuiCol_Separator] = v4(p.line2);           c[ImGuiCol_SeparatorHovered] = v4(p.accent); c[ImGuiCol_SeparatorActive] = v4(p.accent);
    c[ImGuiCol_ResizeGrip] = v4(p.line2);          c[ImGuiCol_ResizeGripHovered] = v4(p.accent); c[ImGuiCol_ResizeGripActive] = v4(p.accent2);
    c[ImGuiCol_Tab] = v4(p.surface);               c[ImGuiCol_TabHovered] = v4(p.surface3);
#if IMGUI_VERSION_NUM >= 19090
    c[ImGuiCol_TabSelected] = v4(p.surface2);      c[ImGuiCol_TabSelectedOverline] = v4(p.accent);
    c[ImGuiCol_TabDimmed] = v4(p.surface);         c[ImGuiCol_TabDimmedSelected] = v4(p.surface2);
#else
    c[ImGuiCol_TabActive] = v4(p.surface2);        c[ImGuiCol_TabUnfocused] = v4(p.surface); c[ImGuiCol_TabUnfocusedActive] = v4(p.surface2);
#endif
    c[ImGuiCol_PlotLines] = v4(p.accent);          c[ImGuiCol_PlotLinesHovered] = v4(p.accent2);
    c[ImGuiCol_PlotHistogram] = v4(p.accent);      c[ImGuiCol_PlotHistogramHovered] = v4(p.accent2);
    c[ImGuiCol_TextSelectedBg] = v4(t.color.accent.withAlpha(90));
#if IMGUI_VERSION_NUM >= 19140
    c[ImGuiCol_NavCursor] = v4(p.accent);
#else
    c[ImGuiCol_NavHighlight] = v4(p.accent);
#endif
    c[ImGuiCol_ModalWindowDimBg] = ImVec4(0, 0, 0, 0.45f);
    const float rs = t.radiusSm > 12 ? 12 : t.radiusSm, r = t.radius > 14 ? 14 : t.radius;
    st.WindowRounding = r; st.ChildRounding = r; st.PopupRounding = rs; st.FrameRounding = rs;
    st.GrabRounding = rs; st.TabRounding = rs; st.ScrollbarRounding = rs;
    st.FrameBorderSize = t.border > 0 ? 1.0f : 0.0f; st.WindowBorderSize = 1.0f;
    st.FramePadding = ImVec2(10, 6); st.ItemSpacing = ImVec2(10, 8); st.WindowPadding = ImVec2(14, 14);
}
} // namespace imgui
#endif

// ── JUCE ─────────────────────────────────────────────────────────────────────
#if defined(JUCE_GUI_BASICS_H_INCLUDED)
namespace juce_lf {
inline juce::Colour col(Color c) { return juce::Colour(c.argb()); }

/// A LookAndFeel_V4 coloured and shaped by a UI Vault theme.
///   uivault::juce_lf::LookAndFeel lf { uivault::neon };   setLookAndFeel (&lf);
class LookAndFeel : public juce::LookAndFeel_V4 {
public:
    explicit LookAndFeel(const Theme& t = editorial) { setTheme(t); }

    void setTheme(const Theme& t) {
        theme = &t;
        const Palette& p = t.solid;
        setColourScheme({ col(p.bg), col(p.surface), col(p.surface), col(p.line2), col(p.text),
                          col(p.accent), col(t.dark ? p.bg : Color{255, 255, 255, 255}), col(p.accent), col(p.text) });
        setColour(juce::ResizableWindow::backgroundColourId, col(p.bg));
        setColour(juce::TextButton::buttonColourId, col(p.surface2));
        setColour(juce::TextButton::buttonOnColourId, col(t.dark ? p.accent : p.text));
        setColour(juce::TextButton::textColourOffId, col(p.text));
        setColour(juce::TextButton::textColourOnId, col(p.bg));
        setColour(juce::ComboBox::backgroundColourId, col(p.surface));
        setColour(juce::ComboBox::outlineColourId, col(p.line2));
        setColour(juce::ComboBox::textColourId, col(p.text));
        setColour(juce::ComboBox::arrowColourId, col(p.muted));
        setColour(juce::TextEditor::backgroundColourId, col(p.surface));
        setColour(juce::TextEditor::textColourId, col(p.text));
        setColour(juce::TextEditor::outlineColourId, col(p.line2));
        setColour(juce::TextEditor::focusedOutlineColourId, col(p.accent));
        setColour(juce::TextEditor::highlightColourId, col(t.color.accent.withAlpha(80)));
        setColour(juce::Label::textColourId, col(p.text));
        setColour(juce::ToggleButton::textColourId, col(p.text));
        setColour(juce::ToggleButton::tickColourId, col(p.accent));
        setColour(juce::ToggleButton::tickDisabledColourId, col(p.line2));
        setColour(juce::Slider::backgroundColourId, col(p.line2));
        setColour(juce::Slider::trackColourId, col(p.accent));
        setColour(juce::Slider::thumbColourId, col(p.text));
        setColour(juce::Slider::rotarySliderFillColourId, col(p.accent));
        setColour(juce::Slider::rotarySliderOutlineColourId, col(p.line2));
        setColour(juce::Slider::textBoxTextColourId, col(p.text));
        setColour(juce::Slider::textBoxOutlineColourId, col(p.line2));
        setColour(juce::PopupMenu::backgroundColourId, col(p.surface));
        setColour(juce::PopupMenu::textColourId, col(p.text));
        setColour(juce::PopupMenu::highlightedBackgroundColourId, col(p.accent));
        setColour(juce::PopupMenu::highlightedTextColourId, col(p.bg));
        setColour(juce::ScrollBar::thumbColourId, col(p.line2));
        setColour(juce::TabbedButtonBar::tabTextColourId, col(p.muted));
        setColour(juce::TabbedButtonBar::frontTextColourId, col(p.text));
        setColour(juce::GroupComponent::outlineColourId, col(p.line2));
        setColour(juce::GroupComponent::textColourId, col(p.muted));
    }

    const Theme& getTheme() const { return *theme; }

    void drawButtonBackground(juce::Graphics& g, juce::Button& b, const juce::Colour& bg,
                              bool highlighted, bool down) override {
        auto bounds = b.getLocalBounds().toFloat().reduced(0.5f);
        const float radius = juce::jmin(theme->radiusSm, bounds.getHeight() / 2);
        auto fill = down ? bg.darker(0.15f) : highlighted ? bg.brighter(0.06f) : bg;
        g.setColour(fill);
        g.fillRoundedRectangle(bounds, radius);
        g.setColour(highlighted ? col(theme->solid.text) : col(theme->solid.line2));
        g.drawRoundedRectangle(bounds, radius, juce::jmax(1.0f, theme->border));
    }

    void drawLinearSlider(juce::Graphics& g, int x, int y, int w, int h, float pos, float minPos, float maxPos,
                          juce::Slider::SliderStyle style, juce::Slider& s) override {
        if (!s.isHorizontal() || style != juce::Slider::LinearHorizontal) {
            juce::LookAndFeel_V4::drawLinearSlider(g, x, y, w, h, pos, minPos, maxPos, style, s);
            return;
        }
        const float cy = y + h * 0.5f;
        g.setColour(col(theme->solid.line2));   g.fillRect(juce::Rectangle<float>(float(x), cy - 1.5f, float(w), 3.0f));
        g.setColour(col(theme->solid.accent));  g.fillRect(juce::Rectangle<float>(float(x), cy - 1.5f, pos - x, 3.0f));
        g.setColour(col(theme->solid.bg));      g.fillEllipse(pos - 7, cy - 7, 14, 14);
        g.setColour(col(theme->solid.text));    g.drawEllipse(pos - 7, cy - 7, 14, 14, 2.0f);
    }

private:
    const Theme* theme = &editorial;
};
} // namespace juce_lf
#endif

// ── raylib + raygui ──────────────────────────────────────────────────────────
#if defined(RAYGUI_H)
namespace raygui {
inline ::Color rc(Color c) { return ::Color{c.r, c.g, c.b, c.a}; }
/// Apply a theme to raygui's DEFAULT style (all controls inherit it).
inline void apply(const Theme& t) {
    const Palette& p = t.solid;
    GuiSetStyle(DEFAULT, BACKGROUND_COLOR, ColorToInt(rc(p.bg)));
    GuiSetStyle(DEFAULT, LINE_COLOR, ColorToInt(rc(p.line2)));
    GuiSetStyle(DEFAULT, BORDER_COLOR_NORMAL, ColorToInt(rc(p.line2)));
    GuiSetStyle(DEFAULT, BASE_COLOR_NORMAL, ColorToInt(rc(p.surface2)));
    GuiSetStyle(DEFAULT, TEXT_COLOR_NORMAL, ColorToInt(rc(p.text)));
    GuiSetStyle(DEFAULT, BORDER_COLOR_FOCUSED, ColorToInt(rc(p.accent)));
    GuiSetStyle(DEFAULT, BASE_COLOR_FOCUSED, ColorToInt(rc(p.surface3)));
    GuiSetStyle(DEFAULT, TEXT_COLOR_FOCUSED, ColorToInt(rc(p.text)));
    GuiSetStyle(DEFAULT, BORDER_COLOR_PRESSED, ColorToInt(rc(p.accent)));
    GuiSetStyle(DEFAULT, BASE_COLOR_PRESSED, ColorToInt(rc(p.accent)));
    GuiSetStyle(DEFAULT, TEXT_COLOR_PRESSED, ColorToInt(rc(p.bg)));
    GuiSetStyle(DEFAULT, BORDER_COLOR_DISABLED, ColorToInt(rc(p.line)));
    GuiSetStyle(DEFAULT, BASE_COLOR_DISABLED, ColorToInt(rc(p.surface)));
    GuiSetStyle(DEFAULT, TEXT_COLOR_DISABLED, ColorToInt(rc(p.dim)));
    GuiSetStyle(DEFAULT, BORDER_WIDTH, t.border > 0 ? int(t.border) : 1);
}
} // namespace raygui
#endif

} // namespace uivault
