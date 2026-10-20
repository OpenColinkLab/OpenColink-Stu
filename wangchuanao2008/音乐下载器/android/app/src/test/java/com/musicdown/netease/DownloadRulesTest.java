package com.musicdown.netease;

import static org.junit.Assert.assertEquals;
import static org.junit.Assert.assertFalse;
import static org.junit.Assert.assertTrue;
import org.junit.Test;

public class DownloadRulesTest {
    @Test public void acceptsSpatialOnlyWhenTheActualFormatMatches() {
        assertEquals("", DownloadRules.qualityFailure("vivid", "vivid", "网易云账号音源", false, "AVS3 Audio Vivid (av3a)"));
        assertEquals("", DownloadRules.qualityFailure("dolby", "dolby", "网易云账号音源", false, "E-AC-3"));
        assertTrue(DownloadRules.qualityFailure("dolby", "dolby", "网易云账号音源", false, "AAC").contains("不是杜比"));
    }
    @Test public void rejectsDowngradesAndThirdPartyForAnExplicitQuality() {
        assertTrue(DownloadRules.qualityFailure("hires", "lossless", "网易云账号音源", true, "FLAC").contains("不一致"));
        assertTrue(DownloadRules.qualityFailure("lossless", "lossless", "备用音源", true, "FLAC").contains("拒绝备用音源"));
        assertEquals("", DownloadRules.qualityFailure("lossless", "lossless", "网易云账号音源", true, "FLAC"));
    }

    @Test public void rejectsTrialAndTruncatedOrShortTransfer() {
        assertTrue(DownloadRules.isTrial(true, false, 0));
        assertTrue(DownloadRules.isTrial(false, false, 1));
        assertFalse(DownloadRules.isTrial(false, false, 0));
        assertFalse(DownloadRules.completeTransfer(1000, 990));
        assertTrue(DownloadRules.completeTransfer(1000, 1000));
        assertFalse(DownloadRules.completeDuration(300, 150));
        assertTrue(DownloadRules.completeDuration(300, 280));
    }

    @Test public void onlyAutomaticModeMayAcceptItsResolvedQuality() {
        assertEquals("", DownloadRules.qualityFailure("auto", "standard", "公开音源", false, "MP3"));
    }

    @Test public void cancelledTasksRemainRetryable() {
        assertTrue(DownloadRules.retryAllowed(false));
        assertFalse(DownloadRules.retryAllowed(true));
    }
}
