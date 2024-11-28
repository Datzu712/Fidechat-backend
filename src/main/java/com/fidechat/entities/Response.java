package com.fidechat.entities;

import org.springframework.http.ResponseEntity;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.http.HttpStatus;

public class Response<K> {
    private HttpStatus status;
    private String body = "";

    // Default constructor for Response class
    // This constructor is intentionally empty as it allows for creating an instance without setting any fields initially.
    public Response() {}
    public Response(String body, HttpStatus status) {
        this.status = status;
        this.body = body;
    }

    public HttpStatus getStatus() {
        return this.status;
    }

    public String getBody() {
        return this.body;
    }   

    public Response<K> setStatusCode(HttpStatus status) {
        this.status = status;
        return this;
    }

    public Response<K> setBody(String message) {
        this.body = message;
        return this;
    }

    public Response<K> setResponseMessage(String message) {
        this.body = "{\"message\": \"" + message + "\"}";
        return this;
    }

    public <T> Response<K> setResponseObject(T obj) throws JsonProcessingException {
        ObjectMapper mapper = new ObjectMapper();
        String response = mapper.writeValueAsString(obj);

        this.body = response;

        return this;
    }

    public ResponseEntity<String> build() {
        if (this.status == null) {
            throw new IllegalStateException("Status code is not set");
        }

        return new ResponseEntity<String>(this.body, this.status);
    }
}
