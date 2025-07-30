import { Inject, Injectable } from '@nestjs/common';

import type { IReqUser } from 'types/fastify';
import type { Connection } from 'oracledb';
import { DATABASE_CONNECTION } from '@/database/oracle/oracle.provider';
import { sql } from '@/database/oracle/query-builder/sql-template';

@Injectable()
export class UserService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly oracle: Connection) {}

    async syncUsersFromKC(kcUser: IReqUser) {
        const alreadyExistsUser = (await this.oracle.execute(...sql`SELECT * FROM APP_USER WHERE id = ${kcUser.id}`))
            .rows?.[0];

        const username = kcUser.preferred_username || kcUser.name || kcUser.email;

        if (alreadyExistsUser) {
            await this.oracle.execute(
                ...sql`
                UPDATE APP_USER
                    SET username = ${username}, email = ${kcUser.email}
                WHERE id = ${kcUser.sub}
            `,
            );
        } else {
            await this.oracle.execute(
                ...sql`
                INSERT INTO APP_USER (id, username, email)
                VALUES (${kcUser.sub}, ${username}, ${kcUser.email})
            `,
            );
        }

        await this.oracle.commit();
    }
}
