package com.musicdown.netease;

import java.util.LinkedHashMap;
import java.util.Map;

/** Pure parsing rules for the per-song quality directory, kept separate for JVM tests. */
final class QualityCatalog {
    static final String[] LEVELS = {"standard", "higher", "exhigh", "lossless", "hires", "jymaster", "jyeffect", "sky", "dolby", "vivid"};
    static final String[] NAMES = {"标准 128K", "较高 192K", "极高 320K", "无损", "Hi-Res", "超清母带", "高清臻音", "沉浸环绕声", "杜比全景声", "臻音全景声"};
    static final String[] MEMBERS = {"无需会员*", "无需会员*", "无需会员*", "VIP", "VIP", "SVIP", "VIP", "SVIP", "SVIP", "SVIP"};
    static final String[] FIELDS = {"l", "m", "h", "sq", "hr", "jm", "je", "sk", "db", "vi"};
    private QualityCatalog() {}

    static Map<String, String> parse(Map<String, ?> data) {
        boolean hasFields = false;
        Map<String, String> found = new LinkedHashMap<>();
        for (int i = 0; i < FIELDS.length; i++) {
            hasFields |= data.containsKey(FIELDS[i]);
            if (available(data.get(FIELDS[i]))) found.put(LEVELS[i], NAMES[i] + "（通常要求" + MEMBERS[i] + "）");
        }
        if (!hasFields) throw new IllegalArgumentException("网易云音质目录缺少音质字段");
        if (available(data.get("sks"))) found.put("sky", NAMES[7] + "（通常要求" + MEMBERS[7] + "）");
        return found;
    }

    private static boolean available(Object value) {
        if (value == null || Boolean.FALSE.equals(value)) return false;
        if (value instanceof Number) return ((Number)value).doubleValue() != 0;
        if (value instanceof String) return !((String)value).isEmpty() && !"0".equals(value);
        return true;
    }
}
