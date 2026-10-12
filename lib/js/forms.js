/*! UI Vault 3 · forms.js — tabs, otp, range, file drop. Needs core.js. MIT */
(function (UV) {
  "use strict";
  UV.tabs = (el, onChange) => {
    if (!UV.once(el, "tabs")) return el._uvTabsApi;
    el.setAttribute("role", "tablist");
    let ind = el.querySelector(".uv-tabs__ind");
    if (!ind) { ind = document.createElement("span"); ind.className = "uv-tabs__ind"; el.prepend(ind); }
    const tabs = [...el.querySelectorAll(":scope > button")];
    const move = t => { ind.style.width = t.offsetWidth + "px"; ind.style.transform = `translateX(${t.offsetLeft}px)`; };
    const select = (t, silent) => {
      tabs.forEach(x => { const on = x === t; x.setAttribute("aria-selected", on); x.setAttribute("role", "tab"); x.tabIndex = on ? 0 : -1;
        const panel = x.getAttribute("aria-controls") && document.getElementById(x.getAttribute("aria-controls")); if (panel) panel.hidden = !on; });
      move(t); if (!silent && onChange) onChange(t, tabs.indexOf(t));
      if (!silent) el.dispatchEvent(new CustomEvent("uv-change", { detail: tabs.indexOf(t) }));
    };
    tabs.forEach((t, k) => {
      t.addEventListener("click", () => select(t));
      t.addEventListener("keydown", e => { const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0; if (d) { const n = tabs[(k + d + tabs.length) % tabs.length]; n.focus(); select(n); } });
    });
    const first = tabs.find(t => t.getAttribute("aria-selected") === "true") || tabs[0];
    ind.style.transition = "none"; select(first, true);
    UV.raf(() => UV.raf(() => { ind.style.transition = ""; move(first); }));
    new ResizeObserver(() => { const s = tabs.find(t => t.getAttribute("aria-selected") === "true"); s && move(s); }).observe(el);
    return (el._uvTabsApi = { select: i => select(tabs[i]) });
  };

  UV.otp = el => {
    const inputs = [...el.querySelectorAll("input")];
    inputs.forEach((inp, k) => {
      inp.maxLength = 1; inp.inputMode = "numeric";
      inp.addEventListener("input", () => { inp.value = inp.value.replace(/\D/g, ""); if (inp.value && inputs[k + 1]) inputs[k + 1].focus(); if (inputs.every(i => i.value)) el.dispatchEvent(new CustomEvent("uv-complete", { detail: inputs.map(i => i.value).join("") })); });
      inp.addEventListener("keydown", e => { if (e.key === "Backspace" && !inp.value && inputs[k - 1]) inputs[k - 1].focus(); });
      inp.addEventListener("paste", e => { const t = (e.clipboardData.getData("text") || "").replace(/\D/g, ""); if (t) { e.preventDefault(); inputs.forEach((i, j) => { i.value = t[j] || ""; }); inputs[Math.min(t.length, inputs.length) - 1].focus(); inp.dispatchEvent(new Event("input")); } });
    });
  };
  UV.range = el => { const sync = () => el.style.setProperty("--v", ((el.value - (el.min || 0)) / ((el.max || 100) - (el.min || 0))) * 100 + "%"); el.addEventListener("input", sync); sync(); };
  UV.drop = (el, onFiles) => {
    const input = document.createElement("input"); input.type = "file"; input.multiple = true; input.hidden = true; el.appendChild(input);
    const emit = files => { if (files.length) { el.dispatchEvent(new CustomEvent("uv-files", { detail: [...files] })); onFiles && onFiles([...files]); } };
    el.addEventListener("click", e => { if (e.target !== input) input.click(); });
    input.addEventListener("change", () => emit(input.files));
    ["dragenter", "dragover"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.add("is-over"); }));
    ["dragleave", "drop"].forEach(ev => el.addEventListener(ev, e => { e.preventDefault(); el.classList.remove("is-over"); }));
    el.addEventListener("drop", e => emit(e.dataTransfer.files));
  };

  UV.use("forms", root => {
    root.querySelectorAll(".uv-tabs").forEach(el => UV.tabs(el));
    root.querySelectorAll(".uv-otp").forEach(el => UV.once(el, "otp") && UV.otp(el));
    root.querySelectorAll(".uv-range").forEach(el => UV.once(el, "range") && UV.range(el));
    root.querySelectorAll(".uv-drop").forEach(el => UV.once(el, "drop") && UV.drop(el));
  });
})(window.UV);
