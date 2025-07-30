import { ConfigService } from '@nestjs/config';
import { Logger } from '@/common/logger';
import oracledb from 'oracledb';

export const DATABASE_CONNECTION = Symbol('ORACLE_SEQUELIZE_CONNECTION');

export const OracleProvider = {
    provide: DATABASE_CONNECTION,
    useFactory: async (configService: ConfigService<IEnvironmentVariables>) => {
        const user = configService.get<string>('ORACLE_USER');
        const password = configService.get<string>('ORACLE_PWD');
        const oracleServiceName = configService.get<string>('ORACLE_SERVICE_NAME');

        let startTime = Date.now();
        const connection = await oracledb.getConnection({
            user,
            password,
            connectString: oracleServiceName,
        });

        let endTime = Date.now();
        const latency = endTime - startTime;
        Logger.log(`Connected to Oracle DB successfully in ${latency}ms as ${user}`, 'DatabaseModule');

        try {
            startTime = Date.now();
            const result = await connection.execute('SELECT table_name FROM user_tables');
            endTime = Date.now();
            Logger.log(
                `Database connection verified: ${JSON.stringify(result.rows)} (${endTime - startTime}ms)`,
                'DatabaseModule',
            );
        } catch (error) {
            Logger.error(error, 'DatabaseModule');
            throw error;
        }
        return connection;
    },
    inject: [ConfigService],
};
