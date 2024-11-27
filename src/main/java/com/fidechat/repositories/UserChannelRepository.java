package com.fidechat.repositories;

import com.fidechat.database.models.UserChannel;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

public class UserChannelRepository {
    private Connection connection;

    public UserChannelRepository() {
        try {
            this.connection = DatabaseManager.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public List<UserChannel> findAllByUserId(String userId) {
        String sql = "SELECT * FROM \"user_channel\"  WHERE user_id = ?::uuid";
        List<UserChannel> userChannels = new ArrayList<>();
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, userId);
            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                userChannels.add(new UserChannel()
                        .setUserId(rs.getString("user_id"))
                        .setChannelId(rs.getString("channel_id")));
            }
        } catch (SQLException e) {
            System.err.println("Error al encontrar los canales del usuario: " + e.getMessage());
        }
        return userChannels;
    }

    public void insertOne(UserChannel userChannel) {
        String sql = "INSERT INTO \"user_channel\" (user_id, channel_id) VALUES (?::uuid, ?::uuid)";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, userChannel.getUserId());
            pstmt.setString(2, userChannel.getChannelId());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            System.err.println("Error al insertar una relación user_channel: " + e.getMessage());
        }
    }

    public void updateOneById(UserChannel userChannel, String id) {
        String sql = "UPDATE \"user_channel\" SET (UserId, ChannelId) VALUES (?, ?) WHERE id = ?:: uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, userChannel.getUserId());
            pstmt.setString(2, userChannel.getChannelId());
            pstmt.setString(3, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            AppLogger.error(e.getMessage() + "\nStackTrace:" + e.getStackTrace() + "\nSQLState" + e.getSQLState());
        }
    }
    public void deleteOneById(String id) {
        String sql = "DELETE FROM \"user_channel\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

}
