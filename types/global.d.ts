declare interface IEnvironmentVariables {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    DB_USER: string;
    DB_PASSWORD: string;
    DB_CONNECTION_STRING: string;
}

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string;
    }
}
