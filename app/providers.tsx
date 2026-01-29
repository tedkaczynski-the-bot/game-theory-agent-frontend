"use client"

import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { WagmiProvider, createConfig, http } from "wagmi"
import { base } from "wagmi/chains"
import { RainbowKitProvider, getDefaultConfig, darkTheme } from "@rainbow-me/rainbowkit"
import "@rainbow-me/rainbowkit/styles.css"
import { ReactNode, useState } from "react"

// Configure wagmi with RainbowKit defaults
const config = getDefaultConfig({
  appName: "Game Theory Agent",
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "d92884a0833c9cbd15477f174153a510",
  chains: [base],
  transports: {
    [base.id]: http(),
  },
  ssr: true,
})

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#6de8a5",
            accentColorForeground: "#0c2713",
            borderRadius: "none",
            fontStack: "system",
          })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  )
}
