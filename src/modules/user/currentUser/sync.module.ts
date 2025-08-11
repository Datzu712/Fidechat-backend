import { Module } from '@nestjs/common';
import { SyncController } from './sync.controller';
import { SyncService } from './sync.service';
import { SyncRepository } from './sync.repository';

@Module({
    controllers: [SyncController],
    providers: [SyncService, SyncRepository],
})
export class SyncModule {}
