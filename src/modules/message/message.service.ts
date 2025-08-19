import { HttpException, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import { Message, type MessageCreationAttributes, MessageRepository } from './message.repository';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';
import { Channel, ChannelRepository } from '../channel/channel.repository';
import { UserRepository } from '../user/user.repository';
import dayjs from 'dayjs';
import { AICommandService } from '../ai/ai-command.service';

@Injectable()
export class MessageService {
    private readonly logger = new Logger('MessageService');

    constructor(
        private readonly messageRepository: MessageRepository,
        private readonly gateway: GatewayService,
        private readonly channelRepository: ChannelRepository,
        private readonly userRepository: UserRepository,
        private readonly ai: AICommandService,
    ) {}

    private formatDate(date: Date): string {
        return `${dayjs(date).format('YYYY-MM-DDTHH:mm:ss.SSS')}000`;
    }

    private async notifyMessageCreation(
        messageData: MessageCreationAttributes,
        messageId: string,
        guildId: string,
        createdAt: string,
    ): Promise<void> {
        const guildMembers = (await this.userRepository.getGuildUsers(guildId))?.map((user) => user.ID) || [];

        this.gateway.emitToUsers(guildMembers, SocketEvents.MESSAGE_CREATE, {
            id: messageId,
            ...messageData,
            createdAt,
        } satisfies Omit<Message, 'createdAt'> & { createdAt: string });
    }

    async createMessage(data: MessageCreationAttributes) {
        const channel = await this.channelRepository.getChannel(data.channelId);
        if (!channel) {
            throw new NotFoundException('Channel not found');
        }
        const author = await this.userRepository.findById(data.authorId);
        if (!author) throw new NotFoundException('User not found');

        try {
            const createAt = new Date();
            const createdAtStr = this.formatDate(createAt);

            const result = await this.messageRepository.createMessage({
                ...data,
                createdAt: createAt,
            });

            await this.notifyMessageCreation(data, result.id, channel.guildId, createdAtStr);

            if (!author.isBot) {
                void this.handleAIResponse(data, channel);
            }

            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to create message', { cause: error });
            }
            throw error;
        }
    }

    private async handleAIResponse(originalMessage: MessageCreationAttributes, channel: Channel): Promise<void> {
        const targetModel = this.ai.parseAICommand(originalMessage.content);
        if (!targetModel) return;

        this.gateway.startTypingIA(targetModel.botId, channel.id);

        try {
            const iaResponse = await this.ai.processAICommand({
                message: originalMessage.content,
                userId: originalMessage.authorId,
                channelId: originalMessage.channelId,
            });

            if (iaResponse) {
                const createAt = new Date();
                const createdAtStr = this.formatDate(createAt);

                const aiMessage = await this.messageRepository.createMessage({
                    ...iaResponse,
                    createdAt: createAt,
                });

                await this.notifyMessageCreation(iaResponse, aiMessage.id, channel.guildId, createdAtStr);
            }
        } catch (error) {
            this.logger.error('Error processing AI response', error);
        } finally {
            this.gateway.stopTypingIA(targetModel.botId);
        }
    }

    async getMessage(id: string) {
        return this.messageRepository.getMessage(id);
    }

    async updateMessage(id: string, content: string, guildId: string) {
        try {
            const message = await this.getMessage(id);
            if (!message) throw new NotFoundException('Message not found');

            const result = await this.messageRepository.updateMessage(id, content);

            if (result.success) {
                const guildMembers = (await this.userRepository.getGuildUsers(guildId))?.map((user) => user.ID) || [];
                this.gateway.emitToUsers(guildMembers, SocketEvents.MESSAGE_UPDATE, { id, content });
            }

            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to update message', { cause: error });
            }
            throw error;
        }
    }

    async deleteMessage(id: string, guildId: string) {
        try {
            const message = await this.getMessage(id);
            if (!message) throw new NotFoundException('Message not found');

            console.log(message);

            const result = await this.messageRepository.deleteMessage(id);

            if (result.success) {
                const guildMembers = (await this.userRepository.getGuildUsers(guildId))?.map((user) => user.ID) || [];
                this.gateway.emitToUsers(guildMembers, SocketEvents.MESSAGE_DELETE, {
                    id,
                    channelId: message.CHANNEL_ID,
                });
            }

            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to delete message', { cause: error });
            }
            throw error;
        }
    }
}
