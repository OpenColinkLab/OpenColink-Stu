import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUpRight,
  Check,
  ChevronDown,
  Clipboard,
  Clock3,
  Folder,
  FolderOpen,
  History,
  Link2,
  LoaderCircle,
  Monitor,
  Moon,
  Play,
  Plus,
  RotateCcw,
  Sun,
  Trash2,
  Video,
  X,
  Info,
  CheckCheck,
} from "lucide-react";
import type { API, Snapshot, Task, Status } from "../electron/types";
import "./style.css";
declare global {
  interface Window {
    downloader: API;
  }
}
const api = window.downloader;
const active: Status[] = [
  "pending",
  "queued",
  "parsing",
  "downloading",
  "merging",
  "verifying",
  "ready",
];
const labels: Record<Status, string> = {
  pending: "等待解析",
  queued: "等待下载",
  parsing: "正在解析",
  ready: "选择清晰度",
  downloading: "正在下载",
  merging: "正在处理音视频",
  verifying: "正在校验文件",
  completed: "下载完成",
  failed: "下载失败",
  cancelled: "已取消",
};
const bytes = (n?: number) =>
  n === undefined
    ? ""
    : n >= 1073741824
      ? (n / 1073741824).toFixed(2) + " GB"
      : n >= 1048576
        ? (n / 1048576).toFixed(1) + " MB"
        : (n / 1024).toFixed(0) + " KB";
