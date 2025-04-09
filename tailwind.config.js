export default {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './dist/**/*.{js,jsx,ts,tsx,html}',
    './public/**/*.{html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        blinker: ['Blinker', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
