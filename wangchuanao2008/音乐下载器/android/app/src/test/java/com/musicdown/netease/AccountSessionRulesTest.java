package com.musicdown.netease;

import static org.junit.Assert.assertEquals;
import org.junit.Test;

public class AccountSessionRulesTest {
    @Test public void requiresVerifiedIdentityAndCarriesOnlyValidatedSessionFields() throws Exception {
        Models.Account account = AccountSessionRules.verified("music-u", "csrf", "12345", "测试用户");
        assertEquals("12345", account.userId);
        assertEquals("测试用户", account.nickname);
        assertEquals("music-u", account.musicU);
        assertEquals("csrf", account.csrf);
    }

    @Test public void rejectsMissingLoginCookieOrProfile() {
        try { AccountSessionRules.verified("", "", "12345", ""); throw new AssertionError("missing MUSIC_U accepted"); }
        catch (Models.AppException expected) { }
        try { AccountSessionRules.verified("music-u", "", "", ""); throw new AssertionError("missing user id accepted"); }
        catch (Models.AppException expected) { }
    }
}
