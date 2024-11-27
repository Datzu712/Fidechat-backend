package com.fidechat;

import com.fidechat.database.models.User;
import com.fidechat.repositories.UserRepository;

public class Main {
    public static void main(String[] args) {
        User user = new User("Michael Knight", "sx@dx.com", "password");
        UserRepository userRepository = new UserRepository();

        userRepository.insertOne(user);

    }
}
