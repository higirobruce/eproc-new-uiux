import './globals.css'
import { Inter } from 'next/font/google'
import localFont from 'next/font/local'

const inter = Inter({ subsets: ['latin'] })

const myFont = localFont({
  src: [
    {
      path: './fonts/RobotoFlex-Regular.ttf',
      weight: '300',
      style: 'normal',
    },
    // {
    //   path: './fonts/Los Andes - Lota Grotesque Alt 3 Regular It.otf',
    //   weight: '300',
    //   style: 'italic',
    // },
    // {
    //   path: './fonts/Los Andes - Lota Grotesque Alt 3 Bold.otf',
    //   weight: '500',
    //   style: 'bold',
    // },
    // {
    //   path: './fonts/Los Andes - Lota Grotesque Alt 3 Bold It.otf',
    //   weight: '500',
    //   style: 'italic',
    // },
    // {
    //   path: './fonts/Los Andes - Lota Grotesque Alt 3 Light.otf',
    //   weight: '300',
    //   style: 'light',
    // },
  ],
  display: 'swap',
});


export const metadata = {
  title: 'Irembo Eprocurement',
  description: 'Solution to the procurement process automation.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${myFont.className} overflow-hidden`} suppressHydrationWarning={true}>
        {children}
        </body>
    </html>
  )
}
