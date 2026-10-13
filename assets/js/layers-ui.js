// UI Vault — layer editor UI (used by the floating picker's Effects tab and the click-to-inspect panel).
// UVLayersUI.render(container, { type, el })  — type: "btn", "card", … or "page"; el: a single element to edit only that one.
(() => {
  "use strict";
  const store = { get: (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } }, set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} } };
  const RANGES = { glow: [4, 48, 1], shadow: [4, 40, 1], border: [1, 8, 1], backdrop: [2, 30, 1], hover: [.5, 3, .1], press: [.5, 3, .1], text: [1, 1, 1] };
  const TRANGE = { enter: [.2, 2, .1], idle: [1, 8, .5] };
  const CNAMES = { accent: "Accent", "accent-2": "Accent 2", text: "Text", white: "White", black: "Black", success: "Green", warn: "Amber", danger: "Red", info: "Blue" };
  const css = document.createElement("style");
  css.textContent = `.uvle { display: grid; gap: 8px; font: 13px "Geist", system-ui, sans-serif; color: #ecebe8; }
  .uvle .row { display: grid; grid-template-columns: 92px 1fr; gap: 8px; align-items: center; }
  .uvle .row > span { color: #a19d95; font-size: 12px; }
  .uvle select, .uvle input[type=color] { height: 30px; min-width: 0; width: 100%; padding: 0 6px; border-radius: 6px; border: 1px solid #ffffff26; background: #1f1f22; color: #fff; font: 12px "Geist", sans-serif; }
  .uvle input[type=color] { padding: 2px; width: 36px; }
  .uvle .params { grid-column: 2; display: flex; gap: 6px; align-items: center; flex-wrap: wrap; margin-top: -2px; }
  .uvle .params select { width: auto; flex: 1; } .uvle .params input[type=range] { flex: 1.4; accent-color: #ff6a26; min-width: 70px; }
  .uvle .params small { color: #8f8a82; font: 10px "Geist Mono", monospace; }
  .uvle h4 { margin: 6px 0 0; font: 500 10px "Geist Mono", monospace; text-transform: uppercase; letter-spacing: .08em; color: #8f8a82; }
  .uvle .acts { display: flex; gap: 6px; margin-top: 4px; } .uvle .acts button { flex: 1; height: 30px; border-radius: 6px; border: 1px solid #ffffff26; background: none; color: #ecebe8; font: 500 12px "Geist", sans-serif; cursor: pointer; } .uvle .acts button:hover { border-color: #fff; }`;
  document.head.appendChild(css);

  const getStack = () => store.get("uv-layers", {});
  const ensureUV = () => window.UV && window.UV.layers ? Promise.resolve() : (window.UVPicker && window.UVPicker.ensureLayers ? window.UVPicker.ensureLayers() : Promise.resolve());
  function save(stack) { store.set("uv-layers", stack); window.UV && UV.layers && UV.layers.apply(stack); document.dispatchEvent(new CustomEvent("uv:layers", { detail: stack })); }

  async function render(box, { type, el } = {}) {
    await ensureUV();
    const D = UV.layers.defs, P = window.UV_PARTS || (window.UVPicker && await window.UVPicker.loadParts());
    const fam = P && P.families.find(f => f.key === type);
    const kinds = type === "page" ? D.pageKinds : D.kinds;
    const key = el ? (location.pathname + "|" + UV.layers.pathOf(el)) : null;
    const read = () => { const s = getStack(); return el ? ((s["@el"] || {})[key] || { kinds: {} }).kinds : (s[type] || {}); };
    const write = kindsObj => {
      const s = getStack();
      if (el) {
        s["@el"] = s["@el"] || {};
        const prev = s["@el"][key] || { id: "e" + Math.random().toString(36).slice(2, 8), type, page: location.pathname, path: UV.layers.pathOf(el) };
        prev.kinds = kindsObj; s["@el"][key] = prev;
        if (!Object.keys(kindsObj).length && !prev.design) delete s["@el"][key];
      } else if (Object.keys(kindsObj).length) s[type] = kindsObj; else delete s[type];
      save(s);
    };
    const cur = read();
    let design = "";
    if (fam) design = el ? (((getStack()["@el"] || {})[key] || {}).design || "") : ((window.UVPicker && UVPicker.getParts()[type]) || "");
    const colorSel = (name, v) => `<select data-p="${name}" title="${name === "c" ? "Colour" : "Second colour"}">${D.colors.map(c => `<option value="${c}"${c === v ? " selected" : ""}>${CNAMES[c]}</option>`).join("")}<option value="custom"${v && v[0] === "#" ? " selected" : ""}>Custom…</option></select>${v && v[0] === "#" ? `<input type="color" data-p="${name}" value="${v}">` : ""}`;
    box.innerHTML = `<div class="uvle">
      ${fam ? `<div class="row"><span>Design</span><select data-design><option value="">Theme default</option>${fam.parts.map(p => `<option value="${p.name}"${p.name === design ? " selected" : ""}>${p.label}</option>`).join("")}</select></div>` : ""}
      ${type === "page" && P ? (() => { const bg = P.families.find(f => f.key === "bg"); const v = (window.UVPicker && UVPicker.getParts().bg) || ""; return `<div class="row"><span>Background</span><select data-bgpart><option value="">Theme default</option>${bg.parts.map(p => `<option value="${p.name}"${p.name === v ? " selected" : ""}>${p.label}</option>`).join("")}</select></div>`; })() : ""}
      <h4>Layers${el ? " · this element only" : ""}</h4>
      ${kinds.map(k => {
        const v = cur[k.key] || {}, p = Object.assign({}, k.defaults, v), o = v.o && UV.layers.option(k.key, v.o);
        const params = [];
        if (o && k.params.includes("c")) params.push(colorSel("c", p.c));
        if (o && k.params.includes("c2")) params.push(colorSel("c2", p.c2));
        if (o && k.params.includes("s") && RANGES[k.key]) { const [a, b, st] = RANGES[k.key]; params.push(`<input type="range" data-p="s" min="${a}" max="${b}" step="${st}" value="${p.s}" title="Size"><small>${p.s}</small>`); }
        if (o && k.params.includes("t")) { const [a, b, st] = TRANGE[k.key]; params.push(`<input type="range" data-p="t" min="${a}" max="${b}" step="${st}" value="${p.t}" title="Duration (s)"><small>${p.t}s</small>`); }
        return `<div class="row" data-k="${k.key}"><span>${k.label}</span><select data-o><option value="">None</option>${k.options.map(op => `<option value="${op.name}"${op.name === v.o ? " selected" : ""}>${op.label}</option>`).join("")}</select>${params.length ? `<div class="params">${params.join("")}</div>` : ""}</div>`;
      }).join("")}
      <div class="acts"><button type="button" data-clear>Clear ${el ? "this element" : "all layers"}</button><button type="button" data-rand>Surprise me</button></div></div>`;

    box.oninput = box.onchange = e => {
      const t = e.target;
      if (t.matches("[data-design]")) {
        if (el) { const s = getStack(); s["@el"] = s["@el"] || {}; const prev = s["@el"][key] || { id: "e" + Math.random().toString(36).slice(2, 8), type, page: location.pathname, path: UV.layers.pathOf(el), kinds: {} }; prev.design = t.value; s["@el"][key] = prev; t.value ? el.setAttribute("data-uv-" + type, t.value) : el.removeAttribute("data-uv-" + type); save(s); window.UVPicker && UVPicker.loadFamily && UVPicker.loadFamily(type); }
        else window.UVPicker && UVPicker.setParts({ [type]: t.value });
        return;
      }
      if (t.matches("[data-bgpart]")) { window.UVPicker && UVPicker.setParts({ bg: t.value }); return; }
      const row = t.closest("[data-k]"); if (!row) return;
      const k = row.dataset.k, all = read(), v = Object.assign({}, all[k] || {});
      if (t.matches("[data-o]")) { if (!t.value) delete all[k]; else all[k] = Object.assign({}, v, { o: t.value }); write(all); render(box, { type, el }); return; }
      const p = t.dataset.p;
      if (t.tagName === "SELECT" && t.value === "custom") { v[p] = "#ff4f00"; all[k] = v; write(all); render(box, { type, el }); return; }
      v[p] = t.type === "range" ? +t.value : t.value; all[k] = v;
      if (t.type === "range" && t.nextElementSibling) t.nextElementSibling.textContent = t.value + (p === "t" ? "s" : "");
      if (e.type === "change" && t.tagName === "SELECT") { write(all); render(box, { type, el }); } else write(all);
    };
    box.onclick = e => {
      if (e.target.matches("[data-clear]")) { write({}); render(box, { type, el }); }
      if (e.target.matches("[data-rand]")) {
        const pick = a => a[(Math.random() * a.length) | 0], all = {};
        kinds.filter(k => k.key !== "fx" && k.key !== "enter" && Math.random() < .45).forEach(k => all[k.key] = { o: pick(k.options).name });
        write(all); render(box, { type, el });
      }
    };
  }
  window.UVLayersUI = { render, getStack, save };
})();
