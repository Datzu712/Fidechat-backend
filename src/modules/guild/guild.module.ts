import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildRepository } from './guild.repository';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    controllers: [GuildController],
    providers: [GuildService, GuildRepository],
    imports: [GatewayModule],
})
export class GuildModule {}
