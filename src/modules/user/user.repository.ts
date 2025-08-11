import { Inject, Injectable } from '@nestjs/common';
import type { Connection } from 'oracledb';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';

@Injectable()
export class UserRepository {
    constructor(@Inject(DATABASE_CONNECTION) private readonly oracle: Connection) {}

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
}
