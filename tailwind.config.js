/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Liquid colors - vibrant pastels
        liquid: {
          red: '#FF6B6B',
          orange: '#FFA94D',
          yellow: '#FFD93D',
          green: '#6BCB77',
          blue: '#4ECDC4',
          purple: '#9B5DE5',
          pink: '#F15BB5',
          cyan: '#00BBF9',
        },
        // UI colors
        game: {
          bg: {
            light: '#F0F4F8',
            dark: '#1A1A2E',
          },
          card: {
            light: '#FFFFFF',
            dark: '#16213E',
          },
        },
      },
      fontFamily: {
        game: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'pour': 'pour 0.4s ease-out',
        'bounce-in': 'bounceIn 0.3s ease-out',
        'pulse-glow': 'pulseGlow 1.5s ease-in-out infinite',
        'slide-up': 'slideUp 0.3s ease-out',
      },
      keyframes: {
        pour: {
          '0%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-20px)' },
          '100%': { transform: 'translateY(0)' },
        },
        bounceIn: {
          '0%': { transform: 'scale(0.8)', opacity: '0' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseGlow: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(78, 205, 196, 0.4)' },
          '50%': { boxShadow: '0 0 20px 10px rgba(78, 205, 196, 0.2)' },
        },
        slideUp: {
          '0%': { transform: 'translateY(100%)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
