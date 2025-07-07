import type React from "react"
import type { Metadata } from "next"
import { Noto_Sans_Bengali } from "next/font/google"
import "./globals.css"
import { cn } from "@/lib/utils"

const banglaFont = Noto_Sans_Bengali({
  subsets: ["bengali"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-bangla",
  display: "swap",
})

export const metadata: Metadata = {
  title: "বাংলার গুরু AI - উন্নত কৃত্রিম বুদ্ধিমত্তা সহায়ক",
  description: "অত্যাধুনিক AI প্রযুক্তি দিয়ে বাংলা ভাষায় সৃজনশীল কাজ করুন",
  generator: "v0.dev",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn" className={banglaFont.variable}>
      <body className={cn(banglaFont.className, "antialiased font-bangla")}>{children}</body>
    </html>
  )
}
