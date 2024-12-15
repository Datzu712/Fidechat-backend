package com.fidechat.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;


@Controller()
@CrossOrigin(origins = "*")
@RequestMapping("/")
public class ApplicationController {
    @GetMapping("/{path:^(?!ws$)[^\\.]*}")
    public String getIndex() {
        return "index.html";
    }
}
