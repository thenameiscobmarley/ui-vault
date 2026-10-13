/*! UI Vault 3 · skins3d.js — real-time 3D objects in animated "mastery camo" materials (WebGL 1, no libraries). MIT
 *  Declarative:  <div class="uv-3d" data-uv-3d="obsidian" data-shape="blade"></div>
 *                optional: data-spin="0.5" (turns per 10 s), data-tilt="0.35", data-drag (rotate with the pointer), data-still,
 *                data-sync (every synced object turns in step), data-light="1.2" (studio brightness),
 *                data-fps="15" (cap its frame rate) + data-hover-fps (full speed while hovered), data-res="0.75" (render scale)
 *  Imperative:   const v = UV.skins3d.mount(el, { material, shape, spin, tilt, drag, sync }) → v.set({ material, shape, hold }), v.stop()
 *                UV.skins3d.pause() / .resume() stop and restart every object
 *  Lists:        UV.skins3d.materials  (name → { label, group, desc })    UV.skins3d.shapes  (["blade", "gem", …])
 *  Cheap on integrated graphics: one small canvas per object, drawn only while on screen, 30 fps on ≤4-core machines,
 *  pixel ratio capped, and at most 12 live WebGL contexts (the oldest off-screen one is released and rebuilt on return).
 */
(function (global) {
  "use strict";
  const UV = global.UV = global.UV || {};

  // ── materials: each is a GLSL body for  M mat(vec3 p, inout vec3 N, vec3 V)  (p = object-space position, t = time) ──
  const MATS = {
    obsidian: ["Obsidian", "Mastery", "black volcanic glass: deep gloss, oil-slick filaments drifting under the surface, a slow light sweep", `
      M m = M(vec3(.010, .010, .014), 0., .05, vec3(0.), 1.);
      vec3 q = p * 1.5;
      float w = fbm(q + vec3(0., -t * .10, t * .04));
      float f = fbm(q * 1.6 + w * 2.4 + vec3(t * .06, 0., 0.));
      float vein = 1. - smoothstep(0., .028, abs(f - .5));                 // thin contour filaments
      float mask = smoothstep(.36, .62, fbm(q * .7 + vec3(t * .03, 0., 0.)));   // only some regions glow
      float nv = 1. - max(dot(N, V), 0.);
      vec3 iri = pal(f * 1.6 + nv * .9 + t * .04, vec3(.5), vec3(.5), vec3(1.), vec3(.0, .33, .67));
      m.emit = iri * (vein * mask * 1.25 + pow(nv, 4.) * .14);
      m.emit += iri * pow(fbm(q * 1.2 - V * .35 + vec3(0., 0., t * .05)), 4.) * .22;   // a glimmer deep inside the glass
      float band = smoothstep(.05, 0., abs(fract(dot(p, normalize(vec3(1., .55, .3))) * .22 - t * .07) - .5));
      m.emit += vec3(.8, .85, 1.) * band * (.06 + vein * .6);
      return m;`],
    "obsidian-molten": ["Molten Obsidian", "Mastery", "black glass split by glowing cracks that breathe with heat", `
      M m = M(vec3(.012, .010, .010), 0., .08, vec3(0.), 1.);
      vec3 v = vor(p * 2.6 + vec3(0., t * .03, 0.));
      float crack = smoothstep(.07, 0., v.y - v.x);
      float pulse = .55 + .45 * sin(t * 1.8 + v.z * 6.283);
      m.emit = mix(vec3(1., .22, .02), vec3(1., .75, .3), crack * pulse) * crack * pulse * 2.4;
      m.emit += vec3(1., .3, .05) * smoothstep(.22, 0., v.y - v.x) * .18 * pulse;
      return m;`],
    gold: ["Gold", "Mastery", "polished 24-carat gold with travelling sparkles", `
      N = normalize(N + (vec3(n3(p * 7.), n3(p * 7. + 3.), n3(p * 7. + 7.)) - .5) * .14);   // hammered, so flat faces catch light
      M m = M(vec3(1., .74, .30), 1., .13 + fbm(p * 18.) * .06, vec3(0.), .0);
      float s = pow(n3(p * 42. + vec3(t * .6, 0., 0.)), 28.) * 6.;
      m.emit = vec3(1., .9, .6) * s * pow(1. - max(dot(N, V), 0.), .5);
      return m;`],
    platinum: ["Platinum", "Mastery", "bright platinum with a faint pearl cast", `
      N = normalize(N + (vec3(n3(p * 6.), n3(p * 6. + 3.), n3(p * 6. + 7.)) - .5) * .1);
      float nv = 1. - max(dot(N, V), 0.);
      M m = M(vec3(.86, .88, .93) + pal(nv + p.y * .3, vec3(0.), vec3(.03), vec3(1.), vec3(0., .33, .67)), 1., .09, vec3(0.), .0);
      return m;`],
    damascus: ["Damascus", "Mastery", "folded steel: flowing light and dark bands", `
      float k = (p.y + p.x * .45 + fbm(p * 2.4) * .8) * 30.;
      float b = smoothstep(.3, .7, .5 + .5 * sin(k));
      N = normalize(N + vec3(0., cos(k), sin(k)) * .05);   // the bands are slightly raised
      M m = M(mix(vec3(.16, .17, .19), vec3(.80, .82, .86), b), 1., mix(.34, .14, b), vec3(0.), .0);
      return m;`],
    diamond: ["Diamond", "Mastery", "faceted ice with rainbow fire and twinkling cuts", `
      vec3 v = vor(p * 4.2);
      vec3 jit = vec3(h3(vec3(v.z * 91.)), h3(vec3(v.z * 37.)), h3(vec3(v.z * 13.))) - .5;
      N = normalize(N + jit * .35);
      M m = M(vec3(.92, .95, 1.), .85, .02, vec3(0.), .6);
      float nv = max(dot(N, V), 0.);
      m.emit = pal(v.z + nv * 2. + t * .05, vec3(.5), vec3(.5), vec3(1.), vec3(0., .33, .67)) * .07;
      m.emit += vec3(1.) * pow(max(0., sin(t * 2.6 + v.z * 40.)), 40.) * smoothstep(.25, .0, v.x) * 2.5;
      return m;`],
    "dark-matter": ["Dark Matter", "Mastery", "black with violet nebula stripes sliding across and pinprick stars", `
      M m = M(vec3(.02, .01, .03), .5, .18, vec3(0.), .7);
      float s = fbm(p * 1.3 + vec3(0., t * .07, 0.));
      float b = fract(s * 5. + p.y * .6 - t * .08);
      float stripe = smoothstep(0., .06, b) * smoothstep(.32, .1, b);
      vec3 c = pal(s + t * .03, vec3(.45, .2, .6), vec3(.4, .2, .4), vec3(1.), vec3(.8, .9, .3));
      m.emit = c * stripe * 1.3;
      vec3 cell = floor(p * 26.);
      m.emit += vec3(.85, .75, 1.) * step(.986, h3(cell)) * (.5 + .5 * sin(t * 3. + h3(cell + 3.) * 30.));
      return m;`],
    "dark-aether": ["Dark Aether", "Mastery", "deep violet steel crawling with electric veins", `
      M m = M(vec3(.03, .02, .06), .7, .24, vec3(0.), .4);
      float r = pow(clamp(1. - abs(fbm(p * 2.2 + vec3(t * .15, 0., -t * .1)) * 2. - 1.), 0., 1.), 9.);
      m.emit = mix(vec3(.45, .2, 1.), vec3(.25, .95, 1.), fbm(p + t * .05)) * r * 1.8;
      return m;`],
    interstellar: ["Interstellar", "Mastery", "a pocket of space: nebula and stars with real depth inside the surface", `
      M m = M(vec3(.004, .006, .016), 0., .05, vec3(0.), 1.);
      for (int k = 0; k < 2; k++) {
        float fk = float(k);
        vec3 q = p - V * (.18 + fk * .28);
        float neb = fbm(q * 1.8 + vec3(t * .03, 0., fk * 4.));
        m.emit += pal(neb + fk * .25, vec3(.3, .2, .5), vec3(.4, .3, .4), vec3(1.), vec3(.6, .75, .95)) * pow(neb, 3.) * (1.1 - fk * .4);
        vec3 c = floor(q * (50. + fk * 30.));
        m.emit += vec3(1.) * step(.991, h3(c + fk * 7.)) * (.6 + .4 * sin(t * 2. + h3(c) * 20.)) * (1. - fk * .4);
      }
      return m;`],
    atomic: ["Atomic", "Mastery", "radioactive green energy swirling in dark steel", `
      M m = M(vec3(.02, .06, .03), .4, .2, vec3(0.), .5);
      float sw = fbm(p * 2. + fbm(p * 2. + vec3(0., t * .25, 0.)) * 2.);
      float r = pow(clamp(1. - abs(sw * 2. - 1.), 0., 1.), 6.);
      m.emit = mix(vec3(.1, .9, .3), vec3(.75, 1., .55), r) * (r * 1.5 + pow(sw, 4.) * .8);
      return m;`],
    borealis: ["Borealis", "Mastery", "aurora curtains rippling over black lacquer", `
      M m = M(vec3(.008, .014, .02), 0., .06, vec3(0.), 1.);
      float c = fbm(vec3(p.x * 2., p.y * .35 - t * .09, p.z * 2.));
      float a = smoothstep(.42, .78, c) * (.55 + .45 * sin(p.y * 11. + c * 10. - t * 1.2));
      m.emit = mix(vec3(.1, 1., .6), vec3(.65, .2, 1.), smoothstep(-.6, .9, p.y + c)) * a * 1.3;
      return m;`],
    lava: ["Lava", "Elemental", "cooling crust over a river of fire", `
      float flow = fbm(p * 2. + vec3(0., -t * .18, 0.) + fbm(p * 3.) * .8);
      float hot = smoothstep(.52, .78, flow);
      M m = M(vec3(.05, .04, .04), 0., .75 - hot * .5, vec3(0.), .15);
      m.emit = mix(vec3(1., .2, 0.), vec3(1., .85, .35), hot) * hot * 2.6;
      return m;`],
    prismatic: ["Prismatic", "Iridescent", "colour-shifting chrome that changes with every angle", `
      float nv = 1. - max(dot(N, V), 0.);
      M m = M(pal(nv * 1.3 + fbm(p * 1.5) * .8 + t * .05, vec3(.6), vec3(.4), vec3(1.), vec3(0., .33, .67)), 1., .1, vec3(0.), .2);
      return m;`],
    pearl: ["Pearl", "Iridescent", "white pearlescent with a mint-pink-lilac sheen", `
      float nv = 1. - max(dot(N, V), 0.);
      vec3 tint = pal(nv * 1.1 + fbm(p * 1.2) * .5 + t * .02, vec3(.88), vec3(.12), vec3(1.), vec3(.1, .4, .7));
      M m = M(tint, .25, .14, vec3(0.), 1.);
      return m;`],
    holo: ["Holo Foil", "Iridescent", "rainbow diffraction foil that ripples as it turns", `
      float nv = max(dot(N, V), 0.);
      vec3 rainbow = pal(nv * 2.2 + p.y * 1.6 + fract(dot(p, vec3(26., 9., 3.))) * .15 + t * .08, vec3(.6), vec3(.4), vec3(1.), vec3(0., .33, .67));
      M m = M(rainbow, 1., .14, vec3(0.), .3);
      return m;`],
    "liquid-chrome": ["Liquid Chrome", "Metal", "a mirror that ripples like mercury", `
      N = normalize(N + vec3(sin(p.y * 8. + t * 1.5), sin(p.z * 9. - t * 1.2), sin(p.x * 7. + t)) * .1);
      M m = M(vec3(.95, .96, .98), 1., .03, vec3(0.), .0);
      return m;`],
    carbon: ["Carbon Fiber", "Metal", "woven carbon under a thick clear coat", `
      vec2 g = (p.xy + p.z * .5) * 14.;
      float c = mod(floor(g.x) + floor(g.y), 2.);
      float fib = .5 + .5 * sin((c > .5 ? g.x : g.y) * 18.);
      M m = M(mix(vec3(.025), vec3(.085), c * .5 + fib * .35), .25, mix(.28, .42, c), vec3(0.), 1.);
      return m;`],
    "case-hardened": ["Case Hardened", "Metal", "heat-blued steel with gold and purple patina", `
      float b = fbm(p * 1.8);
      vec3 c = mix(vec3(.14, .28, .72), vec3(.86, .66, .26), smoothstep(.35, .65, b));
      c = mix(c, vec3(.5, .24, .6), smoothstep(.6, .8, fbm(p * 3. + 7.)) * .6);
      M m = M(c, 1., .2, vec3(0.), .0);
      return m;`],
    ruby: ["Ruby Doppler", "Gem", "deep red candy metal with drifting light", `
      M m = M(mix(vec3(.45, 0., .03), vec3(1., .08, .14), fbm(p * 2. + t * .03)), 1., .07, vec3(0.), .5);
      return m;`],
    sapphire: ["Sapphire Doppler", "Gem", "electric blue candy metal", `
      M m = M(mix(vec3(0., .05, .45), vec3(.15, .45, 1.), fbm(p * 2. + t * .03)), 1., .07, vec3(0.), .5);
      return m;`],
    emerald: ["Emerald Doppler", "Gem", "rich green candy metal", `
      M m = M(mix(vec3(0., .3, .08), vec3(.15, 1., .45), fbm(p * 2. + t * .03)), 1., .08, vec3(0.), .5);
      return m;`],
    "marble-fade": ["Marble Fade", "Gem", "red, yellow and blue swirled into polished metal", `
      float s = p.y * .8 + fbm(p * 1.6) * 1.2;
      vec3 c = mix(vec3(.95, .1, .05), vec3(1., .82, .1), smoothstep(-.4, .2, s));
      c = mix(c, vec3(.1, .3, 1.), smoothstep(.4, .9, s));
      M m = M(c, 1., .1, vec3(0.), .2);
      return m;`],
    "tiger-tooth": ["Tiger Tooth", "Gem", "gold anodised with orange tiger stripes", `
      float s = smoothstep(.45, .55, .5 + .5 * sin(p.x * 9. + fbm(p * 2.5) * 5.));
      M m = M(mix(vec3(1., .78, .25), vec3(.95, .35, .02), s), 1., .12, vec3(0.), .0);
      return m;`],
    "crimson-web": ["Crimson Web", "Camo", "dark red with a black spider-web pattern", `
      vec3 v = vor(p * 2.2);
      float line = smoothstep(.04, 0., v.y - v.x);
      M m = M(mix(vec3(.32, .01, .03), vec3(.01), line), .6, .2, vec3(0.), .3);
      return m;`],
    "digital-camo": ["Arctic Digital", "Camo", "pixelated snow camouflage", `
      float a = h3(floor(p * 7.)), b = h3(floor(p * 15.) + 9.);
      vec3 c = a > .66 ? vec3(.92, .94, .96) : a > .33 ? vec3(.62, .68, .74) : vec3(.32, .38, .46);
      c = mix(c, vec3(.82, .86, .9), step(.7, b) * .7);
      M m = M(c, 0., .55, vec3(0.), .1);
      return m;`],
    "neon-grid": ["Neon Grid", "Cyber", "black gloss with a glowing circuit grid and travelling pulses", `
      M m = M(vec3(.01, .012, .02), .3, .1, vec3(0.), 1.);
      vec3 g = abs(fract(p * 5.) - .5);
      float line = smoothstep(.045, .0, min(min(g.x, g.y), g.z) - .0);
      float pulse = smoothstep(.9, 1., sin(p.y * 3. + p.x * 2. - t * 2.5));
      m.emit = mix(vec3(0., .9, 1.), vec3(1., .2, .9), pulse) * line * (.9 + pulse * 2.);
      return m;`],
  };

  // ── shared shader code ──
  const VS = `attribute vec3 aP; attribute vec3 aN;
uniform mat4 uVP; uniform mat4 uM; uniform mat3 uR;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
void main() { vec4 w = uM * vec4(aP, 1.); vW = w.xyz; vN = uR * aN; vP = aP; gl_Position = uVP * w; }`;
  const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float t; uniform vec3 uCam; uniform float uLight;
varying vec3 vP; varying vec3 vN; varying vec3 vW;
struct M { vec3 base; float metal; float rough; vec3 emit; float coat; };
float h3(vec3 p) { p = fract(p * .3183099 + .1); p *= 17.; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float n3(vec3 x) { vec3 i = floor(x), f = fract(x); f = f * f * (3. - 2. * f);
  return mix(mix(mix(h3(i), h3(i + vec3(1., 0., 0.)), f.x), mix(h3(i + vec3(0., 1., 0.)), h3(i + vec3(1., 1., 0.)), f.x), f.y),
             mix(mix(h3(i + vec3(0., 0., 1.)), h3(i + vec3(1., 0., 1.)), f.x), mix(h3(i + vec3(0., 1., 1.)), h3(i + vec3(1., 1., 1.)), f.x), f.y), f.z); }
float fbm(vec3 p) { float v = 0., a = .5; for (int i = 0; i < 4; i++) { v += a * n3(p); p = p * 2.02 + vec3(1.7, 9.2, 3.1); a *= .5; } return v; }
float ss(float a, float b, float x) { float k = clamp((x - a) / (b - a), 0., 1.); return k * k * (3. - 2. * k); }   // also fine with a > b
vec3 pal(float x, vec3 a, vec3 b, vec3 c, vec3 d) { return a + b * cos(6.28318 * (c * x + d)); }
vec3 vor(vec3 p) { vec3 i = floor(p), f = fract(p); float d1 = 8., d2 = 8., id = 0.;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
    vec3 g = vec3(float(x), float(y), float(z)); vec3 o = vec3(h3(i + g), h3(i + g + 11.3), h3(i + g + 27.1));
    vec3 r = g + o - f; float d = dot(r, r);
    if (d < d1) { d2 = d1; d1 = d; id = h3(i + g + 5.7); } else if (d < d2) d2 = d; }
  return vec3(sqrt(d1), sqrt(d2), id); }
// a dark product studio: soft top box, two strip lights, a warm rim, floor bounce
vec3 env(vec3 r, float rough) {
  float w = .015 + rough * .55;
  vec3 c = mix(vec3(.015, .016, .02), vec3(.16, .17, .19), smoothstep(-.6, 1., r.y)) * (.6 + .4 * smoothstep(1., .1, abs(r.x)));
  c += vec3(2.4) * smoothstep(.0, -w, max(abs(r.x + .1) - .42, abs(r.z + .15) - .5)) * smoothstep(.5 - w, .78, r.y);
  c += vec3(1.1, 1.15, 1.3) * smoothstep(w * 1.4, 0., abs(r.x - .9) - .03) * smoothstep(-.8, -.2, r.y) * smoothstep(.95, .45, r.y);
  c += vec3(1.3, .8, .5) * smoothstep(w * 1.4, 0., abs(r.x + .93) - .03) * smoothstep(-.5, .3, r.y) * .8;
  c += vec3(.05, .045, .04) * smoothstep(-.2, -.9, r.y);
  return c * uLight;
}
M mat(vec3 p, inout vec3 N, vec3 V);
void main() {
  vec3 N = normalize(vN); vec3 V = normalize(uCam - vW);
  if (dot(N, V) < 0.) N = -N;
  M m = mat(vP, N, V);
  float nv = max(dot(N, V), 0.);
  vec3 R = reflect(-V, N);
  vec3 F0 = mix(vec3(.04), m.base, m.metal);
  vec3 F = F0 + (1. - F0) * pow(1. - nv, 5.) * (1. - m.rough * .7);
  vec3 L = normalize(vec3(-.45, .8, .55));
  float dif = max(dot(N, L), 0.) * .85 + .1;
  vec3 col = m.base * (1. - m.metal) * dif * (1. - F) + env(R, m.rough) * F;
  col += env(R, .015) * (.04 + .96 * pow(1. - nv, 5.)) * m.coat * .9;
  col += m.emit;
  col = (col * (2.51 * col + .03)) / (col * (2.43 * col + .59) + .14);
  gl_FragColor = vec4(pow(clamp(col, 0., 1.), vec3(1. / 2.2)), 1.);
}
`;

  // ── meshes (triangle soup: positions + normals, scaled to fit a unit sphere) ──
  const V3 = { sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]], cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
    norm: a => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; } };
  function soup() { const P = [], N = []; return { P, N, tri(a, b, c, na, nb, nc) {
    if (!na) { na = nb = nc = V3.norm(V3.cross(V3.sub(b, a), V3.sub(c, a))); }
    P.push(...a, ...b, ...c); N.push(...na, ...nb, ...nc); }, quad(a, b, c, d, na, nb, nc, nd) { this.tri(a, b, c, na, nb, nc); this.tri(a, c, d, na, nc, nd); } }; }
  function grid(nu, nv, f, s = soup()) {   // f(u, v) → [pos, normal]
    const pts = []; for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) pts.push(f(i / nu, j / nv));
    const at = (i, j) => pts[j * (nu + 1) + i];
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) { const a = at(i, j), b = at(i + 1, j), c = at(i + 1, j + 1), d = at(i, j + 1); s.quad(a[0], b[0], c[0], d[0], a[1], b[1], c[1], d[1]); }
    return s;
  }
  // ear clipping for simple polygons ([[x, y], …], counter-clockwise)
  function earcut(poly) {
    const idx = poly.map((_, i) => i), out = [];
    const area2 = (a, b, c) => (b[0] - a[0]) * (c[1] - a[1]) - (b[1] - a[1]) * (c[0] - a[0]);
    const inside = (p, a, b, c) => area2(a, b, p) >= 0 && area2(b, c, p) >= 0 && area2(c, a, p) >= 0;
    let guard = 0;
    while (idx.length > 3 && guard++ < 5000) {
      let cut = false;
      for (let k = 0; k < idx.length; k++) {
        const ia = idx[(k + idx.length - 1) % idx.length], ib = idx[k], ic = idx[(k + 1) % idx.length];
        const a = poly[ia], b = poly[ib], c = poly[ic];
        if (area2(a, b, c) <= 0) continue;
        if (idx.some(j => j !== ia && j !== ib && j !== ic && inside(poly[j], a, b, c))) continue;
        out.push([ia, ib, ic]); idx.splice(k, 1); cut = true; break;
      }
      if (!cut) break;
    }
    if (idx.length === 3) out.push(idx.slice());
    return out;
  }
  // extrude a 2D outline with a chamfered edge (nice highlights) — depth = half thickness
  function extrude(poly, depth, bevel, s = soup()) {
    const n = poly.length;
    const en = poly.map((p, i) => { const q = poly[(i + 1) % n]; return V3.norm([q[1] - p[1], -(q[0] - p[0]), 0]); });   // outward edge normals (ccw)
    const vn = poly.map((_, i) => { const a = en[(i + n - 1) % n], b = en[i]; return V3.norm([a[0] + b[0], a[1] + b[1], 0]); });
    const inset = poly.map((p, i) => [p[0] - vn[i][0] * bevel, p[1] - vn[i][1] * bevel]);
    const tris = earcut(inset);
    for (const z of [depth, -depth]) for (const [a, b, c] of tris) {
      const A = [...inset[a], z], B = [...inset[b], z], C = [...inset[c], z], nz = [0, 0, Math.sign(z)];
      z > 0 ? s.tri(A, B, C, nz, nz, nz) : s.tri(A, C, B, nz, nz, nz);
    }
    const smooth = i => { const a = en[(i + n - 1) % n], b = en[i]; return a[0] * b[0] + a[1] * b[1] > .8; };
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, p = poly[i], q = poly[j], ip = inset[i], iq = inset[j];
      const ni = smooth(i) ? vn[i] : en[i], nj = smooth(j) ? vn[j] : en[i];
      const zb = depth - bevel;
      s.quad([...p, zb], [...q, zb], [...q, -zb], [...p, -zb], ni, nj, nj, ni);
      const ci = V3.norm([ni[0], ni[1], 1]), cj = V3.norm([nj[0], nj[1], 1]), ci2 = [ci[0], ci[1], -ci[2]], cj2 = [cj[0], cj[1], -cj[2]];
      s.quad([...ip, depth], [...iq, depth], [...q, zb], [...p, zb], ci, cj, cj, ci);
      s.quad([...p, -zb], [...q, -zb], [...iq, -depth], [...ip, -depth], ci2, cj2, cj2, ci2);
    }
    return s;
  }
  const arc = (cx, cy, r, a0, a1, k) => Array.from({ length: k + 1 }, (_, i) => { const a = a0 + (a1 - a0) * i / k; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r]; });
  const SHAPES = {
    sphere: () => grid(56, 36, (u, v) => { const th = u * Math.PI * 2, ph = v * Math.PI, p = [Math.sin(ph) * Math.cos(th), Math.cos(ph), Math.sin(ph) * Math.sin(th)]; return [p, p]; }),
    cube: () => {   // rounded cube: points on a subdivided cube pushed out from an inner box
      const s = soup(), b = .62, r = .38, n = 14;
      const face = (o, du, dv) => grid(n, n, (u, v) => {
        const p = [0, 1, 2].map(k => o[k] + du[k] * (u * 2 - 1) + dv[k] * (v * 2 - 1));
        const q = p.map(x => Math.max(-b, Math.min(b, x * (b + r)))), d = V3.norm(V3.sub(p.map(x => x * (b + r)), q));
        return [[0, 1, 2].map(k => q[k] + d[k] * r), d];
      }, s);
      face([0, 0, 1], [1, 0, 0], [0, 1, 0]); face([0, 0, -1], [-1, 0, 0], [0, 1, 0]); face([1, 0, 0], [0, 0, -1], [0, 1, 0]);
      face([-1, 0, 0], [0, 0, 1], [0, 1, 0]); face([0, 1, 0], [1, 0, 0], [0, 0, -1]); face([0, -1, 0], [1, 0, 0], [0, 0, 1]);
      return s;
    },
    torus: () => grid(72, 28, (u, v) => { const a = u * Math.PI * 2, b = v * Math.PI * 2, R = 1, r = .42;
      const c = [Math.cos(a) * R, 0, Math.sin(a) * R], nn = [Math.cos(a) * Math.cos(b), Math.sin(b), Math.sin(a) * Math.cos(b)];
      return [[c[0] + nn[0] * r, nn[1] * r, c[2] + nn[2] * r], nn]; }),
    knot: () => {
      const C = u => { const a = u * Math.PI * 2, r = 2 + Math.cos(3 * a); return [r * Math.cos(2 * a) * .36, Math.sin(3 * a) * .36, r * Math.sin(2 * a) * .36]; };
      return grid(220, 18, (u, v) => {
        const c = C(u), d = V3.norm(V3.sub(C(u + .001), C(u - .001))), up = [0, 1, 0];
        const nA = V3.norm(V3.cross(d, up)), nB = V3.cross(nA, d), b = v * Math.PI * 2;
        const nn = [0, 1, 2].map(k => nA[k] * Math.cos(b) + nB[k] * Math.sin(b));
        return [[0, 1, 2].map(k => c[k] + nn[k] * .16), nn];
      });
    },
    gem: () => {   // brilliant cut, flat facets
      const s = soup(), k = 12, ring = (y, r, off) => Array.from({ length: k }, (_, i) => { const a = (i + off) / k * Math.PI * 2; return [Math.cos(a) * r, y, Math.sin(a) * r]; });
      const top = ring(.42, .56, 0), crown = ring(.16, .9, .5), gird = ring(0, 1, 0), apex = [0, -1.05, 0], tc = [0, .42, 0];
      for (let i = 0; i < k; i++) { const j = (i + 1) % k;
        s.tri(tc, top[j], top[i]); s.tri(top[i], top[j], crown[i]); s.tri(top[j], crown[j], crown[i]);
        s.tri(crown[i], crown[j], gird[j]); s.tri(crown[i], gird[j], gird[i]); s.tri(gird[i], gird[j], apex); }
      return s;
    },
    coin: () => {   // a medal: lathe with a raised rim and a stepped face, turned to face the camera
      const pr = [[0, .07], [.7, .07], [.74, .11], [.9, .11], [.94, .1], [1, .04], [1, -.04], [.94, -.1], [.9, -.11], [.74, -.11], [.7, -.07], [0, -.07]];
      const s = soup(), k = 72, P = (r, y, a) => [Math.cos(a) * r, Math.sin(a) * r, y];
      for (let i = 0; i < pr.length - 1; i++) {
        const [r0, y0] = pr[i], [r1, y1] = pr[i + 1], len = Math.hypot(r1 - r0, y1 - y0), nr = -(y1 - y0) / len, ny = (r1 - r0) / len;
        const n = a => [Math.cos(a) * nr, Math.sin(a) * nr, ny];
        for (let j = 0; j < k; j++) { const a = j / k * Math.PI * 2, b = (j + 1) / k * Math.PI * 2;
          s.quad(P(r0, y0, a), P(r1, y1, a), P(r1, y1, b), P(r0, y0, b), n(a), n(a), n(b), n(b)); }
      }
      return s;
    },
    blade: () => {   // combat knife: clip-point blade, guard, grip, pommel
      const o = [];
      o.push([-1.32, -.1], [-1.22, -.16], [-.3, -.16], [-.28, -.2], [-.2, -.36], [-.14, -.36], [-.12, -.17]);
      o.push(...arc(.55, .62, .82, -Math.PI / 2 - .02, -.62, 10).map(([x, y]) => [x, y - .02]));
      o.push([1.42, .13], [1.0, .2], [.86, .17], [-.12, .17], [-.14, .36], [-.2, .36], [-.28, .2], [-.3, .16], [-1.22, .16], [-1.32, .1]);
      return extrude(o.map(([x, y]) => [x, y * 1.4]), .07, .04);
    },
    tag: () => {   // dog tag
      const w = .62, h = 1, r = .26, o = [];
      o.push(...arc(w - r, -h + r, r, -Math.PI / 2, 0, 8), ...arc(w - r, h - r, r, 0, Math.PI / 2, 8), ...arc(-w + r, h - r, r, Math.PI / 2, Math.PI, 8), ...arc(-w + r, -h + r, r, Math.PI, Math.PI * 1.5, 8));
      return extrude(o, .05, .04);
    },
  };
  const meshCache = {};
  function mesh(name) {
    if (meshCache[name]) return meshCache[name];
    const s = (SHAPES[name] || SHAPES.sphere)();
    let R = 0; for (let i = 0; i < s.P.length; i += 3) R = Math.max(R, Math.hypot(s.P[i], s.P[i + 1], s.P[i + 2]));
    const P = new Float32Array(s.P.map(v => v / R)), N = new Float32Array(s.N);
    return (meshCache[name] = { P, N, n: P.length / 3 });
  }

  // ── tiny matrix helpers (column-major) ──
  const persp = (fov, asp, n, f) => { const t = 1 / Math.tan(fov / 2); return [t / asp, 0, 0, 0, 0, t, 0, 0, 0, 0, (f + n) / (n - f), -1, 0, 0, 2 * f * n / (n - f), 0]; };
  const rot = (yaw, pitch) => { const cy = Math.cos(yaw), sy = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);   // Rx(pitch) · Ry(yaw)
    return [cy, sp * sy, -cp * sy, 0, 0, cp, sp, 0, sy, -sp * cy, cp * cy, 0, 0, 0, 0, 1]; };

  // ── renderer instances ──
  const live = new Set(), all = new Set();
  const MAX_CTX = 12;
  const fps = (navigator.hardwareConcurrency || 4) >= 8 ? 60 : 30;
  const reduce = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  let raf = 0, last = 0;
  const io = "IntersectionObserver" in global ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target._uv3d; if (!v) return;
    v.visible = e.isIntersecting; if (v.visible) { v.seen = performance.now(); live.add(v); } else live.delete(v);
    kick();
  }), { rootMargin: "120px" }) : null;
  let paused = false;
  const kick = () => { if (!raf && !paused && live.size && !document.hidden) raf = requestAnimationFrame(loop); };
  document.addEventListener("visibilitychange", kick);
  function loop(now) {
    raf = 0;
    if (now - last >= 1000 / fps - 2) { last = now; for (const v of live) {
      if (!v.el.isConnected) { v.stop(); continue; }
      const f = v.hot ? fps : Math.min(fps, v.fps || fps);
      if (!v.hold && now - (v.last || 0) >= 1000 / f - 2) { v.last = now; v.draw(now); }
    } }
    if (!reduce || [...live].some(v => v.dragging)) kick();
  }

  const sweep = () => { for (const v of all) if (!v.el.isConnected) v.stop(); };   // objects whose element was removed from the page
  function contextCount() { sweep(); let n = 0; for (const v of all) if (v.gl) n++; return n; }
  function freeOne() {   // release the WebGL context of the off-screen object seen longest ago
    let old = null; for (const v of all) if (v.gl && !v.visible && (!old || v.seen < old.seen)) old = v;
    if (old) old.release();
  }

  function mount(el, opts = {}) {
    if (el._uv3d) { el._uv3d.set(opts); return el._uv3d; }
    const d = el.dataset;
    const v = { el, material: opts.material || el.getAttribute("data-uv-3d") || "obsidian", shape: opts.shape || d.shape || "blade",
      spin: +(opts.spin ?? d.spin ?? .35), tilt: +(opts.tilt ?? d.tilt ?? .32), drag: opts.drag ?? ("drag" in d), still: opts.still ?? ("still" in d),
      yaw: +(opts.yaw ?? d.yaw ?? -.5), pitch: 0, vy: 0, vx: 0, t0: (opts.sync ?? ("sync" in d)) ? 0 : performance.now() - Math.random() * 4000, hold: !!opts.hold,
      fps: +(opts.fps ?? d.fps ?? 0), res: +(opts.res ?? d.res ?? 1), seen: 0, visible: false, gl: null };
    el._uv3d = v; el.classList.add("uv-3d");
    const cv = document.createElement("canvas"); cv.setAttribute("aria-hidden", "true"); el.prepend(cv); v.cv = cv;
    if (!el.hasAttribute("role")) { el.setAttribute("role", "img"); el.setAttribute("aria-label", `${(MATS[v.material] || MATS.obsidian)[0]} ${v.shape}`); }

    v.init = () => {
      if (contextCount() >= MAX_CTX) freeOne();
      const gl = v.cv.getContext("webgl", { antialias: true, alpha: true, premultipliedAlpha: true, powerPreference: "low-power", preserveDrawingBuffer: false })
        || v.cv.getContext("experimental-webgl");
      if (!gl) { el.classList.add("uv-3d--fallback"); return false; }
      v.gl = gl; v.progs = {}; v.bufs = {};
      gl.enable(gl.DEPTH_TEST);   // no face culling: the shader turns normals toward the camera
      return true;
    };
    v.prog = () => {
      const gl = v.gl, key = v.material;
      if (v.progs[key]) return v.progs[key];
      const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("[UV 3D]", key, gl.getShaderInfoLog(s)); return null; } return s; };
      const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, (HEAD + "M mat(vec3 p, inout vec3 N, vec3 V) {" + (MATS[key] || MATS.obsidian)[3] + "\n}").replace(/smoothstep\(/g, "ss("));
      if (!vs || !fs) return null;
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.bindAttribLocation(p, 0, "aP"); gl.bindAttribLocation(p, 1, "aN"); gl.linkProgram(p);
      const u = n => gl.getUniformLocation(p, n);
      return (v.progs[key] = { p, uVP: u("uVP"), uM: u("uM"), uR: u("uR"), t: u("t"), uCam: u("uCam"), uLight: u("uLight") });
    };
    v.buf = () => {
      const gl = v.gl, key = v.shape;
      if (v.bufs[key]) return v.bufs[key];
      const m = mesh(key), mk = data => { const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b); gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW); return b; };
      return (v.bufs[key] = { p: mk(m.P), n: mk(m.N), count: m.n });
    };
    v.release = () => {
      if (!v.gl) return;
      const ext = v.gl.getExtension("WEBGL_lose_context"); ext && ext.loseContext();
      v.gl = null; v.progs = {}; v.bufs = {};
      const fresh = document.createElement("canvas"); fresh.setAttribute("aria-hidden", "true"); v.cv.replaceWith(fresh); v.cv = fresh;   // a lost canvas can't get a new context
    };
    v.draw = now => {
      if (!v.gl && !v.init()) return;
      const gl = v.gl, c = v.cv;
      const dpr = Math.min(global.devicePixelRatio || 1, 1.5) * v.res, r = el.getBoundingClientRect();
      const W = Math.max(1, Math.round(Math.min(r.width * dpr, 900))), H = Math.max(1, Math.round(Math.min(r.height * dpr, 900 * r.height / Math.max(1, r.width))));
      if (c.width !== W || c.height !== H) { c.width = W; c.height = H; }
      const pr = v.prog(); if (!pr) return;
      const b = v.buf();
      const t = (now - v.t0) / 1000;
      if (!v.dragging) { v.yaw += v.vx; v.pitch += v.vy; v.vx *= .92; v.vy *= .92; v.pitch *= .96; }
      const yaw = v.yaw + (v.still ? 0 : t * v.spin * Math.PI * .2), pitch = v.tilt + v.pitch + (v.still ? 0 : Math.sin(t * .6) * .05);
      const Mx = rot(yaw, pitch), dist = 3.6, asp = W / H;
      const Pm = persp(asp < 1 ? 2 * Math.atan(Math.tan(.31) / asp) : .62, asp, .1, 20);   // keep the object in frame on tall boxes too
      const VP = Pm.slice();   // camera at (0,0,dist): VP = P · T(0,0,-dist)
      for (let k = 0; k < 4; k++) VP[12 + k] = Pm[12 + k] - dist * Pm[8 + k];
      gl.viewport(0, 0, W, H); gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
      gl.useProgram(pr.p);
      gl.uniformMatrix4fv(pr.uVP, false, VP); gl.uniformMatrix4fv(pr.uM, false, Mx);
      gl.uniformMatrix3fv(pr.uR, false, [Mx[0], Mx[1], Mx[2], Mx[4], Mx[5], Mx[6], Mx[8], Mx[9], Mx[10]]);
      gl.uniform1f(pr.t, v.still ? 4 : t); gl.uniform3f(pr.uCam, 0, 0, dist); gl.uniform1f(pr.uLight, +(el.dataset.light || 1));
      gl.bindBuffer(gl.ARRAY_BUFFER, b.p); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
      gl.bindBuffer(gl.ARRAY_BUFFER, b.n); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, 0, 0);
      gl.drawArrays(gl.TRIANGLES, 0, b.count);
    };
    v.set = (o = {}) => {
      if (o.material) { v.material = o.material; el.setAttribute("data-uv-3d", o.material); }
      if (o.shape) { v.shape = o.shape; el.dataset.shape = o.shape; }
      for (const k of ["spin", "tilt", "still", "hold"]) if (k in o) v[k] = o[k];
      el.setAttribute("aria-label", `${(MATS[v.material] || MATS.obsidian)[0]} ${v.shape}`);
      if (v.visible) { live.add(v); kick(); }
      if (reduce && v.gl) v.draw(performance.now());
    };
    v.stop = () => { io && io.unobserve(el); live.delete(v); all.delete(v); v.release(); v.cv.remove(); el._uv3d = null; };

    // pointer: drag to turn (with a little inertia); hover speeds the spin up
    if (v.drag) {
      el.style.touchAction = "pan-y"; el.style.cursor = "grab";
      let px = 0, py = 0;
      el.addEventListener("pointerdown", e => { v.dragging = true; px = e.clientX; py = e.clientY; el.setPointerCapture(e.pointerId); el.style.cursor = "grabbing"; kick(); });
      el.addEventListener("pointermove", e => { if (!v.dragging) return; const dx = (e.clientX - px) / 120, dy = (e.clientY - py) / 160; px = e.clientX; py = e.clientY; v.yaw += dx; v.pitch = Math.max(-1.2, Math.min(1.2, v.pitch + dy)); v.vx = dx; v.vy = dy * .5; });
      const up = () => { v.dragging = false; el.style.cursor = "grab"; };
      el.addEventListener("pointerup", up); el.addEventListener("pointercancel", up);
    }
    // data-hover-fps: a slow idle frame rate that goes full speed while the pointer is over it
    if ("hoverFps" in d || opts.hoverFps) { el.addEventListener("pointerenter", () => { v.hot = true; }); el.addEventListener("pointerleave", () => { v.hot = false; }); }
    if (v.drag) el.addEventListener("pointerdown", () => { v.hot = true; });
    all.add(v);
    if (io) io.observe(el); else { v.visible = true; live.add(v); kick(); }
    if (reduce) requestAnimationFrame(() => v.draw(performance.now()));
    return v;
  }

  const pause = (on = true) => { paused = on; if (!on) kick(); };
  UV.skins3d = { mount, pause, resume: () => pause(false), materials: Object.fromEntries(Object.entries(MATS).map(([k, m]) => [k, { label: m[0], group: m[1], desc: m[2] }])), shapes: Object.keys(SHAPES) };
  if (!document.getElementById("uv-3d-css")) {
    const st = document.createElement("style"); st.id = "uv-3d-css";
    st.textContent = `.uv-3d{position:relative;display:block;aspect-ratio:1;isolation:isolate}
.uv-3d>canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.uv-3d--shadow::after{content:"";position:absolute;left:22%;right:22%;bottom:6%;height:8%;z-index:-1;border-radius:50%;background:radial-gradient(closest-side,#0008,transparent)}
.uv-3d--fallback{background:radial-gradient(circle at 35% 30%,#555,#111 60%,transparent 61%)}`;
    document.head.appendChild(st);
  }
  const scan = (root = document) => root.querySelectorAll("[data-uv-3d]").forEach(el => el._uv3d || mount(el));
  if (UV.use) UV.use("skins3d", scan);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => scan()); else scan();
})(window);
