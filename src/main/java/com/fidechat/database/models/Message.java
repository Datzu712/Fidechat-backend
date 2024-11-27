package com.fidechat.database.models;

public class Message extends BaseModel<Message> {
    private String authorId;
    private String content;
    private String channelId;

    public Message() {
        super();
    }

    public Message(String name, String authorId, String content, String channelId) {
        this.setName(name);
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

    
}
