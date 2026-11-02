const dom = {
  board: document.querySelector("#mole-board"),
  keypad: document.querySelector("#keypad"),
  score: document.querySelector("#score"),
  lost: document.querySelector("#lost"),
  round: document.querySelector("#round"),
  message: document.querySelector("#game-message"),
  timer: document.querySelector("#round-timer"),
  reactionFill: document.querySelector("#reaction-fill"),
  technicalState: document.querySelector("#technical-state"),
  phaseLabel: document.querySelector("#phase-label"),
  moleCode: document.querySelector("#mole-code"),
  waitToken: document.querySelector("#wait-token"),
  spawnDelay: document.querySelector("#spawn-delay"),
  tickCount: document.querySelector("#tick-count"),
  traceList: document.querySelector("#trace-list"),
  startButton: document.querySelector("#start-button"),
  quitButton: document.querySelector("#quit-button"),
  resetButton: document.querySelector("#reset-button"),
  soundButton: document.querySelector("#sound-button"),
  bridgeState: document.querySelector("#bridge-state"),
  stateNodes: {
    IDLE: document.querySelector("#state-idle"),
    START_GAME: document.querySelector("#state-start"),
    CHECK: document.querySelector("#state-check"),
  },
};

const runtime = {
  meta: null,
  snapshot: null,
  reconnectTimer: null,
  stateName: "IDLE",
  phase: "idle",
  prepTimer: null,
  tickTimer: null,
  liveDeadline: 0,
  lastTickAt: 0,
  tickInFlight: false,
  actionInFlight: false,
  audioEnabled: true,
  audioContext: null,
  pendingMessage: "",
};

const runningOnApiHost =
  ["http:", "https:"].includes(location.protocol) &&
  ["127.0.0.1", "localhost"].includes(location.hostname) &&
  location.port === "8765";
const API_ORIGIN = runningOnApiHost ? "" : "http://127.0.0.1:8765";

const FALLBACK_META = {
  holes: [
    { hole: 0, keypad: 1, pin: "P7.3", label: "1" },
    { hole: 1, keypad: 2, pin: "P7.1", label: "2" },
    { hole: 2, keypad: 3, pin: "P9.4", label: "3" },
    { hole: 3, keypad: 5, pin: "P9.6", label: "4" },
    { hole: 4, keypad: 6, pin: "P8.0", label: "5" },
    { hole: 5, keypad: 7, pin: "P7.4", label: "6" },
    { hole: 6, keypad: 9, pin: "P7.6", label: "7" },
    { hole: 7, keypad: 10, pin: "P10.3", label: "8" },
    { hole: 8, keypad: 11, pin: "P7.7", label: "9" },
  ],
  keypad: [
    { keypad: 1, label: "1" },
    { keypad: 2, label: "2" },
    { keypad: 3, label: "3" },
    { keypad: 4, label: "4", navigation: true },
    { keypad: 5, label: "5" },
    { keypad: 6, label: "6" },
    { keypad: 7, label: "7" },
    { keypad: 8, label: "8", navigation: true },
    { keypad: 9, label: "9" },
    { keypad: 10, label: "10" },
    { keypad: 11, label: "11" },
    { keypad: 16, label: "16", start: true },
  ],
};

const fitNumber = (value, width) => String(value).padStart(width, "0");

