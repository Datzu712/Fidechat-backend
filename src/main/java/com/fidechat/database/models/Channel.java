package com.fidechat.database.models;

public class Channel extends BaseModel<Channel> {
    private String description;

    public Channel() {
        super();
    }

    public Channel(String name, String description) {
        this.setName(name);
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public Channel setDescription(String description) {
        this.description = description;
        return this;
    }
}
