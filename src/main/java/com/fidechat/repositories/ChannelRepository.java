package com.fidechat.repositories;

import com.fidechat.database.models.Channel;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class ChannelRepository {
    private Connection connection;

    public ChannelRepository() {
        try {
            this.connection = DatabaseManager.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Channel findOneById(String id) {
        String sql = "SELECT * FROM \"channel\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new Channel()
                        .setId(rs.getString("id"))
                        .setName(rs.getString("name"))
                        .setDescription(rs.getString("description"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<Channel> findAll() {
        String sql = "SELECT * FROM \"channel\"";
        List<Channel> channels = new ArrayList<>();
        try (ResultSet rs = connection.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                channels.add(new Channel()
                        .setId(rs.getString("id"))
                        .setName(rs.getString("name"))
                        .setDescription(rs.getString("description")));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return channels;
    }

    public void deleteOneById(String id) {
        String sql = "DELETE FROM \"channel\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void insertOne(Channel channel) {
        String sql = "INSERT INTO \"channel\" (name, description) VALUES (?, ?)";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, channel.getName());
            pstmt.setString(2, channel.getDescription());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }
            public void updateOneById(Channel channel, String id) {
        String sql = "UPDATE \"message\" SET (name, description) VALUES (?, ?) WHERE id = ?:: uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, channel.getName());
            pstmt.setString(2, channel.getDescription());
            pstmt.setString(3, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            AppLogger.error(e.getMessage() + "\nStackTrace:" + e.getStackTrace() + "\nSQLState" + e.getSQLState());
        }
    }

}
