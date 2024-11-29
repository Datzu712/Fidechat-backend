package com.fidechat.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RequestMapping("")
@RestController
public class TestController {
    @GetMapping("")
    public String test() {
        System.out.println("Hello, world!");
        return "Hello, world!";
    }
}
