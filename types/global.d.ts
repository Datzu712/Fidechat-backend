declare interface IEnvironmentVariables {
    // Api
    NODE_ENV: 'development' | 'production' | 'test';
    API_PORT: number;
    SOCKET_NAMESPACE?: string;
    CORS_ORIGIN: string;

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
    PUBLIC_KEYCLOAK_URL: string; // Public URL for Keycloak
}

declare type UppercaseKeys<T> = {
    [K in keyof T as Uppercase<string & K>]: T[K];
};

declare interface IReqUser {
    exp: number;
    iat: number;
    auth_time: number;
    jti: string;
    iss: string;
    aud: string;
    sub: string;
    typ: string;
    azp: string;
    sid: string;
    acr: string;
    'allowed-origins': string[];
    realm_access: {
        roles: string[];
    };
    resource_access: Record<string, { roles: string[] }>;
    scope: string;
    email_verified: boolean;
    name: string;
    preferred_username: string;
    given_name: string;
    family_name: string;
    email: string;
    [key: string]: any;
}

// just an alias for IReqUser
declare type KeycloakJwtPayload = IReqUser;

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string;
    }
}
