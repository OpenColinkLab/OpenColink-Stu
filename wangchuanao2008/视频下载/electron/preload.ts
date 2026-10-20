import { contextBridge, ipcRenderer } from "electron";
contextBridge.exposeInMainWorld("downloader", {
  snapshot: () => ipcRenderer.invoke("snapshot"),
  login: () => ipcRenderer.invoke("login"),
  logout: () => ipcRenderer.invoke("logout"),
  refreshAuth: () => ipcRenderer.invoke("refreshAuth"),
  youkuLogin: () => ipcRenderer.invoke("youkuLogin"),
  youkuLogout: () => ipcRenderer.invoke("youkuLogout"),
  youkuRefreshAuth: () => ipcRenderer.invoke("youkuRefreshAuth"),
  add: (url: string, inspect: boolean) =>
    ipcRenderer.invoke("add", url, inspect),
  start: (id: string, q?: number) => ipcRenderer.invoke("start", id, q),
  cancel: (id: string) => ipcRenderer.invoke("cancel", id),
  retry: (id: string) => ipcRenderer.invoke("retry", id),
  remove: (id: string) => ipcRenderer.invoke("remove", id),
  chooseDirectory: () => ipcRenderer.invoke("chooseDirectory"),
  theme: (t: string) => ipcRenderer.invoke("theme", t),
  open: (id: string, folder: boolean) => ipcRenderer.invoke("open", id, folder),
  folder: () => ipcRenderer.invoke("folder"),
  paste: () => ipcRenderer.invoke("paste"),
  onUpdate: (fn: Function) => {
    const handler = (_: unknown, s: unknown) => fn(s);
    ipcRenderer.on("update", handler);
    return () => ipcRenderer.removeListener("update", handler);
  },
});
