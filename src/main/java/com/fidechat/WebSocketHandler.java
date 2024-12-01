package com.fidechat;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.lang.NonNull;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.fidechat.utils.AppLogger;
import com.fidechat.utils.JwtUtils;

import io.github.cdimascio.dotenv.Dotenv;

import java.net.URI;
import java.util.Collections;
import java.util.HashSet;
import java.util.Set;

public class WebSocketHandler extends TextWebSocketHandler {

    private final Set<WebSocketSession> sessions = Collections.synchronizedSet(new HashSet<>());
    private final Dotenv config = Dotenv.load();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) throws Exception {
        String token = this.getTokenFromSession(session);
        if (token == null) {
            AppLogger.info("No token found in session query");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }
        try {
            String userId = JwtUtils.getUserIdFromToken(token, config.get("JWT_WEBSOCKET_SECRET"));

            session.getAttributes().put("userId", userId);
            this.sessions.add(session);

        } catch (JWTVerificationException e) {
            AppLogger.info("Invalid token");
            session.close(CloseStatus.NOT_ACCEPTABLE);
            return;
        }

        sessions.add(session);
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) throws Exception {
        sessions.remove(session);
    }

    @Override
    public void handleTextMessage(@NonNull WebSocketSession session, @NonNull TextMessage message) throws Exception {
        AppLogger.info("Received message: " + message.getPayload());
        session.sendMessage(new TextMessage("Received: " + message.getPayload()));
        sendMessageToAllSessions("message", message.getPayload());
    }

    public void sendMessageToAllSessions(String event, Object data) {
        TextMessage message = new TextMessage(event + ": " + data.toString());
        synchronized (sessions) {
            for (WebSocketSession session : sessions) {
                try {
                    session.sendMessage(message);
                } catch (Exception e) {
                    e.printStackTrace();
                }
            }
        }
    }

    private String getTokenFromSession(WebSocketSession session) {
        URI uri = session.getUri();
        if (uri == null) {
            return null;
        }

        String query = uri.getQuery();
        if (query != null && query.startsWith("token=")) {
            return query.substring(6);
        }
        return null;
    }
}