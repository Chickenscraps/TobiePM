
import { PrismaClient } from '@prisma/client';
import * as shared from '@tobie/shared';
// @ts-ignore
import * as audit from '@tobie/audit';
import { hash, compare } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Testing imports...');
    try {
        console.log('Shared keys:', Object.keys(shared));

        // Try to connect
        await prisma.$connect();
        console.log('Prisma connected successfully');

        const count = await prisma.user.count();
        console.log('User count:', count);

        // Test bcrypt
        console.log('Testing bcrypt...');
        const hashed = await hash('test', 10);
        const valid = await compare('test', hashed);
        console.log('Bcrypt check:', valid);

        // Test AuditLog
        console.log('Testing AuditLog creation...');
        const user = await prisma.user.findFirst();

        await prisma.auditLog.create({
            data: {
                eventType: 'TEST_EVENT',
                eventSource: 'script',
                details: JSON.stringify({ test: true }),
                timestamp: new Date(),
                userId: user?.id
            }
        });
        console.log('AuditLog created');

        console.log('All checks passed!');
    } catch (error) {
        console.error('Check failed:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

main();
