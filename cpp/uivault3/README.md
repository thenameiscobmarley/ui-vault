# UiVault3 for Qt 6 (C++)

These are real, custom-painted widgets that use the same designs as the website and the PySide6 package (`uivault3`).
They're painted from the actual gradients, shadows and animations, not stylesheet approximations.

Add `uivault3.h`, `uivault3.cpp` and `uivault3_data.cpp` to a Qt 6 Widgets target with AUTOMOC on (see `CMakeLists.txt`).

```cpp
#include "uivault3.h"
uv3::apply(&app, uv3::Look{}.kit("deep-metal"));
auto* save = new uv3::Button("Save", true);
uv3::apply(&app, uv3::Look{}.theme("neon").part("btn", "pearl").layer("btn", "glow", "neon", "accent", 18));
uv3::load(&app, file.readAll());    // a my-style.json exported from the website
```

**Widgets:** Button, Card, LineEdit, Switch, CheckBox, RadioButton, Slider, TabBar, ProgressBar, Spinner, Badge, Alert, Heading, NavBar, Surface, Dialog.

To build the gallery: `cmake -B build && cmake --build build && ./build/uivault3_gallery pearl`
