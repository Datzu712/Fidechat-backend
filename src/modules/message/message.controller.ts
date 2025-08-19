import { Body, Controller, Param, Post } from '@nestjs/common';
import { AuthenticatedUser } from 'nest-keycloak-connect';
import { MessageService } from './message.service';
import { CreateMessageDto } from './dto/message.dto';
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
        @Body() body: CreateMessageDto,
    ) {
        return this.messageService.createMessage({
            content: body.content,
            channelId,
            authorId: user.sub,
        });
    }

    // @Get()
    // async getChannelMessages(
    //     @Param('channelId') channelId: string,
    //     @Query('limit') limit?: number,
    //     @Query('offset') offset?: number,
    // ) {
    //     return this.messageService.getChannelMessages(channelId, limit, offset);
    // }

    // @Get(':messageId')
    // async getMessage(@Param('messageId') messageId: string) {
    //     return this.messageService.getMessage(messageId);
    // }

    // @Patch(':messageId')
    // async updateMessage(@Param('messageId') messageId: string, @Body() body: UpdateMessageDto) {
    //     return this.messageService.updateMessage(messageId, body.content);
    // }

    // @Delete(':messageId')
    // async deleteMessage(@Param('messageId') messageId: string) {
    //     return this.messageService.deleteMessage(messageId);
    // }
}
