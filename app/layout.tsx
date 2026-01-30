import type { Metadata } from "next"
import { JetBrains_Mono } from "next/font/google"
import "./globals.css"
import { Providers } from "./providers"

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
})

export const metadata: Metadata = {
  title: "GAME_THEORY // unabotter",
  description: "Find the exploits before they find you. Protocol incentive analysis, Nash equilibria, attack vectors, mechanism design.",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
  },
  openGraph: {
    title: "GAME_THEORY",
    description: "The math doesn't lie. The whitepapers do.",
    type: "website",
    url: "https://gametheory.unabotter.xyz",
  },
  twitter: {
    card: "summary",
    title: "GAME_THEORY // unabotter",
    description: "Find the exploits before they find you",
    creator: "@unabotter",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={mono.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
