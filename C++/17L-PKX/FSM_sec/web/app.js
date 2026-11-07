(() => {
  "use strict";
  const SIGNAL = { ENTRY:"ENTRY_SIG", EXIT:"EXIT_SIG", AUTO:"KEY_AUTO_SIG", NEXT:"KEY_NXT_SIG", CLICK:"KEY_CLICK_SIG", RESET:"KEY_RST_SIG" };
  const STATUS = { TRAN:"TRAN_STATUS", HANDLED:"HANDLED_STATUS", IGNORED:"IGNORED_STATUS" };
  const STATES = ["IDLE","REMEMBER","SELECT","SEQUENCE_1","SEQUENCE_2","SEQUENCE_3","RE_SEQ","TURN"];
  const META = {
    IDLE:{p:8,d:"洗牌完成，所有牌背面朝上。"}, REMEMBER:{p:22,d:"记录牌堆顶部三张牌。"},
    SELECT:{p:36,d:"从剩余牌中找出与三张记忆牌同牌面的牌。"},
    SEQUENCE_1:{p:50,d:"第一堆：选择用户牌的插入位置。"}, SEQUENCE_2:{p:64,d:"第二堆：选择用户牌的插入位置。"},
    SEQUENCE_3:{p:76,d:"第三堆：选择用户牌的插入位置。"}, RE_SEQ:{p:90,d:"依次把三堆牌围绕插入位置重新排列。"},
    TURN:{p:100,d:"翻开三堆中的插入牌。"}
  };
  const RANKS = ["","A","2","3","4","5","6","7","8","9","10","J","Q","K"];
  const SUITS = [{s:"♠",c:"black"},{s:"♥",c:"red"},{s:"♦",c:"red"},{s:"♣",c:"black"}];
  const els = {
    status:document.getElementById("statusText"), instruction:document.getElementById("instruction"), memory:document.getElementById("memoryCards"),
    deckMeta:document.getElementById("deckMeta"), primary:document.getElementById("primaryButton"), reset:document.getElementById("resetButton"),
    choicePanel:document.getElementById("choicePanel"), choiceTitle:document.getElementById("choiceTitle"), choiceHint:document.getElementById("choiceHint"),
    picker:document.getElementById("numberPicker"), choiceConfirm:document.getElementById("choiceConfirm"), cardStage:document.getElementById("cardStage"), fxRing:document.getElementById("fxRing"),
    grid:document.getElementById("cardGrid"), finale:document.getElementById("finalePanel"), finaleCards:document.getElementById("finaleCards"), finalDeck:document.getElementById("finalDeck"),
    finaleMeta:document.getElementById("finaleMeta"), pileStatus:document.getElementById("pileStatus"), progressLabel:document.getElementById("progressLabel"),
    progressBar:document.getElementById("progressBar"), progressValue:document.getElementById("progressValue"), lastSignal:document.getElementById("lastSignal"),
    footerHint:document.getElementById("footerHint"), stateTrack:document.getElementById("stateTrack"), stateIndex:document.getElementById("stateIndex"),
    currentState:document.getElementById("currentState"), currentDescription:document.getElementById("currentDescription"), log:document.getElementById("eventLog"),
    clearLog:document.getElementById("clearLogButton"), toast:document.getElementById("toast")
  };
  let game=null, cardEls=[], logs=[], busy=false, toastTimer=0;
  const wait=(ms)=>new Promise(r=>setTimeout(r,ms));
  const rankLabel=(rank)=>RANKS[rank]||String(rank);
  function createDeck(){const d=[];let id=0;for(let rank=1;rank<=13;rank++){for(let s=0;s<4;s++)d.push({id:id++,rank,suit:SUITS[s]});}return d;}
  function shuffle(d){for(let i=d.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[d[i],d[j]]=[d[j],d[i]];}}
  function newGame(){return {state:null,next:null,deck:createDeck(),used:new Set(),pointer:0,memory:[],picks:[],piles:[[],[],[]],choices:[null,null,null],choice:null,finalCards:[],finalPositions:[]};}
  function resetGame(){busy=false;document.body.classList.remove("is-final-mode");window.scrollTo({top:0,behavior:"smooth"});game=newGame();logs=[];cardEls=[];shuffle(game.deck);els.cardStage.classList.remove("is-finale");els.finale.hidden=true;els.grid.innerHTML="";buildDeckDom();enterState("IDLE");addLog("INIT","INIT","IDLE",STATUS.HANDLED);renderAll();}
  function buildDeckDom(){const f=document.createDocumentFragment();game.deck.forEach(card=>{const el=document.createElement("div");el.className="card";el.innerHTML=`<span class="card-inner"><span class="card-face"><span class="card-rank">${rankLabel(card.rank)}</span><span class="card-suit is-${card.suit.c}">${card.suit.s}</span></span><span class="card-back"></span></span>`;f.appendChild(el);cardEls.push(el);});els.grid.appendChild(f);}
  function enterState(state){game.state=state;game.next=null;call(state,SIGNAL.ENTRY);}
  function transition(next){game.next=next;return STATUS.TRAN;}
  function call(state,signal){const h=HANDLERS[state];return h?h(signal):STATUS.IGNORED;}
  function dispatch(signal){const from=game.state;game.next=null;const result=call(from,signal);if(result===STATUS.TRAN&&game.next){const to=game.next;call(from,SIGNAL.EXIT);game.state=to;game.next=null;call(to,SIGNAL.ENTRY);addLog(signal,from,to,result);}else{addLog(signal,from,from,result);}els.lastSignal.textContent=signal;renderAll();return result;}
  function markUsed(card){if(card)game.used.add(card.id);}
  function prepareMemoryAndPicks(){game.memory=game.deck.slice(0,3);game.picks=[];game.memory.forEach(markUsed);game.memory.forEach(memoryCard=>{let match=game.deck.find(card=>!game.used.has(card.id)&&card.rank===memoryCard.rank);if(match){game.picks.push(match);markUsed(match);}});game.pointer=0;}
  function takeNextCard(){while(game.pointer<game.deck.length){const card=game.deck[game.pointer++];if(!game.used.has(card.id)){markUsed(card);return card;}}return {id:-1,rank:0,suit:SUITS[0]};}
  function buildPile(number,insertIndex){const size=number===3?17:16;const pile=new Array(size).fill(null);pile[0]=game.memory[number-1];pile[insertIndex]=game.picks[number-1];for(let pos=1;pos<size;pos++){if(pos===insertIndex)continue;pile[pos]=takeNextCard();}game.piles[number-1]=pile;game.choices[number-1]=insertIndex;}
  function buildFinal(){game.finalPositions=[];game.finalCards=[];let base=0;game.piles.forEach((pile,i)=>{const idx=game.choices[i];game.finalPositions.push(base+(pile.length-1-idx));game.finalCards.push(...pile.slice(idx+1),pile[idx],...pile.slice(0,idx));base+=pile.length;});}
  const HANDLERS={
    IDLE(sig){if(sig===SIGNAL.ENTRY){game.used=new Set();game.pointer=0;return STATUS.HANDLED;}if(sig===SIGNAL.AUTO)return transition("REMEMBER");return STATUS.IGNORED;},
    REMEMBER(sig){if(sig===SIGNAL.ENTRY){game.memory=game.deck.slice(0,3);return STATUS.HANDLED;}if(sig===SIGNAL.AUTO)return transition("SELECT");return STATUS.IGNORED;},
    SELECT(sig){if(sig===SIGNAL.ENTRY){prepareMemoryAndPicks();return STATUS.HANDLED;}if(sig===SIGNAL.NEXT)return transition("SEQUENCE_1");return STATUS.IGNORED;},
    SEQUENCE_1(sig){if(sig===SIGNAL.ENTRY){game.choice=null;return STATUS.HANDLED;}if(sig===SIGNAL.NEXT&&game.choice!==null){buildPile(1,game.choice);return transition("SEQUENCE_2");}return STATUS.IGNORED;},
    SEQUENCE_2(sig){if(sig===SIGNAL.ENTRY){game.choice=null;return STATUS.HANDLED;}if(sig===SIGNAL.NEXT&&game.choice!==null){buildPile(2,game.choice);return transition("SEQUENCE_3");}return STATUS.IGNORED;},
    SEQUENCE_3(sig){if(sig===SIGNAL.ENTRY){game.choice=null;return STATUS.HANDLED;}if(sig===SIGNAL.NEXT&&game.choice!==null){buildPile(3,game.choice);return transition("RE_SEQ");}return STATUS.IGNORED;},
    RE_SEQ(sig){if(sig===SIGNAL.ENTRY){buildFinal();return STATUS.HANDLED;}if(sig===SIGNAL.NEXT)return transition("TURN");return STATUS.IGNORED;},
    TURN(sig){if(sig===SIGNAL.ENTRY)return STATUS.HANDLED;if(sig===SIGNAL.RESET)return transition("IDLE");return STATUS.IGNORED;}
  };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function cardElement(card){ const index=game.deck.indexOf(card); return index>=0?cardEls[index]:null; }
  async function animateElements(elements, framesFactory, options={}){
    if(reduceMotion || elements.length===0) return;
    const anims=elements.map((el,i)=>el.animate(framesFactory(el,i),{
      duration:options.duration||600,
      delay:(options.delay||0)+i*(options.stagger||0),
      easing:options.easing||"cubic-bezier(.2,.75,.2,1)",
      fill:options.fill||"both"
    }));
    await Promise.allSettled(anims.map(a=>a.finished));
  }
  async function pulseRing(){
    if(reduceMotion) return;
    els.fxRing.classList.remove("is-active");
    void els.fxRing.offsetWidth;
    els.fxRing.classList.add("is-active");
    await wait(820);
    els.fxRing.classList.remove("is-active");
  }
  async function animateShuffle(){
    els.cardStage.classList.add("is-shuffling");
    const chosen=cardEls.filter((_,i)=>i%2===0);
    await animateElements(chosen,()=>{
      const x=(Math.random()-.5)*54;
      const y=(Math.random()-.5)*34;
      const r=(Math.random()-.5)*18;
      return [
        {transform:"translate(0,0) rotate(0deg)"},
        {transform:`translate(${x*.55}px,${y*.55}px) rotate(${r*.5}deg)`,offset:.35},
        {transform:`translate(${-x}px,${-y}px) rotate(${-r}deg)`,offset:.72},
        {transform:"translate(0,0) rotate(0deg)"}
      ];
    },{duration:820,stagger:9,easing:"ease-in-out"});
    els.cardStage.classList.remove("is-shuffling");
  }
  async function animateMemoryReveal(){
    const memoryCards=els.memory.querySelectorAll(".memory-card");
    memoryCards.forEach((el,i)=>{
      el.classList.remove("is-revealed");
      setTimeout(()=>el.classList.add("is-revealed"),i*110);
    });
    await wait(520);
    await pulseRing();
  }  async function animateSelection(){
    const elements=game.picks.map(cardElement).filter(Boolean);
    elements.forEach(el=>el.classList.add("is-face","is-pick-reveal"));
    await animateElements(elements,()=>[
      {transform:"translateY(0) scale(1)",boxShadow:"0 0 0 rgba(246,211,123,0)"},
      {transform:"translateY(-18px) scale(1.2)",boxShadow:"0 0 28px rgba(246,211,123,.55)",offset:.4},
      {transform:"translateY(0) scale(1)",boxShadow:"0 0 0 rgba(246,211,123,0)"}
    ],{duration:720,stagger:160,easing:"ease-in-out"});
    await pulseRing();
  }
  async function animatePileBuild(number){
    const pile=game.piles[number-1]||[];
    const elements=pile.map(cardElement).filter(Boolean);
    const status=els.pileStatus.querySelectorAll(".pile-item")[number-1];
    if(status){status.classList.add("is-animating");}
    await animateElements(elements.slice(0,18),()=>[
      {transform:"translateY(0) rotate(0deg)",opacity:1},
      {transform:"translateY(-16px) rotate(-4deg)",opacity:.75,offset:.5},
      {transform:"translateY(0) rotate(0deg)",opacity:1}
    ],{duration:520,stagger:18,easing:"ease-in-out"});
    if(status){status.classList.remove("is-animating");}
    await pulseRing();
  }
  async function animateRearrange(){
    els.cardStage.classList.add("is-rearranging");
    if(!reduceMotion){
      await animateElements(cardEls,()=>[
        {transform:"translateY(0) scale(1) rotate(0deg)",opacity:1},
        {transform:"translateY(-10px) scale(.94) rotate(2deg)",opacity:.35,offset:.55},
        {transform:"translateY(0) scale(1) rotate(0deg)",opacity:1}
      ],{duration:900,stagger:7,easing:"ease-in-out"});
    }
    els.cardStage.classList.remove("is-rearranging");
  }  async function startShow(){
    if(busy) return;
    busy=true;
    resetGame();
    busy=true;
    updateButtons();
    els.instruction.textContent="正在洗牌，牌阵会抖动并重新排列。";
    await animateShuffle();
    dispatch(SIGNAL.AUTO);
    els.instruction.textContent="REMEMBER：顶部三张牌被标记，但保持背面。";
    await animateMemoryReveal();
    await wait(280);
    dispatch(SIGNAL.AUTO);
    els.instruction.textContent="SELECT：三张相同牌面的插入牌被高亮。";
    await animateSelection();
    await wait(280);
    dispatch(SIGNAL.NEXT);
    busy=false;
    els.instruction.textContent="第一堆：选择 1~15 中的一个位置，作为用户牌插入点。";
    renderAll();
  }
  async function confirmChoice(){
    if(busy) return;
    if(!game.state.startsWith("SEQUENCE")) return;
    if(game.choice===null){ showToast("请先选择一个插入位置。"); return; }
    const pileNumber=game.state==="SEQUENCE_1"?1:game.state==="SEQUENCE_2"?2:3;
    busy=true;
    updateButtons();
    dispatch(SIGNAL.NEXT);
    els.instruction.textContent=`第${pileNumber}堆放牌完成，正在整理牌堆。`;
    await animatePileBuild(pileNumber);
    if(game.state==="SEQUENCE_2"){
      els.instruction.textContent="第一堆完成。第二堆继续选择 1~15 的插入位置。";
    }else if(game.state==="SEQUENCE_3"){
      els.instruction.textContent="第二堆完成。第三堆选择 1~16 的插入位置。";
    }
    if(game.state==="RE_SEQ"){
      await wait(350);
      els.instruction.textContent="RE_SEQ：三堆牌依次展开，正在重排。";
      await animateRearrange();
      dispatch(SIGNAL.NEXT);
      await wait(250);
      document.body.classList.add("is-final-mode");
      els.cardStage.classList.add("is-finale");
      els.finale.hidden=false;
      renderFinale();
      els.finale.scrollIntoView({behavior:"smooth",block:"start"});
      await animateFinaleReveal();
    }
    busy=false;
    renderAll();
  }  function addLog(signal,from,to,result){logs.unshift({signal,from,to,result});logs=logs.slice(0,30);renderLog();}
  function renderLog(){els.log.innerHTML=logs.map(e=>{const route=e.from===e.to?e.from:`${e.from} → ${e.to}`;return `<li class="log-item"><strong>${e.signal}</strong><span>${route} · ${e.result}</span></li>`;}).join("");}
  function renderMemory(){const cards=els.memory.querySelectorAll(".memory-card");cards.forEach((el,i)=>{const card=game.memory[i];const show=Boolean(card)&&["REMEMBER","SELECT","SEQUENCE_1","SEQUENCE_2","SEQUENCE_3","RE_SEQ","TURN"].includes(game.state);el.classList.toggle("is-unknown",!show);el.querySelector("strong").textContent=show?rankLabel(card.rank):"?";el.classList.toggle("is-red",show&&card.suit.c==="red");});}
  function renderDeck(){const ids=new Set(game.picks.map(c=>c.id));cardEls.forEach((el,index)=>{const card=game.deck[index];el.classList.toggle("is-special",ids.has(card.id)&&["SELECT","SEQUENCE_1","SEQUENCE_2","SEQUENCE_3","RE_SEQ","TURN"].includes(game.state));el.classList.remove("is-clickable","is-picked");});}
  function renderChoice(){const inChoice=["SEQUENCE_1","SEQUENCE_2","SEQUENCE_3"].includes(game.state);els.choicePanel.hidden=!inChoice;if(!inChoice)return;const number=game.state==="SEQUENCE_1"?1:game.state==="SEQUENCE_2"?2:3;const max=number===3?16:15;els.choiceTitle.textContent=`第${number}堆：选择插入位置`;els.choiceHint.textContent=`选择 1~${max}，表示用户牌放入第${number}堆的位置。`;els.picker.innerHTML="";for(let n=1;n<=max;n++){const b=document.createElement("button");b.type="button";b.className="number-chip";b.textContent=String(n);b.classList.toggle("is-selected",game.choice===n);b.addEventListener("click",()=>{game.choice=n;renderChoice();updateButtons();});els.picker.appendChild(b);}}
  function renderPileStatus(){els.pileStatus.querySelectorAll(".pile-item strong").forEach((node,i)=>{const choice=game.choices[i];node.textContent=choice===null?"等待":`插入 #${choice}`;node.parentElement.classList.toggle("is-done",choice!==null);});}
  function renderState(){const idx=STATES.indexOf(game.state);els.stateTrack.innerHTML=STATES.map((s,i)=>{const cls=["state-chip"];if(s===game.state)cls.push("is-active");else if(i<idx)cls.push("is-complete");return `<span class="${cls.join(" ")}">${s}</span>`;}).join("");els.stateIndex.textContent=`${String(idx+1).padStart(2,"0")} / ${String(STATES.length).padStart(2,"0")}`;els.currentState.textContent=game.state;els.currentDescription.textContent=META[game.state]?.d||"";const p=META[game.state]?.p||0;els.progressBar.style.width=`${p}%`;els.progressValue.textContent=`${p}%`;els.progressLabel.textContent=game.state.startsWith("SEQUENCE")?"等待选择":game.state==="TURN"?"揭示完成":"流程推进中";}
  function renderFooter(){els.deckMeta.textContent=`${Math.max(0,52-game.used.size)} 张未使用牌`;els.status.textContent=`${game.state} · ${busy?"运行中":"已就绪"}`;els.footerHint.textContent=game.state.startsWith("SEQUENCE")?"选择一个数字后点击确认插入":game.state==="TURN"?"最终三张牌与记忆牌牌面一致":"状态迁移由 SOL_FSM_Dispatch 驱动";}
  function updateButtons(){const startable=game.state==="IDLE",restartable=game.state==="TURN";els.primary.disabled=busy||(!startable&&!restartable);els.primary.textContent=busy?"运行中...":startable?"开始魔术":restartable?"再来一次":"进行中";els.choiceConfirm.disabled=busy||game.choice===null||!game.state.startsWith("SEQUENCE");els.reset.disabled=busy;}
  function renderFinale(){
    const targetSet=new Set(game.finalPositions);
    els.finalDeck.innerHTML=game.finalCards.map((card,index)=>`
      <div class="card final-deck-card ${targetSet.has(index)?"is-target":""}" data-index="${index}">
        <span class="final-index">${index}</span>
        <span class="card-inner">
          <span class="card-face"><span class="card-rank">${rankLabel(card.rank)}</span><span class="card-suit is-${card.suit.c}">${card.suit.s}</span></span>
          <span class="card-back"></span>
        </span>
      </div>`).join("");
    els.finaleCards.innerHTML=game.picks.map((card,i)=>`
      <div class="finale-card user-pick-card ${card.suit.c==="red"?"is-red":"is-black"}" data-pair="${i}">
        <span class="user-pick-index">你的牌 → #${game.finalPositions[i]}</span>
        <span class="finale-rank">${rankLabel(card.rank)}</span>
        <span class="finale-suit">${card.suit.s}</span>
      </div>`).join("");
    els.finaleMeta.innerHTML=`先确认你的三张正面牌：<strong>${game.picks.map(c=>rankLabel(c.rank)).join(" / ")}</strong><br>接下来逐张翻开 card_final 中对应的序号：<strong>${game.finalPositions.join(" / ")}</strong>`;
  }
  async function animateFinaleReveal(){
    const targets=[...els.finalDeck.querySelectorAll(".final-deck-card.is-target")];
    const userCards=[...els.finaleCards.querySelectorAll(".user-pick-card")];
    if(!targets.length) return;
    els.instruction.textContent="先看你的三张正面牌。确认后，再逐张翻开 card_final 对应序号。";
    await wait(1200);
    for(let i=0;i<targets.length;i++){
      const userCard=userCards[i];
      userCard?.classList.add("is-comparing");
      els.instruction.textContent=`第 ${i+1} 组：你的牌是 ${rankLabel(game.picks[i].rank)}，正在翻开 card_final[${game.finalPositions[i]}]。`;
      await wait(520);
      targets[i].classList.add("is-face","is-revealed");
      await animateElements([targets[i]],()=>[
        {transform:"translateY(0) scale(1)",filter:"brightness(1)"},
        {transform:"translateY(-12px) scale(1.18)",filter:"brightness(1.35)",offset:.5},
        {transform:"translateY(0) scale(1)",filter:"brightness(1)"}
      ],{duration:520,easing:"ease-in-out"});
      userCard?.classList.remove("is-comparing");
      userCard?.classList.add("is-matched");
      targets[i].classList.add("is-matched");
      await wait(620);
    }
    await wait(350);
    els.finaleMeta.innerHTML=`你的牌：<strong>${game.picks.map(c=>rankLabel(c.rank)).join(" / ")}</strong><br>card_final 对应序号 <strong>${game.finalPositions.join(" / ")}</strong> 已全部翻开，牌面逐组匹配。`;
    els.instruction.textContent="TURN：对比完成，三组牌面全部一致。";
  }  function renderAll(){if(!game)return;renderMemory();renderDeck();renderChoice();renderPileStatus();renderState();renderFooter();updateButtons();renderLog();}
  function showToast(message){clearTimeout(toastTimer);els.toast.textContent=message;els.toast.classList.add("is-visible");toastTimer=setTimeout(()=>els.toast.classList.remove("is-visible"),2200);}
  els.primary.addEventListener("click",()=>{if(game.state==="IDLE"||game.state==="TURN")startShow();});
  els.choiceConfirm.addEventListener("click",confirmChoice);
  els.reset.addEventListener("click",()=>{if(!busy){resetGame();showToast("牌局已重置。");}});
  els.clearLog.addEventListener("click",()=>{logs=[];renderLog();});
  document.addEventListener("keydown",e=>{if(e.key.toLowerCase()==="r"&&!busy)resetGame();});
  resetGame();
})();











