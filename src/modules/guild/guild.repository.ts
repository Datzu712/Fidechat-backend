import { Inject, Injectable } from '@nestjs/common';
import type { Connection } from 'oracledb';

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
    constructor(@Inject(DATABASE_CONNECTION) private readonly connection: Connection) {}

    public async getViewableGuilds() {
        return [];
    }

    public async createGuild(data: GuildDto) {
        await this.connection.execute(
            ...sql`
                INSERT INTO guilds (name, icon_url, is_public, owner_id)
                VALUES (${data.name}, ${data.iconUrl}, ${data.isPublic}, ${data.ownerId})
            `,
        );
    }
}
