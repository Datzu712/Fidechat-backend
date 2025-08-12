import { Inject, Injectable, Logger } from '@nestjs/common';
import oracledb from 'oracledb';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';
import { AppUser } from '@/database/oracle/types/user';

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);

    constructor(@Inject(DATABASE_CONNECTION) private readonly oracle: oracledb.Connection) {}

    async findById(id: string) {
        const result = await this.oracle.execute(...sql`SELECT * FROM APP_USER WHERE id = ${id}`);
        return result.rows?.[0];
    }

    // todo change update and insert to upsert
    async update(id: string, username: string, email: string, avatarUrl: string | null = null) {
        return this.oracle.execute(
            ...sql`
                UPDATE APP_USER
                    SET username = ${username}, email = ${email}, AVATAR_URL = ${avatarUrl}
                WHERE id = ${id}
            `,
            { autoCommit: true },
        );
    }

    async insert(id: string, username: string, email: string, avatarUrl: string | null = null) {
        if (avatarUrl) {
            return this.oracle.execute(
                ...sql`
                INSERT INTO APP_USER (id, username, email, avatar_url)
                VALUES (${id}, ${username}, ${email}, ${avatarUrl})
            `,
                { autoCommit: true },
            );
        } else {
            return this.oracle.execute(
                ...sql`
                INSERT INTO APP_USER (id, username, email)
                VALUES (${id}, ${username}, ${email})
            `,
                { autoCommit: true },
            );
        }
    }

    /**
     * Retrieves all users that belong to a specific guild from the database.
     *
     * @param guildId - The unique identifier of the guild
     * @returns Promise<AppUser[]> - A promise that resolves to an array of AppUser objects
     * @throws {Error} - If there's an error executing the database procedure
     *
     * @remarks
     * This method executes the stored procedure 'sp_get_guild_users' which returns a SYS_REFCURSOR
     * containing the guild users' information.
     */
    async getGuildUsers(guildId: string): Promise<UppercaseKeys<AppUser>[] | undefined> {
        try {
            const result = await this.oracle.execute(
                `BEGIN sp_get_guild_users(:p_guild_id, :p_rc); END;`,
                {
                    p_guild_id: guildId,
                    p_rc: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const cur = (result.outBinds as { p_rc: oracledb.ResultSet<UppercaseKeys<AppUser>> }).p_rc; // ResultSet del SYS_REFCURSOR

            const allRows = await cur.getRows();

            await cur.close();
            return allRows;
        } catch (error) {
            this.logger.error(error);
        }
    }
}
