/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        railway: {
          dark: '#0a1128',
          navy: '#0f172a',
          surface: '#1e293b',
          card: '#1e293b',
          border: '#334155',
          primary: '#2563eb',
          secondary: '#38bdf8',
          success: '#10b981', // Green - Working
          danger: '#ef4444',  // Red - Faulty
          warning: '#f59e0b', // Orange - Pending Maintenance
          light: '#f8fafc',
          muted: '#94a3b8',
        }
      }
    },
  },
  plugins: [],
}
