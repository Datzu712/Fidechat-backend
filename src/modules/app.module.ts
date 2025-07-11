import { validateEnv } from '@/common/utils/env.validation';
import { DatabaseModule } from '@/database/database.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            validate: validateEnv,
        }),
        DatabaseModule,
    ],
})
export class AppModule {}
