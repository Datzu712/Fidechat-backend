package com.fidechat.database.models;

public class User extends BaseModel<User> {
    private String email;
    private String hashedPassword;

    public User() {
        super();
    }

    public User(String name, String email, String hashedPassword) {
        this.setName(name);
        this.email = email;
        this.hashedPassword = hashedPassword;
    }

    public String getEmail() {
        return email;
    }

    public User setEmail(String email) {
        this.email = email;
        return this;
    }

    public String getHashedPassword() {
        return hashedPassword;
    }

    public User setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
        return this;
    }
}
