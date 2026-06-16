/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './storage/framework/views/*.php',
        './resources/**/*.blade.php',
        './resources/**/*.jsx',
        './resources/**/*.js',
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    50: '#f5f0ff', 100: '#ede5ff', 200: '#dcceff', 300: '#c4a8ff',
                    400: '#a878ff', 500: '#8b45ff', 600: '#7c22ff', 700: '#6b10ef',
                    800: '#5a0dc8', 900: '#4c0ea3', 950: '#2e0578',
                },
                surface: {
                    50: '#060a12',   // Deepest dark (main bg)
                    100: '#0b101b',  // Sidebar/nav bg
                    200: '#151d2b',  // Card bg, hover states
                    300: '#1e293b',  // Borders
                    400: '#334155',  // Muted borders
                    500: '#64748b',  // Muted text
                    600: '#94a3b8',  // Secondary text
                    700: '#cbd5e1',  // Body text
                    800: '#e2e8f0',  // Heading text
                    900: '#f1f5f9',  // Bright text
                    950: '#f8fafc',  // White text
                },
                accent: { cyan: '#00d4ff', magenta: '#c026d3', gold: '#f59e0b', green: '#10b981' },
                security: {
                    DEFAULT: '#10b981',
                    light: '#34d399',
                    dim: '#059669',
                    glow: 'rgba(16, 185, 129, 0.15)',
                },
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
                mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
            },
            backgroundImage: {
                'grid-pattern': 'linear-gradient(rgba(139,69,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(139,69,255,0.03) 1px, transparent 1px)',
                'hero-glow': 'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,69,255,0.15), transparent)',
            },
            boxShadow: {
                'glow-sm': '0 0 15px rgba(139,69,255,0.15)',
                'glow': '0 0 30px rgba(139,69,255,0.2)',
                'glow-lg': '0 0 60px rgba(139,69,255,0.25)',
                'card': '0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)',
                'card-lg': '0 4px 16px rgba(0,0,0,0.5), 0 0 1px rgba(139,69,255,0.1)',
                'card-hover': '0 8px 30px rgba(0,0,0,0.6), 0 0 1px rgba(139,69,255,0.2)',
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 8s ease-in-out 2s infinite',
                'pulse-glow': 'pulse-glow 4s ease-in-out infinite',
                'orbit': 'orbit 20s linear infinite',
                'fade-in': 'fadeIn 0.5s ease-out',
                'slide-up': 'slideUp 0.5s ease-out',
                'shimmer': 'shimmer 2s linear infinite',
            },
            keyframes: {
                float: { '0%,100%': { transform: 'translateY(0px)' }, '50%': { transform: 'translateY(-20px)' } },
                'pulse-glow': { '0%,100%': { opacity: '0.4' }, '50%': { opacity: '0.8' } },
                orbit: { '0%': { transform: 'rotate(0deg)' }, '100%': { transform: 'rotate(360deg)' } },
                fadeIn: { '0%': { opacity: '0' }, '100%': { opacity: '1' } },
                slideUp: { '0%': { opacity: '0', transform: 'translateY(10px)' }, '100%': { opacity: '1', transform: 'translateY(0)' } },
                shimmer: { '0%': { backgroundPosition: '-200% 0' }, '100%': { backgroundPosition: '200% 0' } },
            },
        },
    },
    plugins: [],
};
