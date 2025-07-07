import type React from "react"
import type { Metadata } from "next"
import localFont from "next/font/local"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Load Adorsholipi font locally
const adorsholipi = localFont({
  src: [
    { path: "../assets/fonts/Adorsholipi-Regular.woff2", weight: "400", style: "normal" },
    { path: "../assets/fonts/Adorsholipi-Medium.woff2", weight: "500", style: "normal" },
    { path: "../assets/fonts/Adorsholipi-SemiBold.woff2", weight: "600", style: "normal" },
    { path: "../assets/fonts/Adorsholipi-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-adorsholipi",
  display: "swap",
  fallback: ["Noto Sans Bengali", "sans-serif"],
})

export const metadata: Metadata = {
  title: "বাংলার গুরু - উন্নত AI চ্যাটবট",
  description: "বাংলা ভাষায় সবচেয়ে উন্নত AI সহায়ক - গল্প, কবিতা, সংবাদ, ভয়েস ওভার এবং রিয়েল-টাইম ট্রান্সক্রিপশন",
  keywords: "বাংলা AI, চ্যাটবট, গল্প, কবিতা, সংবাদ, ভয়েস ওভার, ট্রান্সক্রিপশন, স্পিচ রিকগনিশন",
  authors: [{ name: "বাংলার গুরু টিম" }],
  creator: "বাংলার গুরু",
  publisher: "বাংলার গুরু",
  robots: "index, follow",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
  themeColor: "#3B82F6",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    type: "website",
    locale: "bn_BD",
    url: "https://banglar-guru.vercel.app",
    title: "বাংলার গুরু - উন্নত AI চ্যাটবট",
    description: "বাংলা ভাষায় সবচেয়ে উন্নত AI সহায়ক",
    siteName: "বাংলার গুরু",
  },
  twitter: {
    card: "summary_large_image",
    title: "বাংলার গুরু - উন্নত AI চ্যাটবট",
    description: "বাংলা ভাষায় সবচেয়ে উন্নত AI সহায়ক",
  },
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" className={adorsholipi.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className={`${adorsholipi.className} antialiased font-adorsholipi`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
