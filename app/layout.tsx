import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_Bengali } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
})

export const metadata: Metadata = {
  title: "বাংলার গুরু - AI চ্যাটবট",
  description: "বাংলা ভাষায় AI সহায়ক - গল্প, কবিতা, সংবাদ এবং ভয়েস ওভার তৈরি করুন",
  keywords: "বাংলা AI, চ্যাটবট, গল্প, কবিতা, সংবাদ, ভয়েস ওভার",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="bn" className={notoSansBengali.variable}>
      <body className={`${notoSansBengali.className} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