function moleSvg() {
  return `
    <svg class="mole-figure" viewBox="0 0 120 120" aria-hidden="true">
      <ellipse class="mole-shadow" cx="60" cy="107" rx="31" ry="7"></ellipse>
      <g class="mole-body">
        <circle cx="38" cy="45" r="14" fill="#8d5a3b"></circle>
        <circle cx="82" cy="45" r="14" fill="#8d5a3b"></circle>
        <circle cx="38" cy="45" r="8" fill="#d99a83"></circle>
        <circle cx="82" cy="45" r="8" fill="#d99a83"></circle>
        <path d="M23 74c0-28 16-47 37-47s37 19 37 47c0 27-16 43-37 43S23 101 23 74Z" fill="#a66b48"></path>
        <path d="M37 75c0-17 10-29 23-29s23 12 23 29c0 17-10 27-23 27S37 92 37 75Z" fill="#c78f69"></path>
        <ellipse cx="48" cy="70" rx="5" ry="6" fill="#182229"></ellipse>
        <ellipse cx="72" cy="70" rx="5" ry="6" fill="#182229"></ellipse>
        <circle cx="46.5" cy="68" r="1.8" fill="#fff"></circle>
        <circle cx="70.5" cy="68" r="1.8" fill="#fff"></circle>
        <path d="M54 82h12l-6 6Z" fill="#26333a"></path>
        <path d="M60 88v4M60 92c-3 4-8 4-11 1M60 92c3 4 8 4 11 1" fill="none" stroke="#26333a" stroke-width="2.3" stroke-linecap="round"></path>
        <path d="M31 91c-9 2-14 8-13 14 6 4 16 1 21-7M89 91c9 2 14 8 13 14-6 4-16 1-21-7" fill="#8d5a3b"></path>
      </g>
    </svg>`;
}

function buildBoard() {
  dom.board.innerHTML = "";
  for (const hole of runtime.meta.holes) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mole-hole";
    button.dataset.hole = String(hole.hole);
    button.dataset.keypad = String(hole.keypad);
    button.dataset.testid = `hole-${hole.hole}`;
    button.setAttribute(
      "aria-label",
      `第 ${hole.label} 个洞，MKEY 键值 ${hole.keypad}，引脚 ${hole.pin}`,
    );
    button.innerHTML = `
      <span class="hole-pin">${hole.pin}</span>
      <span class="hole-depth">
        <span class="mole-slot">${moleSvg()}</span>
      </span>
      <span class="hole-code">${hole.label}</span>
    `;
    button.addEventListener("click", () => handleKeypad(hole.keypad));
    dom.board.append(button);
  }
}

