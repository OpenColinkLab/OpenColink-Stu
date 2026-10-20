import fs from "node:fs";
import path from "node:path";
export function isBilibiliURL(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      (u.hostname === "bilibili.com" || u.hostname.endsWith(".bilibili.com"))
    );
  } catch {
    return false;
  }
}
export function isYoukuURL(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      ["youku.com", "tudou.com"].some(
        (domain) => u.hostname === domain || u.hostname.endsWith("." + domain),
      )
    );
  } catch {
    return false;
  }
}
export function isYoukuLoginURL(value: string) {
  try {
    const u = new URL(value);
    return (
      u.protocol === "https:" &&
      ["youku.com", "taobao.com", "alibaba.com", "alipay.com"].some(
        (domain) => u.hostname === domain || u.hostname.endsWith("." + domain),
      )
    );
  } catch {
    return false;
  }
}
export interface ExportCookie {
  domain: string;
  path: string;
  secure: boolean;
  httpOnly?: boolean;
  expirationDate?: number;
  name: string;
  value: string;
}
export function netscapeCookies(
  cookies: ExportCookie[],
  domain = "bilibili.com",
) {
  return (
    "# Netscape HTTP Cookie File\n" +
    cookies
      .filter((c) => {
        const d = c.domain.replace(/^\./, "");
        return (
          (d === domain || d.endsWith("." + domain)) &&
          (!c.expirationDate || c.expirationDate > Date.now() / 1000) &&
          ![c.domain, c.path, c.name, c.value].some((s) => /[\t\r\n]/.test(s))
        );
      })
      .map((c) =>
        [
          (c.httpOnly ? "#HttpOnly_" : "") + c.domain,
          c.domain.startsWith(".") ? "TRUE" : "FALSE",
          c.path || "/",
          c.secure ? "TRUE" : "FALSE",
          Math.floor(c.expirationDate || 0),
          c.name,
          c.value,
        ].join("\t"),
      )
      .join("\n") +
    "\n"
  );
}
export async function cookieLease(
  root: string,
  cookies: ExportCookie[],
  domain = "bilibili.com",
) {
  await fs.promises.mkdir(root, { recursive: true, mode: 0o700 });
  const dir = await fs.promises.mkdtemp(path.join(root, "lease-"));
  await fs.promises.chmod(dir, 0o700);
  const file = path.join(dir, "cookies.txt");
  await fs.promises.writeFile(file, netscapeCookies(cookies, domain), {
    mode: 0o600,
    flag: "wx",
  });
  return {
    args: ["--cookies", file],
    cleanup: async () => {
      await fs.promises.rm(dir, { recursive: true, force: true });
    },
  };
}
export function durationProblem(expected?: number, actual?: number) {
  if (!expected || expected <= 0 || !actual || actual <= 0) return false;
  return actual < expected - Math.max(5, expected * 0.01);
}
export function extractPageState(html: string): any {
  const m = /window\.__INITIAL_STATE__\s*=\s*/.exec(html);
  if (!m) return;
  const start = m.index + m[0].length;
  let depth = 0,
    quote = false,
    escape = false;
  for (let i = start; i < html.length; i++) {
    const c = html[i];
    if (quote) {
      if (escape) escape = false;
      else if (c === "\\") escape = true;
      else if (c === '"') quote = false;
    } else if (c === '"') quote = true;
    else if (c === "{") depth++;
    else if (c === "}" && --depth === 0) {
      try {
        return JSON.parse(html.slice(start, i + 1));
      } catch {
        return;
      }
    }
  }
}
export function previewReason(
  state: any,
  loggedIn: boolean,
): string | undefined {
  const v = state?.videoData;
  if (v?.is_upower_exclusive && v?.is_upower_play === false)
    return loggedIn
      ? "此账号尚未获得该充电专属视频的完整观看权限。请在 B 站确认对应充电权益，当前仅能取得试看内容。"
      : "此视频为充电专属内容。请先登录拥有对应观看权益的 B 站账号，当前未登录请求仅能取得试看内容。";
}
export function redactLog(line: string) {
  return line
    .replace(/((?:Set-)?Cookie\s*:\s*)[^\r\n]+/gi, "$1[已隐藏]")
    .replace(
      /(SESSDATA|bili_jct|P_sck|P_gck|P_pck_rm|disrd|csrfToken|ctoken|SESSIONID|isg|cna|__ysuid|_m_h5_tk(?:_enc)?|Cookie|Authorization)(\s*[:=]\s*)[^\s;]+/gi,
      "$1$2[已隐藏]",
    )
    .replace(/https?:\/\/[^\s"<>]+/g, (url) => {
      try {
        const u = new URL(url);
        return u.origin + u.pathname + (u.search ? "?[参数已隐藏]" : "");
      } catch {
        return "[链接已隐藏]";
      }
    });
}
