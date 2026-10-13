// raylib + raygui: define RAYGUI_IMPLEMENTATION in exactly one file, include raygui.h, then uivault.hpp.
#include <raylib.h>
#define RAYGUI_IMPLEMENTATION
#include "raygui.h"
#include "../uivault.hpp"

int main() {
    InitWindow(480, 260, "UI Vault + raygui");
    uivault::raygui::apply(uivault::retro);
    float value = 0.5f; bool check = true;
    while (!WindowShouldClose()) {
        BeginDrawing();
        ClearBackground(GetColor(GuiGetStyle(DEFAULT, BACKGROUND_COLOR)));
        if (GuiButton({ 20, 20, 140, 32 }, "Neon")) uivault::raygui::apply(uivault::neon);
        if (GuiButton({ 170, 20, 140, 32 }, "Retro")) uivault::raygui::apply(uivault::retro);
        GuiCheckBox({ 20, 70, 20, 20 }, "Enabled", &check);
        GuiSlider({ 20, 110, 300, 20 }, nullptr, nullptr, &value, 0, 1);
        EndDrawing();
    }
    CloseWindow();
}
