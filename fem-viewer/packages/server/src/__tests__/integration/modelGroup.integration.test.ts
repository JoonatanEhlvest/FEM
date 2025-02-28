// Written with help from claude-3.5-sonnet and Cursor
import { getPrisma, TEST_ADMIN, createTestAgent } from '../testUtils';
import path from 'path';

const prisma = getPrisma();

describe('Model Group', () => {
    const agent = createTestAgent();  // Fresh agent for this suite

    beforeAll(async () => {
        await agent.post('/api/v1/login')
            .send(TEST_ADMIN);

        // Verify session is established
        const sessionResponse = await agent.get('/api/v1/session');
        expect(sessionResponse.status).toBe(200);
        expect(sessionResponse.body.user).toBeDefined();
    });

    afterAll(async () => {
        await agent.post('/api/v1/logout');
        await prisma.$disconnect();
    });

    describe('POST /api/v1/upload', () => {
        it('should create a new model group with XML and SVG files', async () => {
            const xmlFilePath = path.join(__dirname, '../fixtures/gym-example.xml');
            const svgFilePath = path.join(__dirname, '../fixtures/Classification.svg');
            const modelGroupName = 'test-model-group';

            const response = await agent
                .post('/api/v1/upload')
                .field('modelGroupName', modelGroupName)
                .attach('files', xmlFilePath)
                .attach('files', svgFilePath);

            expect(response.status).toBe(200);
        });

        it('should save files to disk and database', async () => {
            const xmlFilePath = path.join(__dirname, '../fixtures/gym-example.xml');
            const svgFilePath = path.join(__dirname, '../fixtures/Classification.svg');
            const modelGroupName = 'test-model-group-files';

            const response = await agent
                .post('/api/v1/upload')
                .field('modelGroupName', modelGroupName)
                .attach('files', xmlFilePath)
                .attach('files', svgFilePath);

            expect(response.status).toBe(200);

            // Check database directly after response
            const user = await prisma.user.findUnique({
                where: { username: TEST_ADMIN.username },
                include: {
                    modelGroups: {
                        where: {
                            modelGroup: {
                                name: `${modelGroupName}-${TEST_ADMIN.username}`
                            }
                        },
                        include: {
                            modelGroup: {
                                include: {
                                    files: true
                                }
                            }
                        }
                    }
                }
            });
            
            const modelGroup = user?.modelGroups[0]?.modelGroup;
            expect(modelGroup).toBeDefined();
            expect(modelGroup?.files).toHaveLength(2);
            expect(modelGroup?.files.map(f => f.name)).toContain('gym-example.xml');
            expect(modelGroup?.files.map(f => f.name)).toContain('Classification.svg');
        });

        it('should fail without XML file', async () => {
            const svgFilePath = path.join(__dirname, '../fixtures/Classification.svg');
            const modelGroupName = 'test-model-group-no-xml';

            const response = await agent
                .post('/api/v1/upload')
                .field('modelGroupName', modelGroupName)
                .attach('files', svgFilePath);

            expect(response.status).toBe(422);
            expect(response.body.message).toBe('No xml file provided');
        });
    });

    describe('GET /api/v1/upload', () => {
        it('should return list of model groups', async () => {
            const response = await agent.get('/api/v1/upload');

            expect(response.status).toBe(200);
            expect(response.body.modelGroups).toBeDefined();
            expect(Array.isArray(response.body.modelGroups)).toBe(true);
            expect(response.body.modelGroups.length).toBeGreaterThan(0);
            expect(response.body.modelGroups[0]).toHaveProperty('name');
        });
    });
});