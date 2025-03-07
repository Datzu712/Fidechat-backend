package com.fidechat.repositories;

import com.fidechat.database.models.Channel;
import com.fidechat.database.models.Message;
import com.fidechat.database.models.UserModel;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Repository;

@Repository
public class ChannelRepository {
    private Connection connection;

    public ChannelRepository() {
        try {
            this.connection = DatabaseManager.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public Channel findOneById(String id) throws SQLException {
        String sql = "SELECT * FROM \"channel\" WHERE id = ?::uuid";

        PreparedStatement pstmt = connection.prepareStatement(sql);
        pstmt.setString(1, id);
        ResultSet rs = pstmt.executeQuery();
        if (rs.next()) {
            return new Channel()
                .setId(rs.getString("id"))
                .setName(rs.getString("name"))
                .setOwnerId(rs.getString("owner_id"))
                .setDescription(rs.getString("description"));
        }

        return null;
    }

    public List<Channel> findAllFor(String userId) {
        String sql = "SELECT channel.*" +
            " FROM channel" +
            " LEFT JOIN user_channel ON channel.id = user_channel.channel_id" +
            " WHERE user_channel.user_id = CAST(? AS UUID)" +
            " OR channel.owner_id = CAST(? AS UUID)";

        List<Channel> channels = new ArrayList<>();
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, userId);
            pstmt.setString(2, userId);

            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                channels.add(new Channel()
                    .setId(rs.getString("id"))
                    .setName(rs.getString("name"))
                    .setDescription(rs.getString("description"))
                    .setOwnerId(rs.getString("owner_id"))   
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return channels;
    }

    public void deleteOneById(String id) throws SQLException {
        String sql2 = "DELETE FROM \"message\" WHERE channel_id = ?::uuid";
        PreparedStatement pstmt2 = connection.prepareStatement(sql2);
        pstmt2.setString(1, id);
        pstmt2.executeUpdate();

        String sql = "DELETE FROM \"channel\" WHERE id = ?::uuid";

        PreparedStatement pstmt = connection.prepareStatement(sql);

        pstmt.setString(1, id);
        pstmt.executeUpdate();
    }


    public String insertOne(Channel channel) {
        String sql = "INSERT INTO \"channel\" (id, name, description, owner_id) VALUES (CAST(? AS UUID), ?, ?, CAST(? AS UUID))";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            String id = UUID.randomUUID().toString();

            pstmt.setString(1, id);
            pstmt.setString(2, channel.getName());
            pstmt.setString(3, channel.getDescription());
            pstmt.setString(4, channel.getOwnerId());
            pstmt.executeUpdate();

            return id;
        } catch (SQLException e) {
            e.printStackTrace();
            return null;
        }
    }
    public boolean updateOneById(String id, Channel channel) throws SQLException {
        String sql = "UPDATE \"channel\" SET name = ?, description = ? WHERE id = ?::uuid";
        PreparedStatement pstmt = connection.prepareStatement(sql);
    
        pstmt.setString(1, channel.getName());
        pstmt.setString(2, channel.getDescription());
        pstmt.setString(3, id);
        pstmt.executeUpdate();

        return true;
    }

    public List<UserModel> findAllMembers(String channelId) {
        String sql = "SELECT \"user\".*" +
            " FROM \"user\"" +
            " LEFT JOIN user_channel ON \"user\".id = user_channel.user_id" +
            " WHERE user_channel.channel_id = CAST(? AS UUID) OR \"user\".id = (SELECT owner_id FROM channel WHERE id = CAST(? AS UUID))";
        List<UserModel> users = new ArrayList<>();
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, channelId);
            pstmt.setString(2, channelId);

            ResultSet rs = pstmt.executeQuery();
            while (rs.next()) {
                users.add(new UserModel()
                    .setId(rs.getString("id"))
                    .setName(rs.getString("name"))
                    .setEmail(rs.getString("email"))
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }

    public List<Message> getMessagesFrom(String channelId) throws SQLException {
        String sql = "SELECT * FROM \"message\" WHERE channel_id = ?::uuid";
        List<Message> messages = new ArrayList<>();
        PreparedStatement pstmt = connection.prepareStatement(sql);

        pstmt.setString(1, channelId);
        ResultSet rs = pstmt.executeQuery();
        while (rs.next()) {
            messages.add(new Message()
                .setId(rs.getString("id"))
                .setAuthorId(rs.getString("author_id"))
                .setContent(rs.getString("content"))
                .setChannelId(rs.getString("channel_id"))
                .setCreatedAt(rs.getTimestamp("created_at"))
            );
        }

        return messages;
    }

    public void addMember(String channelId, String userId) throws SQLException {
        String sql = "INSERT INTO user_channel (channel_id, user_id) VALUES (CAST(? AS UUID), CAST(? AS UUID))";
        PreparedStatement pstmt = connection.prepareStatement(sql);

        pstmt.setString(1, channelId);
        pstmt.setString(2, userId);
        pstmt.executeUpdate();
    }
}
