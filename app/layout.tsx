import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { cn } from "@/lib/utils"

export const metadata: Metadata = {
  title: "বাংলার গুরু AI - উন্নত কৃত্রিম বুদ্ধিমত্তা সহায়ক",
  description: "অত্যাধুনিক AI প্রযুক্তি দিয়ে বাংলা ভাষায় সৃজনশীল কাজ করুন",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="bn">
      <body className={cn("font-adarsholipi antialiased")}>{children}</body>
    </html>
  )
}
