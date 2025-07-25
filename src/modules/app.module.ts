import { validateEnv } from '@/common/utils/env.validation';
import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ChannelModule } from './channel/channel.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
        ChannelModule,
    ],
})
export class AppModule {}
