package com.fidechat.database.models;

public class UserChannel extends BaseModel<UserChannel> {
    private String userId;
    private String channelId;

    public UserChannel() {
        super();
    }

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

}
