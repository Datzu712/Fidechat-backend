import { Inject, Injectable } from '@nestjs/common';
import type { Sequelize } from 'sequelize';
import { sql } from '@sequelize/core';

import { DATABASE_CONNECTION } from '@/database/database.module';

@Injectable()
export class UserService {
    constructor(@Inject(DATABASE_CONNECTION) private readonly sequelize: Sequelize) {}

    async syncUsersFromKeycloak(keycloakUser: any) {}
}
