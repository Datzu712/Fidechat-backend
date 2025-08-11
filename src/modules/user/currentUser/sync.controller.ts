import { AuthenticatedUser } from 'nest-keycloak-connect';
import { Controller, Get } from '@nestjs/common';
import { SyncService } from './sync.service';

/**
 * Controller responsible for handling synchronization-related operations
 * for the current authenticated user.
 */
@Controller({
    version: '1',
    path: '/users/@me/sync',
})
export class SyncController {
    constructor(private readonly syncService: SyncService) {}

    @Get()
    async syncCurrentUser(@AuthenticatedUser() user: IReqUser) {
        return this.syncService.getCurrentUserData(user);
    }
}
