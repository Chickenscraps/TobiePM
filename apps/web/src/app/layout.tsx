import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/components/AuthProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
    title: 'Tobie Command Center',
    description: 'Centralized dashboard for Tobie.team project management',
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.className} antialiased min-h-screen`}>
                <AuthProvider>{children}</AuthProvider>
            </body>
        </html>
    );
}
