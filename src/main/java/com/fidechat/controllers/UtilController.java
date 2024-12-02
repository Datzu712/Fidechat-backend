package com.fidechat.controllers;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.fidechat.database.DatabaseManager;

@RequestMapping("/api")
@RestController
public class UtilController {

    @GetMapping("/ping")
    public String test() {
        long ping = DatabaseManager.getPing();
        return "{\"ping\": " + ping + "}";
    }
}
