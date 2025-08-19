import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { SyncRepository } from './sync.repository';
import { GatewayService } from '@/modules/gateway/gateway.service';

@Injectable()
export class SyncService {
    constructor(
        private readonly syncRepo: SyncRepository,
        private readonly gateway: GatewayService,
    ) {}

    public async getCurrentUserData(currentUser: IReqUser) {
        const userData = await this.syncRepo.getCurrentUserData(currentUser.sub);
        if (!userData) {
            throw new InternalServerErrorException('Failed to retrieve user data');
        }

        return userData;
    }
}
