import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        grotesk: ['"Host Grotesk"', 'sans-serif'],
      },
      borderColor: {
        'white-25': '#FFFFFF40',
      },
    },
  },
  plugins: [],
}

export default config
