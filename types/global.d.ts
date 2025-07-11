declare interface IEnvironmentVariables {
    NODE_ENV: 'development' | 'production' | 'test';
    PORT: number;
}

declare namespace NodeJS {
    export interface ProcessEnv extends IEnvironmentVariables {
        TZ?: string;
    }
}
