import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ChannelDto } from './dto/channel.dto';
import { ChannelRepository } from './channel.repository';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';
import { UserRepository } from '../user/user.repository';

@Injectable()
export class ChannelService {
    constructor(
        private readonly channelRepository: ChannelRepository,
        private readonly gateway: GatewayService,
        private readonly userRepository: UserRepository,
    ) {}

    public async createChannel(guildId: string, dto: ChannelDto) {
        try {
            const result = await this.channelRepository.createChannel(guildId, dto);

            const guildMembers = (await this.userRepository.getGuildUsers(guildId))?.map((user) => user.ID) || [];

            this.gateway.emitToUsers(guildMembers, SocketEvents.CHANNEL_CREATE, {
                ...dto,
                id: result.id,
            });

            return result;
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to create channel', { cause: error });
            }
            throw error;
        }
    }

    // public async getChannel(id: string) {
    //     return this.channelRepository.getChannel(id);
    // }

    // public async updateChannel(id: string, dto: Partial<ChannelDto>) {
    //     try {
    //         const result = await this.channelRepository.updateChannel(id, dto);

    //         if (result.success) {
    //             const channel = await this.getChannel(id);
    //             this.gateway.emitToGuild(channel.guildId, SocketEvents.CHANNEL_UPDATED, { id, ...dto });
    //         }

    //         return result;
    //     } catch (error) {
    //         if (!(error instanceof HttpException)) {
    //             throw new InternalServerErrorException('Failed to update channel', { cause: error });
    //         }
    //         throw error;
    //     }
    // }

    // public async deleteChannel(id: string) {
    //     try {
    //         const channel = await this.getChannel(id);
    //         const result = await this.channelRepository.deleteChannel(id);

    //         if (result.success) {
    //             this.gateway.emitToGuild(channel.guildId, SocketEvents.CHANNEL_DELETED, { id });
    //         }

    //         return result;
    //     } catch (error) {
    //         if (!(error instanceof HttpException)) {
    //             throw new InternalServerErrorException('Failed to delete channel', { cause: error });
    //         }
    //         throw error;
    //     }
    // }
}
