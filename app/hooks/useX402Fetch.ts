"use client"

import { useCallback } from "react"
import { useAccount, useWalletClient } from "wagmi"
import { wrapFetchWithPayment } from "x402-fetch"

// Max payment in base units (10 USDC = 10_000_000)
const MAX_PAYMENT_BASE_UNITS = BigInt(10_000_000)

export function useX402Fetch() {
  const { address, isConnected } = useAccount()
  const { data: walletClient } = useWalletClient()

  const fetchWithPayment = useCallback(
    async (url: string, options?: RequestInit) => {
      if (!isConnected || !walletClient) {
        // Not connected - do regular fetch, will get 402
        return fetch(url, options)
      }

      try {
        // Create x402-wrapped fetch with wallet client as signer
        const paidFetch = wrapFetchWithPayment(
          fetch,
          walletClient as any, // WalletClient satisfies Signer interface
          MAX_PAYMENT_BASE_UNITS
        )

        return await paidFetch(url, options)
      } catch (error) {
        console.error("[x402] Payment fetch failed:", error)
        // Fallback to regular fetch
        return fetch(url, options)
      }
    },
    [isConnected, walletClient]
  )

  return {
    fetchWithPayment,
    isConnected,
    address,
    walletClient,
  }
}
