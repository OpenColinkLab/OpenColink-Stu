package com.musicdown.netease;

/** Validates the minimum account fields before any session can be stored. */
final class AccountSessionRules {
    private AccountSessionRules() {}
    static Models.Account verified(String musicU, String csrf, String userId, String nickname) throws Models.AppException {
        if (musicU == null || musicU.isEmpty()) throw new Models.AppException("网易云网页未返回有效登录会话");
        if (userId == null || userId.isEmpty()) throw new Models.AppException("登录状态无效或已过期，请重新登录官网");
        return new Models.Account(userId, nickname == null ? "" : nickname, musicU, csrf == null ? "" : csrf);
    }
}
