/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#0B0B0C',
          50: '#F7F7F8',
          100: '#EFEFEF',
          200: '#DCDCDC',
          300: '#BDBDBD',
          400: '#989898',
          500: '#7C7C7C',
          600: '#656565',
          700: '#525252',
          800: '#464646',
          900: '#3D3D3D',
          950: '#0B0B0C'
        },
        accent: {
          DEFAULT: '#C9A227',
          50: '#FDF8E6',
          100: '#FBF0CC',
          200: '#F7E099',
          300: '#F3D066',
          400: '#EFC033',
          500: '#C9A227',
          600: '#A1821F',
          700: '#796217',
          800: '#51420F',
          900: '#292107'
        },
        neutral: {
          DEFAULT: '#F7F7F8',
          50: '#FFFFFF',
          100: '#F7F7F8',
          200: '#EFEFEF',
          300: '#E6E6E6',
          400: '#DCDCDC',
          500: '#BDBDBD',
          600: '#989898',
          700: '#7C7C7C',
          800: '#525252',
          900: '#3D3D3D',
          950: '#0B0B0C'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      letterSpacing: {
        'wider': '0.05em',
        'widest': '0.1em'
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'pulse-subtle': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        }
      }
    },
  },
  future: {
    hoverOnlyWhenSupported: true,
  },
  plugins: [],
};