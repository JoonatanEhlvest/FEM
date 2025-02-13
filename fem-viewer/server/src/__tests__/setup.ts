// Written with help from claude-3.5-sonnet and Cursor
import dotenv from 'dotenv';
import { hashPassword } from '../passportSetup';
import sessionStore from '../sessionStorage';
import { getPrisma, TEST_ADMIN, getApp } from './testUtils';
import ServerInstance from '../../server';

// Ensure we're using test environment
process.env.NODE_ENV = 'test';

const prisma = getPrisma();
// Load test environment variables
dotenv.config({ path: '.env.test' });

beforeAll(async () => {
    // Clean database first
    await prisma.file.deleteMany({});
    await prisma.modelGroup.deleteMany({});
    await prisma.user.deleteMany({});

    // Create admin user
    await new Promise<void>((resolve) => {
        hashPassword(TEST_ADMIN.password, async (hash) => {
            try {
                // Try to create user, if it fails (already exists) just continue
                await prisma.user.upsert({
                    where: { username: TEST_ADMIN.username },
                    update: {},  // No updates if exists
                    create: {
                        username: TEST_ADMIN.username,
                        password: hash,
                        role: TEST_ADMIN.role
                    }
                });
                resolve();
            } catch (error) {
                console.error('Error in test setup:', error);
                resolve();
            }
        });
    });
});

afterAll(async () => {
    await prisma.$disconnect();
    
    // Close server and session store
    const serverInstance = ServerInstance.getInstance();
    if (serverInstance.getServer()) {
        await new Promise<void>((resolve) => {
            serverInstance.getServer()?.close(() => resolve());
        });
    }
    await new Promise<void>((resolve) => {
        sessionStore.close(() => resolve());
    });
});

afterEach(async () => {
    // Clean up any test data created during tests
    await prisma.user.deleteMany({
        where: {
            NOT: {
                username: TEST_ADMIN.username
            }
        }
    });
});
