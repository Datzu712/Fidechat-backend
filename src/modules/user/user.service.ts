import { Injectable } from '@nestjs/common';

import { UserRepository } from './user.repository';
import { GatewayService, SocketEvents } from '../gateway/gateway.service';
import { AppUser, GuildUser } from '@/database/oracle/types/user';

@Injectable()
export class UserService {
    constructor(
        private readonly userRepo: UserRepository,
        private readonly gateway: GatewayService,
    ) {}

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
        let username = kcUser.email;
        if (kcUser.given_name && kcUser.family_name) {
            username = `${kcUser.given_name} ${kcUser.family_name}`;
        } else if (kcUser.name) {
            username = kcUser.name;
        } else if (kcUser.preferred_username) {
            username = kcUser.preferred_username;
        }
        const pictureUrl = kcUser.picture || kcUser.avatarUrl || null;

        const result = await this.userRepo.upsertUser({
            id: kcUser.sub,
            username,
            email: kcUser.email,
            avatarUrl: pictureUrl,
        });

        const guildMembers =
            (await this.userRepo.getGuildUsers(this.userRepo.DEFAULT_GUILD_ID))?.map((user) => user.ID) || [];

        if (result.wasAddedToGuild) {
            const appUser: AppUser = {
                id: kcUser.sub,
                username,
                email: kcUser.email,
                avatarUrl: pictureUrl,
                isBot: false,
            };

            const memberMetadata: GuildUser = {
                userId: kcUser.sub,
                guildId: this.userRepo.DEFAULT_GUILD_ID,
            };

            this.gateway.emitToUsers(guildMembers, SocketEvents.MEMBER_ADD, {
                user: appUser,
                memberMetadata,
            });
        }
    }
}
