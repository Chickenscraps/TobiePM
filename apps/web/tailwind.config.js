/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
        './src/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Tobie Brand Colors from brand guide
                brand: {
                    dark: '#0F0F10',        // Background Dark
                    light: '#F4F4F4',       // Surface / Card Light
                    blue: '#3D85C6',        // Brand Accent Blue
                    green: '#4CAF50',       // Profit / Win Green
                    red: '#E5593D',         // Risk / Pain Accent
                },
                text: {
                    headline: '#FFFFFF',    // Headline Text on Dark
                    secondary: '#BFC3C9',   // Secondary Text on Dark
                    dark: '#1A1A1A',        // Headline / Body on Light
                },
                // Keep primary as brand blue for components
                primary: {
                    50: '#e8f3fb',
                    100: '#d1e7f7',
                    200: '#a3cfef',
                    300: '#75b7e7',
                    400: '#479fdf',
                    500: '#3D85C6',        // Brand blue
                    600: '#316a9e',
                    700: '#255077',
                    800: '#19354f',
                    900: '#0d1b28',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            // Mobile-first touch target utilities
            minHeight: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            minWidth: {
                'touch': '44px',
                'touch-lg': '48px',
            },
            // Safe area for iPhone notches
            padding: {
                'safe': 'env(safe-area-inset-bottom)',
            },
            animation: {
                'fade-in': 'fadeIn 0.2s ease-in-out',
                'slide-up': 'slideUp 0.2s ease-out',
                'slide-down': 'slideDown 0.2s ease-out',
            },
            keyframes: {
                fadeIn: {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                slideUp: {
                    '0%': { transform: 'translateY(10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
                slideDown: {
                    '0%': { transform: 'translateY(-10px)', opacity: '0' },
                    '100%': { transform: 'translateY(0)', opacity: '1' },
                },
            },
        },
    },
    plugins: [],
};
