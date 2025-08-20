import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import oracledb, { type Connection } from 'oracledb';
import { v4 } from 'uuid';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { GuildDto } from './dto/guild.dto';
import { sql } from '@/database/oracle/query-builder/sql-template';
import { Logger } from '@/common/logger';

export interface Guild {
    id: string;
    name: string;
    iconUrl?: string;
    isPublic: boolean;
    ownerId: string;
}

export interface RefGuildDB {
    ID: string;
    NAME: string;
    ICON_URL?: string;
    IS_PUBLIC: boolean;
    OWNER_ID: string;
}

@Injectable()
export class GuildRepository {
    private readonly logger = new Logger(GuildRepository.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Connection) {}

    async createGuild(ownerId: string, dto: GuildDto) {
        const guildId = v4();

        await this.db.execute(
            ...sql`
                BEGIN
                    PKG_GUILD.CREATE_GUILD(${guildId}, ${dto.name}, ${dto.iconUrl || null}, ${dto.isPublic ? 1 : 0}, ${ownerId});
                END;
                `,
        );

        await this.db.commit();

        return { success: true };
    }

    async getGuild(id: string) {
        try {
            const result = await this.db.execute(
                `DECLARE
                    v_cursor SYS_REFCURSOR;
                BEGIN
                    PKG_GUILD.GET_GUILD(:id, v_cursor);
                    :cursor := v_cursor;
                END;`,
                { id },
            );

            console.log(result);

            if (!result.rows?.[0]) {
                throw new NotFoundException('Guild not found');
            }

            return result.rows[0];
        } catch (error) {
            if (error instanceof NotFoundException) throw error;
            throw new Error(`Failed to get guild`, { cause: error });
        }
    }

    async updateGuild(id: string, dto: GuildDto) {
        try {
            const updateFields = [];
            if (dto.name) updateFields.push(`NAME = '${dto.name}'`);
            if (dto.iconUrl) updateFields.push(`ICON_URL = '${dto.iconUrl}'`);
            updateFields.push(`IS_PUBLIC = ${dto.isPublic ? 1 : 0}`);

            if (updateFields.length === 0) {
                return { success: true };
            }

            const fieldsString = updateFields.join(', ');

            await this.db.execute(
                ...sql`BEGIN
                    PKG_GUILD.UPDATE_GUILD(${id}, ${fieldsString});
                END;`,
            );

            await this.db.commit();

            return { success: true };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to update guild`, { cause: error });
        }
    }

    async getPublicGuilds(): Promise<Guild[]> {
        try {
            const result = await this.db.execute<{ cursor: oracledb.ResultSet<RefGuildDB> }>(
                `DECLARE
                    v_cursor SYS_REFCURSOR;
                BEGIN
                    PKG_GUILD.GET_PUBLIC_GUILDS(:cursor);
                END;
            `,
                {
                    cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const cursor = result.outBinds?.cursor;
            const rows = await cursor?.getRows();
            await cursor?.close();

            if (!rows?.length) {
                return [];
            }

            return rows.map((row) => ({
                id: row.ID,
                name: row.NAME,
                iconUrl: row.ICON_URL,
                isPublic: row.IS_PUBLIC,
                ownerId: row.OWNER_ID,
            }));
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException('Failed to get public guilds', { cause: error });
        }
    }
}
