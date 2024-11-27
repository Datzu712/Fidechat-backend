package com.fidechat.database.models;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import java.sql.Timestamp;

public class User {
    private String id;
    private String email;
    private String hashedPassword;
    private String password; // only used for registration
    private String name;

    private Timestamp createdAt;
    private Timestamp updatedAt;

    public User() {}

    public User(String name, String email, String password) {
        this.setName(name);
        this.email = email;
        this.hashedPassword = hashPassword(password);
    }

    public String getName() {
        return name;
    }

    public User setName(String name) {
        this.name = name;
        return this;
    }

    public String getId() {
        return id;
    }

    public User setId(String id) {
        this.id = id;
        return this;
    }

    public String getEmail() {
        return email;
    }

    public User setEmail(String email) {
        this.email = email;
        return this;
    }

    public User sePassword(String password) {
        this.hashedPassword = hashPassword(password);
        return this;
    }
    
    public User setHashedPassword(String hashedPassword) {
        this.hashedPassword = hashedPassword;
        return this;
    }

    private String hashPassword(String password) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        return passwordEncoder.encode(password);
    }

    public boolean checkPassword(String password) {
        BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();
        return passwordEncoder.matches(password, this.hashedPassword);
    }

    public String getHashedPassword() {
        return this.hashedPassword;
    }

    public Timestamp getCreatedAt() {
        return createdAt;
    }

    public User setCreatedAt(Timestamp createdAt) {
        this.createdAt = createdAt;
        return this;
    }

    public Timestamp getUpdatedAt() {
        return updatedAt;
    }

    public User setUpdatedAt(Timestamp updatedAt) {
        this.updatedAt = updatedAt;
        return this;
    }

    @Override
    public String toString() {
        return "User{" +
            "id='" + id + '\'' +
            ", email='" + email + '\'' +
            ", name='" + name + '\'' +
            ", createdAt=" + createdAt +
            ", updatedAt=" + updatedAt +
            '}';
    }
}