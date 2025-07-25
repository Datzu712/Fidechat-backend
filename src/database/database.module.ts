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
                const user = configService.get<string>('ORACLE_USER');
                const password = configService.get<string>('ORACLE_PWD');
                const oracleServiceName = configService.get<string>('ORACLE_SERVICE_NAME');

                const startTime = Date.now();
                const connection = await oracledb.getConnection({
                    user,
                    password,
                    connectString: `${configService.get<string>('ORACLE_HOST')}:${configService.get<number>('ORACLE_PORT')}/${oracleServiceName}`,
                });
                const endTime = Date.now();

                const latency = endTime - startTime;
                Logger.log(`Connected to Oracle DB successfully in ${latency}ms`, 'DatabaseModule');

                try {
                    const result = await connection.execute('SELECT 1 FROM DUAL');
                    Logger.log(`Database connection verified: ${JSON.stringify(result.rows)}`, 'DatabaseModule');
                } catch (error) {
                    Logger.error(error, 'DatabaseModule');
                    throw error;
                }
                return connection;
            },
            inject: [ConfigService],
        },
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
