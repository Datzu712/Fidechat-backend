import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import jwt, { type JwtPayload } from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import type { OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Logger } from '@/common/logger';
import { IAUserModels } from '../ai/ai-command.service';

export enum SocketEvents {
    GUILD_CREATE = 'guildCreate',
    CHANNEL_CREATE = 'channelCreate',
    MESSAGE_CREATE = 'messageCreate',
    MESSAGE_UPDATE = 'messageUpdate',
    MESSAGE_DELETE = 'messageDelete',
    MEMBER_ADD = 'memberAdd',
    FORCE_SYNC = 'forceSync',
    USER_STATUS_UPDATE = 'userStatusUpdate',
    UPDATE_CURRENT_STATUS = 'updateCurrentClientStatus', // client -> server
}
export type SocketUserStatus = 'online' | 'idle' | 'dnd';
export enum SocketUserStatusEnum {
    ONLINE = 'online',
    IDLE = 'idle',
    DND = 'dnd',
    OFFLINE = 'offline',
}

export interface SocketUserMetadata {
    userId: string;
    status: SocketUserStatus;
    typingInChannel?: string;
    isTyping: boolean;
}

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    },
    namespace: process.env.SOCKET_NAMESPACE,
    serveClient: false,
    transports: ['websocket'],
    allowUpgrades: true,
})
export class GatewayService implements OnGatewayConnection, OnModuleDestroy, OnGatewayDisconnect, OnModuleInit {
    private readonly logger = new Logger('GatewayService');
    readonly #activeUsers = new Map<string, Omit<SocketUserMetadata, 'userId'>>();

