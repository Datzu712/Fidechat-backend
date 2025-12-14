import { IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}
export class EnvironmentVariables implements IEnvironmentVariables {
    DEFAULT_GUILD_ID?: string | undefined;
    KEYCLOAK_ADMIN!: string;
    KEYCLOAK_ADMIN_PASSWORD!: string;

    @IsString()
    CORS_ORIGIN!: string;

    // Keycloak
    @IsString()
    KEYCLOAK_URL!: string;

    @IsString()
    KEYCLOAK_REALM!: string;

    @IsString()
    KEYCLOAK_CLIENT_ID!: string;

    @IsString()
    KEYCLOAK_CLIENT_SECRET!: string;

    // Oracle
    @IsString()
    ORACLE_PWD!: string;

    @IsNumber()
    @Min(1)
    ORACLE_PORT!: number;

    @IsString()
    ORACLE_USER!: string;

    @IsString()
    ORACLE_SERVICE_NAME!: string;

    @IsString()
    ORACLE_HOST!: string;

    // Api
    @IsNumber()
    @Min(1)
    API_PORT!: number;

    @IsEnum(Environment)
    NODE_ENV!: Environment;

    @IsString()
    @IsOptional()
    SOCKET_NAMESPACE?: string | undefined;

    @IsString()
    PUBLIC_KEYCLOAK_URL!: string;

    @IsString()
    OPENAI_API_KEY!: string;
}
