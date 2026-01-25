import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Safe lazy initialization:
// 1. Never initializes immediately on module load.
// 2. Checks for DATABASE_URL before creating client.
// 3. Reuses global instance in dev (HMR safe).
// 4. Proxies access so we only init on first Property Access (e.g. prisma.user.find...)

import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const getPrismaClient = () => {
    // 1. Check Env (Priority: SUPABASE_DATABASE_URL then DATABASE_URL)
    const connectionString = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

    if (!connectionString) {
        console.error('PRISMA FATAL: DATABASE_URL and SUPABASE_DATABASE_URL are both missing');
        throw new Error('DATABASE_URL is missing');
    }

    // Masked logging for debugging Netlify environment
    try {
        const url = new URL(connectionString);
        console.log(`PRISMA: Attempting connection to ${url.hostname}:${url.port || '5432'} (Mode: pg-adapter)`);
    } catch (e) {
        console.log('PRISMA: Using non-standard connection string format');
    }

    // 2. Initialize if needed
    if (!globalForPrisma.prisma) {
        console.log('PRISMA: Initializing with pg driver adapter...');
        const pool = new Pool({
            connectionString,
            connectionTimeoutMillis: 5000,
            ssl: { rejectUnauthorized: false } // Required for Supabase in many environments
        });
        const adapter = new PrismaPg(pool);
        globalForPrisma.prisma = new PrismaClient({ adapter });
    }
    return globalForPrisma.prisma;
};

// The export is a Proxy. It looks like PrismaClient to the app, 
// but it doesn't run "new PrismaClient()" until you do "prisma.user" or "prisma.connect"
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        // Pass through promises to avoid triggering init on 'then' checks
        if (prop === 'then') return Promise.resolve(target);

        // On first real access, initialize
        try {
            const client = getPrismaClient();
            // @ts-ignore
            const value = client[prop];

            if (typeof value === 'function') {
                return value.bind(client);
            }
            return value;
        } catch (error) {
            console.error(`PRISMA: Failed to lazy-init or access property ${String(prop)}`, error);
            throw error;
        }
    },
});

if (process.env.NODE_ENV !== 'production') {
    // In dev, we don't set the global here because the Proxy handles the singleton logic via getPrismaClient
    // matching the globalForPrisma check.
}
