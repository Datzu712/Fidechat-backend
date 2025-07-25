import { Module } from '@nestjs/common';
import { KeycloakConnectModule } from 'nest-keycloak-connect';
import { KeycloakConfig } from './keycloak.config';
import { ConfigService } from '@nestjs/config';

@Module({
    imports: [
        KeycloakConnectModule.registerAsync({
            useClass: KeycloakConfig,
        }),
    ],
    providers: [ConfigService],
    exports: [KeycloakConnectModule],
})
export class KeycloakModule {}
