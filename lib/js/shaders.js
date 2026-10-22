/*! UI Vault 3 · shaders.js — animated WebGL shader backgrounds that follow the theme colours (WebGL 1, no libraries). MIT
 *  Declarative:  <section data-uv-shader="liquid"> … </section>
 *                optional: data-speed="1" · data-res="0.5" (render scale) · data-fps="30" · data-hover-fps (full speed while hovered)
 *                data-colors="#ff4f00,#7b5cff,#0b0b10,#ffffff" (accent, accent-2, background, ink; default: the element's theme tokens)
 *                data-still (one frame, no animation) · data-no-pointer
 *                data-mode="auto|dark|theme": on light themes most effects draw on a dark stage made from the theme's ink ("auto");
 *                "dark" forces that for every effect, "theme" always uses the theme background
 *  Imperative:   const v = UV.shaders.mount(el, { shader, speed, res, fps, colors }) → v.set({ shader, speed, colors }), v.stop()
 *                UV.shaders.pause() / .resume() · UV.shaders.list (name → { label, group, desc })
 *  The canvas sits behind the element's content (the element becomes an isolated stacking context), so text stays on top.
 *  One shared WebGL context renders every effect and copies it into each element's own 2D canvas: no context limit,
 *  even with dozens on a page. Off-screen effects stop, frame rate is capped on small CPUs, prefers-reduced-motion shows a still.
 */
