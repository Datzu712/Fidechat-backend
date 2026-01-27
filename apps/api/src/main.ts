import 'dotenv/config';

import { Logger, ValidationPipe } from '@nestjs/common';
import {
	FastifyAdapter,
	type NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { TypedConfigService } from './config/typed-config.service';

async function bootstrap() {
	const app = await NestFactory.create<NestFastifyApplication>(
		AppModule,
		new FastifyAdapter(),
	);
	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
		}),
	);
	app.setGlobalPrefix('api');
	app.enableVersioning();

	const configService = app.get(TypedConfigService);

	const port = configService.get('HTTP_PORT', 3000);
	await app.listen();
	Logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}

void bootstrap();
