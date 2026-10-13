// UiVault3 for Qt 6 — implementation. MIT.
#include "uivault3.h"

#include <QApplication>
#include <QElapsedTimer>
#include <QEnterEvent>
#include <QJsonArray>
#include <QJsonDocument>
#include <QMouseEvent>
#include <QPainterPath>
#include <QRegularExpression>
#include <QTimer>
#include <QVBoxLayout>
#include <cmath>
#include <functional>

namespace uv3 {
extern const char* const kNative[];   // uivault3_data.cpp (generated)
extern const char* const kTokens[];
extern const char* const kLayers[];

namespace {
using Map = std::map<QString, QString>;
QByteArray joinChunks(const char* const* c) { QByteArray b; for (; *c; ++c) b += *c; return b; }
const QJsonObject& native() { static QJsonObject o = QJsonDocument::fromJson(joinChunks(kNative)).object(); return o; }
const QJsonObject& tokens() { static QJsonObject o = QJsonDocument::fromJson(joinChunks(kTokens)).object()["themes"].toObject(); return o; }
const QJsonObject& layerDefs() { static QJsonObject o = QJsonDocument::fromJson(joinChunks(kLayers)).object(); return o; }
double now() { static QElapsedTimer t; if (!t.isValid()) t.start(); return t.nsecsElapsed() / 1e9; }
QRegularExpression re(const char* s) { return QRegularExpression(QString::fromUtf8(s)); }

QStringList splitTop(const QString& s, QChar sep = ',') {
    QStringList out; int depth = 0; QString cur;
    for (QChar ch : s) {
        if (ch == '(') depth++; else if (ch == ')') depth--;
        if (ch == sep && depth == 0) { out << cur.trimmed(); cur.clear(); } else cur += ch;
    }
    if (!cur.trimmed().isEmpty()) out << cur.trimmed();
    return out;
}
QStringList splitWs(const QString& s) {
    QStringList out; int depth = 0; QString cur;
    for (QChar ch : s) {
        if (ch == '(') depth++; else if (ch == ')') depth--;
        if (ch.isSpace() && depth == 0) { if (!cur.isEmpty()) { out << cur; cur.clear(); } } else cur += ch;
    }
    if (!cur.isEmpty()) out << cur;
    return out;
}
}  // namespace

// ── colours & lengths ────────────────────────────────────────────────────────
static QColor parseColor(QString s, const QColor& cur, bool* ok = nullptr) {
    s = s.trimmed(); const QString low = s.toLower(); if (ok) *ok = true;
    if (low == "transparent") return QColor(0, 0, 0, 0);
    if (low == "white") return Qt::white;
    if (low == "black") return Qt::black;
    if (low == "currentcolor") return cur;
    if (s.startsWith('#')) {
        QString h = s.mid(1);
        if (h.size() == 3 || h.size() == 4) { QString e; for (QChar c : h) e += QString(2, c); h = e; }
        if (h.size() == 6) return QColor("#" + h);
        if (h.size() == 8) { QColor c("#" + h.left(6)); c.setAlpha(h.mid(6).toInt(nullptr, 16)); return c; }
    }
    auto m = re(R"(^rgba?\(([^)]*)\)$)").match(s);
    if (m.hasMatch()) {
        auto p = m.captured(1).split(re(R"([\s,/]+)"), Qt::SkipEmptyParts);
        QColor c(p.value(0).toDouble(), p.value(1).toDouble(), p.value(2).toDouble());
        if (p.size() > 3) c.setAlphaF(p[3].endsWith('%') ? p[3].chopped(1).toDouble() / 100 : p[3].toDouble());
        return c;
    }
    if (s.startsWith("color-mix(")) {
        QString inner = s.mid(10, s.size() - 11);
        auto parts = splitTop(inner);
        if (parts.size() >= 3) {
            auto part = [&](const QString& x, double& pct) { auto t = splitWs(x); pct = -1; if (!t.isEmpty() && t.last().endsWith('%')) { pct = t.last().chopped(1).toDouble(); t.removeLast(); } return parseColor(t.join(' '), cur); };
            double pa, pb; QColor ca = part(parts[1], pa), cb = part(parts[2], pb);
            if (pa < 0 && pb < 0) pa = pb = 50; else if (pa < 0) pa = 100 - pb; else if (pb < 0) pb = 100 - pa;
            double tot = pa + pb; if (tot <= 0) tot = 1; double wa = pa / tot;
            double aa = ca.alphaF(), ab = cb.alphaF(), al = aa * wa + ab * (1 - wa);
            if (al <= 0) return QColor(0, 0, 0, 0);
            auto ch = [&](double x, double y) { return int(std::round((x * aa * wa + y * ab * (1 - wa)) / al)); };
            QColor o(ch(ca.red(), cb.red()), ch(ca.green(), cb.green()), ch(ca.blue(), cb.blue()));
            o.setAlphaF(std::min(1.0, al * std::min(1.0, tot / 100))); return o;
        }
    }
    if (ok) *ok = false;
    return QColor();
}

double length(const QString& in, double ref, double em) {
    QString s = in.trimmed();
    if (s.isEmpty() || s == "auto" || s == "none") return 0;
    if (s.startsWith("calc(")) {   // calc(100% - 12px) / calc(var * 1.8)
        QString e = s.mid(5, s.size() - 6);
        auto m = re(R"(^\s*(-?[\d.]+)(%|px)?\s*([-+*])\s*(-?[\d.]+)(%|px)?\s*$)").match(e);
        if (!m.hasMatch()) return 0;
        auto v = [&](int i) { double x = m.captured(i).toDouble(); return m.captured(i + 1) == "%" ? x * ref / 100 : x; };
        double a = v(1), b = v(4); QString op = m.captured(3);
        return op == "-" ? a - b : op == "+" ? a + b : a * b;
    }
    auto m = re(R"(^(-?[\d.]+)(px|%|em|deg)?$)").match(s);
    if (!m.hasMatch()) return 0;
    double v = m.captured(1).toDouble();
    return m.captured(2) == "%" ? v * ref / 100 : m.captured(2) == "em" ? v * em : v;
}

static QString resolveVars(QString s, const Map& vars) {
    static const QRegularExpression rx(R"(var\(\s*(--[\w-]+)\s*(?:,\s*((?:[^()]|\([^()]*\))*))?\))");
    for (int depth = 0; depth < 6 && s.contains("var("); ++depth) {
        QString out; int last = 0; auto it = rx.globalMatch(s);
        while (it.hasNext()) {
            auto m = it.next(); out += s.mid(last, m.capturedStart() - last);
            auto f = vars.find(m.captured(1)); out += f != vars.end() ? f->second : m.captured(2).trimmed();
            last = m.capturedEnd();
        }
        out += s.mid(last); if (out == s) break; s = out;
    }
    return s;
}

// ── cascade with shorthand expansion ─────────────────────────────────────────
static const char* SIDES[4] = {"top", "right", "bottom", "left"};
static QStringList four(QStringList v) {
    if (v.size() == 1) return {v[0], v[0], v[0], v[0]};
    if (v.size() == 2) return {v[0], v[1], v[0], v[1]};
    if (v.size() == 3) return {v[0], v[1], v[2], v[1]};
    return v.mid(0, 4);
}
static Map mergeDecls(const std::vector<const QJsonObject*>& decls) {
    Map d;
    for (auto* o : decls) for (auto it = o->begin(); it != o->end(); ++it) {
        QString k = it.key(), v = it.value().toString(); v.remove(re(R"(\s*!important$)"));
        if (k == "background") { d.erase("background-image"); d.erase("background-color"); d.erase("background-size"); d.erase("background-position"); d[k] = v; }
        else if (k == "border") { for (auto sd : SIDES) d[QString("border-%1").arg(sd)] = v; }
        else if (k == "border-color") { auto f = four(splitWs(v)); for (int i = 0; i < 4; ++i) d[QString("border-%1-color").arg(SIDES[i])] = f[i]; }
        else if (k == "border-width") { auto f = four(splitWs(v)); for (int i = 0; i < 4; ++i) d[QString("border-%1-width").arg(SIDES[i])] = f[i]; }
        else if (k == "padding") { auto f = four(splitWs(v)); for (int i = 0; i < 4; ++i) d[QString("padding-%1").arg(SIDES[i])] = f[i]; }
        else if (k == "padding-inline") { d["padding-left"] = d["padding-right"] = v; }
        else if (k == "inset") { auto f = four(splitWs(v)); for (int i = 0; i < 4; ++i) d[SIDES[i]] = f[i]; }
        else if (k == "font") {
            for (auto& x : splitWs(v)) {
                if (re(R"(^\d{3}$)").match(x).hasMatch()) d["font-weight"] = x;
                else if (x == "italic") d["font-style"] = x;
                else if (x.startsWith("var(") || x.startsWith('"')) d["font-family"] = x;
            }
        } else d[k] = v;
    }
    return d;
}

static std::vector<Shadow> parseShadows(const QString& v, const QColor& cur) {
    std::vector<Shadow> out; if (v.isEmpty() || v == "none") return out;
    for (auto& part : splitTop(v)) {
        auto t = splitWs(part); Shadow s{t.contains("inset"), 0, 0, 0, 0, cur}; t.removeAll("inset");
        std::vector<double> n;
        for (auto& x : t) { bool ok; QColor c = parseColor(x, cur, &ok); if (ok && !re(R"(^-?[\d.])").match(x).hasMatch()) s.color = c; else n.push_back(QString(x).remove("px").toDouble()); }
        n.resize(4, 0); s.x = n[0]; s.y = n[1]; s.blur = std::max(0.0, n[2]); s.spread = n[3]; out.push_back(s);
    }
    return out;
}

static std::vector<Layer> parseBackground(const QString& v, const QColor& cur, QColor& base, bool& hasBase) {
    std::vector<Layer> out; if (v.isEmpty() || v == "none") return out;
    for (auto& raw : splitTop(v)) {
        auto m = re(R"(^((?:repeating-)?(?:linear|radial|conic)-gradient)\()").match(raw);
        if (!m.hasMatch()) { for (auto& t : splitWs(raw)) { bool ok; QColor c = parseColor(t, cur, &ok); if (ok) { base = c; hasBase = true; } } continue; }
        Layer L; L.kind = m.captured(1);
        int depth = 0, end = -1;
        for (int i = 0; i < raw.size(); ++i) { if (raw[i] == '(') depth++; else if (raw[i] == ')' && --depth == 0) { end = i; break; } }
        L.args = splitTop(raw.mid(L.kind.size() + 1, end - L.kind.size() - 1));
        QString rest = raw.mid(end + 1); rest.replace("/", " / ");
        bool after = false;
        for (auto& t : splitWs(rest)) {
            if (t == "/") after = true; else if (t == "no-repeat") L.repeat = false; else if (t.startsWith("repeat")) L.repeat = true;
            else if (t == "padding-box" || t == "content-box") L.padding = true; else if (t == "border-box" || t == "fixed") {}
            else { bool ok; QColor c = parseColor(t, cur, &ok); if (ok && !re(R"(^-?[\d.])").match(t).hasMatch()) { base = c; hasBase = true; } else (after ? L.size : L.pos) << t; }
        }
        out.push_back(L);
    }
    return out;
}

Style::Style(const Map& d, const Map& vars, const QColor& fg) {
    for (auto& [k, v] : d) decl[k] = resolveVars(v, vars);
    bool ok; color = get("color").isEmpty() ? fg : parseColor(get("color"), fg, &ok); if (!color.isValid()) color = fg;
    QColor cur = color;
    layers = parseBackground(get("background"), cur, bgColor, hasBg);
    if (!get("background-image").isEmpty()) { QColor dummy; bool hb = false; layers = parseBackground(get("background-image"), cur, dummy, hb); }
    if (!get("background-color").isEmpty()) { bgColor = parseColor(get("background-color"), cur); hasBg = bgColor.isValid(); }
    for (auto& L : layers) {
        if (!get("background-size").isEmpty()) L.size = splitWs(splitTop(get("background-size")).value(0));
        if (!get("background-position").isEmpty()) L.pos = splitWs(splitTop(get("background-position")).value(0));
    }
    textClip = (get("-webkit-background-clip") + get("background-clip")).contains("text");
    for (int i = 0; i < 4; ++i) {
        bw[i] = 0; bstyle[i] = "solid"; bcol[i] = cur;
        for (auto& t : splitWs(get(QString("border-%1").arg(SIDES[i])))) {
            if (re(R"(^[\d.]+(px)?$)").match(t).hasMatch()) bw[i] = QString(t).remove("px").toDouble();
            else if (QStringList{"solid", "dashed", "dotted", "double", "none"}.contains(t)) bstyle[i] = t;
            else { bool o; QColor c = parseColor(t, cur, &o); if (o) bcol[i] = c; }
        }
        if (bstyle[i] == "none") bw[i] = 0;
        if (!get(QString("border-%1-width").arg(SIDES[i])).isEmpty()) bw[i] = length(get(QString("border-%1-width").arg(SIDES[i])));
        if (!get(QString("border-%1-color").arg(SIDES[i])).isEmpty()) bcol[i] = parseColor(get(QString("border-%1-color").arg(SIDES[i])), cur);
    }
    radius = get("border-radius", "0"); clip = get("clip-path"); mask = get("-webkit-mask", get("mask"));
    shadows = parseShadows(get("box-shadow"), cur); textShadows = parseShadows(get("text-shadow"), cur);
    auto fit = re(R"(drop-shadow\(((?:[^()]|\([^()]*\))*)\))").globalMatch(get("filter"));
    while (fit.hasNext()) for (auto s : parseShadows(fit.next().captured(1), cur)) { s.inset = false; s.spread = 0; drops.push_back(s); }
    auto bm = re(R"(brightness\(([\d.]+)\))").match(get("filter")); if (bm.hasMatch()) bright = bm.captured(1).toDouble();
    if (re(R"(^[\d.]+$)").match(get("opacity", "1")).hasMatch()) opacity = get("opacity", "1").toDouble();
    if (!get("outline").isEmpty() && get("outline") != "none") {
        for (auto& t : splitWs(get("outline"))) { if (re(R"(^[\d.]+(px)?$)").match(t).hasMatch()) outlineW = QString(t).remove("px").toDouble(); else if (QStringList{"solid", "dashed", "dotted", "double"}.contains(t)) outlineStyle = t; else { bool o; QColor c = parseColor(t, cur, &o); if (o) outlineColor = c; } }
        outline = outlineW > 0; outlineOffset = length(get("outline-offset", "0"));
        if (!outlineColor.isValid()) outlineColor = cur;
    }
    weight = get("font-weight").toInt(); family = get("font-family"); italic = get("font-style") == "italic"; upper = get("text-transform") == "uppercase"; tracking = get("letter-spacing");
    if (!get("-webkit-text-stroke").isEmpty()) { auto t = splitWs(get("-webkit-text-stroke")); stroke = true; strokeW = length(t.value(0)); strokeColor = t.size() > 1 ? parseColor(t[1], cur) : cur; }
    transparentText = get("color") == "transparent" || get("-webkit-text-fill-color") == "transparent";
    strokeFirst = get("paint-order").contains("stroke");
    if (!get("animation").isEmpty() && get("animation") != "none") for (auto& a : splitTop(get("animation"))) {
        A an{"", 1.0, false};
        for (auto& t : splitWs(a)) {
            if (re(R"(^[\d.]+m?s$)").match(t).hasMatch()) { if (an.dur == 1.0) an.dur = t.endsWith("ms") ? t.chopped(2).toDouble() / 1000 : t.chopped(1).toDouble(); }
            else if (t == "infinite") an.inf = true;
            else if (an.name.isEmpty() && !QStringList{"linear", "ease", "ease-in-out", "both", "forwards", "alternate"}.contains(t) && !t.startsWith("steps") && !t.startsWith("cubic") && !t.startsWith("var(")) an.name = t;
        }
        anims.push_back(an);
    }
    transform = get("transform"); translate = get("translate"); scale = get("scale"); rotate = get("rotate");
    if (decl.count("content") && get("content") != "none") { hasContent = true; content = get("content"); if (content.size() >= 2 && (content[0] == '"' || content[0] == '\'')) content = content.mid(1, content.size() - 2); else content.clear(); }
    absolute = get("position") == "absolute";
    for (auto k : {"top", "left", "right", "bottom", "width", "height", "margin-top"}) if (!get(k).isEmpty()) geom[k] = get(k);
    for (auto sd : SIDES) if (!get(QString("padding-%1").arg(sd)).isEmpty()) padding[sd] = get(QString("padding-%1").arg(sd));
}

std::vector<std::pair<double, double>> Style::radii(const QRectF& r) const {
    QString hp = radius.section('/', 0, 0), vp = radius.contains('/') ? radius.section('/', 1, 1) : hp;
    auto hs = four(splitWs(hp)), vs = four(splitWs(vp));
    std::vector<std::pair<double, double>> out;
    for (int i = 0; i < 4; ++i) out.push_back({length(hs.value(i), r.width()), length(vs.value(i), r.height())});
    double f = 1;
    auto chk = [&](double s, double tot) { if (s > tot && tot > 0) f = std::min(f, tot / s); };
    chk(out[0].first + out[1].first, r.width()); chk(out[3].first + out[2].first, r.width());
    chk(out[0].second + out[3].second, r.height()); chk(out[1].second + out[2].second, r.height());
    for (auto& p : out) { p.first *= f; p.second *= f; }
    return out;
}

QFont Style::font(const QFont& base, double px) const {
    QFont f(base);
    if (!family.isEmpty()) { QString fam = splitTop(family).value(0).trimmed(); fam.remove('"').remove('\''); if (!fam.startsWith("var(") && !fam.isEmpty()) f.setFamily(fam); }
    if (weight) f.setWeight(QFont::Weight(std::clamp(weight, 100, 900)));
    if (italic) f.setItalic(true);
    if (px > 0) f.setPixelSize(int(px));
    if (!tracking.isEmpty()) { double em = f.pixelSize() > 0 ? f.pixelSize() : f.pointSizeF() * 1.33; f.setLetterSpacing(QFont::AbsoluteSpacing, tracking.endsWith("em") ? tracking.chopped(2).toDouble() * em : length(tracking)); }
    return f;
}

// ── animations ───────────────────────────────────────────────────────────────
struct Key { double t, dx, dy, sx, sy, rot, op; };
static const std::map<QString, std::vector<Key>>& keyframes() {
    static std::map<QString, std::vector<Key>> k = {
        {"uvp-jelly", {{0, 0, 0, 1, 1, 0, 1}, {.3, 0, 0, 1.12, .88, 0, 1}, {.5, 0, 0, .92, 1.08, 0, 1}, {.7, 0, 0, 1.04, .96, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-wobble", {{0, 0, 0, 1, 1, 0, 1}, {.25, 0, 0, 1, 1, -4, 1}, {.5, 0, 0, 1, 1, 3, 1}, {.75, 0, 0, 1, 1, -1.5, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-bounce", {{0, 0, 0, 1, 1, 0, 1}, {.4, 0, -8, 1, 1, 0, 1}, {.6, 0, 0, 1, 1, 0, 1}, {.75, 0, -3, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-rubber", {{0, 0, 0, 1, 1, 0, 1}, {.3, 0, 0, 1.2, .8, 0, 1}, {.4, 0, 0, .8, 1.2, 0, 1}, {.6, 0, 0, 1.1, .9, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-heart", {{0, 0, 0, 1, 1, 0, 1}, {.15, 0, 0, 1.1, 1.1, 0, 1}, {.3, 0, 0, 1, 1, 0, 1}, {.45, 0, 0, 1.1, 1.1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-shake", {{0, 0, 0, 1, 1, 0, 1}, {.2, -4, 0, 1, 1, 0, 1}, {.4, 4, 0, 1, 1, 0, 1}, {.6, -4, 0, 1, 1, 0, 1}, {.8, 4, 0, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-swing", {{0, 0, 0, 1, 1, 0, 1}, {.2, 0, 0, 1, 1, 8, 1}, {.4, 0, 0, 1, 1, -6, 1}, {.6, 0, 0, 1, 1, 3, 1}, {.8, 0, 0, 1, 1, -2, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-float", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, -6, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-pop", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1.12, 1.12, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-pulse", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1.05, 1.05, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-glowpulse", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1.015, 1.015, 0, .85}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-breathe", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1, 1, 0, .65}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-sway", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1, 1, 2, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-bob", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 3, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-blink", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1, 1, 0, .35}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-spin", {{0, 0, 0, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 360, 1}}},
        {"uvl-wiggle", {{0, 0, 0, 1, 1, 0, 1}, {.88, 0, 0, 1, 1, 0, 1}, {.9, 0, 0, 1, 1, -5, 1}, {.93, 0, 0, 1, 1, 5, 1}, {.96, 0, 0, 1, 1, -3, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvp-flicker", {{0, 0, 0, 1, 1, 0, 1}, {.2, 0, 0, 1, 1, 0, .55}, {.21, 0, 0, 1, 1, 0, 1}, {.22, 0, 0, 1, 1, 0, .55}, {.23, 0, 0, 1, 1, 0, 1}, {.56, 0, 0, 1, 1, 0, .55}, {.57, 0, 0, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvp-breathe", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, .55, .55, 0, .5}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvp-glitch", {{0, 0, 0, 1, 1, 0, 1}, {.33, -2, 1, 1, 1, 0, 1}, {.66, 2, -1, 1, 1, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvp-ripple", {{0, 0, 0, .1, .1, 0, 1}, {1, 0, 0, 1, 1, 0, 0}}},
        {"uvp-flip", {{0, 0, 0, 1, 1, 0, 1}, {.5, 0, 0, 1, -1, 0, 1}, {1, 0, 0, -1, -1, 0, 1}}},
        {"uvp-pop", {{0, 0, 0, 1, 1, 0, 1}, {.4, 0, 0, 1.25, 1.25, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-in-fade", {{0, 0, 0, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}}, {"uvl-in-rise", {{0, 0, 24, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-in-drop", {{0, 0, -24, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}}, {"uvl-in-zoom", {{0, 0, 0, .85, .85, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-in-blur", {{0, 0, 0, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}}, {"uvl-in-left", {{0, -40, 0, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-in-right", {{0, 40, 0, 1, 1, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}}, {"uvl-in-flip", {{0, 0, 16, 1, .6, 0, 0}, {1, 0, 0, 1, 1, 0, 1}}},
        {"uvl-in-pop", {{0, 0, 0, .6, .6, 0, 0}, {.7, 0, 0, 1.06, 1.06, 0, 1}, {1, 0, 0, 1, 1, 0, 1}}}, {"uvl-in-swing", {{0, -20, 0, 1, 1, -8, 0}, {1, 0, 0, 1, 1, 0, 1}}},
    };
    static bool aliased = false;
    if (!aliased) { aliased = true; k["uvl-jelly"] = k["uvt-jelly"] = k["uvp-jelly"]; k["uv-rot"] = k["uvl-spin"]; k["uvl-flicker"] = k["uvp-flicker"]; }
    return k;
}
static bool keyAt(const QString& name, double p, Key& out) {
    auto it = keyframes().find(name); if (it == keyframes().end()) return false;
    auto& k = it->second;
    for (size_t i = 1; i < k.size(); ++i) if (p <= k[i].t) {
        const Key& a = k[i - 1]; const Key& b = k[i]; double f = (p - a.t) / std::max(1e-6, b.t - a.t);
        out = {p, a.dx + (b.dx - a.dx) * f, a.dy + (b.dy - a.dy) * f, a.sx + (b.sx - a.sx) * f, a.sy + (b.sy - a.sy) * f, a.rot + (b.rot - a.rot) * f, a.op + (b.op - a.op) * f};
        return true;
    }
    out = k.back(); return true;
}
Anim animState(const Style& s, double t) {
    Anim a;
    for (auto& an : s.anims) {
        double p = an.inf ? std::fmod(t / an.dur, 1.0) : std::clamp(t / an.dur, 0.0, 1.0);
        if (an.name == "uvt-sheen") a.bgx = 1.5 - 2.0 * std::max(0.0, (p - .6) / .4);
        else if (an.name == "uvt-holo") a.bgx = 3.0 * p;
        else if (an.name == "uvl-pan") a.bgx = p;
        else if (an.name == "uvp-roll" || an.name == "uvl-march") a.roll = p;
        else if (an.name == "uv-spin-a" || an.name == "uvl-spin-a") a.angle = 360 * p;
        else { Key k; if (keyAt(an.name, p, k)) { a.dx += k.dx; a.dy += k.dy; a.sx *= k.sx; a.sy *= k.sy; a.rot += k.rot; a.opacity *= k.op; } }
    }
    return a;
}

// ── geometry ─────────────────────────────────────────────────────────────────
static QPainterPath roundedPath(const QRectF& r, const std::vector<std::pair<double, double>>& rd) {
    QPainterPath p; bool zero = true; for (auto& c : rd) if (c.first || c.second) zero = false;
    if (zero) { p.addRect(r); return p; }
    double x = r.x(), y = r.y(), w = r.width(), h = r.height();
    auto [tlx, tly] = rd[0]; auto [trx, tr_y] = rd[1]; auto [brx, bry] = rd[2]; auto [blx, bly] = rd[3];
    p.moveTo(x + tlx, y); p.lineTo(x + w - trx, y);
    if (trx || tr_y) p.arcTo(QRectF(x + w - 2 * trx, y, 2 * trx, 2 * tr_y), 90, -90);
    p.lineTo(x + w, y + h - bry);
    if (brx || bry) p.arcTo(QRectF(x + w - 2 * brx, y + h - 2 * bry, 2 * brx, 2 * bry), 0, -90);
    p.lineTo(x + blx, y + h);
    if (blx || bly) p.arcTo(QRectF(x, y + h - 2 * bly, 2 * blx, 2 * bly), -90, -90);
    p.lineTo(x, y + tly);
    if (tlx || tly) p.arcTo(QRectF(x, y, 2 * tlx, 2 * tly), 180, -90);
    p.closeSubpath(); return p;
}
static bool polygonPath(const QString& clip, const QRectF& r, QPainterPath& out) {
    auto m = re(R"(^polygon\((.*)\)$)").match(clip.trimmed()); if (!m.hasMatch()) return false;
    QPolygonF poly;
    for (auto& pair : splitTop(m.captured(1))) { auto t = splitWs(pair); if (t.size() >= 2) poly << QPointF(r.x() + length(t[0], r.width()), r.y() + length(t[1], r.height())); }
    out = QPainterPath(); out.addPolygon(poly); out.closeSubpath(); return true;
}
QPainterPath shapeOf(const Style& s, const QRectF& r) {
    QPainterPath p; if (s.clip.startsWith("polygon") && polygonPath(s.clip, r, p)) return p;
    return roundedPath(r, s.radii(r));
}
static QPainterPath insetShape(const Style& s, const QRectF& r, double d) {
    QPainterPath p; if (s.clip.startsWith("polygon") && polygonPath(s.clip, r.adjusted(d, d, -d, -d), p)) return p;
    auto rd = s.radii(r); for (auto& c : rd) { c.first = std::max(0.0, c.first - d); c.second = std::max(0.0, c.second - d); }
    return roundedPath(r.adjusted(d, d, -d, -d), rd);
}

// ── gradients ────────────────────────────────────────────────────────────────
static std::vector<std::pair<double, QColor>> stops(const QStringList& args, const QColor& cur, double len) {
    struct S { QColor c; double p; bool has; };
    std::vector<S> raw;
    for (auto& a : args) {
        auto t = splitWs(a); if (t.isEmpty()) continue;
        bool ok; QColor c = parseColor(t[0], cur, &ok); if (!ok) continue;
        int n = 0;
        for (int i = 1; i < std::min<int>(t.size(), 3); ++i) if (re(R"(^-?[\d.]|^calc)").match(t[i]).hasMatch()) { raw.push_back({c, len ? length(t[i], len) / len : 0, true}); n++; }
        if (!n) raw.push_back({c, 0, false});
    }
    if (raw.empty()) return {};
    if (!raw.front().has) { raw.front().p = 0; raw.front().has = true; }
    if (!raw.back().has) { raw.back().p = 1; raw.back().has = true; }
    for (size_t i = 1; i < raw.size(); ++i) if (!raw[i].has) {
        size_t j = i; while (!raw[j].has) j++;
        for (size_t k = i; k < j; ++k) { raw[k].p = raw[i - 1].p + (raw[j].p - raw[i - 1].p) * double(k - i + 1) / double(j - i + 1); raw[k].has = true; }
    }
    std::vector<std::pair<double, QColor>> out; double last = -1e9;
    for (auto& s : raw) { s.p = std::max(s.p, last); last = s.p; out.push_back({s.p, s.c}); }
    return out;
}
static void setStops(QGradient& g, const std::vector<std::pair<double, QColor>>& st, double lo, double hi) {
    double prev = -1;
    for (auto& [p, c] : st) { double q = (p - lo) / std::max(1e-9, hi - lo); if (q <= prev) q = prev + 1e-5; prev = q; g.setColorAt(std::clamp(q, 0.0, 1.0), c); }
}
static bool gradientBrush(const Layer& L, const QRectF& rect, const QColor& cur, const Anim& a, QBrush& out) {
    QStringList args = L.args; bool rep = L.kind.startsWith("repeating-");
    if (L.kind.endsWith("linear-gradient")) {
        double ang = 180;
        if (!args.isEmpty() && (args[0].endsWith("deg") || args[0].startsWith("to "))) {
            QString f = args.takeFirst();
            static const std::map<QString, double> dirs = {{"to top", 0}, {"to right", 90}, {"to bottom", 180}, {"to left", 270}, {"to top right", 45}, {"to bottom right", 135}, {"to bottom left", 225}, {"to top left", 315}};
            ang = f.startsWith("to ") ? (dirs.count(f) ? dirs.at(f) : 180) : f.chopped(3).toDouble();
        }
        double th = qDegreesToRadians(ang), dx = std::sin(th), dy = -std::cos(th);
        double len = std::abs(rect.width() * std::sin(th)) + std::abs(rect.height() * std::cos(th));
        auto st = stops(args, cur, len ? len : 1); if (st.empty()) return false;
        QPointF c = rect.center(), p0(c.x() - dx * len / 2, c.y() - dy * len / 2);
        if (rep) {
            double period = st.back().first - st.front().first; if (period <= 0) period = 1;
            double off = st.front().first + a.roll * period;
            QLinearGradient g(QPointF(p0.x() + dx * len * off, p0.y() + dy * len * off), QPointF(p0.x() + dx * len * (off + period), p0.y() + dy * len * (off + period)));
            g.setSpread(QGradient::RepeatSpread); setStops(g, st, st.front().first, st.back().first); out = QBrush(g);
        } else {
            double lo = std::min(0.0, st.front().first), hi = std::max(1.0, st.back().first);
            QLinearGradient g(QPointF(p0.x() + dx * len * lo, p0.y() + dy * len * lo), QPointF(p0.x() + dx * len * hi, p0.y() + dy * len * hi));
            setStops(g, st, lo, hi); out = QBrush(g);
        }
        return true;
    }
    if (L.kind.endsWith("radial-gradient")) {
        QString head; bool ok; if (!args.isEmpty()) { parseColor(splitWs(args[0]).value(0), cur, &ok); if (!ok) head = args.takeFirst(); }
        QPointF at = rect.center(); QString shape = head;
        int ai = (" " + head).indexOf(" at ");
        if (ai >= 0) {
            shape = (" " + head).left(ai); auto pt = splitWs((" " + head).mid(ai + 4));
            static const std::map<QString, QString> kw = {{"center", "50%"}, {"left", "0%"}, {"right", "100%"}, {"top", "0%"}, {"bottom", "100%"}};
            QString px = pt.value(0, "50%"), py = pt.value(1, "50%"); if (kw.count(px)) px = kw.at(px); if (kw.count(py)) py = kw.at(py);
            at = QPointF(rect.x() + length(px, rect.width()), rect.y() + length(py, rect.height()));
        }
        QStringList st; for (auto& t : splitWs(shape)) if (t != "circle" && t != "ellipse") st << t;
        bool circle = shape.contains("circle");
        double far = std::hypot(std::max(at.x() - rect.left(), rect.right() - at.x()), std::max(at.y() - rect.top(), rect.bottom() - at.y()));
        double rx = -1, ry = -1;
        if (!st.isEmpty() && (st[0] == "farthest-side" || st[0] == "closest-side")) {
            bool mx = st[0] == "farthest-side";
            rx = mx ? std::max(at.x() - rect.left(), rect.right() - at.x()) : std::min(at.x() - rect.left(), rect.right() - at.x());
            ry = mx ? std::max(at.y() - rect.top(), rect.bottom() - at.y()) : std::min(at.y() - rect.top(), rect.bottom() - at.y());
            if (circle) rx = ry = mx ? std::max(rx, ry) : std::min(rx, ry);
        } else if (st.size() >= 2) { rx = length(st[0], rect.width()); ry = length(st[1], rect.height()); }
        else if (st.size() == 1 && re(R"(^[\d.])").match(st[0]).hasMatch()) rx = ry = length(st[0], rect.width());
        if (rx < 0) { if (circle) rx = ry = far; else { double d = std::max(1.0, std::hypot(rect.width(), rect.height())); rx = far * rect.width() / d * 1.414; ry = far * rect.height() / d * 1.414; } }
        auto sv = stops(args, cur, std::max(rx, 1.0)); if (sv.empty()) return false;
        QRadialGradient g(QPointF(0, 0), 1.0); if (rep) g.setSpread(QGradient::RepeatSpread);
        setStops(g, sv, 0, 1); out = QBrush(g);
        double k = rep && sv.back().first < 1 ? sv.back().first : 1;
        QTransform tr; tr.translate(at.x(), at.y()); tr.scale(std::max(rx * k, .1), std::max(ry * k, .1)); out.setTransform(tr);
        return true;
    }
    if (L.kind == "conic-gradient") {
        double from = 0; QPointF at = rect.center();
        if (!args.isEmpty() && (args[0].startsWith("from") || args[0].startsWith("at"))) {
            QString h = args.takeFirst();
            auto m = re(R"(from\s+(-?[\d.]+)deg)").match(h); if (m.hasMatch()) from = m.captured(1).toDouble();
            auto m2 = re(R"(at\s+(\S+)\s+(\S+))").match(h); if (m2.hasMatch()) at = QPointF(rect.x() + length(m2.captured(1), rect.width()), rect.y() + length(m2.captured(2), rect.height()));
        }
        from += a.angle;
        std::vector<std::pair<double, QColor>> sv; std::vector<bool> has;
        for (auto& s : args) {
            auto t = splitWs(s); bool ok; QColor c = parseColor(t.value(0), cur, &ok); if (!ok) continue;
            int n = 0;
            for (int i = 1; i < std::min<int>(t.size(), 3); ++i) { double p = t[i].endsWith('%') ? t[i].chopped(1).toDouble() / 100 : t[i].endsWith("deg") ? t[i].chopped(3).toDouble() / 360 : -1; if (p >= 0) { sv.push_back({p, c}); has.push_back(true); n++; } }
            if (!n) { sv.push_back({0, c}); has.push_back(false); }
        }
        if (sv.empty()) return false;
        if (!has.front()) { sv.front().first = 0; has.front() = true; } if (!has.back()) { sv.back().first = 1; has.back() = true; }
        for (size_t i = 1; i < sv.size(); ++i) if (!has[i]) { size_t j = i; while (!has[j]) j++; for (size_t k = i; k < j; ++k) { sv[k].first = sv[i - 1].first + (sv[j].first - sv[i - 1].first) * double(k - i + 1) / double(j - i + 1); has[k] = true; } }
        QConicalGradient g(at, 90 - from);
        for (auto& [p, c] : sv) g.setColorAt(std::clamp(1 - p, 0.0, 1.0), c);
        out = QBrush(g); return true;
    }
    return false;
}
static QRectF layerRect(const Layer& L, const QRectF& box, bool& tile) {
    double w = box.width(), h = box.height(), lw = w, lh = h;
    if (!L.size.isEmpty()) {
        lw = L.size[0] != "auto" ? length(L.size[0], w) : w;
        lh = L.size.size() > 1 && L.size[1] != "auto" ? length(L.size[1], h) : (L.size[0].endsWith('%') ? h : lw);
    }
    double x = box.x(), y = box.y();
    if (!L.pos.isEmpty()) {
        static const std::map<QString, QString> kw = {{"center", "50%"}, {"left", "0%"}, {"right", "100%"}, {"top", "0%"}, {"bottom", "100%"}};
        QString px = L.pos[0], py = L.pos.value(1, "50%"); if (kw.count(px)) px = kw.at(px); if (kw.count(py)) py = kw.at(py);
        x += px.endsWith('%') ? (w - lw) * length(px, 100) / 100 : length(px, w);
        y += py.endsWith('%') ? (h - lh) * length(py, 100) / 100 : length(py, h);
    }
    tile = L.repeat && (lw < w - .5 || lh < h - .5) && lw > 0 && lh > 0;
    return QRectF(x, y, std::max(lw, .5), std::max(lh, .5));
}
static void paintLayers(QPainter& p, const Style& s, const QRectF& outer, const QRectF& inner, const Anim& a) {
    if (s.hasBg && s.bgColor.alpha()) p.fillRect(outer, s.bgColor);
    for (int i = int(s.layers.size()) - 1; i >= 0; --i) {
        const Layer& L = s.layers[i]; QRectF box = L.padding ? inner : outer; bool tile;
        QRectF lr = layerRect(L, box, tile);
        if (a.bgx >= 0 && i == 0 && lr.width() > box.width() + 1) lr.moveLeft(box.x() + (box.width() - lr.width()) * a.bgx);
        QBrush br;
        if (tile) {
            QPixmap pm(std::max(1, int(std::ceil(lr.width()))), std::max(1, int(std::ceil(lr.height())))); pm.fill(Qt::transparent);
            { QPainter q(&pm); q.setRenderHint(QPainter::Antialiasing); if (gradientBrush(L, QRectF(0, 0, lr.width(), lr.height()), s.color, a, br)) q.fillRect(QRectF(0, 0, lr.width(), lr.height()), br); }
            QBrush tb(pm); QTransform t; t.translate(lr.x() + a.roll * lr.width(), lr.y()); tb.setTransform(t);
            p.save(); p.setClipRect(box, Qt::IntersectClip); p.fillRect(box, tb); p.restore();
        } else if (gradientBrush(L, lr, s.color, a, br)) {
            p.save(); p.setClipRect(box, Qt::IntersectClip); p.fillRect(L.kind.startsWith("repeating") ? lr.united(box) : lr, br); p.restore();
        }
    }
}

// ── shadows ──────────────────────────────────────────────────────────────────
static QImage blurred(const QPainterPath& path, const QColor& col, double blur, QPointF& at) {
    QRectF br = path.boundingRect(); int pad = int(blur * 1.5) + 2;
    int w = int(br.width()) + 2 * pad + 1, h = int(br.height()) + 2 * pad + 1;
    QImage img(std::max(1, w), std::max(1, h), QImage::Format_ARGB32_Premultiplied); img.fill(Qt::transparent);
    { QPainter q(&img); q.setRenderHint(QPainter::Antialiasing); q.translate(pad - br.x(), pad - br.y()); q.fillPath(path, col); }
    if (blur > .5) { double f = std::max(1.0, blur / 2.2); for (int i = 0; i < 2; ++i) img = img.scaled(std::max(1, int(w / f)), std::max(1, int(h / f)), Qt::IgnoreAspectRatio, Qt::SmoothTransformation).scaled(w, h, Qt::IgnoreAspectRatio, Qt::SmoothTransformation); }
    at = QPointF(br.x() - pad, br.y() - pad); return img;
}
static QPainterPath grown(const QPainterPath& shape, double spread) {
    if (!spread) return shape;
    QRectF br = shape.boundingRect(); if (br.width() <= 0 || br.height() <= 0) return shape;
    QTransform t; QPointF c = br.center(); t.translate(c.x(), c.y()); t.scale((br.width() + 2 * spread) / br.width(), (br.height() + 2 * spread) / br.height()); t.translate(-c.x(), -c.y());
    return t.map(shape);
}
static void outerShadow(QPainter& p, const QPainterPath& shape, const Shadow& s) {
    if (s.inset || !s.color.alpha()) return;
    QPainterPath sh = grown(shape, s.spread); sh.translate(s.x, s.y);
    if (s.blur < .5) { p.fillPath(sh, s.color); return; }
    QPointF at; QImage img = blurred(sh, s.color, s.blur, at); p.drawImage(at, img);
}
static void insetShadow(QPainter& p, const QPainterPath& shape, const Shadow& s, const QRectF& box) {
    if (!s.inset || !s.color.alpha()) return;
    p.save(); p.setClipPath(shape, Qt::IntersectClip);
    QPainterPath outer; outer.addRect(box.adjusted(-60, -60, 60, 60));
    QPainterPath inner = grown(shape, -s.spread); inner.translate(s.x, s.y);
    QPainterPath ring = outer.subtracted(inner);
    if (s.blur < .5) p.fillPath(ring, s.color); else { QPointF at; QImage img = blurred(ring, s.color, s.blur, at); p.drawImage(at, img); }
    p.restore();
}

// ── box & text painters ──────────────────────────────────────────────────────
static void paintBorders(QPainter& p, const Style& s, const QRectF& r, const QPainterPath& shape) {
    if (!(s.bw[0] || s.bw[1] || s.bw[2] || s.bw[3])) return;
    bool sameW = s.bw[0] == s.bw[1] && s.bw[1] == s.bw[2] && s.bw[2] == s.bw[3];
    bool sameC = s.bcol[0] == s.bcol[1] && s.bcol[1] == s.bcol[2] && s.bcol[2] == s.bcol[3];
    auto rd = s.radii(r); bool circle = std::abs(rd[0].first - r.width() / 2) < 1 && std::abs(r.width() - r.height()) < 1;
    if (sameW && (sameC || circle)) {
        double w = s.bw[0];
        if (circle && !sameC) {
            QRectF rr = r.adjusted(w / 2, w / 2, -w / 2, -w / 2); const int start[4] = {45, -45, -135, 135};
            for (int i = 0; i < 4; ++i) if (s.bcol[i].alpha()) { QPen pen(s.bcol[i], w); pen.setCapStyle(Qt::FlatCap); p.setPen(pen); p.setBrush(Qt::NoBrush); p.drawArc(rr, start[i] * 16, 90 * 16); }
            return;
        }
        p.save(); p.setClipPath(shape, Qt::IntersectClip); p.setBrush(Qt::NoBrush);
        if (s.bstyle[0] == "double" && w >= 3) { double t = w / 3; for (double d : {t / 2, w - t / 2}) { p.setPen(QPen(s.bcol[0], t)); p.drawPath(insetShape(s, r, d)); } }
        else {
            QPen pen(s.bcol[0], w);
            if (s.bstyle[0] == "dashed") pen.setDashPattern({3, 2}); else if (s.bstyle[0] == "dotted") { pen.setDashPattern({1, 1.5}); pen.setCapStyle(Qt::RoundCap); }
            p.setPen(pen); p.drawPath(insetShape(s, r, w / 2));
        }
        p.restore(); return;
    }
    p.save(); p.setClipPath(shape, Qt::IntersectClip);
    if (s.bw[0]) p.fillRect(QRectF(r.x(), r.y(), r.width(), s.bw[0]), s.bcol[0]);
    if (s.bw[1]) p.fillRect(QRectF(r.right() - s.bw[1], r.y(), s.bw[1], r.height()), s.bcol[1]);
    if (s.bw[2]) p.fillRect(QRectF(r.x(), r.bottom() - s.bw[2], r.width(), s.bw[2]), s.bcol[2]);
    if (s.bw[3]) p.fillRect(QRectF(r.x(), r.y(), s.bw[3], r.height()), s.bcol[3]);
    p.restore();
}

void paintBox(QPainter& p, const Style& s, const QRectF& r, const Anim& a, double opacity) {
    if (r.width() <= 0 || r.height() <= 0) return;
    p.save(); p.setOpacity(p.opacity() * opacity * s.opacity * a.opacity);
    QPainterPath shape = shapeOf(s, r);
    bool ringMask = s.mask.contains("farthest-side");
    if (!ringMask) for (auto& d : s.drops) outerShadow(p, shape, d);
    bool anyOuter = false; for (auto& sh : s.shadows) if (!sh.inset) anyOuter = true;
    if (anyOuter) {
        p.save(); QPainterPath big; big.addRect(r.adjusted(-200, -200, 200, 200)); p.setClipPath(big.subtracted(shape), Qt::IntersectClip);
        for (int i = int(s.shadows.size()) - 1; i >= 0; --i) outerShadow(p, shape, s.shadows[i]);
        p.restore();
    }
    QRectF inner = r.adjusted(s.bw[3], s.bw[0], -s.bw[1], -s.bw[2]);
    p.save(); p.setClipPath(shape, Qt::IntersectClip);
    if (!s.textClip) {
        if (ringMask) {
            auto m = re(R"(calc\(100% - ([\d.]+)px\))").match(s.mask); double band = m.hasMatch() ? m.captured(1).toDouble() : 4;
            QPainterPath ring; ring.addEllipse(r); QPainterPath hole; hole.addEllipse(r.adjusted(band, band, -band, -band)); p.setClipPath(ring.subtracted(hole), Qt::IntersectClip);
        }
        paintLayers(p, s, r, inner, a);
    }
    for (int i = int(s.shadows.size()) - 1; i >= 0; --i) insetShadow(p, shape, s.shadows[i], r);
    if (s.bright != 1) p.fillPath(shape, s.bright > 1 ? QColor(255, 255, 255, int(std::min(1.0, s.bright - 1) * 140)) : QColor(0, 0, 0, int(std::min(1.0, 1 - s.bright) * 160)));
    p.restore();
    paintBorders(p, s, r, shape);
    if (s.outline) {
        double d = -(s.outlineOffset + s.outlineW / 2); QPen pen(s.outlineColor, s.outlineW);
        if (s.outlineStyle == "dashed") pen.setStyle(Qt::DashLine); else if (s.outlineStyle == "dotted") pen.setStyle(Qt::DotLine);
        p.setPen(pen); p.setBrush(Qt::NoBrush);
        auto rd = s.radii(r); for (auto& c : rd) { c.first = std::max(0.0, c.first - d); c.second = std::max(0.0, c.second - d); }
        p.drawPath(roundedPath(r.adjusted(d, d, -d, -d), rd));
    }
    p.restore();
}

double paintText(QPainter& p, const Style& s, const QRectF& r, QString text, const QFont& font, int align, const Anim& a, double opacity) {
    if (s.upper) text = text.toUpper();
    p.save(); p.setOpacity(p.opacity() * opacity * s.opacity * a.opacity); p.setFont(font);
    QFontMetricsF fm(font); double tw = fm.horizontalAdvance(text);
    double x = (align & Qt::AlignLeft) ? r.x() : (align & Qt::AlignRight) ? r.right() - tw : r.center().x() - tw / 2;
    double y = (align & Qt::AlignTop) ? r.y() + fm.ascent() : r.center().y() + (fm.ascent() - fm.descent()) / 2;
    QPainterPath path; path.addText(QPointF(x, y), font, text);
    for (int i = int(s.textShadows.size()) - 1; i >= 0; --i) {
        const Shadow& sh = s.textShadows[i]; QPainterPath sp = path; sp.translate(sh.x, sh.y);
        if (sh.blur < .5) p.fillPath(sp, sh.color); else { QPointF at; QImage img = blurred(sp, sh.color, sh.blur, at); p.drawImage(at, img); }
    }
    for (auto& d : s.drops) { QPainterPath sp = path; sp.translate(d.x, d.y); QPointF at; QImage img = blurred(sp, d.color, d.blur, at); p.drawImage(at, img); }
    if (s.stroke && s.strokeFirst) p.strokePath(path, QPen(s.strokeColor, s.strokeW, Qt::SolidLine, Qt::RoundCap, Qt::RoundJoin));
    if (s.textClip && (!s.layers.empty() || s.hasBg)) { p.save(); p.setClipPath(path); QRectF br = path.boundingRect().adjusted(-2, -2, 2, 2); paintLayers(p, s, br, br, a); p.restore(); }
    else if (!s.transparentText) p.fillPath(path, s.color);
    if (s.stroke && !s.strokeFirst) p.strokePath(path, QPen(s.strokeColor, s.strokeW));
    p.restore(); return tw;
}

// ── style state ──────────────────────────────────────────────────────────────
static Map themeVars(const QString& name) {
    Map v; QJsonObject t = tokens()[name].toObject();
    auto cols = t["colors"].toObject(); for (auto it = cols.begin(); it != cols.end(); ++it) v["--uv-" + it.key()] = it.value().toString();
    auto f = t["fonts"].toObject();
    v["--uv-font"] = "\"" + f["font-family"].toString("Geist") + "\"";
    v["--uv-font-head"] = v["--uv-serif"] = v["--uv-display"] = "\"" + f["font-head-family"].toString(f["font-family"].toString("Geist")) + "\"";
    v["--uv-mono"] = "\"" + f["mono-family"].toString("Geist Mono") + "\"";
    if (!v.count("--uv-on-accent")) { QColor a(t["solid"].toObject()["accent"].toString()); v["--uv-on-accent"] = (0.2126 * a.red() + 0.7152 * a.green() + 0.0722 * a.blue()) / 255 > .55 ? "#111111" : "#ffffff"; }
    auto sh = t["shape"].toObject(); for (auto it = sh.begin(); it != sh.end(); ++it) v["--uv-" + it.key()] = QString::number(it.value().toDouble()) + "px";
    return v;
}

// layers → rules (mirrors lib/js/layers.js and uivault3/style.py)
static QString colTok(const QString& v) {
    static const std::map<QString, QString> t = {{"accent", "var(--uv-accent)"}, {"accent-2", "var(--uv-accent-2)"}, {"text", "var(--uv-text)"}, {"white", "#ffffff"}, {"black", "#000000"},
        {"success", "var(--uv-success)"}, {"warn", "var(--uv-warn)"}, {"danger", "var(--uv-danger)"}, {"info", "var(--uv-info)"}};
    return t.count(v) ? t.at(v) : (v.isEmpty() ? "var(--uv-accent)" : v);
}
static double num(const QJsonValue& e, double s) {
    if (e.isDouble()) return e.toDouble();
    QString x = e.toString().replace(" ", "");
    // forms used by the layer data: s, -s, k*s, k*s+n, n+k*s, n-k*s
    auto m = re(R"(^(-?[\d.]*)(\*?)s([+-][\d.]+)?$)").match(x);
    if (m.hasMatch()) { QString k = m.captured(1); double kk = k.isEmpty() ? 1 : k == "-" ? -1 : k.toDouble(); return kk * s + m.captured(3).toDouble(); }
    auto m2 = re(R"(^(-?[\d.]+)([+-])([\d.]*)\*?s$)").match(x);
    if (m2.hasMatch()) { double k = m2.captured(3).isEmpty() ? 1 : m2.captured(3).toDouble(); return m2.captured(1).toDouble() + (m2.captured(2) == "-" ? -k : k) * s; }
    return x.toDouble();
}
static QString val(QString t, const QJsonObject& p) {
    QString c = colTok(p["c"].toString()), c2 = colTok(p["c2"].toString("accent-2"));
    t.replace("%A2", "var(--uv-accent-2)").replace("%A", "var(--uv-accent)").replace("%T", "var(--uv-text)").replace("%BG", "var(--uv-bg)").replace("%S", "var(--uv-surface)");
    t.replace("on(c)", p["c"].toString() == "white" ? "#111111" : p["c"].toString("accent") == "accent" ? "var(--uv-on-accent, #fff)" : "#ffffff");
    t.replace(re(R"(mix\(([^,]+),([^,]+),(\d+)\))"), "color-mix(in srgb, \\1, \\2 \\3%)");
    t.replace(re(R"(\bc2@(\d+))"), "color-mix(in srgb, " + c2 + " \\1%, transparent)");
    t.replace(re(R"(\bc@(\d+))"), "color-mix(in srgb, " + c + " \\1%, transparent)");
    t.replace(re(R"(\bc2\b)"), c2); t.replace(re(R"(\bc\b)"), c);
    return t;
}
static QString drops(const QJsonArray& list, const QJsonObject& p) {
    QStringList out; double s = p["s"].toDouble();
    for (auto d : list) { auto a = d.toArray(); out << QString("drop-shadow(%1px %2px %3px %4)").arg(num(a[0], s)).arg(num(a[1], s)).arg(std::max(0.0, num(a[2], s))).arg(val(a[3].toString(), p)); }
    return out.join(' ');
}
static std::vector<QJsonObject> layerRules(const QJsonObject& kinds, QJsonObject* extras) {
    QJsonObject base, hov, act; QStringList filt, hfilt, afilt, anims, hanims;
    QJsonObject kindDefs; for (auto k : layerDefs()["kinds"].toArray()) kindDefs[k.toObject()["key"].toString()] = k;
    for (auto it = kinds.begin(); it != kinds.end(); ++it) {
        QString k = it.key(); QJsonObject v = it.value().toObject(), kd = kindDefs[k].toObject(), o;
        for (auto x : kd["options"].toArray()) if (x.toObject()["name"] == v["o"]) o = x.toObject();
        if (o.isEmpty() || k == "fx" || o.contains("page")) continue;
        QJsonObject p = kd["defaults"].toObject(); for (auto j = v.begin(); j != v.end(); ++j) p[j.key()] = j.value();
        double s = p["s"].toDouble();
        if (o.contains("drop")) filt << drops(o["drop"].toArray(), p);
        if (o.contains("anim") && k != "enter") anims << QString("%1 %2s %3 infinite").arg(o["anim"].toString()).arg(k == "idle" ? p["t"].toDouble(3) : 2.4).arg(o["anim"] == "uvl-hue" || o["anim"] == "uvl-spin" ? "linear" : "ease-in-out");
        if (o.contains("anim") && k == "enter" && extras) (*extras)["enter"] = QJsonArray{o["anim"], p["t"].toDouble(.6)};
        if (o.contains("outline")) { auto a = o["outline"].toArray(); base["outline"] = QString("%1px %2 %3").arg(num(a[0], s)).arg(a[1].toString()).arg(val(a[2].toString(), p)); base["outline-offset"] = QString("%1px").arg(num(a[3], s)); }
        if (o.contains("ring") && extras) (*extras)["ring"] = QJsonArray{o["ring"], p["s"].toDouble(2), colTok(p["c"].toString()), colTok(p["c2"].toString("accent-2"))};
        if (o.contains("bg")) base["background"] = val(o["bg"].toString(), p);
        if (o.contains("fg")) base["color"] = val(o["fg"].toString(), p);
        if (o.contains("backdrop") && !o.contains("bg")) base["background"] = QString("color-mix(in srgb, var(--uv-surface) %1%, transparent)").arg(qRound(o["backdrop"].toArray()[1].toDouble() * 100));
        auto ex = o["extra"].toObject(); for (auto j = ex.begin(); j != ex.end(); ++j) base[j.key()] = j.value();
        if (o.contains("radius")) base["border-radius"] = o["radius"] == "pill" ? "999px" : o["radius"] == "blob" ? "30% 70% 70% 30% / 30% 30% 70% 70%" : o["radius"].toString();
        if (o.contains("clip")) base["clip-path"] = o["clip"] == "notch" ? "polygon(12px 0, calc(100% - 12px) 0, 100% 12px, 100% calc(100% - 12px), calc(100% - 12px) 100%, 12px 100%, 0 calc(100% - 12px), 0 12px)" : "polygon(0 0, calc(100% - 14px) 0, 100% 14px, 100% 100%, 14px 100%, 0 calc(100% - 14px))";
        QJsonObject f = o["font"].toObject();
        if (f.contains("tt")) base["text-transform"] = f["tt"]; if (f.contains("ls")) base["letter-spacing"] = f["ls"];
        if (f.contains("ff")) base["font-family"] = f["ff"] == "mono" ? "var(--uv-mono)" : f["ff"] == "serif" ? "var(--uv-serif)" : "var(--uv-font-head)";
        if (f.contains("fw")) base["font-weight"] = QString::number(f["fw"].toInt()); if (f.contains("fs")) base["font-style"] = f["fs"];
        if (f.contains("glow")) base["text-shadow"] = "0 0 6px " + val(f["glow"].toString(), p) + ", 0 0 18px " + val("c@60", p);
        if (f.contains("emboss")) base["text-shadow"] = "0 1px 0 #ffffff70, 0 -1px 0 #00000040";
        if (f.contains("stroke")) { base["-webkit-text-stroke"] = "1.2px " + val(f["stroke"].toString(), p); base["color"] = "transparent"; }
        if (f.contains("grad")) { base["background-image"] = val(f["grad"].toString(), p); base["-webkit-background-clip"] = "text"; }
        for (int st = 0; st < 2; ++st) {
            QJsonObject state = o[st ? "active" : "hover"].toObject(); if (state.isEmpty()) continue;
            QJsonObject& d = st ? act : hov; QStringList& fl = st ? afilt : hfilt;
            if (state.contains("y") || state.contains("x")) d["translate"] = QString("%1px %2px").arg(num(state["x"], s)).arg(num(state["y"], s));
            if (state.contains("scale")) d["scale"] = QString::number(num(state["scale"], s));
            if (state.contains("rot")) d["rotate"] = QString("%1deg").arg(num(state["rot"], s));
            if (state.contains("bright")) fl << QString("brightness(%1)").arg(state["bright"].toDouble());
            if (state.contains("drop")) fl << drops(state["drop"].toArray(), p);
            if (state.contains("outline")) { auto a = state["outline"].toArray(); d["outline"] = QString("%1px %2 %3").arg(num(a[0], s)).arg(a[1].toString()).arg(val(a[2].toString(), p)); d["outline-offset"] = QString("%1px").arg(num(a[3], s)); }
            if (state.contains("anim")) { QString spec = state["anim"].toString() + (state["anim"] == "uvl-float" ? " 1.6s ease-in-out infinite" : " .55s ease"); if (st) d["animation"] = spec; else hanims << spec; }
        }
        if (o["js"] == "ripple" && extras) (*extras)["ripple"] = true;
    }
    if (!filt.isEmpty()) base["filter"] = filt.join(' ');
    if (!hfilt.isEmpty()) hov["filter"] = (filt + hfilt).join(' ');
    if (!afilt.isEmpty()) act["filter"] = (filt + afilt).join(' ');
    if (!anims.isEmpty()) base["animation"] = anims.join(", ");
    if (!hanims.isEmpty()) hov["animation"] = (hanims + anims).join(", ");
    std::vector<QJsonObject> out;
    auto rule = [&](const QJsonObject& d, const char* w) { if (!d.isEmpty()) { QJsonObject r; r["sub"] = "main"; r["when"] = w[0] ? QJsonArray{w} : QJsonArray{}; r["decl"] = d; out.push_back(r); } };
    rule(base, ""); rule(hov, "hover"); rule(act, "active");
    return out;
}
static QString layerType(const QString& fam) { return fam == "bg" ? "page" : fam; }

UiStyle& UiStyle::get() { static UiStyle s; return s; }
UiStyle::UiStyle() { vars = themeVars(theme); }
void UiStyle::set(const Look& look) {
    if (!look.kitName.isEmpty()) for (auto k : native()["kits"].toArray()) if (k.toObject()["name"] == look.kitName) {
        parts.clear(); auto ps = k.toObject()["parts"].toObject(); for (auto it = ps.begin(); it != ps.end(); ++it) parts[it.key()] = it.value().toString();
        if (look.themeName.isEmpty()) theme = k.toObject()["theme"].toString();
    }
    if (look.kitName.isEmpty()) parts.clear();
    for (auto& [f, d] : look.parts) { if (d.isEmpty()) parts.erase(f); else parts[f] = d; }
    if (!look.themeName.isEmpty() && tokens().contains(look.themeName)) theme = look.themeName;
    layers = look.layers; vars = themeVars(theme); cache.clear(); emit changed();
}
QString UiStyle::resolve(const QString& s) const { return resolveVars(s, vars); }
QColor UiStyle::color(const QString& token) const { return QColor(tokens()[theme].toObject()["solid"].toObject()[token].toString("#888888")); }
QString UiStyle::fontFamily(const QString& which) const {
    auto f = tokens()[theme].toObject()["fonts"].toObject();
    return which == "head" ? f["font-head-family"].toString() : which == "mono" ? f["mono-family"].toString() : f["font-family"].toString();
}
QJsonObject UiStyle::extras(const QString& fam) const { QJsonObject e; layerRules(layers[layerType(fam)].toObject(), &e); return e; }
const Style& UiStyle::style(const QString& fam, const QString& sub, const std::set<QString>& flags, const Map& extra) {
    QString key = fam + "|" + sub; for (auto& f : flags) key += "|" + f; for (auto& [k, v] : extra) key += "|" + k + "=" + v;
    auto it = cache.find(key); if (it != cache.end()) return *it->second;
    QJsonObject F = native()["families"].toObject()[fam].toObject();
    std::vector<QJsonObject> rules; for (auto r : F["base"].toArray()) rules.push_back(r.toObject());
    auto pi = parts.find(fam);
    if (pi != parts.end() && F["parts"].toObject().contains(pi->second)) {
        for (auto r : F["reset"].toArray()) rules.push_back(r.toObject());
        for (auto r : F["parts"].toObject()[pi->second].toArray()) rules.push_back(r.toObject());
    }
    for (auto& r : layerRules(layers[layerType(fam)].toObject(), nullptr)) rules.push_back(r);
    std::vector<QJsonObject> decls;
    for (auto& r : rules) {
        if (r["sub"].toString() != sub) continue;
        bool ok = true;
        for (auto c : r["when"].toArray()) { QString w = c.toString(); if (w == "notprimary" ? flags.count("primary") : !flags.count(w)) { ok = false; break; } }
        if (ok) decls.push_back(r["decl"].toObject());
    }
    std::vector<const QJsonObject*> ptrs; for (auto& d : decls) ptrs.push_back(&d);
    Map v = vars; for (auto& [k, x] : extra) v["--" + k] = x;
    if (cache.size() > 2000) cache.clear();
    auto& slot = cache[key]; slot = std::make_unique<Style>(mergeDecls(ptrs), v, color("text"));
    return *slot;
}

Look& Look::layer(const QString& type, const QString& kind, const QString& option, const QString& colour, double size) {
    QJsonObject t = layers[type].toObject(), k; k["o"] = option; if (!colour.isEmpty()) k["c"] = colour; if (size >= 0) k["s"] = size;
    t[kind] = k; layers[type] = t; return *this;
}
void apply(QApplication* app, const Look& look) {
    UiStyle& S = UiStyle::get(); S.set(look);
    if (!app) return;
    QPalette pal = app->palette();
    const std::pair<QPalette::ColorRole, const char*> roles[] = {{QPalette::Window, "bg"}, {QPalette::WindowText, "text"}, {QPalette::Base, "surface"}, {QPalette::AlternateBase, "surface-2"},
        {QPalette::Text, "text"}, {QPalette::Button, "surface-2"}, {QPalette::ButtonText, "text"}, {QPalette::Highlight, "accent"}, {QPalette::PlaceholderText, "muted"}};
    for (auto& [r, t] : roles) pal.setColor(r, S.color(t));
    app->setPalette(pal); QFont f(S.fontFamily()); f.setPixelSize(14); app->setFont(f);
}
void load(QApplication* app, const QByteArray& json) {
    QJsonObject o = QJsonDocument::fromJson(json).object(); Look l; l.themeName = o["theme"].toString();
    auto ps = o["parts"].toObject(); for (auto it = ps.begin(); it != ps.end(); ++it) l.parts[it.key()] = it.value().toString();
    l.layers = o["layers"].toObject(); l.layers.remove("@el"); apply(app, l);
}
QStringList themes() { return tokens().keys(); }
QStringList kits() { QStringList k; for (auto x : native()["kits"].toArray()) k << x.toObject()["name"].toString(); return k; }
QStringList families() { return native()["families"].toObject().keys(); }
QStringList parts(const QString& f) { return native()["families"].toObject()[f].toObject()["parts"].toObject().keys(); }

// ── widgets ──────────────────────────────────────────────────────────────────
namespace {
struct Ticker {   // one ~30 fps timer for every animated, visible widget
    QTimer* timer = nullptr; std::set<QWidget*> ws;
    void want(QWidget* w, bool on) {
        if (!timer) { timer = new QTimer(qApp); timer->setInterval(33); QObject::connect(timer, &QTimer::timeout, [this] { for (auto* x : ws) if (x->isVisible()) x->update(); }); }
        if (on) { if (ws.insert(w).second) QObject::connect(w, &QObject::destroyed, [this, w] { ws.erase(w); }); } else ws.erase(w);
        if (!ws.empty() && !timer->isActive()) timer->start(); else if (ws.empty()) timer->stop();
    }
};
Ticker& ticker() { static Ticker t; return t; }
QFont baseFont(double px, const QString& family = {}) { QFont f(family.isEmpty() ? UiStyle::get().fontFamily() : family); f.setPixelSize(int(px)); return f; }
struct Tf { double dx = 0, dy = 0, sx = 1, sy = 1, rot = 0; };
Tf transformOf(const Style& s) {
    Tf t; auto it = re(R"((\w+)\(([^)]*)\))").globalMatch(s.transform);
    while (it.hasNext()) {
        auto m = it.next(); QString fn = m.captured(1); auto a = m.captured(2).split(',');
        if (fn == "translateY") t.dy += length(a[0]); else if (fn == "translateX") t.dx += length(a[0]);
        else if (fn == "translate") { t.dx += length(a[0]); if (a.size() > 1) t.dy += length(a[1]); }
        else if (fn == "scale") { t.sx *= a[0].toDouble(); t.sy *= a.value(1, a[0]).toDouble(); }
        else if (fn == "rotate") t.rot += QString(a[0]).remove("deg").toDouble();
    }
    if (!s.translate.isEmpty() && s.translate != "none") { auto x = splitWs(s.translate); t.dx += length(x[0]); if (x.size() > 1) t.dy += length(x[1]); }
    if (!s.scale.isEmpty() && s.scale != "none") { auto x = splitWs(s.scale); t.sx *= x[0].toDouble(); t.sy *= x.value(1, x[0]).toDouble(); }
    if (!s.rotate.isEmpty() && s.rotate != "none") t.rot += QString(s.rotate).remove("deg").toDouble();
    return t;
}
QRectF pseudoRect(const Style& ps, const QRectF& r) {
    auto g = [&](const char* k, double ref, bool& has) { auto it = ps.geom.find(k); has = it != ps.geom.end(); return has ? length(it->second, ref) : 0; };
    bool hl, hr, ht, hb, hw, hh; double W = r.width(), H = r.height();
    double l = g("left", W, hl), rt = g("right", W, hr), t = g("top", H, ht), b = g("bottom", H, hb), w = g("width", W, hw), h = g("height", H, hh);
    if (!hw) w = W - l - rt; if (!hh) h = H - t - b;
    double x = r.x() + (hl ? l : hr ? W - rt - w : 0), y = r.y() + (ht ? t : hb ? H - b - h : 0);
    bool hm; double mt = g("margin-top", h, hm); y += mt;
    return QRectF(x, y, std::max(0.0, w), std::max(0.0, h));
}
const std::map<QString, QString> KIND_VAR = {{"accent", "var(--uv-accent)"}, {"success", "var(--uv-success)"}, {"warn", "var(--uv-warn)"}, {"danger", "var(--uv-danger)"}, {"info", "var(--uv-info)"}, {"neutral", "var(--uv-muted)"}};
QString kindVar(const QString& k) { return KIND_VAR.count(k) ? KIND_VAR.at(k) : k; }
double lerp(double a, double b, double t) { return a + (b - a) * t; }
}  // namespace

void UvBox::boxInit(QWidget* w, const QString& f, int b) {
    self = w; fam = f; bleed = b; w->setAttribute(Qt::WA_Hover, true);
    hanim = new QVariantAnimation(w); hanim->setDuration(180); hanim->setEasingCurve(QEasingCurve::OutCubic);
    QObject::connect(hanim, &QVariantAnimation::valueChanged, w, [this](const QVariant& v) { h = v.toDouble(); self->update(); });
    QObject::connect(&UiStyle::get(), &UiStyle::changed, w, [w] { w->updateGeometry(); w->update(); });
    if (QStringList{"btn", "switch", "check", "badge", "spinner", "head"}.contains(f)) w->setSizePolicy(QSizePolicy::Fixed, QSizePolicy::Fixed);
    if (UiStyle::get().extras(f).contains("enter")) enterT0 = now();
}
void UvBox::hoverTo(bool on) { hanim->stop(); hanim->setStartValue(h); hanim->setEndValue(on ? 1.0 : 0.0); hanim->start(); }
void UvBox::needsTick(bool busy) { if (enterT0 >= 0 && now() - enterT0 < 3) busy = true; if (!rippleT.empty()) busy = true; ticker().want(self, busy); }
void UvBox::paintStates(QPainter& p, const QRectF& r, const QString& sub, std::set<QString> flags, const Map& vars) {
    flags.erase("hover"); auto f1 = flags; f1.insert("hover");
    const Style& s0 = UiStyle::get().style(fam, sub, flags, vars); const Style& s1 = UiStyle::get().style(fam, sub, f1, vars);
    double hh = self->isEnabled() ? h : 0, t = now();
    if (hh < .999) paintBox(p, s0, r, animState(s0, t), hh > .001 ? 1 - hh : 1);
    if (hh > .001) paintBox(p, s1, r, animState(s1, t), hh);
}
void UvBox::applyTransform(QPainter& p, const QRectF& r, const Style& s0, const Style& s1, const Style* active) {
    Tf a = transformOf(s0), b = transformOf(s1), t{lerp(a.dx, b.dx, h), lerp(a.dy, b.dy, h), lerp(a.sx, b.sx, h), lerp(a.sy, b.sy, h), lerp(a.rot, b.rot, h)};
    if (active) t = transformOf(*active);
    Anim an = animState(h > .5 ? s1 : s0, now());
    double eo = 1, es = 1, ex = 0, ey = 0;
    QJsonObject e = UiStyle::get().extras(fam);
    if (e.contains("enter") && enterT0 >= 0) {
        auto arr = e["enter"].toArray(); double pr = std::min(1.0, (now() - enterT0) / std::max(.05, arr[1].toDouble())); Key k;
        if (keyAt(arr[0].toString(), 1 - std::pow(1 - pr, 3), k)) { ex = k.dx; ey = k.dy; es = k.sx; eo = k.op; }
    }
    QPointF c = r.center();
    p.translate(c.x() + t.dx + an.dx + ex, c.y() + t.dy + an.dy + ey); p.rotate(t.rot + an.rot); p.scale(t.sx * an.sx * es, t.sy * an.sy * es); p.translate(-c.x(), -c.y());
    p.setOpacity(p.opacity() * eo);
}
void UvBox::paintRing(QPainter& p, const QRectF& r, const Style& st) {
    QJsonObject e = UiStyle::get().extras(fam); if (!e.contains("ring")) return;
    auto a = e["ring"].toArray(); QString kind = a[0].toString(), c1 = a[2].toString(), c2 = a[3].toString(); double w = a[1].toDouble();
    p.save(); p.setClipPath(shapeOf(st, r).subtracted(shapeOf(st, r.adjusted(w, w, -w, -w))), Qt::IntersectClip);
    QString g = kind == "gradient" ? "linear-gradient(135deg, " + c1 + ", " + c2 + ")" : kind == "spin" ? "conic-gradient(from 0deg, " + c1 + ", " + c2 + ", transparent 45%, " + c1 + ")"
              : kind == "holo" ? "conic-gradient(from 0deg, #ff9ae6, #9ad3ff, #b8ff9a, #fff59a, #ff9ae6)" : "repeating-linear-gradient(90deg, " + c1 + " 0 8px, transparent 8px 16px)";
    Anim an; if (kind == "spin" || kind == "holo") an.angle = std::fmod(now() * 120, 360); if (kind == "dash") an.roll = std::fmod(now(), 1.0);
    paintLayers(p, Style(Map{{"background", UiStyle::get().resolve(g)}}, Map{}, st.color), r, r, an);
    p.restore(); if (kind != "gradient") ticker().want(self, true);
}

// Button
Button::Button(const QString& text, bool primary_, const QString& size, QWidget* parent) : QAbstractButton(parent), primary(primary_), sizeName(size) {
    setText(text); setCursor(Qt::PointingHandCursor); setFocusPolicy(Qt::StrongFocus); boxInit(this, "btn", 10);
}
static void btnDims(const QString& s, double& h, double& pad, double& fs) { if (s == "sm") { h = 34; pad = 12; fs = 13; } else if (s == "lg") { h = 52; pad = 26; fs = 16; } else { h = 42; pad = 18; fs = 14; } }
QSize Button::sizeHint() const {
    double h, pad, fs; btnDims(sizeName, h, pad, fs);
    std::set<QString> f; if (primary) f.insert("primary");
    const Style& st = UiStyle::get().style("btn", "main", f); const Style& b = UiStyle::get().style("btn", "::before", f); const Style& a = UiStyle::get().style("btn", "::after", f);
    QString t = (b.hasContent && !b.absolute ? b.content : "") + (st.upper ? text().toUpper() : text()) + (a.hasContent && !a.absolute ? a.content : "");
    double w = QFontMetricsF(st.font(baseFont(fs), fs)).horizontalAdvance(t) + 2 * pad;
    if (st.padding.count("left")) w += length(st.padding.at("left"), 0, fs) - pad;
    if (st.padding.count("right")) w += length(st.padding.at("right"), 0, fs) - pad;
    return QSize(int(w + 2 * bleed + 2), int(h + 2 * bleed));
}
void Button::enterEvent(QEnterEvent* e) { hoverTo(true); QAbstractButton::enterEvent(e); }
void Button::leaveEvent(QEvent* e) { hoverTo(false); QAbstractButton::leaveEvent(e); }
void Button::mousePressEvent(QMouseEvent* e) { if (UiStyle::get().extras("btn").contains("ripple")) { rippleAt.push_back(e->position()); rippleT.push_back(now()); } QAbstractButton::mousePressEvent(e); }
void Button::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing); p.setRenderHint(QPainter::TextAntialiasing);
    double hh, pad, fs; btnDims(sizeName, hh, pad, fs);
    QRectF r = QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed);
    std::set<QString> fl; if (primary) fl.insert("primary"); if (isDown()) fl.insert("active"); if (loading) fl.insert("loading");
    if (!isEnabled()) p.setOpacity(.45);
    auto f0 = fl, f1 = fl; f1.insert("hover");
    const Style& s0 = UiStyle::get().style("btn", "main", f0); const Style& s1 = UiStyle::get().style("btn", "main", f1);
    const Style* sa = isDown() ? &UiStyle::get().style("btn", "main", h > .5 ? f1 : f0) : nullptr;
    applyTransform(p, r, s0, s1, sa);
    paintStates(p, r, "main", fl);
    const Style& dom = h > .5 ? s1 : s0;
    paintRing(p, r, dom);
    for (auto sub : {"::before", "::after"}) {
        const Style& ps = UiStyle::get().style("btn", sub, h > .5 ? f1 : f0);
        if (ps.hasContent && ps.absolute) { QRectF pr = pseudoRect(ps, r); p.save(); p.setClipPath(shapeOf(dom, r), Qt::IntersectClip); paintBox(p, ps, pr, animState(ps, now())); if (!ps.content.isEmpty()) paintText(p, ps, pr, ps.content, ps.font(baseFont(fs), fs)); p.restore(); }
    }
    if (!rippleT.empty()) {
        p.save(); p.setClipPath(shapeOf(dom, r), Qt::IntersectClip); std::vector<QPointF> ka; std::vector<double> kt;
        for (size_t i = 0; i < rippleT.size(); ++i) { double k = (now() - rippleT[i]) / .6; if (k >= 1) continue; ka.push_back(rippleAt[i]); kt.push_back(rippleT[i]); double rad = std::max(r.width(), r.height()) * 2 * k; p.setPen(Qt::NoPen); p.setBrush(QColor(255, 255, 255, int(85 * (1 - k)))); p.drawEllipse(rippleAt[i], rad, rad); }
        rippleAt = ka; rippleT = kt; p.restore();
    }
    if (loading) { p.setPen(QPen(dom.color, 2)); QPointF c = r.center(); p.drawArc(QRectF(c.x() - 8, c.y() - 8, 16, 16), int(-std::fmod(now() * 500, 360) * 16), 270 * 16); ticker().want(this, true); }
    else {
        QRectF lr = r;
        if (dom.padding.count("left") && length(dom.padding.at("left"), 0, fs) > pad) lr.adjust(length(dom.padding.at("left"), 0, fs) - pad, 0, 0, 0);
        if (dom.padding.count("right") && length(dom.padding.at("right"), 0, fs) > pad) lr.adjust(0, 0, -(length(dom.padding.at("right"), 0, fs) - pad), 0);
        const Style& b = UiStyle::get().style("btn", "::before", fl); const Style& a = UiStyle::get().style("btn", "::after", fl);
        QString label = (b.hasContent && !b.absolute ? b.content : "") + text() + (a.hasContent && !a.absolute ? a.content : "");
        if (h <= .001 || h >= .999) paintText(p, dom, lr, label, dom.font(baseFont(fs), fs));
        else { paintText(p, s0, lr, label, s0.font(baseFont(fs), fs), Qt::AlignCenter, {}, 1 - h); paintText(p, s1, lr, label, s1.font(baseFont(fs), fs), Qt::AlignCenter, {}, h); }
    }
    needsTick(!s0.anims.empty() || !s1.anims.empty());
}

// Card
Card::Card(QWidget* parent, int padding) : QFrame(parent), pad(padding) {
    new QVBoxLayout(this); boxInit(this, "card", 14); restyle();
    QObject::connect(&UiStyle::get(), &UiStyle::changed, this, [this] { restyle(); });
}
void Card::restyle() {
    const Style& st = UiStyle::get().style("card", "main", {});
    auto pv = [&](const char* sd) { auto it = st.padding.find(sd); return int(it != st.padding.end() ? length(it->second) : pad); };
    layout()->setContentsMargins(bleed + pv("left"), bleed + pv("top"), bleed + pv("right"), bleed + pv("bottom"));
    QPalette pal = palette(); pal.setColor(QPalette::WindowText, st.color); pal.setColor(QPalette::Text, st.color); setPalette(pal);
}
void Card::enterEvent(QEnterEvent* e) { hoverTo(true); QFrame::enterEvent(e); }
void Card::leaveEvent(QEvent* e) { hoverTo(false); QFrame::leaveEvent(e); }
void Card::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    QRectF r = QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed);
    const Style& s0 = UiStyle::get().style("card", "main", {}); const Style& s1 = UiStyle::get().style("card", "main", {"hover"});
    applyTransform(p, r, s0, s1); paintStates(p, r, "main", {});
    for (auto sub : {"::before", "::after"}) { const Style& ps = UiStyle::get().style("card", sub, {}); if (ps.hasContent && ps.absolute) paintBox(p, ps, pseudoRect(ps, r)); }
    paintRing(p, r, h > .5 ? s1 : s0); needsTick(!s0.anims.empty() || !s1.anims.empty());
}

// LineEdit
LineEdit::LineEdit(const QString& text, const QString& placeholder, QWidget* parent) : QLineEdit(text, parent) {
    setPlaceholderText(placeholder); setFrame(false); boxInit(this, "input", 6); restyle();
    QObject::connect(&UiStyle::get(), &UiStyle::changed, this, [this] { restyle(); });
}
void LineEdit::restyle() {
    const Style& st = UiStyle::get().style("input", "main", {}); const Style& ph = UiStyle::get().style("input", "placeholder", {});
    int padX = st.radius.contains("999") ? 16 : 12; setTextMargins(bleed + padX, 0, bleed + padX, 0);
    setStyleSheet(QString("QLineEdit { background: transparent; border: none; color: %1; selection-background-color: %2; }").arg(st.color.name(), UiStyle::get().color("accent").name()));
    setFont(st.font(baseFont(15), 15));
    QPalette pal = palette(); pal.setColor(QPalette::PlaceholderText, ph.decl.count("color") ? ph.color : UiStyle::get().color("muted")); setPalette(pal);
}
QSize LineEdit::sizeHint() const { return QSize(std::max(200, QLineEdit::sizeHint().width()), 44 + 2 * bleed); }
void LineEdit::paintEvent(QPaintEvent* e) {
    { QPainter p(this); p.setRenderHint(QPainter::Antialiasing); std::set<QString> f; if (hasFocus()) f.insert("focus"); paintStates(p, QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed), "main", f); }
    QLineEdit::paintEvent(e);
}

// Switch
Switch::Switch(const QString& text, bool checked, QWidget* parent) : QAbstractButton(parent) {
    setText(text); setCheckable(true); setChecked(checked); setCursor(Qt::PointingHandCursor); c = checked ? 1 : 0;
    canim = new QVariantAnimation(this); canim->setDuration(260); canim->setEasingCurve(QEasingCurve::OutBack);
    connect(canim, &QVariantAnimation::valueChanged, this, [this](const QVariant& v) { c = v.toDouble(); update(); });
    connect(this, &QAbstractButton::toggled, this, [this](bool on) { canim->stop(); canim->setStartValue(c); canim->setEndValue(on ? 1.0 : 0.0); canim->start(); });
    boxInit(this, "switch", 6);
}
QSize Switch::sizeHint() const {
    const Style& st = UiStyle::get().style("switch", "i", {}); double w = length(st.get("width", "46px")), h = length(st.get("height", "26px"));
    double tw = text().isEmpty() ? 0 : QFontMetricsF(baseFont(14)).horizontalAdvance(text()) + 10;
    return QSize(int(w + tw + 2 * bleed + 2), int(std::max(h, 22.0) + 2 * bleed));
}
void Switch::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    const Style& off = UiStyle::get().style("switch", "i", {}); const Style& on = UiStyle::get().style("switch", "i", {"checked"});
    double w = length(off.get("width", "46px")), h = length(off.get("height", "26px"));
    QRectF tr(bleed, (height() - h) / 2, w, h); double cc = std::clamp(c, 0.0, 1.0);
    if (cc < .999) paintBox(p, off, tr, {}, 1 - cc); if (cc > .001) paintBox(p, on, tr, {}, cc);
    const Style& lb = UiStyle::get().style("switch", "i::before", c > .5 ? std::set<QString>{"checked"} : std::set<QString>{});
    if (lb.hasContent && !lb.content.isEmpty()) paintText(p, lb, pseudoRect(lb, tr), lb.content, lb.font(baseFont(9), 9));
    const Style& k0 = UiStyle::get().style("switch", "i::after", {}); const Style& k1 = UiStyle::get().style("switch", "i::after", {"checked"});
    QRectF kr = pseudoRect(k0, tr); kr.translate(lerp(transformOf(k0).dx, transformOf(k1).dx, c), 0);
    paintBox(p, c < .5 ? k0 : k1, kr);
    if (!text().isEmpty()) { p.setPen(UiStyle::get().color("text")); p.setFont(baseFont(14)); p.drawText(QRectF(tr.right() + 10, 0, width(), height()), Qt::AlignVCenter | Qt::AlignLeft, text()); }
}

// CheckBox
CheckBox::CheckBox(const QString& text, bool checked, bool radio_, QWidget* parent) : QAbstractButton(parent), radio(radio_) {
    setText(text); setCheckable(true); setChecked(checked); setCursor(Qt::PointingHandCursor); if (radio) setAutoExclusive(true); boxInit(this, "check", 4);
}
QSize CheckBox::sizeHint() const { double tw = text().isEmpty() ? 0 : QFontMetricsF(baseFont(14)).horizontalAdvance(text()) + 10; return QSize(int(26 + tw + 2 * bleed), 30); }
void CheckBox::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    std::set<QString> fl; if (isChecked()) fl.insert("checked"); if (radio) fl.insert("radio");
    const Style& st = UiStyle::get().style("check", "input", fl); double s = length(st.get("width", "20px")); if (s <= 0) s = 20;
    QRectF br(bleed, (height() - s) / 2, s, s); paintBox(p, st, br);
    if (isChecked()) {
        const Style& mk = UiStyle::get().style("check", "input::after", fl);
        bool hasBox = (mk.hasBg && mk.bgColor.alpha()) || !mk.layers.empty();
        QPointF c = br.center(); double k = s / 20;
        if (hasBox && mk.geom.count("width")) { double mw = length(mk.geom.at("width")), mh = mk.geom.count("height") ? length(mk.geom.at("height")) : mw; paintBox(p, mk, QRectF(c.x() - mw / 2, c.y() - mh / 2, mw, mh)); }
        else {
            QColor col = mk.decl.count("border-top-color") ? mk.bcol[0] : UiStyle::get().color("bg");
            if (radio) { p.setPen(Qt::NoPen); p.setBrush(col); p.drawEllipse(c, 3.6 * k, 3.6 * k); }
            else { p.setPen(QPen(col, std::max(2.0, s / 8), Qt::SolidLine, Qt::RoundCap, Qt::RoundJoin)); QPainterPath path(QPointF(c.x() - 4.5 * k, c.y() + .2 * k)); path.lineTo(c.x() - 1.2 * k, c.y() + 3.5 * k); path.lineTo(c.x() + 5 * k, c.y() - 3.5 * k); p.setBrush(Qt::NoBrush); p.drawPath(path); }
        }
    }
    if (!text().isEmpty()) { p.setPen(UiStyle::get().color("text")); p.setFont(baseFont(14)); p.drawText(QRectF(br.right() + 10, 0, width(), height()), Qt::AlignVCenter | Qt::AlignLeft, text()); }
}

// Slider
Slider::Slider(int value, int mn, int mx, QWidget* parent) : QSlider(Qt::Horizontal, parent) { setRange(mn, mx); setValue(value); boxInit(this, "range", 6); }
void Slider::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    double f = double(value() - minimum()) / std::max(1, maximum() - minimum());
    const Style& st = UiStyle::get().style("range", "main", {}, {{"v", QString::number(f * 100, 'f', 2) + "%"}});
    const Style& th = UiStyle::get().style("range", "thumb", {});
    double tw = length(th.get("width", "16px")), thh = length(th.get("height", "16px")), h = length(st.get("height", "6px")); if (tw <= 0) tw = 16; if (thh <= 0) thh = 16; if (h <= 0) h = 6;
    QRectF r(bleed + tw / 2, (height() - h) / 2, width() - 2 * bleed - tw, h); paintBox(p, st, r);
    paintBox(p, th, QRectF(r.x() + r.width() * f - tw / 2, height() / 2.0 - thh / 2, tw, thh));
}

// TabBar
TabBar::TabBar(const QStringList& tabs, QWidget* parent) : QTabBar(parent) {
    setDrawBase(false); setExpanding(false); for (auto& t : tabs) addTab(t);
    ianim = new QVariantAnimation(this); ianim->setDuration(420); ianim->setEasingCurve(QEasingCurve::OutBack);
    connect(ianim, &QVariantAnimation::valueChanged, this, [this](const QVariant& v) { ind = v.toRectF(); update(); });
    connect(this, &QTabBar::currentChanged, this, [this](int i) { QRectF tgt = tabRect(i); if (ind.isNull()) { ind = tgt; update(); return; } ianim->stop(); ianim->setStartValue(ind); ianim->setEndValue(tgt); ianim->start(); });
    boxInit(this, "tabs", 6);
}
QSize TabBar::tabSizeHint(int i) const { const Style& st = UiStyle::get().style("tabs", "button", {"selected"}); return QSize(int(QFontMetricsF(st.font(baseFont(14), 14)).horizontalAdvance(st.upper ? tabText(i).toUpper() : tabText(i)) + 34), 38); }
void TabBar::paintEvent(QPaintEvent*) {
    if (!count()) return;
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    const Style& main = UiStyle::get().style("tabs", "main", {}); double pad = main.padding.count("top") ? length(main.padding.at("top")) : 4;
    QRectF all = QRectF(tabRect(0)).united(QRectF(tabRect(count() - 1))).adjusted(-pad, -pad, pad, pad).intersected(QRectF(rect()).adjusted(1, 1, -1, -1));
    paintBox(p, main, all);
    if (ind.isNull()) ind = tabRect(currentIndex());
    const Style& is = UiStyle::get().style("tabs", "ind", {});
    if (is.get("display") != "none") { QRectF ir = ind.adjusted(0, 2, 0, -2); if (is.geom.count("height") && is.get("top") == "auto") ir = QRectF(ir.x(), all.bottom() - length(is.geom.at("height")), ir.width(), length(is.geom.at("height"))); paintBox(p, is, ir); }
    for (int i = 0; i < count(); ++i) {
        const Style& bs = UiStyle::get().style("tabs", "button", i == currentIndex() ? std::set<QString>{"selected"} : std::set<QString>{});
        QRectF tr = QRectF(tabRect(i)).adjusted(0, 2, 0, -2);
        if ((bs.hasBg && bs.bgColor.alpha()) || !bs.layers.empty() || bs.bw[0] || bs.bw[1] || !bs.shadows.empty()) paintBox(p, bs, tr);
        paintText(p, bs, tr, tabText(i), bs.font(baseFont(14), 14));
    }
}

// ProgressBar
ProgressBar::ProgressBar(int value, QWidget* parent) : QProgressBar(parent) { setValue(value); setTextVisible(false); boxInit(this, "progress", 4); }
QSize ProgressBar::sizeHint() const { double h = length(UiStyle::get().style("progress", "main", {}).get("height", "8px")); return QSize(220, int((h > 0 ? h : 8) + 2 * bleed + 4)); }
void ProgressBar::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    const Style& st = UiStyle::get().style("progress", "main", {}); const Style& bar = UiStyle::get().style("progress", "bar", {});
    double h = length(st.get("height", "8px")); if (h <= 0) h = 8;
    QRectF r(bleed, (height() - h) / 2, width() - 2 * bleed, h); paintBox(p, st, r);
    double f = double(value() - minimum()) / std::max(1, maximum() - minimum());
    auto pd = [&](const char* sd) { auto it = st.padding.find(sd); return it != st.padding.end() ? length(it->second) : 0.0; };
    QRectF in = r.adjusted(st.bw[3] + pd("left"), st.bw[0] + pd("top"), -st.bw[1] - pd("right"), -st.bw[2] - pd("bottom"));
    p.save(); p.setClipPath(shapeOf(st, r), Qt::IntersectClip); paintBox(p, bar, QRectF(in.x(), in.y(), in.width() * f, in.height()), animState(bar, now())); p.restore();
    needsTick(!bar.anims.empty());
}

// Spinner
Spinner::Spinner(int size, QWidget* parent) : QWidget(parent), s(size) { boxInit(this, "spinner", 6); ticker().want(this, true); }
QSize Spinner::sizeHint() const { return QSize(int(s * 1.8) + 2 * bleed, s + 2 * bleed); }
void Spinner::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    const Style& st = UiStyle::get().style("spinner", "main", {});
    double w = st.get("width").startsWith("calc") ? s * 1.8 : s; QRectF r((width() - w) / 2, (height() - s) / 2.0, w, s);
    Anim a = animState(st, now()); QPointF c = r.center();
    p.save(); p.translate(c.x() + a.dx, c.y() + a.dy); p.rotate(a.rot); p.scale(a.sx, a.sy); p.translate(-c.x(), -c.y());
    Anim a2; a2.angle = a.angle; a2.opacity = a.opacity; paintBox(p, st, r, a2); p.restore();
    for (auto sub : {"::before", "::after"}) {
        const Style& ps = UiStyle::get().style("spinner", sub, {}); if (!ps.hasContent) continue;
        QRectF pr = ps.absolute ? pseudoRect(ps, r) : r; Anim pa = animState(ps, now() + (QString(sub) == "::after" ? .7 : 0)); QPointF cc = pr.center();
        p.save(); p.translate(cc); p.scale(pa.sx, pa.sy); p.translate(-cc); paintBox(p, ps, pr, {}, pa.opacity); p.restore();
    }
}

// Badge
Badge::Badge(const QString& t, const QString& k, QWidget* parent) : QWidget(parent), text(t), kind(k) { boxInit(this, "badge", 4); }
QSize Badge::sizeHint() const {
    const Style& st = UiStyle::get().style("badge", "main", {}, {{"k", kindVar(kind)}});
    bool dot = UiStyle::get().style("badge", "::before", {}, {{"k", kindVar(kind)}}).hasContent;
    return QSize(int(QFontMetricsF(st.font(baseFont(12), 12)).horizontalAdvance(st.upper ? text.toUpper() : text) + 22 + (dot ? 14 : 0) + 2 * bleed), 22 + 2 * bleed);
}
void Badge::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    Map v{{"k", kindVar(kind)}};
    const Style& st = UiStyle::get().style("badge", "main", {}, v); QRectF r = QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed);
    QPointF c = r.center(); p.translate(c); p.rotate(transformOf(st).rot); p.translate(-c);
    paintBox(p, st, r, animState(st, now()));
    const Style& b = UiStyle::get().style("badge", "::before", {}, v); const Style& a = UiStyle::get().style("badge", "::after", {}, v);
    QRectF tr = r;
    if (b.hasContent && b.geom.count("width")) { double d = length(b.geom.at("width")); paintBox(p, b, QRectF(r.x() + 10, c.y() - d / 2, d, d)); tr.adjust(14, 0, 0, 0); }
    paintText(p, st, tr, (b.hasContent ? b.content : "") + text + (a.hasContent ? a.content : ""), st.font(baseFont(12), 12));
    needsTick(!st.anims.empty());
}

// Alert
Alert::Alert(const QString& t, const QString& k, bool toast_, QWidget* parent) : QWidget(parent), text(t), kind(k), toast(toast_) { setSizePolicy(QSizePolicy::Expanding, QSizePolicy::Fixed); boxInit(this, "alert", 6); }
void Alert::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    Map v{{"k", kindVar(kind)}};
    const Style& st = UiStyle::get().style("alert", "main", {}, v); QRectF r = QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed);
    QPointF c = r.center(); p.translate(c); p.rotate(transformOf(st).rot); p.translate(-c);
    paintBox(p, st, r);
    QRectF tr = r.adjusted(16 + st.bw[3], 0, -16, 0);
    if (toast) {
        QRectF ic(tr.x(), c.y() - 11, 22, 22);
        Style dot(Map{{"background", kind == "success" ? "#2f9e5a" : kind == "danger" ? "#d0342c" : kind == "warn" ? "#c98a12" : "#2b5fb4"}, {"border-radius", "50%"}, {"color", "#ffffff"}}, Map{}, Qt::white);
        paintBox(p, dot, ic); paintText(p, dot, ic, kind == "success" ? "✓" : kind == "info" ? "i" : "!", baseFont(12)); tr.adjust(32, 0, 0, 0);
    }
    p.setFont(st.font(baseFont(14), 14)); p.setPen(st.color); p.drawText(tr, Qt::AlignVCenter | Qt::AlignLeft | Qt::TextWordWrap, text);
}

