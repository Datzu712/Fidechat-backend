package com.fidechat.auth;

import java.io.IOException;

import org.springframework.web.filter.OncePerRequestFilter;

import com.auth0.jwt.JWT;
import com.auth0.jwt.algorithms.Algorithm;
import com.auth0.jwt.exceptions.JWTVerificationException;
import com.auth0.jwt.interfaces.DecodedJWT;
import com.auth0.jwt.interfaces.JWTVerifier;
import com.fidechat.database.models.UserModel;
import com.fidechat.repositories.UserRepository;
import com.fidechat.utils.AppLogger;
import com.fidechat.utils.RequestContext;

import io.github.cdimascio.dotenv.Dotenv;
import io.micrometer.common.lang.NonNull;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.Cookie;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;

public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final Dotenv config = Dotenv.load();
    private final UserRepository userRepository = new UserRepository();

    @Override
    protected void doFilterInternal(
        @NonNull HttpServletRequest request, 
        @NonNull HttpServletResponse response, 
        @NonNull FilterChain filterChain
    ) throws ServletException, IOException {
        String requestPath = request.getRequestURI();
        System.out.println("Request path: " + requestPath);

        if (requestPath.startsWith("/assets")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (requestPath.startsWith("/ws")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (!requestPath.startsWith("/api")) {
            filterChain.doFilter(request, response);
            return;
        }

        if (
            "/api/auth/login".equals(requestPath) || 
            "/api/auth/ws/token".equals(requestPath) || 
            "/api/auth/register".equals(requestPath)
        ) {
            filterChain.doFilter(request, response);
            return;
        }
        
        String token = this.getJwtFromCookies(request);
        System.out.println(token);

        if (token == null) {
            response.sendError(HttpServletResponse.SC_UNAUTHORIZED, "Unauthorized");
            System.out.println("No token found in cookies");
            return;
        }

        String jwtSecret = this.getSecret(false);
        try {
            Algorithm algorithm = Algorithm.HMAC256(jwtSecret);
            JWTVerifier verifier = JWT.require(algorithm)
                .withIssuer("fidechat")
                .build();
            DecodedJWT jwt = verifier.verify(token);
            String userId = jwt.getSubject();

            UserModel targetUser = this.userRepository.findOneById(userId);
            if (targetUser == null) {
                System.out.println("User not found");
                response.sendError(401, "Unauthorized");
                return;
            }

            System.out.println("User found: " + targetUser.getEmail());
            this.setAuthentication(request, targetUser);

            RequestContext.setCurrentUser(targetUser);

            filterChain.doFilter(request, response);
        } catch (JWTVerificationException err) {
            response.sendError(401, "Unauthorized");
        }
    }
    
    private String getJwtFromCookies(HttpServletRequest request) {
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("token".equals(cookie.getName())) {
                    return cookie.getValue();
                }
            }
        }
        return null;
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

    private void setAuthentication(HttpServletRequest request, UserModel targetUser) {
        UserDetails userDetails = User.builder()
            .username(targetUser.getEmail())
            .password("") // password is not needed for this context
            .authorities(new SimpleGrantedAuthority("USER"))
            .build();

        UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
            userDetails, 
            null, 
            userDetails.getAuthorities()
        );
        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

        SecurityContextHolder.getContext().setAuthentication(authentication);
    }
}
