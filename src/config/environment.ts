/* eslint-disable @typescript-eslint/no-magic-numbers -- Magic numbers are acceptable in this configuration file because all are just constants */
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}
export class EnvironmentVariables implements IEnvironmentVariables {
    // Keycloak
    @IsString()
    KEYCLOAK_URL: string;

    @IsString()
    KEYCLOAK_REALM: string;

    @IsString()
    KEYCLOAK_CLIENT_ID: string;

    @IsString()
    KEYCLOAK_CLIENT_SECRET: string;

    // Oracle
    @IsString()
    ORACLE_PWD: string;

    @IsNumber()
    @Min(1)
    ORACLE_PORT: number;

    @IsString()
    ORACLE_USER: string;

    @IsString()
    ORACLE_SERVICE_NAME: string;

    @IsString()
    ORACLE_HOST: string;

    // Api
    @IsNumber()
    @Min(1)
    PORT: number;

    @IsEnum(Environment)
    NODE_ENV: Environment;
}
