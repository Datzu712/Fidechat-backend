import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import oracledb from 'oracledb';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';
import { Logger } from '@/common/logger';
import { GatewayService } from '@/modules/gateway/gateway.service';

@Injectable()
export class SyncRepository {
    private readonly logger = new Logger(SyncRepository.name);

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly oracle: oracledb.Connection,
        private readonly gateway: GatewayService,
    ) {}

    async getCurrentUserData(userId: string) {
        const result = await this.oracle.execute<string>(
            ...sql`SELECT pkg_sync_data.fn_get_sync_data(${userId}) AS data  FROM DUAL`,
            {
                fetchInfo: { DATA: { type: oracledb.STRING } },
            },
        );

        const data = result.rows![0][0] || null;
        if (!data) {
            this.logger.warn(`No sync data found for user ${userId}`);
            throw new BadRequestException('No sync data found for user');
        }

        try {
            const parsedData = JSON.parse(data);

            parsedData['connectedUsers'] = this.gateway.activeUsers;

            return parsedData;
        } catch (error) {
            this.logger.error(error);

            throw new InternalServerErrorException('Failed to parse sync data for user');
        }
    }
}
