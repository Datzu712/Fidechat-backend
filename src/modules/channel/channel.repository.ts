import { Inject, Injectable, InternalServerErrorException, Logger, NotFoundException } from '@nestjs/common';
import type { Connection, Result, ResultSet } from 'oracledb';
import { v4 } from 'uuid';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { ChannelDto } from './dto/channel.dto';
import { sql } from '@/database/oracle/query-builder/sql-template';

export interface Channel {
    id: string;
    name: string;
    description?: string;
    position: number;
    guildId: string;
}

@Injectable()
export class ChannelRepository {
    private readonly logger = new Logger(ChannelRepository.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Connection) {}

    async createChannel(guildId: string, dto: ChannelDto) {
        try {
            const channelId = v4();

            await this.db.execute(
                ...sql`
                BEGIN
                    PKG_CHANNEL.CREATE_CHANNEL(${channelId}, ${dto.name}, ${dto.description || null}, ${dto.position || 0}, ${guildId});
                END;
            `,
                { autoCommit: true },
            );

            return { id: channelId, success: true };
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException('Failed to create channel');
        }
    }

    async getChannel(id: string): Promise<Channel | null> {
        try {
            const result = await this.db.execute<Result<Channel>>(
                ...sql`
                DECLARE
                    v_cursor SYS_REFCURSOR;
                BEGIN
                    PKG_CHANNEL.GET_CHANNEL(${id}, v_cursor);
                    DBMS_SQL.RETURN_RESULT(v_cursor);
                END;
            `,
                { resultSet: true },
            );

            if (!result.implicitResults || result.implicitResults.length === 0) {
                throw new NotFoundException('Channel not found');
            }

            const rows = await (result.implicitResults[0] as ResultSet<any[]>).getRows(1);

            if (!rows.length) {
                throw new NotFoundException('Channel not found');
            }

            const [channelId, name, description, position, guildId] = rows[0];
            return {
                id: channelId,
                name,
                description,
                position,
                guildId,
            } satisfies Channel;
        } catch (error) {
            this.logger.error(`Failed to get channel with id ${id}:`, error);

            if (error instanceof NotFoundException) {
                throw error;
            }

            // Handle the specific Oracle error codes
            if ((error as { errorNum?: number }).errorNum === 21002) {
                throw new NotFoundException('Channel not found');
            }

            throw new InternalServerErrorException('Failed to get channel');
        }
    }

    // async getGuildChannels(guildId: string) {
    //     try {
    //         const result = await this.db.execute(
    //             `DECLARE
    //                 v_cursor SYS_REFCURSOR;
    //             BEGIN
    //                 PKG_CHANNEL.GET_GUILD_CHANNELS(:guildId, v_cursor);
    //                 :cursor := v_cursor;
    //             END;`,
    //             { guildId },
    //         );

    //         if (!result.rows) {
    //             return [];
    //         }

    //         return result.rows as Channel[];
    //     } catch (error) {
    //         throw new Error(`Failed to get guild channels`, { cause: error });
    //     }
    // }

    // async getChannel(id: string) {
    //     try {
    //         const result = await this.db.execute(
    //             `DECLARE
    //                 v_cursor SYS_REFCURSOR;
    //             BEGIN
    //                 PKG_CHANNEL.GET_CHANNEL(:id, v_cursor);
    //                 :cursor := v_cursor;
    //             END;`,
    //             { id },
    //         );

    //         if (!result.rows?.[0]) {
    //             throw new NotFoundException('Channel not found');
    //         }

    //         return result.rows[0] as Channel;
    //     } catch (error) {
    //         if (error instanceof NotFoundException) throw error;
    //         throw new Error(`Failed to get channel`, { cause: error });
    //     }
    // }

    // async updateChannel(id: string, dto: Partial<ChannelDto>) {
    //     try {
    //         const updateFields = [];
    //         if (dto.name !== undefined) updateFields.push(`NAME = '${dto.name}'`);
    //         if (dto.description !== undefined) updateFields.push(`DESCRIPTION = '${dto.description}'`);
    //         if (dto.position !== undefined) updateFields.push(`POSITION = ${dto.position}`);

    //         if (updateFields.length === 0) {
    //             return { success: true };
    //         }

    //         const fieldsString = updateFields.join(', ');

    //         await this.db.execute(
    //             `BEGIN
    //                 PKG_CHANNEL.UPDATE_CHANNEL(:id, :fields);
    //             END;`,
    //             {
    //                 id,
    //                 fields: fieldsString,
    //             },
    //             { autoCommit: true },
    //         );

    //         return { success: true };
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to update channel`, { cause: error });
    //     }
    // }

    // async deleteChannel(id: string) {
    //     try {
    //         await this.db.execute(
    //             `BEGIN
    //                 PKG_CHANNEL.DELETE_CHANNEL(:id);
    //             END;`,
    //             { id },
    //             { autoCommit: true },
    //         );

    //         return { success: true };
    //     } catch (error) {
    //         throw new InternalServerErrorException(`Failed to delete channel`, { cause: error });
    //     }
    // }
}
