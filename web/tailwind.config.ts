import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/utils/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: 'var(--primary)',
        secondary: 'var(--secondary)',
        tertiary: 'var(--tertiary)',
      },
      spacing: {
        lg: '180px',
        md: '100px',
        sm: '30px',
      },
      fontFamily: {
        sans: 'var(--font-fredericka-the-great)',
        serif: 'var(--font-merriweather-sans)',
      },
    },
  },
  plugins: [],
};

export default config;
