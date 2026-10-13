# uivault.hpp (C++)

One header, no dependencies, C++17. The 12 UI Vault themes as `constexpr` data plus adapters that turn on
automatically when you include the toolkit first.

```cpp
#include <imgui.h>              // or <JuceHeader.h>, or "raygui.h" — before uivault.hpp
#include "uivault.hpp"

uivault::imgui::apply(uivault::neon);                         // Dear ImGui
uivault::juce_lf::LookAndFeel lf { uivault::luxe };           // JUCE
setLookAndFeel (&lf);
uivault::raygui::apply(uivault::retro);                       // raylib + raygui
app.setStyleSheet(QString::fromStdString(uivault::qss(uivault::swiss)));   // Qt

const uivault::Theme* t = uivault::find("brutal");            // look up by name
t->color.accent.hex();   t->solid.surface.abgr();   t->radius;
```

`color` keeps the designed alpha; `solid` has alpha pre-blended over the background for toolkits without transparency.
`Color` converts to `rgba()`, `argb()` (JUCE), `abgr()` (ImGui IM_COL32), `hex()` and `css()`.

Examples in `examples/`: `swatches.cpp` (prints every theme in your terminal), `imgui_example.cpp`, `juce_example.cpp`, `raygui_example.cpp`.

```sh
g++ -std=c++17 examples/swatches.cpp -o swatches && ./swatches
```

Generated from the web themes by `tools/build.py` — don't edit by hand. MIT.
