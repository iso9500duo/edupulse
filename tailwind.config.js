/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          DEFAULT: '#7c3aed',
        },
        accent: {
          blue: '#3b82f6',
          cyan: '#06b6d4',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
          orange: '#f97316'
        },
        surface: {
          dark: '#0b0f19',
          card: '#131b2e',
          cardLight: '#1e293b',
          border: '#23304a'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      animation: {
        'bounce-subtle': 'bounceSubtle 2s infinite ease-in-out',
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      boxShadow: {
        'tactile-brand': '0 4px 0 #5b21b6',
        'tactile-brand-lg': '0 6px 0 #4c1d95',
        'tactile-cyan': '0 4px 0 #0891b2',
        'tactile-amber': '0 4px 0 #d97706',
        'tactile-emerald': '0 4px 0 #059669',
        'glow-brand': '0 0 30px -5px rgba(124, 58, 237, 0.45)',
        'glow-cyan': '0 0 30px -5px rgba(6, 182, 212, 0.45)',
        'glow-amber': '0 0 30px -5px rgba(245, 158, 11, 0.45)',
        'glass-card': '0 8px 32px 0 rgba(0, 0, 0, 0.35)',
      },
      keyframes: {
        bounceSubtle: {
          '0%, 100%': { transform: 'translateY(-3%)' },
          '50%': { transform: 'translateY(0)' },
        },
        pulseGlow: {
          '0%, 100%': { opacity: 1, filter: 'drop-shadow(0 0 15px rgba(124, 58, 237, 0.6))' },
          '50%': { opacity: 0.8, filter: 'drop-shadow(0 0 5px rgba(124, 58, 237, 0.2))' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
};
