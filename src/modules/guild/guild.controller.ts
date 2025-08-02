import { Controller, Get } from '@nestjs/common';

@Controller('guilds')
export class GuildController {
    constructor() {}

    @Get('/')
    public async getGuilds() {
        // This method would typically call a service to fetch guilds
        return [];
    }
}
