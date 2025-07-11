import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import oracledb from 'oracledb';
import { Logger } from '@/common/logger';

export const DATABASE_CONNECTION = 'DATABASE_CONNECTION';

@Global()
@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: async (configService: ConfigService<IEnvironmentVariables>) => {
                const user = configService.get<string>('DB_USER');
                const password = configService.get<string>('DB_PASSWORD');
                const connectString = configService.get<string>('DB_CONNECTION_STRING');

                const startTime = Date.now(); // Start measuring time
                const connection = await oracledb.getConnection({
                    user,
                    password,
                    connectString,
                });
                const endTime = Date.now();

                const latency = endTime - startTime;
                Logger.log(`Connected to Oracle DB successfully in ${latency}ms`, 'DatabaseModule');
                return connection;
            },
            inject: [ConfigService],
        },
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
