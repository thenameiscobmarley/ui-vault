/*! UI Vault 3 · waterfall.js — a soft, filmic waterfall background (WebGL, procedural, no video). MIT
 *  UVWaterfall.mount(el?, { scale, fps, tint })  → stop()        (also UV.fx.waterfall when UV is loaded)
 *  Renders at a fraction of screen resolution and is upscaled by the browser — that is what makes it look
 *  like a blurred, out-of-focus video while staying cheap on integrated GPUs. Pauses when hidden/off-screen.
 */
(function (global) {
  "use strict";
  const FS = `precision mediump float;
uniform vec2 R; uniform float t;
float h(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h(i), h(i + vec2(1., 0.)), f.x), mix(h(i + vec2(0., 1.)), h(i + vec2(1., 1.)), f.x), f.y); }
float fbm(vec2 p){ float v = 0., a = .5; for (int i = 0; i < 5; i++) { v += a * n(p); p = p * 2.03 + vec2(1.7, 9.2); a *= .5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / R; float asp = R.x / R.y;
  vec2 p = vec2((uv.x - .5) * asp, uv.y);
  // wet rock + moss
  float rock = fbm(p * vec2(2.6, 3.4));
  vec3 col = mix(vec3(.04, .06, .055), vec3(.17, .21, .19), rock);
  col = mix(col, vec3(.11, .23, .12), smoothstep(.45, .78, fbm(p * 4.6 + 3.)) * .75);
  col += vec3(.03, .05, .06) * fbm(vec2(p.x * 7., p.y * 2. - t * .25));
  // the falls: a wobbling column, wider towards the pool
  float x = p.x + .035 * sin(uv.y * 3.1 + .4) + .015 * sin(uv.y * 9. + t * .6);
  float w = .22 + .08 * (1. - uv.y) + .02 * sin(uv.y * 5. + t * .45);
  float edge = (fbm(vec2(uv.y * 3.5 - t * .9, 4.)) - .5) * .12;
  float m = smoothstep(w + edge, w + edge - .09, abs(x));
  float s1 = fbm(vec2(x * 16., p.y * 1.1 + t * 1.5));
  float s2 = fbm(vec2(x * 31. + 5., p.y * 1.9 + t * 2.3));
  float streak = pow(clamp(s1 * .62 + s2 * .5, 0., 1.), 2.1);
  vec3 water = mix(vec3(.5, .68, .74), vec3(.97, .99, 1.), streak);
  col = mix(col, water, m * (.7 + .3 * streak));
  // spray at the edges of the falls
  col = mix(col, vec3(.85, .92, .94), smoothstep(.08, 0., abs(abs(x) - w)) * .25 * fbm(vec2(x * 10., p.y * 4. + t)));
  // plunge pool + foam
  float pool = smoothstep(.27, .04, uv.y);
  float foam = fbm(vec2(p.x * 5.5 + sin(t * .2), p.y * 7. - t * .7));
  vec3 poolc = mix(vec3(.12, .27, .29), vec3(.9, .95, .96), smoothstep(.42, .8, foam) * (.35 + .65 * smoothstep(.6, 0., abs(p.x))));
  col = mix(col, poolc, pool);
  // rising mist
  float mist = fbm(vec2(p.x * 1.8 + t * .04, p.y * 2.4 - t * .22));
  col = mix(col, vec3(.88, .94, .95), mist * smoothstep(.62, 0., uv.y) * .8);
  // canopy at the top corners
  float leaf = fbm(p * 6. + vec2(t * .02, 0.));
  col = mix(col, vec3(.04, .11, .05), smoothstep(.6, .95, uv.y) * smoothstep(.2, .7, abs(p.x)) * smoothstep(.38, .62, leaf) * .9);
  // daylight from above, vignette, grade
  col += vec3(.16, .19, .15) * smoothstep(.35, 1., uv.y) * max(0., 1. - abs(p.x) * .9) * .55;
  col *= .78 + .38 * (1. - length((uv - .5) * vec2(1., 1.25)));
  gl_FragColor = vec4(pow(col, vec3(.95)), 1.);
}`;

  function mount(host = document.body, { scale = .2, fps = 30, maxW = 440, tint = true } = {}) {
    const fixed = host === document.body;
    const c = document.createElement("canvas");
    c.className = "uv-waterfall";
    c.setAttribute("aria-hidden", "true");
    c.style.cssText = (fixed ? "position:fixed;" : "position:absolute;") + "inset:0;width:100%;height:100%;z-index:-3;pointer-events:none;display:block;";
    host.prepend(c);
    let veil;
    if (tint) {
      veil = document.createElement("div");
      veil.className = "uv-waterfall-veil";
      veil.setAttribute("aria-hidden", "true");
      veil.style.cssText = (fixed ? "position:fixed;" : "position:absolute;") + "inset:0;z-index:-2;pointer-events:none;";
      c.after(veil);
    }
    const gl = c.getContext("webgl", { antialias: false, depth: false, alpha: false, powerPreference: "low-power" });
    if (!gl) { c.remove(); return () => veil && veil.remove(); }
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); return s; };
    const pr = gl.createProgram();
    gl.attachShader(pr, sh(gl.VERTEX_SHADER, "attribute vec2 p; void main(){ gl_Position = vec4(p, 0., 1.); }"));
    gl.attachShader(pr, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(pr, 0, "p"); gl.linkProgram(pr); gl.useProgram(pr);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer());
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    const uR = gl.getUniformLocation(pr, "R"), uT = gl.getUniformLocation(pr, "t");
    const size = () => {
      const w = Math.min(maxW, Math.max(160, Math.round(c.clientWidth * scale))), h = Math.max(90, Math.round(w * c.clientHeight / Math.max(1, c.clientWidth)));
      c.width = w; c.height = h; gl.viewport(0, 0, w, h); gl.uniform2f(uR, w, h);
    };
    size(); addEventListener("resize", size);
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0, last = 0, t0 = performance.now(), on = true, visible = true;
    const draw = now => { gl.uniform1f(uT, (now - t0) / 1000 + 20); gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4); };
    const loop = now => {
      raf = 0; if (!on) return;
      if (now - last >= 1000 / fps) { last = now; draw(now); }
      if (visible && !document.hidden && !reduce) raf = requestAnimationFrame(loop);
    };
    const kick = () => { if (!raf && on) raf = requestAnimationFrame(loop); };
    document.addEventListener("visibilitychange", kick);
    if (!fixed) new IntersectionObserver(([e]) => { visible = e.isIntersecting; kick(); }).observe(host);
    reduce ? draw(t0 + 4000) : kick();
    return () => { on = false; c.remove(); veil && veil.remove(); removeEventListener("resize", size); };
  }

  global.UVWaterfall = { mount };
  if (global.UV) { global.UV.fx = global.UV.fx || {}; global.UV.fx.waterfall = (el, o) => mount(el, o); }
})(window);
