package com.fidechat;

import org.springframework.web.socket.CloseStatus;
import org.springframework.web.socket.TextMessage;
import org.springframework.web.socket.WebSocketSession;
import org.springframework.web.socket.handler.TextWebSocketHandler;
import org.springframework.lang.NonNull;

import com.auth0.jwt.exceptions.JWTVerificationException;
import com.fidechat.entities.Event;
import com.fidechat.utils.AppLogger;
import com.fidechat.utils.JwtUtils;

import io.github.cdimascio.dotenv.Dotenv;

import java.net.URI;
import java.util.Collections;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

    public void handleChannelCreate(String userId, String data) {
        WebSocketSession targetSession = this.findSessionByUserId(userId);
        if (!sessions.contains(targetSession)) {
            System.out.println("No session found for user: " + userId);
            return;
        }

        try {
            targetSession.sendMessage(new TextMessage(data));
        } catch (Exception e) {
           AppLogger.error("Error sending message to session: " + e.getMessage());
        }
    }

    public void handleEvent(List<String> usersId, Event eventPayload) {
        System.out.println("Sending " + eventPayload.getType() + " event to users: " + usersId);
        List<WebSocketSession> targetSession = this.findSessionByUserId(usersId);
        if (targetSession.isEmpty()) {
            System.out.println("No session found for users: " + usersId);
            return;
        }

        try {
            for (WebSocketSession session : targetSession) {
                session.sendMessage(new TextMessage(eventPayload.toJSON()));
            }
        } catch (Exception e) {
           AppLogger.error("Error sending message to session: " + e.getMessage());
        }
    }

    private WebSocketSession findSessionByUserId(String userId) {
        return sessions.stream()
            .filter(
                session -> session.getAttributes()
                    .get("userId")
                    .equals(userId)
            )
            .findFirst()
            .orElse(null);
    }
    private List<WebSocketSession> findSessionByUserId(List<String> userIds) {
        return sessions.stream()
            .filter(
                session -> userIds.contains(session.getAttributes().get("userId"))
            )
            .collect(Collectors.toList());
    }
}