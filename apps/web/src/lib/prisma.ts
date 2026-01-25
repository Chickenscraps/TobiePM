import { PrismaClient } from '@prisma/client';

const prismaClientSingleton = () => {
    // DEBUG: Log connection attempt
    const url = process.env.DATABASE_URL;
    console.log('PRISMA INIT: Attempting connection');
    console.log('PRISMA INIT: DATABASE_URL available?', !!url);
    if (url) {
        console.log('PRISMA INIT: DATABASE_URL length:', url.length);
        console.log('PRISMA INIT: DATABASE_URL prefix:', url.substring(0, 15) + '...');
    } else {
        console.error('PRISMA INIT CRITICAL: DATABASE_URL is undefined');
    }

    return new PrismaClient();
};

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

// Lazy Proxy: Delays instantiation of PrismaClient until the first property access.
// This prevents "PrismaClientInitializationError" during build time (e.g. Next.js collecting page data)
// where DATABASE_URL might be missing or the client shouldn't be active yet.
export const prisma = new Proxy({} as PrismaClient, {
    get: (target, prop) => {
        // Return early for non-functional properties to avoid unnecessary triggering
        if (prop === 'then') return Promise.resolve(target);

        // Initialize standard client only on first real access
        if (!globalForPrisma.prisma) {
            globalForPrisma.prisma = prismaClientSingleton();
        }

        // Forward the access to the real instance
        const instance = globalForPrisma.prisma;
        // @ts-ignore
        const value = instance[prop];

        // Bind functions to the instance (required for methods like $connect, $disconnect)
        if (typeof value === 'function') {
            return value.bind(instance);
        }

        return value;
    },
});

if (process.env.NODE_ENV !== 'production') {
    // Note: In dev, we might already have initialized it 
}
