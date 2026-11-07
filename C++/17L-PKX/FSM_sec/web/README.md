# Magic FSM 三堆牌网页版

直接双击 `index.html`，或启动本地服务器：

```powershell
cd D:\OpenCoLink\FSM_play\web
python -m http.server 8878
```

访问：

```text
http://127.0.0.1:8878/
```

## 状态流程

```text
IDLE
  --KEY_AUTO_SIG--> REMEMBER
  --KEY_AUTO_SIG--> SELECT
  --KEY_NXT_SIG---> SEQUENCE_1
  --KEY_NXT_SIG---> SEQUENCE_2
  --KEY_NXT_SIG---> SEQUENCE_3
  --KEY_NXT_SIG---> RE_SEQ
  --KEY_NXT_SIG---> TURN
```

- 顶部三张牌被记录为记忆牌。
- 三堆分别选择 1~15、1~15、1~16 的插入位置。
- RE_SEQ 将每堆围绕插入位置重新排列。
- TURN 展示三张插入牌，它们与记忆牌牌面一致。

## 最终揭示

`TURN` 阶段会展示完整的 `card_final` 牌堆（49 张），所有牌先保持背面。
三个目标序号会以金色边框高亮，然后按顺序执行 3D 翻牌动画。
翻开的牌面应与顶部三张记忆牌牌面一致。
