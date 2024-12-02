package com.fidechat.utils;

import com.fidechat.database.models.UserModel;

public class RequestContext {
    private static final ThreadLocal<UserModel> userContext = new ThreadLocal<UserModel>();

    private RequestContext() {}

    public static void setCurrentUser(UserModel data) {
        userContext.set(data);
    }

    public static UserModel getCurrentUser() {
        return userContext.get();
    }

    public static void removeCurrentUser() {
        userContext.remove();
    }
}
