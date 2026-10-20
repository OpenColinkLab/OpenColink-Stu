export type Status =
  | "pending"
  | "queued"
  | "parsing"
  | "ready"
  | "downloading"
  | "merging"
  | "verifying"
  | "completed"
  | "failed"
  | "cancelled";
export interface Task {
  id: string;
  url: string;
  title: string;
  source: string;
  status: Status;
  createdAt: string;
  directory: string;
  thumbnail?: string;
  duration?: number;
  expectedDuration?: number;
  actualDuration?: number;
  attempt?: number;
  heights: number[];
  quality?: number;
  actualQuality?: string;
  progress?: number;
  speed?: number;
  eta?: number;
  downloaded?: number;
  total?: number;
  file?: string;
  error?: string;
  logs: string[];
  expectedAudio?: boolean;
  inspectOnly?: boolean;
  parsedAt?: number;
}
export interface Settings {
  directory: string;
  theme: "light" | "dark" | "system";
}
export interface AuthStatus {
  state: "logged-out" | "logged-in" | "checking" | "error";
  name?: string;
  message: string;
  remembered: boolean;
}
export interface Snapshot {
  auth: AuthStatus;
  youkuAuth: AuthStatus;
  tasks: Task[];
  settings: Settings;
  dependencies: { ok: boolean; message: string };
}
export interface API {
  snapshot(): Promise<Snapshot>;
  login(): Promise<void>;
  logout(): Promise<void>;
  refreshAuth(): Promise<void>;
  youkuLogin(): Promise<void>;
  youkuLogout(): Promise<void>;
  youkuRefreshAuth(): Promise<void>;
  add(url: string, inspect: boolean): Promise<string>;
  start(id: string, quality?: number): Promise<void>;
  cancel(id: string): Promise<void>;
  retry(id: string): Promise<void>;
  remove(id: string): Promise<void>;
  chooseDirectory(): Promise<string | null>;
  theme(theme: Settings["theme"]): Promise<void>;
  open(id: string, folder: boolean): Promise<void>;
  folder(): Promise<void>;
  paste(): Promise<string>;
  onUpdate(fn: (s: Snapshot) => void): () => void;
}
