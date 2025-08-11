import { Inject, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import type { Connection } from 'oracledb';
import { v4 } from 'uuid';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { GuildDto } from './dto/guild.dto';
import { sql } from '@/database/oracle/query-builder/sql-template';

export interface Guild {
    id: string;
    name: string;
    iconUrl?: string;
    isPublic: boolean;
    ownerId: string;
}

@Injectable()
export class GuildRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Connection) {}

    async createGuild(ownerId: string, dto: GuildDto) {
        const guildId = v4();

        await this.db.execute(
            ...sql`
                BEGIN
                    PKG_GUILD.CREATE_GUILD(${guildId}, ${dto.name}, ${dto.iconUrl}, ${dto.isPublic ? 1 : 0}, ${ownerId});
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
            if (dto.name !== undefined) updateFields.push(`NAME = '${dto.name}'`);
            if (dto.iconUrl !== undefined) updateFields.push(`ICON_URL = '${dto.iconUrl}'`);
            if (dto.isPublic !== undefined) updateFields.push(`IS_PUBLIC = ${dto.isPublic ? 1 : 0}`);

            if (updateFields.length === 0) {
                return { success: true };
            }

            const fieldsString = updateFields.join(', ');

            await this.db.execute(
                `BEGIN
                    PKG_GUILD.UPDATE_GUILD(:id, :fields);
                END;`,
                {
                    id,
                    fields: fieldsString,
                },
            );

            await this.db.commit();

            return { success: true };
        } catch (error) {
            throw new InternalServerErrorException(`Failed to update guild`, { cause: error });
        }
    }
}
