package com.fidechat.auth;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import java.util.List;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private JwtAuthenticationFilter jwtCookieAuthenticationFilter = new JwtAuthenticationFilter();

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http.csrf(csrf -> csrf.disable())
            .cors(cors -> cors.configurationSource(request -> {
                var corsConfiguration = new org.springframework.web.cors.CorsConfiguration();
                corsConfiguration.setAllowedOrigins(List.of("http://localhost:5173"));
                corsConfiguration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS"));
                corsConfiguration.setAllowedHeaders(List.of("*"));
                corsConfiguration.setAllowCredentials(true); // Allow credentials
                return corsConfiguration;
            }))
            .authorizeHttpRequests(auth -> auth
                .requestMatchers("/api/auth/login", "/api/auth/ws/token").permitAll()
                .anyRequest().authenticated()
            )
            .addFilterBefore(this.jwtCookieAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return http.build();
    }
}