function buildKeypad() {
  dom.keypad.innerHTML = "";
  for (const key of runtime.meta.keypad) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mkey-button${key.navigation ? " navigation" : ""}${key.start ? " start" : ""}`;
    button.dataset.keypad = String(key.keypad);
    button.dataset.testid = `keypad-${key.keypad}`;
    button.setAttribute("aria-label", `发送 MKEY 键值 ${key.keypad}`);
    button.innerHTML = `<span>${key.label}</span><small>${key.keypad === 16 ? "START" : "MKEY"}</small>`;
    button.addEventListener("click", () => handleKeypad(key.keypad));
    dom.keypad.append(button);
  }
}

async function api(path, payload = undefined) {
  const options = { method: payload === undefined ? "GET" : "POST", headers: {} };
  if (payload !== undefined) {
    options.headers["Content-Type"] = "application/json";
    options.body = JSON.stringify(payload);
  }
  if (typeof AbortSignal?.timeout === "function") {
    options.signal = AbortSignal.timeout(3000);
  }
  const response = await fetch(`${API_ORIGIN}${path}`, options);
  const data = await response.json();
  if (!response.ok || data.ok === false) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  return data;
}

function bridgeOnline(online) {
  dom.bridgeState.classList.toggle("online", online);
  dom.bridgeState.classList.toggle("offline", !online);
  dom.bridgeState.querySelector("span:last-child").textContent = online
    ? "C BRIDGE"
    : "C BRIDGE OFFLINE";
}

function scheduleReconnect() {
  if (runtime.reconnectTimer) return;
  runtime.reconnectTimer = window.setTimeout(async () => {
    runtime.reconnectTimer = null;
    await connectToService();
  }, 2000);
}

async function connectToService() {
  try {
    const data = await api("/api/state");
    updateSnapshot(data);
    handleTerminalState(data);
    updateClockDisplay(data.snapshot.reaction_window_ms);
    bridgeOnline(true);
    return true;
  } catch {
    bridgeOnline(false);
    if (runtime.phase !== "live") {
      setMessage("C 服务尚未连接，正在自动重试。", "error");
    }
    scheduleReconnect();
    return false;
  }
}

function eventSummary(event) {
  switch (event.kind_name) {
    case "STATE":
      return `${event.from_state_name} → ${event.to_state_name}`;
    case "SPAWN":
      return `地鼠 ${event.mole_hole + 1} / 键值 ${event.keypad} / ${event.value} ms 后出现`;
    case "HIT":
      return `命中键值 ${event.keypad} · +1`;
    case "MISS":
      return `错击键值 ${event.keypad} · 失分 +1`;
    case "TIMEOUT":
      return "500 ms 反应窗耗尽";
    case "START":
      return "键值 16 · 启动游戏";
    case "QUIT":
      return "键值 16 · 返回 IDLE";
    case "IGNORE":
      return `键值 ${event.keypad} · 保持当前地鼠`;
    case "RESET":
      return "状态机复位";
    default:
      return event.kind_name;
  }
}

function appendEvents(events) {
  if (!events.length) return;
  const empty = dom.traceList.querySelector(".trace-empty");
  if (empty) empty.remove();

  for (const event of events) {
    const item = document.createElement("li");
    item.className = `trace-item trace-${event.kind_name.toLowerCase()}`;
    item.innerHTML = `
      <span class="trace-kind">${event.kind_name}</span>
      <span class="trace-text">${eventSummary(event)}</span>
      <time>#${String(event.seq).padStart(2, "0")}</time>
    `;
    dom.traceList.prepend(item);
  }

  while (dom.traceList.children.length > 12) {
    dom.traceList.lastElementChild.remove();
  }
}

function setActiveState(stateName) {
  for (const [name, node] of Object.entries(dom.stateNodes)) {
    const active = name === stateName;
    node.classList.toggle("active", active);
    node.setAttribute("aria-current", active ? "step" : "false");
  }
}

function setMessage(message, tone = "") {
  dom.message.textContent = message;
  dom.message.dataset.tone = tone;
}

function updateClockDisplay(remainingMs) {
  const current = Math.max(0, remainingMs);
  dom.timer.textContent = `${Math.ceil(current)} ms`;
  const windowSize = runtime.snapshot?.reaction_window_ms || 500;
  const percentage = Math.max(0, Math.min(100, (current / windowSize) * 100));
  dom.reactionFill.style.transform = `scaleX(${percentage / 100})`;
  dom.reactionFill.dataset.low = percentage < 30 ? "true" : "false";
}

function updateSnapshot(data) {
  runtime.snapshot = data.snapshot;
  runtime.stateName = data.state_name;
  const snapshot = data.snapshot;

  dom.score.textContent = fitNumber(snapshot.score, 4);
  dom.lost.textContent = fitNumber(snapshot.lost, 4);
  dom.round.textContent = fitNumber(snapshot.round, 2);
  dom.technicalState.textContent = data.state_name;
  dom.moleCode.textContent = snapshot.mole_hole >= 0 ? String(snapshot.mole_code) : "--";
  dom.waitToken.textContent = String(snapshot.wait_token);
  dom.spawnDelay.textContent = snapshot.spawn_delay_ms ? `${snapshot.spawn_delay_ms} ms` : "--";
  dom.tickCount.textContent = String(snapshot.tick_count);
  setActiveState(data.state_name);
  appendEvents(data.events);
}

function clearRunTimers() {
  window.clearTimeout(runtime.prepTimer);
  window.clearInterval(runtime.tickTimer);
  runtime.prepTimer = null;
  runtime.tickTimer = null;
  runtime.tickInFlight = false;
}

function hideAllMoles() {
  for (const hole of dom.board.querySelectorAll(".mole-hole")) {
    hole.classList.remove("active");
    hole.setAttribute("aria-pressed", "false");
  }
}

function showMole(holeIndex) {
  hideAllMoles();
  const hole = dom.board.querySelector(`[data-hole="${holeIndex}"]`);
  if (hole) {
    hole.classList.add("active");
    hole.setAttribute("aria-pressed", "true");
  }
}

function beginPreparation(message = "地鼠正在靠近。") {
  clearRunTimers();
  runtime.phase = "preparing";
  runtime.pendingMessage = "";
  hideAllMoles();
  dom.phaseLabel.textContent = "准备";
  setMessage(message);
  updateClockDisplay(runtime.snapshot?.reaction_window_ms || 500);

  const delay = runtime.snapshot?.spawn_delay_ms || 500;
  runtime.prepTimer = window.setTimeout(beginLiveWindow, delay);
}

function beginLiveWindow() {
  if (!runtime.snapshot || runtime.stateName !== "CHECK") return;
  clearRunTimers();
  runtime.phase = "live";
  runtime.liveDeadline = performance.now() + runtime.snapshot.reaction_window_ms;
  runtime.lastTickAt = performance.now();
  dom.phaseLabel.textContent = "可击打";
  setMessage(runtime.pendingMessage || "地鼠已出现。", runtime.pendingMessage ? "result" : "");
  showMole(runtime.snapshot.mole_hole);
  updateClockDisplay(runtime.snapshot.reaction_window_ms);
  runtime.tickTimer = window.setInterval(sendClockTick, 50);
}

function handleTerminalState(data) {
  if (data.state_name === "IDLE") {
    clearRunTimers();
    runtime.phase = "idle";
    runtime.pendingMessage = "";
    hideAllMoles();
    dom.phaseLabel.textContent = "待机";
    setMessage("状态机已回到 IDLE。");
    updateClockDisplay(runtime.snapshot?.reaction_window_ms || 500);
  }
}

function resultMessage(events) {
  if (events.some((event) => event.kind_name === "HIT")) return "命中，下一轮准备中。";
  if (events.some((event) => event.kind_name === "TIMEOUT")) return "超时，下一轮准备中。";
  if (events.some((event) => event.kind_name === "MISS")) return "错击，下一轮准备中。";
  return "";
}

function applyActionResponse(data) {
  const previousRound = runtime.snapshot?.round ?? 0;
  const hadSpawn = data.events.some((event) => event.kind_name === "SPAWN");
  updateSnapshot(data);
  const result = resultMessage(data.events);
  playEventSounds(data.events);
  handleTerminalState(data);

  if (data.state_name === "CHECK") {
    const roundChanged = data.snapshot.round !== previousRound;
    if (hadSpawn || roundChanged) {
      runtime.pendingMessage = result;
      beginPreparation(result || "地鼠正在靠近。");
    } else if (runtime.phase === "live") {
      updateClockDisplay(liveRemaining());
    }
  }
}

function liveRemaining() {
  if (runtime.phase !== "live") return runtime.snapshot?.reaction_window_ms || 500;
  return Math.max(0, runtime.liveDeadline - performance.now());
}

async function sendClockTick() {
  if (
    runtime.phase !== "live" ||
    runtime.tickInFlight ||
    !runtime.snapshot ||
    runtime.stateName !== "CHECK"
  ) {
    return;
  }

  const now = performance.now();
  const elapsed = Math.max(0, Math.min(100, Math.round(now - runtime.lastTickAt)));
  runtime.lastTickAt = now;
  updateClockDisplay(liveRemaining());

  if (elapsed < 1 && liveRemaining() > 0) return;
  runtime.tickInFlight = true;
  try {
    const data = await api("/api/tick", { elapsedMs: elapsed });
    applyActionResponse(data);
  } catch (error) {
    clearRunTimers();
    runtime.phase = "error";
    bridgeOnline(false);
    scheduleReconnect();
    setMessage(`C 桥接失败：${error.message}`, "error");
  } finally {
    runtime.tickInFlight = false;
  }
}

async function handleKeypad(code) {
  if (code === 16) {
    if (runtime.stateName === "IDLE") {
      await startGame();
    } else {
      await quitGame();
    }
    return;
  }

  if (runtime.phase === "preparing") return;
  if (runtime.phase === "idle") {
    setMessage("先按 START 键值 16。");
    return;
  }
  if (runtime.phase !== "live") return;
  if (runtime.actionInFlight) return;

  runtime.actionInFlight = true;
  try {
    const data = await api("/api/press", { code });
    applyActionResponse(data);
  } catch (error) {
    bridgeOnline(false);
    scheduleReconnect();
    setMessage(`发送键值失败：${error.message}`, "error");
  } finally {
    runtime.actionInFlight = false;
  }
}

async function startGame() {
  if (runtime.actionInFlight) return;
  runtime.actionInFlight = true;
  clearRunTimers();
  hideAllMoles();
  runtime.phase = "starting";
  dom.phaseLabel.textContent = "启动";
  setMessage("状态机进入 START_GAME。");
  try {
    const data = await api("/api/start", {});
    runtime.snapshot = { round: 0 };
    applyActionResponse(data);
  } catch (error) {
    runtime.phase = "error";
    bridgeOnline(false);
    scheduleReconnect();
    setMessage(`启动失败：${error.message}`, "error");
  } finally {
    runtime.actionInFlight = false;
  }
}

async function quitGame() {
  if (runtime.actionInFlight) return;
  runtime.actionInFlight = true;
  try {
    const data = await api("/api/press", { code: 16 });
    applyActionResponse(data);
  } catch (error) {
    bridgeOnline(false);
    scheduleReconnect();
    setMessage(`退出失败：${error.message}`, "error");
  } finally {
    runtime.actionInFlight = false;
  }
}

async function resetGame() {
  if (runtime.actionInFlight) return;
  runtime.actionInFlight = true;
  clearRunTimers();
  hideAllMoles();
  runtime.phase = "resetting";
  setMessage("正在复位 C 状态机。");
  try {
    const data = await api("/api/reset", {});
    runtime.snapshot = { round: 0 };
    applyActionResponse(data);
    runtime.phase = "idle";
    dom.phaseLabel.textContent = "待机";
    setMessage("状态机与记分板已复位。");
    updateClockDisplay(500);
  } catch (error) {
    runtime.phase = "error";
    bridgeOnline(false);
    scheduleReconnect();
    setMessage(`复位失败：${error.message}`, "error");
  } finally {
    runtime.actionInFlight = false;
  }
}

function ensureAudio() {
  if (!runtime.audioContext) {
    runtime.audioContext = new AudioContext();
  }
  if (runtime.audioContext.state === "suspended") {
    runtime.audioContext.resume();
  }
  return runtime.audioContext;
}

function tone(frequency, duration, type = "square") {
  if (!runtime.audioEnabled) return;
  try {
    const context = ensureAudio();
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.value = frequency;
    gain.gain.setValueAtTime(0.035, context.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + duration / 1000);
    oscillator.connect(gain).connect(context.destination);
    oscillator.start();
    oscillator.stop(context.currentTime + duration / 1000);
  } catch {
    runtime.audioEnabled = false;
  }
}

function playEventSounds(events) {
  if (events.some((event) => event.kind_name === "HIT")) tone(1000, 90, "sine");
  if (
    events.some(
      (event) => event.kind_name === "MISS" || event.kind_name === "TIMEOUT",
    )
  ) {
    tone(500, 130, "square");
  }
}

function toggleSound() {
  runtime.audioEnabled = !runtime.audioEnabled;
  const use = dom.soundButton.querySelector("use");
  use.setAttribute("href", runtime.audioEnabled ? "#icon-volume" : "#icon-volume-off");
  dom.soundButton.setAttribute("aria-label", runtime.audioEnabled ? "关闭声音" : "打开声音");
  if (runtime.audioEnabled) tone(800, 50, "sine");
}

function installKeyboardControls() {
  document.addEventListener("keydown", (event) => {
    if (event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "Escape") {
      event.preventDefault();
      handleKeypad(16);
      return;
    }
    const index = Number.parseInt(event.key, 10);
    if (Number.isInteger(index) && index >= 1 && index <= 9 && runtime.meta) {
      event.preventDefault();
      handleKeypad(runtime.meta.holes[index - 1].keypad);
    }
  });
}

async function initialize() {
  runtime.meta = FALLBACK_META;
  try {
    runtime.meta = await api("/api/meta");
  } catch {
    runtime.meta = FALLBACK_META;
  }

  buildBoard();
  buildKeypad();
  dom.startButton.addEventListener("click", startGame);
  dom.quitButton.addEventListener("click", quitGame);
  dom.resetButton.addEventListener("click", resetGame);
  dom.soundButton.addEventListener("click", toggleSound);
  installKeyboardControls();
  await connectToService();
}

initialize();
