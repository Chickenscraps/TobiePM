import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as fs from 'node:fs';
import * as path from 'node:path';

async function main() {
    console.log('--- TOBIE PROJECT IMPORT START ---');

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

    const PROJECTS_DIR = 'C:\\Users\\josha\\OneDrive\\Desktop\\TOBIE Project files\\Projects';

    try {
        // 1. Find the Creator (Josh)
        const user = await prisma.user.findUnique({
            where: { email: 'josh@tobie.team' }
        });

        if (!user) {
            throw new Error('User josh@tobie.team not found in database. Run seeds first.');
        }

        console.log(`Target User: ${user.name} (${user.id})`);

        // 2. Scan folders
        const folders = fs.readdirSync(PROJECTS_DIR, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory());

        console.log(`Found ${folders.length} project folders.`);

        for (const folder of folders) {
            const projectName = folder.name.replace(/_/g, ' ');
            const localFolderPath = path.join(PROJECTS_DIR, folder.name);

            console.log(`Importing: ${projectName}...`);

            // 3. Create Project
            const project = await prisma.project.upsert({
                where: { id: `import_${folder.name}` }, // Deterministic ID for re-runs
                update: {
                    name: projectName,
                },
                create: {
                    id: `import_${folder.name}`,
                    name: projectName,
                    description: `Imported from ${folder.name}`,
                    status: 'ACTIVE',
                    creatorId: user.id
                }
            });

            // 4. Scan files in folder
            const files = fs.readdirSync(localFolderPath, { withFileTypes: true })
                .filter(dirent => dirent.isFile());

            for (const file of files) {
                const filePath = path.join(localFolderPath, file.name);
                const stats = fs.statSync(filePath);

                console.log(`  - Attaching file: ${file.name}`);

                await prisma.fileAttachment.upsert({
                    where: { id: `file_${folder.name}_${file.name}` },
                    update: {
                        filename: file.name,
                        sizeBytes: stats.size,
                        localPath: filePath
                    },
                    create: {
                        id: `file_${folder.name}_${file.name}`,
                        filename: file.name,
                        sizeBytes: stats.size,
                        localPath: filePath,
                        projectId: project.id,
                        mimeType: path.extname(file.name)
                    }
                });
            }
        }

        console.log('--- IMPORT COMPLETE ---');

    } catch (e) {
        console.error('FATAL IMPORT ERROR:', e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
}

main();
