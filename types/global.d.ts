declare interface IEnvironmentVariables {
    // Api
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;

    // Oracle
    ORACLE_PWD: string;
    ORACLE_PORT: number;
    ORACLE_USER: string;
    ORACLE_SERVICE_NAME: string;
    ORACLE_HOST: string;

    // Keycloak
    KEYCLOAK_URL: string;
    KEYCLOAK_REALM: string;
    KEYCLOAK_CLIENT_ID: string;
    KEYCLOAK_CLIENT_SECRET: string;
}

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string;
    }
}
