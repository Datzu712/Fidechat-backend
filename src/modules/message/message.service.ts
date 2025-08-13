import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { MessageRepository } from './message.repository';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';

@Injectable()
export class MessageService {
    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly gateway: GatewayService,
    ) {}

    async createMessage(channelId: string, authorId: string, content: string) {
        try {
            const result = await this.messageRepository.createMessage(channelId, authorId, content);

            this.gateway.emitToChannel(channelId, SocketEvents.MESSAGE_CREATE, {
                id: result.id,
                content,
                authorId,
                channelId,
                createdAt: new Date(),
            });

            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to create message', { cause: error });
            }
            throw error;
        }
    }

    // async getMessage(id: string) {
    //     return this.messageRepository.getMessage(id);
    // }

    // async getChannelMessages(channelId: string, limit?: number, offset?: number) {
    //     try {
    //         return await this.messageRepository.getChannelMessages(channelId, limit, offset);
    //     } catch (error) {
    //         if (!(error instanceof HttpException)) {
    //             throw new InternalServerErrorException('Failed to get channel messages', { cause: error });
    //         }
    //         throw error;
    //     }
    // }

    // async updateMessage(id: string, content: string) {
    //     try {
    //         const message = await this.getMessage(id);
    //         const result = await this.messageRepository.updateMessage(id, content);

    //         if (result.success) {
    //             this.gateway.emitToChannel(message.channelId, 'messageUpdate', { id, content });
    //         }

    //         return result;
    //     } catch (error) {
    //         if (!(error instanceof HttpException)) {
    //             throw new InternalServerErrorException('Failed to update message', { cause: error });
    //         }
    //         throw error;
    //     }
    // }

    // async deleteMessage(id: string) {
    //     try {
    //         const message = await this.getMessage(id);
    //         const result = await this.messageRepository.deleteMessage(id);

    //         if (result.success) {
    //             this.gateway.emitToChannel(message.channelId, 'messageDelete', { id });
    //         }

    //         return result;
    //     } catch (error) {
    //         if (!(error instanceof HttpException)) {
    //             throw new InternalServerErrorException('Failed to delete message', { cause: error });
    //         }
    //         throw error;
    //     }
    // }
}
