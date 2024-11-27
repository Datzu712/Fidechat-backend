package com.fidechat.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;

public class DatabaseManager {
    private static final String DB_URL = "jdbc:postgresql://104.131.170.134:5430/uni";
    private static final String DB_USER = "admin";
    private static final String DB_PASSWORD = "";
    private static Connection connection = null;

    private DatabaseManager() {
    }

    public static Connection getConnection() throws SQLException {
        if (connection == null) {
            connection = DriverManager.getConnection(DB_URL, DB_USER, DB_PASSWORD);
        }
        return connection;
    }
}
