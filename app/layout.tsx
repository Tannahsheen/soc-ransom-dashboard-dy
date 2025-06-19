import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AF SOC | Ransomware Intelligence Dashboard",
  description: "Real-time ransomware victim tracking and threat intelligence for AF SOC operations",
  keywords: "ransomware, cybersecurity, SOC, threat intelligence, security operations",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <meta httpEquiv="refresh" content="300" />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
