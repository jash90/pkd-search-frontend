import typography from '@tailwindcss/typography';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: {
            'h2': {
              marginTop: '2em',
              marginBottom: '0.75em',
              fontSize: '1.5em',
              fontWeight: '700',
              lineHeight: '1.3',
            },
            'h3': {
              marginTop: '1.5em',
              marginBottom: '0.5em',
              fontSize: '1.2em',
              fontWeight: '600',
            },
            'p': {
              marginTop: '1em',
              marginBottom: '1em',
              lineHeight: '1.75',
            },
            'ul, ol': {
              marginTop: '1em',
              marginBottom: '1em',
              paddingLeft: '1.5em',
            },
            'li': {
              marginTop: '0.4em',
              marginBottom: '0.4em',
            },
            'strong': {
              fontWeight: '600',
            },
            'a': {
              color: '#2563eb',
              textDecoration: 'underline',
              fontWeight: '500',
            },
            'a:hover': {
              color: '#1d4ed8',
            },
            'table': {
              marginTop: '1.5em',
              marginBottom: '1.5em',
              borderCollapse: 'collapse',
              width: '100%',
            },
            'th, td': {
              padding: '0.5em 0.75em',
              border: '1px solid #e5e7eb',
            },
            'th': {
              backgroundColor: '#f9fafb',
              fontWeight: '600',
              textAlign: 'left',
            },
          },
        },
      },
    },
  },
  plugins: [typography],
};
