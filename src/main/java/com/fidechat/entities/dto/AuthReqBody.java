package com.fidechat.entities.dto;

public class AuthReqBody {
    private String email;
    private String password;
    private String name;

    public AuthReqBody() {
    }

    public AuthReqBody(String email, String password, String name) {
        this.email = email;
        this.password = password;
        this.name = name;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }

    public String getName() {
        return this.name;
    }

    public AuthReqBody setEmail(String email) {
        this.email = email;
        return this;
    }

    public AuthReqBody setPassword(String password) {
        this.password = password;
        return this;
    }

    public AuthReqBody setName(String name) {
        this.name = name;
        return this;
    }
}
