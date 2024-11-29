package com.fidechat.services;

import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import io.github.cdimascio.dotenv.Dotenv;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.util.WebUtils;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;

import com.fidechat.repositories.UserRepository;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.models.User;


@Service
public class AuthService {
    private UserRepository userRepository = new UserRepository();
    private Dotenv config = Dotenv.load();

    public ResponseEntity<String> login(String email, String password, HttpServletResponse res) {
        User criteria = new User().setEmail(email);

        User targetUser = userRepository.queryOneByCriteria(criteria);
        if (targetUser == null || !targetUser.checkPassword(password)) {
            return ResponseEntity.status(401).body("Incorrect email or password");
        }

        String secret = this.getSecret(false);
        Algorithm algorithm = Algorithm.HMAC256(secret);
        String token = JWT.create()
            .withIssuer("fidechat")
            .withSubject(targetUser.getId())
            .sign(algorithm);

        Cookie cookie = new Cookie("token", token);
        cookie.setHttpOnly(true);
        cookie.setSecure(true); // Asegúrate de usar HTTPS en producción
        cookie.setPath("/");
        cookie.setMaxAge(60 * 60); // 1 hora
        cookie.setComment("SameSite=Strict;"); // Solo envía la cookie a tu servidor

        // Agregar la cookie a la respuesta
        res.addCookie(cookie);

        return ResponseEntity.ok("{\"message\": \"Login successful\"}");
    }

    public ResponseEntity<String> registerToSocket(String JWTtoken) {
        String jwtSecret = this.getSecret(false);
        String jwtWebsocketSecret = this.getSecret(true);
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
            JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer("fidechat")
                .build();
            DecodedJWT jwt = verifier.verify(JWTtoken);
            String userId = jwt.getSubject();

            User targetUser = this.userRepository.findOneById(userId);
            if (targetUser == null) {
                return ResponseEntity.status(404).body("User not found");
            }
            return ResponseEntity.ok("\"token\": \"" + JWTtoken + "\"");

        } catch (JWTVerificationException err) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    private String getSecret(Boolean forWebsocket) {
        String secret = this.config.get("JWT_" + (forWebsocket ? "WEBSOCKET_" : "") + "SECRET");
        if (secret == null) {
            if (this.config.get("ENV").equals("dev")) {
                AppLogger.error("JWT_SECRET not found in .env file. Using default secret...");
                secret = "U_SHOULD_DEFINE_JWT_SECRET_IN_ENV_FILE";
            } else {
                System.out.println("JWT_SECRET not found in .env file. Please set JWT_SECRET in .env file, otherwise the server will not start bc that is required for generating JWT secrets.");
                System.exit(1);
            }
        }
        return secret;
    }
}
