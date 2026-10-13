// UiVault3 for Qt 6 (C++) — the UI Vault designs as real, custom-painted widgets.
// Same class names and data as the PySide6 package. Add uivault3.cpp + uivault3_data.cpp to your target (Qt6::Widgets).
//
//   #include "uivault3.h"
//   uv3::apply(app, uv3::Look{}.kit("deep-metal"));
//   auto* b = new uv3::Button("Save", true);
//   uv3::apply(app, uv3::Look{}.theme("neon").part("btn", "pearl").layer("btn", "glow", "neon"));
//
// MIT · https://thenameiscobmarley.github.io/ui-vault/
#pragma once
#include <QAbstractButton>
#include <QDialog>
#include <QFrame>
#include <QJsonObject>
#include <QLineEdit>
#include <QPainter>
#include <QProgressBar>
#include <QSlider>
#include <QTabBar>
#include <QVariantAnimation>
#include <QWidget>
#include <map>
#include <memory>
#include <set>
#include <vector>

class QApplication;

namespace uv3 {

// ── what to apply ────────────────────────────────────────────────────────────
struct Look {
    QString themeName, kitName;
    std::map<QString, QString> parts;          // family → design ("btn" → "pearl")
    QJsonObject layers;                        // same JSON as the website: {"btn": {"glow": {"o": "neon", "s": 18}}}
    Look& theme(const QString& t) { themeName = t; return *this; }
    Look& kit(const QString& k) { kitName = k; return *this; }
    Look& part(const QString& family, const QString& design) { parts[family] = design; return *this; }
    Look& layer(const QString& type, const QString& kind, const QString& option, const QString& colour = {}, double size = -1);
};

/// Apply a look to every UiVault3 widget (and a matching palette/font to the app if given).
void apply(QApplication* app, const Look& look);
/// Apply a style exported from the website (JSON with theme / parts / layers).
void load(QApplication* app, const QByteArray& json);
QStringList themes();
QStringList kits();
QStringList families();
QStringList parts(const QString& family);

// ── engine (public so you can paint designs in your own widgets) ─────────────
struct Shadow { bool inset; double x, y, blur, spread; QColor color; };
struct Layer { QString kind; QStringList args, size, pos; bool repeat = true, padding = false; };
struct Anim { double bgx = -1, angle = 0, dx = 0, dy = 0, sx = 1, sy = 1, rot = 0, opacity = 1, roll = 0; };

class Style {
public:
    Style(const std::map<QString, QString>& decl, const std::map<QString, QString>& vars, const QColor& fg);
    QString get(const QString& k, const QString& d = {}) const { auto it = decl.find(k); return it == decl.end() ? d : it->second; }
    std::map<QString, QString> decl;
    QColor color; std::vector<Layer> layers; QColor bgColor; bool hasBg = false, textClip = false;
    double bw[4] = {0, 0, 0, 0}; QString bstyle[4]; QColor bcol[4];
    QString radius, clip, mask; std::vector<Shadow> shadows, drops, textShadows;
    double bright = 1, opacity = 1; bool outline = false; double outlineW = 0, outlineOffset = 0; QString outlineStyle; QColor outlineColor;
    int weight = 0; QString family; bool italic = false, upper = false; QString tracking;
    bool stroke = false; double strokeW = 0; QColor strokeColor; bool transparentText = false, strokeFirst = false;
    struct A { QString name; double dur; bool inf; }; std::vector<A> anims;
    QString transform, translate, scale, rotate;
    bool hasContent = false, absolute = false; QString content;
    std::map<QString, QString> geom, padding;
    std::vector<std::pair<double, double>> radii(const QRectF& r) const;
    QFont font(const QFont& base, double px = 0) const;
};

Anim animState(const Style& s, double t);
QPainterPath shapeOf(const Style& s, const QRectF& r);
void paintBox(QPainter& p, const Style& s, const QRectF& r, const Anim& a = {}, double opacity = 1);
double paintText(QPainter& p, const Style& s, const QRectF& r, QString text, const QFont& f, int align = Qt::AlignCenter, const Anim& a = {}, double opacity = 1);
double length(const QString& s, double ref = 0, double em = 14);

/// The global look; widgets connect to changed().
class UiStyle : public QObject {
    Q_OBJECT
public:
    static UiStyle& get();
    void set(const Look& look);
    const Style& style(const QString& fam, const QString& sub, const std::set<QString>& flags, const std::map<QString, QString>& vars = {});
    QColor color(const QString& token) const;
    QString resolve(const QString& css) const;   // var(--uv-*) → the theme's values
    QString fontFamily(const QString& which = "font") const;
    QJsonObject extras(const QString& fam) const;   // enter / ripple / ring for the family's layers
    QString theme = "editorial";
    std::map<QString, QString> parts;
    QJsonObject layers;
signals:
    void changed();
private:
    UiStyle();
    std::map<QString, QString> vars;
    std::map<QString, std::unique_ptr<Style>> cache;
};

// ── widgets ──────────────────────────────────────────────────────────────────
class UvBox {   // shared hover / animation behaviour
protected:
    void boxInit(QWidget* w, const QString& fam, int bleed);
    void paintStates(QPainter& p, const QRectF& r, const QString& sub, std::set<QString> flags, const std::map<QString, QString>& vars = {});
    void applyTransform(QPainter& p, const QRectF& r, const Style& s0, const Style& s1, const Style* active = nullptr);
    void paintRing(QPainter& p, const QRectF& r, const Style& s);
    void needsTick(bool busy);
    void hoverTo(bool on);
    QWidget* self = nullptr; QString fam; int bleed = 8; double h = 0; QVariantAnimation* hanim = nullptr;
    double enterT0 = -1; std::vector<QPointF> rippleAt; std::vector<double> rippleT;
};

class Button : public QAbstractButton, protected UvBox {
    Q_OBJECT
public:
    explicit Button(const QString& text = {}, bool primary = false, const QString& size = "md", QWidget* parent = nullptr);
    bool primary; QString sizeName; bool loading = false;
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override; void enterEvent(QEnterEvent*) override; void leaveEvent(QEvent*) override; void mousePressEvent(QMouseEvent*) override;
};

class Card : public QFrame, protected UvBox {
    Q_OBJECT
public:
    explicit Card(QWidget* parent = nullptr, int padding = 20);
protected:
    void paintEvent(QPaintEvent*) override; void enterEvent(QEnterEvent*) override; void leaveEvent(QEvent*) override;
    void restyle(); int pad;
};

class LineEdit : public QLineEdit, protected UvBox {
    Q_OBJECT
public:
    explicit LineEdit(const QString& text = {}, const QString& placeholder = {}, QWidget* parent = nullptr);
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override; void restyle();
};

class Switch : public QAbstractButton, protected UvBox {
    Q_OBJECT
public:
    explicit Switch(const QString& text = {}, bool checked = false, QWidget* parent = nullptr);
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override; double c = 0; QVariantAnimation* canim;
};

class CheckBox : public QAbstractButton, protected UvBox {
    Q_OBJECT
public:
    explicit CheckBox(const QString& text = {}, bool checked = false, bool radio = false, QWidget* parent = nullptr);
    QSize sizeHint() const override; bool radio;
protected:
    void paintEvent(QPaintEvent*) override;
};
class RadioButton : public CheckBox { public: explicit RadioButton(const QString& t = {}, bool c = false, QWidget* p = nullptr) : CheckBox(t, c, true, p) {} };

class Slider : public QSlider, protected UvBox {
    Q_OBJECT
public:
    explicit Slider(int value = 50, int min = 0, int max = 100, QWidget* parent = nullptr);
    QSize sizeHint() const override { return {220, 34}; }
protected:
    void paintEvent(QPaintEvent*) override;
};

class TabBar : public QTabBar, protected UvBox {
    Q_OBJECT
public:
    explicit TabBar(const QStringList& tabs = {}, QWidget* parent = nullptr);
protected:
    QSize tabSizeHint(int i) const override; void paintEvent(QPaintEvent*) override; QRectF ind; QVariantAnimation* ianim;
};

class ProgressBar : public QProgressBar, protected UvBox {
    Q_OBJECT
public:
    explicit ProgressBar(int value = 0, QWidget* parent = nullptr);
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override;
};

class Spinner : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit Spinner(int size = 28, QWidget* parent = nullptr);
    QSize sizeHint() const override;
protected:
    void paintEvent(QPaintEvent*) override; int s;
};

