import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

async function main() {
    console.log('--- TOBIE TASK SEEDING START ---');

    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
        throw new Error('DATABASE_URL is missing from environment');
    }

    const pool = new Pool({
        connectionString,
        ssl: { rejectUnauthorized: false }
    });
    const adapter = new PrismaPg(pool);
    const prisma = new PrismaClient({ adapter });

    try {
        // 1. Get the Josh user
        const user = await prisma.user.findUnique({
            where: { email: 'josh@tobie.team' }
        });

        if (!user) {
            throw new Error('User josh@tobie.team not found.');
        }

        // 2. Get all imported projects
        const projects = await prisma.project.findMany({
            where: { id: { startsWith: 'import_' } }
        });

        console.log(`Found ${projects.length} projects to seed.`);

        const taskTemplates = [
            { title: 'Initial Material Review', priority: 3, status: 'DONE' },
            { title: 'Draft Creative Brief', priority: 4, status: 'IN_PROGRESS' },
            { title: 'Final Export & QC', priority: 5, status: 'TODO' },
            { title: 'Stakeholder Feedback Loop', priority: 2, status: 'TODO' },
            { title: 'Metadata & Tagging', priority: 1, status: 'DONE' }
        ];

        for (const project of projects) {
            console.log(`Seeding tasks for: ${project.name}...`);

            for (const template of taskTemplates) {
                // Determine a due date (some in past, some in future)
                const daysOffset = Math.floor(Math.random() * 20) - 10;
                const dueDate = new Date();
                dueDate.setDate(dueDate.getDate() + daysOffset);

                await prisma.task.create({
                    data: {
                        id: `task_${project.id}_${template.title.replace(/\s+/g, '_')}`,
                        title: template.title,
                        description: `Auto-generated task for the ${project.name} project.`,
                        status: template.status,
                        priority: template.priority,
                        dueDate: template.status === 'DONE' ? null : dueDate,
                        projectId: project.id,
                        creatorId: user.id,
                        assigneeId: user.id
                    }
                });
            }
        }

        console.log('--- SEEDING COMPLETE ---');

    } catch (e) {
        console.error('FATAL SEEDING ERROR:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
