import { Module } from '@nestjs/common';
import { DatabaseModule } from './infra/db/db.module';
import { ConfigModule } from './config/config.module';

@Module({
	imports: [DatabaseModule, ConfigModule],
})
export class AppModule {}
