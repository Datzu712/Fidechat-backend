import { Module } from '@nestjs/common';
import { GuildController } from './guild.controller';
import { GuildService } from './guild.service';
import { GuildRepository } from './guild.repository';
import { GatewayService } from '../gateway/gateway.service';

@Module({
    controllers: [GuildController],
    providers: [GuildService, GuildRepository, GatewayService],
})
export class GuildModule {}
