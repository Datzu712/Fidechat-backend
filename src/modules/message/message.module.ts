import { Module } from '@nestjs/common';
import { MessageController } from './message.controller';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    controllers: [MessageController],
    providers: [MessageService, MessageRepository],
    imports: [GatewayModule],
})
export class MessageModule {}
