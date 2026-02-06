import type { Config } from 'tailwindcss';

const config: Config = {
    content: [
        './pages/**/*.{js,ts,jsx,tsx,mdx}',
        './components/**/*.{js,ts,jsx,tsx,mdx}',
        './app/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                // Primary - Forest Green (Based on Image Inspiration)
                primary: {
                    50: '#f0fdf4',
                    100: '#dcfce7',
                    200: '#bbf7d0',
                    300: '#86efac',
                    400: '#4ade80',
                    500: '#22c55e',
                    600: '#16a34a',
                    700: '#15803d',
                    800: '#064e3b',
                    900: '#043927', // Main Forest Green
                    950: '#022c1e',
                },
                // Mint - Soft accents and active states
                mint: {
                    50: '#f0fdf9',
                    100: '#e6f5f1', // Active item background
                    200: '#ccf2e8',
                    300: '#99e6d1',
                    400: '#66dab9',
                    500: '#33cea2',
                    600: '#00c28b',
                    700: '#009b6f',
                    800: '#007453',
                    900: '#004e38',
                },
                // Ash/Gray - Cleaner Neutrals for Dashboard
                ash: {
                    50: '#fbfbfb',
                    100: '#f5f5f5',
                    200: '#e5e5e5',
                    300: '#d4d4d4',
                    400: '#a3a3a3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                    950: '#0a0a0a',
                },
                // Keep secondary/accent for compatibility or update them
                secondary: {
                    50: '#f7fee7',
                    100: '#ecfccb',
                    500: '#84cc16',
                    900: '#365314',
                },
                accent: {
                    50: '#ecfdf5',
                    100: '#d1fae5',
                    500: '#10b981',
                    900: '#064e3b',
                },
                white: '#ffffff',
                black: '#000000',
            },
            fontFamily: {
                sans: [
                    'Inter',
                    '-apple-system',
                    'BlinkMacSystemFont',
                    'Segoe UI',
                    'Roboto',
                    'sans-serif',
                ],
                display: [
                    'Cal Sans',
                    'Inter',
                    'sans-serif',
                ],
                mono: [
                    'Fira Code',
                    'Monaco',
                    'Consolas',
                    'monospace',
                ],
            },
            fontSize: {
                'xs': ['0.75rem', { lineHeight: '1rem' }],
                'sm': ['0.875rem', { lineHeight: '1.25rem' }],
                'base': ['1rem', { lineHeight: '1.5rem' }],
                'lg': ['1.125rem', { lineHeight: '1.75rem' }],
                'xl': ['1.25rem', { lineHeight: '1.75rem' }],
                '2xl': ['1.5rem', { lineHeight: '2rem' }],
                '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
                '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
                '5xl': ['3rem', { lineHeight: '1' }],
                '6xl': ['3.75rem', { lineHeight: '1' }],
            },
            backgroundImage: {
                'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
                'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
                'gradient-primary': 'linear-gradient(135deg, #22c55e 0%, #10b981 100%)',
                'gradient-accent': 'linear-gradient(135deg, #4ade80 0%, #34d399 100%)',
            },
            animation: {
                'fade-in': 'fadeIn 0.3s ease-in-out',
                'slide-up': 'slideUp 0.3s ease-out',
                'slide-down': 'slideDown 0.3s ease-out',
                'scale-in': 'scaleIn 0.2s ease-out',
                'spin-slow': 'spin 3s linear infinite',
                'shimmer': 'shimmer 2s linear infinite',
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
                scaleIn: {
                    '0%': { transform: 'scale(0.95)', opacity: '0' },
                    '100%': { transform: 'scale(1)', opacity: '1' },
                },
                shimmer: {
                    '0%': { backgroundPosition: '-1000px 0' },
                    '100%': { backgroundPosition: '1000px 0' },
                },
            },
            boxShadow: {
                'xs': '0 1px 2px 0 rgb(0 0 0 / 0.03)',
                'sm': '0 1px 3px 0 rgb(0 0 0 / 0.05), 0 1px 2px -1px rgb(0 0 0 / 0.05)',
                'DEFAULT': '0 2px 4px -1px rgb(0 0 0 / 0.06), 0 2px 4px -1px rgb(0 0 0 / 0.04)',
                'md': '0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.05)',
                'lg': '0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.05)',
                'xl': '0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.05)',
                '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.15)',
                'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.04)',
                'none': 'none',
                'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                'glass-lg': '0 12px 48px 0 rgba(31, 38, 135, 0.5)',
                'primary': '0 4px 14px 0 rgb(34 197 94 / 0.2)',
                'primary-lg': '0 10px 25px -5px rgb(34 197 94 / 0.25)',
            },
            borderRadius: {
                'none': '0',
                'sm': '0.25rem',
                'DEFAULT': '0.5rem',
                'md': '0.625rem',
                'lg': '0.75rem',
                'xl': '1rem',
                '2xl': '1.25rem',
                '3xl': '1.5rem',
                'full': '9999px',
            },
            transitionProperty: {
                'height': 'height',
                'spacing': 'margin, padding',
            },
        },
    },
    plugins: [],
};

export default config;
