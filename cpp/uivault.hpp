// uivault.hpp — UI Vault 3.1.0 for C++ · single header · MIT
// The UI Vault design themes and element kits as constexpr data, plus one-call adapters for popular C++ UI toolkits.
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
    const char* category;   // Minimal, Dark, Pastel, Bold, Retro, Nature, Signature
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
inline constexpr Theme editorial{ "editorial", "paper, ink, one signal accent (the default)", "Minimal", false,
    Palette{Color{244, 242, 238, 255}, Color{251, 250, 248, 255}, Color{236, 233, 227, 255}, Color{226, 222, 214, 255}, Color{26, 25, 23, 26}, Color{26, 25, 23, 46}, Color{26, 25, 23, 255}, Color{95, 91, 84, 255}, Color{143, 138, 130, 255}, Color{255, 79, 0, 255}, Color{196, 60, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 242, 238, 255}, Color{251, 250, 248, 255}, Color{236, 233, 227, 255}, Color{226, 222, 214, 255}, Color{222, 220, 216, 255}, Color{205, 203, 199, 255}, Color{26, 25, 23, 255}, Color{95, 91, 84, 255}, Color{143, 138, 130, 255}, Color{255, 79, 0, 255}, Color{196, 60, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    3.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// neo-brutalism: thick ink borders, hard offset shadows, loud fills
inline constexpr Theme brutal{ "brutal", "neo-brutalism: thick ink borders, hard offset shadows, loud fills", "Bold", false,
    Palette{Color{255, 244, 224, 255}, Color{255, 255, 255, 255}, Color{255, 233, 194, 255}, Color{255, 217, 138, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{51, 51, 51, 255}, Color{85, 85, 85, 255}, Color{255, 94, 196, 255}, Color{255, 210, 63, 255}, Color{35, 163, 90, 255}, Color{183, 121, 31, 255}, Color{255, 59, 48, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 224, 255}, Color{255, 255, 255, 255}, Color{255, 233, 194, 255}, Color{255, 217, 138, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{51, 51, 51, 255}, Color{85, 85, 85, 255}, Color{255, 94, 196, 255}, Color{255, 210, 63, 255}, Color{35, 163, 90, 255}, Color{183, 121, 31, 255}, Color{255, 59, 48, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// cyber: deep night, cyan + magenta glow, mono uppercase
inline constexpr Theme neon{ "neon", "cyber: deep night, cyan + magenta glow, mono uppercase", "Dark", true,
    Palette{Color{6, 6, 12, 255}, Color{13, 13, 25, 255}, Color{21, 21, 39, 255}, Color{31, 31, 56, 255}, Color{0, 240, 255, 31}, Color{0, 240, 255, 64}, Color{230, 251, 255, 255}, Color{143, 180, 196, 255}, Color{79, 107, 122, 255}, Color{0, 240, 255, 255}, Color{255, 43, 214, 255}, Color{57, 255, 136, 255}, Color{183, 121, 31, 255}, Color{255, 56, 100, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 6, 12, 255}, Color{13, 13, 25, 255}, Color{21, 21, 39, 255}, Color{31, 31, 56, 255}, Color{5, 34, 42, 255}, Color{4, 65, 73, 255}, Color{230, 251, 255, 255}, Color{143, 180, 196, 255}, Color{79, 107, 122, 255}, Color{0, 240, 255, 255}, Color{255, 43, 214, 255}, Color{57, 255, 136, 255}, Color{183, 121, 31, 255}, Color{255, 56, 100, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 4.0f, 6.0f, 1.0f };

/// frosted panels over a soft aurora
inline constexpr Theme glass{ "glass", "frosted panels over a soft aurora", "Dark", true,
    Palette{Color{15, 16, 36, 255}, Color{255, 255, 255, 20}, Color{255, 255, 255, 28}, Color{255, 255, 255, 38}, Color{255, 255, 255, 31}, Color{255, 255, 255, 51}, Color{255, 255, 255, 255}, Color{255, 255, 255, 179}, Color{255, 255, 255, 115}, Color{185, 166, 255, 255}, Color{127, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{15, 16, 36, 255}, Color{34, 35, 53, 255}, Color{41, 42, 60, 255}, Color{51, 52, 69, 255}, Color{44, 45, 63, 255}, Color{63, 64, 80, 255}, Color{255, 255, 255, 255}, Color{183, 184, 190, 255}, Color{123, 124, 135, 255}, Color{185, 166, 255, 255}, Color{127, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 12.0f, 16.0f, 22.0f, 1.0f };

/// phosphor green CRT, monospace everything
inline constexpr Theme terminal{ "terminal", "phosphor green CRT, monospace everything", "Retro", true,
    Palette{Color{5, 10, 5, 255}, Color{8, 17, 8, 255}, Color{12, 26, 12, 255}, Color{18, 38, 18, 255}, Color{51, 255, 102, 38}, Color{51, 255, 102, 85}, Color{77, 255, 122, 255}, Color{47, 191, 85, 255}, Color{29, 122, 54, 255}, Color{77, 255, 122, 255}, Color{182, 255, 202, 255}, Color{77, 255, 122, 255}, Color{255, 210, 77, 255}, Color{255, 90, 77, 255}, Color{43, 95, 180, 255}},
    Palette{Color{5, 10, 5, 255}, Color{8, 17, 8, 255}, Color{12, 26, 12, 255}, Color{18, 38, 18, 255}, Color{12, 47, 19, 255}, Color{20, 92, 37, 255}, Color{77, 255, 122, 255}, Color{47, 191, 85, 255}, Color{29, 122, 54, 255}, Color{77, 255, 122, 255}, Color{182, 255, 202, 255}, Color{77, 255, 122, 255}, Color{255, 210, 77, 255}, Color{255, 90, 77, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", \"Geist Mono\", ui-monospace, monospace", "\"VT323\", \"Geist Mono\", ui-monospace, monospace", "\"VT323\", \"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// pastel, pillowy radii, gentle shadows
inline constexpr Theme soft{ "soft", "pastel, pillowy radii, gentle shadows", "Pastel", false,
    Palette{Color{244, 241, 255, 255}, Color{255, 255, 255, 255}, Color{238, 234, 255, 255}, Color{226, 220, 255, 255}, Color{91, 75, 217, 20}, Color{91, 75, 217, 38}, Color{42, 37, 80, 255}, Color{107, 102, 144, 255}, Color{161, 156, 196, 255}, Color{124, 108, 242, 255}, Color{255, 143, 184, 255}, Color{63, 191, 143, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 241, 255, 255}, Color{255, 255, 255, 255}, Color{238, 234, 255, 255}, Color{226, 220, 255, 255}, Color{232, 228, 252, 255}, Color{221, 216, 249, 255}, Color{42, 37, 80, 255}, Color{107, 102, 144, 255}, Color{161, 156, 196, 255}, Color{124, 108, 242, 255}, Color{255, 143, 184, 255}, Color{63, 191, 143, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "ui-rounded, \"SF Pro Rounded\", \"Nunito\", system-ui, sans-serif", "ui-rounded, \"SF Pro Rounded\", \"Nunito\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 14.0f, 18.0f, 24.0f, 0.0f };

/// 1995 desktop: bevels, teal, system grey
inline constexpr Theme retro{ "retro", "1995 desktop: bevels, teal, system grey", "Retro", true,
    Palette{Color{0, 128, 128, 255}, Color{192, 192, 192, 255}, Color{212, 208, 200, 255}, Color{223, 223, 223, 255}, Color{128, 128, 128, 255}, Color{128, 128, 128, 255}, Color{0, 0, 0, 255}, Color{34, 34, 34, 255}, Color{85, 85, 85, 255}, Color{0, 0, 128, 255}, Color{16, 132, 208, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 128, 128, 255}, Color{192, 192, 192, 255}, Color{212, 208, 200, 255}, Color{223, 223, 223, 255}, Color{128, 128, 128, 255}, Color{128, 128, 128, 255}, Color{0, 0, 0, 255}, Color{34, 34, 34, 255}, Color{85, 85, 85, 255}, Color{0, 0, 128, 255}, Color{16, 132, 208, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "Tahoma, \"MS Sans Serif\", Verdana, sans-serif", "Tahoma, \"MS Sans Serif\", Verdana, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 0.0f };

/// International Style: white, black, one red, grid discipline
inline constexpr Theme swiss{ "swiss", "International Style: white, black, one red, grid discipline", "Minimal", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{242, 242, 242, 255}, Color{230, 230, 230, 255}, Color{0, 0, 0, 31}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{68, 68, 68, 255}, Color{136, 136, 136, 255}, Color{227, 6, 19, 255}, Color{0, 0, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{242, 242, 242, 255}, Color{230, 230, 230, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{68, 68, 68, 255}, Color{136, 136, 136, 255}, Color{227, 6, 19, 255}, Color{0, 0, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Helvetica Neue\", Helvetica, Arial, sans-serif", "\"Helvetica Neue\", Helvetica, Arial, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// chrome, holographic gradients, bubbly pills
inline constexpr Theme y2k{ "y2k", "chrome, holographic gradients, bubbly pills", "Signature", false,
    Palette{Color{236, 230, 255, 255}, Color{255, 255, 255, 204}, Color{246, 242, 255, 255}, Color{227, 220, 255, 255}, Color{122, 92, 255, 38}, Color{122, 92, 255, 77}, Color{27, 18, 64, 255}, Color{90, 79, 143, 255}, Color{153, 143, 207, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 230, 255, 255}, Color{251, 250, 255, 255}, Color{246, 242, 255, 255}, Color{227, 220, 255, 255}, Color{219, 209, 255, 255}, Color{202, 188, 255, 255}, Color{27, 18, 64, 255}, Color{90, 79, 143, 255}, Color{153, 143, 207, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 18.0f, 26.0f, 1.5f };

/// strictly black and white, monospaced
inline constexpr Theme mono{ "mono", "strictly black and white, monospaced", "Minimal", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{102, 102, 102, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{224, 224, 224, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{102, 102, 102, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{0, 0, 0, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// hand-drawn borders on notebook paper
inline constexpr Theme sketch{ "sketch", "hand-drawn borders on notebook paper", "Minimal", false,
    Palette{Color{253, 251, 244, 255}, Color{255, 253, 247, 255}, Color{244, 239, 225, 255}, Color{233, 226, 205, 255}, Color{43, 43, 43, 51}, Color{43, 43, 43, 255}, Color{43, 43, 43, 255}, Color{85, 85, 85, 255}, Color{136, 136, 136, 255}, Color{232, 89, 12, 255}, Color{28, 126, 214, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{253, 251, 244, 255}, Color{255, 253, 247, 255}, Color{244, 239, 225, 255}, Color{233, 226, 205, 255}, Color{211, 209, 204, 255}, Color{43, 43, 43, 255}, Color{43, 43, 43, 255}, Color{85, 85, 85, 255}, Color{136, 136, 136, 255}, Color{232, 89, 12, 255}, Color{28, 126, 214, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Patrick Hand\", \"Comic Neue\", \"Segoe Print\", cursive", "\"Patrick Hand\", \"Comic Neue\", \"Segoe Print\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    255.0f, 255.0f, 15.0f, 25.0f, 2.0f };

/// black lacquer, gold rules, spaced capitals
inline constexpr Theme luxe{ "luxe", "black lacquer, gold rules, spaced capitals", "Dark", true,
    Palette{Color{12, 11, 9, 255}, Color{18, 17, 14, 255}, Color{26, 24, 19, 255}, Color{36, 33, 26, 255}, Color{201, 169, 110, 38}, Color{201, 169, 110, 102}, Color{239, 230, 210, 255}, Color{179, 168, 143, 255}, Color{122, 112, 92, 255}, Color{201, 169, 110, 255}, Color{232, 211, 162, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{12, 11, 9, 255}, Color{18, 17, 14, 255}, Color{26, 24, 19, 255}, Color{36, 33, 26, 255}, Color{40, 35, 24, 255}, Color{88, 74, 49, 255}, Color{239, 230, 210, 255}, Color{179, 168, 143, 255}, Color{122, 112, 92, 255}, Color{201, 169, 110, 255}, Color{232, 211, 162, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// warm paper, graphite text, a quiet blue link
inline constexpr Theme paper{ "paper", "warm paper, graphite text, a quiet blue link", "Minimal", false,
    Palette{Color{247, 245, 240, 255}, Color{251, 251, 248, 255}, Color{235, 233, 228, 255}, Color{224, 223, 218, 255}, Color{42, 42, 40, 26}, Color{42, 42, 40, 46}, Color{42, 42, 40, 255}, Color{108, 107, 104, 255}, Color{149, 148, 144, 255}, Color{47, 91, 211, 255}, Color{47, 91, 211, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{247, 245, 240, 255}, Color{251, 251, 248, 255}, Color{235, 233, 228, 255}, Color{224, 223, 218, 255}, Color{226, 224, 220, 255}, Color{210, 208, 204, 255}, Color{42, 42, 40, 255}, Color{108, 107, 104, 255}, Color{149, 148, 144, 255}, Color{47, 91, 211, 255}, Color{47, 91, 211, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// off-white linen with a terracotta accent
inline constexpr Theme linen{ "linen", "off-white linen with a terracotta accent", "Minimal", false,
    Palette{Color{243, 238, 230, 255}, Color{250, 247, 244, 255}, Color{232, 227, 219, 255}, Color{223, 218, 210, 255}, Color{59, 53, 48, 26}, Color{59, 53, 48, 46}, Color{59, 53, 48, 255}, Color{118, 112, 106, 255}, Color{155, 149, 143, 255}, Color{196, 98, 58, 255}, Color{138, 109, 85, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 238, 230, 255}, Color{250, 247, 244, 255}, Color{232, 227, 219, 255}, Color{223, 218, 210, 255}, Color{224, 219, 211, 255}, Color{210, 205, 197, 255}, Color{59, 53, 48, 255}, Color{118, 112, 106, 255}, Color{155, 149, 143, 255}, Color{196, 98, 58, 255}, Color{138, 109, 85, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// cool grey haze, soft shadows, nothing loud
inline constexpr Theme fog{ "fog", "cool grey haze, soft shadows, nothing loud", "Minimal", false,
    Palette{Color{238, 240, 242, 255}, Color{247, 248, 249, 255}, Color{226, 228, 231, 255}, Color{217, 219, 221, 255}, Color{43, 48, 54, 26}, Color{43, 48, 54, 46}, Color{43, 48, 54, 255}, Color{105, 109, 114, 255}, Color{144, 148, 152, 255}, Color{91, 107, 124, 255}, Color{91, 107, 124, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 240, 242, 255}, Color{247, 248, 249, 255}, Color{226, 228, 231, 255}, Color{217, 219, 221, 255}, Color{218, 220, 223, 255}, Color{203, 205, 208, 255}, Color{43, 48, 54, 255}, Color{105, 109, 114, 255}, Color{144, 148, 152, 255}, Color{91, 107, 124, 255}, Color{91, 107, 124, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// white porcelain with a celadon glaze
inline constexpr Theme porcelain{ "porcelain", "white porcelain with a celadon glaze", "Minimal", false,
    Palette{Color{251, 251, 249, 255}, Color{253, 253, 252, 255}, Color{238, 239, 237, 255}, Color{227, 229, 226, 255}, Color{35, 48, 44, 26}, Color{35, 48, 44, 46}, Color{35, 48, 44, 255}, Color{104, 113, 110, 255}, Color{147, 154, 151, 255}, Color{95, 158, 143, 255}, Color{95, 158, 143, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 251, 249, 255}, Color{253, 253, 252, 255}, Color{238, 239, 237, 255}, Color{227, 229, 226, 255}, Color{229, 230, 228, 255}, Color{212, 214, 212, 255}, Color{35, 48, 44, 255}, Color{104, 113, 110, 255}, Color{147, 154, 151, 255}, Color{95, 158, 143, 255}, Color{95, 158, 143, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// newspaper grey, black columns, red headlines
inline constexpr Theme newsprint{ "newsprint", "newspaper grey, black columns, red headlines", "Minimal", false,
    Palette{Color{236, 232, 223, 255}, Color{246, 245, 241, 255}, Color{223, 219, 211, 255}, Color{212, 209, 201, 255}, Color{20, 20, 20, 26}, Color{20, 20, 20, 46}, Color{20, 20, 20, 255}, Color{89, 88, 85, 255}, Color{132, 130, 126, 255}, Color{179, 38, 30, 255}, Color{179, 38, 30, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 232, 223, 255}, Color{246, 245, 241, 255}, Color{223, 219, 211, 255}, Color{212, 209, 201, 255}, Color{214, 210, 202, 255}, Color{197, 194, 186, 255}, Color{20, 20, 20, 255}, Color{89, 88, 85, 255}, Color{132, 130, 126, 255}, Color{179, 38, 30, 255}, Color{179, 38, 30, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// architect's blue sheet with a white grid
inline constexpr Theme blueprint{ "blueprint", "architect's blue sheet with a white grid", "Minimal", true,
    Palette{Color{19, 66, 122, 255}, Color{30, 75, 129, 255}, Color{38, 82, 134, 255}, Color{51, 92, 142, 255}, Color{233, 242, 255, 36}, Color{233, 242, 255, 66}, Color{233, 242, 255, 255}, Color{165, 186, 212, 255}, Color{122, 150, 186, 255}, Color{255, 212, 92, 255}, Color{255, 212, 92, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{19, 66, 122, 255}, Color{30, 75, 129, 255}, Color{38, 82, 134, 255}, Color{51, 92, 142, 255}, Color{49, 91, 141, 255}, Color{74, 112, 156, 255}, Color{233, 242, 255, 255}, Color{165, 186, 212, 255}, Color{122, 150, 186, 255}, Color{255, 212, 92, 255}, Color{255, 212, 92, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// dune beige, umber ink, sun-bleached calm
inline constexpr Theme sand{ "sand", "dune beige, umber ink, sun-bleached calm", "Minimal", false,
    Palette{Color{239, 228, 210, 255}, Color{248, 243, 235, 255}, Color{228, 217, 200, 255}, Color{220, 208, 191, 255}, Color{62, 50, 39, 26}, Color{62, 50, 39, 46}, Color{62, 50, 39, 255}, Color{119, 107, 94, 255}, Color{154, 143, 128, 255}, Color{176, 116, 60, 255}, Color{176, 116, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{239, 228, 210, 255}, Color{248, 243, 235, 255}, Color{228, 217, 200, 255}, Color{220, 208, 191, 255}, Color{221, 210, 193, 255}, Color{207, 196, 179, 255}, Color{62, 50, 39, 255}, Color{119, 107, 94, 255}, Color{154, 143, 128, 255}, Color{176, 116, 60, 255}, Color{176, 116, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// raw grey concrete, bold black type
inline constexpr Theme concrete{ "concrete", "raw grey concrete, bold black type", "Minimal", false,
    Palette{Color{217, 217, 214, 255}, Color{238, 238, 237, 255}, Color{205, 205, 202, 255}, Color{195, 195, 193, 255}, Color{21, 21, 21, 26}, Color{21, 21, 21, 46}, Color{21, 21, 21, 255}, Color{84, 84, 83, 255}, Color{123, 123, 121, 255}, Color{255, 90, 31, 255}, Color{255, 90, 31, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{217, 217, 214, 255}, Color{238, 238, 237, 255}, Color{205, 205, 202, 255}, Color{195, 195, 193, 255}, Color{197, 197, 194, 255}, Color{182, 182, 179, 255}, Color{21, 21, 21, 255}, Color{84, 84, 83, 255}, Color{123, 123, 121, 255}, Color{255, 90, 31, 255}, Color{255, 90, 31, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// pencil-lead greys with a mint highlight
inline constexpr Theme graphite{ "graphite", "pencil-lead greys with a mint highlight", "Minimal", true,
    Palette{Color{43, 45, 48, 255}, Color{52, 54, 57, 255}, Color{60, 62, 65, 255}, Color{71, 73, 76, 255}, Color{230, 231, 232, 36}, Color{230, 231, 232, 66}, Color{230, 231, 232, 255}, Color{170, 171, 173, 255}, Color{133, 134, 136, 255}, Color{125, 226, 184, 255}, Color{125, 226, 184, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{43, 45, 48, 255}, Color{52, 54, 57, 255}, Color{60, 62, 65, 255}, Color{71, 73, 76, 255}, Color{69, 71, 74, 255}, Color{91, 93, 96, 255}, Color{230, 231, 232, 255}, Color{170, 171, 173, 255}, Color{133, 134, 136, 255}, Color{125, 226, 184, 255}, Color{125, 226, 184, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// international style: grid, black, a single red
inline constexpr Theme swiss_red{ "swiss-red", "international style: grid, black, a single red", "Minimal", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{228, 228, 228, 255}, Color{10, 10, 10, 26}, Color{10, 10, 10, 46}, Color{10, 10, 10, 255}, Color{88, 88, 88, 255}, Color{137, 137, 137, 255}, Color{225, 37, 27, 255}, Color{225, 37, 27, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{228, 228, 228, 255}, Color{230, 230, 230, 255}, Color{211, 211, 211, 255}, Color{10, 10, 10, 255}, Color{88, 88, 88, 255}, Color{137, 137, 137, 255}, Color{225, 37, 27, 255}, Color{225, 37, 27, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// deep navy night with a moonlit blue
inline constexpr Theme midnight{ "midnight", "deep navy night with a moonlit blue", "Dark", true,
    Palette{Color{11, 16, 32, 255}, Color{22, 27, 43, 255}, Color{30, 35, 51, 255}, Color{43, 48, 64, 255}, Color{223, 230, 245, 36}, Color{223, 230, 245, 66}, Color{223, 230, 245, 255}, Color{155, 162, 177, 255}, Color{113, 119, 134, 255}, Color{110, 168, 255, 255}, Color{167, 139, 250, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 16, 32, 255}, Color{22, 27, 43, 255}, Color{30, 35, 51, 255}, Color{43, 48, 64, 255}, Color{41, 46, 62, 255}, Color{66, 71, 87, 255}, Color{223, 230, 245, 255}, Color{155, 162, 177, 255}, Color{113, 119, 134, 255}, Color{110, 168, 255, 255}, Color{167, 139, 250, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// volcanic black glass with violet edges
inline constexpr Theme obsidian{ "obsidian", "volcanic black glass with violet edges", "Dark", true,
    Palette{Color{10, 10, 13, 255}, Color{21, 21, 24, 255}, Color{30, 30, 34, 255}, Color{43, 43, 47, 255}, Color{233, 231, 242, 36}, Color{233, 231, 242, 66}, Color{233, 231, 242, 255}, Color{162, 160, 169, 255}, Color{117, 116, 123, 255}, Color{157, 123, 255, 255}, Color{255, 106, 213, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 10, 13, 255}, Color{21, 21, 24, 255}, Color{30, 30, 34, 255}, Color{43, 43, 47, 255}, Color{41, 41, 45, 255}, Color{68, 67, 72, 255}, Color{233, 231, 242, 255}, Color{162, 160, 169, 255}, Color{117, 116, 123, 255}, Color{157, 123, 255, 255}, Color{255, 106, 213, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pure ink black, paper-white type, one red
inline constexpr Theme ink{ "ink", "pure ink black, paper-white type, one red", "Dark", true,
    Palette{Color{14, 14, 14, 255}, Color{25, 25, 25, 255}, Color{35, 34, 34, 255}, Color{48, 48, 47, 255}, Color{242, 240, 235, 36}, Color{242, 240, 235, 66}, Color{242, 240, 235, 255}, Color{169, 168, 164, 255}, Color{123, 122, 120, 255}, Color{255, 59, 47, 255}, Color{255, 59, 47, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{14, 14, 14, 255}, Color{25, 25, 25, 255}, Color{35, 34, 34, 255}, Color{48, 48, 47, 255}, Color{46, 46, 45, 255}, Color{73, 72, 71, 255}, Color{242, 240, 235, 255}, Color{169, 168, 164, 255}, Color{123, 122, 120, 255}, Color{255, 59, 47, 255}, Color{255, 59, 47, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// abyssal teal with bioluminescent cyan
inline constexpr Theme deep_sea{ "deep-sea", "abyssal teal with bioluminescent cyan", "Dark", true,
    Palette{Color{4, 27, 34, 255}, Color{15, 38, 45, 255}, Color{23, 47, 53, 255}, Color{36, 60, 66, 255}, Color{214, 244, 247, 36}, Color{214, 244, 247, 66}, Color{214, 244, 247, 255}, Color{147, 175, 179, 255}, Color{105, 131, 136, 255}, Color{45, 226, 230, 255}, Color{61, 124, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{4, 27, 34, 255}, Color{15, 38, 45, 255}, Color{23, 47, 53, 255}, Color{36, 60, 66, 255}, Color{34, 58, 64, 255}, Color{58, 83, 89, 255}, Color{214, 244, 247, 255}, Color{147, 175, 179, 255}, Color{105, 131, 136, 255}, Color{45, 226, 230, 255}, Color{61, 124, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pine shadows, moss green, firefly gold
inline constexpr Theme forest_night{ "forest-night", "pine shadows, moss green, firefly gold", "Dark", true,
    Palette{Color{13, 22, 17, 255}, Color{24, 33, 27, 255}, Color{32, 41, 36, 255}, Color{45, 54, 48, 255}, Color{226, 234, 223, 36}, Color{226, 234, 223, 66}, Color{226, 234, 223, 255}, Color{158, 166, 157, 255}, Color{115, 124, 116, 255}, Color{124, 195, 110, 255}, Color{242, 193, 78, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 22, 17, 255}, Color{24, 33, 27, 255}, Color{32, 41, 36, 255}, Color{45, 54, 48, 255}, Color{43, 52, 46, 255}, Color{68, 77, 70, 255}, Color{226, 234, 223, 255}, Color{158, 166, 157, 255}, Color{115, 124, 116, 255}, Color{124, 195, 110, 255}, Color{242, 193, 78, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// dark roast brown with crema highlights
inline constexpr Theme espresso{ "espresso", "dark roast brown with crema highlights", "Dark", true,
    Palette{Color{27, 19, 16, 255}, Color{38, 30, 26, 255}, Color{46, 38, 34, 255}, Color{59, 51, 46, 255}, Color{242, 230, 218, 36}, Color{242, 230, 218, 66}, Color{242, 230, 218, 255}, Color{173, 162, 153, 255}, Color{130, 120, 113, 255}, Color{217, 160, 102, 255}, Color{217, 160, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{27, 19, 16, 255}, Color{38, 30, 26, 255}, Color{46, 38, 34, 255}, Color{59, 51, 46, 255}, Color{57, 49, 45, 255}, Color{83, 74, 68, 255}, Color{242, 230, 218, 255}, Color{173, 162, 153, 255}, Color{130, 120, 113, 255}, Color{217, 160, 102, 255}, Color{217, 160, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// velvet plum with rose-gold trim
inline constexpr Theme plum{ "plum", "velvet plum with rose-gold trim", "Dark", true,
    Palette{Color{29, 16, 32, 255}, Color{40, 27, 42, 255}, Color{48, 35, 51, 255}, Color{61, 48, 63, 255}, Color{244, 230, 240, 36}, Color{244, 230, 240, 66}, Color{244, 230, 240, 255}, Color{175, 162, 173, 255}, Color{132, 119, 132, 255}, Color{231, 164, 192, 255}, Color{201, 169, 110, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{29, 16, 32, 255}, Color{40, 27, 42, 255}, Color{48, 35, 51, 255}, Color{61, 48, 63, 255}, Color{59, 46, 61, 255}, Color{85, 71, 86, 255}, Color{244, 230, 240, 255}, Color{175, 162, 173, 255}, Color{132, 119, 132, 255}, Color{231, 164, 192, 255}, Color{201, 169, 110, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// gothic purple-black with blood-red accents
inline constexpr Theme vampire{ "vampire", "gothic purple-black with blood-red accents", "Dark", true,
    Palette{Color{22, 16, 28, 255}, Color{33, 27, 39, 255}, Color{42, 35, 48, 255}, Color{55, 48, 61, 255}, Color{240, 230, 245, 36}, Color{240, 230, 245, 66}, Color{240, 230, 245, 255}, Color{170, 162, 176, 255}, Color{127, 119, 132, 255}, Color{255, 69, 102, 255}, Color{189, 147, 249, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{22, 16, 28, 255}, Color{33, 27, 39, 255}, Color{42, 35, 48, 255}, Color{55, 48, 61, 255}, Color{53, 46, 59, 255}, Color{78, 71, 84, 255}, Color{240, 230, 245, 255}, Color{170, 162, 176, 255}, Color{127, 119, 132, 255}, Color{255, 69, 102, 255}, Color{189, 147, 249, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// arctic slate with frost blues
inline constexpr Theme nord_night{ "nord-night", "arctic slate with frost blues", "Dark", true,
    Palette{Color{46, 52, 64, 255}, Color{56, 61, 73, 255}, Color{63, 69, 80, 255}, Color{75, 80, 91, 255}, Color{236, 239, 244, 36}, Color{236, 239, 244, 66}, Color{236, 239, 244, 255}, Color{175, 179, 186, 255}, Color{137, 142, 150, 255}, Color{136, 192, 208, 255}, Color{180, 142, 173, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{46, 52, 64, 255}, Color{56, 61, 73, 255}, Color{63, 69, 80, 255}, Color{75, 80, 91, 255}, Color{73, 78, 89, 255}, Color{95, 100, 111, 255}, Color{236, 239, 244, 255}, Color{175, 179, 186, 255}, Color{137, 142, 150, 255}, Color{136, 192, 208, 255}, Color{180, 142, 173, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// matte charcoal, amber indicators, studio calm
inline constexpr Theme charcoal{ "charcoal", "matte charcoal, amber indicators, studio calm", "Dark", true,
    Palette{Color{30, 31, 34, 255}, Color{40, 41, 44, 255}, Color{48, 49, 51, 255}, Color{60, 61, 63, 255}, Color{232, 230, 227, 36}, Color{232, 230, 227, 66}, Color{232, 230, 227, 255}, Color{167, 166, 165, 255}, Color{127, 127, 127, 255}, Color{255, 181, 71, 255}, Color{255, 181, 71, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{30, 31, 34, 255}, Color{40, 41, 44, 255}, Color{48, 49, 51, 255}, Color{60, 61, 63, 255}, Color{59, 59, 61, 255}, Color{82, 83, 84, 255}, Color{232, 230, 227, 255}, Color{167, 166, 165, 255}, Color{127, 127, 127, 255}, Color{255, 181, 71, 255}, Color{255, 181, 71, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// lilac fields, soft violet buttons
inline constexpr Theme lavender{ "lavender", "lilac fields, soft violet buttons", "Pastel", false,
    Palette{Color{243, 239, 255, 255}, Color{250, 248, 255, 255}, Color{231, 227, 245, 255}, Color{221, 217, 236, 255}, Color{46, 37, 80, 26}, Color{46, 37, 80, 46}, Color{46, 37, 80, 255}, Color{109, 102, 136, 255}, Color{148, 142, 171, 255}, Color{139, 108, 240, 255}, Color{244, 154, 193, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 239, 255, 255}, Color{250, 248, 255, 255}, Color{231, 227, 245, 255}, Color{221, 217, 236, 255}, Color{223, 218, 237, 255}, Color{207, 203, 223, 255}, Color{46, 37, 80, 255}, Color{109, 102, 136, 255}, Color{148, 142, 171, 255}, Color{139, 108, 240, 255}, Color{244, 154, 193, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// fresh mint with a deep green ink
inline constexpr Theme mint{ "mint", "fresh mint with a deep green ink", "Pastel", false,
    Palette{Color{236, 251, 243, 255}, Color{246, 253, 250, 255}, Color{223, 239, 231, 255}, Color{213, 230, 221, 255}, Color{23, 59, 44, 26}, Color{23, 59, 44, 46}, Color{23, 59, 44, 255}, Color{91, 120, 108, 255}, Color{134, 159, 147, 255}, Color{47, 179, 122, 255}, Color{122, 199, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 251, 243, 255}, Color{246, 253, 250, 255}, Color{223, 239, 231, 255}, Color{213, 230, 221, 255}, Color{214, 231, 223, 255}, Color{198, 216, 207, 255}, Color{23, 59, 44, 255}, Color{91, 120, 108, 255}, Color{134, 159, 147, 255}, Color{47, 179, 122, 255}, Color{122, 199, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// peach fuzz, apricot buttons, warm and soft
inline constexpr Theme peach{ "peach", "peach fuzz, apricot buttons, warm and soft", "Pastel", false,
    Palette{Color{255, 241, 232, 255}, Color{255, 249, 245, 255}, Color{244, 229, 220, 255}, Color{235, 219, 210, 255}, Color{74, 44, 34, 26}, Color{74, 44, 34, 46}, Color{74, 44, 34, 255}, Color{132, 107, 97, 255}, Color{168, 146, 137, 255}, Color{255, 138, 92, 255}, Color{255, 196, 107, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 241, 232, 255}, Color{255, 249, 245, 255}, Color{244, 229, 220, 255}, Color{235, 219, 210, 255}, Color{237, 221, 212, 255}, Color{222, 205, 196, 255}, Color{74, 44, 34, 255}, Color{132, 107, 97, 255}, Color{168, 146, 137, 255}, Color{255, 138, 92, 255}, Color{255, 196, 107, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// cherry-blossom pink with sumi ink
inline constexpr Theme sakura{ "sakura", "cherry-blossom pink with sumi ink", "Pastel", false,
    Palette{Color{255, 242, 245, 255}, Color{255, 249, 251, 255}, Color{243, 230, 233, 255}, Color{233, 219, 223, 255}, Color{58, 36, 48, 26}, Color{58, 36, 48, 46}, Color{58, 36, 48, 255}, Color{121, 102, 111, 255}, Color{160, 143, 150, 255}, Color{232, 102, 143, 255}, Color{154, 208, 194, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 242, 245, 255}, Color{255, 249, 251, 255}, Color{243, 230, 233, 255}, Color{233, 219, 223, 255}, Color{235, 221, 225, 255}, Color{219, 205, 209, 255}, Color{58, 36, 48, 255}, Color{121, 102, 111, 255}, Color{160, 143, 150, 255}, Color{232, 102, 143, 255}, Color{154, 208, 194, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// cloud white and clear-sky blue
inline constexpr Theme sky{ "sky", "cloud white and clear-sky blue", "Pastel", false,
    Palette{Color{238, 246, 255, 255}, Color{247, 251, 255, 255}, Color{225, 234, 244, 255}, Color{215, 224, 235, 255}, Color{27, 47, 74, 26}, Color{27, 47, 74, 46}, Color{27, 47, 74, 255}, Color{95, 111, 132, 255}, Color{137, 150, 168, 255}, Color{74, 155, 255, 255}, Color{155, 231, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 246, 255, 255}, Color{247, 251, 255, 255}, Color{225, 234, 244, 255}, Color{215, 224, 235, 255}, Color{216, 226, 237, 255}, Color{200, 210, 222, 255}, Color{27, 47, 74, 255}, Color{95, 111, 132, 255}, Color{137, 150, 168, 255}, Color{74, 155, 255, 255}, Color{155, 231, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// lemon sorbet with a charcoal outline
inline constexpr Theme lemon{ "lemon", "lemon sorbet with a charcoal outline", "Pastel", false,
    Palette{Color{255, 251, 224, 255}, Color{255, 253, 241, 255}, Color{242, 238, 212, 255}, Color{232, 228, 203, 255}, Color{43, 42, 31, 26}, Color{43, 42, 31, 46}, Color{43, 42, 31, 255}, Color{111, 109, 93, 255}, Color{153, 151, 131, 255}, Color{245, 196, 0, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 251, 224, 255}, Color{255, 253, 241, 255}, Color{242, 238, 212, 255}, Color{232, 228, 203, 255}, Color{233, 230, 204, 255}, Color{217, 213, 189, 255}, Color{43, 42, 31, 255}, Color{111, 109, 93, 255}, Color{153, 151, 131, 255}, Color{245, 196, 0, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 2.0f };

/// bubblegum pink, candy blue, bouncy
inline constexpr Theme bubblegum{ "bubblegum", "bubblegum pink, candy blue, bouncy", "Pastel", false,
    Palette{Color{255, 234, 246, 255}, Color{255, 246, 251, 255}, Color{243, 221, 234, 255}, Color{234, 210, 225, 255}, Color{61, 18, 54, 26}, Color{61, 18, 54, 46}, Color{61, 18, 54, 255}, Color{123, 87, 115, 255}, Color{162, 130, 154, 255}, Color{255, 79, 179, 255}, Color{79, 195, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 234, 246, 255}, Color{255, 246, 251, 255}, Color{243, 221, 234, 255}, Color{234, 210, 225, 255}, Color{235, 212, 226, 255}, Color{220, 195, 211, 255}, Color{61, 18, 54, 255}, Color{123, 87, 115, 255}, Color{162, 130, 154, 255}, Color{255, 79, 179, 255}, Color{79, 195, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// seafoam green with coral pops
inline constexpr Theme seafoam{ "seafoam", "seafoam green with coral pops", "Pastel", false,
    Palette{Color{233, 250, 246, 255}, Color{245, 253, 251, 255}, Color{220, 238, 234, 255}, Color{210, 229, 225, 255}, Color{22, 58, 54, 26}, Color{22, 58, 54, 46}, Color{22, 58, 54, 255}, Color{90, 119, 115, 255}, Color{132, 158, 154, 255}, Color{255, 127, 106, 255}, Color{56, 194, 165, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{233, 250, 246, 255}, Color{245, 253, 251, 255}, Color{220, 238, 234, 255}, Color{210, 229, 225, 255}, Color{211, 230, 226, 255}, Color{195, 215, 211, 255}, Color{22, 58, 54, 255}, Color{90, 119, 115, 255}, Color{132, 158, 154, 255}, Color{255, 127, 106, 255}, Color{56, 194, 165, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// loud orange, black type, no apologies
inline constexpr Theme tangerine{ "tangerine", "loud orange, black type, no apologies", "Bold", false,
    Palette{Color{255, 122, 26, 255}, Color{255, 195, 152, 255}, Color{241, 116, 25, 255}, Color{230, 110, 24, 255}, Color{26, 15, 6, 26}, Color{26, 15, 6, 46}, Color{26, 15, 6, 255}, Color{99, 49, 12, 255}, Color{145, 71, 16, 255}, Color{26, 15, 6, 255}, Color{255, 243, 224, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 122, 26, 255}, Color{255, 195, 152, 255}, Color{241, 116, 25, 255}, Color{230, 110, 24, 255}, Color{232, 111, 24, 255}, Color{214, 103, 22, 255}, Color{26, 15, 6, 255}, Color{99, 49, 12, 255}, Color{145, 71, 16, 255}, Color{26, 15, 6, 255}, Color{255, 243, 224, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// electric cobalt field, white type, lemon accent
inline constexpr Theme cobalt{ "cobalt", "electric cobalt field, white type, lemon accent", "Bold", true,
    Palette{Color{29, 63, 216, 255}, Color{40, 73, 218, 255}, Color{49, 80, 220, 255}, Color{63, 92, 222, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{183, 194, 243, 255}, Color{137, 155, 235, 255}, Color{255, 225, 77, 255}, Color{255, 225, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{29, 63, 216, 255}, Color{40, 73, 218, 255}, Color{49, 80, 220, 255}, Color{63, 92, 222, 255}, Color{61, 90, 222, 255}, Color{87, 113, 226, 255}, Color{255, 255, 255, 255}, Color{183, 194, 243, 255}, Color{137, 155, 235, 255}, Color{255, 225, 77, 255}, Color{255, 225, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// hot magenta with cyan clash
inline constexpr Theme magenta{ "magenta", "hot magenta with cyan clash", "Bold", true,
    Palette{Color{255, 45, 149, 255}, Color{243, 43, 143, 255}, Color{234, 41, 138, 255}, Color{220, 38, 131, 255}, Color{20, 0, 26, 36}, Color{20, 0, 26, 66}, Color{20, 0, 26, 255}, Color{95, 14, 65, 255}, Color{142, 23, 90, 255}, Color{20, 0, 26, 255}, Color{33, 227, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 45, 149, 255}, Color{243, 43, 143, 255}, Color{234, 41, 138, 255}, Color{220, 38, 131, 255}, Color{222, 39, 132, 255}, Color{194, 33, 117, 255}, Color{20, 0, 26, 255}, Color{95, 14, 65, 255}, Color{142, 23, 90, 255}, Color{20, 0, 26, 255}, Color{33, 227, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// two-ink riso print: fluoro pink + blue on paper
inline constexpr Theme risograph{ "risograph", "two-ink riso print: fluoro pink + blue on paper", "Bold", false,
    Palette{Color{246, 241, 231, 255}, Color{251, 249, 244, 255}, Color{233, 230, 229, 255}, Color{223, 222, 228, 255}, Color{35, 64, 201, 26}, Color{35, 64, 201, 46}, Color{35, 64, 201, 255}, Color{103, 121, 211, 255}, Color{145, 156, 217, 255}, Color{255, 79, 154, 255}, Color{35, 64, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 241, 231, 255}, Color{251, 249, 244, 255}, Color{233, 230, 229, 255}, Color{223, 222, 228, 255}, Color{224, 223, 228, 255}, Color{208, 209, 226, 255}, Color{35, 64, 201, 255}, Color{103, 121, 211, 255}, Color{145, 156, 217, 255}, Color{255, 79, 154, 255}, Color{35, 64, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// comic-book halftones, primary colours, ink outlines
inline constexpr Theme pop_art{ "pop-art", "comic-book halftones, primary colours, ink outlines", "Bold", false,
    Palette{Color{255, 243, 92, 255}, Color{255, 250, 182, 255}, Color{241, 229, 88, 255}, Color{229, 218, 84, 255}, Color{17, 17, 17, 26}, Color{17, 17, 17, 46}, Color{17, 17, 17, 255}, Color{93, 89, 41, 255}, Color{141, 135, 56, 255}, Color{255, 43, 43, 255}, Color{43, 107, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 243, 92, 255}, Color{255, 250, 182, 255}, Color{241, 229, 88, 255}, Color{229, 218, 84, 255}, Color{231, 220, 84, 255}, Color{212, 202, 78, 255}, Color{17, 17, 17, 255}, Color{93, 89, 41, 255}, Color{141, 135, 56, 255}, Color{255, 43, 43, 255}, Color{43, 107, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// primary geometry: red, yellow, blue on cream
inline constexpr Theme bauhaus{ "bauhaus", "primary geometry: red, yellow, blue on cream", "Bold", false,
    Palette{Color{242, 234, 216, 255}, Color{249, 246, 237, 255}, Color{229, 221, 204, 255}, Color{218, 210, 194, 255}, Color{20, 20, 20, 26}, Color{20, 20, 20, 46}, Color{20, 20, 20, 255}, Color{91, 88, 83, 255}, Color{135, 131, 122, 255}, Color{214, 40, 27, 255}, Color{31, 79, 181, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{242, 234, 216, 255}, Color{249, 246, 237, 255}, Color{229, 221, 204, 255}, Color{218, 210, 194, 255}, Color{219, 212, 196, 255}, Color{202, 195, 181, 255}, Color{20, 20, 20, 255}, Color{91, 88, 83, 255}, Color{135, 131, 122, 255}, Color{214, 40, 27, 255}, Color{31, 79, 181, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// 80s memphis squiggles, teal and pink
inline constexpr Theme memphis{ "memphis", "80s memphis squiggles, teal and pink", "Bold", false,
    Palette{Color{255, 248, 239, 255}, Color{255, 252, 248, 255}, Color{241, 235, 227, 255}, Color{230, 224, 218, 255}, Color{27, 27, 47, 26}, Color{27, 27, 47, 46}, Color{27, 27, 47, 255}, Color{100, 98, 108, 255}, Color{146, 142, 147, 255}, Color{255, 92, 168, 255}, Color{33, 196, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 248, 239, 255}, Color{255, 252, 248, 255}, Color{241, 235, 227, 255}, Color{230, 224, 218, 255}, Color{232, 225, 219, 255}, Color{214, 208, 204, 255}, Color{27, 27, 47, 255}, Color{100, 98, 108, 255}, Color{146, 142, 147, 255}, Color{255, 92, 168, 255}, Color{33, 196, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 2.0f };

/// acid lime neo-brutalism, thick black outlines
inline constexpr Theme brutal_lime{ "brutal-lime", "acid lime neo-brutalism, thick black outlines", "Bold", false,
    Palette{Color{232, 255, 90, 255}, Color{245, 255, 181, 255}, Color{218, 240, 85, 255}, Color{206, 227, 80, 255}, Color{0, 0, 0, 26}, Color{0, 0, 0, 46}, Color{0, 0, 0, 255}, Color{74, 82, 29, 255}, Color{121, 133, 47, 255}, Color{0, 0, 0, 255}, Color{255, 94, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{232, 255, 90, 255}, Color{245, 255, 181, 255}, Color{218, 240, 85, 255}, Color{206, 227, 80, 255}, Color{208, 229, 81, 255}, Color{190, 209, 74, 255}, Color{0, 0, 0, 255}, Color{74, 82, 29, 255}, Color{121, 133, 47, 255}, Color{0, 0, 0, 255}, Color{255, 94, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// amber phosphor terminal from 1983
inline constexpr Theme amber_crt{ "amber-crt", "amber phosphor terminal from 1983", "Retro", true,
    Palette{Color{19, 12, 2, 255}, Color{31, 21, 4, 255}, Color{40, 27, 5, 255}, Color{54, 38, 8, 255}, Color{255, 182, 39, 36}, Color{255, 182, 39, 66}, Color{255, 182, 39, 255}, Color{179, 128, 27, 255}, Color{132, 94, 20, 255}, Color{255, 182, 39, 255}, Color{255, 217, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{19, 12, 2, 255}, Color{31, 21, 4, 255}, Color{40, 27, 5, 255}, Color{54, 38, 8, 255}, Color{52, 36, 7, 255}, Color{80, 56, 12, 255}, Color{255, 182, 39, 255}, Color{179, 128, 27, 255}, Color{132, 94, 20, 255}, Color{255, 182, 39, 255}, Color{255, 217, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", ui-monospace, monospace", "\"VT323\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// four shades of handheld green
inline constexpr Theme gameboy{ "gameboy", "four shades of handheld green", "Retro", false,
    Palette{Color{155, 188, 15, 255}, Color{139, 172, 15, 255}, Color{147, 180, 15, 255}, Color{140, 173, 15, 255}, Color{15, 56, 15, 26}, Color{15, 56, 15, 46}, Color{15, 56, 15, 255}, Color{60, 98, 15, 255}, Color{88, 125, 15, 255}, Color{48, 98, 48, 255}, Color{139, 172, 15, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{155, 188, 15, 255}, Color{139, 172, 15, 255}, Color{147, 180, 15, 255}, Color{140, 173, 15, 255}, Color{141, 175, 15, 255}, Color{130, 164, 15, 255}, Color{15, 56, 15, 255}, Color{60, 98, 15, 255}, Color{88, 125, 15, 255}, Color{48, 98, 48, 255}, Color{139, 172, 15, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Press Start 2P\", ui-monospace, monospace", "\"Press Start 2P\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// pastel grid sunsets, marble busts and chrome
inline constexpr Theme vaporwave{ "vaporwave", "pastel grid sunsets, marble busts and chrome", "Retro", true,
    Palette{Color{43, 16, 85, 255}, Color{54, 27, 94, 255}, Color{62, 36, 100, 255}, Color{75, 50, 111, 255}, Color{253, 242, 255, 36}, Color{253, 242, 255, 66}, Color{253, 242, 255, 255}, Color{186, 170, 201, 255}, Color{144, 124, 167, 255}, Color{255, 113, 206, 255}, Color{1, 205, 254, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{43, 16, 85, 255}, Color{54, 27, 94, 255}, Color{62, 36, 100, 255}, Color{75, 50, 111, 255}, Color{73, 48, 109, 255}, Color{97, 74, 129, 255}, Color{253, 242, 255, 255}, Color{186, 170, 201, 255}, Color{144, 124, 167, 255}, Color{255, 113, 206, 255}, Color{1, 205, 254, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Major Mono Display\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// outrun sunset, neon grid, chrome type
inline constexpr Theme synthwave{ "synthwave", "outrun sunset, neon grid, chrome type", "Retro", true,
    Palette{Color{26, 9, 51, 255}, Color{37, 20, 61, 255}, Color{47, 29, 69, 255}, Color{60, 43, 82, 255}, Color{255, 233, 255, 36}, Color{255, 233, 255, 66}, Color{255, 233, 255, 255}, Color{182, 161, 190, 255}, Color{136, 117, 149, 255}, Color{255, 47, 214, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 9, 51, 255}, Color{37, 20, 61, 255}, Color{47, 29, 69, 255}, Color{60, 43, 82, 255}, Color{58, 41, 80, 255}, Color{85, 67, 104, 255}, Color{255, 233, 255, 255}, Color{182, 161, 190, 255}, Color{136, 117, 149, 255}, Color{255, 47, 214, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Audiowide\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// coin-op cabinet: black, neon red and yellow
inline constexpr Theme arcade{ "arcade", "coin-op cabinet: black, neon red and yellow", "Retro", true,
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{244, 244, 255, 36}, Color{244, 244, 255, 66}, Color{244, 244, 255, 255}, Color{169, 169, 180, 255}, Color{123, 123, 133, 255}, Color{255, 46, 77, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{44, 44, 53, 255}, Color{71, 71, 81, 255}, Color{244, 244, 255, 255}, Color{169, 169, 180, 255}, Color{123, 123, 133, 255}, Color{255, 46, 77, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Press Start 2P\", ui-monospace, monospace", "\"Press Start 2P\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// broadcast teletext: black field, primary blocks
inline constexpr Theme teletext{ "teletext", "broadcast teletext: black field, primary blocks", "Retro", true,
    Palette{Color{0, 0, 0, 255}, Color{13, 13, 13, 255}, Color{23, 23, 23, 255}, Color{38, 38, 38, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{173, 173, 173, 255}, Color{122, 122, 122, 255}, Color{255, 255, 0, 255}, Color{0, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 0, 0, 255}, Color{13, 13, 13, 255}, Color{23, 23, 23, 255}, Color{38, 38, 38, 255}, Color{36, 36, 36, 255}, Color{66, 66, 66, 255}, Color{255, 255, 255, 255}, Color{173, 173, 173, 255}, Color{122, 122, 122, 255}, Color{255, 255, 0, 255}, Color{0, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", ui-monospace, monospace", "\"VT323\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// faded instant-film creams and teal shadows
inline constexpr Theme polaroid{ "polaroid", "faded instant-film creams and teal shadows", "Retro", false,
    Palette{Color{241, 235, 225, 255}, Color{249, 246, 242, 255}, Color{229, 224, 215, 255}, Color{219, 216, 207, 255}, Color{42, 58, 61, 26}, Color{42, 58, 61, 46}, Color{42, 58, 61, 255}, Color{106, 115, 113, 255}, Color{145, 150, 146, 255}, Color{217, 108, 79, 255}, Color{79, 138, 139, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{241, 235, 225, 255}, Color{249, 246, 242, 255}, Color{229, 224, 215, 255}, Color{219, 216, 207, 255}, Color{221, 217, 208, 255}, Color{205, 203, 195, 255}, Color{42, 58, 61, 255}, Color{106, 115, 113, 255}, Color{145, 150, 146, 255}, Color{217, 108, 79, 255}, Color{79, 138, 139, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// beige desktop era with bevelled grey chrome
inline constexpr Theme win_classic{ "win-classic", "beige desktop era with bevelled grey chrome", "Retro", false,
    Palette{Color{195, 199, 203, 255}, Color{228, 230, 232, 255}, Color{183, 187, 191, 255}, Color{174, 177, 181, 255}, Color{0, 0, 0, 26}, Color{0, 0, 0, 46}, Color{0, 0, 0, 255}, Color{62, 64, 65, 255}, Color{101, 103, 106, 255}, Color{0, 0, 128, 255}, Color{0, 128, 128, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{195, 199, 203, 255}, Color{228, 230, 232, 255}, Color{183, 187, 191, 255}, Color{174, 177, 181, 255}, Color{175, 179, 182, 255}, Color{160, 163, 166, 255}, Color{0, 0, 0, 255}, Color{62, 64, 65, 255}, Color{101, 103, 106, 255}, Color{0, 0, 128, 255}, Color{0, 128, 128, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 0.0f };

/// damp forest floor and moss green
inline constexpr Theme moss{ "moss", "damp forest floor and moss green", "Nature", false,
    Palette{Color{238, 241, 230, 255}, Color{247, 249, 244, 255}, Color{226, 229, 218, 255}, Color{216, 220, 208, 255}, Color{36, 48, 28, 26}, Color{36, 48, 28, 46}, Color{36, 48, 28, 255}, Color{101, 110, 93, 255}, Color{141, 148, 133, 255}, Color{90, 125, 47, 255}, Color{176, 138, 62, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 241, 230, 255}, Color{247, 249, 244, 255}, Color{226, 229, 218, 255}, Color{216, 220, 208, 255}, Color{217, 221, 209, 255}, Color{202, 206, 194, 255}, Color{36, 48, 28, 255}, Color{101, 110, 93, 255}, Color{141, 148, 133, 255}, Color{90, 125, 47, 255}, Color{176, 138, 62, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// open ocean blues with whitecap foam
inline constexpr Theme ocean{ "ocean", "open ocean blues with whitecap foam", "Nature", false,
    Palette{Color{231, 243, 250, 255}, Color{244, 250, 253, 255}, Color{218, 231, 239, 255}, Color{207, 221, 230, 255}, Color{12, 42, 64, 26}, Color{12, 42, 64, 46}, Color{12, 42, 64, 255}, Color{82, 106, 124, 255}, Color{126, 147, 161, 255}, Color{10, 123, 191, 255}, Color{63, 208, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{231, 243, 250, 255}, Color{244, 250, 253, 255}, Color{218, 231, 239, 255}, Color{207, 221, 230, 255}, Color{209, 223, 231, 255}, Color{191, 207, 216, 255}, Color{12, 42, 64, 255}, Color{82, 106, 124, 255}, Color{126, 147, 161, 255}, Color{10, 123, 191, 255}, Color{63, 208, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// sandstone, cactus green and sunset clay
inline constexpr Theme desert{ "desert", "sandstone, cactus green and sunset clay", "Nature", false,
    Palette{Color{244, 227, 200, 255}, Color{250, 242, 230, 255}, Color{233, 216, 189, 255}, Color{224, 206, 181, 255}, Color{61, 38, 24, 26}, Color{61, 38, 24, 46}, Color{61, 38, 24, 255}, Color{120, 98, 80, 255}, Color{156, 136, 116, 255}, Color{200, 85, 61, 255}, Color{91, 140, 90, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 227, 200, 255}, Color{250, 242, 230, 255}, Color{233, 216, 189, 255}, Color{224, 206, 181, 255}, Color{225, 208, 182, 255}, Color{211, 193, 168, 255}, Color{61, 38, 24, 255}, Color{120, 98, 80, 255}, Color{156, 136, 116, 255}, Color{200, 85, 61, 255}, Color{91, 140, 90, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// glacial ice, cold blue light
inline constexpr Theme glacier{ "glacier", "glacial ice, cold blue light", "Nature", false,
    Palette{Color{234, 246, 251, 255}, Color{246, 251, 253, 255}, Color{221, 234, 240, 255}, Color{211, 224, 232, 255}, Color{22, 50, 74, 26}, Color{22, 50, 74, 46}, Color{22, 50, 74, 255}, Color{90, 113, 131, 255}, Color{132, 152, 166, 255}, Color{58, 155, 217, 255}, Color{166, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{234, 246, 251, 255}, Color{246, 251, 253, 255}, Color{221, 234, 240, 255}, Color{211, 224, 232, 255}, Color{212, 226, 233, 255}, Color{196, 211, 219, 255}, Color{22, 50, 74, 255}, Color{90, 113, 131, 255}, Color{132, 152, 166, 255}, Color{58, 155, 217, 255}, Color{166, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// maple orange, oak brown, harvest gold
inline constexpr Theme autumn{ "autumn", "maple orange, oak brown, harvest gold", "Nature", false,
    Palette{Color{251, 241, 228, 255}, Color{253, 249, 243, 255}, Color{239, 229, 216, 255}, Color{230, 218, 205, 255}, Color{58, 36, 22, 26}, Color{58, 36, 22, 46}, Color{58, 36, 22, 255}, Color{120, 102, 88, 255}, Color{158, 143, 129, 255}, Color{210, 96, 26, 255}, Color{201, 154, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 241, 228, 255}, Color{253, 249, 243, 255}, Color{239, 229, 216, 255}, Color{230, 218, 205, 255}, Color{231, 220, 207, 255}, Color{216, 204, 191, 255}, Color{58, 36, 22, 255}, Color{120, 102, 88, 255}, Color{158, 143, 129, 255}, Color{210, 96, 26, 255}, Color{201, 154, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// basalt black, flowing lava, ember glow
inline constexpr Theme volcano{ "volcano", "basalt black, flowing lava, ember glow", "Nature", true,
    Palette{Color{20, 11, 8, 255}, Color{31, 22, 19, 255}, Color{40, 31, 27, 255}, Color{54, 44, 40, 255}, Color{246, 230, 220, 36}, Color{246, 230, 220, 66}, Color{246, 230, 220, 255}, Color{174, 160, 152, 255}, Color{128, 116, 110, 255}, Color{255, 77, 26, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{20, 11, 8, 255}, Color{31, 22, 19, 255}, Color{40, 31, 27, 255}, Color{54, 44, 40, 255}, Color{52, 42, 38, 255}, Color{78, 68, 63, 255}, Color{246, 230, 220, 255}, Color{174, 160, 152, 255}, Color{128, 116, 110, 255}, Color{255, 77, 26, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// white pearlescent with iridescent pink, mint and blue, like a CS2 Printstream finish
inline constexpr Theme pearl{ "pearl", "white pearlescent with iridescent pink, mint and blue, like a CS2 Printstream finish", "Signature", false,
    Palette{Color{251, 250, 255, 255}, Color{253, 253, 255, 255}, Color{238, 237, 244, 255}, Color{228, 226, 234, 255}, Color{42, 35, 66, 26}, Color{42, 35, 66, 46}, Color{42, 35, 66, 255}, Color{109, 104, 126, 255}, Color{151, 147, 164, 255}, Color{143, 127, 214, 255}, Color{127, 200, 227, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 250, 255, 255}, Color{253, 253, 255, 255}, Color{238, 237, 244, 255}, Color{228, 226, 234, 255}, Color{230, 228, 236, 255}, Color{213, 211, 221, 255}, Color{42, 35, 66, 255}, Color{109, 104, 126, 255}, Color{151, 147, 164, 255}, Color{143, 127, 214, 255}, Color{127, 200, 227, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// black pearlescent with an oil-slick sheen
inline constexpr Theme black_pearl{ "black-pearl", "black pearlescent with an oil-slick sheen", "Signature", true,
    Palette{Color{12, 11, 18, 255}, Color{23, 22, 30, 255}, Color{32, 31, 39, 255}, Color{46, 44, 54, 255}, Color{239, 234, 255, 36}, Color{239, 234, 255, 66}, Color{239, 234, 255, 255}, Color{166, 163, 179, 255}, Color{121, 118, 132, 255}, Color{181, 156, 255, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{12, 11, 18, 255}, Color{23, 22, 30, 255}, Color{32, 31, 39, 255}, Color{46, 44, 54, 255}, Color{44, 42, 51, 255}, Color{71, 69, 79, 255}, Color{239, 234, 255, 255}, Color{166, 163, 179, 255}, Color{121, 118, 132, 255}, Color{181, 156, 255, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// deep sapphire with a polished metal band through the type
inline constexpr Theme sapphire_metal{ "sapphire-metal", "deep sapphire with a polished metal band through the type", "Signature", true,
    Palette{Color{6, 11, 36, 255}, Color{17, 22, 47, 255}, Color{26, 31, 56, 255}, Color{39, 45, 69, 255}, Color{227, 236, 255, 36}, Color{227, 236, 255, 66}, Color{227, 236, 255, 255}, Color{156, 164, 185, 255}, Color{112, 119, 141, 255}, Color{61, 107, 255, 255}, Color{159, 192, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 11, 36, 255}, Color{17, 22, 47, 255}, Color{26, 31, 56, 255}, Color{39, 45, 69, 255}, Color{37, 43, 67, 255}, Color{63, 69, 93, 255}, Color{227, 236, 255, 255}, Color{156, 164, 185, 255}, Color{112, 119, 141, 255}, Color{61, 107, 255, 255}, Color{159, 192, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pink to violet to gold candy fade, inspired by the Fade knife finish
inline constexpr Theme fade{ "fade", "pink to violet to gold candy fade, inspired by the Fade knife finish", "Signature", false,
    Palette{Color{255, 244, 251, 255}, Color{255, 250, 253, 255}, Color{243, 230, 239, 255}, Color{233, 219, 230, 255}, Color{58, 18, 56, 26}, Color{58, 18, 56, 46}, Color{58, 18, 56, 255}, Color{121, 90, 118, 255}, Color{160, 136, 157, 255}, Color{255, 79, 163, 255}, Color{255, 201, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 251, 255}, Color{255, 250, 253, 255}, Color{243, 230, 239, 255}, Color{233, 219, 230, 255}, Color{235, 221, 231, 255}, Color{219, 203, 216, 255}, Color{58, 18, 56, 255}, Color{121, 90, 118, 255}, Color{160, 136, 157, 255}, Color{255, 79, 163, 255}, Color{255, 201, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// deep space purple-blue with sparkling dust, inspired by Doppler blades
inline constexpr Theme doppler{ "doppler", "deep space purple-blue with sparkling dust, inspired by Doppler blades", "Signature", true,
    Palette{Color{10, 4, 32, 255}, Color{21, 15, 43, 255}, Color{30, 24, 52, 255}, Color{44, 38, 65, 255}, Color{236, 230, 255, 36}, Color{236, 230, 255, 66}, Color{236, 230, 255, 255}, Color{164, 158, 184, 255}, Color{118, 112, 139, 255}, Color{138, 92, 255, 255}, Color{41, 198, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 4, 32, 255}, Color{21, 15, 43, 255}, Color{30, 24, 52, 255}, Color{44, 38, 65, 255}, Color{42, 36, 63, 255}, Color{68, 62, 90, 255}, Color{236, 230, 255, 255}, Color{164, 158, 184, 255}, Color{118, 112, 139, 255}, Color{138, 92, 255, 255}, Color{41, 198, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// emerald gem green with a gamma glow
inline constexpr Theme emerald{ "emerald", "emerald gem green with a gamma glow", "Signature", true,
    Palette{Color{3, 21, 13, 255}, Color{14, 33, 24, 255}, Color{23, 42, 33, 255}, Color{36, 56, 47, 255}, Color{220, 255, 238, 36}, Color{220, 255, 238, 66}, Color{220, 255, 238, 255}, Color{151, 180, 166, 255}, Color{107, 133, 121, 255}, Color{25, 227, 138, 255}, Color{122, 255, 209, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{3, 21, 13, 255}, Color{14, 33, 24, 255}, Color{23, 42, 33, 255}, Color{36, 56, 47, 255}, Color{34, 54, 45, 255}, Color{59, 82, 71, 255}, Color{220, 255, 238, 255}, Color{151, 180, 166, 255}, Color{107, 133, 121, 255}, Color{25, 227, 138, 255}, Color{122, 255, 209, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// cut ruby red with internal fire
inline constexpr Theme ruby{ "ruby", "cut ruby red with internal fire", "Signature", true,
    Palette{Color{22, 2, 10, 255}, Color{34, 13, 21, 255}, Color{43, 22, 30, 255}, Color{57, 36, 44, 255}, Color{255, 227, 234, 36}, Color{255, 227, 234, 66}, Color{255, 227, 234, 255}, Color{180, 155, 162, 255}, Color{134, 110, 118, 255}, Color{255, 31, 79, 255}, Color{255, 138, 163, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{22, 2, 10, 255}, Color{34, 13, 21, 255}, Color{43, 22, 30, 255}, Color{57, 36, 44, 255}, Color{55, 34, 42, 255}, Color{82, 60, 68, 255}, Color{255, 227, 234, 255}, Color{180, 155, 162, 255}, Color{134, 110, 118, 255}, Color{255, 31, 79, 255}, Color{255, 138, 163, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// swirled red, yellow and blue marble, like a Marble Fade
inline constexpr Theme marble_fade{ "marble-fade", "swirled red, yellow and blue marble, like a Marble Fade", "Signature", false,
    Palette{Color{255, 248, 238, 255}, Color{255, 252, 247, 255}, Color{242, 235, 225, 255}, Color{232, 224, 215, 255}, Color{42, 26, 26, 26}, Color{42, 26, 26, 46}, Color{42, 26, 26, 255}, Color{110, 97, 94, 255}, Color{153, 141, 136, 255}, Color{232, 50, 47, 255}, Color{47, 107, 232, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 248, 238, 255}, Color{255, 252, 247, 255}, Color{242, 235, 225, 255}, Color{232, 224, 215, 255}, Color{233, 225, 216, 255}, Color{217, 208, 200, 255}, Color{42, 26, 26, 255}, Color{110, 97, 94, 255}, Color{153, 141, 136, 255}, Color{232, 50, 47, 255}, Color{47, 107, 232, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// heat-treated steel: blue, gold and bronze patina
inline constexpr Theme case_hardened{ "case-hardened", "heat-treated steel: blue, gold and bronze patina", "Signature", true,
    Palette{Color{26, 31, 43, 255}, Color{37, 42, 53, 255}, Color{45, 50, 61, 255}, Color{58, 63, 74, 255}, Color{238, 241, 247, 36}, Color{238, 241, 247, 66}, Color{238, 241, 247, 255}, Color{170, 174, 182, 255}, Color{128, 132, 141, 255}, Color{63, 123, 217, 255}, Color{214, 168, 74, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 31, 43, 255}, Color{37, 42, 53, 255}, Color{45, 50, 61, 255}, Color{58, 63, 74, 255}, Color{56, 61, 72, 255}, Color{81, 85, 96, 255}, Color{238, 241, 247, 255}, Color{170, 174, 182, 255}, Color{128, 132, 141, 255}, Color{63, 123, 217, 255}, Color{214, 168, 74, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Rajdhani\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// molten gold with tiger stripes
inline constexpr Theme tiger_tooth{ "tiger-tooth", "molten gold with tiger stripes", "Signature", false,
    Palette{Color{255, 176, 0, 255}, Color{255, 219, 140, 255}, Color{242, 167, 0, 255}, Color{230, 159, 0, 255}, Color{31, 18, 0, 26}, Color{31, 18, 0, 46}, Color{31, 18, 0, 255}, Color{103, 69, 0, 255}, Color{147, 100, 0, 255}, Color{31, 18, 0, 255}, Color{255, 122, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 176, 0, 255}, Color{255, 219, 140, 255}, Color{242, 167, 0, 255}, Color{230, 159, 0, 255}, Color{232, 160, 0, 255}, Color{215, 147, 0, 255}, Color{31, 18, 0, 255}, Color{103, 69, 0, 255}, Color{147, 100, 0, 255}, Color{31, 18, 0, 255}, Color{255, 122, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// folded steel with flowing grain
inline constexpr Theme damascus{ "damascus", "folded steel with flowing grain", "Signature", true,
    Palette{Color{32, 35, 38, 255}, Color{42, 45, 48, 255}, Color{50, 53, 56, 255}, Color{62, 65, 68, 255}, Color{233, 236, 239, 36}, Color{233, 236, 239, 66}, Color{233, 236, 239, 255}, Color{169, 172, 175, 255}, Color{128, 131, 134, 255}, Color{154, 166, 178, 255}, Color{208, 215, 222, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{32, 35, 38, 255}, Color{42, 45, 48, 255}, Color{50, 53, 56, 255}, Color{62, 65, 68, 255}, Color{60, 63, 66, 255}, Color{84, 87, 90, 255}, Color{233, 236, 239, 255}, Color{169, 172, 175, 255}, Color{128, 131, 134, 255}, Color{154, 166, 178, 255}, Color{208, 215, 222, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// deep crimson with a black web pattern
inline constexpr Theme crimson_web{ "crimson-web", "deep crimson with a black web pattern", "Signature", true,
    Palette{Color{58, 3, 6, 255}, Color{68, 14, 17, 255}, Color{76, 23, 26, 255}, Color{88, 37, 40, 255}, Color{255, 230, 230, 36}, Color{255, 230, 230, 66}, Color{255, 230, 230, 255}, Color{192, 157, 158, 255}, Color{153, 112, 114, 255}, Color{255, 42, 53, 255}, Color{0, 0, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{58, 3, 6, 255}, Color{68, 14, 17, 255}, Color{76, 23, 26, 255}, Color{88, 37, 40, 255}, Color{86, 35, 38, 255}, Color{109, 62, 64, 255}, Color{255, 230, 230, 255}, Color{192, 157, 158, 255}, Color{153, 112, 114, 255}, Color{255, 42, 53, 255}, Color{0, 0, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// colour-shift paint flipping teal to purple
inline constexpr Theme chameleon{ "chameleon", "colour-shift paint flipping teal to purple", "Signature", true,
    Palette{Color{14, 10, 26, 255}, Color{25, 21, 37, 255}, Color{34, 30, 47, 255}, Color{48, 43, 60, 255}, Color{239, 233, 255, 36}, Color{239, 233, 255, 66}, Color{239, 233, 255, 255}, Color{167, 162, 182, 255}, Color{122, 117, 136, 255}, Color{31, 209, 193, 255}, Color{162, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{14, 10, 26, 255}, Color{25, 21, 37, 255}, Color{34, 30, 47, 255}, Color{48, 43, 60, 255}, Color{46, 41, 58, 255}, Color{72, 68, 85, 255}, Color{239, 233, 255, 255}, Color{167, 162, 182, 255}, Color{122, 117, 136, 255}, Color{31, 209, 193, 255}, Color{162, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// deep candy-apple red car paint with a clearcoat
inline constexpr Theme candy_apple{ "candy-apple", "deep candy-apple red car paint with a clearcoat", "Signature", true,
    Palette{Color{26, 3, 6, 255}, Color{37, 15, 18, 255}, Color{47, 24, 27, 255}, Color{60, 38, 41, 255}, Color{255, 233, 236, 36}, Color{255, 233, 236, 66}, Color{255, 233, 236, 255}, Color{182, 159, 162, 255}, Color{136, 113, 116, 255}, Color{224, 16, 42, 255}, Color{255, 107, 129, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 3, 6, 255}, Color{37, 15, 18, 255}, Color{47, 24, 27, 255}, Color{60, 38, 41, 255}, Color{58, 35, 38, 255}, Color{85, 63, 66, 255}, Color{255, 233, 236, 255}, Color{182, 159, 162, 255}, Color{136, 113, 116, 255}, Color{224, 16, 42, 255}, Color{255, 107, 129, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// anodised aluminium in electric blue and violet
inline constexpr Theme anodized{ "anodized", "anodised aluminium in electric blue and violet", "Signature", true,
    Palette{Color{13, 16, 34, 255}, Color{24, 27, 45, 255}, Color{33, 36, 54, 255}, Color{46, 49, 67, 255}, Color{232, 236, 255, 36}, Color{232, 236, 255, 66}, Color{232, 236, 255, 255}, Color{162, 166, 184, 255}, Color{118, 122, 140, 255}, Color{79, 107, 255, 255}, Color{192, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 16, 34, 255}, Color{24, 27, 45, 255}, Color{33, 36, 54, 255}, Color{46, 49, 67, 255}, Color{44, 47, 65, 255}, Color{70, 73, 91, 255}, Color{232, 236, 255, 255}, Color{162, 166, 184, 255}, Color{118, 122, 140, 255}, Color{79, 107, 255, 255}, Color{192, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// brushed titanium greys, precision engineered
inline constexpr Theme titanium{ "titanium", "brushed titanium greys, precision engineered", "Signature", true,
    Palette{Color{44, 47, 51, 255}, Color{54, 57, 61, 255}, Color{62, 65, 68, 255}, Color{74, 76, 80, 255}, Color{241, 243, 245, 36}, Color{241, 243, 245, 66}, Color{241, 243, 245, 255}, Color{178, 180, 183, 255}, Color{139, 141, 144, 255}, Color{195, 203, 212, 255}, Color{125, 138, 150, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{44, 47, 51, 255}, Color{54, 57, 61, 255}, Color{62, 65, 68, 255}, Color{74, 76, 80, 255}, Color{72, 75, 78, 255}, Color{95, 98, 101, 255}, Color{241, 243, 245, 255}, Color{178, 180, 183, 255}, Color{139, 141, 144, 255}, Color{195, 203, 212, 255}, Color{125, 138, 150, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// dark gunmetal with machined edges
inline constexpr Theme gunmetal{ "gunmetal", "dark gunmetal with machined edges", "Signature", true,
    Palette{Color{27, 30, 34, 255}, Color{37, 40, 44, 255}, Color{45, 48, 52, 255}, Color{57, 60, 64, 255}, Color{227, 231, 236, 36}, Color{227, 231, 236, 66}, Color{227, 231, 236, 255}, Color{163, 167, 171, 255}, Color{123, 126, 131, 255}, Color{143, 163, 184, 255}, Color{197, 210, 223, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{27, 30, 34, 255}, Color{37, 40, 44, 255}, Color{45, 48, 52, 255}, Color{57, 60, 64, 255}, Color{55, 58, 63, 255}, Color{79, 82, 86, 255}, Color{227, 231, 236, 255}, Color{163, 167, 171, 255}, Color{123, 126, 131, 255}, Color{143, 163, 184, 255}, Color{197, 210, 223, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// blush rose gold with soft champagne light
inline constexpr Theme rose_gold{ "rose-gold", "blush rose gold with soft champagne light", "Signature", false,
    Palette{Color{255, 244, 241, 255}, Color{255, 250, 249, 255}, Color{244, 232, 229, 255}, Color{235, 222, 219, 255}, Color{74, 42, 42, 26}, Color{74, 42, 42, 46}, Color{74, 42, 42, 255}, Color{132, 107, 106, 255}, Color{168, 147, 145, 255}, Color{212, 135, 122, 255}, Color{232, 195, 158, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 241, 255}, Color{255, 250, 249, 255}, Color{244, 232, 229, 255}, Color{235, 222, 219, 255}, Color{237, 223, 221, 255}, Color{222, 208, 205, 255}, Color{74, 42, 42, 255}, Color{132, 107, 106, 255}, Color{168, 147, 145, 255}, Color{212, 135, 122, 255}, Color{232, 195, 158, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// black lacquer with hammered gold leaf
inline constexpr Theme gold_leaf{ "gold-leaf", "black lacquer with hammered gold leaf", "Signature", true,
    Palette{Color{11, 9, 6, 255}, Color{23, 20, 16, 255}, Color{32, 29, 24, 255}, Color{46, 43, 36, 255}, Color{246, 234, 208, 36}, Color{246, 234, 208, 66}, Color{246, 234, 208, 255}, Color{171, 162, 143, 255}, Color{124, 117, 103, 255}, Color{212, 166, 58, 255}, Color{247, 224, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 9, 6, 255}, Color{23, 20, 16, 255}, Color{32, 29, 24, 255}, Color{46, 43, 36, 255}, Color{44, 41, 35, 255}, Color{72, 67, 58, 255}, Color{246, 234, 208, 255}, Color{171, 162, 143, 255}, Color{124, 117, 103, 255}, Color{212, 166, 58, 255}, Color{247, 224, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Cormorant Garamond\", Georgia, serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// trading-card holographic foil
inline constexpr Theme holo_foil{ "holo-foil", "trading-card holographic foil", "Signature", false,
    Palette{Color{244, 244, 248, 255}, Color{250, 250, 252, 255}, Color{231, 231, 236, 255}, Color{220, 220, 225, 255}, Color{29, 29, 43, 26}, Color{29, 29, 43, 46}, Color{29, 29, 43, 255}, Color{98, 98, 109, 255}, Color{141, 141, 150, 255}, Color{122, 92, 255, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 244, 248, 255}, Color{250, 250, 252, 255}, Color{231, 231, 236, 255}, Color{220, 220, 225, 255}, Color{222, 222, 227, 255}, Color{205, 205, 211, 255}, Color{29, 29, 43, 255}, Color{98, 98, 109, 255}, Color{141, 141, 150, 255}, Color{122, 92, 255, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// woven carbon fibre with a racing red accent
inline constexpr Theme carbon_fiber{ "carbon-fiber", "woven carbon fibre with a racing red accent", "Signature", true,
    Palette{Color{18, 19, 20, 255}, Color{29, 30, 31, 255}, Color{38, 39, 40, 255}, Color{51, 52, 53, 255}, Color{238, 238, 238, 36}, Color{238, 238, 238, 66}, Color{238, 238, 238, 255}, Color{168, 168, 168, 255}, Color{124, 124, 125, 255}, Color{255, 43, 43, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 19, 20, 255}, Color{29, 30, 31, 255}, Color{38, 39, 40, 255}, Color{51, 52, 53, 255}, Color{49, 50, 51, 255}, Color{75, 76, 76, 255}, Color{238, 238, 238, 255}, Color{168, 168, 168, 255}, Color{124, 124, 125, 255}, Color{255, 43, 43, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// northern lights rippling over a polar night
inline constexpr Theme aurora_borealis{ "aurora-borealis", "northern lights rippling over a polar night", "Signature", true,
    Palette{Color{5, 13, 26, 255}, Color{16, 25, 37, 255}, Color{25, 34, 47, 255}, Color{39, 49, 60, 255}, Color{230, 251, 255, 36}, Color{230, 251, 255, 66}, Color{230, 251, 255, 255}, Color{158, 175, 182, 255}, Color{113, 127, 136, 255}, Color{61, 255, 180, 255}, Color{122, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{5, 13, 26, 255}, Color{16, 25, 37, 255}, Color{25, 34, 47, 255}, Color{39, 49, 60, 255}, Color{37, 47, 58, 255}, Color{63, 75, 85, 255}, Color{230, 251, 255, 255}, Color{158, 175, 182, 255}, Color{113, 127, 136, 255}, Color{61, 255, 180, 255}, Color{122, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// cosmic dust clouds in magenta and cyan
inline constexpr Theme nebula{ "nebula", "cosmic dust clouds in magenta and cyan", "Signature", true,
    Palette{Color{7, 3, 26, 255}, Color{19, 15, 37, 255}, Color{28, 24, 47, 255}, Color{42, 38, 60, 255}, Color{241, 233, 255, 36}, Color{241, 233, 255, 66}, Color{241, 233, 255, 255}, Color{166, 159, 182, 255}, Color{119, 113, 136, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{7, 3, 26, 255}, Color{19, 15, 37, 255}, Color{28, 24, 47, 255}, Color{42, 38, 60, 255}, Color{40, 35, 58, 255}, Color{68, 63, 85, 255}, Color{241, 233, 255, 255}, Color{166, 159, 182, 255}, Color{119, 113, 136, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// mirror chrome over a cool blue studio
inline constexpr Theme liquid_chrome{ "liquid-chrome", "mirror chrome over a cool blue studio", "Signature", false,
    Palette{Color{223, 229, 236, 255}, Color{241, 243, 246, 255}, Color{211, 217, 224, 255}, Color{201, 207, 214, 255}, Color{21, 26, 34, 26}, Color{21, 26, 34, 46}, Color{21, 26, 34, 255}, Color{86, 91, 99, 255}, Color{126, 132, 139, 255}, Color{90, 107, 128, 255}, Color{159, 178, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{223, 229, 236, 255}, Color{241, 243, 246, 255}, Color{211, 217, 224, 255}, Color{201, 207, 214, 255}, Color{202, 208, 215, 255}, Color{187, 192, 200, 255}, Color{21, 26, 34, 255}, Color{86, 91, 99, 255}, Color{126, 132, 139, 255}, Color{90, 107, 128, 255}, Color{159, 178, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// groovy molten blobs in orange and magenta
inline constexpr Theme lava_lamp{ "lava-lamp", "groovy molten blobs in orange and magenta", "Signature", true,
    Palette{Color{42, 10, 31, 255}, Color{53, 21, 42, 255}, Color{61, 30, 50, 255}, Color{74, 43, 63, 255}, Color{255, 232, 243, 36}, Color{255, 232, 243, 66}, Color{255, 232, 243, 255}, Color{187, 161, 175, 255}, Color{144, 117, 133, 255}, Color{255, 122, 26, 255}, Color{255, 45, 149, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{42, 10, 31, 255}, Color{53, 21, 42, 255}, Color{61, 30, 50, 255}, Color{74, 43, 63, 255}, Color{72, 41, 61, 255}, Color{97, 67, 86, 255}, Color{255, 232, 243, 255}, Color{187, 161, 175, 255}, Color{144, 117, 133, 255}, Color{255, 122, 26, 255}, Color{255, 45, 149, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 1.0f };

/// gallery-white walls, black captions and one ochre label
inline constexpr Theme museum{ "museum", "gallery-white walls, black captions and one ochre label", "Minimal", false,
    Palette{Color{250, 250, 247, 255}, Color{253, 253, 251, 255}, Color{236, 236, 234, 255}, Color{225, 225, 222, 255}, Color{22, 22, 22, 26}, Color{22, 22, 22, 46}, Color{22, 22, 22, 255}, Color{95, 95, 94, 255}, Color{141, 141, 139, 255}, Color{192, 138, 43, 255}, Color{192, 138, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{250, 250, 247, 255}, Color{253, 253, 251, 255}, Color{236, 236, 234, 255}, Color{225, 225, 222, 255}, Color{227, 227, 224, 255}, Color{209, 209, 206, 255}, Color{22, 22, 22, 255}, Color{95, 95, 94, 255}, Color{141, 141, 139, 255}, Color{192, 138, 43, 255}, Color{192, 138, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// oat-milk beige, cocoa type, soft extruded panels
inline constexpr Theme oat{ "oat", "oat-milk beige, cocoa type, soft extruded panels", "Minimal", false,
    Palette{Color{239, 231, 218, 255}, Color{248, 244, 238, 255}, Color{228, 220, 207, 255}, Color{219, 211, 198, 255}, Color{61, 47, 36, 26}, Color{61, 47, 36, 46}, Color{61, 47, 36, 255}, Color{118, 106, 94, 255}, Color{154, 143, 131, 255}, Color{138, 90, 59, 255}, Color{138, 90, 59, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{239, 231, 218, 255}, Color{248, 244, 238, 255}, Color{228, 220, 207, 255}, Color{219, 211, 198, 255}, Color{221, 212, 199, 255}, Color{207, 198, 185, 255}, Color{61, 47, 36, 255}, Color{118, 106, 94, 255}, Color{154, 143, 131, 255}, Color{138, 90, 59, 255}, Color{138, 90, 59, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// rice paper, sumi ink and a single vermilion seal
inline constexpr Theme zen{ "zen", "rice paper, sumi ink and a single vermilion seal", "Minimal", false,
    Palette{Color{245, 241, 232, 255}, Color{251, 249, 245, 255}, Color{232, 228, 219, 255}, Color{221, 217, 209, 255}, Color{28, 26, 23, 26}, Color{28, 26, 23, 46}, Color{28, 26, 23, 255}, Color{97, 95, 90, 255}, Color{141, 138, 132, 255}, Color{212, 64, 43, 255}, Color{212, 64, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{245, 241, 232, 255}, Color{251, 249, 245, 255}, Color{232, 228, 219, 255}, Color{221, 217, 209, 255}, Color{223, 219, 211, 255}, Color{206, 202, 194, 255}, Color{28, 26, 23, 255}, Color{97, 95, 90, 255}, Color{141, 138, 132, 255}, Color{212, 64, 43, 255}, Color{212, 64, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// bookkeeping cream with green rules and red totals
inline constexpr Theme ledger{ "ledger", "bookkeeping cream with green rules and red totals", "Minimal", false,
    Palette{Color{246, 244, 232, 255}, Color{251, 250, 245, 255}, Color{233, 232, 220, 255}, Color{222, 222, 210, 255}, Color{31, 42, 34, 26}, Color{31, 42, 34, 46}, Color{31, 42, 34, 255}, Color{100, 107, 97, 255}, Color{143, 147, 137, 255}, Color{46, 125, 79, 255}, Color{176, 58, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 244, 232, 255}, Color{251, 250, 245, 255}, Color{233, 232, 220, 255}, Color{222, 222, 210, 255}, Color{224, 223, 212, 255}, Color{207, 208, 196, 255}, Color{31, 42, 34, 255}, Color{100, 107, 97, 255}, Color{143, 147, 137, 255}, Color{46, 125, 79, 255}, Color{176, 58, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// polished onyx black with chrome-silver type
inline constexpr Theme onyx{ "onyx", "polished onyx black with chrome-silver type", "Dark", true,
    Palette{Color{8, 8, 10, 255}, Color{19, 19, 21, 255}, Color{28, 28, 30, 255}, Color{41, 41, 44, 255}, Color{231, 231, 234, 36}, Color{231, 231, 234, 66}, Color{231, 231, 234, 255}, Color{160, 160, 162, 255}, Color{115, 115, 118, 255}, Color{201, 206, 214, 255}, Color{111, 118, 128, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{8, 8, 10, 255}, Color{19, 19, 21, 255}, Color{28, 28, 30, 255}, Color{41, 41, 44, 255}, Color{39, 39, 42, 255}, Color{66, 66, 68, 255}, Color{231, 231, 234, 255}, Color{160, 160, 162, 255}, Color{115, 115, 118, 255}, Color{201, 206, 214, 255}, Color{111, 118, 128, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// the deep trench: soft bioluminescent violet and cyan
inline constexpr Theme abyss{ "abyss", "the deep trench: soft bioluminescent violet and cyan", "Dark", true,
    Palette{Color{3, 6, 20, 255}, Color{14, 17, 32, 255}, Color{22, 26, 41, 255}, Color{35, 39, 55, 255}, Color{216, 224, 255, 36}, Color{216, 224, 255, 66}, Color{216, 224, 255, 255}, Color{148, 154, 180, 255}, Color{105, 111, 133, 255}, Color{124, 92, 255, 255}, Color{45, 226, 230, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{3, 6, 20, 255}, Color{14, 17, 32, 255}, Color{22, 26, 41, 255}, Color{35, 39, 55, 255}, Color{33, 37, 53, 255}, Color{58, 62, 81, 255}, Color{216, 224, 255, 255}, Color{148, 154, 180, 255}, Color{105, 111, 133, 255}, Color{124, 92, 255, 255}, Color{45, 226, 230, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// film noir: black, rain on the window, one ember
inline constexpr Theme noir{ "noir", "film noir: black, rain on the window, one ember", "Dark", true,
    Palette{Color{13, 13, 13, 255}, Color{24, 24, 23, 255}, Color{33, 32, 32, 255}, Color{46, 45, 44, 255}, Color{232, 228, 220, 36}, Color{232, 228, 220, 66}, Color{232, 228, 220, 255}, Color{162, 159, 154, 255}, Color{118, 116, 112, 255}, Color{255, 106, 61, 255}, Color{255, 106, 61, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 13, 13, 255}, Color{24, 24, 23, 255}, Color{33, 32, 32, 255}, Color{46, 45, 44, 255}, Color{44, 43, 42, 255}, Color{70, 69, 67, 255}, Color{232, 228, 220, 255}, Color{162, 159, 154, 255}, Color{118, 116, 112, 255}, Color{255, 106, 61, 255}, Color{255, 106, 61, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// a black sun with a corona of gold
inline constexpr Theme eclipse{ "eclipse", "a black sun with a corona of gold", "Dark", true,
    Palette{Color{5, 5, 5, 255}, Color{17, 17, 16, 255}, Color{26, 26, 25, 255}, Color{41, 40, 38, 255}, Color{243, 238, 226, 36}, Color{243, 238, 226, 66}, Color{243, 238, 226, 255}, Color{167, 163, 155, 255}, Color{119, 117, 111, 255}, Color{255, 180, 59, 255}, Color{255, 90, 31, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{5, 5, 5, 255}, Color{17, 17, 16, 255}, Color{26, 26, 25, 255}, Color{41, 40, 38, 255}, Color{39, 38, 36, 255}, Color{67, 65, 62, 255}, Color{243, 238, 226, 255}, Color{167, 163, 155, 255}, Color{119, 117, 111, 255}, Color{255, 180, 59, 255}, Color{255, 90, 31, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// ultraviolet midnight with glossy lilac buttons
inline constexpr Theme ultraviolet{ "ultraviolet", "ultraviolet midnight with glossy lilac buttons", "Dark", true,
    Palette{Color{18, 10, 36, 255}, Color{29, 21, 47, 255}, Color{38, 30, 56, 255}, Color{51, 43, 69, 255}, Color{236, 227, 255, 36}, Color{236, 227, 255, 66}, Color{236, 227, 255, 255}, Color{166, 158, 185, 255}, Color{123, 114, 141, 255}, Color{176, 124, 255, 255}, Color{255, 122, 217, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 10, 36, 255}, Color{29, 21, 47, 255}, Color{38, 30, 56, 255}, Color{51, 43, 69, 255}, Color{49, 41, 67, 255}, Color{74, 66, 93, 255}, Color{236, 227, 255, 255}, Color{166, 158, 185, 255}, Color{123, 114, 141, 255}, Color{176, 124, 255, 255}, Color{255, 122, 217, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// pink and baby-blue spun sugar
inline constexpr Theme cotton_candy{ "cotton-candy", "pink and baby-blue spun sugar", "Pastel", false,
    Palette{Color{255, 240, 247, 255}, Color{255, 248, 251, 255}, Color{244, 228, 237, 255}, Color{235, 218, 228, 255}, Color{74, 42, 74, 26}, Color{74, 42, 74, 46}, Color{74, 42, 74, 255}, Color{132, 105, 129, 255}, Color{168, 145, 164, 255}, Color{255, 127, 191, 255}, Color{127, 203, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 240, 247, 255}, Color{255, 248, 251, 255}, Color{244, 228, 237, 255}, Color{235, 218, 228, 255}, Color{237, 220, 229, 255}, Color{222, 204, 216, 255}, Color{74, 42, 74, 255}, Color{132, 105, 129, 255}, Color{168, 145, 164, 255}, Color{255, 127, 191, 255}, Color{127, 203, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// pistachio, rose and lemon macarons in a box
inline constexpr Theme macaron{ "macaron", "pistachio, rose and lemon macarons in a box", "Pastel", false,
    Palette{Color{251, 246, 238, 255}, Color{253, 251, 247, 255}, Color{240, 234, 228, 255}, Color{230, 225, 219, 255}, Color{61, 51, 64, 26}, Color{61, 51, 64, 46}, Color{61, 51, 64, 255}, Color{122, 113, 120, 255}, Color{160, 152, 154, 255}, Color{238, 127, 166, 255}, Color{159, 210, 150, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 246, 238, 255}, Color{253, 251, 247, 255}, Color{240, 234, 228, 255}, Color{230, 225, 219, 255}, Color{232, 226, 220, 255}, Color{217, 211, 207, 255}, Color{61, 51, 64, 255}, Color{122, 113, 120, 255}, Color{160, 152, 154, 255}, Color{238, 127, 166, 255}, Color{159, 210, 150, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// periwinkle blue with a coral pop
inline constexpr Theme periwinkle{ "periwinkle", "periwinkle blue with a coral pop", "Pastel", false,
    Palette{Color{238, 240, 255, 255}, Color{247, 248, 255, 255}, Color{226, 228, 245, 255}, Color{216, 218, 236, 255}, Color{38, 42, 85, 26}, Color{38, 42, 85, 46}, Color{38, 42, 85, 255}, Color{102, 105, 139, 255}, Color{142, 145, 173, 255}, Color{108, 116, 240, 255}, Color{255, 138, 122, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 240, 255, 255}, Color{247, 248, 255, 255}, Color{226, 228, 245, 255}, Color{216, 218, 236, 255}, Color{218, 220, 238, 255}, Color{202, 204, 224, 255}, Color{38, 42, 85, 255}, Color{102, 105, 139, 255}, Color{142, 145, 173, 255}, Color{108, 116, 240, 255}, Color{255, 138, 122, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// mango, raspberry and lime sorbet
inline constexpr Theme sorbet{ "sorbet", "mango, raspberry and lime sorbet", "Pastel", false,
    Palette{Color{255, 246, 234, 255}, Color{255, 251, 246, 255}, Color{244, 234, 221, 255}, Color{235, 223, 211, 255}, Color{74, 38, 23, 26}, Color{74, 38, 23, 46}, Color{74, 38, 23, 255}, Color{132, 105, 91, 255}, Color{168, 146, 133, 255}, Color{255, 122, 89, 255}, Color{255, 194, 61, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 246, 234, 255}, Color{255, 251, 246, 255}, Color{244, 234, 221, 255}, Color{235, 223, 211, 255}, Color{237, 225, 212, 255}, Color{222, 208, 196, 255}, Color{74, 38, 23, 255}, Color{132, 105, 91, 255}, Color{168, 146, 133, 255}, Color{255, 122, 89, 255}, Color{255, 194, 61, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Bricolage Grotesque\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 1.0f };

/// electric blue, hazard yellow and hard pink shadows
inline constexpr Theme electric{ "electric", "electric blue, hazard yellow and hard pink shadows", "Bold", true,
    Palette{Color{16, 51, 255, 255}, Color{28, 61, 255, 255}, Color{38, 69, 255, 255}, Color{52, 82, 255, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{179, 190, 255, 255}, Color{131, 149, 255, 255}, Color{255, 230, 0, 255}, Color{255, 61, 127, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{16, 51, 255, 255}, Color{28, 61, 255, 255}, Color{38, 69, 255, 255}, Color{52, 82, 255, 255}, Color{50, 80, 255, 255}, Color{78, 104, 255, 255}, Color{255, 255, 255, 255}, Color{179, 190, 255, 255}, Color{131, 149, 255, 255}, Color{255, 230, 0, 255}, Color{255, 61, 127, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bricolage Grotesque\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// comic book: halftone dots, thick ink and a POW yellow
inline constexpr Theme comic{ "comic", "comic book: halftone dots, thick ink and a POW yellow", "Bold", false,
    Palette{Color{255, 247, 214, 255}, Color{255, 251, 237, 255}, Color{241, 233, 202, 255}, Color{229, 222, 192, 255}, Color{17, 17, 17, 26}, Color{17, 17, 17, 46}, Color{17, 17, 17, 255}, Color{93, 91, 80, 255}, Color{141, 137, 119, 255}, Color{255, 59, 48, 255}, Color{255, 212, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 247, 214, 255}, Color{255, 251, 237, 255}, Color{241, 233, 202, 255}, Color{229, 222, 192, 255}, Color{231, 224, 194, 255}, Color{212, 206, 178, 255}, Color{17, 17, 17, 255}, Color{93, 91, 80, 255}, Color{141, 137, 119, 255}, Color{255, 59, 48, 255}, Color{255, 212, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bungee\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 2.0f };

/// Swiss poster: huge black type on safety orange
inline constexpr Theme poster{ "poster", "Swiss poster: huge black type on safety orange", "Bold", true,
    Palette{Color{255, 90, 31, 255}, Color{243, 86, 30, 255}, Color{234, 83, 30, 255}, Color{219, 79, 29, 255}, Color{17, 17, 17, 36}, Color{17, 17, 17, 66}, Color{17, 17, 17, 255}, Color{93, 40, 21, 255}, Color{141, 55, 24, 255}, Color{17, 17, 17, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 90, 31, 255}, Color{243, 86, 30, 255}, Color{234, 83, 30, 255}, Color{219, 79, 29, 255}, Color{221, 80, 29, 255}, Color{193, 71, 27, 255}, Color{17, 17, 17, 255}, Color{93, 40, 21, 255}, Color{141, 55, 24, 255}, Color{17, 17, 17, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// acid lime on black, like a rave flyer
inline constexpr Theme acid{ "acid", "acid lime on black, like a rave flyer", "Bold", true,
    Palette{Color{10, 10, 10, 255}, Color{21, 22, 20, 255}, Color{31, 32, 28, 255}, Color{44, 47, 40, 255}, Color{239, 255, 209, 36}, Color{239, 255, 209, 66}, Color{239, 255, 209, 255}, Color{166, 177, 145, 255}, Color{120, 128, 106, 255}, Color{198, 255, 0, 255}, Color{255, 43, 214, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 10, 10, 255}, Color{21, 22, 20, 255}, Color{31, 32, 28, 255}, Color{44, 47, 40, 255}, Color{42, 45, 38, 255}, Color{69, 73, 62, 255}, Color{239, 255, 209, 255}, Color{166, 177, 145, 255}, Color{120, 128, 106, 255}, Color{198, 255, 0, 255}, Color{255, 43, 214, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// 70s cassette inlay: mustard, rust and cream
inline constexpr Theme cassette{ "cassette", "70s cassette inlay: mustard, rust and cream", "Retro", false,
    Palette{Color{243, 231, 201, 255}, Color{250, 244, 231, 255}, Color{232, 220, 191, 255}, Color{223, 210, 182, 255}, Color{58, 42, 26, 26}, Color{58, 42, 26, 46}, Color{58, 42, 26, 255}, Color{117, 102, 82, 255}, Color{154, 140, 117, 255}, Color{217, 130, 43, 255}, Color{194, 69, 45, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 231, 201, 255}, Color{250, 244, 231, 255}, Color{232, 220, 191, 255}, Color{223, 210, 182, 255}, Color{224, 212, 183, 255}, Color{210, 197, 169, 255}, Color{58, 42, 26, 255}, Color{117, 102, 82, 255}, Color{154, 140, 117, 255}, Color{217, 130, 43, 255}, Color{194, 69, 45, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Bricolage Grotesque\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// 50s diner: cherry red, mint and a checker floor
inline constexpr Theme diner{ "diner", "50s diner: cherry red, mint and a checker floor", "Retro", false,
    Palette{Color{247, 251, 248, 255}, Color{251, 253, 252, 255}, Color{234, 238, 235, 255}, Color{224, 227, 224, 255}, Color{34, 34, 34, 26}, Color{34, 34, 34, 46}, Color{34, 34, 34, 255}, Color{102, 103, 102, 255}, Color{145, 147, 145, 255}, Color{226, 38, 59, 255}, Color{95, 208, 184, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{247, 251, 248, 255}, Color{251, 253, 252, 255}, Color{234, 238, 235, 255}, Color{224, 227, 224, 255}, Color{225, 229, 226, 255}, Color{209, 212, 209, 255}, Color{34, 34, 34, 255}, Color{102, 103, 102, 255}, Color{145, 147, 145, 255}, Color{226, 38, 59, 255}, Color{95, 208, 184, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Pacifico\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 1.0f };

/// DOS blue screen with yellow highlights
inline constexpr Theme dos{ "dos", "DOS blue screen with yellow highlights", "Retro", true,
    Palette{Color{0, 0, 170, 255}, Color{13, 13, 174, 255}, Color{23, 23, 178, 255}, Color{38, 38, 183, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{173, 173, 228, 255}, Color{122, 122, 211, 255}, Color{255, 255, 85, 255}, Color{85, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 0, 170, 255}, Color{13, 13, 174, 255}, Color{23, 23, 178, 255}, Color{38, 38, 183, 255}, Color{36, 36, 182, 255}, Color{66, 66, 192, 255}, Color{255, 255, 255, 255}, Color{173, 173, 228, 255}, Color{122, 122, 211, 255}, Color{255, 255, 85, 255}, Color{85, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", ui-monospace, monospace", "\"Silkscreen\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// pinball cabinet: chrome rails and flashing lights
inline constexpr Theme pinball{ "pinball", "pinball cabinet: chrome rails and flashing lights", "Retro", true,
    Palette{Color{20, 8, 24, 255}, Color{32, 20, 35, 255}, Color{41, 29, 44, 255}, Color{55, 43, 58, 255}, Color{255, 242, 251, 36}, Color{255, 242, 251, 66}, Color{255, 242, 251, 255}, Color{180, 167, 178, 255}, Color{133, 120, 133, 255}, Color{255, 46, 147, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{20, 8, 24, 255}, Color{32, 20, 35, 255}, Color{41, 29, 44, 255}, Color{55, 43, 58, 255}, Color{53, 41, 56, 255}, Color{81, 69, 83, 255}, Color{255, 242, 251, 255}, Color{180, 167, 178, 255}, Color{133, 120, 133, 255}, Color{255, 46, 147, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Audiowide\", system-ui, sans-serif", "\"Monoton\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// VHS tracking lines with magenta and cyan bleed
inline constexpr Theme vhs{ "vhs", "VHS tracking lines with magenta and cyan bleed", "Retro", true,
    Palette{Color{11, 10, 18, 255}, Color{22, 21, 30, 255}, Color{32, 30, 39, 255}, Color{45, 44, 54, 255}, Color{240, 234, 255, 36}, Color{240, 234, 255, 66}, Color{240, 234, 255, 255}, Color{167, 162, 179, 255}, Color{121, 118, 132, 255}, Color{255, 61, 242, 255}, Color{61, 252, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 10, 18, 255}, Color{22, 21, 30, 255}, Color{32, 30, 39, 255}, Color{45, 44, 54, 255}, Color{43, 42, 51, 255}, Color{70, 68, 79, 255}, Color{240, 234, 255, 255}, Color{167, 162, 179, 255}, Color{121, 118, 132, 255}, Color{255, 61, 242, 255}, Color{61, 252, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// an old photograph in warm sepia
inline constexpr Theme sepia{ "sepia", "an old photograph in warm sepia", "Retro", false,
    Palette{Color{233, 220, 195, 255}, Color{245, 239, 228, 255}, Color{223, 209, 185, 255}, Color{214, 200, 176, 255}, Color{59, 42, 26, 26}, Color{59, 42, 26, 46}, Color{59, 42, 26, 255}, Color{115, 99, 80, 255}, Color{149, 135, 114, 255}, Color{139, 90, 43, 255}, Color{139, 90, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{233, 220, 195, 255}, Color{245, 239, 228, 255}, Color{223, 209, 185, 255}, Color{214, 200, 176, 255}, Color{215, 202, 178, 255}, Color{202, 188, 165, 255}, Color{59, 42, 26, 255}, Color{115, 99, 80, 255}, Color{149, 135, 114, 255}, Color{139, 90, 43, 255}, Color{139, 90, 43, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// spring meadow green with buttercup yellow
inline constexpr Theme meadow{ "meadow", "spring meadow green with buttercup yellow", "Nature", false,
    Palette{Color{242, 248, 234, 255}, Color{249, 252, 246, 255}, Color{229, 236, 221, 255}, Color{219, 226, 211, 255}, Color{31, 51, 23, 26}, Color{31, 51, 23, 46}, Color{31, 51, 23, 255}, Color{99, 114, 91, 255}, Color{141, 153, 133, 255}, Color{79, 157, 45, 255}, Color{242, 194, 48, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{242, 248, 234, 255}, Color{249, 252, 246, 255}, Color{229, 236, 221, 255}, Color{219, 226, 211, 255}, Color{220, 228, 212, 255}, Color{204, 212, 196, 255}, Color{31, 51, 23, 255}, Color{99, 114, 91, 255}, Color{141, 153, 133, 255}, Color{79, 157, 45, 255}, Color{242, 194, 48, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// red-rock canyon at golden hour, with contour lines
inline constexpr Theme canyon{ "canyon", "red-rock canyon at golden hour, with contour lines", "Nature", true,
    Palette{Color{42, 20, 12, 255}, Color{53, 31, 22, 255}, Color{61, 39, 30, 255}, Color{74, 52, 42, 255}, Color{255, 233, 214, 36}, Color{255, 233, 214, 66}, Color{255, 233, 214, 255}, Color{187, 165, 149, 255}, Color{144, 122, 109, 255}, Color{255, 122, 61, 255}, Color{255, 192, 107, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{42, 20, 12, 255}, Color{53, 31, 22, 255}, Color{61, 39, 30, 255}, Color{74, 52, 42, 255}, Color{72, 50, 41, 255}, Color{97, 75, 64, 255}, Color{255, 233, 214, 255}, Color{187, 165, 149, 255}, Color{144, 122, 109, 255}, Color{255, 122, 61, 255}, Color{255, 192, 107, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// dense canopy, rain and a parrot-red accent
inline constexpr Theme rainforest{ "rainforest", "dense canopy, rain and a parrot-red accent", "Nature", true,
    Palette{Color{7, 23, 15, 255}, Color{18, 34, 26, 255}, Color{26, 43, 34, 255}, Color{39, 56, 47, 255}, Color{220, 242, 226, 36}, Color{220, 242, 226, 66}, Color{220, 242, 226, 255}, Color{152, 172, 158, 255}, Color{109, 128, 116, 255}, Color{46, 204, 113, 255}, Color{255, 77, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{7, 23, 15, 255}, Color{18, 34, 26, 255}, Color{26, 43, 34, 255}, Color{39, 56, 47, 255}, Color{37, 54, 45, 255}, Color{62, 80, 70, 255}, Color{220, 242, 226, 255}, Color{152, 172, 158, 255}, Color{109, 128, 116, 255}, Color{46, 204, 113, 255}, Color{255, 77, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// turquoise shallows and living coral
inline constexpr Theme coral_reef{ "coral-reef", "turquoise shallows and living coral", "Nature", false,
    Palette{Color{230, 251, 251, 255}, Color{244, 253, 253, 255}, Color{217, 239, 239, 255}, Color{206, 229, 230, 255}, Color{8, 54, 59, 26}, Color{8, 54, 59, 46}, Color{8, 54, 59, 255}, Color{79, 117, 120, 255}, Color{123, 156, 159, 255}, Color{255, 111, 97, 255}, Color{19, 181, 177, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{230, 251, 251, 255}, Color{244, 253, 253, 255}, Color{217, 239, 239, 255}, Color{206, 229, 230, 255}, Color{207, 231, 231, 255}, Color{190, 215, 216, 255}, Color{8, 54, 59, 255}, Color{79, 117, 120, 255}, Color{123, 156, 159, 255}, Color{255, 111, 97, 255}, Color{19, 181, 177, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// snowy tundra, pale sky and lichen
inline constexpr Theme tundra{ "tundra", "snowy tundra, pale sky and lichen", "Nature", false,
    Palette{Color{238, 243, 245, 255}, Color{247, 250, 251, 255}, Color{226, 231, 234, 255}, Color{216, 222, 224, 255}, Color{36, 50, 58, 26}, Color{36, 50, 58, 46}, Color{36, 50, 58, 255}, Color{101, 112, 118, 255}, Color{141, 150, 155, 255}, Color{79, 127, 144, 255}, Color{147, 173, 92, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 243, 245, 255}, Color{247, 250, 251, 255}, Color{226, 231, 234, 255}, Color{216, 222, 224, 255}, Color{217, 223, 226, 255}, Color{202, 208, 211, 255}, Color{36, 50, 58, 255}, Color{101, 112, 118, 255}, Color{141, 150, 155, 255}, Color{79, 127, 144, 255}, Color{147, 173, 92, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// esports stage: black, team red and LED white
inline constexpr Theme esports{ "esports", "esports stage: black, team red and LED white", "Gaming", true,
    Palette{Color{10, 11, 15, 255}, Color{22, 23, 27, 255}, Color{31, 32, 36, 255}, Color{45, 46, 50, 255}, Color{242, 244, 248, 36}, Color{242, 244, 248, 66}, Color{242, 244, 248, 255}, Color{168, 169, 173, 255}, Color{121, 123, 127, 255}, Color{255, 45, 85, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 11, 15, 255}, Color{22, 23, 27, 255}, Color{31, 32, 36, 255}, Color{45, 46, 50, 255}, Color{43, 44, 48, 255}, Color{70, 71, 75, 255}, Color{242, 244, 248, 255}, Color{168, 169, 173, 255}, Color{121, 123, 127, 255}, Color{255, 45, 85, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// fantasy RPG: parchment, leather and quest gold
inline constexpr Theme rpg{ "rpg", "fantasy RPG: parchment, leather and quest gold", "Gaming", true,
    Palette{Color{42, 29, 18, 255}, Color{52, 39, 27, 255}, Color{60, 47, 34, 255}, Color{72, 59, 45, 255}, Color{242, 228, 200, 36}, Color{242, 228, 200, 66}, Color{242, 228, 200, 255}, Color{178, 164, 142, 255}, Color{138, 125, 105, 255}, Color{224, 176, 74, 255}, Color{138, 43, 29, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{42, 29, 18, 255}, Color{52, 39, 27, 255}, Color{60, 47, 34, 255}, Color{72, 59, 45, 255}, Color{70, 57, 44, 255}, Color{94, 81, 65, 255}, Color{242, 228, 200, 255}, Color{178, 164, 142, 255}, Color{138, 125, 105, 255}, Color{224, 176, 74, 255}, Color{138, 43, 29, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Cormorant Garamond\", Georgia, serif", "\"Cinzel\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// 8-bit console: sky blue, brick red and coin gold
inline constexpr Theme pixel_plains{ "pixel-plains", "8-bit console: sky blue, brick red and coin gold", "Gaming", false,
    Palette{Color{92, 148, 252, 255}, Color{182, 207, 254, 255}, Color{102, 154, 252, 255}, Color{110, 160, 252, 255}, Color{255, 255, 255, 26}, Color{255, 255, 255, 46}, Color{255, 255, 255, 255}, Color{203, 221, 254, 255}, Color{170, 199, 253, 255}, Color{228, 92, 16, 255}, Color{255, 204, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{92, 148, 252, 255}, Color{182, 207, 254, 255}, Color{102, 154, 252, 255}, Color{110, 160, 252, 255}, Color{109, 159, 252, 255}, Color{121, 167, 253, 255}, Color{255, 255, 255, 255}, Color{203, 221, 254, 255}, Color{170, 199, 253, 255}, Color{228, 92, 16, 255}, Color{255, 204, 0, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Silkscreen\", ui-monospace, monospace", "\"Press Start 2P\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// starship HUD: cyan lines over deep space
inline constexpr Theme hud{ "hud", "starship HUD: cyan lines over deep space", "Gaming", true,
    Palette{Color{2, 11, 20, 255}, Color{12, 22, 32, 255}, Color{20, 31, 41, 255}, Color{32, 45, 55, 255}, Color{205, 238, 255, 36}, Color{205, 238, 255, 66}, Color{205, 238, 255, 255}, Color{140, 165, 180, 255}, Color{99, 120, 133, 255}, Color{56, 225, 255, 255}, Color{255, 159, 28, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{2, 11, 20, 255}, Color{12, 22, 32, 255}, Color{20, 31, 41, 255}, Color{32, 45, 55, 255}, Color{31, 43, 53, 255}, Color{55, 70, 81, 255}, Color{205, 238, 255, 255}, Color{140, 165, 180, 255}, Color{99, 120, 133, 255}, Color{56, 225, 255, 255}, Color{255, 159, 28, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// battle-royale map: tactical olive and safety orange
inline constexpr Theme dropzone{ "dropzone", "battle-royale map: tactical olive and safety orange", "Gaming", true,
    Palette{Color{31, 34, 25, 255}, Color{41, 44, 35, 255}, Color{50, 53, 43, 255}, Color{62, 65, 55, 255}, Color{238, 240, 228, 36}, Color{238, 240, 228, 66}, Color{238, 240, 228, 255}, Color{172, 174, 163, 255}, Color{130, 133, 122, 255}, Color{255, 123, 28, 255}, Color{201, 209, 107, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{31, 34, 25, 255}, Color{41, 44, 35, 255}, Color{50, 53, 43, 255}, Color{62, 65, 55, 255}, Color{60, 63, 54, 255}, Color{85, 87, 78, 255}, Color{238, 240, 228, 255}, Color{172, 174, 163, 255}, Color{130, 133, 122, 255}, Color{255, 123, 28, 255}, Color{201, 209, 107, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// racing sim: carbon, chequered flags and hot yellow
inline constexpr Theme pole_position{ "pole-position", "racing sim: carbon, chequered flags and hot yellow", "Gaming", true,
    Palette{Color{17, 18, 20, 255}, Color{28, 29, 31, 255}, Color{37, 38, 40, 255}, Color{51, 52, 53, 255}, Color{243, 243, 243, 36}, Color{243, 243, 243, 66}, Color{243, 243, 243, 255}, Color{171, 171, 172, 255}, Color{125, 126, 127, 255}, Color{255, 212, 0, 255}, Color{255, 43, 43, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{17, 18, 20, 255}, Color{28, 29, 31, 255}, Color{37, 38, 40, 255}, Color{51, 52, 53, 255}, Color{49, 50, 51, 255}, Color{75, 76, 78, 255}, Color{243, 243, 243, 255}, Color{171, 171, 172, 255}, Color{125, 126, 127, 255}, Color{255, 212, 0, 255}, Color{255, 43, 43, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// cozy farm sim: warm wood, cream and leaf green
inline constexpr Theme harvest{ "harvest", "cozy farm sim: warm wood, cream and leaf green", "Gaming", false,
    Palette{Color{246, 236, 212, 255}, Color{251, 246, 236, 255}, Color{235, 224, 201, 255}, Color{226, 215, 192, 255}, Color{63, 43, 26, 26}, Color{63, 43, 26, 46}, Color{63, 43, 26, 255}, Color{122, 105, 86, 255}, Color{158, 143, 123, 255}, Color{95, 156, 69, 255}, Color{231, 159, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 236, 212, 255}, Color{251, 246, 236, 255}, Color{235, 224, 201, 255}, Color{226, 215, 192, 255}, Color{227, 216, 193, 255}, Color{213, 201, 178, 255}, Color{63, 43, 26, 255}, Color{122, 105, 86, 255}, Color{158, 143, 123, 255}, Color{95, 156, 69, 255}, Color{231, 159, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 2.0f };

/// survival horror: rust, flicker and dried blood
inline constexpr Theme nightmare{ "nightmare", "survival horror: rust, flicker and dried blood", "Gaming", true,
    Palette{Color{18, 12, 10, 255}, Color{29, 22, 20, 255}, Color{37, 31, 28, 255}, Color{50, 43, 40, 255}, Color{232, 220, 208, 36}, Color{232, 220, 208, 66}, Color{232, 220, 208, 255}, Color{164, 153, 145, 255}, Color{121, 112, 105, 255}, Color{192, 20, 30, 255}, Color{107, 76, 59, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 12, 10, 255}, Color{29, 22, 20, 255}, Color{37, 31, 28, 255}, Color{50, 43, 40, 255}, Color{48, 41, 38, 255}, Color{73, 66, 61, 255}, Color{232, 220, 208, 255}, Color{164, 153, 145, 255}, Color{121, 112, 105, 255}, Color{192, 20, 30, 255}, Color{107, 76, 59, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Creepster\", Impact, cursive", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// champagne gold on ivory, with a gilt frame
inline constexpr Theme champagne{ "champagne", "champagne gold on ivory, with a gilt frame", "Luxury", false,
    Palette{Color{251, 246, 234, 255}, Color{253, 251, 246, 255}, Color{239, 234, 222, 255}, Color{230, 224, 211, 255}, Color{58, 46, 29, 26}, Color{58, 46, 29, 46}, Color{58, 46, 29, 255}, Color{120, 110, 95, 255}, Color{158, 150, 136, 255}, Color{168, 130, 47, 255}, Color{230, 207, 154, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 246, 234, 255}, Color{253, 251, 246, 255}, Color{239, 234, 222, 255}, Color{230, 224, 211, 255}, Color{231, 226, 213, 255}, Color{216, 210, 197, 255}, Color{58, 46, 29, 255}, Color{120, 110, 95, 255}, Color{158, 150, 136, 255}, Color{168, 130, 47, 255}, Color{230, 207, 154, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cinzel\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// black velvet, burgundy and a touch of gold
inline constexpr Theme velvet_noir{ "velvet-noir", "black velvet, burgundy and a touch of gold", "Luxury", true,
    Palette{Color{13, 6, 8, 255}, Color{25, 17, 19, 255}, Color{34, 26, 28, 255}, Color{48, 40, 42, 255}, Color{243, 230, 232, 36}, Color{243, 230, 232, 66}, Color{243, 230, 232, 255}, Color{169, 158, 160, 255}, Color{123, 114, 116, 255}, Color{179, 18, 63, 255}, Color{212, 175, 55, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 6, 8, 255}, Color{25, 17, 19, 255}, Color{34, 26, 28, 255}, Color{48, 40, 42, 255}, Color{45, 38, 40, 255}, Color{73, 64, 66, 255}, Color{243, 230, 232, 255}, Color{169, 158, 160, 255}, Color{123, 114, 116, 255}, Color{179, 18, 63, 255}, Color{212, 175, 55, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// white Carrara marble with brushed brass
inline constexpr Theme carrara{ "carrara", "white Carrara marble with brushed brass", "Luxury", false,
    Palette{Color{246, 245, 242, 255}, Color{251, 251, 249, 255}, Color{233, 232, 230, 255}, Color{223, 222, 219, 255}, Color{34, 34, 34, 26}, Color{34, 34, 34, 46}, Color{34, 34, 34, 255}, Color{102, 102, 101, 255}, Color{144, 144, 142, 255}, Color{167, 129, 74, 255}, Color{140, 140, 140, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 245, 242, 255}, Color{251, 251, 249, 255}, Color{233, 232, 230, 255}, Color{223, 222, 219, 255}, Color{224, 223, 221, 255}, Color{208, 207, 204, 255}, Color{34, 34, 34, 255}, Color{102, 102, 101, 255}, Color{144, 144, 142, 255}, Color{167, 129, 74, 255}, Color{140, 140, 140, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// private members' club: emerald leather and brass
inline constexpr Theme emerald_club{ "emerald-club", "private members' club: emerald leather and brass", "Luxury", true,
    Palette{Color{6, 38, 28, 255}, Color{18, 48, 37, 255}, Color{27, 56, 45, 255}, Color{41, 67, 56, 255}, Color{241, 234, 214, 36}, Color{241, 234, 214, 66}, Color{241, 234, 214, 255}, Color{166, 171, 154, 255}, Color{119, 132, 117, 255}, Color{212, 175, 55, 255}, Color{47, 143, 106, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 38, 28, 255}, Color{18, 48, 37, 255}, Color{27, 56, 45, 255}, Color{41, 67, 56, 255}, Color{39, 66, 54, 255}, Color{67, 89, 76, 255}, Color{241, 234, 214, 255}, Color{166, 171, 154, 255}, Color{119, 132, 117, 255}, Color{212, 175, 55, 255}, Color{47, 143, 106, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// royal purple velvet with a gold crest
inline constexpr Theme royal{ "royal", "royal purple velvet with a gold crest", "Luxury", true,
    Palette{Color{26, 11, 46, 255}, Color{37, 22, 56, 255}, Color{46, 31, 65, 255}, Color{59, 45, 77, 255}, Color{245, 237, 255, 36}, Color{245, 237, 255, 66}, Color{245, 237, 255, 255}, Color{175, 165, 188, 255}, Color{131, 119, 146, 255}, Color{229, 185, 76, 255}, Color{138, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 11, 46, 255}, Color{37, 22, 56, 255}, Color{46, 31, 65, 255}, Color{59, 45, 77, 255}, Color{57, 43, 76, 255}, Color{83, 69, 100, 255}, Color{245, 237, 255, 255}, Color{175, 165, 188, 255}, Color{131, 119, 146, 255}, Color{229, 185, 76, 255}, Color{138, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Cormorant Garamond\", Georgia, serif", "\"Cinzel\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// fashion atelier: blush, black and gilt
inline constexpr Theme atelier{ "atelier", "fashion atelier: blush, black and gilt", "Luxury", false,
    Palette{Color{248, 236, 232, 255}, Color{252, 246, 245, 255}, Color{234, 223, 219, 255}, Color{223, 212, 208, 255}, Color{20, 16, 16, 26}, Color{20, 16, 16, 46}, Color{20, 16, 16, 255}, Color{93, 86, 85, 255}, Color{139, 130, 128, 255}, Color{20, 16, 16, 255}, Color{199, 154, 91, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{248, 236, 232, 255}, Color{252, 246, 245, 255}, Color{234, 223, 219, 255}, Color{223, 212, 208, 255}, Color{225, 214, 210, 255}, Color{207, 196, 193, 255}, Color{20, 16, 16, 255}, Color{93, 86, 85, 255}, Color{139, 130, 128, 255}, Color{20, 16, 16, 255}, Color{199, 154, 91, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// IDE dark: slate panels and syntax colours
inline constexpr Theme devtools{ "devtools", "IDE dark: slate panels and syntax colours", "Tech", true,
    Palette{Color{30, 31, 41, 255}, Color{40, 41, 51, 255}, Color{48, 49, 59, 255}, Color{60, 61, 71, 255}, Color{230, 230, 240, 36}, Color{230, 230, 240, 66}, Color{230, 230, 240, 255}, Color{166, 166, 176, 255}, Color{126, 127, 137, 255}, Color{122, 162, 247, 255}, Color{247, 118, 142, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{30, 31, 41, 255}, Color{40, 41, 51, 255}, Color{48, 49, 59, 255}, Color{60, 61, 71, 255}, Color{58, 59, 69, 255}, Color{82, 83, 93, 255}, Color{230, 230, 240, 255}, Color{166, 166, 176, 255}, Color{126, 127, 137, 255}, Color{122, 162, 247, 255}, Color{247, 118, 142, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// crisp SaaS dashboard white with an indigo accent
inline constexpr Theme saas{ "saas", "crisp SaaS dashboard white with an indigo accent", "Tech", false,
    Palette{Color{247, 248, 252, 255}, Color{251, 252, 254, 255}, Color{233, 235, 240, 255}, Color{222, 224, 229, 255}, Color{21, 26, 45, 26}, Color{21, 26, 45, 46}, Color{21, 26, 45, 255}, Color{93, 97, 111, 255}, Color{139, 141, 153, 255}, Color{79, 70, 229, 255}, Color{6, 182, 212, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{247, 248, 252, 255}, Color{251, 252, 254, 255}, Color{233, 235, 240, 255}, Color{222, 224, 229, 255}, Color{224, 225, 231, 255}, Color{206, 208, 215, 255}, Color{21, 26, 45, 255}, Color{93, 97, 111, 255}, Color{139, 141, 153, 255}, Color{79, 70, 229, 255}, Color{6, 182, 212, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// fintech dark: deep navy and mint gains
inline constexpr Theme fintech{ "fintech", "fintech dark: deep navy and mint gains", "Tech", true,
    Palette{Color{10, 18, 32, 255}, Color{21, 29, 43, 255}, Color{30, 38, 51, 255}, Color{43, 51, 64, 255}, Color{230, 237, 247, 36}, Color{230, 237, 247, 66}, Color{230, 237, 247, 255}, Color{160, 167, 178, 255}, Color{116, 123, 135, 255}, Color{33, 209, 159, 255}, Color{91, 140, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 18, 32, 255}, Color{21, 29, 43, 255}, Color{30, 38, 51, 255}, Color{43, 51, 64, 255}, Color{41, 49, 62, 255}, Color{67, 75, 88, 255}, Color{230, 237, 247, 255}, Color{160, 167, 178, 255}, Color{116, 123, 135, 255}, Color{33, 209, 159, 255}, Color{91, 140, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// AI lab graphite with a violet-to-cyan gradient
inline constexpr Theme neural{ "neural", "AI lab graphite with a violet-to-cyan gradient", "Tech", true,
    Palette{Color{12, 12, 18, 255}, Color{23, 23, 29, 255}, Color{32, 32, 38, 255}, Color{46, 45, 52, 255}, Color{236, 235, 245, 36}, Color{236, 235, 245, 66}, Color{236, 235, 245, 255}, Color{164, 164, 172, 255}, Color{120, 119, 127, 255}, Color{139, 92, 246, 255}, Color{34, 211, 238, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{12, 12, 18, 255}, Color{23, 23, 29, 255}, Color{32, 32, 38, 255}, Color{46, 45, 52, 255}, Color{44, 43, 50, 255}, Color{70, 70, 77, 255}, Color{236, 235, 245, 255}, Color{164, 164, 172, 255}, Color{120, 119, 127, 255}, Color{139, 92, 246, 255}, Color{34, 211, 238, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// green circuit board with copper traces
inline constexpr Theme pcb{ "pcb", "green circuit board with copper traces", "Tech", true,
    Palette{Color{6, 51, 31, 255}, Color{17, 61, 41, 255}, Color{25, 69, 49, 255}, Color{38, 82, 61, 255}, Color{217, 255, 233, 36}, Color{217, 255, 233, 66}, Color{217, 255, 233, 255}, Color{149, 190, 168, 255}, Color{107, 149, 128, 255}, Color{224, 166, 74, 255}, Color{61, 255, 154, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 51, 31, 255}, Color{17, 61, 41, 255}, Color{25, 69, 49, 255}, Color{38, 82, 61, 255}, Color{36, 80, 60, 255}, Color{61, 104, 83, 255}, Color{217, 255, 233, 255}, Color{149, 190, 168, 255}, Color{107, 149, 128, 255}, Color{224, 166, 74, 255}, Color{61, 255, 154, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// white lab with iridescent particles
inline constexpr Theme quantum{ "quantum", "white lab with iridescent particles", "Tech", false,
    Palette{Color{248, 249, 255, 255}, Color{252, 252, 255, 255}, Color{235, 236, 243, 255}, Color{224, 225, 233, 255}, Color{26, 27, 58, 26}, Color{26, 27, 58, 46}, Color{26, 27, 58, 255}, Color{97, 98, 121, 255}, Color{141, 142, 160, 255}, Color{91, 91, 240, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{248, 249, 255, 255}, Color{252, 252, 255, 255}, Color{235, 236, 243, 255}, Color{224, 225, 233, 255}, Color{225, 226, 235, 255}, Color{208, 209, 219, 255}, Color{26, 27, 58, 255}, Color{97, 98, 121, 255}, Color{141, 142, 160, 255}, Color{91, 91, 240, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// green code rain on a black mainframe
inline constexpr Theme mainframe{ "mainframe", "green code rain on a black mainframe", "Tech", true,
    Palette{Color{0, 8, 0, 255}, Color{10, 20, 10, 255}, Color{18, 30, 19, 255}, Color{30, 45, 31, 255}, Color{200, 255, 207, 36}, Color{200, 255, 207, 66}, Color{200, 255, 207, 255}, Color{136, 176, 141, 255}, Color{96, 127, 99, 255}, Color{0, 255, 102, 255}, Color{0, 255, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 8, 0, 255}, Color{10, 20, 10, 255}, Color{18, 30, 19, 255}, Color{30, 45, 31, 255}, Color{28, 43, 29, 255}, Color{52, 72, 54, 255}, Color{200, 255, 207, 255}, Color{136, 176, 141, 255}, Color{96, 127, 99, 255}, Color{0, 255, 102, 255}, Color{0, 255, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// blue hologram projection with scan lines
inline constexpr Theme hologram{ "hologram", "blue hologram projection with scan lines", "Tech", true,
    Palette{Color{4, 16, 28, 255}, Color{14, 27, 39, 255}, Color{22, 37, 48, 255}, Color{34, 50, 62, 255}, Color{207, 244, 255, 36}, Color{207, 244, 255, 66}, Color{207, 244, 255, 255}, Color{142, 171, 182, 255}, Color{101, 125, 137, 255}, Color{79, 216, 255, 255}, Color{155, 123, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{4, 16, 28, 255}, Color{14, 27, 39, 255}, Color{22, 37, 48, 255}, Color{34, 50, 62, 255}, Color{33, 48, 60, 255}, Color{57, 75, 87, 255}, Color{207, 244, 255, 255}, Color{142, 171, 182, 255}, Color{101, 125, 137, 255}, Color{79, 216, 255, 255}, Color{155, 123, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pumpkin orange and witch purple at midnight
inline constexpr Theme pumpkin{ "pumpkin", "pumpkin orange and witch purple at midnight", "Seasonal", true,
    Palette{Color{18, 10, 28, 255}, Color{30, 21, 38, 255}, Color{39, 31, 45, 255}, Color{53, 44, 57, 255}, Color{253, 238, 221, 36}, Color{253, 238, 221, 66}, Color{253, 238, 221, 255}, Color{178, 165, 159, 255}, Color{131, 119, 121, 255}, Color{255, 122, 0, 255}, Color{139, 61, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 10, 28, 255}, Color{30, 21, 38, 255}, Color{39, 31, 45, 255}, Color{53, 44, 57, 255}, Color{51, 42, 55, 255}, Color{79, 69, 78, 255}, Color{253, 238, 221, 255}, Color{178, 165, 159, 255}, Color{131, 119, 121, 255}, Color{255, 122, 0, 255}, Color{139, 61, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Creepster\", Impact, cursive", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// winter frost, ice blue and silver
inline constexpr Theme frost{ "frost", "winter frost, ice blue and silver", "Seasonal", false,
    Palette{Color{238, 246, 251, 255}, Color{247, 251, 253, 255}, Color{225, 234, 240, 255}, Color{214, 224, 232, 255}, Color{22, 50, 74, 26}, Color{22, 50, 74, 46}, Color{22, 50, 74, 255}, Color{91, 113, 131, 255}, Color{134, 152, 166, 255}, Color{47, 143, 200, 255}, Color{159, 198, 221, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 246, 251, 255}, Color{247, 251, 253, 255}, Color{225, 234, 240, 255}, Color{214, 224, 232, 255}, Color{216, 226, 233, 255}, Color{199, 211, 219, 255}, Color{22, 50, 74, 255}, Color{91, 113, 131, 255}, Color{134, 152, 166, 255}, Color{47, 143, 200, 255}, Color{159, 198, 221, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// evergreen, cranberry and gold ribbon
inline constexpr Theme evergreen{ "evergreen", "evergreen, cranberry and gold ribbon", "Seasonal", true,
    Palette{Color{15, 42, 29, 255}, Color{27, 52, 39, 255}, Color{36, 60, 47, 255}, Color{50, 72, 59, 255}, Color{251, 243, 228, 36}, Color{251, 243, 228, 66}, Color{251, 243, 228, 255}, Color{175, 179, 164, 255}, Color{128, 138, 125, 255}, Color{214, 40, 57, 255}, Color{233, 196, 106, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{15, 42, 29, 255}, Color{27, 52, 39, 255}, Color{36, 60, 47, 255}, Color{50, 72, 59, 255}, Color{48, 70, 57, 255}, Color{76, 94, 81, 255}, Color{251, 243, 228, 255}, Color{175, 179, 164, 255}, Color{128, 138, 125, 255}, Color{214, 40, 57, 255}, Color{233, 196, 106, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// spring showers: fresh green, sky and tulip pink
inline constexpr Theme april{ "april", "spring showers: fresh green, sky and tulip pink", "Seasonal", false,
    Palette{Color{243, 250, 246, 255}, Color{250, 253, 251, 255}, Color{230, 238, 234, 255}, Color{220, 229, 225, 255}, Color{31, 58, 51, 26}, Color{31, 58, 51, 46}, Color{31, 58, 51, 255}, Color{99, 119, 113, 255}, Color{141, 158, 152, 255}, Color{47, 174, 138, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 250, 246, 255}, Color{250, 253, 251, 255}, Color{230, 238, 234, 255}, Color{220, 229, 225, 255}, Color{221, 230, 226, 255}, Color{205, 215, 211, 255}, Color{31, 58, 51, 255}, Color{99, 119, 113, 255}, Color{141, 158, 152, 255}, Color{47, 174, 138, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// summer beach: sand, sea and sun
inline constexpr Theme beach{ "beach", "summer beach: sand, sea and sun", "Seasonal", false,
    Palette{Color{255, 248, 230, 255}, Color{255, 252, 244, 255}, Color{241, 237, 221, 255}, Color{229, 228, 213, 255}, Color{17, 65, 74, 26}, Color{17, 65, 74, 46}, Color{17, 65, 74, 255}, Color{93, 124, 124, 255}, Color{141, 160, 155, 255}, Color{255, 138, 61, 255}, Color{24, 184, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 248, 230, 255}, Color{255, 252, 244, 255}, Color{241, 237, 221, 255}, Color{229, 228, 213, 255}, Color{231, 229, 214, 255}, Color{212, 215, 202, 255}, Color{17, 65, 74, 255}, Color{93, 124, 124, 255}, Color{141, 160, 155, 255}, Color{255, 138, 61, 255}, Color{24, 184, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Pacifico\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 1.0f };

/// new year's eve: black tie and gold confetti
inline constexpr Theme midnight_gala{ "midnight-gala", "new year's eve: black tie and gold confetti", "Seasonal", true,
    Palette{Color{10, 10, 15, 255}, Color{22, 22, 26, 255}, Color{31, 31, 34, 255}, Color{45, 45, 47, 255}, Color{246, 241, 230, 36}, Color{246, 241, 230, 66}, Color{246, 241, 230, 255}, Color{170, 167, 161, 255}, Color{123, 121, 118, 255}, Color{232, 193, 90, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 10, 15, 255}, Color{22, 22, 26, 255}, Color{31, 31, 34, 255}, Color{45, 45, 47, 255}, Color{43, 43, 45, 255}, Color{71, 70, 71, 255}, Color{246, 241, 230, 255}, Color{170, 167, 161, 255}, Color{123, 121, 118, 255}, Color{232, 193, 90, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// half blazing orange, half glacier blue
inline constexpr Theme fire_ice{ "fire-ice", "half blazing orange, half glacier blue", "Signature", true,
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{242, 244, 255, 36}, Color{242, 244, 255, 66}, Color{242, 244, 255, 255}, Color{168, 169, 180, 255}, Color{122, 123, 133, 255}, Color{255, 106, 26, 255}, Color{58, 180, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{44, 44, 53, 255}, Color{71, 71, 81, 255}, Color{242, 244, 255, 255}, Color{168, 169, 180, 255}, Color{122, 123, 133, 255}, Color{255, 106, 26, 255}, Color{58, 180, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// radioactive green on hazard-striped black
inline constexpr Theme toxic{ "toxic", "radioactive green on hazard-striped black", "Signature", true,
    Palette{Color{11, 15, 5, 255}, Color{22, 27, 15, 255}, Color{31, 37, 24, 255}, Color{44, 51, 36, 255}, Color{234, 255, 214, 36}, Color{234, 255, 214, 66}, Color{234, 255, 214, 255}, Color{163, 178, 147, 255}, Color{118, 130, 105, 255}, Color{166, 255, 0, 255}, Color{255, 212, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 15, 5, 255}, Color{22, 27, 15, 255}, Color{31, 37, 24, 255}, Color{44, 51, 36, 255}, Color{42, 49, 35, 255}, Color{69, 77, 59, 255}, Color{234, 255, 214, 255}, Color{163, 178, 147, 255}, Color{118, 130, 105, 255}, Color{166, 255, 0, 255}, Color{255, 212, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// bismuth crystal: stepped rainbow oxide terraces
inline constexpr Theme bismuth{ "bismuth", "bismuth crystal: stepped rainbow oxide terraces", "Signature", true,
    Palette{Color{20, 16, 30, 255}, Color{31, 27, 41, 255}, Color{40, 36, 50, 255}, Color{53, 49, 64, 255}, Color{242, 236, 255, 36}, Color{242, 236, 255, 66}, Color{242, 236, 255, 255}, Color{171, 166, 183, 255}, Color{127, 122, 138, 255}, Color{255, 106, 213, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{20, 16, 30, 255}, Color{31, 27, 41, 255}, Color{40, 36, 50, 255}, Color{53, 49, 64, 255}, Color{51, 47, 62, 255}, Color{77, 73, 88, 255}, Color{242, 236, 255, 255}, Color{171, 166, 183, 255}, Color{127, 122, 138, 255}, Color{255, 106, 213, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// white opal with flashes of colour fire
inline constexpr Theme opal{ "opal", "white opal with flashes of colour fire", "Signature", false,
    Palette{Color{246, 248, 251, 255}, Color{251, 252, 253, 255}, Color{233, 235, 239, 255}, Color{222, 225, 229, 255}, Color{32, 36, 54, 26}, Color{32, 36, 54, 46}, Color{32, 36, 54, 255}, Color{100, 104, 117, 255}, Color{143, 146, 156, 255}, Color{109, 124, 255, 255}, Color{255, 122, 184, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 248, 251, 255}, Color{251, 252, 253, 255}, Color{233, 235, 239, 255}, Color{222, 225, 229, 255}, Color{224, 226, 231, 255}, Color{207, 210, 215, 255}, Color{32, 36, 54, 255}, Color{100, 104, 117, 255}, Color{143, 146, 156, 255}, Color{109, 124, 255, 255}, Color{255, 122, 184, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// cooling magma: black crust and glowing seams
inline constexpr Theme magma{ "magma", "cooling magma: black crust and glowing seams", "Signature", true,
    Palette{Color{15, 7, 5, 255}, Color{27, 18, 16, 255}, Color{37, 27, 24, 255}, Color{51, 41, 37, 255}, Color{255, 232, 220, 36}, Color{255, 232, 220, 66}, Color{255, 232, 220, 255}, Color{178, 160, 151, 255}, Color{130, 115, 108, 255}, Color{255, 77, 0, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{15, 7, 5, 255}, Color{27, 18, 16, 255}, Color{37, 27, 24, 255}, Color{51, 41, 37, 255}, Color{49, 39, 35, 255}, Color{77, 65, 61, 255}, Color{255, 232, 220, 255}, Color{178, 160, 151, 255}, Color{130, 115, 108, 255}, Color{255, 77, 0, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// red lacquer armour and black steel
inline constexpr Theme ronin{ "ronin", "red lacquer armour and black steel", "Signature", true,
    Palette{Color{18, 4, 4, 255}, Color{30, 16, 15, 255}, Color{39, 25, 24, 255}, Color{54, 39, 38, 255}, Color{255, 236, 230, 36}, Color{255, 236, 230, 66}, Color{255, 236, 230, 255}, Color{179, 162, 158, 255}, Color{132, 115, 112, 255}, Color{255, 42, 26, 255}, Color{212, 175, 55, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 4, 4, 255}, Color{30, 16, 15, 255}, Color{39, 25, 24, 255}, Color{54, 39, 38, 255}, Color{51, 37, 36, 255}, Color{79, 64, 62, 255}, Color{255, 236, 230, 255}, Color{179, 162, 158, 255}, Color{132, 115, 112, 255}, Color{255, 42, 26, 255}, Color{212, 175, 55, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

inline constexpr const Theme* themes[] = { &editorial, &brutal, &neon, &glass, &terminal, &soft, &retro, &swiss, &y2k, &mono, &sketch, &luxe, &paper, &linen, &fog, &porcelain, &newsprint, &blueprint, &sand, &concrete, &graphite, &swiss_red, &midnight, &obsidian, &ink, &deep_sea, &forest_night, &espresso, &plum, &vampire, &nord_night, &charcoal, &lavender, &mint, &peach, &sakura, &sky, &lemon, &bubblegum, &seafoam, &tangerine, &cobalt, &magenta, &risograph, &pop_art, &bauhaus, &memphis, &brutal_lime, &amber_crt, &gameboy, &vaporwave, &synthwave, &arcade, &teletext, &polaroid, &win_classic, &moss, &ocean, &desert, &glacier, &autumn, &volcano, &pearl, &black_pearl, &sapphire_metal, &fade, &doppler, &emerald, &ruby, &marble_fade, &case_hardened, &tiger_tooth, &damascus, &crimson_web, &chameleon, &candy_apple, &anodized, &titanium, &gunmetal, &rose_gold, &gold_leaf, &holo_foil, &carbon_fiber, &aurora_borealis, &nebula, &liquid_chrome, &lava_lamp, &museum, &oat, &zen, &ledger, &onyx, &abyss, &noir, &eclipse, &ultraviolet, &cotton_candy, &macaron, &periwinkle, &sorbet, &electric, &comic, &poster, &acid, &cassette, &diner, &dos, &pinball, &vhs, &sepia, &meadow, &canyon, &rainforest, &coral_reef, &tundra, &esports, &rpg, &pixel_plains, &hud, &dropzone, &pole_position, &harvest, &nightmare, &champagne, &velvet_noir, &carrara, &emerald_club, &royal, &atelier, &devtools, &saas, &fintech, &neural, &pcb, &quantum, &mainframe, &hologram, &pumpkin, &frost, &evergreen, &april, &beach, &midnight_gala, &fire_ice, &toxic, &bismuth, &opal, &magma, &ronin };

inline constexpr int themeCount = 149;

/// Find a theme by name; returns nullptr if unknown.
inline const Theme* find(const char* name) {
    for (const Theme* t : themes) if (std::strcmp(t->name, name) == 0) return t;
    return nullptr;
}

// ── Parts & kits: element designs (button, card, input, …) ──────────────────
// The web library has 280+ element designs. Native toolkits can't draw glows or animated foils, so each design
// carries an approximation: corner radius, border width, a Fill style, weight and case. Kits bundle a theme + one
// design per family:   auto* kit = uivault::findKit("deep-metal");   uivault::imgui::apply(*uivault::findKitTheme(*kit), *kit);
enum class Fill { Solid, Outline, Ghost, Soft, Grad, Metal, DeepMetal, Chrome, Pearl, Holo, Gold, Glass, Bevel, Hard, Neon, Inverse, Flat, Sunken, Underline, Printstream, Clay };
/// One element design. radius 999 = pill. The web version has the full effect; this is the closest a native toolkit can draw.
struct Part { const char* family; const char* name; const char* label; float radius; float border; Fill fill; int weight; bool upper; };
inline constexpr const char* families[] = { "btn", "card", "input", "switch", "check", "range", "tabs", "nav", "badge", "alert", "modal", "spinner", "progress", "head", "bg" };
inline constexpr int familyCount = 15;
inline constexpr Part parts[] = {
    { "btn", "solid", "Solid", 10.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "pill", "Pill", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "outline", "Outline", 8.0f, 2.0f, Fill::Outline, 600, false },
    { "btn", "soft", "Soft", 10.0f, 0.0f, Fill::Soft, 600, false },
    { "btn", "ghost", "Ghost", 8.0f, 0.0f, Fill::Ghost, 600, false },
    { "btn", "gradient", "Gradient", 10.0f, 0.0f, Fill::Grad, 600, false },
    { "btn", "glow", "Glow", 10.0f, 1.0f, Fill::Neon, 600, false },
    { "btn", "neon-tube", "Neon tube", 999.0f, 2.0f, Fill::Neon, 500, true },
    { "btn", "3d", "3D press", 10.0f, 1.0f, Fill::Hard, 600, false },
    { "btn", "brutal", "Brutal", 0.0f, 2.0f, Fill::Hard, 700, false },
    { "btn", "brutal-pop", "Brutal pop", 12.0f, 3.0f, Fill::Hard, 800, false },
    { "btn", "metal", "Anodised metal", 8.0f, 1.0f, Fill::Metal, 600, false },
    { "btn", "deep-metal", "Deep blue metal", 8.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "btn", "chrome", "Chrome", 999.0f, 1.0f, Fill::Chrome, 600, false },
    { "btn", "pearl", "Pearlescent", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "btn", "holo", "Holo foil", 12.0f, 1.0f, Fill::Holo, 600, false },
    { "btn", "printstream", "Printstream", 4.0f, 2.0f, Fill::Printstream, 700, true },
    { "btn", "glass", "Frosted glass", 12.0f, 1.0f, Fill::Glass, 600, false },
    { "btn", "aqua", "Aqua gel", 999.0f, 1.0f, Fill::Grad, 600, false },
    { "btn", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 400, false },
    { "btn", "pixel", "Pixel", 0.0f, 0.0f, Fill::Hard, 600, true },
    { "btn", "terminal", "Terminal", 0.0f, 1.0f, Fill::Outline, 500, false },
    { "btn", "clay", "Clay", 18.0f, 0.0f, Fill::Clay, 600, false },
    { "btn", "neumorph", "Neumorphic", 14.0f, 0.0f, Fill::Flat, 600, false },
    { "btn", "gold", "Gold foil", 2.0f, 1.0f, Fill::Gold, 700, true },
    { "btn", "liquid", "Liquid", 999.0f, 1.0f, Fill::Grad, 600, false },
    { "btn", "slide-fill", "Slide fill", 6.0f, 2.0f, Fill::Outline, 600, false },
    { "btn", "underline", "Underline", 0.0f, 0.0f, Fill::Underline, 600, false },
    { "btn", "bracket", "Brackets", 0.0f, 0.0f, Fill::Ghost, 600, true },
    { "btn", "arrow", "Arrow link", 0.0f, 1.0f, Fill::Underline, 500, false },
    { "btn", "split", "Split", 8.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "sticker", "Sticker", 14.0f, 3.0f, Fill::Solid, 800, false },
    { "btn", "stamp", "Stamp", 4.0f, 3.0f, Fill::Outline, 800, true },
    { "btn", "candy", "Candy stripe", 999.0f, 2.0f, Fill::Grad, 800, false },
    { "btn", "jelly", "Jelly", 14.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "shine", "Shine sweep", 8.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "border-spin", "Spinning border", 10.0f, 2.0f, Fill::Outline, 600, false },
    { "btn", "cyber", "Cyber", 0.0f, 0.0f, Fill::Solid, 600, true },
    { "btn", "synth", "Synthwave", 6.0f, 2.0f, Fill::Grad, 800, true },
    { "btn", "ink", "Ink", 3.0f, 1.0f, Fill::Inverse, 500, false },
    { "btn", "paper", "Paper cut", 2.0f, 1.0f, Fill::Flat, 500, false },
    { "btn", "arcade", "Arcade", 16.0f, 3.0f, Fill::Hard, 900, true },
    { "btn", "halo", "Halo ring", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "duo-shadow", "Duo shadow", 6.0f, 2.0f, Fill::Hard, 700, false },
    { "btn", "lava", "Lava gloss", 12.0f, 1.0f, Fill::Grad, 700, false },
    { "btn", "ice", "Ice", 10.0f, 1.0f, Fill::Pearl, 700, false },
    { "btn", "minimal", "Minimal", 4.0f, 1.0f, Fill::Outline, 500, false },
    { "btn", "emboss", "Letterpress", 8.0f, 0.0f, Fill::Sunken, 600, false },
    { "btn", "tag", "Price tag", 4.0f, 0.0f, Fill::Solid, 600, false },
    { "btn", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "btn", "keycap", "Keycap", 9.0f, 1.0f, Fill::Bevel, 600, false },
    { "btn", "glitch", "Glitch", 2.0f, 2.0f, Fill::Outline, 700, true },
    { "btn", "gradient-border", "Gradient border", 12.0f, 2.0f, Fill::Grad, 600, false },
    { "btn", "outline-draw", "Draw outline", 0.0f, 1.0f, Fill::Outline, 600, false },
    { "btn", "blob", "Blob", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "btn", "tape", "Masking tape", 0.0f, 0.0f, Fill::Soft, 700, false },
    { "btn", "wood", "Wood", 8.0f, 1.0f, Fill::Grad, 700, false },
    { "btn", "ticket", "Ticket", 6.0f, 0.0f, Fill::Solid, 600, true },
    { "btn", "bubble", "Soap bubble", 999.0f, 1.0f, Fill::Holo, 600, false },
    { "card", "flat", "Flat", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "outline", "Outline", 6.0f, 2.0f, Fill::Outline, 600, false },
    { "card", "elevated", "Elevated", 14.0f, 0.0f, Fill::Flat, 600, false },
    { "card", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "card", "glass", "Frosted glass", 16.0f, 1.0f, Fill::Glass, 600, false },
    { "card", "pearl", "Pearlescent", 18.0f, 1.0f, Fill::Pearl, 600, false },
    { "card", "holo-border", "Holo border", 16.0f, 2.0f, Fill::Holo, 600, false },
    { "card", "metal", "Brushed metal", 6.0f, 1.0f, Fill::Metal, 600, false },
    { "card", "deep-metal", "Deep blue metal", 10.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "card", "gradient-border", "Gradient border", 14.0f, 2.0f, Fill::Grad, 600, false },
    { "card", "glow", "Glow", 12.0f, 1.0f, Fill::Neon, 600, false },
    { "card", "neon", "Neon", 10.0f, 2.0f, Fill::Neon, 600, false },
    { "card", "bevel", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "card", "cyber", "Cyber notch", 0.0f, 1.0f, Fill::Outline, 600, false },
    { "card", "paper", "Lined paper", 2.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "sticky", "Sticky note", 2.0f, 0.0f, Fill::Solid, 600, false },
    { "card", "clay", "Clay", 26.0f, 0.0f, Fill::Clay, 600, false },
    { "card", "neumorph", "Neumorphic", 20.0f, 0.0f, Fill::Flat, 600, false },
    { "card", "inset", "Inset", 12.0f, 0.0f, Fill::Sunken, 600, false },
    { "card", "double", "Double rule", 4.0f, 4.0f, Fill::Outline, 600, false },
    { "card", "blueprint", "Blueprint", 0.0f, 2.0f, Fill::Outline, 600, false },
    { "card", "accent-bar", "Accent bar", 4.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "ticket", "Ticket", 10.0f, 0.0f, Fill::Flat, 600, false },
    { "card", "polaroid", "Polaroid", 2.0f, 0.0f, Fill::Flat, 600, false },
    { "card", "window", "App window", 10.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "terminal", "Terminal", 4.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "liquid-glass", "Liquid glass", 22.0f, 1.0f, Fill::Glass, 600, false },
    { "card", "puffy", "Puffy", 26.0f, 0.0f, Fill::Clay, 600, false },
    { "card", "pass", "Boarding pass", 12.0f, 0.0f, Fill::Flat, 600, false },
    { "card", "stack", "Paper stack", 10.0f, 1.0f, Fill::Flat, 600, false },
    { "card", "aurora", "Aurora", 18.0f, 1.0f, Fill::Grad, 600, false },
    { "card", "spotlight", "Corner light", 16.0f, 1.0f, Fill::Neon, 600, false },
    { "card", "foil", "Holo foil", 14.0f, 1.0f, Fill::Holo, 600, false },
    { "card", "receipt", "Receipt", 0.0f, 0.0f, Fill::Flat, 500, false },
    { "card", "frame", "Gallery frame", 2.0f, 1.0f, Fill::Outline, 600, false },
    { "card", "extruded", "Extruded", 12.0f, 2.0f, Fill::Hard, 600, false },
    { "input", "boxed", "Boxed", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "input", "underline", "Underline", 0.0f, 1.0f, Fill::Underline, 600, false },
    { "input", "filled", "Filled", 4.0f, 2.0f, Fill::Soft, 600, false },
    { "input", "pill", "Pill", 999.0f, 1.0f, Fill::Soft, 600, false },
    { "input", "brutal", "Brutal", 0.0f, 2.0f, Fill::Hard, 600, false },
    { "input", "glass", "Glass", 12.0f, 1.0f, Fill::Glass, 600, false },
    { "input", "neon", "Neon", 6.0f, 1.0f, Fill::Neon, 600, false },
    { "input", "inset", "Inset", 12.0f, 0.0f, Fill::Sunken, 600, false },
    { "input", "terminal", "Terminal", 0.0f, 1.0f, Fill::Flat, 500, false },
    { "input", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "input", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "input", "minimal", "Minimal", 4.0f, 1.0f, Fill::Ghost, 600, false },
    { "input", "gradient", "Gradient focus", 10.0f, 2.0f, Fill::Grad, 600, false },
    { "input", "paper", "Paper", 0.0f, 1.0f, Fill::Underline, 400, false },
    { "input", "cyber", "Cyber", 0.0f, 0.0f, Fill::Solid, 500, false },
    { "input", "clay", "Clay", 16.0f, 0.0f, Fill::Clay, 600, false },
    { "input", "deep-metal", "Deep metal", 8.0f, 2.0f, Fill::DeepMetal, 600, false },
    { "input", "chrome", "Chrome bezel", 999.0f, 2.0f, Fill::Chrome, 600, false },
    { "input", "thick", "Thick outline", 6.0f, 2.0f, Fill::Outline, 600, false },
    { "input", "ghost-label", "Floating", 10.0f, 1.0f, Fill::Soft, 600, false },
    { "input", "liquid-glass", "Liquid glass", 16.0f, 1.0f, Fill::Glass, 600, false },
    { "input", "float", "Float", 10.0f, 1.0f, Fill::Flat, 600, false },
    { "input", "bar", "Side bar", 0.0f, 3.0f, Fill::Soft, 600, false },
    { "input", "dashed", "Dashed", 8.0f, 2.0f, Fill::Outline, 600, false },
    { "input", "sketch", "Sketch", 12.0f, 2.0f, Fill::Outline, 600, false },
    { "input", "pixel", "Pixel", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "input", "soft-glow", "Soft glow", 14.0f, 0.0f, Fill::Flat, 600, false },
    { "switch", "classic", "Classic", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "switch", "ios", "iOS", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "switch", "material", "Material", 999.0f, 0.0f, Fill::Soft, 600, false },
    { "switch", "square", "Square", 3.0f, 1.0f, Fill::Solid, 600, false },
    { "switch", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "switch", "neon", "Neon", 999.0f, 2.0f, Fill::Neon, 600, false },
    { "switch", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "switch", "metal", "Metal", 999.0f, 1.0f, Fill::Metal, 600, false },
    { "switch", "labels", "On / Off", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "switch", "day-night", "Day / night", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "switch", "glass", "Glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "switch", "line", "Line", 999.0f, 0.0f, Fill::Underline, 600, false },
    { "switch", "3d", "3D rocker", 8.0f, 1.0f, Fill::Hard, 600, false },
    { "switch", "aqua", "Aqua gel", 999.0f, 1.0f, Fill::Grad, 600, false },
    { "switch", "pixel", "Pixel", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "switch", "deep-metal", "Deep metal", 999.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "switch", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "switch", "neu", "Neumorphic", 999.0f, 0.0f, Fill::Sunken, 600, false },
    { "switch", "icons", "Tick / cross", 999.0f, 1.0f, Fill::Solid, 600, false },
    { "switch", "lamp", "Lamp", 999.0f, 1.0f, Fill::Neon, 600, false },
    { "switch", "candy", "Candy", 999.0f, 2.0f, Fill::Grad, 600, false },
    { "switch", "stretch", "Stretch", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "check", "classic", "Classic", 5.0f, 2.0f, Fill::Solid, 600, false },
    { "check", "round", "Round", 999.0f, 2.0f, Fill::Solid, 600, false },
    { "check", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "check", "neon", "Neon", 4.0f, 2.0f, Fill::Neon, 600, false },
    { "check", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "check", "cross", "Cross", 2.0f, 2.0f, Fill::Outline, 600, false },
    { "check", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "check", "dot", "Dot", 999.0f, 2.0f, Fill::Outline, 600, false },
    { "check", "pop", "Pop", 6.0f, 2.0f, Fill::Solid, 600, false },
    { "check", "metal", "Metal", 4.0f, 0.0f, Fill::Metal, 600, false },
    { "check", "square-fill", "Square fill", 0.0f, 2.0f, Fill::Outline, 600, false },
    { "check", "glass", "Glass", 7.0f, 1.0f, Fill::Glass, 600, false },
    { "check", "liquid-glass", "Liquid glass", 8.0f, 1.0f, Fill::Glass, 600, false },
    { "check", "heart", "Heart", 999.0f, 2.0f, Fill::Solid, 600, false },
    { "check", "star", "Star", 6.0f, 2.0f, Fill::Gold, 600, false },
    { "check", "neu", "Neumorphic", 7.0f, 0.0f, Fill::Sunken, 600, false },
    { "check", "sketch", "Sketch", 6.0f, 2.0f, Fill::Outline, 600, false },
    { "check", "gradient", "Gradient", 6.0f, 2.0f, Fill::Grad, 600, false },
    { "range", "classic", "Classic", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "range", "thick", "Thick", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "range", "gradient", "Gradient", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "range", "neon", "Neon", 999.0f, 0.0f, Fill::Neon, 600, false },
    { "range", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "range", "metal", "Metal fader", 3.0f, 1.0f, Fill::Metal, 600, false },
    { "range", "square", "Square", 0.0f, 2.0f, Fill::Outline, 600, false },
    { "range", "line", "Hairline", 999.0f, 0.0f, Fill::Flat, 600, false },
    { "range", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "range", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "range", "glass", "Glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "range", "deep-metal", "Deep metal", 999.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "range", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "range", "neu", "Neumorphic", 999.0f, 0.0f, Fill::Sunken, 600, false },
    { "range", "rainbow", "Hue", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "range", "candy", "Candy", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "range", "knob", "Machined knob", 999.0f, 1.0f, Fill::Metal, 600, false },
    { "range", "notch", "Notch", 2.0f, 0.0f, Fill::Flat, 600, false },
    { "tabs", "slide", "Sliding pill", 12.0f, 1.0f, Fill::Solid, 600, false },
    { "tabs", "underline", "Underline", 0.0f, 1.0f, Fill::Underline, 600, false },
    { "tabs", "segmented", "Segmented", 10.0f, 0.0f, Fill::Soft, 600, false },
    { "tabs", "folder", "Folder tabs", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "tabs", "brutal", "Brutal", 0.0f, 2.0f, Fill::Hard, 600, false },
    { "tabs", "neon", "Neon", 10.0f, 1.0f, Fill::Neon, 500, true },
    { "tabs", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "tabs", "glass", "Glass", 14.0f, 1.0f, Fill::Glass, 600, false },
    { "tabs", "terminal", "Terminal", 0.0f, 1.0f, Fill::Outline, 500, false },
    { "tabs", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 400, false },
    { "tabs", "bubble", "Bubbles", 999.0f, 0.0f, Fill::Soft, 600, false },
    { "tabs", "ink", "Ink", 4.0f, 1.0f, Fill::Inverse, 600, false },
    { "tabs", "gradient", "Gradient", 999.0f, 1.0f, Fill::Grad, 600, false },
    { "tabs", "cyber", "Cyber", 0.0f, 0.0f, Fill::Solid, 600, true },
    { "tabs", "metal", "Metal", 8.0f, 1.0f, Fill::Chrome, 600, false },
    { "tabs", "minimal", "Minimal", 0.0f, 0.0f, Fill::Ghost, 500, false },
    { "tabs", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "tabs", "neu", "Neumorphic", 14.0f, 0.0f, Fill::Sunken, 600, false },
    { "tabs", "chips", "Chips", 999.0f, 1.0f, Fill::Outline, 600, false },
    { "tabs", "dot", "Dot", 0.0f, 0.0f, Fill::Ghost, 600, false },
    { "tabs", "pixel", "Pixel", 0.0f, 3.0f, Fill::Hard, 700, true },
    { "nav", "pills", "Pills", 14.0f, 1.0f, Fill::Solid, 600, false },
    { "nav", "underline", "Underline", 0.0f, 1.0f, Fill::Underline, 600, false },
    { "nav", "boxed", "Boxed", 6.0f, 1.0f, Fill::Outline, 600, false },
    { "nav", "glass", "Floating glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "nav", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 700, false },
    { "nav", "neon", "Neon", 10.0f, 1.0f, Fill::Neon, 500, true },
    { "nav", "terminal", "Terminal", 0.0f, 1.0f, Fill::Flat, 500, false },
    { "nav", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 400, false },
    { "nav", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 600, false },
    { "nav", "rail", "Side rail", 0.0f, 0.0f, Fill::Ghost, 600, false },
    { "nav", "ink", "Ink", 3.0f, 1.0f, Fill::Inverse, 600, false },
    { "nav", "gradient", "Gradient", 10.0f, 1.0f, Fill::Grad, 600, false },
    { "nav", "dots", "Dots", 0.0f, 0.0f, Fill::Ghost, 500, false },
    { "nav", "metal", "Metal", 8.0f, 1.0f, Fill::Chrome, 600, false },
    { "nav", "deep-metal", "Deep metal", 10.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "nav", "cyber", "Cyber", 0.0f, 0.0f, Fill::Solid, 600, true },
    { "nav", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "nav", "neu", "Neumorphic", 16.0f, 0.0f, Fill::Sunken, 600, false },
    { "nav", "bar", "Side bar", 0.0f, 0.0f, Fill::Flat, 600, false },
    { "nav", "glow", "Under-glow", 12.0f, 1.0f, Fill::Neon, 600, false },
    { "badge", "soft", "Soft pill", 999.0f, 0.0f, Fill::Soft, 600, false },
    { "badge", "solid", "Solid", 6.0f, 0.0f, Fill::Solid, 700, false },
    { "badge", "outline", "Outline", 3.0f, 1.0f, Fill::Outline, 500, true },
    { "badge", "dot", "Status dot", 999.0f, 1.0f, Fill::Flat, 500, false },
    { "badge", "neon", "Neon", 4.0f, 1.0f, Fill::Neon, 600, true },
    { "badge", "pearl", "Pearl", 999.0f, 1.0f, Fill::Pearl, 700, false },
    { "badge", "brutal", "Brutal", 0.0f, 2.0f, Fill::Hard, 800, true },
    { "badge", "gradient", "Gradient", 999.0f, 0.0f, Fill::Grad, 700, false },
    { "badge", "glass", "Glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "badge", "metal", "Metal", 3.0f, 1.0f, Fill::Chrome, 700, true },
    { "badge", "ribbon", "Ribbon", 0.0f, 0.0f, Fill::Solid, 700, false },
    { "badge", "stamp", "Stamp", 3.0f, 2.0f, Fill::Outline, 800, true },
    { "badge", "holo", "Holo", 6.0f, 1.0f, Fill::Holo, 800, false },
    { "badge", "terminal", "Terminal", 0.0f, 0.0f, Fill::Ghost, 500, true },
    { "badge", "sticker", "Sticker", 999.0f, 2.0f, Fill::Solid, 800, false },
    { "badge", "square", "Square", 0.0f, 0.0f, Fill::Soft, 600, true },
    { "badge", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "badge", "gradient-outline", "Gradient outline", 999.0f, 2.0f, Fill::Grad, 600, false },
    { "badge", "neu", "Neumorphic", 999.0f, 0.0f, Fill::Sunken, 700, false },
    { "badge", "pulse", "Live pulse", 999.0f, 1.0f, Fill::Soft, 600, false },
    { "badge", "ticket", "Ticket", 4.0f, 0.0f, Fill::Solid, 700, true },
    { "alert", "bar", "Side bar", 4.0f, 4.0f, Fill::Flat, 600, false },
    { "alert", "soft", "Soft", 10.0f, 1.0f, Fill::Soft, 600, false },
    { "alert", "filled", "Filled", 8.0f, 0.0f, Fill::Solid, 600, false },
    { "alert", "outline", "Outline", 6.0f, 2.0f, Fill::Outline, 600, false },
    { "alert", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "alert", "neon", "Neon", 6.0f, 1.0f, Fill::Neon, 500, false },
    { "alert", "glass", "Glass", 12.0f, 1.0f, Fill::Glass, 600, false },
    { "alert", "pearl", "Pearl", 14.0f, 1.0f, Fill::Pearl, 600, false },
    { "alert", "terminal", "Terminal", 0.0f, 0.0f, Fill::Flat, 500, false },
    { "alert", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 400, false },
    { "alert", "banner", "Banner", 0.0f, 3.0f, Fill::Soft, 600, false },
    { "alert", "minimal", "Minimal", 0.0f, 0.0f, Fill::Ghost, 600, false },
    { "alert", "metal", "Metal", 4.0f, 1.0f, Fill::Metal, 600, false },
    { "alert", "sticky", "Sticky", 2.0f, 0.0f, Fill::Solid, 600, false },
    { "alert", "liquid-glass", "Liquid glass", 16.0f, 1.0f, Fill::Glass, 600, false },
    { "alert", "gradient", "Gradient top", 10.0f, 3.0f, Fill::Grad, 600, false },
    { "alert", "dashed", "Dashed", 8.0f, 2.0f, Fill::Outline, 600, false },
    { "alert", "glow", "Glow", 12.0f, 1.0f, Fill::Neon, 600, false },
    { "modal", "classic", "Classic", 16.0f, 1.0f, Fill::Flat, 600, false },
    { "modal", "sheet", "Sheet", 22.0f, 0.0f, Fill::Flat, 600, false },
    { "modal", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "modal", "glass", "Glass", 22.0f, 1.0f, Fill::Glass, 600, false },
    { "modal", "pearl", "Pearl", 24.0f, 1.0f, Fill::Pearl, 600, false },
    { "modal", "neon", "Neon", 12.0f, 2.0f, Fill::Neon, 600, false },
    { "modal", "terminal", "Terminal", 4.0f, 1.0f, Fill::Flat, 600, false },
    { "modal", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "modal", "metal", "Metal", 10.0f, 1.0f, Fill::Metal, 600, false },
    { "modal", "deep-metal", "Deep metal", 14.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "modal", "paper", "Paper", 2.0f, 0.0f, Fill::Flat, 600, false },
    { "modal", "cyber", "Cyber", 0.0f, 1.0f, Fill::Outline, 600, false },
    { "modal", "liquid-glass", "Liquid glass", 28.0f, 1.0f, Fill::Glass, 600, false },
    { "modal", "neu", "Neumorphic", 24.0f, 0.0f, Fill::Sunken, 600, false },
    { "modal", "clay", "Clay", 30.0f, 0.0f, Fill::Clay, 600, false },
    { "modal", "accent-top", "Accent top", 6.0f, 1.0f, Fill::Flat, 600, false },
    { "spinner", "ring", "Ring", 999.0f, 3.0f, Fill::Solid, 600, false },
    { "spinner", "dual", "Dual ring", 999.0f, 3.0f, Fill::Solid, 600, false },
    { "spinner", "gradient", "Gradient arc", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "spinner", "pulse", "Pulse", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "ripple", "Ripple", 999.0f, 2.0f, Fill::Outline, 600, false },
    { "spinner", "flip", "Flip", 3.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "dots", "Dots", 0.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "orbit", "Orbit", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "bars", "Bars", 0.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "square", "Square trace", 2.0f, 3.0f, Fill::Outline, 600, false },
    { "spinner", "neon", "Neon ring", 999.0f, 3.0f, Fill::Neon, 600, false },
    { "spinner", "pearl", "Pearl", 999.0f, 0.0f, Fill::Pearl, 600, false },
    { "spinner", "half", "Half moon", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "pixel", "Pixel", 0.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "segments", "Segments", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "twin", "Twin moons", 999.0f, 1.0f, Fill::Neon, 600, false },
    { "spinner", "atom", "Atom", 999.0f, 2.0f, Fill::Solid, 600, false },
    { "spinner", "clock", "Clock", 999.0f, 2.0f, Fill::Outline, 600, false },
    { "spinner", "hourglass", "Hourglass", 0.0f, 0.0f, Fill::Solid, 600, false },
    { "spinner", "morph", "Morph", 8.0f, 0.0f, Fill::Solid, 600, false },
    { "progress", "thin", "Thin", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "progress", "thick", "Thick", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "progress", "striped", "Striped", 6.0f, 0.0f, Fill::Grad, 600, false },
    { "progress", "gradient", "Gradient", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "progress", "segments", "Segments", 0.0f, 0.0f, Fill::Solid, 600, false },
    { "progress", "neon", "Neon", 999.0f, 0.0f, Fill::Neon, 600, false },
    { "progress", "pearl", "Pearl", 999.0f, 0.0f, Fill::Pearl, 600, false },
    { "progress", "brutal", "Brutal", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "progress", "win98", "Windows 98", 0.0f, 2.0f, Fill::Bevel, 600, false },
    { "progress", "metal", "Metal", 999.0f, 0.0f, Fill::Chrome, 600, false },
    { "progress", "deep-metal", "Deep metal", 999.0f, 0.0f, Fill::DeepMetal, 600, false },
    { "progress", "pixel", "Pixel", 0.0f, 3.0f, Fill::Hard, 600, false },
    { "progress", "liquid-glass", "Liquid glass", 999.0f, 1.0f, Fill::Glass, 600, false },
    { "progress", "glow-tip", "Glowing tip", 999.0f, 0.0f, Fill::Neon, 600, false },
    { "progress", "rainbow", "Rainbow", 999.0f, 0.0f, Fill::Holo, 600, false },
    { "progress", "battery", "Battery", 4.0f, 2.0f, Fill::Outline, 600, false },
    { "progress", "shimmer", "Shimmer", 999.0f, 0.0f, Fill::Solid, 600, false },
    { "progress", "heat", "Heat", 999.0f, 0.0f, Fill::Grad, 600, false },
    { "head", "plain", "Plain", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "head", "deep-metal", "Deep blue metal", 8.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "head", "metal", "Accent metal", 8.0f, 1.0f, Fill::Metal, 600, false },
    { "head", "chrome", "Chrome", 8.0f, 1.0f, Fill::Chrome, 600, false },
    { "head", "gold", "Gold leaf", 8.0f, 1.0f, Fill::Gold, 600, false },
    { "head", "pearl", "Pearl", 8.0f, 1.0f, Fill::Pearl, 600, false },
    { "head", "holo", "Holo", 8.0f, 1.0f, Fill::Holo, 600, false },
    { "head", "printstream", "Printstream", 8.0f, 1.0f, Fill::Printstream, 600, false },
    { "head", "gradient", "Gradient", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "head", "outline", "Outline", 8.0f, 1.0f, Fill::Outline, 600, false },
    { "head", "neon", "Neon", 8.0f, 1.0f, Fill::Neon, 600, false },
    { "head", "shadow3d", "3D block", 8.0f, 1.0f, Fill::Hard, 600, false },
    { "head", "long-shadow", "Long shadow", 8.0f, 1.0f, Fill::Hard, 600, false },
    { "head", "duotone", "Duotone", 8.0f, 1.0f, Fill::Solid, 600, false },
    { "head", "fire", "Fire", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "head", "ice", "Ice", 8.0f, 1.0f, Fill::Pearl, 600, false },
    { "head", "glitch", "Glitch", 8.0f, 1.0f, Fill::Neon, 600, false },
    { "head", "letterpress", "Letterpress", 8.0f, 1.0f, Fill::Sunken, 600, false },
    { "head", "marker", "Marker", 8.0f, 1.0f, Fill::Soft, 600, false },
    { "head", "synth", "Synthwave", 8.0f, 1.0f, Fill::Grad, 600, true },
    { "head", "sticker", "Sticker", 8.0f, 1.0f, Fill::Solid, 600, false },
    { "head", "glass", "Liquid glass", 8.0f, 1.0f, Fill::Glass, 600, false },
    { "head", "rainbow", "Rainbow", 8.0f, 1.0f, Fill::Holo, 600, false },
    { "head", "split", "Split", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "head", "stripes", "Retro stripes", 8.0f, 1.0f, Fill::Outline, 600, false },
    { "head", "neon-outline", "Neon outline", 8.0f, 1.0f, Fill::Neon, 600, false },
    { "head", "aurora", "Aurora", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "head", "swash", "Swash underline", 8.0f, 1.0f, Fill::Underline, 600, false },
    { "bg", "plain", "Plain", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "aurora", "Aurora", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "pearl", "Pearl", 8.0f, 1.0f, Fill::Pearl, 600, false },
    { "bg", "mesh", "Mesh", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "grid", "Grid", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "blueprint", "Blueprint", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "dots", "Dots", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "lines", "Ruled", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "carbon", "Carbon", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "brushed", "Brushed metal", 8.0f, 1.0f, Fill::Metal, 600, false },
    { "bg", "deep-metal", "Deep metal", 8.0f, 1.0f, Fill::DeepMetal, 600, false },
    { "bg", "galaxy", "Galaxy", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "halftone", "Halftone", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "checker", "Checker", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "stripes", "Stripes", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "sunset", "Sunset", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "scan", "Scanlines", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "topo", "Topographic", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "argyle", "Argyle", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "iso", "Isometric", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "bokeh", "Bokeh", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "rays", "Sunburst", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "plaid", "Plaid", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "terrazzo", "Terrazzo", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "waves", "Scallops", 8.0f, 1.0f, Fill::Flat, 600, false },
    { "bg", "spotlight", "Spotlight", 8.0f, 1.0f, Fill::Grad, 600, false },
    { "bg", "grain", "Grain gradient", 8.0f, 1.0f, Fill::Grad, 600, false },
};
/// A kit: a theme plus one design per family (same order as families[]).
struct Kit { const char* name; const char* label; const char* theme; const char* parts[15]; };
inline constexpr Kit kits[] = {
    { "pearl", "Pearlescent Y2K", "y2k", { "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl", "pearl" } },
    { "printstream", "Printstream", "y2k", { "printstream", "pearl", "chrome", "pearl", "pearl", "pearl", "ink", "ink", "metal", "pearl", "pearl", "pearl", "pearl", "printstream", "pearl" } },
    { "deep-metal", "Deep Blue Metal", "midnight", { "deep-metal", "deep-metal", "deep-metal", "deep-metal", "metal", "deep-metal", "metal", "deep-metal", "metal", "metal", "deep-metal", "neon", "deep-metal", "deep-metal", "deep-metal" } },
    { "brutal", "Neo-Brutal", "brutal", { "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "brutal", "square", "brutal", "shadow3d", "dots" } },
    { "cyber-neon", "Cyber Neon", "neon", { "neon-tube", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "neon", "grid" } },
    { "glass", "Frosted Glass", "glass", { "glass", "glass", "glass", "glass", "glass", "glass", "glass", "glass", "glass", "glass", "glass", "gradient", "gradient", "gradient", "aurora" } },
    { "terminal", "Terminal", "terminal", { "terminal", "terminal", "terminal", "square", "square-fill", "square", "terminal", "terminal", "terminal", "terminal", "terminal", "pixel", "pixel", "plain", "scan" } },
    { "win98", "Windows 98", "retro", { "win98", "bevel", "win98", "3d", "win98", "win98", "win98", "win98", "square", "win98", "win98", "pixel", "win98", "plain", "plain" } },
    { "aqua", "Aqua 2001", "soft", { "aqua", "elevated", "pill", "aqua", "round", "thick", "segmented", "glass", "soft", "soft", "sheet", "dual", "striped", "chrome", "lines" } },
    { "clay", "Claymorphism", "soft", { "clay", "clay", "clay", "ios", "pop", "thick", "bubble", "pills", "soft", "soft", "sheet", "dots", "thick", "plain", "plain" } },
    { "neumorph", "Neumorphic", "fog", { "neumorph", "neumorph", "inset", "classic", "round", "classic", "segmented", "pills", "soft", "soft", "classic", "ring", "thick", "letterpress", "plain" } },
    { "luxe", "Luxe Gold", "luxe", { "gold", "double", "underline", "metal", "metal", "metal", "underline", "underline", "metal", "metal", "metal", "ring", "metal", "gold", "brushed" } },
    { "swiss", "Swiss Minimal", "swiss", { "ink", "accent-bar", "underline", "square", "square-fill", "line", "minimal", "underline", "outline", "bar", "paper", "ring", "thin", "plain", "grid" } },
    { "paper", "Paper & Ink", "sketch", { "paper", "paper", "paper", "line", "cross", "line", "folder", "dots", "stamp", "sticky", "paper", "ring", "segments", "marker", "lines" } },
    { "cyberpunk", "Cyberpunk", "neon", { "cyber", "cyber", "cyber", "square", "square-fill", "square", "cyber", "cyber", "ribbon", "banner", "cyber", "bars", "segments", "glitch", "carbon" } },
    { "synthwave", "Synthwave", "neon", { "synth", "glow", "neon", "day-night", "neon", "gradient", "gradient", "gradient", "gradient", "neon", "neon", "orbit", "gradient", "synth", "sunset" } },
    { "arcade", "Arcade", "brutal", { "arcade", "brutal", "thick", "pixel", "pop", "brutal", "bubble", "brutal", "sticker", "brutal", "brutal", "pixel", "pixel", "sticker", "checker" } },
    { "holo", "Holo Foil", "y2k", { "holo", "holo-border", "gradient", "pearl", "pearl", "gradient", "gradient", "gradient", "holo", "glass", "glass", "pearl", "pearl", "holo", "mesh" } },
    { "liquid-glass", "Liquid Glass", "glass", { "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "liquid-glass", "segments", "liquid-glass", "plain", "bokeh" } },
    { "workshop", "Workshop", "espresso", { "wood", "stack", "bar", "lamp", "star", "knob", "folder", "bar", "ticket", "dashed", "accent-top", "clock", "battery", "letterpress", "grain" } },
    { "pixel-quest", "Pixel Quest", "pixel-plains", { "pixel", "extruded", "pixel", "pixel", "square-fill", "square", "pixel", "brutal", "square", "brutal", "brutal", "pixel", "pixel", "shadow3d", "plain" } },
    { "bubblegum-pop", "Bubblegum Pop", "cotton-candy", { "bubble", "puffy", "soft-glow", "candy", "heart", "candy", "chips", "pills", "pulse", "soft", "clay", "morph", "rainbow", "rainbow", "bokeh" } },
};

inline const Part* findPart(const char* family, const char* name) {
    for (const Part& p : parts) if (std::strcmp(p.family, family) == 0 && std::strcmp(p.name, name) == 0) return &p;
    return nullptr;
}
inline const Kit* findKit(const char* name) {
    for (const Kit& k : kits) if (std::strcmp(k.name, name) == 0) return &k;
    return nullptr;
}
/// The design a kit uses for a family ("btn", "card", "input", "switch", "check", "range", "tabs", "nav", "badge", "alert", "modal", "spinner", "progress", "head", "bg").
inline const Part* kitPart(const Kit& k, const char* family) {
    for (int i = 0; i < familyCount; ++i) if (std::strcmp(families[i], family) == 0) return findPart(family, k.parts[i]);
    return nullptr;
}
inline const Theme* findKitTheme(const Kit& k) { return find(k.theme); }

/// Colours for a Fill style on a theme: base/top and bottom gradient stops, text and border.
struct FillColors { Color top, bottom, text, border; };
inline Color mixc(Color a, Color b, float t) {
    return { std::uint8_t(a.r + (b.r - a.r) * t), std::uint8_t(a.g + (b.g - a.g) * t), std::uint8_t(a.b + (b.b - a.b) * t), 255 };
}
inline FillColors fillColors(const Theme& t, Fill f) {
    const Palette& p = t.solid; const Color white{255, 255, 255, 255}, black{0, 0, 0, 255};
    switch (f) {
        case Fill::Solid: case Fill::Hard: return { p.accent, p.accent, (0.2126f * p.accent.r + 0.7152f * p.accent.g + 0.0722f * p.accent.b) / 255 > 0.55f ? Color{17, 17, 17, 255} : white, f == Fill::Hard ? p.text : p.accent };
        case Fill::Grad: return { p.accent, p.accent2, white, p.accent };
        case Fill::Metal: return { mixc(p.accent, white, 0.45f), mixc(p.accent, black, 0.3f), white, mixc(p.accent, black, 0.45f) };
        case Fill::DeepMetal: return { Color{63, 116, 220, 255}, Color{10, 37, 96, 255}, Color{242, 247, 255, 255}, Color{7, 26, 69, 255} };
        case Fill::Chrome: return { Color{244, 246, 249, 255}, Color{138, 145, 156, 255}, Color{27, 31, 38, 255}, Color{125, 132, 143, 255} };
        case Fill::Pearl: return { Color{243, 232, 255, 255}, Color{224, 244, 255, 255}, Color{58, 47, 90, 255}, Color{217, 207, 238, 255} };
        case Fill::Holo: return { Color{255, 154, 230, 255}, Color{154, 211, 255, 255}, Color{42, 31, 61, 255}, white };
        case Fill::Gold: return { Color{255, 243, 196, 255}, Color{154, 111, 18, 255}, Color{42, 26, 0, 255}, Color{138, 95, 12, 255} };
        case Fill::Printstream: return { Color{251, 250, 255, 255}, Color{233, 225, 247, 255}, Color{16, 16, 20, 255}, Color{13, 13, 16, 255} };
        case Fill::Glass: return { mixc(p.surface, white, 0.25f), mixc(p.surface, white, 0.1f), p.text, mixc(p.line2, white, 0.4f) };
        case Fill::Bevel: return { Color{195, 195, 195, 255}, Color{195, 195, 195, 255}, black, Color{10, 10, 10, 255} };
        case Fill::Neon: return { p.bg, p.bg, mixc(p.accent, white, 0.35f), p.accent };
        case Fill::Inverse: return { p.text, p.text, p.bg, p.text };
        case Fill::Soft: return { mixc(p.bg, p.accent, 0.18f), mixc(p.bg, p.accent, 0.18f), t.dark ? mixc(p.accent, white, 0.3f) : mixc(p.accent, black, 0.25f), mixc(p.bg, p.accent, 0.18f) };
        case Fill::Clay: return { mixc(p.surface2, white, 0.15f), p.surface2, p.text, p.surface2 };
        case Fill::Sunken: return { mixc(p.surface2, black, 0.06f), p.surface2, p.text, p.surface2 };
        case Fill::Outline: case Fill::Ghost: case Fill::Underline: return { p.bg, p.bg, p.accent, f == Fill::Outline ? p.accent : p.bg };
        case Fill::Flat: default: return { p.surface, p.surface, p.text, p.line2 };
    }
}

/// Qt stylesheet rules for a kit's parts — append to qss(theme). Mark primary buttons with setProperty("primary", true).
inline std::string qssParts(const Theme& t, const Kit& k) {
    auto num = [](float v) { char s[16]; std::snprintf(s, sizeof s, "%g", v); return std::string(s); };
    auto bg = [&](const FillColors& c) { return c.top.rgba() == c.bottom.rgba() ? c.top.hex() : "qlineargradient(x1:0, y1:0, x2:0, y2:1, stop:0 " + c.top.hex() + ", stop:1 " + c.bottom.hex() + ")"; };
    auto rule = [&](const char* fam, const std::string& sel, bool fill) {
        const Part* p = kitPart(k, fam); if (!p) return std::string();
        const FillColors c = fillColors(t, p->fill);
        const std::string r = num(p->radius > 20 ? 14 : p->radius), bw = num(p->border);
        std::string q = sel + " { border-radius: " + r + "px; border: " + bw + "px solid " + c.border.hex() + "; font-weight: " + std::to_string(p->weight) + "; ";
        if (fill) q += "background: " + bg(c) + "; color: " + c.text.hex() + "; ";
        if (p->fill == Fill::Hard) q += "border-bottom-width: " + num(p->border + 3) + "px; ";
        if (p->fill == Fill::Underline) q += "border-width: 0 0 " + num(p->border > 0 ? p->border : 1) + "px 0; ";
        return q + "}\n";
    };
    std::string q;
    q += rule("btn", "QPushButton[primary=\"true\"]", true);
    if (const Part* b = kitPart(k, "btn")) q += "QPushButton { border-radius: " + num(b->radius > 20 ? 14 : b->radius) + "px; }\n";
    q += rule("input", "QLineEdit, QTextEdit, QPlainTextEdit, QSpinBox, QComboBox", false);
    q += rule("card", "QGroupBox, QFrame[card=\"true\"]", false);
    q += rule("modal", "QDialog, QMessageBox", false);
    q += rule("badge", "QLabel[badge=\"true\"]", true);
    q += rule("alert", "QLabel[alert=\"true\"]", true);
    if (const Part* p = kitPart(k, "progress")) { const FillColors c = fillColors(t, p->fill); q += "QProgressBar::chunk { background: " + bg(c) + "; border-radius: " + num(p->radius > 20 ? 4 : p->radius) + "px; }\n"; }
    if (const Part* p = kitPart(k, "tabs")) { const FillColors c = fillColors(t, p->fill); q += "QTabBar::tab:selected { background: " + bg(c) + "; color: " + c.text.hex() + "; border-radius: " + num(p->radius > 20 ? 10 : p->radius) + "px; }\n"; }
    if (const Part* p = kitPart(k, "check")) q += "QCheckBox::indicator { border-radius: " + num(p->radius > 20 ? 8 : p->radius) + "px; }\n";
    return q;
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
/// Theme + kit parts in one stylesheet.
inline std::string qss(const Theme& t, const Kit& k, int fontSize = 14) { return qss(t, fontSize) + qssParts(t, k); }

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
/// Theme + a kit's element shapes: button/input rounding and borders, window and tab shapes, button fill colours.
inline void apply(const Theme& t, const Kit& k, ImGuiStyle* dst = nullptr) {
    apply(t, dst);
    ImGuiStyle& st = dst ? *dst : ImGui::GetStyle();
    auto rr = [](float r, float cap) { return r > cap ? cap : r; };
    if (const Part* b = kitPart(k, "btn")) {
        const FillColors c = fillColors(t, b->fill);
        st.FrameRounding = rr(b->radius, 12); st.FrameBorderSize = b->border > 0 ? 1.0f : 0.0f;
        st.Colors[ImGuiCol_Button] = v4(mixc(c.top, c.bottom, 0.5f));
        st.Colors[ImGuiCol_ButtonHovered] = v4(c.top);
        st.Colors[ImGuiCol_ButtonActive] = v4(c.bottom);
        st.Colors[ImGuiCol_Border] = v4(c.border);
    }
    if (const Part* c = kitPart(k, "card")) { st.WindowRounding = rr(c->radius, 14); st.ChildRounding = rr(c->radius, 14); st.WindowBorderSize = c->border > 0 ? 1.0f : 0.0f; }
    if (const Part* m = kitPart(k, "modal")) st.PopupRounding = rr(m->radius, 12);
    if (const Part* tb = kitPart(k, "tabs")) st.TabRounding = rr(tb->radius, 10);
    if (const Part* r = kitPart(k, "range")) st.GrabRounding = rr(r->radius, 10);
    if (const Part* in = kitPart(k, "input")) {
        const FillColors c = fillColors(t, in->fill);
        if (in->fill != Fill::Outline && in->fill != Fill::Underline && in->fill != Fill::Ghost) st.Colors[ImGuiCol_FrameBg] = v4(mixc(c.top, c.bottom, 0.5f));
    }
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
    LookAndFeel(const Theme& t, const Kit& k) { setTheme(t); setKit(k); }

    /// Use a kit's button design (radius, border, fill gradient) for TextButtons.
    void setKit(const Kit& k) { button = kitPart(k, "btn"); }

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
        if (button) {
            const FillColors c = fillColors(*theme, button->fill);
            const float r = juce::jmin(button->radius, bounds.getHeight() / 2);
            juce::ColourGradient grad(col(c.top), 0, bounds.getY(), col(c.bottom), 0, bounds.getBottom(), false);
            if (down) grad.multiplyOpacity(0.85f);
            g.setGradientFill(grad);
            g.fillRoundedRectangle(bounds, r);
            g.setColour(highlighted ? col(theme->solid.text) : col(c.border));
            if (button->border > 0) g.drawRoundedRectangle(bounds, r, button->border);
            return;
        }
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
    const Part* button = nullptr;
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
/// Theme + a kit's button design (fill colours, border width).
inline void apply(const Theme& t, const Kit& k) {
    apply(t);
    if (const Part* b = kitPart(k, "btn")) {
        const FillColors c = fillColors(t, b->fill);
        GuiSetStyle(BUTTON, BASE_COLOR_NORMAL, ColorToInt(rc(mixc(c.top, c.bottom, 0.5f))));
        GuiSetStyle(BUTTON, BASE_COLOR_FOCUSED, ColorToInt(rc(c.top)));
        GuiSetStyle(BUTTON, BASE_COLOR_PRESSED, ColorToInt(rc(c.bottom)));
        GuiSetStyle(BUTTON, TEXT_COLOR_NORMAL, ColorToInt(rc(c.text)));
        GuiSetStyle(BUTTON, TEXT_COLOR_FOCUSED, ColorToInt(rc(c.text)));
        GuiSetStyle(BUTTON, BORDER_COLOR_NORMAL, ColorToInt(rc(c.border)));
        GuiSetStyle(BUTTON, BORDER_WIDTH, b->border > 0 ? int(b->border + 0.5f) : 0);
    }
}
} // namespace raygui
#endif

} // namespace uivault
