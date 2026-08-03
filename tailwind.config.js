/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./public/index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // 👈 Scans all inline tailwind classes inside your src folder
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
