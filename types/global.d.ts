declare interface IEnvironmentVariables {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
    ORACLE_PWD: string;
    ORACLE_PORT: number;
    ORACLE_USER: string;
    ORACLE_SERVICE_NAME: string;
    ORACLE_HOST: string;
}

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string;
    }
}