class Badge : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit Badge(const QString& text = {}, const QString& kind = "accent", QWidget* parent = nullptr);
    QSize sizeHint() const override; QString text, kind;
protected:
    void paintEvent(QPaintEvent*) override;
};

class Alert : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit Alert(const QString& text = {}, const QString& kind = "info", bool toast = false, QWidget* parent = nullptr);
    QSize sizeHint() const override { return {320, 60}; } QString text, kind; bool toast;
protected:
    void paintEvent(QPaintEvent*) override;
};

class Heading : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit Heading(const QString& text = {}, int size = 44, QWidget* parent = nullptr);
    QSize sizeHint() const override; QString text; int px;
protected:
    void paintEvent(QPaintEvent*) override;
};

class NavBar : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit NavBar(const QStringList& items = {}, int current = 0, bool vertical = false, QWidget* parent = nullptr);
    QSize sizeHint() const override; QStringList items; int current; bool vertical;
signals:
    void currentChanged(int);
protected:
    void paintEvent(QPaintEvent*) override; void mouseMoveEvent(QMouseEvent*) override; void mousePressEvent(QMouseEvent*) override; void leaveEvent(QEvent*) override;
    std::vector<QRectF> rects() const; int hi = -1;
};

class Surface : public QWidget, protected UvBox {
    Q_OBJECT
public:
    explicit Surface(QWidget* parent = nullptr);
protected:
    void paintEvent(QPaintEvent*) override;
};

class Dialog : public QDialog, protected UvBox {
    Q_OBJECT
public:
    explicit Dialog(QWidget* parent = nullptr);
protected:
    void paintEvent(QPaintEvent*) override;
};

}  // namespace uv3
