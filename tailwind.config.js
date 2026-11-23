/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        aws: {
          bgPrimary: '#090714',
          bgSecondary: '#151027',
          bgCard: '#1B1530',
          purple: '#8B5CF6',
          violet: '#A855F7',
          lavender: '#C4B5FD',
          textPrimary: '#FFFFFF',
          textSecondary: '#A9A3BE',
          bannerBg: '#161D26',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', '"Inter"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        'purple-glow': '0 0 35px -5px rgba(139, 92, 246, 0.45)',
        'purple-glow-lg': '0 0 60px -10px rgba(168, 85, 247, 0.65)',
        'card-glass': '0 20px 50px rgba(5, 3, 12, 0.7), inset 0 1px 0 rgba(196, 181, 253, 0.15)',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.03)' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 3.5s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
