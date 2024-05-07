/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  safelist: [
    'bg-[#4B59D422]',
    'bg-[#7EC2C622]',
    'bg-[#5A58CB22]',
    'bg-[#679AF322]',
    'bg-[#E4C1A022]',
    'bg-[#6A76D722]',
    'bg-[#D25C8D22]',
    'text-[#4B59D4]',
    'text-[#7EC2C6]',
    'text-[#5A58CB]',
    'text-[#679AF3]',
    'text-[#E4C1A0]',
    'text-[#6A76D7]',
    'text-[#D25C8D]',
    'border-[#4B59D4]',
    'border-[#7EC2C6]',
    'border-[#5A58CB]',
    'border-[#679AF3]',
    'border-[#E4C1A0]',
    'border-[#6A76D7]',
    'border-[#D25C8D]',
    'bg-[#14445C]',
    'bg-[#0B7A75]',
    'bg-[#7B2CBF]',
    'bg-[#E76F51]',
    'bg-[#BC4749]',
    'bg-[#277DA1]',
    'bg-[#4C956C]',
    'bg-[#F3B700]',
    'bg-[#FFF1D0]',
    'text-[#14445C]',
    'text-[#0B7A75]',
    'text-[#7B2CBF]',
    'text-[#E76F51]',
    'text-[#BC4749]',
    'text-[#277DA1]',
    'text-[#4C956C]',
    'text-[#F3B700]',
    'text-[#FFF1D0]'
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      fontSize:{
        xxs:'0.7rem',
        xs:'0.8rem',
        // sm:'0.9.rem'
      }
    },
    
  },
  plugins: [],
  corePlugins: {
    preflight: false // <== disable this!
  },
}
