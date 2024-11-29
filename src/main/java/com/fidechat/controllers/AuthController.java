package com.fidechat.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;

import com.fidechat.entities.dto.AuthReqBody;
import com.fidechat.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;


@RestController
@RequestMapping("/api/auth")
public class AuthController {
    AuthService authService = new AuthService();

    @PostMapping("login")
    public ResponseEntity<String> login(@RequestBody AuthReqBody authReqBody, HttpServletResponse res) {
        return this.authService.login(authReqBody.getEmail(), authReqBody.getPassword(), res);
    }

    @PostMapping("/register")
    public String register(@CookieValue("token") String token) {
        return "Token: " + token;
    }
   
}