(function (global) {
  "use strict";
  const UV = global.UV = global.UV || {};

  // name: [label, group, description, GLSL body of  vec3 shade(vec2 uv, vec2 p)  (uv 0..1, p centred, y in -1..1), render scale]
  // Uniforms: t (seconds × speed), R (pixels), M (pointer uv), Mi (0..1 pointer present), A B C D (accent, accent-2, background, ink)
  // Helpers: h21 h22 n2 fbm rot pal grade(x: bg → accent → accent-2) mp() (pointer in p space)
  const SH = {
    // ── Gradient & flow ──
    liquid: ["Liquid gradient", "Gradient", "domain-warped colour that pours slowly across the surface", `
      vec2 q = p * .9; float s = t * .08;
      vec2 w = vec2(fbm(q + vec2(s, -s)), fbm(q + vec2(5.2, 1.3) - s));
      float f = fbm(q + 2.2 * w + (M - .5) * .6 * Mi);
      return grade(f * 1.25 - .18) + (B - C) * w.x * .05;`],
    aurora: ["Aurora", "Gradient", "northern-light curtains rippling over the night", `
      vec3 col = C * .92;
      for (int i = 0; i < 3; i++) {
        float fi = float(i);
        float y = .58 + fi * .1 + .07 * sin(p.x * 1.3 + t * .3 + fi * 2.) + .05 * fbm(vec2(p.x * 2. + t * .1, fi * 7.));
        float band = exp(-pow((uv.y - y) * 7., 2.)) + .6 * exp(-pow((uv.y - y + .12) * 3., 2.)) * step(uv.y, y);
        float rays = .55 + .45 * n2(vec2(p.x * 14. + fi * 3., t * .5));
        col += mix(A, B, fi * .5) * band * rays * .55;
      }
      return col + A * .06 * (1. - uv.y);`],
    silk: ["Silk", "Gradient", "folds of satin catching a soft highlight", `
      float a = sin(p.x * 1.8 + sin(p.y * 2. + t * .4) * 1.2 + t * .3) + sin(p.y * 3.1 - t * .25 + sin(p.x * 1.3) * 1.5);
      float s = .5 + .5 * sin(a * 2.2);
      return mix(C, mix(A, B, uv.x), s * .8) + pow(s, 7.) * .3 * (D * .5 + .5);`],
    "lava-lamp": ["Lava lamp", "Gradient", "molten blobs that merge, split and follow the pointer", `
      float v = 0.;
      for (int i = 0; i < 7; i++) {
        float fi = float(i);
        vec2 c = vec2(sin(t * .23 * (1. + fi * .13) + fi * 1.7) * 1.15, sin(t * .31 * (1. + fi * .07) + fi * 2.3) * .72);
        v += (.1 + .03 * sin(fi)) / dot(p - c, p - c);
      }
      vec2 m = p - mp(); v += .14 * Mi / dot(m, m);
      float k = smoothstep(.92, 1.08, v);
      return mix(C, mix(A, B, uv.y), k) + A * smoothstep(.35, 1., v) * .18 * (1. - k);`],
    marble: ["Ink marble", "Gradient", "inks swirled on water, like marbled paper", `
      vec2 q = p;
      for (int i = 0; i < 4; i++) { float fi = float(i); q += .35 * vec2(sin(q.y * 2.1 + t * .2 + fi), cos(q.x * 1.9 - t * .17 + fi * 1.3)); }
      float s = .5 + .5 * sin(q.x * 2. + q.y * 1.3);
      return mix(C, mix(A, B, .5 + .5 * sin(q.y)), smoothstep(.25, .75, s)) + D * .05 * smoothstep(.48, .5, abs(s - .5));`],
    mesh: ["Mesh gradient", "Gradient", "four soft colour points drifting, one follows the pointer", `
      vec2 c1 = vec2(-.8 + .3 * sin(t * .3), .5 + .2 * cos(t * .25)), c2 = vec2(.9 + .2 * cos(t * .2), -.4 + .3 * sin(t * .35)), c3 = vec2(.2 * sin(t * .4), -.9 + .2 * cos(t * .3));
      float w1 = 1. / (.2 + dot(p - c1, p - c1)), w2 = 1. / (.2 + dot(p - c2, p - c2)), w3 = 1.5 / (.3 + dot(p - c3, p - c3)), w4 = Mi * .6 / (.15 + dot(p - mp(), p - mp()));
      return (A * w1 + B * w2 + C * w3 + mix(A, B, .5) * w4) / (w1 + w2 + w3 + w4) + (h21(uv * R + fract(t)) - .5) * .035;`],
    dunes: ["Dunes", "Gradient", "layered sand dunes under a setting sun", `
      vec3 col = mix(mix(A, B, .5), C, smoothstep(.2, 1., uv.y));
      col += A * .5 * smoothstep(.22, .0, length(p - vec2(.35, .25)));
      for (int i = 0; i < 5; i++) {
        float fi = float(i);
        float h = .56 - fi * .1 + .06 * sin(p.x * (1.2 + fi * .5) + t * (.06 + fi * .04) + fi * 2.) + .025 * sin(p.x * 4. + fi);
        if (uv.y < h) col = mix(mix(A, B, fi / 4.), C, fi / 5. + .1) * (.75 + (h - uv.y) * .9);
      }
      return col;`],
    glow: ["Grain glow", "Gradient", "two glowing orbs breathing under film grain", `
      vec2 a = vec2(-.6 + .2 * sin(t * .4), .2 * cos(t * .3)), b = vec2(.7 + .15 * cos(t * .35), -.3 + .2 * sin(t * .27));
      vec3 col = C + A * .55 * exp(-dot(p - a, p - a) * 1.6) + B * .5 * exp(-dot(p - b, p - b) * 1.9);
      return col + (h21(uv * R + fract(t * 3.)) - .5) * .07;`, .6],
    // ── Pattern ──
    plasma: ["Plasma", "Pattern", "the classic demoscene plasma in theme colours", `
      float v = sin(p.x * 3. + t) + sin(p.y * 3. + t * 1.3) + sin((p.x + p.y) * 2. + t * .7) + sin(length(p - mp() * Mi) * 5. - t * 1.5);
      return mix(grade(.5 + .5 * sin(v * 1.2)), pal(v * .15 + t * .05), .22);`],
    voronoi: ["Living cells", "Pattern", "Voronoi cells drifting with glowing walls", `
      vec2 q = p * 3., i = floor(q), f = fract(q); float d1 = 8., d2 = 8.;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++) {
        vec2 g = vec2(float(x), float(y)), o = .5 + .45 * sin(t * .6 + 6.2831 * h22(i + g));
        float d = length(g + o - f);
        if (d < d1) { d2 = d1; d1 = d; } else if (d < d2) d2 = d;
      }
      return mix(C, A, d1 * .45) + B * smoothstep(.07, 0., d2 - d1) * .9;`],
    truchet: ["Truchet flow", "Pattern", "random quarter-circle tiles that form endless flowing paths", `
      vec2 q = p * 4. + vec2(t * .15, 0.), i = floor(q), f = fract(q);
      if (h21(i) > .5) f.x = 1. - f.x;
      float d = min(abs(length(f) - .5), abs(length(f - 1.) - .5));
      float line = smoothstep(.09, .05, d);
      return mix(C, mix(A, B, .5 + .5 * sin(t + (i.x + i.y) * .5)), line) + A * smoothstep(.25, 0., d) * .12;`],
    hex: ["Hex pulse", "Pattern", "a honeycomb with waves rippling out from the pointer", `
      vec2 q = p * 5., r = vec2(1., 1.732), h = r * .5;
      vec2 a = mod(q, r) - h, b = mod(q - h, r) - h, l = dot(a, a) < dot(b, b) ? a : b, id = q - l;
      vec2 al = abs(l); float e = .5 - max(dot(al, vec2(.5, .866)), al.x);
      float d = length(id / 5. - mp() * Mi);
      float w = .5 + .5 * sin(d * 9. - t * 3.);
      return C + mix(A, B, w) * smoothstep(.07, 0., e) * (.25 + .75 * w) + A * .12 * w * smoothstep(.2, .5, e);`],
    kaleido: ["Kaleidoscope", "Pattern", "eight mirrored slices of turning colour", `
      float a = atan(p.y, p.x), r = length(p), k = 6.2831 / 8.;
      a = mod(a + t * .05, k); a = abs(a - k * .5);
      vec2 q = r * vec2(cos(a), sin(a)) + t * .05;
      float f = fbm(q * 2.5 + vec2(t * .1, 0.));
      return grade(f * 1.4) * (1. - r * .2) + B * pow(f, 4.) * .7;`],
    moire: ["Moiré", "Pattern", "two sets of rings interfering", `
      float d1 = length(p - vec2(.4 * sin(t * .3), .3 * cos(t * .2))), d2 = length(p - vec2(-.5 * cos(t * .25), .2 * sin(t * .35)));
      float v = sin(d1 * 40.) * sin(d2 * 40.);
      return C + A * smoothstep(0., .4, v) * .8 + B * smoothstep(0., .4, -v) * .5;`],
    topo: ["Topography", "Pattern", "slowly shifting contour lines with bolder index lines", `
      float h = fbm(p * .8 + vec2(t * .03, -t * .02)) * 10.;
      float v = fract(h), major = step(4.5, mod(floor(h), 5.));
      float line = smoothstep(.36 - major * .05, .47, abs(v - .5));
      return C + mix(A, B, h / 10.) * line * (.5 + major * .5);`],
    halftone: ["Halftone wave", "Pattern", "print dots swelling in a travelling wave", `
      vec2 q = p * 14., g = fract(q) - .5, id = floor(q);
      float w = .5 + .5 * sin(length(id) * .35 - t * 1.6 + fbm(id * .1) * 3.);
      float r = .1 + .32 * w;
      return mix(C, mix(A, B, w), smoothstep(r, r - .07, length(g)));`],
    opart: ["Op-art", "Pattern", "warped black-and-white stripes that bend your eyes", `
      float v = sin((p.x + .35 * sin(p.y * 3. + t) + .2 * sin(length(p) * 6. - t * 1.5)) * 18.);
      return mix(C, D, smoothstep(-.15, .15, v)) * .9 + A * .1;`],
    dots: ["Magnetic dots", "Pattern", "a dot grid that bulges toward the pointer", `
      vec2 m = mp(), d = p - m; float k = Mi * .25 * exp(-dot(d, d) * 2.5);
      vec2 q = (p - d * k) * 10., g = fract(q) - .5;
      float r = .12 + .5 * k + .03 * sin(t + floor(q.x) * .4 + floor(q.y) * .3);
      return mix(C, mix(mix(C, D, .35), A, clamp(k * 5., 0., 1.)), smoothstep(r, r - .06, length(g)));`],
    // ── Space & 3D ──
    starfield: ["Warp stars", "Space", "flying through a field of stars", `
      vec3 col = C * .7;
      for (int i = 0; i < 4; i++) {
        float fi = float(i), depth = fract(fi * .25 + t * .08), scale = mix(18., .6, depth), fade = depth * smoothstep(1., .85, depth);
        vec2 q = p * scale + fi * 45.3, gv = fract(q) - .5, id = floor(q); float n = h21(id);
        float d = length(gv - (vec2(n, fract(n * 34.)) - .5) * .8);
        col += mix(D, A, fract(n * 7.)) * .025 / d * smoothstep(.5, .1, d) * fade;
      }
      return col;`],
    tunnel: ["Tunnel", "Space", "racing down an endless ringed tunnel", `
      float a = atan(p.y, p.x), r = length(p);
      vec2 q = vec2(a / 6.2831, .35 / max(r, .01) + t * .5);
      float rings = pow(.5 + .5 * sin(q.y * 6.2831 * 2.), 18.), spokes = pow(.5 + .5 * sin(a * 8. + q.y * 2.), 10.);
      vec3 col = mix(C, mix(A, B, .5 + .5 * sin(q.y)), .35) * smoothstep(0., .8, r);
      return col + A * rings * smoothstep(.05, .5, r) + B * spokes * .35 * smoothstep(.1, .7, r);`],
    synthwave: ["Synthwave", "Space", "a striped sun over an endless neon grid", `
      float hz = .42; vec3 col;
      if (uv.y > hz) {
        col = mix(mix(B, C, .4), C, (uv.y - hz) * 1.7);
        vec2 sp = p - vec2(0., .32); float r = length(sp);
        float cut = sp.y > 0. ? 1. : step(.42, fract(sp.y * 9. + t * .4));
        col = mix(col, mix(B, A, smoothstep(-.4, .5, sp.y)), smoothstep(.5, .49, r) * cut);
        col += A * .22 * smoothstep(1., .3, r);
      } else {
        float y = hz - uv.y, z = .25 / (y + .002);
        vec2 g = vec2((uv.x - .5) * z * 2.2, z + t * 1.5), l = abs(fract(g) - .5);
        float line = smoothstep(.5 - .04 * z, .5, max(l.x, l.y)) * smoothstep(0., .1, y);
        col = C * .7 + A * line + B * .25 * smoothstep(.2, 0., y);
      }
      return col;`],
    galaxy: ["Spiral galaxy", "Space", "a slowly turning spiral of dust and stars", `
      vec2 q = p * rot(t * .05); float r = length(q), a = atan(q.y, q.x);
      float arms = pow(.5 + .5 * sin(a * 2. - log(r + .01) * 4.5), 3.);
      float dust = fbm(q * 3. + t * .03);
      vec3 col = C + mix(A, B, smoothstep(0., 1.2, r)) * arms * exp(-r * 1.5) * (.6 + dust) * 1.3 + D * exp(-r * 7.) * .9;
      vec2 s = floor(uv * R / 2.); return col + D * step(.997, h21(s)) * (.5 + .5 * sin(t * 3. + h21(s + 3.) * 30.));`],
    portal: ["Portal", "Space", "rings of light turning around a glowing core", `
      float r = length(p), a = atan(p.y, p.x); vec3 col = C + A * .5 * exp(-r * 4.);
      for (int i = 0; i < 6; i++) {
        float fi = float(i), ri = .25 + fi * .14;
        float dash = step(.35, fract(a / 6.2831 * (6. + fi * 4.) + t * (fi - 2.5) * .06 + fi * .3));
        col += mix(A, B, fi / 5.) * smoothstep(.014, 0., abs(r - ri)) * dash;
      }
      return col;`],
    planet: ["Planet", "Space", "a banded world turning in the light of its star", `
      vec2 c = p * 1.3; float r2 = dot(c, c);
      vec3 col = C + D * step(.996, h21(floor(uv * R / 2.))) * .8;
      if (r2 < 1.) {
        vec3 n = vec3(c, sqrt(1. - r2)); float s = t * .12;
        vec3 nr = vec3(n.x * cos(s) + n.z * sin(s), n.y, -n.x * sin(s) + n.z * cos(s));
        float bands = fbm(vec2(nr.x * 2. + nr.z * 1.3, nr.y * 6.));
        float light = max(dot(n, normalize(vec3(-.6, .4, .7))), 0.);
        col = grade(.25 + bands * .9) * (.08 + .92 * light);
      }
      float e = sqrt(r2); return col + A * smoothstep(1.2, 1., e) * smoothstep(.8, 1., e) * .7;`, .6],
    cubes: ["Cube field", "Space", "flying through an infinite lattice of cubes (ray marched)", `
      vec3 ro = vec3(0., 0., t * 1.2), rd = normalize(vec3(p, 1.6));
      rd.xy *= rot(t * .08); float d = 0., tt = 0.;
      for (int i = 0; i < 56; i++) {
        vec3 q = ro + rd * tt; q.xy *= rot(q.z * .08);
        vec3 c = mod(q, 2.) - 1.;
        d = length(max(abs(c) - .26, 0.)) - .05;
        if (d < .003 || tt > 26.) break;
        tt += d;
      }
      float fog = exp(-tt * .09);
      return mix(C, mix(A, B, .5 + .5 * sin(tt * .25 + t * .2)) * (.5 + .5 * fog), fog) + A * .06 * (1. - fog);`, .5],
    orbits: ["HUD rings", "Space", "a sci-fi heads-up display of turning dashed rings", `
      float r = length(p), a = atan(p.y, p.x); vec3 col = C;
      for (int i = 0; i < 5; i++) {
        float fi = float(i), ri = .3 + fi * .17;
        float dash = step(.5, fract(a / 6.2831 * (8. + fi * 4.) + t * (fi - 2.) * .05));
        col += mix(A, B, fi / 4.) * smoothstep(.012, 0., abs(r - ri)) * (.35 + .65 * dash);
      }
      float sweep = fract((a / 6.2831) - t * .15);
      return col + A * pow(sweep, 14.) * smoothstep(1.1, .1, r) * .5;`],
    // ── Nature ──
    ocean: ["Ocean", "Nature", "a calm sea to the horizon with glitter from the sun", `
      float hz = .45;
      if (uv.y > hz) return mix(mix(A, D, .5), C, smoothstep(hz, 1., uv.y)) + A * .4 * exp(-length(p - vec2(.3, .05)) * 4.);
      float y = hz - uv.y, z = .22 / (y + .003);
      vec2 q = vec2(p.x * z, z + t * .5);
      float h = fbm(q * 1.5 + vec2(0., t * .2));
      float glit = pow(n2(q * 18. + t * 2.), 18.) * 6. * exp(-abs(p.x - .3) * 3.);
      return mix(mix(B, C, .55), C, smoothstep(0., .45, y)) * (.7 + h * .5) + D * glit * smoothstep(.0, .2, y);`],
    clouds: ["Clouds", "Nature", "soft clouds drifting across the sky", `
      vec3 sky = mix(mix(A, D, .3), C, uv.y * .9);
      float f = fbm(p * 1.4 + vec2(t * .05, 0.)) + .5 * fbm(p * 3. - vec2(t * .08, 0.));
      return mix(sky, mix(D, A, .15), smoothstep(.55, 1.1, f));`],
    fire: ["Fire", "Nature", "flames licking up from the bottom edge", `
      vec2 q = vec2(p.x * 1.6, uv.y * 2.4 - t * 1.3);
      float n = fbm(q * 2. + vec2(0., fbm(q * 1.5)));
      float f = clamp((1. - uv.y) * 1.5 - n * 1.1 + .25, 0., 1.);
      vec3 fire = vec3(1.4, .45, .08) * f + vec3(1., .85, .4) * pow(f, 3.);
      return mix(C, fire, smoothstep(0., .25, f)) + A * f * .15;`],
    rain: ["Rain", "Nature", "rain streaks over blurred city lights", `
      vec3 col = C + A * .25 * smoothstep(.4, 1., fbm(p * 2.5 + 3.)) + B * .2 * smoothstep(.45, 1., fbm(p * 2. - 7.));
      for (int i = 0; i < 2; i++) {
        float fi = float(i), cols = 50. + fi * 40.;
        vec2 q = vec2(uv.x * cols, uv.y);
        float id = floor(q.x), sp = .6 + h21(vec2(id, fi)), y = fract(uv.y * (1.2 + fi) + t * sp * .7 + h21(vec2(id, 9. + fi)));
        col += D * smoothstep(0., .2, y) * smoothstep(.26, .2, y) * smoothstep(.45, 0., abs(fract(q.x) - .5)) * (.25 - fi * .1);
      }
      return col;`],
    caustics: ["Caustics", "Nature", "sunlight dancing on the floor of a pool", `
      vec2 q = p * 3.; float c = 0.;
      for (int i = 0; i < 4; i++) { float fi = float(i); q += vec2(sin(q.y * 1.3 + t * .6 + fi), cos(q.x * 1.1 - t * .5 + fi * 1.7)) * .45; c += 1. / (abs(sin(q.x) + sin(q.y)) * 7. + 1.); }
      return mix(C, A, .25) + mix(A, D, .6) * pow(c * .45, 3.);`],
    storm: ["Storm", "Nature", "rolling dark clouds split by lightning", `
      float f = fbm(p * 1.5 + vec2(t * .07, 0.));
      float k = floor(t * 1.7), flash = step(.86, h21(vec2(k, 1.))) * smoothstep(1., .5, fract(t * 1.7));
      vec3 col = C + mix(C, D, .25) * f * .8 + D * flash * .2 * f;
      float x = .9 * (h21(vec2(k, 2.)) - .5) + .25 * (fbm(vec2(uv.y * 6., k)) - .5) + .06 * (n2(vec2(uv.y * 40., k)) - .5);
      return col + mix(D, A, .3) * flash * .01 / (abs(p.x - x * 1.6) + .004) * smoothstep(.0, .5, uv.y);`],
    smoke: ["Smoke", "Nature", "wisps of smoke curling upward", `
      vec2 q = vec2(p.x, p.y - t * .25);
      vec2 w = vec2(fbm(q * 1.4 + t * .05), fbm(q * 1.4 + 4.));
      float f = fbm(q * 1.8 + w * 2.5);
      return C + mix(D, A, .3) * smoothstep(.4, .95, f) * .95 * (1.1 - uv.y * .6);`],
    bubbles: ["Bubbles", "Nature", "translucent bubbles rising", `
      vec3 col = mix(C, A * .4 + C * .6, 1. - uv.y);
      for (int i = 0; i < 3; i++) {
        float fi = float(i), sc = 4. + fi * 3.;
        vec2 q = p * sc + vec2(fi * 7.3, -t * (.6 + fi * .2) * sc * .15), id = floor(q), g = fract(q) - .5;
        float n = h21(id + fi * 13.);
        if (n > .55) { vec2 o = (h22(id) - .5) * .4; o.x += .1 * sin(t + n * 20.); float r = .12 + .18 * fract(n * 9.); float d = length(g - o);
          col += mix(D, B, n) * (smoothstep(r, r - .03, d) - smoothstep(r - .03, r - .06, d) * .8 + smoothstep(.05, 0., length(g - o + r * .45)) * .8) * (.6 - fi * .12); }
      }
      return col;`],
    fireflies: ["Fireflies", "Nature", "glowing specks drifting through a dark meadow", `
      vec3 col = C * .9 + A * .05 * (1. - uv.y);
      for (int i = 0; i < 3; i++) {
        float fi = float(i); vec2 q = p * (3. + fi * 1.5) + fi * 11.7, id = floor(q), g = fract(q) - .5;
        float n = h21(id); vec2 o = .32 * vec2(sin(t * (.3 + n) + n * 30.), cos(t * (.25 + n * .7) + n * 20.));
        float pulse = .5 + .5 * sin(t * (1. + n * 2.) + n * 40.);
        col += mix(A, B, n) * .018 / (length(g - o) + .01) * pulse * step(.4, n);
      }
      return col;`],
    // ── Retro & cyber ──
    static: ["TV static", "Retro", "analogue snow with a rolling bar", `
      float n = fract(sin(dot(floor(uv * R / 2.) + fract(floor(t * 24.) * .618) * vec2(91.7, 37.3), vec2(12.9898, 78.233))) * 43758.5453);
      float bar = smoothstep(.12, 0., abs(fract(uv.y * .7 - t * .15) - .5)) * .25;
      return mix(C, D, n * .55 + bar) * (.7 + .3 * sin(uv.y * R.y * 1.5));`, .5],
    glitch: ["Glitch", "Retro", "a gradient torn by RGB-split block glitches", `
      float k = floor(t * 6.), band = floor(uv.y * 18.);
      float g = step(.82, h21(vec2(band, k))) * (h21(vec2(band, k + 1.)) - .5) * .25;
      vec2 u = uv + vec2(g, 0.);
      vec3 base = vec3(grade(fbm(vec2(u.x * 3. - .03, u.y * 2.) + t * .1)).r, grade(fbm(u * vec2(3., 2.) + t * .1)).g, grade(fbm(vec2(u.x * 3. + .03, u.y * 2.) + t * .1)).b);
      float blk = step(.94, h21(floor(uv * vec2(14., 10.)) + k));
      return mix(base, mix(A, B, h21(vec2(k, band))), blk * .8) * (.92 + .08 * sin(uv.y * R.y * 2.));`],
    circuit: ["Circuit", "Retro", "circuit-board traces with pulses racing along them", `
      vec2 q = p * 6., i = floor(q), f = fract(q) - .5; float n = h21(i);
      vec2 dir = n < .25 ? vec2(1., 0.) : n < .5 ? vec2(0., 1.) : n < .75 ? vec2(1., 1.) : vec2(1., -1.);
      vec2 dn = normalize(dir); float along = dot(f, dn), off = abs(dot(f, vec2(-dn.y, dn.x)));
      float trace = smoothstep(.06, .03, off) * step(abs(along), .55);
      float pad = smoothstep(.13, .1, length(f)) - smoothstep(.07, .05, length(f));
      float pulse = smoothstep(.15, 0., abs(fract(along * .5 + t * .6 + n * 4.) - .5)) * trace;
      return C + mix(C, A, .5) * (trace * .45 + pad * .8) + B * pulse * 1.3;`],
    datastream: ["Data stream", "Retro", "columns of glyph blocks raining down", `
      vec2 q = vec2(uv.x * 46., uv.y * 30.), id = floor(q), g = fract(q);
      float sp = .5 + h21(vec2(id.x, 3.)), head = fract(-t * sp * .18 + h21(vec2(id.x, 7.)));
      float y = uv.y - head; float trail = y > 0. ? exp(-y * 9.) : 0.;
      float glyph = step(.3, h21(id + floor(t * 8. * sp))) * step(.15, g.x) * step(g.x, .85) * step(.12, g.y) * step(g.y, .88);
      return C + mix(A, D, smoothstep(.03, 0., y) * step(0., y)) * glyph * trail * 1.2;`, .6],
    crt: ["CRT", "Retro", "a curved tube screen with scanlines and a slow colour roll", `
      vec2 c = uv - .5; c *= 1. + dot(c, c) * .25; vec2 u = c + .5;
      if (u.x < 0. || u.x > 1. || u.y < 0. || u.y > 1.) return C * .3;
      vec3 col = grade(.5 + .5 * sin(u.x * 4. + u.y * 3. + t * .6));
      col *= .75 + .25 * sin(u.y * R.y * 3.14);
      return col * smoothstep(.75, .25, length(c));`],
    dna: ["Double helix", "Retro", "a turning DNA strand with glowing rungs", `
      vec3 col = C; float x = p.x * 3. + t * .8;
      float y1 = .45 * sin(x), y2 = -y1, depth = cos(x);
      col += A * smoothstep(.05, 0., abs(p.y - y1)) * (.6 + .4 * depth) + B * smoothstep(.05, 0., abs(p.y - y2)) * (.6 - .4 * depth);
      float rung = smoothstep(.12, 0., abs(fract(x / 3.1416 * 4.) - .5) - .38) * step(abs(p.y), abs(y1));
      return col + mix(A, B, .5) * rung * .35;`],
    // ── Interactive ──
    ripple: ["Ripple", "Interactive", "water rings spreading from the pointer", `
      vec2 m = Mi > .01 ? mp() : vec2(.6 * sin(t * .4), .4 * cos(t * .3));
      float d = length(p - m), w = sin(d * 28. - t * 6.) * exp(-d * 2.2);
      vec2 q = p + normalize(p - m + .0001) * w * .04;
      return grade(.1 + .5 * fbm(q * 1.6 + t * .03)) + mix(A, D, .5) * max(w, 0.) * .3;`],
    reveal: ["Reveal grid", "Interactive", "grid lines that light up around the pointer", `
      vec2 m = Mi > .01 ? mp() : vec2(.7 * sin(t * .3), .4 * sin(t * .45));
      vec2 g = abs(fract(p * 6.) - .5); float line = smoothstep(.47, .5, max(g.x, g.y));
      float near = exp(-length(p - m) * 2.2);
      return C + mix(D * .08, A, near) * line + A * near * .12 + B * near * smoothstep(.15, 0., length(fract(p * 6.) - .5)) * .5;`],
    spotlight: ["Spotlight", "Interactive", "a torch beam over a dark textured wall", `
      vec2 m = Mi > .01 ? mp() : vec2(.6 * sin(t * .35), .3 * cos(t * .5));
      float l = exp(-dot(p - m, p - m) * 3.);
      float tex = fbm(p * 5.) * .6 + .4 * step(.5, fract(p.x * 4. + step(.5, fract(p.y * 8.)) * .5)) * step(.06, fract(p.y * 8.));
      return C * .5 + mix(C, mix(A, D, .5), .6) * l * (.5 + tex * .8) + A * l * .15;`],
  };

  // these read well on a light background; every other effect draws on a dark stage (the theme's ink) when the theme is light
  const LIGHT_OK = new Set(["liquid", "silk", "lava-lamp", "marble", "mesh", "dunes", "plasma", "truchet", "kaleido", "halftone", "opart", "ripple", "clouds", "ocean", "voronoi"]);
  const lum = c => .2126 * c[0] + .7152 * c[1] + .0722 * c[2];

  const VS = "attribute vec2 a; varying vec2 vUv; void main() { vUv = a * .5 + .5; gl_Position = vec4(a, 0., 1.); }";
  const HEAD = `#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif
uniform float t, Mi; uniform vec2 R, M; uniform vec3 A, B, C, D; varying vec2 vUv;
float h21(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
vec2 h22(vec2 p) { float n = h21(p); return vec2(n, h21(p + n)); }
float n2(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h21(i), h21(i + vec2(1., 0.)), f.x), mix(h21(i + vec2(0., 1.)), h21(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p) { float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n2(p); p = mat2(1.6, 1.2, -1.2, 1.6) * p; a *= .5; } return v; }
mat2 rot(float a) { float c = cos(a), s = sin(a); return mat2(c, -s, s, c); }
vec3 pal(float x) { return .5 + .5 * cos(6.28318 * (x + vec3(0., .33, .67))); }
vec3 grade(float x) { return mix(mix(C, A, smoothstep(0., .55, x)), B, smoothstep(.55, 1., x)); }
vec2 mp() { return (M - .5) * vec2(R.x / R.y, 1.) * 2.; }
vec3 shade(vec2 uv, vec2 p);
void main() { vec2 p = (vUv - .5) * vec2(R.x / R.y, 1.) * 2.; gl_FragColor = vec4(clamp(shade(vUv, p), 0., 1.), 1.); }
`;

  const reduce = global.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const FPS = (navigator.hardwareConcurrency || 4) <= 4 ? 30 : 60;
  const live = new Set(), all = new Set();
  let gl = null, glc = null, quad = null, progs = {}, raf = 0, paused = false, failed = false;
  const ptr = { x: -1e4, y: -1e4 };
  addEventListener("pointermove", e => { ptr.x = e.clientX; ptr.y = e.clientY; }, { passive: true });
  document.addEventListener("pointerleave", () => { ptr.x = ptr.y = -1e4; });

  function context() {
    if (gl || failed) return gl;
    glc = document.createElement("canvas");
    gl = glc.getContext("webgl", { alpha: false, antialias: false, depth: false, powerPreference: "low-power", preserveDrawingBuffer: false }) || glc.getContext("experimental-webgl");
    if (!gl) { failed = true; return null; }
    quad = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    glc.addEventListener("webglcontextlost", e => { e.preventDefault(); gl = null; progs = {}; });
    return gl;
  }
  function program(name) {
    if (progs[name] !== undefined) return progs[name];
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { console.warn("[UV shaders]", name, gl.getShaderInfoLog(s)); return null; } return s; };
    const vs = sh(gl.VERTEX_SHADER, VS), fs = sh(gl.FRAGMENT_SHADER, HEAD + "vec3 shade(vec2 uv, vec2 p) {" + SH[name][3] + "\n}");
    if (!vs || !fs) return (progs[name] = null);
    const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, fs); gl.bindAttribLocation(p, 0, "a"); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) { console.warn("[UV shaders]", name, gl.getProgramInfoLog(p)); return (progs[name] = null); }
    const u = {}; for (const k of ["t", "Mi", "R", "M", "A", "B", "C", "D"]) u[k] = gl.getUniformLocation(p, k);
    return (progs[name] = { p, u });
  }

  // any CSS colour → [r, g, b] 0..1 (a 2D context normalises it for us)
  const probe = document.createElement("canvas").getContext("2d");
  function rgb(css, fb) {
    if (!css) return fb;
    probe.fillStyle = "#010203"; probe.fillStyle = css.trim();
    const s = probe.fillStyle;
    if (s === "#010203" && css.trim() !== "#010203") return fb;
    if (s[0] === "#") return [1, 3, 5].map(i => parseInt(s.slice(i, i + 2), 16) / 255);
    const m = s.match(/[\d.]+/g); return m ? m.slice(0, 3).map(x => +x / 255) : fb;
  }
  function colours(v) {
    const own = v.colors || v.el.dataset.colors;
    if (own) { const c = own.split(","); return [rgb(c[0], [1, .3, 0]), rgb(c[1] || c[0], [.5, .3, 1]), rgb(c[2], [.04, .04, .06]), rgb(c[3], [1, 1, 1])]; }
    const cs = getComputedStyle(v.el), g = k => cs.getPropertyValue(k);
    return [rgb(g("--uv-accent"), [1, .31, 0]), rgb(g("--uv-accent-2"), [.48, .36, 1]), rgb(g("--uv-bg"), [.04, .04, .06]), rgb(g("--uv-text"), [.95, .95, .95])];
  }

  function draw(v, now) {
    if (!context()) return fallback(v);
    const name = SH[v.shader] ? v.shader : "liquid", pr = program(name);
    if (!pr) return;
    const r = v.el.getBoundingClientRect(), fixed = v.page;
    const w = fixed ? innerWidth : r.width, h = fixed ? innerHeight : r.height;
    if (w < 2 || h < 2) return;
    const k = Math.min(global.devicePixelRatio || 1, 1) * v.res * (SH[name][4] || 1);
    let W = Math.max(1, Math.round(w * k)), H = Math.max(1, Math.round(h * k));
    const cap = 960 / Math.max(W, H); if (cap < 1) { W = Math.round(W * cap); H = Math.round(H * cap); }
    if (v.cv.width !== W || v.cv.height !== H) { v.cv.width = W; v.cv.height = H; }
    if (glc.width < W || glc.height < H) { glc.width = Math.max(glc.width, W); glc.height = Math.max(glc.height, H); }
    if (!v.cols || now - v.colAt > 600) { v.cols = colours(v); v.colAt = now; }
    // pointer, smoothed, in this element's uv space (y up)
    const bx = fixed ? 0 : r.left, by = fixed ? 0 : r.top, mx = (ptr.x - bx) / w, my = 1 - (ptr.y - by) / h;
    const inside = v.pointer && mx >= 0 && mx <= 1 && my >= 0 && my <= 1;
    if (inside) { v.mx += (mx - v.mx) * .12; v.my += (my - v.my) * .12; }
    v.mi += ((inside ? 1 : 0) - v.mi) * .06;
    const t = v.still || reduce ? 8 + v.seed : (now - v.t0) / 1000 * v.speed + v.seed;
    gl.viewport(0, 0, W, H); gl.useProgram(pr.p);
    let [a, b, c, d] = v.cols;
    const mode = v.mode || v.el.dataset.mode || "auto";
    if (mode === "dark" ? lum(c) > .5 : mode === "auto" && lum(c) > .5 && !LIGHT_OK.has(name)) [c, d] = [d, c];   // dark stage on light themes
    const u = pr.u;
    gl.uniform1f(u.t, t); gl.uniform1f(u.Mi, v.mi); gl.uniform2f(u.R, W, H); gl.uniform2f(u.M, v.mx, v.my);
    gl.uniform3fv(u.A, a); gl.uniform3fv(u.B, b); gl.uniform3fv(u.C, c); gl.uniform3fv(u.D, d);
    gl.bindBuffer(gl.ARRAY_BUFFER, quad); gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
    v.ctx.drawImage(glc, 0, glc.height - H, W, H, 0, 0, W, H);
    v.drawn = true;
  }
  function fallback(v) {
    if (v.fb) return; v.fb = true;
    v.el.classList.add("uv-shader--fallback");
  }

  function loop(now) {
    raf = 0; if (paused) return;
    for (const v of live) {
      if (!v.el.isConnected) { v.stop(); continue; }
      const f = v.hot ? 60 : (v.fps || FPS);
      if ((!v.drawn || !(v.still || reduce)) && now - (v.last || 0) >= 1000 / f - 2) { v.last = now; draw(v, now); }
    }
    if (live.size && !reduce) raf = requestAnimationFrame(loop);
    else if (live.size) [...live].forEach(v => v.drawn || draw(v, now));
  }
  const kick = () => { if (!raf && !paused) raf = requestAnimationFrame(loop); };
  const io = "IntersectionObserver" in global ? new IntersectionObserver(es => es.forEach(e => {
    const v = e.target._uvShader; if (!v) return;
    if (e.isIntersecting) { live.add(v); kick(); } else live.delete(v);
  }), { rootMargin: "100px" }) : null;

  function mount(el, opts = {}) {
    if (el._uvShader) { el._uvShader.set(opts); return el._uvShader; }
    const d = el.dataset, page = el === document.body || el === document.documentElement;
    const v = { el, page, shader: opts.shader || d.uvShader || "liquid", speed: +(opts.speed ?? d.speed ?? 1), res: +(opts.res ?? d.res ?? .5),
      fps: +(opts.fps ?? d.fps ?? 0), colors: opts.colors, still: opts.still ?? ("still" in d), pointer: opts.pointer ?? !("noPointer" in d), mode: opts.mode,
      t0: performance.now(), seed: Math.random() * 40, mx: .5, my: .5, mi: 0, last: 0, colAt: 0 };
    el._uvShader = v; el.setAttribute("data-uv-shader", v.shader);
    if (!page && getComputedStyle(el).position === "static") el.style.position = "relative";
    el.classList.add("uv-shader");
    const cv = v.cv = document.createElement("canvas"); cv.className = "uv-shader__cv" + (page ? " uv-shader__cv--page" : ""); cv.setAttribute("aria-hidden", "true");
    v.ctx = cv.getContext("2d", { alpha: false });
    (page ? document.body : el).prepend(cv);
    if ("hoverFps" in d || opts.hoverFps) { el.addEventListener("pointerenter", () => { v.hot = true; }); el.addEventListener("pointerleave", () => { v.hot = false; }); }
    v.set = (o = {}) => {
      if (o.shader) { v.shader = o.shader; el.setAttribute("data-uv-shader", o.shader); }
      for (const k of ["speed", "res", "fps", "still"]) if (k in o) v[k] = +o[k] || (k === "still" ? !!o[k] : v[k]);
      if ("colors" in o) { v.colors = o.colors; v.colAt = 0; }
      v.drawn = false; v.colAt = 0; if (live.has(v)) kick(); else if (!io) draw(v, performance.now());
    };
    v.stop = () => { io && io.unobserve(el); live.delete(v); all.delete(v); cv.remove(); el.classList.remove("uv-shader"); el._uvShader = null; };
    all.add(v);
    if (io && !page) io.observe(el); else { live.add(v); kick(); }
    return v;
  }

  /** Compile every shader and report problems (used by the site's tests). */
  function check() {
    if (!context()) return { webgl: false };
    const bad = {}; for (const n in SH) if (!program(n)) bad[n] = true;
    return { webgl: true, total: Object.keys(SH).length, failed: Object.keys(bad) };
  }
  const pause = (on = true) => { paused = on; if (!on) kick(); };
  UV.shaders = { mount, pause, resume: () => pause(false), check, list: Object.fromEntries(Object.entries(SH).map(([k, s]) => [k, { label: s[0], group: s[1], desc: s[2], light: LIGHT_OK.has(k) }])) };

  if (!document.getElementById("uv-shader-css")) {
    const st = document.createElement("style"); st.id = "uv-shader-css";
    st.textContent = `.uv-shader{isolation:isolate}
.uv-shader__cv{position:absolute;inset:0;width:100%;height:100%;display:block;z-index:-1;pointer-events:none;border-radius:inherit}
.uv-shader__cv--page{position:fixed}
.uv-shader--fallback{background-image:radial-gradient(60% 80% at 15% 10%,color-mix(in srgb,var(--uv-accent,#ff4f00) 45%,transparent),transparent 70%),radial-gradient(60% 80% at 90% 90%,color-mix(in srgb,var(--uv-accent-2,#7b5cff) 40%,transparent),transparent 70%)}`;
    document.head.appendChild(st);
  }
  const scan = (root = document) => root.querySelectorAll("[data-uv-shader]").forEach(el => el._uvShader || mount(el));
  if (UV.use) UV.use("shaders", scan);
  else if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => scan()); else scan();
})(window);
