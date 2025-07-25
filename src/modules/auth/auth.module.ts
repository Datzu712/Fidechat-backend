import { Module } from '@nestjs/common';
import { KeycloakModule } from './keycloak/keycloak.module';

@Module({
    imports: [KeycloakModule],
})
export class AuthModule {}
