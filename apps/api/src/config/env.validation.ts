import { plainToInstance } from 'class-transformer';
import {
    IsEnum,
    IsNumber,
    IsOptional,
    IsString,
    IsUrl,
    MinLength,
    validateSync,
    ValidatorOptions,
} from 'class-validator';
import { IEnvironmentVariables } from './env';

enum Environment {
    Development = 'development',
    Production = 'production',
    Test = 'test',
}

class EnvironmentVariables implements IEnvironmentVariables {
    @IsEnum(Environment)
    NODE_ENV!: 'development' | 'production' | 'test';

    @IsString()
    @MinLength(1)
    DATABASE_URL!: string;

    @IsOptional()
    @IsNumber()
    HTTP_PORT?: number | undefined;

    @IsUrl({ require_tld: false })
    KEYCLOAK_BASE_URL!: string;

    @IsString()
    @MinLength(1)
    KEYCLOAK_ADMIN_USERNAME!: string;

    @IsString()
    @MinLength(1)
    KEYCLOAK_ADMIN_PASSWORD!: string;

    @IsString()
    @MinLength(1)
    KEYCLOAK_REALM!: string;
}

export function validateEnv(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
        whitelist: true,
    } as ValidatorOptions);

    if (errors.length > 0) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
