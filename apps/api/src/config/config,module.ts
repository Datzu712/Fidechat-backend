import { Global, Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';

import { validateEnv } from './env.validation';
import { TypedConfigService } from './typed-config.service';

@Global()
@Module({
    imports: [
        NestConfigModule.forRoot({
            envFilePath: ['.env', '.development.env'],
            validate: validateEnv,
            isGlobal: true,
            cache: process.env.NODE_ENV === 'production',
            expandVariables: true,
        }),
    ],
    providers: [TypedConfigService],
    exports: [TypedConfigService],
})
export class ConfigModule {}
