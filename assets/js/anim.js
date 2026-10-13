// Homepage motion: page progress bar, hero word rise, staggered scroll reveals, gentle parallax.
// Cheap on integrated GPUs: transforms/opacity only, one rAF-throttled scroll handler, all off with reduced motion.
(() => {
  "use strict";
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  const root = document.documentElement;
  root.classList.add("anim");

  // hero headline: rise word by word
  const h1 = document.querySelector(".hero h1");
  if (h1) {
    let i = 0;
    const wrap = node => [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(w => {
          if (!w.trim()) { frag.append(w); return; }
          const o = document.createElement("span"); o.className = "w";
          const s = document.createElement("span"); s.textContent = w; s.style.setProperty("--i", i++);
          o.append(s); frag.append(o);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1) wrap(n);
    });
    wrap(h1);
  }

  // scroll reveals with per-group stagger
  const groups = [".hero__kicker, .hero__sub, .search, .hero__chips, .hero__cta, .spec, .stats > div", ".section__head", ".api-promo > *",
                  ".res", ".demo", ".fx > *", ".forge > *, .forge__preview > *", ".showcase > *", ".cat-tabs, .toolbar, .seg-tabs, .pg-tools"];
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  const watch = () => groups.forEach(sel => document.querySelectorAll(sel).forEach((el, k) => {
    if (el.classList.contains("rv")) return;
    el.classList.add("rv"); el.style.setProperty("--d", (k % 6) * 60 + "ms"); io.observe(el);
  }));
  watch();
  // re-run when the library grid / playground re-render
  ["#resGrid", "#demoGrid"].forEach(sel => { const g = document.querySelector(sel); if (g) new MutationObserver(watch).observe(g, { childList: true }); });

  // progress bar + parallax
  const bar = document.createElement("div"); bar.className = "progress"; document.body.prepend(bar);
  const par = [...document.querySelectorAll(".spec, .mock-ring")];
  let ticking = false;
  const frame = () => {
    ticking = false;
    const max = root.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    par.forEach(el => { const r = el.getBoundingClientRect(); if (r.bottom > 0 && r.top < innerHeight) el.style.translate = `0 ${((r.top + r.height / 2 - innerHeight / 2) * -0.08).toFixed(1)}px`; });
  };
  addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(frame); } }, { passive: true });
  frame();
})();
