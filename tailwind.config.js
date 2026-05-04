module.exports = {
  darkMode: 'class',
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        border: 'var(--color-border)',
        input: 'var(--color-input)',
        ring: 'var(--color-ring)',
        background: 'var(--color-background)',
        foreground: 'var(--color-foreground)',
        primary: {
          DEFAULT: 'var(--color-primary)', /* Deep navy */
          foreground: 'var(--color-primary-foreground)', /* white */
        },
        secondary: {
          DEFAULT: 'var(--color-secondary)', /* Blue-gray */
          foreground: 'var(--color-secondary-foreground)', /* white */
        },
        accent: {
          DEFAULT: 'var(--color-accent)', /* Warm copper */
          foreground: 'var(--color-accent-foreground)', /* white */
        },
        destructive: {
          DEFAULT: 'var(--color-destructive)', /* red-600 */
          foreground: 'var(--color-destructive-foreground)', /* white */
        },
        muted: {
          DEFAULT: 'var(--color-muted)', /* slate-100 */
          foreground: 'var(--color-muted-foreground)', /* slate-500 */
        },
        card: {
          DEFAULT: 'var(--color-card)', /* white */
          foreground: 'var(--color-card-foreground)', /* Rich dark blue-gray */
        },
        popover: {
          DEFAULT: 'var(--color-popover)', /* white */
          foreground: 'var(--color-popover-foreground)', /* Rich dark blue-gray */
        },
        success: {
          DEFAULT: 'var(--color-success)', /* emerald-600 */
          foreground: 'var(--color-success-foreground)', /* white */
        },
        warning: {
          DEFAULT: 'var(--color-warning)', /* amber-600 */
          foreground: 'var(--color-warning-foreground)', /* white */
        },
        error: {
          DEFAULT: 'var(--color-error)', /* red-600 */
          foreground: 'var(--color-error-foreground)', /* white */
        },
        'text-primary': 'var(--color-text-primary)', /* Rich dark blue-gray */
        'text-secondary': 'var(--color-text-secondary)', /* slate-500 */
      },
      borderRadius: {
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
        serif: ['Source Serif 4', 'Georgia', 'serif'],
        mono: ['JetBrains Mono', 'Courier New', 'monospace'],
        caption: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      maxWidth: {
        'prose': '70ch',
      },
      transitionDuration: {
        '250': '250ms',
      },
      transitionTimingFunction: {
        'out': 'cubic-bezier(0, 0, 0.2, 1)',
      },
      boxShadow: {
        'elevation-sm': '0 1px 3px rgba(30, 58, 95, 0.08)',
        'elevation-md': '0 4px 6px rgba(30, 58, 95, 0.1)',
        'elevation-lg': '0 10px 15px rgba(30, 58, 95, 0.12)',
        'elevation-xl': '0 20px 40px -8px rgba(30, 58, 95, 0.16)',
      },
      fontSize: {
        'h1': ['2.25rem', { lineHeight: '2.5rem', fontWeight: '700' }], // text-4xl font-bold
        'h2': ['1.875rem', { lineHeight: '2.25rem', fontWeight: '600' }], // text-3xl font-semibold
        'h3': ['1.5rem', { lineHeight: '2rem', fontWeight: '600' }], // text-2xl font-semibold
        'h4': ['1.25rem', { lineHeight: '1.75rem', fontWeight: '600' }], // text-xl font-semibold
        'h5': ['1.125rem', { lineHeight: '1.75rem', fontWeight: '500' }], // text-lg font-medium
        'h6': ['1rem', { lineHeight: '1.5rem', fontWeight: '500' }], // text-base font-medium
        'body': ['1rem', { lineHeight: '1.5rem', fontWeight: '400' }], // text-base font-normal
        'label': ['0.875rem', { lineHeight: '1.25rem', fontWeight: '500' }], // text-sm font-medium
        'caption': ['0.75rem', { lineHeight: '1rem', fontWeight: '400' }], // text-xs font-normal
      },
      scale: {
        '102': '1.02',
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
  ],
};