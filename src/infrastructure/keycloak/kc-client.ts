import type { CreateUserData, KeycloakTokenResponse, KeycloakUser } from './kc-types';

export interface KeycloakClientOptions {
    url: string;
    realm: string;
    clientId: string;
    clientSecret: string;
    adminUsername: string;
    adminPassword: string;
}

export class KeycloakClient {
    public isAuthenticated = false;
    private accessToken: string | null = null;

    constructor(private readonly config: KeycloakClientOptions) {}

    /**
     * Authenticate with Keycloak admin API and get admin access token
     */
    public async connect(): Promise<void> {
        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: 'admin-cli',
            username: this.config.adminUsername,
            password: this.config.adminPassword,
        });

        const response = await fetch(`${this.config.url}/realms/master/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            throw new Error(`Failed to get admin token: ${response.statusText}`);
        }

        const data = (await response.json()) as KeycloakTokenResponse;
        if (!data.access_token) throw new Error('No access token in response');

        this.isAuthenticated = true;
        this.accessToken = data.access_token;
    }

    /**
     * Find a user by username
     */
    public async findUserByUsername(username: string): Promise<KeycloakUser | null> {
        this.ensureAuthenticated();

        const searchResponse = await fetch(
            `${this.config.url}/admin/realms/${this.config.realm}/users?username=${username}`,
            {
                headers: {
                    Authorization: `Bearer ${this.accessToken}`,
                },
            },
        );

        if (!searchResponse.ok) {
            throw new Error(`Failed to search user: ${searchResponse.statusText}`);
        }

        const users = (await searchResponse.json()) as KeycloakUser[];
        return users.length > 0 ? users[0] : null;
    }

    /**
     * Create a test user in Keycloak
     */
    public async createUser(user: CreateUserData): Promise<string> {
        this.ensureAuthenticated();

        const existingUser = await this.findUserByUsername(user.username);
        if (existingUser) {
            await this.deleteUser(existingUser.id);
        }

        const createResponse = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${this.accessToken}`,
            },
            body: JSON.stringify({
                username: user.username,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                enabled: true,
                emailVerified: true,
            }),
        });

        if (!createResponse.ok) {
            const error = await createResponse.text();
            throw new Error(`Failed to create test user: ${createResponse.statusText} - ${error}`);
        }

        const location = createResponse.headers.get('location');
        const userId = location?.split('/').pop();

        if (!userId) {
            throw new Error('Failed to get user ID from location header');
        }

        // Set user password
        await this.setUserPassword(userId, user.password);
        return userId;
    }

    /**
     * Set password for a user
     */
    public async setUserPassword(userId: string, password: string): Promise<void> {
        this.ensureAuthenticated();

        const response = await fetch(
            `${this.config.url}/admin/realms/${this.config.realm}/users/${userId}/reset-password`,
            {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${this.accessToken}`,
                },
                body: JSON.stringify({
                    type: 'password',
                    value: password,
                    temporary: false,
                }),
            },
        );

        if (!response.ok) {
            throw new Error(`Failed to set user password: ${response.statusText}`);
        }
    }

    public async deleteUser(userId: string): Promise<void> {
        this.ensureAuthenticated();

        const response = await fetch(`${this.config.url}/admin/realms/${this.config.realm}/users/${userId}`, {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${this.accessToken}`,
            },
        });

        if (!response.ok && response.status !== 404) {
            throw new Error(`Failed to delete user: ${response.statusText}`);
        }
    }

    public async getUserToken(username: string, password: string): Promise<KeycloakTokenResponse> {
        // This simulates what would happen in a federated login flow
        // In production, this would be handled by NextAuth/Keycloak directly
        const params = new URLSearchParams({
            grant_type: 'password',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            username,
            password,
        });

        const response = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to get user token: ${response.statusText} - ${error}`);
        }

        return (await response.json()) as KeycloakTokenResponse;
    }

    /**
     * Verify user credentials (simulates what happens during federated login)
     */
    public async verifyUserCredentials(username: string, password: string): Promise<boolean> {
        try {
            await this.getUserToken(username, password);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Refresh an access token using a refresh token
     */
    public async refreshToken(refreshTokenValue: string): Promise<KeycloakTokenResponse> {
        const params = new URLSearchParams({
            grant_type: 'refresh_token',
            client_id: this.config.clientId,
            client_secret: this.config.clientSecret,
            refresh_token: refreshTokenValue,
        });

        const response = await fetch(`${this.config.url}/realms/${this.config.realm}/protocol/openid-connect/token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Failed to refresh token: ${response.statusText} - ${error}`);
        }

        return (await response.json()) as KeycloakTokenResponse;
    }

    /**
     * Ensure the client is authenticated before making admin API calls
     */
    private ensureAuthenticated(): void {
        if (!this.isAuthenticated || !this.accessToken) {
            throw new Error('Client is not authenticated. Call connect() first.');
        }
    }
}

// async function main() {
//     const kcClient = new KeycloakClient({
//         url: 'http://localhost:8080',
//         realm: 'fidechat',
//         clientId: 'fidechat',
//         clientSecret: 'KxRu3hfJM4f9rDZXFhbOKQq4FenlrdIk',
//         adminUsername: 'root',
//         adminPassword: 'root',
//     });

//     try {
//         console.log('🔐 Testing Keycloak Client Flow (Federated Login Simulation)...\n');

//         // 1. Connect and authenticate
//         console.log('1️⃣ Connecting to Keycloak Admin API...');
//         await kcClient.connect();
//         console.log('✅ Connected successfully\n');

//         // 2. Create a test user
//         const testUser: TestUser = {
//             username: 'test_user_' + Date.now(),
//             email: 'test@example.com',
//             firstName: 'Test',
//             lastName: 'User',
//             password: 'TestPassword123!',
//         };

//         console.log('2️⃣ Creating test user:', testUser.username);
//         const userId = await kcClient.createUser(testUser);
//         console.log('✅ User created with ID:', userId, '\n');

//         // 3. Find user by username
//         console.log('3️⃣ Finding user by username...');
//         const foundUser = await kcClient.findUserByUsername(testUser.username);
//         console.log('✅ User found:', foundUser?.username, '\n');

//         // 4. Verify user credentials (simulates federated login validation)
//         console.log('4️⃣ Verifying user can authenticate (federated login simulation)...');
//         console.log('   ℹ️  Note: In production, NextAuth handles this flow with Keycloak');
//         const canAuthenticate = await kcClient.verifyUserCredentials(testUser.username, testUser.password);
//         if (canAuthenticate) {
//             console.log('✅ User authentication successful - user can login via federated auth\n');
//         } else {
//             console.log('❌ User authentication failed\n');
//             throw new Error('User credentials verification failed');
//         }

//         // 5. Update user password
//         console.log('5️⃣ Updating user password...');
//         await kcClient.setUserPassword(userId, 'NewPassword123!');
//         console.log('✅ Password updated\n');

//         // 6. Verify new password works
//         console.log('6️⃣ Verifying new password...');
//         const canAuthenticateWithNewPassword = await kcClient.verifyUserCredentials(
//             testUser.username,
//             'NewPassword123!',
//         );
//         if (canAuthenticateWithNewPassword) {
//             console.log('✅ New password verified - user can login with updated credentials\n');
//         } else {
//             throw new Error('New password verification failed');
//         }

//         // 7. Verify old password no longer works
//         console.log('7️⃣ Verifying old password is invalidated...');
//         const canAuthenticateWithOldPassword = await kcClient.verifyUserCredentials(
//             testUser.username,
//             testUser.password,
//         );
//         if (!canAuthenticateWithOldPassword) {
//             console.log('✅ Old password correctly invalidated\n');
//         } else {
//             throw new Error('Old password still works - this should not happen');
//         }

//         // 8. Delete user
//         console.log('8️⃣ Deleting test user...');
//         await kcClient.deleteUser(userId);
//         console.log('✅ User deleted\n');

//         // 9. Verify user was deleted
//         console.log('9️⃣ Verifying user deletion...');
//         const deletedUser = await kcClient.findUserByUsername(testUser.username);
//         console.log('✅ User not found:', deletedUser === null, '\n');

//         console.log('🎉 All tests passed successfully!');
//         console.log('📝 Summary: User lifecycle tested (create, auth, update, delete)');
//     } catch (error) {
//         console.error('❌ Test failed:', error);
//         process.exit(1);
//     }
// }

// void main();
