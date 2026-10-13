// UI Vault inspector — click any element on any page, then change its design and effect layers.
// Changes apply to every element of that type across the site (or tick "Only this element").
(() => {
  "use strict";
  const LABEL = () => Object.fromEntries(UV.layers.defs.types.map(t => [t.key, t.label]));
  const st = document.createElement("style");
  st.textContent = `.uvi-hl { position: fixed; z-index: 9995; pointer-events: none; border: 2px solid #ff6a26; border-radius: 6px; background: #ff6a2614; transition: all .08s; }
  .uvi-hl b { position: absolute; left: -2px; top: -22px; padding: 2px 7px; border-radius: 4px 4px 4px 0; background: #ff6a26; color: #111; font: 600 11px "Geist", sans-serif; white-space: nowrap; }
  .uvi-bar { position: fixed; z-index: 9996; left: 50%; top: 14px; translate: -50% 0; padding: 8px 14px; border-radius: 999px; background: #151517f2; color: #fff; border: 1px solid #ffffff33; font: 500 13px "Geist", sans-serif; box-shadow: 0 10px 30px -10px #000a; }
  .uvi { position: fixed; z-index: 9997; right: 16px; top: 16px; bottom: 16px; width: min(360px, calc(100vw - 32px)); display: flex; flex-direction: column; border-radius: 12px; border: 1px solid #ffffff26; background: #151517f8; color: #ecebe8; font: 14px "Geist", system-ui, sans-serif; box-shadow: 0 30px 60px -20px #000c; animation: uvi-in .25s cubic-bezier(.2, 1.1, .4, 1); }
  @keyframes uvi-in { from { opacity: 0; translate: 16px 0; } }
  .uvi header { display: grid; gap: 8px; padding: 14px; border-bottom: 1px solid #ffffff1a; }
  .uvi header div { display: flex; align-items: center; gap: 8px; } .uvi header b { flex: 1; font-size: 16px; }
  .uvi header button { height: 28px; padding: 0 10px; border-radius: 6px; border: 1px solid #ffffff26; background: none; color: #ecebe8; font: 500 12px "Geist", sans-serif; cursor: pointer; }
  .uvi header label { display: flex; align-items: center; gap: 8px; color: #a19d95; font-size: 12px; cursor: pointer; } .uvi header input { accent-color: #ff6a26; }
  .uvi .body { overflow: auto; padding: 12px 14px 16px; flex: 1; }
  .uvi small.k { color: #8f8a82; font: 11px "Geist Mono", monospace; }`;
  document.head.appendChild(st);

  let on = false, hl, bar, panel, picked = null;
  const hlBox = () => { if (!hl) { hl = document.createElement("div"); hl.className = "uvi-hl"; hl.innerHTML = "<b></b>"; document.body.appendChild(hl); } return hl; };
  function move(e) {
    if (!on) return;
    const r0 = UV.layers.typeOf(e.target); if (!r0) { hlBox().style.display = "none"; return; }
    const [type, el] = r0, r = el.getBoundingClientRect(), h = hlBox();
    h.style.display = "block"; Object.assign(h.style, { left: r.left - 3 + "px", top: r.top - 3 + "px", width: r.width + 6 + "px", height: r.height + 6 + "px" });
    h.firstChild.textContent = LABEL()[type] + (type === "page" ? "" : " — click to edit");
  }
  function click(e) {
    if (!on) return;
    const r0 = UV.layers.typeOf(e.target); if (!r0) return;
    e.preventDefault(); e.stopPropagation();
    stop(); open(r0[0], r0[1]);
  }
  const key = e => { if (e.key === "Escape") { stop(); panel && panel.remove(); panel = null; } };
  function start() {
    on = true; panel && panel.remove(); panel = null;
    if (!bar) { bar = document.createElement("div"); bar.className = "uvi-bar"; }
    bar.textContent = "Inspect: hover anything and click it · Esc to cancel"; document.body.appendChild(bar);
    document.addEventListener("pointermove", move, true); document.addEventListener("click", click, true); document.addEventListener("keydown", key, true);
  }
  function stop() {
    on = false; bar && bar.remove(); hl && (hl.style.display = "none");
    document.removeEventListener("pointermove", move, true); document.removeEventListener("click", click, true);
  }
  function open(type, el) {
    picked = { type, el };
    panel = document.createElement("aside"); panel.className = "uvi";
    const lab = LABEL()[type];
    panel.innerHTML = `<header><div><b>${lab}</b><button type="button" data-again>Pick another</button><button type="button" data-x>Close</button></div>
      ${type === "page" ? `<small class="k">Background, animated backdrop, cursor and scrolling for every page</small>` : `<label><input type="checkbox" data-only> Only this element (otherwise: every ${lab.toLowerCase()} on every page)</label>`}</header><div class="body"></div>`;
    document.body.appendChild(panel);
    const body = panel.querySelector(".body"), only = panel.querySelector("[data-only]");
    const draw = () => UVLayersUI.render(body, { type, el: only && only.checked ? el : null });
    draw();
    only && (only.onchange = draw);
    panel.querySelector("[data-x]").onclick = () => { panel.remove(); panel = null; document.removeEventListener("keydown", key, true); };
    panel.querySelector("[data-again]").onclick = start;
  }
  window.UVInspector = { start, stop, open };
})();
