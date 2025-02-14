package com.fidechat.repositories;

import com.fidechat.database.models.UserModel;
import com.fidechat.utils.AppLogger;
import com.fidechat.database.DatabaseManager;

import java.sql.*;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

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

    public UserModel findOneById(String id) {
        String sql = "SELECT id, name, email FROM \"user\" WHERE id = ?::uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, id);
            ResultSet rs = pstmt.executeQuery();
            if (rs.next()) {
                return new UserModel()
                    .setId(rs.getString("id"))
                    .setName(rs.getString("name"))
                    .setEmail(rs.getString("email"));
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return null;
    }

    public List<UserModel> findAll() {
        String sql = "SELECT id, name, email FROM \"user\"";
        List<UserModel> UserModels = new ArrayList<>();
        try (ResultSet rs = connection.createStatement().executeQuery(sql)) {
            while (rs.next()) {
                UserModels.add(
                    new UserModel()
                        .setId(rs.getString("id"))
                        .setName(rs.getString("name"))
                        .setEmail(rs.getString("email"))
                );
            }
        } catch (SQLException e) {
            e.printStackTrace();
        }
        return UserModels;
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

    public void insertOne(UserModel userModel) throws SQLException {
        String sql = "INSERT INTO \"user\" (id, name, email, hashed_password) VALUES (CAST(? AS UUID), ?, ?, ?)";

        String id = UUID.randomUUID().toString();
        
        PreparedStatement pstmt = connection.prepareStatement(sql);
        
        pstmt.setString(1, id);
        pstmt.setString(2, userModel.getName());
        pstmt.setString(3, userModel.getEmail());
        pstmt.setString(4, userModel.getHashedPassword());
        
        pstmt.executeUpdate();


        // default channel id
        // String sql2 = "INSERT INTO user_channel (user_id, channel_id) VALUES (CAST(? AS UUID), CAST(? AS UUID))";
        // PreparedStatement pstmt2 = connection.prepareStatement(sql2);
        // pstmt2.setString(1, id);
        // pstmt2.setString(2, "dd166ae3-d10c-42e9-9d5b-b8225b0349c9");

        // pstmt2.executeUpdate();
    }

    public void updateOneById(UserModel UserModel, String id) {
        String sql = "UPDATE \"user\" SET (name, email, hashed_password) VALUES (?, ?, ?) WHERE id = ?:: uuid";
        try (PreparedStatement pstmt = connection.prepareStatement(sql)) {
            pstmt.setString(1, UserModel.getName());
            pstmt.setString(2, UserModel.getEmail());
            pstmt.setString(3, UserModel.getHashedPassword());
            pstmt.setString(4, id);
            pstmt.executeUpdate();
        } catch (SQLException e) {
            AppLogger.error(e.getMessage() + "\nStackTrace:" + e.getStackTrace() + "\nSQLState" + e.getSQLState());
        }
    }

    public UserModel queryOneByCriteria(UserModel UserModel) {
        List<UserModel> foundUserModels = this.queryByCriteria(UserModel);
        if (foundUserModels.size() == 0) {
            return null;
        }

        if (foundUserModels.size() > 1) {
            System.out.println("Warning: Found more of 1 UserModel");
        }

        return foundUserModels.get(0);
    }

    public List<UserModel> queryByCriteria(UserModel UserModel) {
        return queryByCriteria(UserModel, "AND");
    }

    public List<UserModel> queryByCriteria(UserModel UserModel, String condition) {
        List<UserModel> UserModels = new ArrayList<>();
        StringBuilder sql = new StringBuilder("SELECT id, name, hashed_password, email, created_at, updated_at FROM \"user\" WHERE");
        List<Object> parameters = new ArrayList<>();
        List<String> properties = new ArrayList<>();

        if (UserModel.getId() != null) {
            properties.add("id = ?::uuid");
            parameters.add(UserModel.getId());
        }
        if (UserModel.getName() != null) {
            properties.add("name = ?");
            parameters.add(UserModel.getName());
        }
        if (UserModel.getEmail() != null) {
            properties.add("email = ?");
            parameters.add(UserModel.getEmail());
        }
        if (UserModel.getCreatedAt() != null) {
            properties.add("created_at = ?");
            parameters.add(UserModel.getCreatedAt());
        }

        if (UserModel.getUpdatedAt() != null) {
            properties.add("updated_at = ?");
            parameters.add(UserModel.getUpdatedAt());
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
                    UserModels.add(
                        new UserModel()
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
        return UserModels;
    }

    public UserModel findByEmail(String email) throws SQLException {
        String sql = "SELECT id, name, email FROM \"user\" WHERE email = ?";
        PreparedStatement pstmt = connection.prepareStatement(sql);
        pstmt.setString(1, email);
        ResultSet rs = pstmt.executeQuery();
        if (rs.next()) {
            return new UserModel()
                .setId(rs.getString("id"))
                .setName(rs.getString("name"))
                .setEmail(rs.getString("email"));
        }

        return null;
    }

}
