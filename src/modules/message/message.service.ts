import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { type MessageCreationAttributes, MessageRepository } from './message.repository';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';
import { ChannelRepository } from '../channel/channel.repository';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class MessageService {
    private readonly logger = new Logger(MessageService.name);

    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly gateway: GatewayService,
        private readonly channelRepository: ChannelRepository,
        private readonly userRepository: UserRepository,
    ) {}

    async createMessage(data: MessageCreationAttributes) {
        const channel = await this.channelRepository.getChannel(data.channelId);
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }

        try {
            const result = await this.messageRepository.createMessage(data);
            const guildMembers =
                (await this.userRepository.getGuildUsers(channel.guildId))?.map((user) => user.ID) || [];

            this.gateway.emitToUsers(guildMembers, SocketEvents.MESSAGE_CREATE, {
                id: result.id,
                ...data,
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
