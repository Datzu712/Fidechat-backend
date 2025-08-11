import {
    AuthGuard as KeycloakAuthGuard,
    ResourceGuard as KeycloakResourceGuard,
    RoleGuard as KeycloakRoleGuard,
} from 'nest-keycloak-connect';
import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';

import { validateEnv } from '@/common/utils/env.validation';
import { DatabaseModule } from '@/database/database.module';
import { ChannelModule } from './channel/channel.module';
import { KeycloakModule } from './auth/keycloak/keycloak.module';
import { KeycloakSyncInterceptor } from './auth/keycloak/keycloak-sync.interceptor';
import { UserModule } from './user/user.module';
import { GuildModule } from './guild/guild.module';
import { GatewayModule } from './gateway/gateway.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        ChannelModule,
        KeycloakModule,
        GuildModule,
        GatewayModule,
        UserModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: KeycloakAuthGuard,
        },
        {
            provide: APP_GUARD,
            useClass: KeycloakResourceGuard,
        },
        {
            provide: APP_GUARD,
            useClass: KeycloakRoleGuard,
        },
        {
            provide: APP_INTERCEPTOR,
            useClass: KeycloakSyncInterceptor,
        },
    ],
})
export class AppModule {}
