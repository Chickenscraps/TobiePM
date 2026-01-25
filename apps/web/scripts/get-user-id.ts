import { prisma } from '../src/lib/prisma';

async function main() {
    console.error('SCRIPT_START');
    const url = process.env.DATABASE_URL;
    console.error('URL_CHECK: ' + (url ? 'FOUND' : 'MISSING'));

    try {
        const user = await prisma.user.findUnique({
            where: { email: 'josh@tobie.team' }
        });
        console.error('ID_FOUND: ' + user?.id);
    } catch (e: any) {
        console.error('ERROR: ' + e.message);
    } finally {
        // Disconnecting via the underlying client if needed, 
        // but since we use the Proxy we might not need to manually disconnect
        // unless we want to exit fast.
        console.error('SCRIPT_END');
        process.exit(0);
    }
}

main();
