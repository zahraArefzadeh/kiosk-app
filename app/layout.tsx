 

import type { Metadata, Viewport } from "next";
import { Roboto, Montserrat, DM_Sans, Outfit } from "next/font/google";
import "./globals.css";
import ClientWidget from "../components/ClientWidget";

// 1. فونت متن اصلی: DM Sans
// بسیار خوانا، مدرن و مناسب برای سایزهای کوچک و متوسط
const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

// 2. فونت تیترها: Outfit
// هندسی و بولد، عالی برای اعداد و عناوین
const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#1a1a2e',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ height: '100%', overflow: 'hidden' }}>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body
        className={`${dmSans.variable} ${outfit.variable} antialiased font-sans bg-gray-50`}
        style={{ height: '100%', overflow: 'hidden' }}
      >
        {children}
        <ClientWidget />
      </body>
    </html>
  );
}
