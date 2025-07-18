import './instrumentation';

import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { VersioningType } from '@nestjs/common';
import helmet from '@fastify/helmet';
import compression from '@fastify/compress';
import fastifyCSRF from '@fastify/csrf-protection';
import Fastify from 'fastify';

import { Logger } from './common/logger/logger.service';
import { AppModule } from './modules/app.module';
import { requestLogger } from '@/common/logger/request.logger';
// import { IoAdapter } from '@nestjs/platform-socket.io';

const logger = new Logger('Fidechat', {
    logLevels: ['debug', 'error', 'warn', 'verbose', 'log'],
    folderPath: './logs',
    allowConsole: ['warn', 'error', 'log', 'debug'],
    allowWriteFiles: true,
    outputTemplate: '{timestamp} - {level} {context} {message}',
    indents: {
        level: 7,
        context: 22,
    },
});

async function bootstrap() {
    const fastifyInstance = Fastify();
    fastifyInstance.addHook('onSend', async (req, reply, payload) => {
        requestLogger(req, reply, payload);
    });

    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- just to shut up the silly type checker
        new FastifyAdapter(fastifyInstance as any),
        {
            logger,
        },
    );

    void app.register(helmet);
    void app.register(compression);
    void app.register(fastifyCSRF);

    //app.useWebSocketAdapter(new IoAdapter(app));
    app.enableVersioning({
        type: VersioningType.URI,
    });
    app.enableShutdownHooks();
    app.enableCors({
        credentials: true,
        //origin: process.env.CORS_ORIGIN,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    });
    app.setGlobalPrefix('api');

    await app.listen(process.env.port || 3000);

    logger.log(
        `Application is running on: ${await app.getUrl()} as ${process.env.NODE_ENV} environment. (CORS: ${process.env.CORS_ORIGIN})`,
    );
}
void bootstrap();
