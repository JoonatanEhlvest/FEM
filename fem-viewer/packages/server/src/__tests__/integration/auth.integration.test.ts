// Written with help from claude-3.5-sonnet and Cursor
import { getPrisma, TEST_ADMIN, request, createTestAgent } from '../testUtils';
import { describe, it, expect, afterAll } from '@jest/globals';

const prisma = getPrisma();

describe('Authentication', () => {
    const agent = createTestAgent();  // Fresh agent for this suite

    afterAll(async () => {
        await prisma.$disconnect();
    });

    describe('POST /api/v1/login', () => {
        it('should login successfully with correct credentials', async () => {
            const response = await agent
                .post('/api/v1/login')
                .send({
                    username: TEST_ADMIN.username,
                    password: TEST_ADMIN.password
                });

            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.username).toBe(TEST_ADMIN.username);
            expect(response.body.user.role).toBe(TEST_ADMIN.role);
        });

        it('should fail with incorrect password', async () => {
            const response = await request
                .post('/api/v1/login')
                .send({
                    username: TEST_ADMIN.username,
                    password: 'wrongpassword'
                });

            expect(response.status).toBe(422);
            expect(response.body.message).toBe('Invalid credentials');
        });

        it('should fail with non-existent user', async () => {
            const response = await request
                .post('/api/v1/login')
                .send({
                    username: 'nonexistentuser',
                    password: 'somepassword'
                });

            expect(response.status).toBe(422);
            expect(response.body.message).toBe('Invalid credentials');
        });
    });

    describe('GET /api/v1/session', () => {
        it('should return null for unauthenticated user', async () => {
            // Use request for unauthenticated test
            const response = await request.get('/api/v1/session');
            expect(response.status).toBe(200);
            expect(response.body.user).toBeNull();
        });

        it('should return user data for authenticated user', async () => {
            // Login first
            const loginResponse = await agent
                .post('/api/v1/login')
                .send({
                    username: TEST_ADMIN.username,
                    password: TEST_ADMIN.password
                });

            expect(loginResponse.status).toBe(200);
            expect(loginResponse.body.user).toBeDefined();

            // Now check session
            const sessionResponse = await agent.get('/api/v1/session');
            expect(sessionResponse.status).toBe(200);
            expect(sessionResponse.body.user).toBeDefined();
            expect(sessionResponse.body.user.username).toBe(TEST_ADMIN.username);
            expect(sessionResponse.body.user.role).toBe(TEST_ADMIN.role);
        });
    });
}); 