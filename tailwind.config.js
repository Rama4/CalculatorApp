/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      backgroundColor: {
        'light-gray': '#D4D4D2',
        'eerie-black': '#1C1C1C',
        'dark-liver': '#505050',
        'vivid-gamboge': '#FF9500',
        'dark-gray': '#101010',
      },
    },
  },
  darkMode: 'class',
  plugins: [],
};
