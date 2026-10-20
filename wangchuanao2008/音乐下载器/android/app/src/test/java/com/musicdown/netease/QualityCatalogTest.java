package com.musicdown.netease;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;
import java.util.HashMap;
import java.util.Map;

public class QualityCatalogTest {
    @Test public void parsesAvailableLevelsInStableOrderAndMembershipLabels() {
        Map<String, Object> data = new HashMap<>(); data.put("l", 1); data.put("sq", 1); data.put("jm", 0);
        Map<String, String> catalog = QualityCatalog.parse(data);
        assertEquals("标准 128K（通常要求无需会员*）", catalog.get("standard"));
        assertEquals("无损（通常要求VIP）", catalog.get("lossless"));
        assertFalse(catalog.containsKey("jymaster"));
        assertEquals("standard", catalog.keySet().iterator().next());
    }

    @Test public void recognizesSkyVariantAndRejectsMissingCatalogFields() {
        Map<String, Object> data = new HashMap<>(); data.put("sk", 0); data.put("sks", true);
        assertTrue(QualityCatalog.parse(data).containsKey("sky"));
        try { QualityCatalog.parse(new HashMap<>()); throw new AssertionError("missing fields accepted"); }
        catch (IllegalArgumentException expected) { assertTrue(expected.getMessage().contains("缺少音质字段")); }
    }
}
