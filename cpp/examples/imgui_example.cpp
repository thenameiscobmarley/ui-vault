// Dear ImGui: include imgui.h first, then uivault.hpp, then call apply() once.
#include <imgui.h>
#include "../uivault.hpp"

void setupStyle(const char* themeName) {
    if (const uivault::Theme* t = uivault::find(themeName)) uivault::imgui::apply(*t);
    else uivault::imgui::apply(uivault::editorial);
}

void drawPanel(float& volume, bool& enabled) {
    ImGui::Begin("UI Vault");
    ImGui::TextDisabled("Theme: %s", uivault::neon.name);
    ImGui::Checkbox("Enabled", &enabled);
    ImGui::SliderFloat("Volume", &volume, 0.0f, 1.0f);
    if (ImGui::Button("Apply brutal")) uivault::imgui::apply(uivault::brutal);
    ImGui::End();
}
