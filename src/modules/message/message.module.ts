import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { GatewayModule } from '../gateway/gateway.module';
import { ChannelModule } from '../channel/channel.module';
import { UserModule } from '../user/user.module';
import { AIModule } from '../ai/ai.module';

@Module({
    controllers: [MessageController],
    providers: [MessageService, MessageRepository],
    imports: [GatewayModule, ChannelModule, UserModule, AIModule],
    exports: [MessageService],
})
export class MessageModule {}
