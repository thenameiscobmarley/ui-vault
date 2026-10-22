// Homepage hero: the theme stage (same markup, eight themes, auto-play until you pick one), install copy, bento swatches, number count-ups.
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // [name, background, accent] — solid colours from lib/tokens.json
  const FEATURED = [["editorial", "#f4f2ee", "#ff4f00"], ["neon", "#06060c", "#00f0ff"], ["brutal", "#fff4e0", "#ff5ec4"], ["glass", "#0f1024", "#b9a6ff"],
                    ["terminal", "#050a05", "#4dff7a"], ["luxe", "#0c0b09", "#c9a96e"], ["vaporwave", "#2b1055", "#ff71ce"], ["blueprint", "#13427a", "#ffd45c"]];
  const win = $("#hxWin"), name = $("#hxName"), chips = $("#hxThemes"), stage = $(".hx__stage");
  if (win && chips) {
    const T = 2800;
    chips.style.setProperty("--hx-t", T + "ms");
    chips.innerHTML = FEATURED.map(([n, a, b]) => `<button type="button" role="radio" class="hx__auto" aria-checked="false" data-t="${n}" style="--a:${a};--b:${b}"><i></i>${n}</button>`).join("")
      + `<a href="themes.html">+79 more →</a>`;
    const btns = [...chips.querySelectorAll("button")];
    let idx = 0, timer = 0, playing = !reduce, hovered = false, visible = true;
    const set = i => {
      idx = (i + FEATURED.length) % FEATURED.length;
      const [n, , ac] = FEATURED[idx];
      win.dataset.uvTheme = n; name.textContent = n;
      stage.style.setProperty("--hx-ac", ac);
      btns.forEach((b, k) => b.setAttribute("aria-checked", k === idx));
      win.classList.remove("swap"); void win.offsetWidth; win.classList.add("swap");
    };
    const tick = () => { clearTimeout(timer); if (playing && !hovered && visible && !document.hidden) timer = setTimeout(() => { set(idx + 1); tick(); }, T); };
    const sync = () => chips.classList.toggle("playing", playing && !hovered);
    btns.forEach((b, k) => b.addEventListener("click", () => { playing = false; clearTimeout(timer); set(k); sync(); }));
    stage.addEventListener("pointerenter", () => { hovered = true; clearTimeout(timer); sync(); });
    stage.addEventListener("pointerleave", () => { hovered = false; sync(); if (playing) { set(idx); tick(); } });
    document.addEventListener("visibilitychange", tick);
    // pause while the hero is off screen
    new IntersectionObserver(([e]) => { visible = e.isIntersecting; tick(); }).observe(stage);
    set(0); sync(); tick();
    // the mock tabs work, so the stage feels like a real app
    win.querySelectorAll(".hx__tabs button").forEach((b, _, all) => b.addEventListener("click", () => all.forEach(x => x.setAttribute("aria-selected", x === b))));
  }

  // copy the <link> tag
  const copy = $("#hxCopy");
  copy && copy.addEventListener("click", async () => {
    const text = $("#hxInstall").textContent;
    try { await navigator.clipboard.writeText(text); } catch {
      const r = document.createRange(); r.selectNodeContents($("#hxInstall")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); document.execCommand("copy"); s.removeAllRanges();
    }
    copy.textContent = "Copied"; setTimeout(() => copy.textContent = "Copy", 1400);
  });

  // themes tile: a strip of real theme colours
  const sw = $("#btSwatches");
  if (sw) sw.innerHTML = [["#06060c", "#00f0ff"], ["#fff4e0", "#ff5ec4"], ["#0c0b09", "#c9a96e"], ["#13427a", "#ffd45c"], ["#2b1055", "#ff71ce"], ["#050a05", "#4dff7a"],
    ["#f4f2ee", "#ff4f00"], ["#0b1020", "#6ea8ff"], ["#fff35c", "#ff2b2b"], ["#9bbc0f", "#306230"], ["#ecfbf3", "#2fb37a"], ["#16020a", "#ff1f4f"], ["#dfe5ec", "#5a6b80"], ["#0f1024", "#b9a6ff"]]
    .map(([b, a]) => `<i style="--a:${a};--b:${b}"></i>`).join("");

  // count-up for the numbers band when it scrolls in
  const nums = document.querySelectorAll(".nums b[data-count]");
  const fmt = n => n.toLocaleString("en-US");
  const run = el => {
    const to = +el.dataset.count, plus = el.hasAttribute("data-plus") ? "+" : "", t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 1200), e = 1 - Math.pow(1 - p, 3); el.textContent = fmt(Math.round(to * e)) + plus; if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  };
  if (!reduce && nums.length) {
    const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { run(e.target); io.unobserve(e.target); } }), { threshold: .6 });
    nums.forEach(n => io.observe(n));
  }
})();
