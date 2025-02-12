import { app, server } from '../../../server';
import supertest from 'supertest';
import { TEST_ADMIN } from '../setup';
import { PrismaClient } from '@prisma/client';
const request = supertest(app);
const prisma = new PrismaClient();

describe('Authentication', () => {
    afterAll(async () => {
        await prisma.$disconnect();
        server.close();
    });

    describe('POST /api/v1/login', () => {
        it('should login successfully with correct credentials', async () => {
            const response = await request
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
            const response = await request.get('/api/v1/session');
            
            expect(response.status).toBe(200);
            expect(response.body.user).toBeNull();
        });

        it('should return user data for authenticated user', async () => {
            const agent = supertest.agent(app);
            
            // Login first
            await agent
                .post('/api/v1/login')
                .send({
                    username: TEST_ADMIN.username,
                    password: TEST_ADMIN.password
                });

            // Check session
            const response = await agent.get('/api/v1/session');
            
            expect(response.status).toBe(200);
            expect(response.body.user).toBeDefined();
            expect(response.body.user.username).toBe(TEST_ADMIN.username);
            expect(response.body.user.role).toBe(TEST_ADMIN.role);
        });
    });
}); 