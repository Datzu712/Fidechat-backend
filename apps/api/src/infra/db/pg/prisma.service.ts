import { TypedConfigService } from '@/config/typed-config.service';
import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
	constructor(configService: TypedConfigService) {
		const adapter = new PrismaPg({
			connectionString: configService.getOrThrow('DATABASE_URL'),
		});

		super({ adapter });
	}

	async onModuleInit(): Promise<void> {
		await this.$connect();
	}
}