    /**
     * Retrieves a list of active users and their statuses.
     * Converts the internal map of active users into an array of objects,
     * where each object contains the user ID and their corresponding status.
     *
     * @returns An array of objects, each containing:
     * - `userId`: The unique identifier of the user.
     * - `status`: The current status of the user.
     */
    get activeUsers(): SocketUserMetadata[] {
        return Array.from(this.#activeUsers.entries()).map(([userId, data]) => ({
            userId,
            ...data,
        }));
    }

    @WebSocketServer()
    public server!: SocketServer;
    private readonly client: JwksClient;

    constructor(private readonly config: ConfigService<IEnvironmentVariables>) {
        this.logger.log('Initializing WebSocket Gateway...');
        this.client = jwksClient({
            jwksUri: `${this.config.getOrThrow('PUBLIC_KEYCLOAK_URL')}/realms/${this.config.getOrThrow('KEYCLOAK_REALM')}/protocol/openid-connect/certs`,
        });

        for (const user of IAUserModels) {
            this.#activeUsers.set(user.id, {
                status: SocketUserStatusEnum.ONLINE,
                isTyping: false,
            });
        }
    }

    private getKey(header: jwt.JwtHeader, callback: jwt.SigningKeyCallback) {
        this.client.getSigningKey(header.kid, function (err, key) {
            if (err) {
                Logger.error(err);
                return callback(err);
            }

            const signingKey = key!.getPublicKey();
            callback(null, signingKey);
        });
    }

    public handleConnection(socket: SocketClient) {
        let token: string | undefined = socket.handshake.auth.token;
        if (!token) {
            /*this.config.get('NODE_ENV') === 'development' && */
            // In development mode, we allow a token to be passed through header "access-token" (for postman)
            const accessToken = socket.handshake.headers['access-token'];
            token = typeof accessToken === 'string' ? accessToken : undefined;
        }

        if (!token) {
            this.logger.error(`${socket.handshake.address} tried to connect without a token`);
            socket.disconnect();
            return;
        }
        jwt.verify(
            token,
            this.getKey.bind(this),
            {
                issuer: `${this.config.getOrThrow('PUBLIC_KEYCLOAK_URL')}/realms/${this.config.getOrThrow('KEYCLOAK_REALM')}`,
                complete: true,
            },
            (err: jwt.VerifyErrors | null, decoded: jwt.Jwt | undefined) => {
                console.log(decoded);
                if (err || !decoded?.payload) {
                    this.logger.error(err);
                    this.logger.debug(decoded);

                    socket.disconnect();
                    this.logger.error(`${socket.handshake.address} tried to connect with an invalid token`);
                } else {
                    const payload = decoded.payload as JwtPayload;
                    const userId = payload.sub;

                    if (typeof userId !== 'string') {
                        this.logger.error(`Invalid or missing 'sub' in token payload: ${JSON.stringify(payload)}`);
                        socket.disconnect();
                        return;
                    }

                    if (!userId) {
                        this.logger.error(`Invalid token payload: ${JSON.stringify(payload)}`);
                        socket.disconnect();
                        return;
                    }

                    void socket.join(userId);
                    socket.data.user = payload;

                    this.#activeUsers.set(userId, {
                        status: SocketUserStatusEnum.ONLINE,
                        isTyping: false,
                    });
                    this.server.emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);

                    this.logger.debug(
                        `Socket ${socket.id} connected with user data: ${JSON.stringify(socket.data.user)} (${socket.handshake.address} - socket: ${socket.id})`,
                    );
                    socket.emit('welcome', `Hi ${userId}, welcome to Fidechat!`);
                }
            },
        );
    }

    public emitToUser(userId: string, event: keyof ServerToClientEvents, data: any) {
        this.server.to(userId).emit(event, data);
    }

    public emitForceSync(userId: string) {
        this.server.to(userId).emit(SocketEvents.FORCE_SYNC);
    }

    public emitToUsers(userIds: string[], event: keyof ServerToClientEvents, data: any) {
        if (!userIds.length) {
            this.logger.error('User IDs are required to emit to users!');
            return;
        }

        this.logger.debug(`Emitting event ${event} to users: ${userIds.join(', ')}`);

        userIds.forEach((userId) => {
            this.server.to(userId).emit(event, data);
        });
    }

    public handleDisconnect(socket: SocketClient) {
        this.logger.debug(`Socket ${socket.id} disconnected.`);
        if (socket.data.user) {
            const userId = socket.data.user.sub;
            if (typeof userId === 'string' && this.#activeUsers.has(userId)) {
                this.#activeUsers.delete(userId);
                this.server.emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);
            }
        }
    }

    public onModuleDestroy() {
        void this.server.close();
        this.logger.log('WebSocket server closed...');
    }

    public handleUserStatusUpdate(socket: SocketClient, metadata: SocketUserMetadata) {
        if (!socket.data.user) {
            socket.disconnect();
            return;
        }

        if (socket.data.user.sub && this.#activeUsers.has(socket.data.user.sub)) {
            const currentData = this.#activeUsers.get(socket.data.user.sub)!;
            this.#activeUsers.set(socket.data.user.sub, Object.assign(currentData, metadata));

            this.server.emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);
        }
    }

    public onModuleInit() {
        this.server.on('connection', (socket: SocketClient) => {
            socket.on(SocketEvents.UPDATE_CURRENT_STATUS, (data: SocketUserMetadata) => {
                this.logger.debug(`User ${socket.id} updated status to: ${JSON.stringify(data)}`);

                this.handleUserStatusUpdate(socket, data);
            });
        });
    }

    public startTypingIA(modelId: string, channelId: string) {
        const user = IAUserModels.find((user) => user.id === modelId);
        if (!user) {
            this.logger.error(`IA user with ID ${modelId} not found`);
            return;
        }

        this.#activeUsers.set(user.id, {
            status: SocketUserStatusEnum.ONLINE,
            isTyping: true,
            typingInChannel: channelId,
        });

        this.server.emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);
        this.server.to(channelId).emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);
    }

    public stopTypingIA(modelId: string) {
        const user = IAUserModels.find((user) => user.id === modelId);
        if (!user) {
            this.logger.error(`IA user with ID ${modelId} not found`);
            return;
        }

        this.#activeUsers.set(user.id, {
            status: SocketUserStatusEnum.ONLINE,
            isTyping: false,
            typingInChannel: undefined,
        });

        this.server.emit(SocketEvents.USER_STATUS_UPDATE, this.activeUsers);
    }
}
