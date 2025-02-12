import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import { hashPassword } from '../passportSetup';
import sessionStore from '../sessionStorage';

// Ensure we're using test environment
process.env.NODE_ENV = 'test';

// Load test environment variables
dotenv.config({ path: '.env.test' });

const prisma = new PrismaClient();

// Test user credentials that can be used across tests
export const TEST_ADMIN = {
    username: 'testadmin',
    password: 'testpass123',
    role: 'ADMIN' as const
};

// Global setup before all tests
beforeAll(async () => {
    // Create admin user
    await new Promise<void>((resolve) => {
        hashPassword(TEST_ADMIN.password, async (hash) => {
            try {
                await prisma.user.upsert({
                    where: { username: TEST_ADMIN.username },
                    update: {},
                    create: {
                        username: TEST_ADMIN.username,
                        password: hash,
                        role: TEST_ADMIN.role
                    }
                });
                resolve();
            } catch (error) {
                console.error('Error creating test admin:', error);
                resolve();
            }
        });
    });
});

// Global teardown after all tests
afterAll(async () => {
    // Close database connection
    await prisma.$disconnect();
    
    // Close session store
    await new Promise<void>((resolve) => {
        sessionStore.close(() => resolve());
    });
});

// Reset database between tests if needed
beforeEach(async () => {
    // Add any per-test setup here
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