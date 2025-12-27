/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: {
                    DEFAULT: 'var(--primary-color)',
                    dark: 'var(--primary-dark)',
                    light: 'var(--badge-bg)', // Using badge bg as light variant
                },
                secondary: 'var(--text-muted)',
                success: 'var(--success-color)',
                warning: 'var(--warning-color)',
                danger: 'var(--danger-color)',
            },
            fontFamily: {
                sans: ['"Host Grotesk"', 'Roboto', 'sans-serif'],
            }
        },
    },
    plugins: [
        require('tailwind-scrollbar'),
    ],
}
