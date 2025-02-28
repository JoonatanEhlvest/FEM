// Written with help from claude-3.5-sonnet and Cursor
import { PrismaClient } from '@prisma/client';
import supertest from 'supertest';
import ServerInstance from '../../server';

// Single Prisma instance for tests
let prismaInstance: PrismaClient | undefined;
export function getPrisma() {
    if (!prismaInstance) {
        prismaInstance = new PrismaClient();
    }
    return prismaInstance;
}

// Test admin user constants
export const TEST_ADMIN = {
    username: 'testadmin',
    password: 'testpass123',
    role: 'ADMIN' as const
};

// For stateless requests
export const request = supertest(ServerInstance.getInstance().getApp());

// Create fresh agent for each test suite
export function createTestAgent() {
    return supertest.agent(ServerInstance.getInstance().getApp());
}

export function getApp() {
    return ServerInstance.getInstance().getApp();
}

export function getTestServer() {
    const server = ServerInstance.getInstance().start(Number(process.env.PORT) || 3001);
    return { app: ServerInstance.getInstance().getApp(), server };
}
