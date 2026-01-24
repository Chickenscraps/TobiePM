/**
 * Mobile Layout Wrapper
 * 
 * Client component that combines bottom nav and chat sidebar
 * with proper mobile-first spacing and interactions.
 */

'use client';

import { BottomNav } from '@/components/mobile/BottomNav';

export function MobileLayout() {
    return (
        <>
            {/* Bottom Navigation - only on mobile */}
            <BottomNav onAIClick={() => {
                // Find and click the AI button if it exists
                const aiButton = document.querySelector('[aria-label="Open AI Assistant"]') as HTMLButtonElement;
                if (aiButton) {
                    aiButton.click();
                }
            }} />
        </>
    );
}
