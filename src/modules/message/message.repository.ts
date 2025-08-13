import { Inject, Injectable, Logger } from '@nestjs/common';
import { Connection } from 'oracledb';
import { v4 } from 'uuid';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';

export interface Message {
    id: string;
    content: string;
    authorId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
    authorUsername?: string;
    authorAvatar?: string;
}

@Injectable()
export class MessageRepository {
    private readonly logger = new Logger(MessageRepository.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly db: Connection) {}

    async createMessage(channelId: string, authorId: string, content: string) {
        try {
            const id = v4();
            await this.db.execute(
                `BEGIN
                    PKG_MESSAGES.CREATE_MESSAGE(:id, :content, :authorId, :channelId);
                END;`,
                { id, content, authorId, channelId },
                { autoCommit: true },
            );

            return { id };
        } catch (error) {
            throw new Error(`Failed to create message`, { cause: error });
        }
    }

    // async getChannelMessages(channelId: string, limit = 50, offset = 0) {
    //     try {
    //         const result = await this.db.execute(
    //             `DECLARE
    //                 v_cursor SYS_REFCURSOR;
    //             BEGIN
    //                 PKG_MESSAGES.GET_CHANNEL_MESSAGES(:channelId, :limit, :offset, v_cursor);
    //                 :cursor := v_cursor;
    //             END;`,
    //             { channelId, limit, offset },
    //         );

    //         if (!result.rows) {
    //             return [];
    //         }

    //         return result.rows as Message[];
    //     } catch (error) {
    //         throw new Error(`Failed to get channel messages`, { cause: error });
    //     }
    // }

    // async updateMessage(id: string, content: string) {
    //     try {
    //         await this.db.execute(
    //             `BEGIN
    //                 PKG_MESSAGES.UPDATE_MESSAGE(:id, :content);
    //             END;`,
    //             { id, content },
    //             { autoCommit: true },
    //         );

    //         return { success: true };
    //     } catch (error) {
    //         throw new Error(`Failed to update message`, { cause: error });
    //     }
    // }

    // async deleteMessage(id: string) {
    //     try {
    //         await this.db.execute(
    //             `BEGIN
    //                 PKG_MESSAGES.DELETE_MESSAGE(:id);
    //             END;`,
    //             { id },
    //             { autoCommit: true },
    //         );

    //         return { success: true };
    //     } catch (error) {
    //         throw new Error(`Failed to delete message`, { cause: error });
    //     }
    // }
}
