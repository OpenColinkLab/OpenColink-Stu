package com.musicdown.netease;

/** Platform-independent acceptance rules shared by the downloader and JVM tests. */
final class DownloadRules {
    private DownloadRules() {}

    static boolean completeTransfer(long expectedBytes, long receivedBytes) {
        return expectedBytes <= 0 || expectedBytes == receivedBytes;
    }

    static boolean completeDuration(double expectedSeconds, double actualSeconds) {
        return expectedSeconds <= 0 || actualSeconds + 3 >= expectedSeconds * 0.9;
    }

    static boolean isTrial(boolean freeTrialInfo, boolean trialInfo, int trialType) {
        return freeTrialInfo || trialInfo || trialType != 0;
    }

    static boolean retryAllowed(boolean succeeded) { return !succeeded; }

    static String qualityFailure(String selected, String actual, String sourceLabel,
                                 boolean lossless, String codec) {
        if (selected.equals("auto") || selected.equals("alternate")) return "";
        if (!(sourceLabel.startsWith("网易云账号音源") || sourceLabel.startsWith("网易云官方音源")))
            return "指定音质只接受网易云原站音频，已拒绝备用音源";
        if (!selected.equals(actual)) return "所选音质与网易云实际返回档位不一致，未保存";
        if (selected.equals("dolby") && !("AC-3".equals(codec) || "E-AC-3".equals(codec)))
            return "实际文件不是杜比编码，未按所选音质保存";
        if ((selected.equals("lossless") || selected.equals("hires") || selected.equals("jymaster") || selected.equals("jyeffect")) && !lossless)
            return "网易云返回的文件编码不符合所选无损音质，未保存";
        if (codec == null || codec.isEmpty()) return "无法验证下载文件实际编码，未保存";
        return "";
    }
}
