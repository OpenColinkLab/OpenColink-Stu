(() => {
  "use strict";

  const SIGNAL = {
    ENTRY: "ENTRY_SIG",
    EXIT: "EXIT_SIG",
    AUTO: "KEY_AUTO_SIG",
    OK: "KEY_OK_SIG",
    CLICK: "KEY_CLICK_SIG",
    CANCEL: "KEY_CANCLE_SIG",
    NEXT: "KEY_NXT_SIG",
    TIMEOUT: "KEY_TIMEOUT_SIG",
    RESET: "KEY_RST_SIG"
  };

  const STATUS = {
    TRAN: "TRAN_STATUS",
    HANDLED: "HANDLED_STATUS",
    IGNORED: "IGNORED_STATUS"
  };

  const STATE_ORDER = [
    "IDLE", "READ", "SAME", "ROTATE", "PICK",
    "TURN_1", "SEQU", "SELECT", "TURN_2", "TIMEOUT", "RESET"
  ];

  const STATE_META = {
    IDLE: { progress: 8, description: "洗牌完成，等待 KEY_AUTO_SIG 进入读取首尾牌状态。" },
    READ: { progress: 22, description: "记录牌堆首牌与尾牌的牌面值。" },
    SAME: { progress: 36, description: "在牌堆内部寻找与首尾牌相同的两张索引牌，并把它们移出有效牌堆。" },
    ROTATE: { progress: 50, description: "只保留两张索引牌正面朝上，其余牌翻到背面。" },
    PICK: { progress: 62, description: "等待用户点击一张背面牌。" },
    TURN_1: { progress: 72, description: "翻开用户选中的牌，等待 KEY_OK_SIG 确认。" },
    SEQU: { progress: 82, description: "按 click_idx 重组牌序，并把结果写入 temp_buf。" },
    SELECT: { progress: 90, description: "定位用户牌在重排结果中的位置。" },
    TURN_2: { progress: 100, description: "展示用户牌及其左右两张牌。" },
    TIMEOUT: { progress: 100, description: "超时分支；当前演示流程不主动进入。" },
    RESET: { progress: 100, description: "重置分支；当前演示流程不主动进入。" }
  };

  const RANKS = ["", "A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const SUITS = [
    { symbol: "♠", color: "black" },
    { symbol: "♥", color: "red" },
    { symbol: "♦", color: "red" },
    { symbol: "♣", color: "black" }
  ];

  const els = {
    statusText: document.getElementById("statusText"),
    instruction: document.getElementById("instruction"),
    headSecret: document.getElementById("headSecret"),
    tailSecret: document.getElementById("tailSecret"),
    deckMeta: document.getElementById("deckMeta"),
    primaryButton: document.getElementById("primaryButton"),
    resetButton: document.getElementById("resetButton"),
    cardStage: document.getElementById("cardStage"),
    cardGrid: document.getElementById("cardGrid"),
    finalePanel: document.getElementById("finalePanel"),
    finaleCards: document.getElementById("finaleCards"),
    finaleMeta: document.getElementById("finaleMeta"),
    progressLabel: document.getElementById("progressLabel"),
    progressBar: document.getElementById("progressBar"),
    progressValue: document.getElementById("progressValue"),
    lastSignal: document.getElementById("lastSignal"),
    footerHint: document.getElementById("footerHint"),
    stateTrack: document.getElementById("stateTrack"),
    stateIndex: document.getElementById("stateIndex"),
    currentState: document.getElementById("currentState"),
    currentDescription: document.getElementById("currentDescription"),
    eventLog: document.getElementById("eventLog"),
    clearLogButton: document.getElementById("clearLogButton"),
    toast: document.getElementById("toast")
  };

  let game = null;
  let cardElements = [];
  let logEntries = [];
  let busy = false;
  let toastTimer = null;
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const rankLabel = (rank) => RANKS[rank] || String(rank);
  const cardText = (card) => `${rankLabel(card.rank)}${card.suit.symbol}`;

  function createDeck() {
    const deck = [];
    let id = 0;
    for (let rank = 1; rank <= 13; rank += 1) {
      for (let suit = 0; suit < 4; suit += 1) deck.push({ id: id++, rank, suit: SUITS[suit] });
    }
    return deck;
  }

  function shuffleDeck(deck) {
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
  }

  function createGame() {
    return {
      state: null,
      nextState: null,
      deck: createDeck(),
      cardBuf: [],
      isFront: Array(52).fill(1),
      headCard: 0,
      tailCard: 0,
      specialIndex: [-1, -1],
      clickIdx: -1,
      tempBuf: [],
      tempCards: [],
      tempPickIdx: -1
    };
  }

  function resetGame() {
    busy = false;
    game = createGame();
    cardElements = [];
    els.cardStage.classList.remove("is-finale");
    els.finalePanel.hidden = true;
    els.cardGrid.innerHTML = "";
    logEntries = [];
    buildCards();
    enterState("IDLE");
    addLog("INIT", "INIT", "IDLE", "HANDLED_STATUS");
    renderAll();
  }

  function buildCards() {
    const fragment = document.createDocumentFragment();
    game.deck.forEach((card, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "card";
      button.dataset.index = String(index);
      button.innerHTML = `
        <span class="card-inner">
          <span class="card-face">
            <span class="card-rank">${rankLabel(card.rank)}</span>
            <span class="card-suit is-${card.suit.color}">${card.suit.symbol}</span>
          </span>
          <span class="card-back"></span>
        </span>`;
      button.addEventListener("click", () => chooseCard(index));
      fragment.appendChild(button);
      cardElements.push(button);
    });
    els.cardGrid.appendChild(fragment);
  }

  function enterState(state) {
    game.state = state;
    game.nextState = null;
    callHandler(state, SIGNAL.ENTRY);
  }

  function callHandler(state, signal) {
    const handler = HANDLERS[state];
    return handler ? handler(signal) : STATUS.IGNORED;
  }

  function transition(nextState) {
    game.nextState = nextState;
    return STATUS.TRAN;
  }

  function dispatch(signal) {
    const from = game.state;
    if (!from) return STATUS.IGNORED;
    game.nextState = null;
    const result = callHandler(from, signal);
    if (result === STATUS.TRAN && game.nextState) {
      const to = game.nextState;
      callHandler(from, SIGNAL.EXIT);
      game.state = to;
      game.nextState = null;
      callHandler(to, SIGNAL.ENTRY);
      addLog(signal, from, to, result);
    } else {
      addLog(signal, from, from, result);
    }
    els.lastSignal.textContent = signal;
    renderAll();
    return result;
  }

  function shuffleAction() {
    shuffleDeck(game.deck);
    game.cardBuf = game.deck.map((card) => card.rank);
    game.isFront = Array(52).fill(1);
    game.specialIndex = [-1, -1];
    game.clickIdx = -1;
    game.tempBuf = [];
    game.tempCards = [];
    game.tempPickIdx = -1;
  }

  function findSpecialCards() {
    let headIndex = -1;
    let tailIndex = -1;
    game.specialIndex = [-1, -1];
    game.cardBuf = game.deck.map((card) => card.rank);
    for (let i = 1; i < 51; i += 1) {
      if (game.cardBuf[i] === game.headCard && headIndex < 0) {
        headIndex = i;
        game.cardBuf[i] = 0;
        game.isFront[i] = 0;
      }
      if (game.cardBuf[i] === game.tailCard && tailIndex < 0) {
        tailIndex = i;
        game.cardBuf[i] = 0;
        game.isFront[i] = 0;
      }
      if (headIndex >= 0 && tailIndex >= 0) break;
    }
    game.specialIndex = [headIndex, tailIndex];
  }

  function rotateCards() {
    for (let i = 0; i < 52; i += 1) game.isFront[i] = game.specialIndex.includes(i) ? 1 : 0;
  }

  function chooseCard(index) {
    if (busy || game.state !== "PICK") {
      showToast("请等待状态机进入 PICK。");
      return false;
    }
    if (index <= 0 || index >= 51) {
      showToast("为了保留左右相邻牌，请选择中间区域的牌。");
      return false;
    }
    if (game.cardBuf[index] === 0 || game.isFront[index] !== 0) {
      showToast("这张牌不能选择，请选一张背面牌。");
      return false;
    }
    game.clickIdx = index;
    dispatch(SIGNAL.CLICK);
    els.instruction.textContent = `你选中了 ${cardText(game.deck[index])}。点击“确认并揭晓”，让状态机完成 SEQU、SELECT 和 TURN_2。`;
    return true;
  }

  function buildTempSequence() {
    const after = [];
    const before = [];
    for (let i = game.clickIdx + 1; i < 52; i += 1) if (game.cardBuf[i] !== 0) after.push(game.deck[i]);
    for (let i = 0; i < game.clickIdx; i += 1) if (game.cardBuf[i] !== 0) before.push(game.deck[i]);
    game.tempCards = [...after, game.deck[game.clickIdx], ...before];
    game.tempBuf = game.tempCards.map((card) => card.rank);
    game.tempPickIdx = after.length;
  }

  const HANDLERS = {
    IDLE(signal) {
      if (signal === SIGNAL.ENTRY) { shuffleAction(); return STATUS.HANDLED; }
      if (signal === SIGNAL.AUTO) return transition("READ");
      return STATUS.IGNORED;
    },
    READ(signal) {
      if (signal === SIGNAL.ENTRY) { game.headCard = game.deck[0].rank; game.tailCard = game.deck[51].rank; return STATUS.HANDLED; }
      if (signal === SIGNAL.AUTO) return transition("SAME");
      return STATUS.IGNORED;
    },
    SAME(signal) {
      if (signal === SIGNAL.ENTRY) { findSpecialCards(); return STATUS.HANDLED; }
      if (signal === SIGNAL.AUTO) return transition("ROTATE");
      return STATUS.IGNORED;
    },
    ROTATE(signal) {
      if (signal === SIGNAL.ENTRY) { rotateCards(); return STATUS.HANDLED; }
      if (signal === SIGNAL.NEXT) return transition("PICK");
      return STATUS.IGNORED;
    },
    PICK(signal) {
      if (signal === SIGNAL.ENTRY) return STATUS.HANDLED;
      if (signal === SIGNAL.CLICK) return transition("TURN_1");
      return STATUS.IGNORED;
    },
    TURN_1(signal) {
      if (signal === SIGNAL.ENTRY) { if (game.clickIdx >= 0) game.isFront[game.clickIdx] = 1; return STATUS.HANDLED; }
      if (signal === SIGNAL.OK) return transition("SEQU");
      return STATUS.IGNORED;
    },
    SEQU(signal) {
      if (signal === SIGNAL.ENTRY) { buildTempSequence(); return STATUS.HANDLED; }
      if (signal === SIGNAL.NEXT) return transition("SELECT");
      return STATUS.IGNORED;
    },
    SELECT(signal) {
      if (signal === SIGNAL.ENTRY) return STATUS.HANDLED;
      if (signal === SIGNAL.NEXT) return transition("TURN_2");
      return STATUS.IGNORED;
    },
    TURN_2(signal) {
      if (signal === SIGNAL.ENTRY) return STATUS.HANDLED;
      if (signal === SIGNAL.TIMEOUT) return transition("TIMEOUT");
      if (signal === SIGNAL.RESET) return transition("RESET");
      return STATUS.IGNORED;
    },
    TIMEOUT(signal) { return signal === SIGNAL.ENTRY ? STATUS.HANDLED : STATUS.IGNORED; },
    RESET(signal) { return signal === SIGNAL.ENTRY ? STATUS.HANDLED : STATUS.IGNORED; }
  };

  async function runIntro() {
    if (busy) return;
    busy = true;
    resetGame();
    busy = true;
    els.instruction.textContent = "牌堆正在洗牌。状态机随后会读取首尾牌，并选出两张内部索引牌。";
    updatePrimaryButton();
    await wait(520);
    dispatch(SIGNAL.AUTO);
    els.instruction.textContent = "READ 已记录首尾牌。接下来寻找牌堆内部相同的两张索引牌。";
    await wait(700);
    dispatch(SIGNAL.AUTO);
    els.instruction.textContent = "两张索引牌已经定位。其余牌即将翻到背面。";
    await wait(850);
    dispatch(SIGNAL.AUTO);
    els.instruction.textContent = "只留下两张金色索引牌正面朝上。请从背面的牌中选一张中间位置的牌。";
    await wait(650);
    dispatch(SIGNAL.NEXT);
    busy = false;
    renderAll();
    showToast("轮到你了：点击一张发光的背面牌。");
  }

  async function runFinale() {
    if (busy || game.state !== "TURN_1") return;
    busy = true;
    updatePrimaryButton();
    els.instruction.textContent = "你已选中一张牌。SEQU 正在按 click_idx 重组牌序。";
    await wait(550);
    dispatch(SIGNAL.OK);
    await wait(850);
    dispatch(SIGNAL.NEXT);
    els.instruction.textContent = "SELECT 已定位你选中的牌，准备翻开左右相邻牌。";
    await wait(750);
    dispatch(SIGNAL.NEXT);
    busy = false;
    renderAll();
    els.cardStage.classList.add("is-finale");
    els.finalePanel.hidden = false;
    renderFinale();
    els.instruction.textContent = "揭秘完成。你选中的牌被状态机放在了首尾记忆牌之间。";
    updatePrimaryButton();
  }

  function handlePrimary() {
    if (busy) return;
    if (game.state === "IDLE") runIntro();
    else if (game.state === "TURN_1") runFinale();
    else if (game.state === "TURN_2") runIntro();
  }

  function addLog(signal, from, to, result) {
    logEntries.unshift({ signal, from, to, result });
    logEntries = logEntries.slice(0, 30);
    renderLog();
  }

  function renderLog() {
    els.eventLog.innerHTML = logEntries.map((entry) => {
      const route = entry.from === entry.to ? entry.from : `${entry.from} → ${entry.to}`;
      return `<li class="log-item"><strong>${entry.signal}</strong><span>${route} · ${entry.result}</span></li>`;
    }).join("");
  }

  function renderSecrets() {
    const visible = ["READ", "SAME", "ROTATE", "PICK", "TURN_1", "SEQU", "SELECT", "TURN_2"].includes(game.state);
    els.headSecret.classList.toggle("is-unknown", !visible);
    els.tailSecret.classList.toggle("is-unknown", !visible);
    els.headSecret.querySelector("strong").textContent = visible ? rankLabel(game.headCard) : "?";
    els.tailSecret.querySelector("strong").textContent = visible ? rankLabel(game.tailCard) : "?";
  }

  function renderCards() {
    const specials = new Set(game.specialIndex.filter((index) => index >= 0));
    cardElements.forEach((element, index) => {
      const isFace = game.isFront[index] === 1;
      const isSpecial = specials.has(index) && ["SAME", "ROTATE", "PICK", "TURN_1", "SEQU", "SELECT", "TURN_2"].includes(game.state);
      const isPickable = game.state === "PICK" && index > 0 && index < 51 && !isSpecial && game.isFront[index] === 0 && game.cardBuf[index] !== 0;
      const isPicked = index === game.clickIdx && ["TURN_1", "SEQU", "SELECT", "TURN_2"].includes(game.state);
      element.classList.toggle("is-face", isFace);
      element.classList.toggle("is-special", isSpecial);
      element.classList.toggle("is-clickable", isPickable);
      element.classList.toggle("is-picked", isPicked);
      element.setAttribute("aria-label", isFace ? `${cardText(game.deck[index])}，正面` : "背面牌");
      element.disabled = !isPickable;
    });
  }

  function renderStateTrack() {
    const currentIndex = STATE_ORDER.indexOf(game.state);
    els.stateTrack.innerHTML = STATE_ORDER.map((state, index) => {
      const classes = ["state-chip"];
      if (state === game.state) classes.push("is-active");
      else if (index < currentIndex) classes.push("is-complete");
      return `<span class="${classes.join(" ")}">${state}</span>`;
    }).join("");
    els.stateIndex.textContent = `${String(currentIndex + 1).padStart(2, "0")} / ${String(STATE_ORDER.length).padStart(2, "0")}`;
    els.currentState.textContent = game.state || "IDLE";
    els.currentDescription.textContent = STATE_META[game.state]?.description || "";
  }

  function renderProgress() {
    const progress = STATE_META[game.state]?.progress || 0;
    els.progressBar.style.width = `${progress}%`;
    els.progressValue.textContent = `${progress}%`;
    els.progressLabel.textContent = game.state === "PICK" ? "等待选牌" : game.state === "TURN_2" ? "揭示完成" : "流程推进中";
  }

  function updatePrimaryButton() {
    els.primaryButton.disabled = busy || game.state === "PICK";
    els.primaryButton.textContent = busy ? "演示中..." : game.state === "IDLE" ? "开始演示" : game.state === "TURN_1" ? "确认并揭晓" : game.state === "TURN_2" ? "再来一次" : game.state === "PICK" ? "请选择一张牌" : "继续";
  }

  function renderFooter() {
    const removed = game.specialIndex.filter((index) => index >= 0).length;
    els.deckMeta.textContent = `${52 - removed} 张有效牌`;
    els.footerHint.textContent = game.state === "PICK" ? "金色索引牌不能点；请选择中间区域的一张背面牌" : game.state === "TURN_1" ? "点击“确认并揭晓”继续发送 KEY_OK_SIG" : game.state === "TURN_2" ? "左右两张牌与首尾记忆牌对应" : "状态迁移由 SOL_FSM_Dispatch 驱动";
    els.statusText.textContent = `${game.state || "IDLE"} · ${busy ? "运行中" : "已就绪"}`;
  }

  function renderFinale() {
    const center = game.tempPickIdx;
    const start = Math.max(0, Math.min(center - 1, game.tempCards.length - 3));
    const triplet = game.tempCards.slice(start, start + 3);
    const centerPosition = center - start;
    els.finaleCards.innerHTML = triplet.map((card, index) => `
      <div class="finale-card ${card.suit.color === "red" ? "is-red" : "is-black"}" ${index === centerPosition ? 'aria-current="true"' : ""}>
        <span class="finale-rank">${rankLabel(card.rank)}</span>
        <span class="finale-suit">${card.suit.symbol}</span>
      </div>`).join("");
    const chosen = game.tempCards[center];
    els.finaleMeta.innerHTML = `你选中的牌是 <strong>${cardText(chosen)}</strong>，左右相邻牌为 <strong>${cardText(triplet[0])}</strong>、<strong>${cardText(triplet[1])}</strong>、<strong>${cardText(triplet[2])}</strong>。<br>首尾记忆牌：${rankLabel(game.headCard)} / ${rankLabel(game.tailCard)} · temp_pick_idx = ${game.tempPickIdx} · temp_buf 长度 = ${game.tempBuf.length}`;
  }

  function renderAll() {
    if (!game) return;
    renderSecrets();
    renderCards();
    renderStateTrack();
    renderProgress();
    renderFooter();
    updatePrimaryButton();
  }

  function showToast(message) {
    clearTimeout(toastTimer);
    els.toast.textContent = message;
    els.toast.classList.add("is-visible");
    toastTimer = setTimeout(() => els.toast.classList.remove("is-visible"), 2200);
  }

  els.primaryButton.addEventListener("click", handlePrimary);
  els.resetButton.addEventListener("click", () => {
    if (!busy) {
      resetGame();
      showToast("牌局已重置，点击“开始演示”重新开始。");
    }
  });
  els.clearLogButton.addEventListener("click", () => { logEntries = []; renderLog(); });
  document.addEventListener("keydown", (event) => {
    if (event.key.toLowerCase() === "r") resetGame();
    if (event.key === "Enter" && !els.primaryButton.disabled) handlePrimary();
  });

  resetGame();
})();

