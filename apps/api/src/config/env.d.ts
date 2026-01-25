export interface IEnvironmentVariables {
    NODE_ENV: 'development' | 'production' | 'test';

    // Database
    DATABASE_URL: string;

    // Application
    HTTP_PORT?: number;

    // Keycloak
    KEYCLOAK_BASE_URL: string;
    KEYCLOAK_ADMIN_USERNAME: string;
    KEYCLOAK_ADMIN_PASSWORD: string;
    KEYCLOAK_REALM: string;
}
