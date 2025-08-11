import { HttpException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { v4 } from 'uuid';

import { GuildDto } from './dto/guild.dto';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';
import { GuildRepository } from './guild.repository';

@Injectable()
export class GuildService {
    constructor(
        private readonly guildRepository: GuildRepository,
        private readonly gateway: GatewayService,
    ) {}

    public async createGuild(ownerId: string, dto: GuildDto) {
        try {
            await this.guildRepository.createGuild(ownerId, dto);

            // eslint-disable-next-line @typescript-eslint/no-misused-spread -- silly rule
            this.gateway.emitToUser(ownerId, SocketEvents.GUILD_CREATED, { ...dto, ownerId, id: v4() });
        } catch (error) {
            if (!(error instanceof HttpException)) {
                throw new InternalServerErrorException('Failed to create guild', { cause: error });
            }
        }
    }
}
