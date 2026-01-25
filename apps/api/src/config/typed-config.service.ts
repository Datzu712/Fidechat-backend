import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import type { IEnvironmentVariables } from './env';

@Injectable()
export class TypedConfigService {
    constructor(private configService: ConfigService<IEnvironmentVariables, true>) {}

    get<K extends keyof IEnvironmentVariables>(key: K): IEnvironmentVariables[K];
    get<K extends keyof IEnvironmentVariables, D>(key: K, defaultValue: D): NonNullable<IEnvironmentVariables[K]> | D;
    get<K extends keyof IEnvironmentVariables, D>(key: K, defaultValue?: D): IEnvironmentVariables[K] | D {
        const value = this.configService.get(key, { infer: true });

        return value ?? (defaultValue as D);
    }

    getOrThrow<K extends keyof IEnvironmentVariables>(key: K): NonNullable<IEnvironmentVariables[K]> {
        return this.configService.getOrThrow(key, { infer: true });
    }
}