const duration = (s?: number) =>
  s === undefined
    ? ""
    : `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
function App() {
  const [data, setData] = useState<Snapshot>();
  const [url, setUrl] = useState("");
  const [advanced, setAdvanced] = useState(false);
  const [view, setView] = useState<"all" | "active" | "history">("all");
  const [toast, setToast] = useState("");
  const [help, setHelp] = useState(false);
  const [busy, setBusy] = useState(false);
  const [accountPlatform, setAccountPlatform] = useState<"bilibili" | "youku">(
    "bilibili",
  );
  useEffect(() => {
    api.snapshot().then(setData);
    return api.onUpdate(setData);
  }, []);
  useEffect(() => {
    if (!data) return;
    const media = matchMedia("(prefers-color-scheme: dark)");
    const apply = () =>
      (document.documentElement.dataset.theme =
        data.settings.theme === "system"
          ? media.matches
            ? "dark"
            : "light"
          : data.settings.theme);
    apply();
    media.addEventListener("change", apply);
    return () => media.removeEventListener("change", apply);
  }, [data?.settings.theme]);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 6500);
    return () => clearTimeout(t);
  }, [toast]);
  const act = async (fn: () => Promise<unknown>) => {
    try {
      await fn();
    } catch (e) {
      setToast(
        String(e).replace(
          /^Error: (Error invoking remote method '[^']+': Error: )?/,
          "",
        ),
      );
    }
  };
  const add = async (inspect = false) => {
    if (!url.trim()) return;
    setBusy(true);
    try {
      await api.add(url, inspect);
      setUrl("");
      setView("all");
    } catch (e) {
      setToast(
        String(e).replace(
          /^Error: (Error invoking remote method '[^']+': Error: )?/,
          "",
        ),
      );
    } finally {
      setBusy(false);
    }
  };
  if (!data)
    return (
      <div className="loading">
        <LoaderCircle className="spin" /> 正在打开视频下载器…
      </div>
    );
  const running = data.tasks.filter((t) => active.includes(t.status)).length;
  const done = data.tasks.filter((t) => t.status === "completed").length;
  const tasks = data.tasks.filter((t) =>
    view === "active"
      ? active.includes(t.status)
      : view === "history"
        ? !active.includes(t.status)
        : true,
  );
  const account =
    accountPlatform === "youku" ? data.youkuAuth : data.auth;
  const accountName = accountPlatform === "youku" ? "优酷" : "B 站";
  return (
    <>
      <div className="titlebar">
        <span>视频下载器</span>
        <div className="local-dot">本地保存 · 自由掌控</div>
      </div>
      <div className="layout">
        <aside>
          <div className="brand">
            <div className="brand-icon">
              <ArrowDownToLine size={22} />
            </div>
            <div>
              视频下载器<small>把喜欢的，留在本地。</small>
            </div>
          </div>
          <div className="nav-label">工作空间</div>
          <nav>
            <button
              className={view === "all" ? "selected" : ""}
              onClick={() => setView("all")}
            >
              <ArrowDownToLine size={18} />
              所有任务<span>{data.tasks.length}</span>
            </button>
            <button
              className={view === "active" ? "selected" : ""}
              onClick={() => setView("active")}
            >
              <Clock3 size={18} />
              进行中{running > 0 && <span>{running}</span>}
            </button>
            <button
              className={view === "history" ? "selected" : ""}
              onClick={() => setView("history")}
            >
              <History size={18} />
              下载记录
            </button>
          </nav>
          <div className="sidebar-bottom">
            <div className="private-card auth-card">
              <div className="account-tabs" aria-label="平台账号">
                <button
                  className={accountPlatform === "bilibili" ? "selected" : ""}
                  aria-pressed={accountPlatform === "bilibili"}
                  onClick={() => setAccountPlatform("bilibili")}
                >
                  B 站
                </button>
                <button
                  className={accountPlatform === "youku" ? "selected" : ""}
                  aria-pressed={accountPlatform === "youku"}
                  onClick={() => setAccountPlatform("youku")}
                >
                  优酷
                </button>
              </div>
              <strong className="account-name">
                {account?.state === "logged-in"
                  ? account.name
                  : account?.state === "checking"
                    ? "正在验证登录…"
                    : "未登录"}
              </strong>
              <p role="status">
                {account?.message || `登录有观看权限的${accountName}账号`}
              </p>
              <div className="auth-actions">
                <button
                  className="secondary"
                  onClick={() =>
                    act(() =>
                      accountPlatform === "youku" ? api.youkuLogin() : api.login(),
                    )
                  }
                >
                  {account?.state === "logged-in"
                    ? "切换账号"
                    : `登录 ${accountName}`}
                </button>
                <button
                  aria-label={`刷新${accountName}登录状态`}
                  title={`刷新${accountName}登录状态`}
                  onClick={() =>
                    act(() =>
                      accountPlatform === "youku"
                        ? api.youkuRefreshAuth()
                        : api.refreshAuth(),
                    )
                  }
                >
                  <RotateCcw size={13} />
                </button>
                {(account?.state === "logged-in" || account?.remembered) && (
                  <button
                    onClick={() =>
                      act(() =>
                        accountPlatform === "youku"
                          ? api.youkuLogout()
                          : api.logout(),
                      )
                    }
                  >
                    退出
                  </button>
                )}
              </div>
            </div>
            <button className="help-button" onClick={() => setHelp(true)}>
              <Info size={16} />
              使用说明与支持范围
              <ArrowUpRight size={14} />
            </button>
            <div className="theme-switch" aria-label="外观">
              <button
                title="浅色模式"
                aria-label="浅色模式"
                className={data.settings.theme === "light" ? "on" : ""}
                onClick={() => act(() => api.theme("light"))}
              >
                <Sun size={16} />
              </button>
              <button
                title="跟随系统"
                aria-label="跟随系统"
                className={data.settings.theme === "system" ? "on" : ""}
                onClick={() => act(() => api.theme("system"))}
              >
                <Monitor size={16} />
              </button>
              <button
                title="深色模式"
                aria-label="深色模式"
                className={data.settings.theme === "dark" ? "on" : ""}
                onClick={() => act(() => api.theme("dark"))}
              >
                <Moon size={16} />
              </button>
              <span>外观</span>
            </div>
          </div>
        </aside>
        <main>
          <header>
            <div className="eyebrow">
              <span /> 简单下载，安心收藏
            </div>
            <h1>
              好视频，随时留存<span>。</span>
            </h1>
            <p>粘贴链接，剩下的交给我们。</p>
          </header>
          <section className="composer">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void add();
              }}
            >
              <label htmlFor="video-url">
                视频链接<span>支持视频网页与视频直链</span>
              </label>
              <div className="input-row">
                <div className="url-input">
                  <Link2 size={19} />
                  <input
                    id="video-url"
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="在这里粘贴视频链接…"
                    autoFocus
                    autoComplete="off"
                    spellCheck={false}
                  />
                  <button
                    type="button"
                    title="从剪贴板粘贴"
                    aria-label="从剪贴板粘贴"
                    onClick={() =>
                      act(async () => {
                        setUrl(await api.paste());
                        document.getElementById("video-url")?.focus();
                      })
                    }
                  >
                    <Clipboard size={17} />
                  </button>
                </div>
                <button
                  className="primary download"
                  disabled={!url.trim() || busy || !data.dependencies.ok}
                  type="submit"
                >
                  <ArrowDown size={18} />
                  下载视频
                </button>
              </div>
            </form>
            <div className="composer-bottom">
              <button
                className="directory"
                onClick={() => act(() => api.chooseDirectory())}
                title={data.settings.directory}
              >
                <Folder size={16} />
                <span>保存至</span>
                <b>{data.settings.directory.replace(/^\/Users\/[^/]+/, "~")}</b>
                <ChevronDown size={13} />
              </button>
              <button
                className={"advanced-toggle " + (advanced ? "expanded" : "")}
                onClick={() => setAdvanced(!advanced)}
              >
                高级选项
                <ChevronDown size={14} />
              </button>
            </div>
            {advanced && (
              <div className="advanced">
                <div>
                  <b>画质偏好</b>
                  <p>
                    默认下载最佳可用画质。也可以先解析，再选择来源提供的清晰度。
                  </p>
                </div>
                <button
                  className="secondary"
                  disabled={!url.trim() || busy}
                  onClick={() => add(true)}
                >
                  解析清晰度
                </button>
              </div>
            )}
          </section>
          <div className="assurance">
            <Check size={13} /> 自动选择最佳画质<span>·</span>音视频自动合并
            <span>·</span>同名文件不会覆盖
          </div>
          {!data.dependencies.ok && (
            <div className="error-banner">{data.dependencies.message}</div>
          )}
          <section className="tasks">
            <div className="section-heading">
              <h2>
                {view === "history"
                  ? "下载记录"
                  : view === "active"
                    ? "进行中的任务"
                    : "下载任务"}
                <span>{tasks.length}</span>
              </h2>
              <span className="summary">
                {running > 0 ? `${running} 项待完成` : `${done} 项已完成`}
              </span>
            </div>
            {tasks.length === 0 ? (
              <div className="empty">
                <div className="empty-art">
                  <div className="sheet sheet-back" />
                  <div className="sheet">
                    <Video size={27} />
                    <div />
                    <div />
                  </div>
                  <div className="down-badge">
                    <ArrowDown size={21} />
                  </div>
                </div>
                <h3>
                  {view === "history"
                    ? "每一份收藏，都有迹可循"
                    : view === "active"
                      ? "一切就绪，轻松开始"
                      : "你的下一份收藏，从这里开始"}
                </h3>
                <p>
                  {view === "history"
                    ? "已完成、失败和取消的任务会保存在这里。"
                    : view === "active"
                      ? "当前没有进行中的下载任务。"
                      : "复制视频链接，粘贴到上方，即可保存到电脑。"}
                </p>
                <div className="empty-steps">
                  <span>
                    <i>1</i>复制链接
                  </span>
                  <div />
                  <span>
                    <i>2</i>粘贴网址
                  </span>
                  <div />
                  <span>
                    <i>3</i>下载收藏
                  </span>
                </div>
              </div>
            ) : (
              <div className="task-list">
                {tasks.map((t) => (
                  <TaskCard key={t.id} task={t} act={act} />
                ))}
              </div>
            )}
          </section>
          <footer>
            <span>
              <span
                className={"status-dot " + (!data.dependencies.ok ? "bad" : "")}
              />
              {data.dependencies.message}
            </span>
            <button onClick={() => act(() => api.folder())}>
              打开保存文件夹
              <ArrowUpRight size={13} />
            </button>
          </footer>
        </main>
      </div>
      {toast && (
        <div className="toast" role="alert">
          <Info size={18} />
          <span>{toast}</span>
          <button aria-label="关闭提示" onClick={() => setToast("")}>
            <X size={16} />
          </button>
        </div>
      )}
      {help && (
        <div className="modal-backdrop" onClick={() => setHelp(false)}>
          <section
            className="modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="help-title"
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              if (e.key === "Escape") setHelp(false);
            }}
          >
            <button
              className="close-modal"
              aria-label="关闭说明"
              autoFocus
              onClick={() => setHelp(false)}
            >
              <X size={20} />
            </button>
            <div className="brand-icon">
              <ArrowDownToLine size={22} />
            </div>
            <h2 id="help-title">下载，从简单开始。</h2>
            <p>
              粘贴完整的 HTTP / HTTPS 网址，按 Enter
              或点击“下载视频”。多个任务会依次下载。
            </p>
            <h3>画质与文件格式</h3>
            <p>
              默认保留来源最佳画质，不放大、不转码。分离的音视频会合并为
              MKV，单文件保留原格式；部分格式需要兼容的播放器。高级选项可先解析实际可用清晰度。
            </p>
            <h3>支持范围</h3>
            <p>
              使用内置 yt-dlp 解析公开可访问的单个视频页面、MP4 直链和常见 HLS /
              DASH 流。网站支持会随其规则变化；不保证任意网站可用。支持 B
              站官方页面登录，使用账号已有的观看权限。不绕过充电权益或访问控制，不支持
              DRM、直播或整份播放列表下载。优酷账号登录后可尝试账号有权访问的内容；
              VIP 视频是否可下载取决于优酷实际返回的媒体流和下载引擎支持情况。
            </p>
            <h3>优酷账号与 VIP 视频</h3>
            <p>
              点击左侧账号卡片的“优酷”再点击“登录 优酷”，在官方页面自行登录。
              官网个人中心确认登录后才会在本机加密保存，解析优酷视频时自动使用。
              登录状态不等于 VIP 下载能力：如优酷拒绝授权、仅提供试看或使用受保护媒体流，
              任务会显示失败和具体原因。会员资格请在优酷官网确认。
            </p>
            <h3>B 站登录与完整性</h3>
            <p>
              在左侧点击“登录 B
              站”，自行在官方窗口扫码。成功后自动返回；普通登录不代表拥有充电权益。登录状态在本机加密保存，任务日志不包含凭据。退出会取消
              B
              站任务并清除本机授权。下载文件明显短于原视频时会显示失败，不会把试看当成完整版。
            </p>
            <h3>保存与重试</h3>
            <p>
              点击保存路径选择文件夹，新任务使用新位置。取消后临时文件会保留；重试会重新解析并保存为新文件，避免复用试看文件。删除记录不会删除视频或临时文件。退出时未完成的任务可在下次打开后重试。
            </p>
            <p className="muted">
              请仅下载你拥有权利或获得许可的内容。应用不上传下载记录。版本 1.3.0
            </p>
          </section>
        </div>
      )}
    </>
  );
}
function TaskCard({
  task: t,
  act,
}: {
  task: Task;
  act: (fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [q, setQ] = useState("");
  const [broken, setBroken] = useState(false);
  const isActive = active.includes(t.status);
  return (
    <article className={"task-card state-" + t.status}>
      <div className="task-main">
        <div className="thumbnail">
          {t.thumbnail && !broken ? (
            <img
              src={t.thumbnail}
              alt="视频封面"
              onError={() => setBroken(true)}
            />
          ) : (
            <Video size={27} />
          )}
          <span>{duration(t.duration) || "视频"}</span>
        </div>
        <div className="task-content">
          <div className="task-top">
            <h3 title={t.title}>{t.title}</h3>
            <span className={"status status-" + t.status}>
              {t.status === "completed" ? (
                <CheckCheck size={13} />
              ) : ["parsing", "merging", "verifying"].includes(t.status) ? (
                <LoaderCircle size={13} className="spin" />
              ) : null}
              {labels[t.status]}
            </span>
          </div>
          <div className="metadata">
            <span>{t.source}</span>
            <i>·</i>
            <span>
              {t.actualQuality ||
                (t.quality ? `${t.quality}p` : "最佳可用画质")}
            </span>
            {t.total && (
              <>
                <i>·</i>
                <span>{bytes(t.total)}</span>
              </>
            )}
            <span className="task-date">
              {new Date(t.createdAt).toLocaleDateString("zh-CN", {
                month: "2-digit",
                day: "2-digit",
              })}
            </span>
          </div>
          {["downloading", "merging", "verifying", "parsing"].includes(
            t.status,
          ) && (
            <>
              <div
                className={
                  "progress " +
                  (t.progress === undefined || t.status !== "downloading"
                    ? "indeterminate"
                    : "")
                }
              >
                <div style={{ width: `${t.progress ?? 35}%` }} />
              </div>
              <div className="progress-info">
                <span>
                  {t.status === "downloading"
                    ? `${bytes(t.downloaded) || "正在连接下载源"}${t.speed ? " · " + bytes(t.speed) + "/s" : ""}`
                    : t.status === "parsing"
                      ? "正在读取标题和可用画质…"
                      : t.status === "verifying"
                        ? "正在检查画面与音轨…"
                        : "正在整理视频与音频…"}
                </span>
                <span>
                  {t.status === "downloading" && t.progress !== undefined
                    ? `${t.progress.toFixed(1)}%`
                    : ""}
                  {t.status === "downloading" && t.eta !== undefined
                    ? ` · 剩余 ${t.eta < 60 ? Math.ceil(t.eta) + " 秒" : Math.ceil(t.eta / 60) + " 分钟"}`
                    : ""}
                </span>
              </div>
            </>
          )}
          {t.status === "pending" && (
            <p className="task-hint">
              正在等待读取视频信息，最多同时解析两个任务
            </p>
          )}
          {t.status === "queued" && (
            <p className="task-hint">已加入队列，前面的任务完成后自动开始</p>
          )}
          {t.status === "cancelled" && (
            <p className="task-hint">任务已停止，可随时重试</p>
          )}
          {t.status === "failed" && <p className="task-error">{t.error}</p>}
          {t.status === "completed" && (
            <p className="file-path" title={t.file}>
              <Check size={12} />
              已保存到 {t.directory.split(/[\\/]/).pop()}
            </p>
          )}
          {t.status === "completed" &&
            t.source === "BiliBili" &&
            !t.expectedDuration && (
              <p className="task-hint">
                旧版记录未校验完整时长，登录后可重新下载。
              </p>
            )}
          {t.status === "ready" && (
            <div className="quality-row">
              <select
                aria-label="选择清晰度"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              >
                <option value="">最佳可用画质</option>
                {t.heights.map((h) => (
                  <option value={h} key={h}>
                    {h}p
                  </option>
                ))}
              </select>
              <button
                className="primary small"
                onClick={() =>
                  act(() => api.start(t.id, q ? Number(q) : undefined))
                }
              >
                <ArrowDown size={14} />
                开始下载
              </button>
            </div>
          )}
        </div>
        <div className="task-actions">
          {isActive ? (
            <button
              className="icon-button"
              title="取消任务"
              aria-label="取消任务"
              onClick={() => act(() => api.cancel(t.id))}
            >
              <X size={17} />
            </button>
          ) : t.status === "completed" ? (
            <>
              {t.source === "BiliBili" && (
                <button
                  className="icon-button"
                  title="重新下载"
                  aria-label="重新下载"
                  onClick={() => act(() => api.add(t.url, false))}
                >
                  <RotateCcw size={16} />
                </button>
              )}
              <button
                className="icon-button"
                title="打开文件"
                aria-label="打开文件"
                onClick={() => act(() => api.open(t.id, false))}
              >
                <Play size={16} />
              </button>
              <button
                className="icon-button"
                title="打开所在文件夹"
                aria-label="打开所在文件夹"
                onClick={() => act(() => api.open(t.id, true))}
              >
                <FolderOpen size={17} />
              </button>
            </>
          ) : (
            <button
              className="retry"
              onClick={() => act(() => api.retry(t.id))}
            >
              <RotateCcw size={14} />
              重试
            </button>
          )}
          {!isActive && (
            <button
              className="icon-button delete"
              title="删除记录（保留文件）"
              aria-label="删除记录"
              onClick={() => act(() => api.remove(t.id))}
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      </div>
      {t.logs.length > 0 &&
        (t.status === "failed" || t.status === "cancelled") && (
          <details className="logs">
            <summary>技术日志</summary>
            <pre>{t.logs.join("\n")}</pre>
          </details>
        )}
    </article>
  );
}
createRoot(document.getElementById("root")!).render(<App />);
