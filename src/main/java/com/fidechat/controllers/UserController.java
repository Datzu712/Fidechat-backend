package com.fidechat.controllers;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidechat.database.models.UserModel;
import com.fidechat.repositories.UserRepository;
import com.fidechat.services.UserService;

import java.util.List;

@RestController
@RequestMapping("/api/users")
public class UserController {
    private final UserRepository userRepository = new UserRepository();
    private final UserService userService = new UserService();

    @GetMapping()
    public List<UserModel> findAll() {
        return this.userRepository.findAll();
    }

    @GetMapping("/{id}")
    public UserModel findUserById(@PathVariable String id) {
        return this.userRepository.findOneById(id);
    }

    @PostMapping()
    public ResponseEntity<String> createUser(@RequestBody UserModel user) {
        return this.userService.createUser(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        this.userRepository.deleteOneById(id);
    }

    @PatchMapping("/{id}")
    public void updateUser(@PathVariable String id, @RequestBody UserModel user) {
        this.userRepository.updateOneById(user, id);
    }
}