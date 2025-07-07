import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_Bengali, Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

// Load fonts from Google Fonts
const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-bangla",
  display: "swap",
})

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-inter",
  display: "swap",
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
    <html lang="bn" className={`${notoSansBengali.variable} ${inter.variable}`}>
      <body className={`${notoSansBengali.className} antialiased font-bangla`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
