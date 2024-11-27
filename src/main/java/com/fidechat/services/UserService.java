package com.fidechat.services;

import com.fidechat.repositories.UserRepository;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import com.fidechat.database.models.User;

@Service
public class UserService {
    private final UserRepository userRepository = new UserRepository();

    public void createUser(User user) {

        //this.userRepository.insertOne(user);
    }
}
