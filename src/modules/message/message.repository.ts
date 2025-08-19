import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import oracledb, { Connection } from 'oracledb';
import { v4 } from 'uuid';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';

export interface Message {
    id: string;
    content: string;
    authorId: string;
    channelId: string;
    createdAt: Date;
}

export interface RefMessageDatabase {
    ID: string;
    CONTENT: string;
    AUTHOR_ID: string;
    CHANNEL_ID: string;
    CREATED_AT: Date;
}

export type MessageCreationAttributes = Omit<Message, 'id'>;

@Injectable()
export class MessageRepository {
    private readonly logger = new Logger(MessageRepository.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Connection) {}

    async createMessage({ channelId, authorId, content, createdAt }: MessageCreationAttributes) {
        try {
            const id = v4();
            await this.db.execute(
                ...sql`BEGIN
                    PKG_MESSAGES.CREATE_MESSAGE(${id}, ${content}, ${authorId}, ${channelId}, ${createdAt});
                END;`,
                { autoCommit: true },
            );

            return { id };
        } catch (error) {
            this.logger.error(error);
            throw new Error(`Failed to create message`, { cause: error });
        }
    }

    async getMessage(id: string): Promise<UppercaseKeys<RefMessageDatabase> | null> {
        try {
            const result = await this.db.execute<{ cursor: oracledb.ResultSet<UppercaseKeys<RefMessageDatabase>> }>(
                `DECLARE
                    v_cursor SYS_REFCURSOR;
                BEGIN
                    PKG_MESSAGES.GET_MESSAGE(:id, :cursor);
                END;`,
                {
                    id,
                    cursor: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const cursor = result.outBinds?.cursor;
            const rows = await cursor?.getRows(1);
            await cursor?.close();

            if (!rows?.length) {
                return null;
            }

            return rows[0];
        } catch (error) {
            this.logger.error(error);
            throw new InternalServerErrorException(`Failed to get message`, { cause: error });
        }
    }

    async updateMessage(id: string, content: string) {
        try {
            await this.db.execute(
                ...sql`
                    BEGIN
                        PKG_MESSAGES.UPDATE_MESSAGE(${id}, ${content});
                    END;
                `,
                { autoCommit: true },
            );

            return { success: true };
        } catch (error) {
            throw new Error(`Failed to update message`, { cause: error });
        }
    }

    async deleteMessage(id: string) {
        try {
            await this.db.execute(
                `BEGIN
                    PKG_MESSAGES.DELETE_MESSAGE(:id);
                END;`,
                { id },
                { autoCommit: true },
            );

            return { success: true };
        } catch (error) {
            throw new Error(`Failed to delete message`, { cause: error });
        }
    }
}
