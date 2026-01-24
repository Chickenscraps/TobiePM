import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const {
    handlers: { GET, POST },
    auth,
    signIn,
    signOut,
} = NextAuth({
    providers: [
        Credentials({
            name: 'credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    return null;
                }

                const user = await prisma.user.findUnique({
                    where: { email: credentials.email as string },
                    include: {
                        role: {
                            include: {
                                permissions: {
                                    include: {
                                        permission: true,
                                    },
                                },
                            },
                        },
                    },
                });

                if (!user) {
                    await prisma.auditLog.create({
                        data: {
                            eventType: 'LOGIN_FAILURE',
                            eventSource: 'web-portal',
                            details: JSON.stringify({ email: credentials.email, reason: 'User not found' }),
                        },
                    });
                    return null;
                }

                const isValid = await compare(credentials.password as string, user.passwordHash);

                if (!isValid) {
                    await prisma.auditLog.create({
                        data: {
                            eventType: 'LOGIN_FAILURE',
                            eventSource: 'web-portal',
                            userId: user.id,
                            details: JSON.stringify({ reason: 'Invalid password' }),
                        },
                    });
                    return null;
                }

                await prisma.user.update({
                    where: { id: user.id },
                    data: { lastLoginAt: new Date() },
                });

                await prisma.auditLog.create({
                    data: {
                        eventType: 'LOGIN_SUCCESS',
                        eventSource: 'web-portal',
                        userId: user.id,
                        details: JSON.stringify({ action: 'User logged in successfully' }),
                    },
                });

                return {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    image: user.avatarUrl,
                    role: user.role.name,
                    permissions: user.role.permissions.map((rp) => rp.permission.code),
                };
            },
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = (user as any).role;
                token.permissions = (user as any).permissions;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as string;
                (session.user as any).role = token.role;
                (session.user as any).permissions = token.permissions;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    session: {
        strategy: 'jwt',
        maxAge: 24 * 60 * 60, // 24 hours
    },
}) as any;
