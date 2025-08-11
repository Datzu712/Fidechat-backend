import { OnGatewayConnection, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import jwt from 'jsonwebtoken';
import jwksClient, { JwksClient } from 'jwks-rsa';
import { ConfigService } from '@nestjs/config';
import type { OnModuleDestroy } from '@nestjs/common';
import { Logger } from '@/common/logger';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        credentials: true,
    },
    serveClient: false,
    transports: ['websocket', 'polling', 'webtransport'],
    allowUpgrades: true,
})
export class GatewayService implements OnGatewayConnection, OnModuleDestroy {
    private readonly logger = new Logger('GatewayService');

    @WebSocketServer()
    public server!: SocketServer;
    private readonly client: JwksClient;

    constructor(private readonly config: ConfigService<IEnvironmentVariables>) {
        this.logger.log('Initializing WebSocket Gateway...');
        this.client = jwksClient({
            jwksUri: `${this.config.getOrThrow('KEYCLOAK_URL')}/realms/${this.config.getOrThrow('KEYCLOAK_REALM')}/protocol/openid-connect/certs`,
        });
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
        let token: string | undefined = socket.handshake.auth?.token;
        if (this.config.get('NODE_ENV') === 'development' && !token) {
            // In development mode, we allow a token to be passed through header "access-token" (for postman)
            token = socket.handshake.headers['access-token'] as string | undefined;
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
                //audience: this.config.getOrThrow('KEYCLOAK_CLIENT_ID'), todo
                issuer: `${this.config.getOrThrow('KEYCLOAK_URL')}/realms/${this.config.getOrThrow('KEYCLOAK_REALM')}`,
                complete: true,
            },
            (err: jwt.VerifyErrors | null, decoded: jwt.Jwt | undefined) => {
                if (err || !decoded?.payload) {
                    this.logger.error(err);
                    this.logger.debug(decoded);
                    socket.disconnect();
                } else {
                    const payload = decoded.payload;
                    const userId = payload.sub as string;

                    this.logger.debug(`User ${userId} connected (${socket.handshake.address})`);
                    this.logger.debug(`Socket ID: ${socket.id}`);

                    void socket.join(userId);
                    socket.data.user = payload;
                }
            },
        );
    }

    public onModuleDestroy() {
        void this.server.close();
        this.logger.log('WebSocket server closed...');
    }
}
