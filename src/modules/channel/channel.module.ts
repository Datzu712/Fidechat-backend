import { Module } from '@nestjs/common';
import { ChannelController } from './channel.controller';
import { ChannelService } from './channel.service';
import { ChannelRepository } from './channel.repository';
import { UserRepository } from '../user/user.repository';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    controllers: [ChannelController],
    providers: [ChannelService, ChannelRepository, UserRepository],
    imports: [GatewayModule],
})
export class ChannelModule {}
