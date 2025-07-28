import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Sequelize } from 'sequelize';
import { Logger } from '@/common/logger';

export const DATABASE_CONNECTION = 'ORACLE_SEQUELIZE_CONNECTION';

@Global()
@Module({
    providers: [
        {
            provide: DATABASE_CONNECTION,
            useFactory: async (configService: ConfigService<IEnvironmentVariables>) => {
                const user = configService.get<string>('ORACLE_USER');
                const password = configService.get<string>('ORACLE_PWD');
                const oracleServiceName = configService.get<string>('ORACLE_SERVICE_NAME');

                const sequelize = new Sequelize({
                    dialect: 'oracle',
                    host: configService.get<string>('ORACLE_HOST'),
                    port: configService.get<number>('ORACLE_PORT'),
                    username: user,
                    password,
                    database: oracleServiceName,
                    logging: false,
                });
                const startTime = Date.now();

                await sequelize.authenticate();
                const endTime = Date.now();

                const latency = endTime - startTime;
                Logger.log(`Connected to Oracle DB successfully in ${latency}ms as ${user}`, 'DatabaseModule');

                try {
                    const [result] = await sequelize.query('SELECT table_name FROM user_tables');
                    Logger.log(`Database connection verified: ${JSON.stringify(result)}`, 'DatabaseModule');
                } catch (error) {
                    Logger.error(error, 'DatabaseModule');
                    throw error;
                }
                return sequelize;
            },
            inject: [ConfigService],
        },
    ],
    exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
