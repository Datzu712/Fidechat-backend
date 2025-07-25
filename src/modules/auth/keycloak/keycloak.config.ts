import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { KeycloakConnectOptions, KeycloakConnectOptionsFactory } from 'nest-keycloak-connect';

@Injectable()
export class KeycloakConfig implements KeycloakConnectOptionsFactory {
    constructor(private readonly config: ConfigService<IEnvironmentVariables>) {}

    createKeycloakConnectOptions(): KeycloakConnectOptions {
        return {
            authServerUrl: this.config.getOrThrow('KEYCLOAK_URL'),
            realm: this.config.getOrThrow('KEYCLOAK_REALM'),
            clientId: this.config.getOrThrow('KEYCLOAK_CLIENT_ID'),
            secret: this.config.getOrThrow('KEYCLOAK_CLIENT_SECRET'),
        };
    }
}
