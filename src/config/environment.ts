/* eslint-disable @typescript-eslint/no-magic-numbers -- Magic numbers are acceptable in this configuration file because all are just constants */
import { IsEnum, IsNumber, IsString, Min } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}
export class EnvironmentVariables implements IEnvironmentVariables {
    @IsString()
    DB_USER: string;

    @IsString()
    DB_PASSWORD: string;

    @IsString()
    DB_CONNECTION_STRING: string;
    @IsNumber()
    @Min(1)
    PORT: number;

    @IsEnum(Environment)
    NODE_ENV: Environment;
}
