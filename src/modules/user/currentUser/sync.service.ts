import { Inject, Injectable } from '@nestjs/common';
import oracledb from 'oracledb';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';
import { Logger } from '@/common/logger';

@Injectable()
export class SyncService {
    private readonly logger = new Logger(SyncService.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly oracle: oracledb.Connection) {}

    async getCurrentUserData(userId: string) {
        const result = await this.oracle.execute<string>(
            ...sql`SELECT pkg_sync_data.fn_get_sync_data(${userId}) AS data  FROM DUAL`,
            {
                fetchInfo: { DATA: { type: oracledb.STRING } },
            },
        );

        try {
            JSON.parse(result.rows![0][0]);
        } catch (error) {
            this.logger.error(error);
        }

        return result.rows![0][0] || null;
    }
}
