package com.fidechat.services;

import com.fidechat.repositories.UserRepository;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;


import com.fidechat.database.models.UserModel;
import com.fidechat.entities.Response;

@Service
public class UserService {
    private final UserRepository userRepository = new UserRepository();

    public ResponseEntity<String> createUser(UserModel user) {
        UserModel existingUser = new UserModel()
            .setEmail(user.getEmail())
            .setName(user.getName());

        if (!userRepository.queryByCriteria(existingUser).isEmpty()) {
            return new Response<String>()
                .setBody("User already exists")
                .setStatusCode(HttpStatus.BAD_REQUEST).build();
        }

        try {
            userRepository.insertOne(user);
            return new Response<String>()
                .setBody("User created successfully")
                .setStatusCode(HttpStatus.CREATED).build();
        } catch (Exception e) {
            return new Response<String>()
                .setBody("Failed to create user")
                .setStatusCode(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    
    }
}
