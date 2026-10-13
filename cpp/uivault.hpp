// uivault.hpp — UI Vault 3.1.0 for C++ · single header · MIT
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

/// warm paper, graphite text, a quiet blue link
inline constexpr Theme paper{ "paper", "warm paper, graphite text, a quiet blue link", false,
    Palette{Color{247, 245, 240, 255}, Color{251, 250, 248, 255}, Color{235, 233, 228, 255}, Color{224, 223, 218, 255}, Color{42, 42, 40, 26}, Color{42, 42, 40, 46}, Color{42, 42, 40, 255}, Color{108, 107, 104, 255}, Color{149, 148, 144, 255}, Color{47, 91, 211, 255}, Color{47, 91, 211, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{247, 245, 240, 255}, Color{251, 250, 248, 255}, Color{235, 233, 228, 255}, Color{224, 223, 218, 255}, Color{226, 224, 220, 255}, Color{210, 208, 204, 255}, Color{42, 42, 40, 255}, Color{108, 107, 104, 255}, Color{149, 148, 144, 255}, Color{47, 91, 211, 255}, Color{47, 91, 211, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// off-white linen with a terracotta accent
inline constexpr Theme linen{ "linen", "off-white linen with a terracotta accent", false,
    Palette{Color{243, 238, 230, 255}, Color{250, 247, 244, 255}, Color{232, 227, 219, 255}, Color{223, 218, 210, 255}, Color{59, 53, 48, 26}, Color{59, 53, 48, 46}, Color{59, 53, 48, 255}, Color{118, 112, 106, 255}, Color{155, 149, 143, 255}, Color{196, 98, 58, 255}, Color{138, 109, 85, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 238, 230, 255}, Color{250, 247, 244, 255}, Color{232, 227, 219, 255}, Color{223, 218, 210, 255}, Color{224, 219, 211, 255}, Color{210, 205, 197, 255}, Color{59, 53, 48, 255}, Color{118, 112, 106, 255}, Color{155, 149, 143, 255}, Color{196, 98, 58, 255}, Color{138, 109, 85, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// cool grey haze, soft shadows, nothing loud
inline constexpr Theme fog{ "fog", "cool grey haze, soft shadows, nothing loud", false,
    Palette{Color{238, 240, 242, 255}, Color{247, 248, 249, 255}, Color{226, 228, 231, 255}, Color{217, 219, 221, 255}, Color{43, 48, 54, 26}, Color{43, 48, 54, 46}, Color{43, 48, 54, 255}, Color{105, 109, 114, 255}, Color{144, 148, 152, 255}, Color{91, 107, 124, 255}, Color{91, 107, 124, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 240, 242, 255}, Color{247, 248, 249, 255}, Color{226, 228, 231, 255}, Color{217, 219, 221, 255}, Color{218, 220, 223, 255}, Color{203, 205, 208, 255}, Color{43, 48, 54, 255}, Color{105, 109, 114, 255}, Color{144, 148, 152, 255}, Color{91, 107, 124, 255}, Color{91, 107, 124, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// white porcelain with a celadon glaze
inline constexpr Theme porcelain{ "porcelain", "white porcelain with a celadon glaze", false,
    Palette{Color{251, 251, 249, 255}, Color{253, 253, 252, 255}, Color{238, 239, 237, 255}, Color{227, 229, 226, 255}, Color{35, 48, 44, 26}, Color{35, 48, 44, 46}, Color{35, 48, 44, 255}, Color{104, 113, 110, 255}, Color{147, 154, 151, 255}, Color{95, 158, 143, 255}, Color{95, 158, 143, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 251, 249, 255}, Color{253, 253, 252, 255}, Color{238, 239, 237, 255}, Color{227, 229, 226, 255}, Color{229, 230, 228, 255}, Color{212, 214, 212, 255}, Color{35, 48, 44, 255}, Color{104, 113, 110, 255}, Color{147, 154, 151, 255}, Color{95, 158, 143, 255}, Color{95, 158, 143, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// newspaper grey, black columns, red headlines
inline constexpr Theme newsprint{ "newsprint", "newspaper grey, black columns, red headlines", false,
    Palette{Color{236, 232, 223, 255}, Color{246, 245, 241, 255}, Color{223, 219, 211, 255}, Color{212, 209, 201, 255}, Color{20, 20, 20, 26}, Color{20, 20, 20, 46}, Color{20, 20, 20, 255}, Color{89, 88, 85, 255}, Color{132, 130, 126, 255}, Color{179, 38, 30, 255}, Color{179, 38, 30, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 232, 223, 255}, Color{246, 245, 241, 255}, Color{223, 219, 211, 255}, Color{212, 209, 201, 255}, Color{214, 210, 202, 255}, Color{197, 194, 186, 255}, Color{20, 20, 20, 255}, Color{89, 88, 85, 255}, Color{132, 130, 126, 255}, Color{179, 38, 30, 255}, Color{179, 38, 30, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// architect's blue sheet with a white grid
inline constexpr Theme blueprint{ "blueprint", "architect's blue sheet with a white grid", true,
    Palette{Color{19, 66, 122, 255}, Color{30, 75, 129, 255}, Color{38, 82, 134, 255}, Color{51, 92, 142, 255}, Color{233, 242, 255, 36}, Color{233, 242, 255, 66}, Color{233, 242, 255, 255}, Color{165, 186, 212, 255}, Color{122, 150, 186, 255}, Color{255, 212, 92, 255}, Color{255, 212, 92, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{19, 66, 122, 255}, Color{30, 75, 129, 255}, Color{38, 82, 134, 255}, Color{51, 92, 142, 255}, Color{49, 91, 141, 255}, Color{74, 112, 156, 255}, Color{233, 242, 255, 255}, Color{165, 186, 212, 255}, Color{122, 150, 186, 255}, Color{255, 212, 92, 255}, Color{255, 212, 92, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist Mono\", ui-monospace, monospace", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// dune beige, umber ink, sun-bleached calm
inline constexpr Theme sand{ "sand", "dune beige, umber ink, sun-bleached calm", false,
    Palette{Color{239, 228, 210, 255}, Color{248, 243, 235, 255}, Color{228, 217, 200, 255}, Color{220, 208, 191, 255}, Color{62, 50, 39, 26}, Color{62, 50, 39, 46}, Color{62, 50, 39, 255}, Color{119, 107, 94, 255}, Color{154, 143, 128, 255}, Color{176, 116, 60, 255}, Color{176, 116, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{239, 228, 210, 255}, Color{248, 243, 235, 255}, Color{228, 217, 200, 255}, Color{220, 208, 191, 255}, Color{221, 210, 193, 255}, Color{207, 196, 179, 255}, Color{62, 50, 39, 255}, Color{119, 107, 94, 255}, Color{154, 143, 128, 255}, Color{176, 116, 60, 255}, Color{176, 116, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// raw grey concrete, bold black type
inline constexpr Theme concrete{ "concrete", "raw grey concrete, bold black type", false,
    Palette{Color{217, 217, 214, 255}, Color{238, 238, 237, 255}, Color{205, 205, 202, 255}, Color{195, 195, 193, 255}, Color{21, 21, 21, 26}, Color{21, 21, 21, 46}, Color{21, 21, 21, 255}, Color{84, 84, 83, 255}, Color{123, 123, 121, 255}, Color{255, 90, 31, 255}, Color{255, 90, 31, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{217, 217, 214, 255}, Color{238, 238, 237, 255}, Color{205, 205, 202, 255}, Color{195, 195, 193, 255}, Color{197, 197, 194, 255}, Color{182, 182, 179, 255}, Color{21, 21, 21, 255}, Color{84, 84, 83, 255}, Color{123, 123, 121, 255}, Color{255, 90, 31, 255}, Color{255, 90, 31, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// pencil-lead greys with a mint highlight
inline constexpr Theme graphite{ "graphite", "pencil-lead greys with a mint highlight", true,
    Palette{Color{43, 45, 48, 255}, Color{52, 54, 57, 255}, Color{60, 62, 65, 255}, Color{71, 73, 76, 255}, Color{230, 231, 232, 36}, Color{230, 231, 232, 66}, Color{230, 231, 232, 255}, Color{170, 171, 173, 255}, Color{133, 134, 136, 255}, Color{125, 226, 184, 255}, Color{125, 226, 184, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{43, 45, 48, 255}, Color{52, 54, 57, 255}, Color{60, 62, 65, 255}, Color{71, 73, 76, 255}, Color{69, 71, 74, 255}, Color{91, 93, 96, 255}, Color{230, 231, 232, 255}, Color{170, 171, 173, 255}, Color{133, 134, 136, 255}, Color{125, 226, 184, 255}, Color{125, 226, 184, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// international style: grid, black, a single red
inline constexpr Theme swiss-red{ "swiss-red", "international style: grid, black, a single red", false,
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{228, 228, 228, 255}, Color{10, 10, 10, 26}, Color{10, 10, 10, 46}, Color{10, 10, 10, 255}, Color{88, 88, 88, 255}, Color{137, 137, 137, 255}, Color{225, 37, 27, 255}, Color{225, 37, 27, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 255, 255, 255}, Color{255, 255, 255, 255}, Color{240, 240, 240, 255}, Color{228, 228, 228, 255}, Color{230, 230, 230, 255}, Color{211, 211, 211, 255}, Color{10, 10, 10, 255}, Color{88, 88, 88, 255}, Color{137, 137, 137, 255}, Color{225, 37, 27, 255}, Color{225, 37, 27, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// deep navy night with a moonlit blue
inline constexpr Theme midnight{ "midnight", "deep navy night with a moonlit blue", true,
    Palette{Color{11, 16, 32, 255}, Color{22, 27, 43, 255}, Color{30, 35, 51, 255}, Color{43, 48, 64, 255}, Color{223, 230, 245, 36}, Color{223, 230, 245, 66}, Color{223, 230, 245, 255}, Color{155, 162, 177, 255}, Color{113, 119, 134, 255}, Color{110, 168, 255, 255}, Color{167, 139, 250, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 16, 32, 255}, Color{22, 27, 43, 255}, Color{30, 35, 51, 255}, Color{43, 48, 64, 255}, Color{41, 46, 62, 255}, Color{66, 71, 87, 255}, Color{223, 230, 245, 255}, Color{155, 162, 177, 255}, Color{113, 119, 134, 255}, Color{110, 168, 255, 255}, Color{167, 139, 250, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// volcanic black glass with violet edges
inline constexpr Theme obsidian{ "obsidian", "volcanic black glass with violet edges", true,
    Palette{Color{10, 10, 13, 255}, Color{21, 21, 24, 255}, Color{30, 30, 34, 255}, Color{43, 43, 47, 255}, Color{233, 231, 242, 36}, Color{233, 231, 242, 66}, Color{233, 231, 242, 255}, Color{162, 160, 169, 255}, Color{117, 116, 123, 255}, Color{157, 123, 255, 255}, Color{255, 106, 213, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 10, 13, 255}, Color{21, 21, 24, 255}, Color{30, 30, 34, 255}, Color{43, 43, 47, 255}, Color{41, 41, 45, 255}, Color{68, 67, 72, 255}, Color{233, 231, 242, 255}, Color{162, 160, 169, 255}, Color{117, 116, 123, 255}, Color{157, 123, 255, 255}, Color{255, 106, 213, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pure ink black, paper-white type, one red
inline constexpr Theme ink{ "ink", "pure ink black, paper-white type, one red", true,
    Palette{Color{14, 14, 14, 255}, Color{25, 25, 25, 255}, Color{35, 34, 34, 255}, Color{48, 48, 47, 255}, Color{242, 240, 235, 36}, Color{242, 240, 235, 66}, Color{242, 240, 235, 255}, Color{169, 168, 164, 255}, Color{123, 122, 120, 255}, Color{255, 59, 47, 255}, Color{255, 59, 47, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{14, 14, 14, 255}, Color{25, 25, 25, 255}, Color{35, 34, 34, 255}, Color{48, 48, 47, 255}, Color{46, 46, 45, 255}, Color{73, 72, 71, 255}, Color{242, 240, 235, 255}, Color{169, 168, 164, 255}, Color{123, 122, 120, 255}, Color{255, 59, 47, 255}, Color{255, 59, 47, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Instrument Serif\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// abyssal teal with bioluminescent cyan
inline constexpr Theme deep-sea{ "deep-sea", "abyssal teal with bioluminescent cyan", true,
    Palette{Color{4, 27, 34, 255}, Color{14, 38, 45, 255}, Color{23, 47, 53, 255}, Color{36, 60, 66, 255}, Color{214, 244, 247, 36}, Color{214, 244, 247, 66}, Color{214, 244, 247, 255}, Color{147, 175, 179, 255}, Color{105, 131, 136, 255}, Color{45, 226, 230, 255}, Color{61, 124, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{4, 27, 34, 255}, Color{14, 38, 45, 255}, Color{23, 47, 53, 255}, Color{36, 60, 66, 255}, Color{34, 58, 64, 255}, Color{58, 83, 89, 255}, Color{214, 244, 247, 255}, Color{147, 175, 179, 255}, Color{105, 131, 136, 255}, Color{45, 226, 230, 255}, Color{61, 124, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pine shadows, moss green, firefly gold
inline constexpr Theme forest-night{ "forest-night", "pine shadows, moss green, firefly gold", true,
    Palette{Color{13, 22, 17, 255}, Color{24, 33, 27, 255}, Color{32, 41, 36, 255}, Color{45, 54, 48, 255}, Color{226, 234, 223, 36}, Color{226, 234, 223, 66}, Color{226, 234, 223, 255}, Color{158, 166, 157, 255}, Color{115, 124, 116, 255}, Color{124, 195, 110, 255}, Color{242, 193, 78, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 22, 17, 255}, Color{24, 33, 27, 255}, Color{32, 41, 36, 255}, Color{45, 54, 48, 255}, Color{43, 52, 46, 255}, Color{68, 77, 70, 255}, Color{226, 234, 223, 255}, Color{158, 166, 157, 255}, Color{115, 124, 116, 255}, Color{124, 195, 110, 255}, Color{242, 193, 78, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// dark roast brown with crema highlights
inline constexpr Theme espresso{ "espresso", "dark roast brown with crema highlights", true,
    Palette{Color{27, 19, 16, 255}, Color{38, 30, 26, 255}, Color{46, 38, 34, 255}, Color{59, 51, 46, 255}, Color{242, 230, 218, 36}, Color{242, 230, 218, 66}, Color{242, 230, 218, 255}, Color{173, 162, 153, 255}, Color{130, 120, 113, 255}, Color{217, 160, 102, 255}, Color{217, 160, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{27, 19, 16, 255}, Color{38, 30, 26, 255}, Color{46, 38, 34, 255}, Color{59, 51, 46, 255}, Color{57, 49, 45, 255}, Color{83, 74, 68, 255}, Color{242, 230, 218, 255}, Color{173, 162, 153, 255}, Color{130, 120, 113, 255}, Color{217, 160, 102, 255}, Color{217, 160, 102, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// velvet plum with rose-gold trim
inline constexpr Theme plum{ "plum", "velvet plum with rose-gold trim", true,
    Palette{Color{29, 16, 32, 255}, Color{40, 27, 42, 255}, Color{48, 35, 51, 255}, Color{61, 48, 63, 255}, Color{244, 230, 240, 36}, Color{244, 230, 240, 66}, Color{244, 230, 240, 255}, Color{175, 162, 173, 255}, Color{132, 119, 132, 255}, Color{231, 164, 192, 255}, Color{201, 169, 110, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{29, 16, 32, 255}, Color{40, 27, 42, 255}, Color{48, 35, 51, 255}, Color{61, 48, 63, 255}, Color{59, 46, 61, 255}, Color{85, 71, 86, 255}, Color{244, 230, 240, 255}, Color{175, 162, 173, 255}, Color{132, 119, 132, 255}, Color{231, 164, 192, 255}, Color{201, 169, 110, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// gothic purple-black with blood-red accents
inline constexpr Theme vampire{ "vampire", "gothic purple-black with blood-red accents", true,
    Palette{Color{22, 16, 28, 255}, Color{33, 27, 39, 255}, Color{42, 35, 48, 255}, Color{55, 48, 61, 255}, Color{240, 230, 245, 36}, Color{240, 230, 245, 66}, Color{240, 230, 245, 255}, Color{170, 162, 176, 255}, Color{127, 119, 132, 255}, Color{255, 69, 102, 255}, Color{189, 147, 249, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{22, 16, 28, 255}, Color{33, 27, 39, 255}, Color{42, 35, 48, 255}, Color{55, 48, 61, 255}, Color{53, 46, 59, 255}, Color{78, 71, 84, 255}, Color{240, 230, 245, 255}, Color{170, 162, 176, 255}, Color{127, 119, 132, 255}, Color{255, 69, 102, 255}, Color{189, 147, 249, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// arctic slate with frost blues
inline constexpr Theme nord-night{ "nord-night", "arctic slate with frost blues", true,
    Palette{Color{46, 52, 64, 255}, Color{56, 61, 73, 255}, Color{63, 69, 80, 255}, Color{74, 80, 91, 255}, Color{236, 239, 244, 36}, Color{236, 239, 244, 66}, Color{236, 239, 244, 255}, Color{175, 179, 186, 255}, Color{137, 142, 150, 255}, Color{136, 192, 208, 255}, Color{180, 142, 173, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{46, 52, 64, 255}, Color{56, 61, 73, 255}, Color{63, 69, 80, 255}, Color{74, 80, 91, 255}, Color{73, 78, 89, 255}, Color{95, 100, 111, 255}, Color{236, 239, 244, 255}, Color{175, 179, 186, 255}, Color{137, 142, 150, 255}, Color{136, 192, 208, 255}, Color{180, 142, 173, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// matte charcoal, amber indicators, studio calm
inline constexpr Theme charcoal{ "charcoal", "matte charcoal, amber indicators, studio calm", true,
    Palette{Color{30, 31, 34, 255}, Color{40, 41, 44, 255}, Color{48, 49, 51, 255}, Color{60, 61, 63, 255}, Color{232, 230, 227, 36}, Color{232, 230, 227, 66}, Color{232, 230, 227, 255}, Color{167, 166, 165, 255}, Color{127, 127, 127, 255}, Color{255, 181, 71, 255}, Color{255, 181, 71, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{30, 31, 34, 255}, Color{40, 41, 44, 255}, Color{48, 49, 51, 255}, Color{60, 61, 63, 255}, Color{59, 59, 61, 255}, Color{82, 83, 84, 255}, Color{232, 230, 227, 255}, Color{167, 166, 165, 255}, Color{127, 127, 127, 255}, Color{255, 181, 71, 255}, Color{255, 181, 71, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// lilac fields, soft violet buttons
inline constexpr Theme lavender{ "lavender", "lilac fields, soft violet buttons", false,
    Palette{Color{243, 239, 255, 255}, Color{250, 248, 255, 255}, Color{231, 227, 244, 255}, Color{221, 217, 236, 255}, Color{46, 37, 80, 26}, Color{46, 37, 80, 46}, Color{46, 37, 80, 255}, Color{109, 102, 136, 255}, Color{148, 142, 171, 255}, Color{139, 108, 240, 255}, Color{244, 154, 193, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{243, 239, 255, 255}, Color{250, 248, 255, 255}, Color{231, 227, 244, 255}, Color{221, 217, 236, 255}, Color{223, 218, 237, 255}, Color{207, 203, 223, 255}, Color{46, 37, 80, 255}, Color{109, 102, 136, 255}, Color{148, 142, 171, 255}, Color{139, 108, 240, 255}, Color{244, 154, 193, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// fresh mint with a deep green ink
inline constexpr Theme mint{ "mint", "fresh mint with a deep green ink", false,
    Palette{Color{236, 251, 243, 255}, Color{246, 253, 250, 255}, Color{223, 239, 231, 255}, Color{213, 230, 221, 255}, Color{23, 59, 44, 26}, Color{23, 59, 44, 46}, Color{23, 59, 44, 255}, Color{91, 120, 108, 255}, Color{134, 159, 147, 255}, Color{47, 179, 122, 255}, Color{122, 199, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{236, 251, 243, 255}, Color{246, 253, 250, 255}, Color{223, 239, 231, 255}, Color{213, 230, 221, 255}, Color{214, 231, 223, 255}, Color{198, 216, 207, 255}, Color{23, 59, 44, 255}, Color{91, 120, 108, 255}, Color{134, 159, 147, 255}, Color{47, 179, 122, 255}, Color{122, 199, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// peach fuzz, apricot buttons, warm and soft
inline constexpr Theme peach{ "peach", "peach fuzz, apricot buttons, warm and soft", false,
    Palette{Color{255, 241, 232, 255}, Color{255, 249, 245, 255}, Color{244, 229, 220, 255}, Color{235, 219, 210, 255}, Color{74, 44, 34, 26}, Color{74, 44, 34, 46}, Color{74, 44, 34, 255}, Color{132, 107, 97, 255}, Color{168, 146, 137, 255}, Color{255, 138, 92, 255}, Color{255, 196, 107, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 241, 232, 255}, Color{255, 249, 245, 255}, Color{244, 229, 220, 255}, Color{235, 219, 210, 255}, Color{237, 221, 212, 255}, Color{222, 205, 196, 255}, Color{74, 44, 34, 255}, Color{132, 107, 97, 255}, Color{168, 146, 137, 255}, Color{255, 138, 92, 255}, Color{255, 196, 107, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// cherry-blossom pink with sumi ink
inline constexpr Theme sakura{ "sakura", "cherry-blossom pink with sumi ink", false,
    Palette{Color{255, 242, 245, 255}, Color{255, 249, 250, 255}, Color{243, 230, 233, 255}, Color{233, 219, 223, 255}, Color{58, 36, 48, 26}, Color{58, 36, 48, 46}, Color{58, 36, 48, 255}, Color{121, 102, 111, 255}, Color{160, 143, 150, 255}, Color{232, 102, 143, 255}, Color{154, 208, 194, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 242, 245, 255}, Color{255, 249, 250, 255}, Color{243, 230, 233, 255}, Color{233, 219, 223, 255}, Color{235, 221, 225, 255}, Color{219, 205, 209, 255}, Color{58, 36, 48, 255}, Color{121, 102, 111, 255}, Color{160, 143, 150, 255}, Color{232, 102, 143, 255}, Color{154, 208, 194, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// cloud white and clear-sky blue
inline constexpr Theme sky{ "sky", "cloud white and clear-sky blue", false,
    Palette{Color{238, 246, 255, 255}, Color{247, 251, 255, 255}, Color{225, 234, 244, 255}, Color{215, 224, 235, 255}, Color{27, 47, 74, 26}, Color{27, 47, 74, 46}, Color{27, 47, 74, 255}, Color{95, 111, 132, 255}, Color{137, 150, 168, 255}, Color{74, 155, 255, 255}, Color{155, 231, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 246, 255, 255}, Color{247, 251, 255, 255}, Color{225, 234, 244, 255}, Color{215, 224, 235, 255}, Color{216, 226, 237, 255}, Color{200, 210, 222, 255}, Color{27, 47, 74, 255}, Color{95, 111, 132, 255}, Color{137, 150, 168, 255}, Color{74, 155, 255, 255}, Color{155, 231, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Outfit\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// lemon sorbet with a charcoal outline
inline constexpr Theme lemon{ "lemon", "lemon sorbet with a charcoal outline", false,
    Palette{Color{255, 251, 224, 255}, Color{255, 253, 241, 255}, Color{242, 238, 212, 255}, Color{232, 228, 203, 255}, Color{43, 42, 31, 26}, Color{43, 42, 31, 46}, Color{43, 42, 31, 255}, Color{111, 109, 93, 255}, Color{153, 151, 131, 255}, Color{245, 196, 0, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 251, 224, 255}, Color{255, 253, 241, 255}, Color{242, 238, 212, 255}, Color{232, 228, 203, 255}, Color{233, 230, 204, 255}, Color{217, 213, 189, 255}, Color{43, 42, 31, 255}, Color{111, 109, 93, 255}, Color{153, 151, 131, 255}, Color{245, 196, 0, 255}, Color{255, 126, 182, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 2.0f };

/// bubblegum pink, candy blue, bouncy
inline constexpr Theme bubblegum{ "bubblegum", "bubblegum pink, candy blue, bouncy", false,
    Palette{Color{255, 234, 246, 255}, Color{255, 246, 251, 255}, Color{243, 221, 234, 255}, Color{234, 210, 225, 255}, Color{61, 18, 54, 26}, Color{61, 18, 54, 46}, Color{61, 18, 54, 255}, Color{123, 87, 115, 255}, Color{162, 130, 154, 255}, Color{255, 79, 179, 255}, Color{79, 195, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 234, 246, 255}, Color{255, 246, 251, 255}, Color{243, 221, 234, 255}, Color{234, 210, 225, 255}, Color{235, 212, 226, 255}, Color{220, 195, 211, 255}, Color{61, 18, 54, 255}, Color{123, 87, 115, 255}, Color{162, 130, 154, 255}, Color{255, 79, 179, 255}, Color{79, 195, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 0.0f };

/// seafoam green with coral pops
inline constexpr Theme seafoam{ "seafoam", "seafoam green with coral pops", false,
    Palette{Color{233, 250, 246, 255}, Color{245, 253, 251, 255}, Color{220, 238, 234, 255}, Color{210, 229, 225, 255}, Color{22, 58, 54, 26}, Color{22, 58, 54, 46}, Color{22, 58, 54, 255}, Color{90, 119, 115, 255}, Color{132, 158, 154, 255}, Color{255, 127, 106, 255}, Color{56, 194, 165, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{233, 250, 246, 255}, Color{245, 253, 251, 255}, Color{220, 238, 234, 255}, Color{210, 229, 225, 255}, Color{211, 230, 226, 255}, Color{195, 215, 211, 255}, Color{22, 58, 54, 255}, Color{90, 119, 115, 255}, Color{132, 158, 154, 255}, Color{255, 127, 106, 255}, Color{56, 194, 165, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 0.0f };

/// loud orange, black type, no apologies
inline constexpr Theme tangerine{ "tangerine", "loud orange, black type, no apologies", false,
    Palette{Color{255, 122, 26, 255}, Color{255, 195, 152, 255}, Color{241, 116, 25, 255}, Color{230, 110, 24, 255}, Color{26, 15, 6, 26}, Color{26, 15, 6, 46}, Color{26, 15, 6, 255}, Color{99, 49, 12, 255}, Color{145, 71, 16, 255}, Color{26, 15, 6, 255}, Color{255, 243, 224, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 122, 26, 255}, Color{255, 195, 152, 255}, Color{241, 116, 25, 255}, Color{230, 110, 24, 255}, Color{232, 111, 24, 255}, Color{214, 103, 22, 255}, Color{26, 15, 6, 255}, Color{99, 49, 12, 255}, Color{145, 71, 16, 255}, Color{26, 15, 6, 255}, Color{255, 243, 224, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// electric cobalt field, white type, lemon accent
inline constexpr Theme cobalt{ "cobalt", "electric cobalt field, white type, lemon accent", true,
    Palette{Color{29, 63, 216, 255}, Color{40, 73, 218, 255}, Color{49, 80, 220, 255}, Color{63, 92, 222, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{183, 194, 243, 255}, Color{137, 155, 235, 255}, Color{255, 225, 77, 255}, Color{255, 225, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{29, 63, 216, 255}, Color{40, 73, 218, 255}, Color{49, 80, 220, 255}, Color{63, 92, 222, 255}, Color{61, 90, 222, 255}, Color{87, 113, 226, 255}, Color{255, 255, 255, 255}, Color{183, 194, 243, 255}, Color{137, 155, 235, 255}, Color{255, 225, 77, 255}, Color{255, 225, 77, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// hot magenta with cyan clash
inline constexpr Theme magenta{ "magenta", "hot magenta with cyan clash", true,
    Palette{Color{255, 45, 149, 255}, Color{243, 43, 143, 255}, Color{234, 41, 138, 255}, Color{220, 38, 131, 255}, Color{20, 0, 26, 36}, Color{20, 0, 26, 66}, Color{20, 0, 26, 255}, Color{95, 14, 65, 255}, Color{142, 23, 90, 255}, Color{20, 0, 26, 255}, Color{33, 227, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 45, 149, 255}, Color{243, 43, 143, 255}, Color{234, 41, 138, 255}, Color{220, 38, 131, 255}, Color{222, 39, 132, 255}, Color{194, 33, 117, 255}, Color{20, 0, 26, 255}, Color{95, 14, 65, 255}, Color{142, 23, 90, 255}, Color{20, 0, 26, 255}, Color{33, 227, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// two-ink riso print: fluoro pink + blue on paper
inline constexpr Theme risograph{ "risograph", "two-ink riso print: fluoro pink + blue on paper", false,
    Palette{Color{246, 241, 231, 255}, Color{251, 249, 244, 255}, Color{233, 230, 229, 255}, Color{223, 222, 228, 255}, Color{35, 64, 201, 26}, Color{35, 64, 201, 46}, Color{35, 64, 201, 255}, Color{103, 121, 211, 255}, Color{145, 156, 217, 255}, Color{255, 79, 154, 255}, Color{35, 64, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{246, 241, 231, 255}, Color{251, 249, 244, 255}, Color{233, 230, 229, 255}, Color{223, 222, 228, 255}, Color{224, 223, 228, 255}, Color{208, 209, 226, 255}, Color{35, 64, 201, 255}, Color{103, 121, 211, 255}, Color{145, 156, 217, 255}, Color{255, 79, 154, 255}, Color{35, 64, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// comic-book halftones, primary colours, ink outlines
inline constexpr Theme pop-art{ "pop-art", "comic-book halftones, primary colours, ink outlines", false,
    Palette{Color{255, 243, 92, 255}, Color{255, 250, 182, 255}, Color{241, 229, 88, 255}, Color{229, 218, 84, 255}, Color{17, 17, 17, 26}, Color{17, 17, 17, 46}, Color{17, 17, 17, 255}, Color{93, 89, 41, 255}, Color{141, 135, 56, 255}, Color{255, 43, 43, 255}, Color{43, 107, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 243, 92, 255}, Color{255, 250, 182, 255}, Color{241, 229, 88, 255}, Color{229, 218, 84, 255}, Color{231, 220, 84, 255}, Color{212, 202, 78, 255}, Color{17, 17, 17, 255}, Color{93, 89, 41, 255}, Color{141, 135, 56, 255}, Color{255, 43, 43, 255}, Color{43, 107, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// primary geometry: red, yellow, blue on cream
inline constexpr Theme bauhaus{ "bauhaus", "primary geometry: red, yellow, blue on cream", false,
    Palette{Color{242, 234, 216, 255}, Color{249, 246, 237, 255}, Color{229, 221, 204, 255}, Color{218, 210, 194, 255}, Color{20, 20, 20, 26}, Color{20, 20, 20, 46}, Color{20, 20, 20, 255}, Color{91, 88, 83, 255}, Color{135, 131, 122, 255}, Color{214, 40, 27, 255}, Color{31, 79, 181, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{242, 234, 216, 255}, Color{249, 246, 237, 255}, Color{229, 221, 204, 255}, Color{218, 210, 194, 255}, Color{219, 212, 196, 255}, Color{202, 195, 181, 255}, Color{20, 20, 20, 255}, Color{91, 88, 83, 255}, Color{135, 131, 122, 255}, Color{214, 40, 27, 255}, Color{31, 79, 181, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// 80s memphis squiggles, teal and pink
inline constexpr Theme memphis{ "memphis", "80s memphis squiggles, teal and pink", false,
    Palette{Color{255, 248, 239, 255}, Color{255, 252, 248, 255}, Color{241, 235, 227, 255}, Color{230, 224, 218, 255}, Color{27, 27, 47, 26}, Color{27, 27, 47, 46}, Color{27, 27, 47, 255}, Color{100, 98, 108, 255}, Color{146, 142, 147, 255}, Color{255, 92, 168, 255}, Color{33, 196, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 248, 239, 255}, Color{255, 252, 248, 255}, Color{241, 235, 227, 255}, Color{230, 224, 218, 255}, Color{232, 225, 219, 255}, Color{214, 208, 204, 255}, Color{27, 27, 47, 255}, Color{100, 98, 108, 255}, Color{146, 142, 147, 255}, Color{255, 92, 168, 255}, Color{33, 196, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 2.0f };

/// acid lime neo-brutalism, thick black outlines
inline constexpr Theme brutal-lime{ "brutal-lime", "acid lime neo-brutalism, thick black outlines", false,
    Palette{Color{232, 255, 90, 255}, Color{245, 255, 181, 255}, Color{218, 240, 85, 255}, Color{206, 227, 80, 255}, Color{0, 0, 0, 26}, Color{0, 0, 0, 46}, Color{0, 0, 0, 255}, Color{74, 82, 29, 255}, Color{121, 133, 47, 255}, Color{0, 0, 0, 255}, Color{255, 94, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{232, 255, 90, 255}, Color{245, 255, 181, 255}, Color{218, 240, 85, 255}, Color{206, 227, 80, 255}, Color{208, 229, 81, 255}, Color{190, 209, 74, 255}, Color{0, 0, 0, 255}, Color{74, 82, 29, 255}, Color{121, 133, 47, 255}, Color{0, 0, 0, 255}, Color{255, 94, 196, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// amber phosphor terminal from 1983
inline constexpr Theme amber-crt{ "amber-crt", "amber phosphor terminal from 1983", true,
    Palette{Color{19, 12, 2, 255}, Color{31, 20, 4, 255}, Color{40, 27, 5, 255}, Color{54, 38, 8, 255}, Color{255, 182, 39, 36}, Color{255, 182, 39, 66}, Color{255, 182, 39, 255}, Color{179, 128, 27, 255}, Color{132, 94, 20, 255}, Color{255, 182, 39, 255}, Color{255, 217, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{19, 12, 2, 255}, Color{31, 20, 4, 255}, Color{40, 27, 5, 255}, Color{54, 38, 8, 255}, Color{52, 36, 7, 255}, Color{80, 56, 12, 255}, Color{255, 182, 39, 255}, Color{179, 128, 27, 255}, Color{132, 94, 20, 255}, Color{255, 182, 39, 255}, Color{255, 217, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", ui-monospace, monospace", "\"VT323\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// four shades of handheld green
inline constexpr Theme gameboy{ "gameboy", "four shades of handheld green", false,
    Palette{Color{155, 188, 15, 255}, Color{139, 172, 15, 255}, Color{147, 180, 15, 255}, Color{140, 173, 15, 255}, Color{15, 56, 15, 26}, Color{15, 56, 15, 46}, Color{15, 56, 15, 255}, Color{60, 98, 15, 255}, Color{88, 125, 15, 255}, Color{48, 98, 48, 255}, Color{139, 172, 15, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{155, 188, 15, 255}, Color{139, 172, 15, 255}, Color{147, 180, 15, 255}, Color{140, 173, 15, 255}, Color{141, 175, 15, 255}, Color{130, 164, 15, 255}, Color{15, 56, 15, 255}, Color{60, 98, 15, 255}, Color{88, 125, 15, 255}, Color{48, 98, 48, 255}, Color{139, 172, 15, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Press Start 2P\", ui-monospace, monospace", "\"Press Start 2P\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 3.0f };

/// pastel grid sunsets, marble busts and chrome
inline constexpr Theme vaporwave{ "vaporwave", "pastel grid sunsets, marble busts and chrome", true,
    Palette{Color{43, 16, 85, 255}, Color{54, 27, 94, 255}, Color{62, 36, 100, 255}, Color{74, 50, 110, 255}, Color{253, 242, 255, 36}, Color{253, 242, 255, 66}, Color{253, 242, 255, 255}, Color{186, 170, 201, 255}, Color{144, 124, 167, 255}, Color{255, 113, 206, 255}, Color{1, 205, 254, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{43, 16, 85, 255}, Color{54, 27, 94, 255}, Color{62, 36, 100, 255}, Color{74, 50, 110, 255}, Color{73, 48, 109, 255}, Color{97, 74, 129, 255}, Color{253, 242, 255, 255}, Color{186, 170, 201, 255}, Color{144, 124, 167, 255}, Color{255, 113, 206, 255}, Color{1, 205, 254, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Major Mono Display\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// outrun sunset, neon grid, chrome type
inline constexpr Theme synthwave{ "synthwave", "outrun sunset, neon grid, chrome type", true,
    Palette{Color{26, 9, 51, 255}, Color{37, 20, 61, 255}, Color{47, 29, 69, 255}, Color{60, 43, 82, 255}, Color{255, 233, 255, 36}, Color{255, 233, 255, 66}, Color{255, 233, 255, 255}, Color{182, 161, 190, 255}, Color{136, 117, 149, 255}, Color{255, 47, 214, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 9, 51, 255}, Color{37, 20, 61, 255}, Color{47, 29, 69, 255}, Color{60, 43, 82, 255}, Color{58, 41, 80, 255}, Color{85, 67, 104, 255}, Color{255, 233, 255, 255}, Color{182, 161, 190, 255}, Color{136, 117, 149, 255}, Color{255, 47, 214, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Audiowide\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// coin-op cabinet: black, neon red and yellow
inline constexpr Theme arcade{ "arcade", "coin-op cabinet: black, neon red and yellow", true,
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{244, 244, 255, 36}, Color{244, 244, 255, 66}, Color{244, 244, 255, 255}, Color{169, 169, 180, 255}, Color{123, 123, 133, 255}, Color{255, 46, 77, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 11, 20, 255}, Color{23, 23, 32, 255}, Color{32, 32, 41, 255}, Color{46, 46, 55, 255}, Color{44, 44, 53, 255}, Color{71, 71, 81, 255}, Color{244, 244, 255, 255}, Color{169, 169, 180, 255}, Color{123, 123, 133, 255}, Color{255, 46, 77, 255}, Color{255, 210, 63, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Press Start 2P\", ui-monospace, monospace", "\"Press Start 2P\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 2.0f };

/// broadcast teletext: black field, primary blocks
inline constexpr Theme teletext{ "teletext", "broadcast teletext: black field, primary blocks", true,
    Palette{Color{0, 0, 0, 255}, Color{13, 13, 13, 255}, Color{23, 23, 23, 255}, Color{38, 38, 38, 255}, Color{255, 255, 255, 36}, Color{255, 255, 255, 66}, Color{255, 255, 255, 255}, Color{173, 173, 173, 255}, Color{122, 122, 122, 255}, Color{255, 255, 0, 255}, Color{0, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{0, 0, 0, 255}, Color{13, 13, 13, 255}, Color{23, 23, 23, 255}, Color{38, 38, 38, 255}, Color{36, 36, 36, 255}, Color{66, 66, 66, 255}, Color{255, 255, 255, 255}, Color{173, 173, 173, 255}, Color{122, 122, 122, 255}, Color{255, 255, 0, 255}, Color{0, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"VT323\", ui-monospace, monospace", "\"VT323\", ui-monospace, monospace", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// faded instant-film creams and teal shadows
inline constexpr Theme polaroid{ "polaroid", "faded instant-film creams and teal shadows", false,
    Palette{Color{241, 235, 225, 255}, Color{249, 246, 242, 255}, Color{229, 224, 215, 255}, Color{219, 216, 207, 255}, Color{42, 58, 61, 26}, Color{42, 58, 61, 46}, Color{42, 58, 61, 255}, Color{106, 115, 113, 255}, Color{145, 150, 146, 255}, Color{217, 108, 79, 255}, Color{79, 138, 139, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{241, 235, 225, 255}, Color{249, 246, 242, 255}, Color{229, 224, 215, 255}, Color{219, 216, 207, 255}, Color{221, 217, 208, 255}, Color{205, 203, 195, 255}, Color{42, 58, 61, 255}, Color{106, 115, 113, 255}, Color{145, 150, 146, 255}, Color{217, 108, 79, 255}, Color{79, 138, 139, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Patrick Hand\", \"Comic Neue\", cursive", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// beige desktop era with bevelled grey chrome
inline constexpr Theme win-classic{ "win-classic", "beige desktop era with bevelled grey chrome", false,
    Palette{Color{195, 199, 203, 255}, Color{228, 230, 232, 255}, Color{183, 187, 191, 255}, Color{174, 177, 181, 255}, Color{0, 0, 0, 26}, Color{0, 0, 0, 46}, Color{0, 0, 0, 255}, Color{62, 64, 65, 255}, Color{101, 103, 106, 255}, Color{0, 0, 128, 255}, Color{0, 128, 128, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{195, 199, 203, 255}, Color{228, 230, 232, 255}, Color{183, 187, 191, 255}, Color{174, 177, 181, 255}, Color{175, 179, 182, 255}, Color{160, 163, 166, 255}, Color{0, 0, 0, 255}, Color{62, 64, 65, 255}, Color{101, 103, 106, 255}, Color{0, 0, 128, 255}, Color{0, 128, 128, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 0.0f };

/// damp forest floor and moss green
inline constexpr Theme moss{ "moss", "damp forest floor and moss green", false,
    Palette{Color{238, 241, 230, 255}, Color{247, 249, 244, 255}, Color{226, 229, 218, 255}, Color{216, 220, 208, 255}, Color{36, 48, 28, 26}, Color{36, 48, 28, 46}, Color{36, 48, 28, 255}, Color{101, 110, 93, 255}, Color{141, 148, 133, 255}, Color{90, 125, 47, 255}, Color{176, 138, 62, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{238, 241, 230, 255}, Color{247, 249, 244, 255}, Color{226, 229, 218, 255}, Color{216, 220, 208, 255}, Color{217, 221, 209, 255}, Color{202, 206, 194, 255}, Color{36, 48, 28, 255}, Color{101, 110, 93, 255}, Color{141, 148, 133, 255}, Color{90, 125, 47, 255}, Color{176, 138, 62, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// open ocean blues with whitecap foam
inline constexpr Theme ocean{ "ocean", "open ocean blues with whitecap foam", false,
    Palette{Color{231, 243, 250, 255}, Color{244, 250, 253, 255}, Color{218, 231, 239, 255}, Color{207, 221, 230, 255}, Color{12, 42, 64, 26}, Color{12, 42, 64, 46}, Color{12, 42, 64, 255}, Color{82, 106, 124, 255}, Color{126, 147, 161, 255}, Color{10, 123, 191, 255}, Color{63, 208, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{231, 243, 250, 255}, Color{244, 250, 253, 255}, Color{218, 231, 239, 255}, Color{207, 221, 230, 255}, Color{209, 223, 231, 255}, Color{191, 207, 216, 255}, Color{12, 42, 64, 255}, Color{82, 106, 124, 255}, Color{126, 147, 161, 255}, Color{10, 123, 191, 255}, Color{63, 208, 201, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"DM Serif Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// sandstone, cactus green and sunset clay
inline constexpr Theme desert{ "desert", "sandstone, cactus green and sunset clay", false,
    Palette{Color{244, 227, 200, 255}, Color{250, 242, 230, 255}, Color{233, 216, 189, 255}, Color{224, 206, 181, 255}, Color{61, 38, 24, 26}, Color{61, 38, 24, 46}, Color{61, 38, 24, 255}, Color{120, 98, 80, 255}, Color{156, 136, 116, 255}, Color{200, 85, 61, 255}, Color{91, 140, 90, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 227, 200, 255}, Color{250, 242, 230, 255}, Color{233, 216, 189, 255}, Color{224, 206, 181, 255}, Color{225, 208, 182, 255}, Color{211, 193, 168, 255}, Color{61, 38, 24, 255}, Color{120, 98, 80, 255}, Color{156, 136, 116, 255}, Color{200, 85, 61, 255}, Color{91, 140, 90, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// glacial ice, cold blue light
inline constexpr Theme glacier{ "glacier", "glacial ice, cold blue light", false,
    Palette{Color{234, 246, 251, 255}, Color{246, 251, 253, 255}, Color{221, 234, 240, 255}, Color{211, 224, 232, 255}, Color{22, 50, 74, 26}, Color{22, 50, 74, 46}, Color{22, 50, 74, 255}, Color{90, 113, 131, 255}, Color{132, 152, 166, 255}, Color{58, 155, 217, 255}, Color{166, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{234, 246, 251, 255}, Color{246, 251, 253, 255}, Color{221, 234, 240, 255}, Color{211, 224, 232, 255}, Color{212, 226, 233, 255}, Color{196, 211, 219, 255}, Color{22, 50, 74, 255}, Color{90, 113, 131, 255}, Color{132, 152, 166, 255}, Color{58, 155, 217, 255}, Color{166, 227, 255, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// maple orange, oak brown, harvest gold
inline constexpr Theme autumn{ "autumn", "maple orange, oak brown, harvest gold", false,
    Palette{Color{251, 241, 228, 255}, Color{253, 249, 243, 255}, Color{239, 229, 216, 255}, Color{230, 218, 205, 255}, Color{58, 36, 22, 26}, Color{58, 36, 22, 46}, Color{58, 36, 22, 255}, Color{120, 102, 88, 255}, Color{158, 143, 129, 255}, Color{210, 96, 26, 255}, Color{201, 154, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 241, 228, 255}, Color{253, 249, 243, 255}, Color{239, 229, 216, 255}, Color{230, 218, 205, 255}, Color{231, 220, 207, 255}, Color{216, 204, 191, 255}, Color{58, 36, 22, 255}, Color{120, 102, 88, 255}, Color{158, 143, 129, 255}, Color{210, 96, 26, 255}, Color{201, 154, 46, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// basalt black, flowing lava, ember glow
inline constexpr Theme volcano{ "volcano", "basalt black, flowing lava, ember glow", true,
    Palette{Color{20, 11, 8, 255}, Color{31, 22, 19, 255}, Color{40, 31, 27, 255}, Color{54, 44, 40, 255}, Color{246, 230, 220, 36}, Color{246, 230, 220, 66}, Color{246, 230, 220, 255}, Color{174, 160, 152, 255}, Color{128, 116, 110, 255}, Color{255, 77, 26, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{20, 11, 8, 255}, Color{31, 22, 19, 255}, Color{40, 31, 27, 255}, Color{54, 44, 40, 255}, Color{52, 42, 38, 255}, Color{78, 68, 63, 255}, Color{246, 230, 220, 255}, Color{174, 160, 152, 255}, Color{128, 116, 110, 255}, Color{255, 77, 26, 255}, Color{255, 176, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Space Grotesk\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// white pearlescent with iridescent pink, mint and blue, like a CS2 Printstream finish
inline constexpr Theme pearl{ "pearl", "white pearlescent with iridescent pink, mint and blue, like a CS2 Printstream finish", false,
    Palette{Color{251, 250, 255, 255}, Color{253, 253, 255, 255}, Color{238, 237, 244, 255}, Color{228, 226, 234, 255}, Color{42, 35, 66, 26}, Color{42, 35, 66, 46}, Color{42, 35, 66, 255}, Color{109, 104, 126, 255}, Color{151, 147, 164, 255}, Color{143, 127, 214, 255}, Color{127, 200, 227, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{251, 250, 255, 255}, Color{253, 253, 255, 255}, Color{238, 237, 244, 255}, Color{228, 226, 234, 255}, Color{230, 228, 236, 255}, Color{213, 211, 221, 255}, Color{42, 35, 66, 255}, Color{109, 104, 126, 255}, Color{151, 147, 164, 255}, Color{143, 127, 214, 255}, Color{127, 200, 227, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// black pearlescent with an oil-slick sheen
inline constexpr Theme black-pearl{ "black-pearl", "black pearlescent with an oil-slick sheen", true,
    Palette{Color{12, 11, 18, 255}, Color{23, 22, 30, 255}, Color{32, 31, 39, 255}, Color{46, 44, 54, 255}, Color{239, 234, 255, 36}, Color{239, 234, 255, 66}, Color{239, 234, 255, 255}, Color{166, 163, 179, 255}, Color{121, 118, 132, 255}, Color{181, 156, 255, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{12, 11, 18, 255}, Color{23, 22, 30, 255}, Color{32, 31, 39, 255}, Color{46, 44, 54, 255}, Color{44, 42, 51, 255}, Color{71, 69, 79, 255}, Color{239, 234, 255, 255}, Color{166, 163, 179, 255}, Color{121, 118, 132, 255}, Color{181, 156, 255, 255}, Color{94, 231, 208, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// deep sapphire with a polished metal band through the type
inline constexpr Theme sapphire-metal{ "sapphire-metal", "deep sapphire with a polished metal band through the type", true,
    Palette{Color{6, 11, 36, 255}, Color{17, 22, 47, 255}, Color{26, 31, 56, 255}, Color{39, 45, 69, 255}, Color{227, 236, 255, 36}, Color{227, 236, 255, 66}, Color{227, 236, 255, 255}, Color{156, 164, 185, 255}, Color{112, 119, 141, 255}, Color{61, 107, 255, 255}, Color{159, 192, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{6, 11, 36, 255}, Color{17, 22, 47, 255}, Color{26, 31, 56, 255}, Color{39, 45, 69, 255}, Color{37, 43, 67, 255}, Color{63, 69, 93, 255}, Color{227, 236, 255, 255}, Color{156, 164, 185, 255}, Color{112, 119, 141, 255}, Color{61, 107, 255, 255}, Color{159, 192, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// pink to violet to gold candy fade, inspired by the Fade knife finish
inline constexpr Theme fade{ "fade", "pink to violet to gold candy fade, inspired by the Fade knife finish", false,
    Palette{Color{255, 244, 251, 255}, Color{255, 250, 253, 255}, Color{243, 230, 239, 255}, Color{233, 219, 230, 255}, Color{58, 18, 56, 26}, Color{58, 18, 56, 46}, Color{58, 18, 56, 255}, Color{121, 90, 118, 255}, Color{160, 136, 157, 255}, Color{255, 79, 163, 255}, Color{255, 201, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 251, 255}, Color{255, 250, 253, 255}, Color{243, 230, 239, 255}, Color{233, 219, 230, 255}, Color{235, 221, 231, 255}, Color{219, 203, 216, 255}, Color{58, 18, 56, 255}, Color{121, 90, 118, 255}, Color{160, 136, 157, 255}, Color{255, 79, 163, 255}, Color{255, 201, 60, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// deep space purple-blue with sparkling dust, inspired by Doppler blades
inline constexpr Theme doppler{ "doppler", "deep space purple-blue with sparkling dust, inspired by Doppler blades", true,
    Palette{Color{10, 4, 32, 255}, Color{21, 15, 43, 255}, Color{30, 24, 52, 255}, Color{44, 38, 65, 255}, Color{236, 230, 255, 36}, Color{236, 230, 255, 66}, Color{236, 230, 255, 255}, Color{164, 158, 184, 255}, Color{118, 112, 139, 255}, Color{138, 92, 255, 255}, Color{41, 198, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{10, 4, 32, 255}, Color{21, 15, 43, 255}, Color{30, 24, 52, 255}, Color{44, 38, 65, 255}, Color{42, 36, 63, 255}, Color{68, 62, 90, 255}, Color{236, 230, 255, 255}, Color{164, 158, 184, 255}, Color{118, 112, 139, 255}, Color{138, 92, 255, 255}, Color{41, 198, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// emerald gem green with a gamma glow
inline constexpr Theme emerald{ "emerald", "emerald gem green with a gamma glow", true,
    Palette{Color{3, 21, 13, 255}, Color{14, 33, 24, 255}, Color{23, 42, 33, 255}, Color{36, 56, 47, 255}, Color{220, 255, 238, 36}, Color{220, 255, 238, 66}, Color{220, 255, 238, 255}, Color{151, 180, 166, 255}, Color{107, 133, 121, 255}, Color{25, 227, 138, 255}, Color{122, 255, 209, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{3, 21, 13, 255}, Color{14, 33, 24, 255}, Color{23, 42, 33, 255}, Color{36, 56, 47, 255}, Color{34, 54, 45, 255}, Color{59, 82, 71, 255}, Color{220, 255, 238, 255}, Color{151, 180, 166, 255}, Color{107, 133, 121, 255}, Color{25, 227, 138, 255}, Color{122, 255, 209, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// cut ruby red with internal fire
inline constexpr Theme ruby{ "ruby", "cut ruby red with internal fire", true,
    Palette{Color{22, 2, 10, 255}, Color{34, 13, 21, 255}, Color{43, 22, 30, 255}, Color{57, 36, 44, 255}, Color{255, 227, 234, 36}, Color{255, 227, 234, 66}, Color{255, 227, 234, 255}, Color{180, 155, 162, 255}, Color{134, 110, 118, 255}, Color{255, 31, 79, 255}, Color{255, 138, 163, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{22, 2, 10, 255}, Color{34, 13, 21, 255}, Color{43, 22, 30, 255}, Color{57, 36, 44, 255}, Color{55, 34, 42, 255}, Color{82, 60, 68, 255}, Color{255, 227, 234, 255}, Color{180, 155, 162, 255}, Color{134, 110, 118, 255}, Color{255, 31, 79, 255}, Color{255, 138, 163, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// swirled red, yellow and blue marble, like a Marble Fade
inline constexpr Theme marble-fade{ "marble-fade", "swirled red, yellow and blue marble, like a Marble Fade", false,
    Palette{Color{255, 248, 238, 255}, Color{255, 252, 247, 255}, Color{242, 235, 225, 255}, Color{232, 224, 215, 255}, Color{42, 26, 26, 26}, Color{42, 26, 26, 46}, Color{42, 26, 26, 255}, Color{110, 97, 94, 255}, Color{153, 141, 136, 255}, Color{232, 50, 47, 255}, Color{47, 107, 232, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 248, 238, 255}, Color{255, 252, 247, 255}, Color{242, 235, 225, 255}, Color{232, 224, 215, 255}, Color{233, 225, 216, 255}, Color{217, 208, 200, 255}, Color{42, 26, 26, 255}, Color{110, 97, 94, 255}, Color{153, 141, 136, 255}, Color{232, 50, 47, 255}, Color{47, 107, 232, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// heat-treated steel: blue, gold and bronze patina
inline constexpr Theme case-hardened{ "case-hardened", "heat-treated steel: blue, gold and bronze patina", true,
    Palette{Color{26, 31, 43, 255}, Color{37, 42, 53, 255}, Color{45, 50, 61, 255}, Color{58, 62, 74, 255}, Color{238, 241, 247, 36}, Color{238, 241, 247, 66}, Color{238, 241, 247, 255}, Color{170, 174, 182, 255}, Color{128, 132, 141, 255}, Color{63, 123, 217, 255}, Color{214, 168, 74, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 31, 43, 255}, Color{37, 42, 53, 255}, Color{45, 50, 61, 255}, Color{58, 62, 74, 255}, Color{56, 61, 72, 255}, Color{81, 85, 96, 255}, Color{238, 241, 247, 255}, Color{170, 174, 182, 255}, Color{128, 132, 141, 255}, Color{63, 123, 217, 255}, Color{214, 168, 74, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Rajdhani\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// molten gold with tiger stripes
inline constexpr Theme tiger-tooth{ "tiger-tooth", "molten gold with tiger stripes", true,
    Palette{Color{26, 18, 5, 255}, Color{37, 29, 15, 255}, Color{47, 38, 24, 255}, Color{60, 52, 36, 255}, Color{255, 244, 214, 36}, Color{255, 244, 214, 66}, Color{255, 244, 214, 255}, Color{182, 172, 147, 255}, Color{136, 126, 105, 255}, Color{255, 176, 0, 255}, Color{255, 122, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 18, 5, 255}, Color{37, 29, 15, 255}, Color{47, 38, 24, 255}, Color{60, 52, 36, 255}, Color{58, 50, 35, 255}, Color{85, 76, 59, 255}, Color{255, 244, 214, 255}, Color{182, 172, 147, 255}, Color{136, 126, 105, 255}, Color{255, 176, 0, 255}, Color{255, 122, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// folded steel with flowing grain
inline constexpr Theme damascus{ "damascus", "folded steel with flowing grain", true,
    Palette{Color{32, 35, 38, 255}, Color{42, 45, 48, 255}, Color{50, 53, 56, 255}, Color{62, 65, 68, 255}, Color{233, 236, 239, 36}, Color{233, 236, 239, 66}, Color{233, 236, 239, 255}, Color{169, 172, 175, 255}, Color{128, 131, 134, 255}, Color{154, 166, 178, 255}, Color{208, 215, 222, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{32, 35, 38, 255}, Color{42, 45, 48, 255}, Color{50, 53, 56, 255}, Color{62, 65, 68, 255}, Color{60, 63, 66, 255}, Color{84, 87, 90, 255}, Color{233, 236, 239, 255}, Color{169, 172, 175, 255}, Color{128, 131, 134, 255}, Color{154, 166, 178, 255}, Color{208, 215, 222, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// deep crimson with a black web pattern
inline constexpr Theme crimson-web{ "crimson-web", "deep crimson with a black web pattern", true,
    Palette{Color{58, 3, 6, 255}, Color{68, 14, 17, 255}, Color{76, 23, 26, 255}, Color{88, 37, 40, 255}, Color{255, 230, 230, 36}, Color{255, 230, 230, 66}, Color{255, 230, 230, 255}, Color{192, 157, 158, 255}, Color{153, 112, 114, 255}, Color{255, 42, 53, 255}, Color{0, 0, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{58, 3, 6, 255}, Color{68, 14, 17, 255}, Color{76, 23, 26, 255}, Color{88, 37, 40, 255}, Color{86, 35, 38, 255}, Color{109, 62, 64, 255}, Color{255, 230, 230, 255}, Color{192, 157, 158, 255}, Color{153, 112, 114, 255}, Color{255, 42, 53, 255}, Color{0, 0, 0, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Bebas Neue\", Impact, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// colour-shift paint flipping teal to purple
inline constexpr Theme chameleon{ "chameleon", "colour-shift paint flipping teal to purple", true,
    Palette{Color{14, 10, 26, 255}, Color{25, 21, 37, 255}, Color{34, 30, 47, 255}, Color{48, 43, 60, 255}, Color{239, 233, 255, 36}, Color{239, 233, 255, 66}, Color{239, 233, 255, 255}, Color{167, 162, 182, 255}, Color{122, 117, 136, 255}, Color{31, 209, 193, 255}, Color{162, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{14, 10, 26, 255}, Color{25, 21, 37, 255}, Color{34, 30, 47, 255}, Color{48, 43, 60, 255}, Color{46, 41, 58, 255}, Color{72, 68, 85, 255}, Color{239, 233, 255, 255}, Color{167, 162, 182, 255}, Color{122, 117, 136, 255}, Color{31, 209, 193, 255}, Color{162, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// deep candy-apple red car paint with a clearcoat
inline constexpr Theme candy-apple{ "candy-apple", "deep candy-apple red car paint with a clearcoat", true,
    Palette{Color{26, 3, 6, 255}, Color{37, 14, 18, 255}, Color{47, 24, 27, 255}, Color{60, 38, 40, 255}, Color{255, 233, 236, 36}, Color{255, 233, 236, 66}, Color{255, 233, 236, 255}, Color{182, 159, 162, 255}, Color{136, 113, 116, 255}, Color{224, 16, 42, 255}, Color{255, 107, 129, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{26, 3, 6, 255}, Color{37, 14, 18, 255}, Color{47, 24, 27, 255}, Color{60, 38, 40, 255}, Color{58, 35, 38, 255}, Color{85, 63, 66, 255}, Color{255, 233, 236, 255}, Color{182, 159, 162, 255}, Color{136, 113, 116, 255}, Color{224, 16, 42, 255}, Color{255, 107, 129, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// anodised aluminium in electric blue and violet
inline constexpr Theme anodized{ "anodized", "anodised aluminium in electric blue and violet", true,
    Palette{Color{13, 16, 34, 255}, Color{24, 27, 45, 255}, Color{33, 36, 54, 255}, Color{46, 49, 67, 255}, Color{232, 236, 255, 36}, Color{232, 236, 255, 66}, Color{232, 236, 255, 255}, Color{162, 166, 184, 255}, Color{118, 122, 140, 255}, Color{79, 107, 255, 255}, Color{192, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{13, 16, 34, 255}, Color{24, 27, 45, 255}, Color{33, 36, 54, 255}, Color{46, 49, 67, 255}, Color{44, 47, 65, 255}, Color{70, 73, 91, 255}, Color{232, 236, 255, 255}, Color{162, 166, 184, 255}, Color{118, 122, 140, 255}, Color{79, 107, 255, 255}, Color{192, 75, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Space Grotesk\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// brushed titanium greys, precision engineered
inline constexpr Theme titanium{ "titanium", "brushed titanium greys, precision engineered", true,
    Palette{Color{44, 47, 51, 255}, Color{54, 57, 61, 255}, Color{62, 65, 68, 255}, Color{74, 76, 80, 255}, Color{241, 243, 245, 36}, Color{241, 243, 245, 66}, Color{241, 243, 245, 255}, Color{178, 180, 183, 255}, Color{139, 141, 144, 255}, Color{195, 203, 212, 255}, Color{125, 138, 150, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{44, 47, 51, 255}, Color{54, 57, 61, 255}, Color{62, 65, 68, 255}, Color{74, 76, 80, 255}, Color{72, 75, 78, 255}, Color{95, 98, 101, 255}, Color{241, 243, 245, 255}, Color{178, 180, 183, 255}, Color{139, 141, 144, 255}, Color{195, 203, 212, 255}, Color{125, 138, 150, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Geist\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    2.0f, 2.0f, 3.0f, 4.0f, 1.0f };

/// dark gunmetal with machined edges
inline constexpr Theme gunmetal{ "gunmetal", "dark gunmetal with machined edges", true,
    Palette{Color{27, 30, 34, 255}, Color{37, 40, 44, 255}, Color{45, 48, 52, 255}, Color{57, 60, 64, 255}, Color{227, 231, 236, 36}, Color{227, 231, 236, 66}, Color{227, 231, 236, 255}, Color{163, 167, 171, 255}, Color{123, 126, 131, 255}, Color{143, 163, 184, 255}, Color{197, 210, 223, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{27, 30, 34, 255}, Color{37, 40, 44, 255}, Color{45, 48, 52, 255}, Color{57, 60, 64, 255}, Color{55, 58, 63, 255}, Color{79, 82, 86, 255}, Color{227, 231, 236, 255}, Color{163, 167, 171, 255}, Color{123, 126, 131, 255}, Color{143, 163, 184, 255}, Color{197, 210, 223, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// blush rose gold with soft champagne light
inline constexpr Theme rose-gold{ "rose-gold", "blush rose gold with soft champagne light", false,
    Palette{Color{255, 244, 241, 255}, Color{255, 250, 249, 255}, Color{244, 232, 229, 255}, Color{235, 222, 219, 255}, Color{74, 42, 42, 26}, Color{74, 42, 42, 46}, Color{74, 42, 42, 255}, Color{132, 107, 106, 255}, Color{168, 147, 145, 255}, Color{212, 135, 122, 255}, Color{232, 195, 158, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{255, 244, 241, 255}, Color{255, 250, 249, 255}, Color{244, 232, 229, 255}, Color{235, 222, 219, 255}, Color{237, 223, 221, 255}, Color{222, 208, 205, 255}, Color{74, 42, 42, 255}, Color{132, 107, 106, 255}, Color{168, 147, 145, 255}, Color{212, 135, 122, 255}, Color{232, 195, 158, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Playfair Display\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// black lacquer with hammered gold leaf
inline constexpr Theme gold-leaf{ "gold-leaf", "black lacquer with hammered gold leaf", true,
    Palette{Color{11, 9, 6, 255}, Color{23, 20, 16, 255}, Color{32, 29, 24, 255}, Color{46, 43, 36, 255}, Color{246, 234, 208, 36}, Color{246, 234, 208, 66}, Color{246, 234, 208, 255}, Color{171, 162, 143, 255}, Color{124, 117, 103, 255}, Color{212, 166, 58, 255}, Color{247, 224, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{11, 9, 6, 255}, Color{23, 20, 16, 255}, Color{32, 29, 24, 255}, Color{46, 43, 36, 255}, Color{44, 41, 35, 255}, Color{72, 67, 58, 255}, Color{246, 234, 208, 255}, Color{171, 162, 143, 255}, Color{124, 117, 103, 255}, Color{212, 166, 58, 255}, Color{247, 224, 138, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Cormorant Garamond\", Georgia, serif", "\"Cormorant Garamond\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// trading-card holographic foil
inline constexpr Theme holo-foil{ "holo-foil", "trading-card holographic foil", false,
    Palette{Color{244, 244, 248, 255}, Color{250, 250, 252, 255}, Color{231, 231, 236, 255}, Color{220, 220, 225, 255}, Color{29, 29, 43, 26}, Color{29, 29, 43, 46}, Color{29, 29, 43, 255}, Color{98, 98, 109, 255}, Color{141, 141, 150, 255}, Color{122, 92, 255, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{244, 244, 248, 255}, Color{250, 250, 252, 255}, Color{231, 231, 236, 255}, Color{220, 220, 225, 255}, Color{222, 222, 227, 255}, Color{205, 205, 211, 255}, Color{29, 29, 43, 255}, Color{98, 98, 109, 255}, Color{141, 141, 150, 255}, Color{122, 92, 255, 255}, Color{255, 92, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// woven carbon fibre with a racing red accent
inline constexpr Theme carbon-fiber{ "carbon-fiber", "woven carbon fibre with a racing red accent", true,
    Palette{Color{18, 19, 20, 255}, Color{29, 30, 31, 255}, Color{38, 39, 40, 255}, Color{51, 52, 53, 255}, Color{238, 238, 238, 36}, Color{238, 238, 238, 66}, Color{238, 238, 238, 255}, Color{168, 168, 168, 255}, Color{124, 124, 125, 255}, Color{255, 43, 43, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{18, 19, 20, 255}, Color{29, 30, 31, 255}, Color{38, 39, 40, 255}, Color{51, 52, 53, 255}, Color{49, 50, 51, 255}, Color{75, 76, 76, 255}, Color{238, 238, 238, 255}, Color{168, 168, 168, 255}, Color{124, 124, 125, 255}, Color{255, 43, 43, 255}, Color{255, 255, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Rajdhani\", system-ui, sans-serif", "\"Orbitron\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    0.0f, 0.0f, 0.0f, 0.0f, 1.0f };

/// northern lights rippling over a polar night
inline constexpr Theme aurora-borealis{ "aurora-borealis", "northern lights rippling over a polar night", true,
    Palette{Color{5, 13, 26, 255}, Color{16, 25, 37, 255}, Color{25, 34, 47, 255}, Color{39, 49, 60, 255}, Color{230, 251, 255, 36}, Color{230, 251, 255, 66}, Color{230, 251, 255, 255}, Color{158, 175, 182, 255}, Color{113, 127, 136, 255}, Color{61, 255, 180, 255}, Color{122, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{5, 13, 26, 255}, Color{16, 25, 37, 255}, Color{25, 34, 47, 255}, Color{39, 49, 60, 255}, Color{37, 47, 58, 255}, Color{63, 75, 85, 255}, Color{230, 251, 255, 255}, Color{158, 175, 182, 255}, Color{113, 127, 136, 255}, Color{61, 255, 180, 255}, Color{122, 92, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Manrope\", system-ui, sans-serif", "\"Fraunces\", Georgia, serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// cosmic dust clouds in magenta and cyan
inline constexpr Theme nebula{ "nebula", "cosmic dust clouds in magenta and cyan", true,
    Palette{Color{7, 3, 26, 255}, Color{19, 14, 37, 255}, Color{28, 24, 47, 255}, Color{42, 38, 60, 255}, Color{241, 233, 255, 36}, Color{241, 233, 255, 66}, Color{241, 233, 255, 255}, Color{166, 159, 182, 255}, Color{119, 113, 136, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{7, 3, 26, 255}, Color{19, 14, 37, 255}, Color{28, 24, 47, 255}, Color{42, 38, 60, 255}, Color{40, 35, 58, 255}, Color{68, 63, 85, 255}, Color{241, 233, 255, 255}, Color{166, 159, 182, 255}, Color{119, 113, 136, 255}, Color{255, 79, 216, 255}, Color{79, 210, 255, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Syne\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    4.0f, 4.0f, 6.0f, 8.0f, 1.0f };

/// mirror chrome over a cool blue studio
inline constexpr Theme liquid-chrome{ "liquid-chrome", "mirror chrome over a cool blue studio", false,
    Palette{Color{223, 229, 236, 255}, Color{241, 243, 246, 255}, Color{211, 217, 224, 255}, Color{201, 207, 214, 255}, Color{21, 26, 34, 26}, Color{21, 26, 34, 46}, Color{21, 26, 34, 255}, Color{86, 91, 99, 255}, Color{126, 132, 139, 255}, Color{90, 107, 128, 255}, Color{159, 178, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    Palette{Color{223, 229, 236, 255}, Color{241, 243, 246, 255}, Color{211, 217, 224, 255}, Color{201, 207, 214, 255}, Color{202, 208, 215, 255}, Color{187, 192, 200, 255}, Color{21, 26, 34, 255}, Color{86, 91, 99, 255}, Color{126, 132, 139, 255}, Color{90, 107, 128, 255}, Color{159, 178, 200, 255}, Color{47, 125, 79, 255}, Color{183, 121, 31, 255}, Color{196, 50, 31, 255}, Color{43, 95, 180, 255}},
    "\"Geist\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    8.0f, 8.0f, 12.0f, 16.0f, 1.0f };

/// groovy molten blobs in orange and magenta
inline constexpr Theme lava-lamp{ "lava-lamp", "groovy molten blobs in orange and magenta", true,
    Palette{Color{42, 10, 31, 255}, Color{53, 21, 42, 255}, Color{61, 30, 50, 255}, Color{74, 43, 63, 255}, Color{255, 232, 243, 36}, Color{255, 232, 243, 66}, Color{255, 232, 243, 255}, Color{187, 161, 175, 255}, Color{144, 117, 133, 255}, Color{255, 122, 26, 255}, Color{255, 45, 149, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    Palette{Color{42, 10, 31, 255}, Color{53, 21, 42, 255}, Color{61, 30, 50, 255}, Color{74, 43, 63, 255}, Color{72, 41, 61, 255}, Color{97, 67, 86, 255}, Color{255, 232, 243, 255}, Color{187, 161, 175, 255}, Color{144, 117, 133, 255}, Color{255, 122, 26, 255}, Color{255, 45, 149, 255}, Color{74, 222, 128, 255}, Color{251, 191, 36, 255}, Color{248, 113, 113, 255}, Color{43, 95, 180, 255}},
    "\"Outfit\", system-ui, sans-serif", "\"Unbounded\", system-ui, sans-serif", "\"Geist Mono\", ui-monospace, monospace",
    999.0f, 999.0f, 999.0f, 18.0f, 1.0f };

inline constexpr const Theme* themes[] = { &editorial, &brutal, &neon, &glass, &terminal, &soft, &retro, &swiss, &y2k, &mono, &sketch, &luxe, &paper, &linen, &fog, &porcelain, &newsprint, &blueprint, &sand, &concrete, &graphite, &swiss-red, &midnight, &obsidian, &ink, &deep-sea, &forest-night, &espresso, &plum, &vampire, &nord-night, &charcoal, &lavender, &mint, &peach, &sakura, &sky, &lemon, &bubblegum, &seafoam, &tangerine, &cobalt, &magenta, &risograph, &pop-art, &bauhaus, &memphis, &brutal-lime, &amber-crt, &gameboy, &vaporwave, &synthwave, &arcade, &teletext, &polaroid, &win-classic, &moss, &ocean, &desert, &glacier, &autumn, &volcano, &pearl, &black-pearl, &sapphire-metal, &fade, &doppler, &emerald, &ruby, &marble-fade, &case-hardened, &tiger-tooth, &damascus, &crimson-web, &chameleon, &candy-apple, &anodized, &titanium, &gunmetal, &rose-gold, &gold-leaf, &holo-foil, &carbon-fiber, &aurora-borealis, &nebula, &liquid-chrome, &lava-lamp };

inline constexpr int themeCount = 87;

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
