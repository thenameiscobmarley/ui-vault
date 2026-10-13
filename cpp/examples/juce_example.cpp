// JUCE: include JuceHeader.h (or juce_gui_basics) first, then uivault.hpp.
#include <juce_gui_basics/juce_gui_basics.h>
#include "../uivault.hpp"

class ThemedPanel : public juce::Component {
public:
    ThemedPanel() {
        setLookAndFeel(&lf);
        for (auto* c : std::initializer_list<juce::Component*>{ &button, &slider, &toggle, &themes }) addAndMakeVisible(c);
        button.setButtonText("Primary");
        toggle.setButtonText("Enabled");
        slider.setRange(0.0, 1.0);
        for (int i = 0; i < uivault::themeCount; ++i) themes.addItem(uivault::themes[i]->name, i + 1);
        themes.onChange = [this] { lf.setTheme(*uivault::themes[themes.getSelectedId() - 1]); repaint(); sendLookAndFeelChange(); };
        themes.setSelectedId(1, juce::dontSendNotification);
        setSize(420, 220);
    }
    ~ThemedPanel() override { setLookAndFeel(nullptr); }
    void paint(juce::Graphics& g) override { g.fillAll(findColour(juce::ResizableWindow::backgroundColourId)); }
    void resized() override {
        auto r = getLocalBounds().reduced(20);
        themes.setBounds(r.removeFromTop(30)); r.removeFromTop(16);
        button.setBounds(r.removeFromTop(34).removeFromLeft(140)); r.removeFromTop(12);
        toggle.setBounds(r.removeFromTop(26)); r.removeFromTop(8);
        slider.setBounds(r.removeFromTop(30));
    }
private:
    uivault::juce_lf::LookAndFeel lf { uivault::neon };
    juce::TextButton button; juce::Slider slider { juce::Slider::LinearHorizontal, juce::Slider::NoTextBox };
    juce::ToggleButton toggle; juce::ComboBox themes;
};
