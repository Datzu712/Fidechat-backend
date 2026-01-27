import { Module } from '@nestjs/common';
import { PrismaService } from './pg/prisma.service';

@Module({
	providers: [PrismaService],
	exports: [PrismaService],
})
export class DatabaseModule {}
