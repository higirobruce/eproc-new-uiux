import "./globals.css";
import { Roboto } from "next/font/google";
import localFont from "next/font/local";
import { UserProvider } from "./context/UserContext";

const inter = Roboto({ weight: ['400', '100', '300', '500', '700'], subsets: ["latin"] });

const myFont = localFont({
  src: [
    {
      path: "./fonts/Los Andes - Lota Grotesque Alt 1 Regular.otf",
      weight: "300",
      style: "normal",
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
  display: "swap",
});

export const metadata = {

  title: 'Irembo Eprocurement',
  description: 'Solution to the procurement process automation.',
  // image: '/favicon.ico',
  icons:[{
    media: "(prefers-color-scheme: light)",
    url: "/favicon.png",
    href: "/favicon.png",
  },
  ]
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <UserProvider>
        <body
          className={`${myFont.className} overflow-hidden`}
          suppressHydrationWarning={true}
        >
          {children}
        </body>
      </UserProvider>
    </html>
  );
}
