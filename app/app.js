// Flow — a focus timer. Vanilla JS, state saved in localStorage.
(() => {
  "use strict";
  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const load = (k, d) => { try { const v = localStorage.getItem("flow-" + k); return v == null ? d : JSON.parse(v); } catch { return d; } };
  const save = (k, v) => { try { localStorage.setItem("flow-" + k, JSON.stringify(v)); } catch {} };
  const dayKey = (d = new Date()) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");

  const ACCENTS = [["#a78bfa", "#22d3ee"], ["#f472b6", "#fb923c"], ["#34d399", "#a3e635"], ["#60a5fa", "#818cf8"], ["#fbbf24", "#f87171"]];
  const LABELS = { focus: "Deep focus", short: "Short break", long: "Long break" };
  const settings = Object.assign({ focus: 25, short: 5, long: 15, auto: false, notify: false, sound: true, accent: 0 }, load("settings", {}));
  let tasks = load("tasks", []);
  let stats = load("stats", {});            // { "YYYY-MM-DD": { min, sess, done } }
  let activeTask = load("active", null);
  let mode = "focus", cycle = load("cycle", 0);
  let running = false, endAt = 0, remaining = settings.focus * 60, total = remaining, tick = 0;

  const CIRC = 2 * Math.PI * 124;
  const ringFill = $("#ringFill");
  ringFill.style.strokeDasharray = CIRC;

  // ── UI helpers ────────────────────────────────────────────────
  function toast(icon, msg) {
    const t = document.createElement("div");
    t.className = "toast";
    t.innerHTML = `<i>${icon}</i><span></span>`;
    t.lastChild.textContent = msg;
    $("#toasts").appendChild(t);
    setTimeout(() => { t.classList.add("out"); setTimeout(() => t.remove(), 300); }, 3000);
  }
  let actx;
  function chime(kind = "end") {
    if (!settings.sound) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      const notes = kind === "end" ? [659.25, 783.99, 1046.5] : [523.25];
      notes.forEach((f, i) => {
        const o = actx.createOscillator(), g = actx.createGain(), t = actx.currentTime + i * .14;
        o.type = "sine"; o.frequency.value = f;
        g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.18, t + .02); g.gain.exponentialRampToValueAtTime(.0001, t + .9);
        o.connect(g).connect(actx.destination); o.start(t); o.stop(t + 1);
      });
    } catch {}
  }
  const fmt = s => { s = Math.max(0, Math.ceil(s)); return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0"); };

  function applyAccent() {
    const [a, b] = ACCENTS[settings.accent] || ACCENTS[0];
    document.documentElement.style.setProperty("--accent", a);
    document.documentElement.style.setProperty("--accent-2", b);
  }
  function soundIcon() {
    $("#soundBtn").innerHTML = settings.sound
      ? `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="M15.5 8.5a5 5 0 0 1 0 7M18.5 5.5a9 9 0 0 1 0 13"/></svg>`
      : `<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4z"/><path d="m22 9-6 6M16 9l6 6"/></svg>`;
  }

  // ── Timer ─────────────────────────────────────────────────────
  function render() {
    const t = fmt(remaining);
    $("#time").textContent = t;
    ringFill.style.strokeDashoffset = CIRC * (1 - remaining / total);
    document.title = running ? `${t} · ${LABELS[mode]}` : "Flow — focus timer";
  }
  function moveInd() {
    const sel = $(`.tabs button[aria-selected="true"]`), ind = $(".tabs__ind");
    ind.style.width = sel.offsetWidth + "px";
    ind.style.transform = `translateX(${sel.offsetLeft}px)`;
  }
  function setMode(m, { keepRunning = false } = {}) {
    mode = m;
    document.body.dataset.mode = m;
    $$(".tabs button").forEach(b => b.setAttribute("aria-selected", b.dataset.mode === m));
    moveInd();
    $("#modeLabel").textContent = LABELS[m];
    total = remaining = settings[m] * 60;
    if (keepRunning) { endAt = Date.now() + remaining * 1000; } else pause();
    render();
  }
  function start() {
    if (running) return;
    running = true;
    endAt = Date.now() + remaining * 1000;
    document.body.classList.add("running");
    $("#playBtn").setAttribute("aria-label", "Pause (Space)");
    chime("start");
    clearInterval(tick);
    tick = setInterval(step, 250);
    render();
  }
  function pause() {
    running = false;
    clearInterval(tick);
    document.body.classList.remove("running");
    $("#playBtn").setAttribute("aria-label", "Start (Space)");
    render();
  }
  function step() {
    remaining = (endAt - Date.now()) / 1000;
    if (remaining <= 0) { remaining = 0; render(); complete(); return; }
    render();
  }
  function complete(skipped = false) {
    const wasFocus = mode === "focus";
    if (wasFocus && !skipped) {
      const today = stats[dayKey()] || (stats[dayKey()] = { min: 0, sess: 0, done: 0 });
      today.min += settings.focus; today.sess += 1;
      const t = tasks.find(x => x.id === activeTask);
      if (t) t.pomos = (t.pomos || 0) + 1;
      cycle = (cycle + 1) % 4;
      save("stats", stats); save("tasks", tasks); save("cycle", cycle);
      renderTasks(); renderStats();
    }
    if (!skipped) {
      chime("end");
      const msg = wasFocus ? "Session complete — take a breather." : "Break's over. Back to it!";
      toast(wasFocus ? "✨" : "⚡", msg);
      if (settings.notify && "Notification" in window && Notification.permission === "granted") new Notification("Flow", { body: msg });
    }
    const next = wasFocus ? (cycle === 0 && !skipped ? "long" : "short") : "focus";
    const auto = settings.auto && !skipped;
    setMode(next);
    renderDots();
    if (auto) start();
  }

  // ── Tasks ─────────────────────────────────────────────────────
  function renderTasks() {
    const ul = $("#tasks");
    ul.innerHTML = "";
    tasks.forEach(t => {
      const li = document.createElement("li");
      li.className = "task" + (t.done ? " done" : "") + (t.id === activeTask ? " active" : "");
      li.dataset.id = t.id;
      li.innerHTML = `<button class="check" aria-label="Complete"></button><span class="task__text"></span>` +
        `<span class="task__pomo" title="Sessions">${t.pomos ? "● " + t.pomos : ""}</span><button class="task__del" aria-label="Delete">✕</button>`;
      li.querySelector(".task__text").textContent = t.text;
      ul.appendChild(li);
    });
    const left = tasks.filter(t => !t.done).length;
    $("#taskCount").textContent = `${left} left`;
    $("#tasksEmpty").hidden = tasks.length > 0;
    const at = tasks.find(t => t.id === activeTask);
    $("#ringTask").textContent = at ? at.text : "No task selected";
    $("#ringTask").classList.toggle("on", !!at);
  }
  $("#addForm").addEventListener("submit", e => {
    e.preventDefault();
    const v = $("#taskInput").value.trim();
    if (!v) return;
    const t = { id: Date.now().toString(36), text: v, done: false, pomos: 0 };
    tasks.unshift(t);
    if (!activeTask) activeTask = t.id;
    $("#taskInput").value = "";
    save("tasks", tasks); save("active", activeTask);
    renderTasks();
  });
  $("#tasks").addEventListener("click", e => {
    const li = e.target.closest(".task");
    if (!li) return;
    const t = tasks.find(x => x.id === li.dataset.id);
    if (e.target.closest(".task__del")) {
      li.classList.add("leaving");
      setTimeout(() => {
        tasks = tasks.filter(x => x !== t);
        if (activeTask === t.id) activeTask = null;
        save("tasks", tasks); save("active", activeTask); renderTasks();
      }, 250);
      return;
    }
    if (e.target.closest(".check")) {
      t.done = !t.done;
      const today = stats[dayKey()] || (stats[dayKey()] = { min: 0, sess: 0, done: 0 });
      today.done = Math.max(0, today.done + (t.done ? 1 : -1));
      if (t.done) { toast("✅", `Done: ${t.text}`); if (activeTask === t.id) activeTask = (tasks.find(x => !x.done) || {}).id || null; }
      save("tasks", tasks); save("stats", stats); save("active", activeTask);
      renderTasks(); renderStats();
      return;
    }
    activeTask = t.id;
    save("active", activeTask);
    renderTasks();
  });

  // ── Stats ─────────────────────────────────────────────────────
  function renderStats() {
    const today = stats[dayKey()] || { min: 0, sess: 0, done: 0 };
    $("#kMin").textContent = today.min;
    $("#kSess").textContent = today.sess;
    $("#kDone").textContent = today.done;

    // streak: consecutive days with at least one session, counting back from today (or yesterday)
    let streak = 0;
    const d = new Date();
    if (!(stats[dayKey(d)] && stats[dayKey(d)].sess)) d.setDate(d.getDate() - 1);
    while (stats[dayKey(d)] && stats[dayKey(d)].sess) { streak++; d.setDate(d.getDate() - 1); }
    $("#streak").textContent = `🔥 ${streak} day streak`;

    const days = [];
    for (let i = 6; i >= 0; i--) { const x = new Date(); x.setDate(x.getDate() - i); days.push(x); }
    const vals = days.map(x => (stats[dayKey(x)] || {}).min || 0);
    const max = Math.max(60, ...vals);
    $("#chart").innerHTML = days.map((x, i) =>
      `<div class="bar-col${i === 6 ? " today" : ""}"><div class="b-wrap" data-v="${vals[i]} min"><div class="b" style="height:${Math.max(3, (vals[i] / max) * 100)}%;animation-delay:${i * 50}ms"></div></div>` +
      `<small>${x.toLocaleDateString(undefined, { weekday: "short" }).slice(0, 2)}</small></div>`).join("");
  }
  function renderDots() {
    $("#dots").innerHTML = [0, 1, 2, 3].map(i => `<i class="${i < cycle ? "on" : ""}"></i>`).join("");
  }

  // ── Settings ──────────────────────────────────────────────────
  const dlg = $("#settings");
  $("#settingsBtn").addEventListener("click", () => {
    $("#sFocus").value = settings.focus; $("#sShort").value = settings.short; $("#sLong").value = settings.long;
    $("#sAuto").checked = settings.auto; $("#sNotify").checked = settings.notify;
    renderSwatches();
    dlg.showModal();
  });
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  [["#sFocus", "focus", 120], ["#sShort", "short", 30], ["#sLong", "long", 60]].forEach(([sel, key, max]) => {
    $(sel).addEventListener("change", e => {
      settings[key] = Math.min(max, Math.max(1, Math.round(+e.target.value || settings[key])));
      e.target.value = settings[key];
      save("settings", settings);
      if (mode === key && !running) setMode(key);
    });
  });
  $("#sAuto").addEventListener("change", e => { settings.auto = e.target.checked; save("settings", settings); });
  $("#sNotify").addEventListener("change", async e => {
    if (e.target.checked && "Notification" in window && Notification.permission !== "granted") {
      const p = await Notification.requestPermission();
      if (p !== "granted") { e.target.checked = false; toast("🔕", "Notifications were blocked"); }
    }
    settings.notify = e.target.checked; save("settings", settings);
  });
  function renderSwatches() {
    $("#swatches").innerHTML = ACCENTS.map((c, i) =>
      `<button type="button" data-i="${i}" aria-pressed="${i === settings.accent}" aria-label="Accent ${i + 1}" style="background:linear-gradient(135deg,${c[0]},${c[1]})"></button>`).join("");
  }
  $("#swatches").addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    settings.accent = +b.dataset.i; save("settings", settings);
    applyAccent(); renderSwatches();
  });
  $("#wipeBtn").addEventListener("click", () => {
    if (!confirm("Clear all tasks and stats?")) return;
    tasks = []; stats = {}; activeTask = null; cycle = 0;
    ["tasks", "stats", "active", "cycle"].forEach(k => save(k, k === "tasks" ? [] : k === "stats" ? {} : k === "cycle" ? 0 : null));
    renderTasks(); renderStats(); renderDots(); dlg.close();
    toast("🧹", "Fresh start");
  });

  // ── Wiring ────────────────────────────────────────────────────
  $$(".tabs button").forEach(b => b.addEventListener("click", () => setMode(b.dataset.mode)));
  $("#playBtn").addEventListener("click", () => running ? pause() : start());
  $("#resetBtn").addEventListener("click", () => { pause(); remaining = total; render(); });
  $("#skipBtn").addEventListener("click", () => complete(true));
  $("#soundBtn").addEventListener("click", () => { settings.sound = !settings.sound; save("settings", settings); soundIcon(); toast(settings.sound ? "🔔" : "🔕", settings.sound ? "Sound on" : "Sound off"); });
  document.addEventListener("keydown", e => {
    if (/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || dlg.open || e.ctrlKey || e.metaKey || e.altKey) return;
    const k = e.key.toLowerCase();
    if (k === " ") { e.preventDefault(); running ? pause() : start(); }
    else if (k === "r") $("#resetBtn").click();
    else if (k === "s") $("#skipBtn").click();
    else if (k === "m") $("#soundBtn").click();
    else if (k === "n") { e.preventDefault(); $("#taskInput").focus(); }
  });
  window.addEventListener("resize", moveInd);
  document.fonts && document.fonts.ready.then(moveInd);

  $("#today").textContent = new Date().toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric" });
  applyAccent(); soundIcon();
  setMode("focus");
  requestAnimationFrame(() => requestAnimationFrame(() => $(".tabs").classList.add("ready")));
  renderTasks(); renderStats(); renderDots();
})();
