package com.fidechat.database.models;

import java.sql.Timestamp;

public class Message {
    private String id;
    private String authorId;
    private String content;
    private String channelId;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    public Message() {}

    public Message(String authorId, String content, String channelId) {
        this.authorId = authorId;
        this.content = content;
        this.channelId = channelId;
    }

    public String getAuthorId() {
        return authorId;
    }

    public Message setAuthorId(String authorId) {
        this.authorId = authorId;
        return this;
    }

    public String getContent() {
        return content;
    }

    public Message setContent(String content) {
        this.content = content;
        return this;
    }

    public String getChannelId() {
        return channelId;
    }

    public Message setChannelId(String channelId) {
        this.channelId = channelId;
        return this;
    }

    public String getId() {
        return id;
    }

    public Message setId(String id) {
        this.id = id;
        return this;
    }

    public Timestamp getCreatedAt() {
        return this.createdAt;
    }

    public Message setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public Timestamp getUpdatedAt() {
        return this.updatedAt;
    }

    public Message setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public String toJSON() {
        return "{" +
            "\"id\": \"" + this.id + "\"," +
            "\"authorId\": \"" + this.authorId + "\"," +
            "\"content\": \"" + this.content + "\"," +
            "\"channelId\": \"" + this.channelId + "\"," +
            "\"createdAt\": \"" + this.createdAt + "\"," +
            "\"updatedAt\": \"" + this.updatedAt + "\"" +
        "}";
    }
}
