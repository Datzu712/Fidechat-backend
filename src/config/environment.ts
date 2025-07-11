/* eslint-disable @typescript-eslint/no-magic-numbers -- Magic numbers are acceptable in this configuration file because all are just constants */
import { IsEnum, IsNumber, Min } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}
export class EnvironmentVariables implements IEnvironmentVariables {
    @IsNumber()
    @Min(1)
    PORT: number;

    @IsEnum(Environment)
    NODE_ENV: Environment;
}
