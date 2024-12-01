package com.fidechat.entities;

// Abstract event ? 
public class Event<T> {
    private EventsEnum type;
    private T payload;

    public Event(EventsEnum type, T payload) {
        this.type = type;
        this.payload = payload;
    }

    public EventsEnum getType() {
        return this.type;
    }

    public T getPayload() {
        return this.payload;
    }
}
