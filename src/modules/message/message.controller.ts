import { Body, Controller, Delete, Param, Patch, Post, ValidationPipe } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { MessageService } from './message.service';
import { MessageDto } from './dto/message.dto';
@Controller({
    version: '1',
    path: 'guilds/:guildId/channels/:channelId/messages',
})
export class MessageController {
    constructor(private readonly messageService: MessageService) {}

    @Post()
    async createMessage(
        @Param('channelId') channelId: string,
        @AuthenticatedUser() user: IReqUser,
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
                whitelist: true,
                groups: ['create'],
            }),
        )
        body: MessageDto,
    ) {
        return this.messageService.createMessage({
            content: body.content,
            channelId,
            authorId: user.sub,
        });
    }

    @Patch(':messageId')
    async updateMessage(
        @Param('messageId') messageId: string,
        @Param('guildId') guildId: string,
        @Body(
            new ValidationPipe({
                transform: true,
                transformOptions: { enableImplicitConversion: true },
                whitelist: true,
                groups: ['update'],
            }),
        )
        body: MessageDto,
    ) {
        return this.messageService.updateMessage(messageId, body.content, guildId);
    }

    @Delete(':messageId')
    async deleteMessage(@Param('messageId') messageId: string, @Param('guildId') guildId: string) {
        return this.messageService.deleteMessage(messageId, guildId);
    }
}
