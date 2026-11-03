# Magic FSM 网页版

直接双击 `index.html` 即可运行，不需要安装依赖。

也可以启动本地服务器：

```powershell
cd D:\OpenCoLink\fsm_corr\web
python -m http.server 8877
```

然后打开：

```text
http://127.0.0.1:8877/
```

页面按当前 C 代码复现以下状态流程：

```text
IDLE
  --KEY_AUTO_SIG--> READ
  --KEY_AUTO_SIG--> SAME
  --KEY_AUTO_SIG--> ROTATE
  --KEY_NXT_SIG---> PICK
  --KEY_CLICK_SIG-> TURN_1
  --KEY_OK_SIG----> SEQU
  --KEY_NXT_SIG---> SELECT
  --KEY_NXT_SIG---> TURN_2
```
