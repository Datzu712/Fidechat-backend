package com.fidechat.database.models;

import java.sql.Timestamp;

public class UserChannel {
    private String userId;
    private String channelId;
    private Timestamp createdAt;

    public UserChannel() {}

    public UserChannel(String userId, String channelId) {
        this.userId = userId;
        this.channelId = channelId;
    }

    public String getUserId() {
        return userId;
    }

    public String getChannelId() {
        return channelId;
    }

    public UserChannel setChannelId(String channelId) {
        this.channelId = channelId;
        return this;
    }

    public UserChannel setUserId(String userId) {
        this.userId = userId;
        return this;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public UserChannel setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
        return this;
    }

}
