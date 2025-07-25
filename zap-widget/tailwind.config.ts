import type { Config } from 'tailwindcss'

const config: Config = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      borderColor: {
        'white-25': '#FFFFFF40',
      },
    },
  },
  plugins: [],
}

export default config
