import { Body, Controller, Delete, Get, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { ChannelDto } from './dto/channel.dto';
import { ChannelService } from './channel.service';

@Controller({
    version: '1',
    path: 'guilds/:guildId/channels',
})
export class ChannelController {
    constructor(private readonly channelService: ChannelService) {}

    @Post()
    public async createChannel(
        @Param('guildId') guildId: string,
        @AuthenticatedUser() user: IReqUser,
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
                whitelist: true,
                groups: ['create'],
            }),
        )
        body: Omit<ChannelDto, 'guildId'>,
    ) {
        return this.channelService.createChannel(guildId, body);
    }
}
