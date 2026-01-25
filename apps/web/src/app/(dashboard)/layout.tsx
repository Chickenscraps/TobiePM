import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/permissions';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MobileLayout } from '@/components/mobile';
import GlobalChatWidget from '@/components/ai/GlobalChatWidget';

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // getCurrentUser is cached per-request and handles session check internally
    const user = await getCurrentUser();

    if (!user) {
        redirect('/login');
    }

    return (
        <div className="flex h-screen overflow-hidden bg-brand-dark">
            {/* Left Navigation Sidebar */}
            <Sidebar user={user} />

            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <Header user={user} />

                <div className="flex-1 flex overflow-hidden">
                    {/* Main Content Area */}
                    <main className="flex-1 overflow-auto p-4 md:p-6 pb-20 md:pb-6 custom-scrollbar">
                        <div className="max-w-7xl mx-auto">
                            {children}
                        </div>
                    </main>

                    {/* Right AI Sidebar (Desktop Only) */}
                    <aside className="hidden xl:flex w-80 border-l border-white/5 bg-gray-900/30 flex-col overflow-hidden">
                        <GlobalChatWidget />
                    </aside>
                </div>
            </div>

            {/* Mobile-specific components */}
            <MobileLayout />

            {/* Mobile Chat (Floating) */}
            <div className="xl:hidden">
                <GlobalChatWidget />
            </div>
        </div>
    );
}
