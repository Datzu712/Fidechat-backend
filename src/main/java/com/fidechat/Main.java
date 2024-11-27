package com.fidechat;

import com.fidechat.database.models.User;
import com.fidechat.repositories.UserRepository;

public class Main {
    public static void main(String[] args) {
        User user = new User();
        user.setName("don");
        user.setEmail("sx@dx.com");
        UserRepository userRepository = new UserRepository();

        System.out.println(userRepository.queryByCriteria(user, "OR"));

    }
}
