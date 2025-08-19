import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './sync.repository';
import { GatewayModule } from '@/modules/gateway/gateway.module';

@Module({
    controllers: [SyncController],
    providers: [SyncService, SyncRepository],
    imports: [GatewayModule],
})
export class SyncModule {}
