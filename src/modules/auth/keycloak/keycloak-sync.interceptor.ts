import { CallHandler, ExecutionContext, Injectable, NestInterceptor, UnauthorizedException } from '@nestjs/common';
import { Observable } from 'rxjs';
import { FastifyRequest } from 'fastify';

import { UserService } from '@/modules/users/user.service';
import { Logger } from '@/common/logger';

@Injectable()
export class KeycloakSyncInterceptor implements NestInterceptor {
    constructor(private readonly userService: UserService) {}

    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const request = context.switchToHttp().getRequest<FastifyRequest>();
        if (!request.user) {
            Logger.debug('No user found in request', 'KeycloakSyncInterceptor');
            throw new UnauthorizedException();
        }
        await this.userService.syncUsersFromKC(request.user);

        return next.handle();
    }
}
