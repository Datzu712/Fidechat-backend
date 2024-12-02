package com.fidechat.database;

import java.sql.Connection;
import java.sql.DriverManager;
import java.sql.SQLException;
import java.sql.Statement;

import io.github.cdimascio.dotenv.Dotenv;

public class DatabaseManager {
    private static Connection connection = null;

    protected DatabaseManager() {}

    public static Connection getConnection() throws SQLException {
        if (connection == null) {
            Dotenv dotenv = Dotenv.load();
            String url = dotenv.get("PG_URL");
            String user = dotenv.get("PG_USER");
            String password = dotenv.get("PG_PASSWORD");

            connection = DriverManager.getConnection(url, user, password);
        }
        return connection;
    }

    public static long getPing() {
        long startTime = System.currentTimeMillis();
        try {
            Statement stmt = getConnection().createStatement();
            stmt.executeQuery("SELECT 1+1");
            stmt.close();
        } catch (SQLException e) {
            return -1;
        }
        long endTime = System.currentTimeMillis();
        return endTime - startTime;
    }
}
