package com.fidechat.entities.dto;

public class AuthReqBody {
    private String email;
    private String password;

    public AuthReqBody() {
    }

    public AuthReqBody(String email, String password) {
        this.email = email;
        this.password = password;
    }

    public String getEmail() {
        return this.email;
    }

    public String getPassword() {
        return this.password;
    }
}
