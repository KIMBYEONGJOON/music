import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        background: '#0b1020',
        panel: '#11172b',
        panelSoft: '#1a233d',
        border: '#2a3456'
      }
    }
  },
  plugins: []
};

export default config;
