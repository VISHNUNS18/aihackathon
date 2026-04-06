import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['DM Mono', 'Menlo', 'monospace'],
      },
      colors: {
        brand: {
          DEFAULT: '#7F77DD',
          dark: '#5f58c0',
          light: '#eeecfb',
        },
        product: {
          cookieyes: '#7F77DD',
          b: '#1D9E75',
        },
      },
    },
  },
  plugins: [],
};

export default config;
