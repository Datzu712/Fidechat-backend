import { EnvironmentVariables } from '@/config/environment';
import { plainToInstance } from 'class-transformer';
import { validateSync, type ValidatorOptions } from 'class-validator';

export function validateEnv(config: Record<string, unknown>) {
    const validatedConfig = plainToInstance(EnvironmentVariables, config, {
        enableImplicitConversion: true,
    });
    const errors = validateSync(validatedConfig, {
        skipMissingProperties: false,
        whitelist: true,
    } satisfies ValidatorOptions);

    if (errors.length) {
        throw new Error(errors.toString());
    }

    return validatedConfig;
}
