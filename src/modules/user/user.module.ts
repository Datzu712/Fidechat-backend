import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserRepository } from './user.repository';
import { SyncModule } from './currentUser/sync.module';
import { GatewayModule } from '../gateway/gateway.module';

@Module({
    imports: [SyncModule, GatewayModule],
    providers: [UserService, UserRepository],
    exports: [UserService, UserRepository],
})
export class UserModule {}
