// UiVault3 C++ gallery:  ./uivault3_gallery [kit] [screenshot.png]
#include <QApplication>
#include <QComboBox>
#include <QGridLayout>
#include <QHBoxLayout>
#include <QLabel>
#include "uivault3.h"

int main(int argc, char** argv) {
    QApplication app(argc, argv);
    uv3::apply(&app, uv3::Look{}.kit(argc > 1 ? argv[1] : "deep-metal"));
    auto* root = new uv3::Surface;
    auto* outer = new QVBoxLayout(root); outer->setContentsMargins(24, 18, 24, 18);
    auto* bar = new QHBoxLayout; outer->addLayout(bar);
    bar->addWidget(new uv3::Heading("UiVault3 C++", 40)); bar->addStretch(1);
    auto* kit = new QComboBox; kit->addItems(uv3::kits()); kit->setCurrentText(argc > 1 ? argv[1] : "deep-metal"); bar->addWidget(new QLabel("Kit")); bar->addWidget(kit);
    QObject::connect(kit, &QComboBox::currentTextChanged, [&](const QString& k) { uv3::apply(&app, uv3::Look{}.kit(k)); });
    auto* grid = new QGridLayout; outer->addLayout(grid); grid->setHorizontalSpacing(18);
    grid->addWidget(new uv3::NavBar({"Home", "Projects", "Team", "Settings"}), 0, 0, 1, 2);
    grid->addWidget(new uv3::TabBar({"Overview", "Activity", "Settings"}), 0, 2);
    auto* row = new QHBoxLayout; row->addWidget(new uv3::Button("Primary", true)); row->addWidget(new uv3::Button("Secondary")); row->addWidget(new uv3::Button("Small", true, "sm")); row->addStretch(1); grid->addLayout(row, 1, 0, 1, 2);
    auto* badges = new QHBoxLayout; for (auto [t, k] : {std::pair{"New", "accent"}, {"Live", "success"}, {"Beta", "warn"}, {"3 issues", "danger"}}) badges->addWidget(new uv3::Badge(t, k)); badges->addStretch(1); grid->addLayout(badges, 1, 2);
    auto* card = new uv3::Card; card->layout()->addWidget(new QLabel("<b>Weekly report</b>")); card->layout()->addWidget(new QLabel("12 new sign-ups and 3 issues closed.")); card->layout()->addWidget(new uv3::ProgressBar(68)); grid->addWidget(card, 2, 0);
    auto* form = new QVBoxLayout; form->addWidget(new uv3::LineEdit("", "you@example.com")); form->addWidget(new uv3::Slider(62));
    auto* sw = new QHBoxLayout; sw->addWidget(new uv3::Switch("Notifications", true)); sw->addWidget(new uv3::Switch("Auto-update")); form->addLayout(sw);
    auto* ck = new QHBoxLayout; ck->addWidget(new uv3::CheckBox("Remember me", true)); ck->addWidget(new uv3::RadioButton("Daily", true)); ck->addWidget(new uv3::RadioButton("Weekly")); form->addLayout(ck);
    grid->addLayout(form, 2, 1);
    auto* side = new QVBoxLayout; side->addWidget(new uv3::Alert("Saved. Your changes are live.", "success")); side->addWidget(new uv3::Alert("Upload failed, try again", "danger", true));
    auto* sp = new QHBoxLayout; sp->addWidget(new uv3::Spinner(28)); sp->addWidget(new uv3::Spinner(40)); sp->addStretch(1); side->addLayout(sp); grid->addLayout(side, 2, 2);
    outer->addStretch(1);
    root->resize(1180, 640); root->show();
    if (argc > 2) { app.processEvents(); root->grab().save(argv[2]); return 0; }
    return app.exec();
}
