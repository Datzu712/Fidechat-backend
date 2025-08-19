import { Inject, Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import oracledb from 'oracledb';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';
import { AppUser } from '@/database/oracle/types/user';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UserRepository {
    private readonly logger = new Logger(UserRepository.name);
    public DEFAULT_GUILD_ID!: string;

    constructor(
        @Inject(DATABASE_CONNECTION) private readonly oracle: oracledb.Connection,
        private readonly config: ConfigService<IEnvironmentVariables>,
    ) {
        this.DEFAULT_GUILD_ID = this.config.getOrThrow('DEFAULT_GUILD_ID');
    }

    async findById(id: string) {
        const result = await this.oracle.execute<AppUser>(...sql`SELECT * FROM APP_USER WHERE id = ${id}`);
        return result.rows?.[0];
    }
    async upsertUser(user: {
        id: string;
        username: string;
        email: string;
        avatarUrl?: string | null;
        defaultGuildId?: string;
    }) {
        const sqlBindings = sql`
            BEGIN 
                PKG_USER.SP_UPSERT_USER(
                    ${user.id}, 
                    ${user.username}, 
                    ${user.email}, 
                    ${user.avatarUrl ?? null}, 
                    ${this.DEFAULT_GUILD_ID}, 
                    :was_added_to_guild, 
                    :guild_id
                ); 
            END;
        `;
        try {
            const result = await this.oracle.execute<{
                was_added_to_guild: number;
                guild_id: string | null;
            }>(
                sqlBindings[0],
                Object.assign(
                    {
                        was_added_to_guild: { dir: oracledb.BIND_OUT, type: oracledb.NUMBER },
                        guild_id: { dir: oracledb.BIND_OUT, type: oracledb.STRING },
                    },
                    sqlBindings[1],
                ),
                {
                    autoCommit: true,
                },
            );

            return {
                wasAddedToGuild: result.outBinds!.was_added_to_guild === 1,
                guildId: result.outBinds!.guild_id,
            };
        } catch (error) {
            this.logger.error('Error in upsertUser:', error);
            throw error;
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
    async getGuildUsers(guildId: string): Promise<Array<UppercaseKeys<AppUser>> | undefined> {
        try {
            const result = await this.oracle.execute<{ p_rc: oracledb.ResultSet<UppercaseKeys<AppUser>> }>(
                `BEGIN sp_get_guild_users(:p_guild_id, :p_rc); END;`,
                {
                    p_guild_id: guildId,
                    p_rc: { dir: oracledb.BIND_OUT, type: oracledb.CURSOR },
                },
                { outFormat: oracledb.OUT_FORMAT_OBJECT },
            );

            const cur = result.outBinds!.p_rc;
            const allRows = await cur.getRows();

            await cur.close();
            return allRows;
        } catch (error) {
            this.logger.error(error);

            throw new InternalServerErrorException('Failed to get guild users', { cause: error });
        }
    }
}
