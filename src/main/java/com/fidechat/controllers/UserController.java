package com.fidechat.controllers;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidechat.database.models.User;
import com.fidechat.repositories.UserRepository;

import java.util.List;

@RestController
@RequestMapping("/api/user")
public class UserController {
    private final UserRepository userRepositoryC = new UserRepository();

    @GetMapping()
    public List<User> findAll() {
        return this.userRepositoryC.findAll();
    }

    @GetMapping("/{id}")
    public User findUserById(@PathVariable String id) {
        return this.userRepositoryC.findOneById(id);
    }

    @PostMapping()
    public void createUser(@RequestBody User user) {
        this.userRepositoryC.insertOne(user);
    }

    @DeleteMapping("/{id}")
    public void deleteUser(@PathVariable String id) {
        this.userRepositoryC.deleteOneById(id);
    }

    @PatchMapping("/{id}")
    public void updateUser(@PathVariable String id, @RequestBody User user) {
        this.userRepositoryC.updateOneById(user, id);
    }
}