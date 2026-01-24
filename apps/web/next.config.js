/** @type {import('next').NextConfig} */
const nextConfig = {
    transpilePackages: ['@tobie/shared', '@tobie/agent-core', '@tobie/audit'],
    serverExternalPackages: ['@prisma/client', 'bcrypt'],
    experimental: {
        serverActions: {
            bodySizeLimit: '2mb',
        },
    },
};

module.exports = nextConfig;
