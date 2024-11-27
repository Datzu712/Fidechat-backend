package com.fidechat.repositories;

import com.fidechat.database.models.Message;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class MessageRepository {
    private Connection connection;

    public MessageRepository() {
        try {
            this.connection = DatabaseManager.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Message findOneById(String id) {
        String sql = "SELECT * FROM \"message\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new Message()
                        .setId(rs.getString("id"))
                        .setAuthorId(rs.getString("author_id"))
                        .setContent(rs.getString("content"))
                        .setChannelId(rs.getString("channel_id"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Message> findAll() {
        String sql = "SELECT * FROM \"message\"";
        List<Message> messages = new ArrayList<>();
        try (ResultSet rs = connection.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                messages.add(new Message()
                        .setId(rs.getString("id"))
                        .setAuthorId(rs.getString("author_id"))
                        .setContent(rs.getString("content"))
                        .setChannelId(rs.getString("channel_id")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return messages;
    }

    public void insertOne(Message message) {
        String sql = "INSERT INTO \"message\" (author_id, content, channel_id) VALUES (?::uuid, ?, ?::uuid)";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, message.getAuthorId());
            pstmt.setString(2, message.getContent());
            pstmt.setString(3, message.getChannelId());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

        public void updateOneById(Message message, String id) {
        String sql = "UPDATE \"message\" SET (author_id, content, channel_id) VALUES (?, ?, ?) WHERE id = ?:: uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, message.getAuthorId());
            pstmt.setString(2, message.getContent());
            pstmt.setString(3, message.getChannelId());
            pstmt.setString(3, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            AppLogger.error(e.getMessage() + "\nStackTrace:" + e.getStackTrace() + "\nSQLState" + e.getSQLState());
        }
    }
    public void deleteOneById(String id) {
        String sql = "DELETE FROM \"message\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
}
