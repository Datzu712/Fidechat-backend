package com.fidechat.repositories;

import com.fidechat.database.models.User;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Repository;

@Repository
public class UserRepository {
    private Connection connection;

    public UserRepository() {
        try {
            this.connection = DatabaseManager.getConnection();
        } catch (Exception e) {
            e.printStackTrace();
        }
    }

    public User findOneById(String id) {
        String sql = "SELECT id, name, email FROM \"user\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new User()
                    .setId(rs.getString("id"))
                    .setName(rs.getString("name"))
                    .setEmail(rs.getString("email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<User> findAll() {
        String sql = "SELECT id, name, email FROM \"user\"";
        List<User> users = new ArrayList<>();
        try (ResultSet rs = connection.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                users.add(
                    new User()
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

    public void deleteOneById(String id) {
        String sql = "DELETE FROM \"user\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void insertOne(User user) {
        String sql = "INSERT INTO \"user\" (name, email, hashed_password) VALUES (?, ?, ?)";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getEmail());
            pstmt.setString(3, user.getHashedPassword());
            pstmt.executeUpdate();
        } catch (SQLException e) {
            e.printStackTrace();
        }
    }

    public void updateOneById(User user, String id) {
        String sql = "UPDATE \"user\" SET (name, email, hashed_password) VALUES (?, ?, ?) WHERE id = ?:: uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, user.getName());
            pstmt.setString(2, user.getEmail());
            pstmt.setString(3, user.getHashedPassword());
            pstmt.setString(4, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            AppLogger.error(e.getMessage() + "\nStackTrace:" + e.getStackTrace() + "\nSQLState" + e.getSQLState());
        }
    }

    public List<User> queryByCriteria(User user) {
        return queryByCriteria(user, "AND");
    }

    public List<User> queryByCriteria(User user, String condition) {
        List<User> users = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT id, name, hashed_password, email, created_at, updated_at FROM \"user\" WHERE");
        List<Object> parameters = new ArrayList<>();
        List<String> properties = new ArrayList<>();

        if (user.getId() != null) {
            properties.add("id = ?::uuid");
            parameters.add(user.getId());
        }
        if (user.getName() != null) {
            properties.add("name = ?");
            parameters.add(user.getName());
        }
        if (user.getEmail() != null) {
            properties.add("email = ?");
            parameters.add(user.getEmail());
        }
        if (user.getCreatedAt() != null) {
            properties.add("created_at = ?");
            parameters.add(user.getCreatedAt());
        }

        if (user.getUpdatedAt() != null) {
            properties.add("updated_at = ?");
            parameters.add(user.getUpdatedAt());
        }

        sql.append(" ").append(String.join(" " + condition + " ", properties));

        System.out.println(sql.toString());
        try (PreparedStatement pstmt = connection.prepareStatement(sql.toString())) {
            for (int i = 0; i < parameters.size(); i++) {
                pstmt.setObject(i + 1, parameters.get(i));
            }
            try (ResultSet rs = pstmt.executeQuery()) {
                while (rs.next()) {
                    System.out.println(rs.getTimestamp("created_at"));
                    users.add(
                        new User()
                            .setId(rs.getString("id"))
                            .setName(rs.getString("name"))
                            .setEmail(rs.getString("email"))
                            .setCreatedAt(rs.getTimestamp("created_at"))
                            .setUpdatedAt(rs.getTimestamp("updated_at"))
                            .setHashedPassword(rs.getString("hashed_password"))
                    );
                }
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return users;
    }
}
