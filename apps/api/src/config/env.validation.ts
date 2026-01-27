import { plainToInstance } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
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
	@IsNumber()
	HTTP_PORT: number;

	@IsEnum(Environment)
	NODE_ENV!: 'development' | 'production' | 'test';
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