// Heading
Heading::Heading(const QString& t, int size, QWidget* parent) : QWidget(parent), text(t), px(size) { boxInit(this, "head", 10); }
QSize Heading::sizeHint() const { const Style& st = UiStyle::get().style("head", "main", {}); QFontMetricsF fm(st.font(baseFont(px, UiStyle::get().fontFamily("head")), px)); return QSize(int(fm.horizontalAdvance(st.upper ? text.toUpper() : text) + 2 * bleed + 12), int(fm.height() + 2 * bleed)); }
void Heading::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    const Style& st = UiStyle::get().style("head", "main", {}); Anim a = animState(st, now()); p.translate(a.dx, a.dy);
    paintText(p, st, QRectF(rect()).adjusted(bleed, 0, -bleed, 0), text, st.font(baseFont(px, UiStyle::get().fontFamily("head")), px), Qt::AlignLeft | Qt::AlignVCenter, a);
    needsTick(!st.anims.empty());
}

// NavBar
NavBar::NavBar(const QStringList& it, int cur, bool vert, QWidget* parent) : QWidget(parent), items(it), current(cur), vertical(vert) { setMouseTracking(true); setCursor(Qt::PointingHandCursor); boxInit(this, "nav", 6); }
std::vector<QRectF> NavBar::rects() const {
    const Style& st = UiStyle::get().style("nav", "item", {"current"});
    std::vector<QRectF> out; QFontMetricsF fm(st.font(baseFont(14), 14)); double x = bleed + 8, y = bleed + 8;
    for (auto& t : items) { double w = fm.horizontalAdvance(st.upper ? t.toUpper() : t) + 24; if (vertical) { out.push_back(QRectF(x, y, width() - 2 * x, 34)); y += 36; } else { out.push_back(QRectF(x, y, w, 34)); x += w + 4; } }
    return out;
}
QSize NavBar::sizeHint() const {
    if (vertical) return QSize(200, int(items.size() * 36 + 16 + 2 * bleed));
    const Style& st = UiStyle::get().style("nav", "item", {"current"}); QFontMetricsF fm(st.font(baseFont(14), 14));
    double w = 16 + 2 * bleed; for (auto& t : items) w += fm.horizontalAdvance(st.upper ? t.toUpper() : t) + 28; return QSize(int(w), 50 + 2 * bleed);
}
void NavBar::mouseMoveEvent(QMouseEvent* e) { int n = -1; auto rs = rects(); for (size_t i = 0; i < rs.size(); ++i) if (rs[i].contains(e->position())) n = int(i); if (n != hi) { hi = n; update(); } }
void NavBar::leaveEvent(QEvent* e) { hi = -1; update(); QWidget::leaveEvent(e); }
void NavBar::mousePressEvent(QMouseEvent* e) { auto rs = rects(); for (size_t i = 0; i < rs.size(); ++i) if (rs[i].contains(e->position()) && int(i) != current) { current = int(i); update(); emit currentChanged(current); } }
void NavBar::paintEvent(QPaintEvent*) {
    QPainter p(this); p.setRenderHint(QPainter::Antialiasing);
    paintBox(p, UiStyle::get().style("nav", "main", vertical ? std::set<QString>{"vertical"} : std::set<QString>{}), QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed));
    auto rs = rects();
    for (int i = 0; i < items.size(); ++i) {
        std::set<QString> f; if (i == current) f.insert("current"); if (i == hi) f.insert("hover");
        const Style& st = UiStyle::get().style("nav", "item", f);
        if ((st.hasBg && st.bgColor.alpha()) || !st.layers.empty() || !st.shadows.empty() || st.bw[0] || st.bw[3]) paintBox(p, st, rs[i]);
        paintText(p, st, vertical ? rs[i].adjusted(12, 0, 0, 0) : rs[i], items[i], st.font(baseFont(14), 14), vertical ? (Qt::AlignLeft | Qt::AlignVCenter) : Qt::AlignCenter);
    }
}

// Surface & Dialog
Surface::Surface(QWidget* parent) : QWidget(parent) { boxInit(this, "bg", 0); }
void Surface::paintEvent(QPaintEvent*) { QPainter p(this); p.fillRect(rect(), UiStyle::get().color("bg")); paintBox(p, UiStyle::get().style("bg", "main", {}), QRectF(rect())); }
Dialog::Dialog(QWidget* parent) : QDialog(parent) {
    setWindowFlags(Qt::Dialog | Qt::FramelessWindowHint); setAttribute(Qt::WA_TranslucentBackground);
    auto* l = new QVBoxLayout(this); l->setContentsMargins(46, 46, 46, 46); boxInit(this, "modal", 24);
}
void Dialog::paintEvent(QPaintEvent*) { QPainter p(this); p.setRenderHint(QPainter::Antialiasing); paintBox(p, UiStyle::get().style("modal", "main", {"open"}), QRectF(rect()).adjusted(bleed, bleed, -bleed, -bleed)); }

}  // namespace uv3
