package com.fidechat.controllers;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import jakarta.servlet.http.HttpServletResponse;

import com.fidechat.entities.dto.AuthReqBody;
import com.fidechat.services.AuthService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CookieValue;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.GetMapping;


@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = "*")
public class AuthController {
    @Autowired
    AuthService authService;

    @PostMapping("/login")
    @CrossOrigin(origins = "*")
    public ResponseEntity<String> login(@RequestBody AuthReqBody authReqBody, HttpServletResponse res) {
        return this.authService.login(authReqBody.getEmail(), authReqBody.getPassword(), res);
    }

    @PostMapping("/ws/token")
    @CrossOrigin(origins = "*")
    public ResponseEntity<String> register(@CookieValue("token") String token) {
        return this.authService.registerToSocket(token);
    }
   
    @PostMapping("/verifyToken")
    public String getMethodName() {
        return "U are authenticated!";
    }
    
}
