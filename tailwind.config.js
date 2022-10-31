module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        title: ['Ramabhadra', 'sans-serif'],
        text: ['Public Sans', 'sans-serif'],
      },
      fontSize: {
        '2xs': '0.55rem',
      },
      colors: {
        darkGreen: '#010F02',
        mediumGreen: '#283028',
        lightGreen: '#299137',
        grayNotFocused: '#1d1d1d',
        ligthGray: '#7e7e7e',
        orangeSelection: '#9D510A',
      },
    },
  },
  plugins: [],
};
