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
    images: [
      {
        url: "https://gametheory.unabotter.xyz/icon.jpg",
        width: 1024,
        height: 1024,
        alt: "Ted - Game Theory Agent",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "GAME_THEORY // unabotter",
    description: "Find the exploits before they find you",
    creator: "@unabotter",
    images: ["https://gametheory.unabotter.xyz/icon.jpg"],
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
