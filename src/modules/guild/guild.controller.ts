import { Body, Controller, Get, Post, ValidationPipe } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { GuildDto } from './dto/guild.dto';
import { GuildService } from './guild.service';

@Controller({
    path: 'guilds',
    version: '1',
})
export class GuildController {
    constructor(private readonly guildService: GuildService) {}

    @Post()
    public async createGuild(
        @AuthenticatedUser() user: IReqUser,
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
                whitelist: true,
                groups: ['create'],
            }),
        )
        body: GuildDto,
    ) {
        return this.guildService.createGuild(user.sub, body);
    }

    @Get('/public')
    public async getPublicGuilds() {
        return this.guildService.getPublicGuilds();
    }
}
