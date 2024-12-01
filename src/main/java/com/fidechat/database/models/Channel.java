package com.fidechat.database.models;

public class Channel {
    private String id;
    private String name;
    private String description;
    private String createdAt;
    private String updatedAt;
    private String ownerId;

    public Channel() {}

    public Channel(String name, String description) {
        this.name = name;
        this.description = description;
    }

    public String getDescription() {
        return description;
    }

    public Channel setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getId() {
        return id;
    }

    public Channel setId(String id) {
        this.id = id;
        return this;
    }

    public String getName() {
        return name;
    }

    public Channel setName(String name) {
        this.name = name;
        return this;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public Channel setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public String getUpdatedAt() {
        return updatedAt;
    }

    public Channel setUpdatedAt(String updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    public String getOwnerId() {
        return ownerId;
    }

    public Channel setOwnerId(String ownerId) {
        this.ownerId = ownerId;
        return this;
    }

    public String toJSON() {
        return "{\"id\": \"" + this.id + "\", \"name\": \"" + this.name + "\", \"description\": \"" + this.description + "\"}";
    }
}
