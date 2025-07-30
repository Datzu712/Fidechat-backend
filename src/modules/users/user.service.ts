import type { IReqUser } from 'types/fastify';
import type { Connection } from 'oracledb';
import { Inject, Injectable } from '@nestjs/common';

import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';

@Injectable()
export class UserService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly oracle: Connection) {}

    /**
     * Synchronizes a user from Keycloak (KC) with the local Oracle database.
     *
     * If the user already exists in the `APP_USER` table (matched by `kcUser.id`), updates their `username` and `email`.
     * Otherwise, inserts a new user record with the provided `id`, `username`, and `email`.
     *
     * @param kcUser - The user object received from Keycloak, containing user identification and profile information.
     * @todo Validate the `kcUser` object to ensure it contains the necessary fields before proceeding with the database operations.
     */
    async syncUsersFromKC(kcUser: IReqUser) {
        const alreadyExistsUser = (await this.oracle.execute(...sql`SELECT * FROM APP_USER WHERE id = ${kcUser.sub}`))
            .rows?.[0];

        const username = kcUser.preferred_username || kcUser.name || kcUser.email;

        if (alreadyExistsUser) {
            void this.oracle.execute(
                ...sql`
                    UPDATE APP_USER
                        SET username = ${username}, email = ${kcUser.email}
                    WHERE id = ${kcUser.sub}
                `,
                {
                    autoCommit: true,
                },
            );
        } else {
            await this.oracle.execute(
                ...sql`
                    INSERT INTO APP_USER (id, username, email)
                    VALUES (${kcUser.sub}, ${username}, ${kcUser.email})
                `,
                {
                    autoCommit: true,
                },
            );
        }
    }
}
