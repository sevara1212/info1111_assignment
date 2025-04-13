/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx,mdx}',
      './pages/**/*.{js,ts,jsx,tsx,mdx}',
      './components/**/*.{js,ts,jsx,tsx,mdx}',
    ],
    theme: {
      extend: {
        colors: {
          primary: {
            DEFAULT: 'rgb(var(--primary))',
            light: 'rgb(var(--primary-light))',
          },
          secondary: 'rgb(var(--secondary))',
          accent: 'rgb(var(--accent))',
          background: 'rgb(var(--background))',
          foreground: 'rgb(var(--foreground))',
          muted: 'rgb(var(--muted))',
        },
        boxShadow: {
          'soft-xl': '0 20px 27px 0 rgba(0, 0, 0, 0.05)',
          'soft-md': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          'soft-sm': '0 2px 4px 0 rgba(0, 0, 0, 0.05)',
        },
        borderRadius: {
          'xl': '1rem',
          '2xl': '1.5rem',
        },
        fontFamily: {
          sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
        },
      },
    },
    plugins: [],
    future: {
      removeDeprecatedGapUtilities: true,
      purgeLayersByDefault: true,
    },
  };
  