import { Controller, Get } from '@nestjs/common';
@Controller({
    version: '1',
    path: 'channels',
})
export class ChannelController {
    @Get()
    getChannels() {
        return 'List of channels';
    }
}
