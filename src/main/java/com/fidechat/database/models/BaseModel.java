package com.fidechat.database.models;

// Clase base genérica para todas las entidades
public abstract class BaseModel<C extends BaseModel<C>> {
    private String id;
    private String name;

    public BaseModel() {
    }

    public BaseModel(String id, String name) {
        this.id = id;
        this.name = name;
    }

    public String getId() {
        return id;
    }

    @SuppressWarnings("unchecked")
    public C setId(String id) {
        this.id = id;
        return (C) this;
    }

    public String getName() {
        return name;
    }

    @SuppressWarnings("unchecked")
    public C setName(String name) {
        this.name = name;
        return (C) this;
    }

    
}
