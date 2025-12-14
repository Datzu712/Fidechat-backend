import 'dotenv/config';

import { Test, type TestingModule } from '@nestjs/testing';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { AppModule } from '../src/modules/app.module';
import { KeycloakClient } from '@/infrastructure/keycloak';
import { VersioningType } from '@nestjs/common';

describe('Keycloak Authentication E2E', () => {
    let app: NestFastifyApplication;

    // Keycloak test configuration
    const KEYCLOAK_CONFIG = {
        url: process.env.PUBLIC_KEYCLOAK_URL || 'http://localhost:8080',
        realm: process.env.KEYCLOAK_REALM || 'fidechat',
        clientId: process.env.KEYCLOAK_CLIENT_ID || 'fidechat',
        clientSecret: process.env.KEYCLOAK_CLIENT_SECRET || 'KxRu3hfJM4f9rDZXFhbOKQq4FenlrdIk',
        adminUsername: process.env.KEYCLOAK_ADMIN || 'admin',
        adminPassword: process.env.KEYCLOAK_ADMIN_PASSWORD || 'admin',
    };

    const keycloakClient = new KeycloakClient({
        url: KEYCLOAK_CONFIG.url,
        realm: KEYCLOAK_CONFIG.realm,
        clientId: KEYCLOAK_CONFIG.clientId,
        clientSecret: KEYCLOAK_CONFIG.clientSecret,
        adminUsername: KEYCLOAK_CONFIG.adminUsername,
        adminPassword: KEYCLOAK_CONFIG.adminPassword,
    });

    // Test user credentials
    const TEST_USER = {
        username: 'test-user-e2e',
        email: 'test-e2e@fidechat.com',
        password: 'TestPassword123!',
        firstName: 'Test',
        lastName: 'User',
    };

    let testUserId: string;
    let userAccessToken: string;

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication<NestFastifyApplication>(new FastifyAdapter());

        app.enableVersioning({
            type: VersioningType.URI,
            prefix: 'v',
        });
        app.enableShutdownHooks();
        app.setGlobalPrefix('api');

        await app.init();
        await app.getHttpAdapter().getInstance().ready();
        await keycloakClient.connect();

        testUserId = await keycloakClient.createUser(TEST_USER);
    });

    afterAll(async () => {
        try {
            if (testUserId && userAccessToken) {
                await keycloakClient.deleteUser(testUserId);
            }

            await app.close();
        } catch (error) {
            console.error('Error cleaning up test user:', error);
        }
    });

    describe('User authentication via Keycloak', () => {
        it('should be able to reach Keycloak server', async () => {
            const user = await keycloakClient.findUserByUsername(TEST_USER.username);
            expect(user).toBeDefined();
            expect(user?.username).toBe(TEST_USER.username);

            const tokenResponse = await keycloakClient.getUserToken(TEST_USER.username, TEST_USER.password);
            expect(tokenResponse.access_token).toBeDefined();
            expect(tokenResponse.refresh_token).toBeDefined();

            userAccessToken = tokenResponse.access_token;
        });
    });

    describe('Protected Endpoints', () => {
        it('should reject requests without authentication token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users/@me/sync',
            });

            expect(response.statusCode).toBe(401);
        });

        it('should reject requests with invalid token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users/@me/sync',
                headers: {
                    authorization: 'Bearer invalid-token-here',
                },
            });

            expect(response.statusCode).toBe(401);
        });

        it('should allow requests with valid token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/users/@me/sync',
                headers: {
                    authorization: `Bearer ${userAccessToken}`,
                },
            });

            expect([200, 201, 204]).toContain(response.statusCode);
        });

        it('should allow access to public endpoints without token', async () => {
            const response = await app.inject({
                method: 'GET',
                url: '/api/v1/guilds/public',
                headers: {
                    authorization: `Bearer ${userAccessToken}`,
                },
            });

            expect([200, 201, 204]).toContain(response.statusCode);
        });
    });
});
