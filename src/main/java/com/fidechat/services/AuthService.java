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
import com.fidechat.database.models.UserModel;
import com.fidechat.entities.dto.AuthReqBody;


@Service
public class AuthService {
    private UserRepository userRepository = new UserRepository();
    private Dotenv config = Dotenv.load();

    /**
     * Authenticates a user based on the provided email and password.
     * If authentication is successful, a JWT token is generated and added as an HTTP-only cookie to the response.
     *
     * @param email the email of the user attempting to log in
     * @param password the password of the user attempting to log in
     * @param res the HttpServletResponse to which the JWT token cookie will be added
     * @return a ResponseEntity containing a success message and user data if authentication is successful,
     *         or an error message if authentication fails
     */
    public ResponseEntity<String> login(String email, String password, HttpServletResponse res) {
        UserModel criteria = new UserModel().setEmail(email);

        UserModel targetUser = userRepository.queryOneByCriteria(criteria);
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
        cookie.setSecure(true);
        cookie.setPath("/");

        res.addCookie(cookie);

        return ResponseEntity.ok("{\"message\": \"Login successful\", \"data\":" + targetUser.toJson() + "}");
    }

    /**
     * Registers a user to the websocket service by verifying the provided JWT token
     * and generating a new websocket token.
     *
     * @param JWTtoken the JWT token to be verified
     * @return a ResponseEntity containing the new websocket token in JSON format if the
     *         verification is successful, or an error message if the verification fails
     */
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

            UserModel targetUser = this.userRepository.findOneById(userId);
            if (targetUser == null) {
                return ResponseEntity.status(404).body("UserModel not found");
            }

            Algorithm websocketAlgorithm = Algorithm.HMAC256(jwtWebsocketSecret);
            String websocketToken = JWT.create()
                .withIssuer("fidechat")
                .withSubject(targetUser.getId())
                .sign(websocketAlgorithm);
            
            return ResponseEntity.ok("{\"token\": \"" + websocketToken + "\"}");

        } catch (JWTVerificationException err) {
            return ResponseEntity.status(401).body("Invalid token");
        }
    }

    /**
     * Retrieves the JWT secret key from the configuration.
     * If the secret key is not found and the environment is set to "dev",
     * a default secret key is used and an error is logged.
     * If the secret key is not found and the environment is not "dev",
     * the application will print an error message and terminate.
     *
     * @param forWebsocket a Boolean indicating whether to retrieve the secret key for WebSocket connections.
     * @return the JWT secret key as a String.
     */
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

    /**
     * Logs out the user by invalidating the authentication cookie.
     *
     * This method creates a new cookie with the name "token" and sets its value to null.
     * The cookie is configured to be HTTP-only and secure, with a path of "/" and a maximum age of 0,
     * effectively removing it from the client's browser.
     * The cookie is then added to the response to be sent back to the client.
     *
     * @param res the HttpServletResponse to which the cookie will be added
     * @return a ResponseEntity containing a JSON message indicating that the logout was successful
     */
    public ResponseEntity<String> logout(HttpServletResponse res) {
        Cookie cookie = new Cookie("token", null);
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/");
        cookie.setMaxAge(0);

        res.addCookie(cookie);

        return ResponseEntity.ok("{\"message\": \"Logout successful\"}");
    }

    public ResponseEntity<String> register(AuthReqBody data) {
        try {
            if (data.getEmail() == null || data.getPassword() == null || data.getName() == null) {
                return ResponseEntity.status(400).body("Missing required fields");
            }

            UserModel existingUser = userRepository.queryOneByCriteria(new UserModel().setEmail(data.getEmail()));
            if (existingUser != null) {
                return ResponseEntity.status(409).body("Email already in use");
            }
    
            UserModel newUser = new UserModel()
                .setEmail(data.getEmail())
                .setPassword(data.getPassword())
                .setName(data.getName());
    
            userRepository.insertOne(newUser);
    
            return ResponseEntity.ok("{\"message\": \"Registration successful\", \"data\":" + newUser.toJson() + "}");
        } catch (Exception e) {
           e.printStackTrace();
              return ResponseEntity.status(500).body("Internal server error");
        }
    }
}
