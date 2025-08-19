import { Module } from '@nestjs/common';
import { AICommandService } from './ai-command.service';
import { UserModule } from '../user/user.module';

@Module({
    imports: [UserModule],
    providers: [AICommandService],
    exports: [AICommandService],
})
export class AIModule {}
