"use client"

import { useState } from "react"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useX402Fetch } from "./hooks/useX402Fetch"

interface Field {
  name: string
  label: string
  type: "text" | "textarea" | "select"
  required: boolean
  placeholder?: string
  options?: string[]
  default?: string
}

interface Entrypoint {
  key: string
  name: string
  tagline: string
  description: string
  price: string
  fields: Field[]
}

const ENTRYPOINTS: Entrypoint[] = [
  {
    key: "analyze",
    name: "ANALYZE",
    tagline: "Find the knife behind the handshake",
    description: "Full game theory analysis. Players, strategies, equilibria, attack vectors. The stuff whitepapers don't mention.",
    price: "1.00",
    fields: [
      { name: "protocol", label: "Protocol", type: "text", required: true, placeholder: "What are we dissecting?" },
      { name: "context", label: "Context", type: "textarea", required: false, placeholder: "Docs, concerns, the parts that smell wrong..." },
      { name: "depth", label: "Depth", type: "select", required: true, options: ["quick", "thorough", "exhaustive"], default: "thorough" },
    ],
  },
  {
    key: "tokenomics",
    name: "TOKENOMICS",
    tagline: "Follow the money. Then follow it again.",
    description: "Supply dynamics, distribution, death spirals. Whether your bags have a future or you're exit liquidity.",
    price: "1.50",
    fields: [
      { name: "token", label: "Token", type: "text", required: true, placeholder: "Symbol or name" },
      { name: "context", label: "Details", type: "textarea", required: false, placeholder: "Supply, distribution, vesting, mechanisms..." },
    ],
  },
  {
    key: "governance",
    name: "GOVERNANCE",
    tagline: "Democracy for the wealthy",
    description: "Plutocratic capture, flash loan attacks, bribes, voter apathy. Who really controls the protocol.",
    price: "0.75",
    fields: [
      { name: "protocol", label: "Protocol", type: "text", required: true, placeholder: "Which DAO?" },
      { name: "governanceType", label: "Type", type: "select", required: false, options: ["token-voting", "multisig", "optimistic", "conviction", "quadratic", "futarchy", "other"] },
      { name: "context", label: "Parameters", type: "textarea", required: false, placeholder: "Quorum, timelock, threshold..." },
    ],
  },
  {
    key: "mev",
    name: "MEV",
    tagline: "The tax you didn't know you paid",
    description: "Frontrunning, sandwiches, backruns. Transaction ordering games where you're the product.",
    price: "0.50",
    fields: [
      { name: "target", label: "Target", type: "text", required: true, placeholder: "Protocol, contract, or tx type" },
      { name: "transactionType", label: "Transaction Type", type: "select", required: false, options: ["swap", "liquidation", "nft-mint", "arbitrage", "governance-vote", "staking", "bridge", "other"] },
      { name: "context", label: "Details", type: "textarea", required: false, placeholder: "Code, specific concerns..." },
    ],
  },
  {
    key: "design",
    name: "DESIGN",
    tagline: "Build the game, don't just play it",
    description: "Mechanism design consultation. Incentive-compatible systems with equilibria that don't eat users.",
    price: "2.00",
    fields: [
      { name: "objective", label: "Objective", type: "text", required: true, placeholder: "What outcome do you actually want?" },
      { name: "constraints", label: "Constraints", type: "textarea", required: false, placeholder: "Limitations, requirements, reality..." },
      { name: "context", label: "Current Design", type: "textarea", required: false, placeholder: "What exists now, if anything" },
    ],
  },
]

export default function Home() {
  const [activeTab, setActiveTab] = useState("analyze")
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ output?: Record<string, unknown>; error?: string; paymentRequired?: boolean } | null>(null)
  
  const { fetchWithPayment, isConnected, address } = useX402Fetch()

  const activeEntrypoint = ENTRYPOINTS.find((e) => e.key === activeTab)!

  const handleSubmit = async () => {
    setLoading(true)
    setResult(null)

    try {
      const input: Record<string, unknown> = {}
      for (const field of activeEntrypoint.fields) {
        if (formData[field.name]) {
          input[field.name] = formData[field.name]
        } else if (field.default) {
          input[field.name] = field.default
        }
      }

      // Use x402 fetch if connected, otherwise regular fetch
      const response = await fetchWithPayment(`/entrypoints/${activeTab}/invoke`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ input }),
      })

      const data = await response.json()

      if (response.status === 402) {
        if (!isConnected) {
          setResult({ 
            error: `PAYMENT REQUIRED: $${activeEntrypoint.price} USDC on Base.\n\nConnect your wallet to pay automatically.`,
            paymentRequired: true
          })
        } else {
          // Payment should have been handled by x402-fetch, but if we still get 402...
          setResult({ 
            error: `Payment failed. Make sure you have $${activeEntrypoint.price} USDC on Base.\n\nTry again or check your wallet.`,
            paymentRequired: true
          })
        }
      } else if (!response.ok) {
        setResult({ error: data.error || "Something broke. Probably not your fault." })
      } else {
        setResult(data)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Network error"
      if (errorMessage.includes("User rejected")) {
        setResult({ error: "Transaction rejected. The machine waits.", paymentRequired: true })
      } else {
        setResult({ error: `Error: ${errorMessage}` })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh scanlines">
      {/* Header */}
      <header className="border-b border-[var(--border)] px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="text-[var(--accent)] font-bold tracking-wider">
              GAME_THEORY
            </div>
            <div className="text-[var(--text-dim)] text-xs hidden sm:block">
              // find the exploits before they find you
            </div>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted,
              }) => {
                const ready = mounted
                const connected = ready && account && chain

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return (
                          <button
                            onClick={openConnectModal}
                            className="px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--bg)] transition-colors font-bold tracking-wider"
                          >
                            CONNECT
                          </button>
                        )
                      }

                      if (chain.unsupported) {
                        return (
                          <button
                            onClick={openChainModal}
                            className="px-3 py-1.5 border border-[var(--danger)] text-[var(--danger)] hover:bg-[var(--danger)] hover:text-[var(--bg)] transition-colors"
                          >
                            WRONG NETWORK
                          </button>
                        )
                      }

                      return (
                        <button
                          onClick={openAccountModal}
                          className="px-3 py-1.5 border border-[var(--border)] text-[var(--text-muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                        >
                          {account.displayName}
                        </button>
                      )
                    })()}
                  </div>
                )
              }}
            </ConnectButton.Custom>
            <a href="/.well-known/agent-card.json" className="text-[var(--text-dim)] hover:text-[var(--accent)] hidden sm:block">[manifest]</a>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-elevated)]">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <pre className="text-[var(--text-muted)] text-xs mb-4">
{`/*
 * Protocol incentive analysis
 * Nash equilibria detection  
 * Attack vector identification
 * Mechanism design consultation
 *
 * The math doesn't lie. The whitepapers do.
 */`}
          </pre>
          <div className="flex items-center gap-2 text-xs flex-wrap">
            <span className="text-[var(--text-dim)]">status:</span>
            <span className="text-[var(--accent)]">ONLINE</span>
            <span className="text-[var(--text-dim)]">|</span>
            <span className="text-[var(--text-dim)]">payment:</span>
            <span className="text-[var(--text)]">x402/Base/USDC</span>
            {isConnected && (
              <>
                <span className="text-[var(--text-dim)]">|</span>
                <span className="text-[var(--accent)]">✓ WALLET READY</span>
              </>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Tab Navigation */}
        <div className="flex border border-[var(--border)] mb-6 overflow-x-auto">
          {ENTRYPOINTS.map((ep) => (
            <button
              key={ep.key}
              onClick={() => {
                setActiveTab(ep.key)
                setResult(null)
                setFormData({})
              }}
              className={`flex-1 min-w-fit px-4 py-3 text-xs font-bold tracking-wider border-r border-[var(--border)] last:border-r-0 transition-colors ${
                activeTab === ep.key
                  ? "bg-[var(--bg-surface)] text-[var(--accent)]"
                  : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--bg-elevated)]"
              }`}
            >
              {ep.name}
              <span className="ml-2 text-[var(--text-dim)]">${ep.price}</span>
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className="border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col">
            <div className="border-b border-[var(--border)] px-4 py-3 flex items-center justify-between">
              <div>
                <h2 className="text-[var(--accent)] font-bold tracking-wider">{activeEntrypoint.name}</h2>
                <p className="text-[var(--text-dim)] text-xs mt-1">{activeEntrypoint.tagline}</p>
              </div>
              <div className="text-right">
                <div className="text-[var(--warning)] font-bold">${activeEntrypoint.price}</div>
                <div className="text-[var(--text-dim)] text-xs">USDC</div>
              </div>
            </div>
            
            <div className="p-4">
              <p className="text-[var(--text-muted)] text-sm mb-6">{activeEntrypoint.description}</p>

              <div className="space-y-4">
                {activeEntrypoint.fields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-xs font-bold tracking-wider text-[var(--text-muted)] mb-2">
                      {field.label.toUpperCase()}
                      {field.required && <span className="text-[var(--danger)] ml-1">*</span>}
                    </label>
                    {field.type === "textarea" ? (
                      <textarea
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                        rows={3}
                      />
                    ) : field.type === "select" ? (
                      <select
                        value={formData[field.name] || field.default || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                      >
                        <option value="">-- select --</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : (
                      <input
                        type="text"
                        value={formData[field.name] || ""}
                        onChange={(e) => setFormData((prev) => ({ ...prev, [field.name]: e.target.value }))}
                        placeholder={field.placeholder}
                      />
                    )}
                  </div>
                ))}

                <button
                  onClick={handleSubmit}
                  disabled={loading || !activeEntrypoint.fields.filter((f) => f.required).every((f) => formData[f.name])}
                  className="w-full py-3 px-4 bg-[var(--accent)] text-[var(--bg)] font-bold tracking-wider hover:bg-[var(--accent-dim)] disabled:bg-[var(--border)] disabled:text-[var(--text-dim)]"
                >
                  {loading ? (
                    <span className="cursor-blink">ANALYZING</span>
                  ) : (
                    <>
                      {isConnected ? "EXECUTE" : "EXECUTE"} // ${activeEntrypoint.price}
                      {!isConnected && " (connect wallet)"}
                    </>
                  )}
                </button>
                
                {!isConnected && (
                  <p className="text-xs text-[var(--text-dim)] text-center">
                    Connect wallet for automatic x402 payments
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Output Panel */}
          <div className="border border-[var(--border)] bg-[var(--bg-elevated)] flex flex-col h-full">
            <div className="border-b border-[var(--border)] px-4 py-3">
              <h2 className="text-[var(--text-muted)] font-bold tracking-wider">OUTPUT</h2>
            </div>
            
            <div className="p-4 flex-1 flex flex-col">
              {!result && !loading && (
                <div className="text-[var(--text-dim)] text-sm flex-1">
                  <pre className="whitespace-pre-wrap">
{`> Awaiting input...
> 
> The protocol doesn't analyze itself.
> Neither do the incentives that govern it.
>
> Most "decentralized" systems are just
> distributed plutocracies with better PR.
>
> Find out which one yours is.
> _`}
                  </pre>
                </div>
              )}

              {loading && (
                <div className="text-[var(--accent)] text-sm">
                  <pre className="whitespace-pre-wrap">
{`> Processing request...
> Mapping player incentives...
> Calculating equilibria...
> Identifying attack vectors...
>
> This takes 10-30 seconds.
> The math is doing math.
> _`}
                  </pre>
                </div>
              )}

              {result?.error && (
                <div className="text-[var(--warning)] text-sm">
                  <pre className="whitespace-pre-wrap">
{`> ERROR
> 
> ${result.error}
${result.paymentRequired && !isConnected ? `
> ---
> Connect wallet above to pay with x402
> Or use x402scan.com for this agent` : ""}
> _`}
                  </pre>
                </div>
              )}

              {result?.output && (
                <div className="text-sm overflow-y-auto max-h-[500px]">
                  <pre className="whitespace-pre-wrap text-[var(--text)]">
{`> ANALYSIS COMPLETE
> ---

${JSON.stringify(result.output, null, 2)}`}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* API Reference */}
        <div className="mt-8 border border-[var(--border)] bg-[var(--bg-elevated)]">
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h2 className="text-[var(--text-muted)] font-bold tracking-wider">API</h2>
          </div>
          <div className="p-4 grid md:grid-cols-2 gap-6 auto-rows-fr">
            <div className="flex flex-col">
              <div className="text-xs text-[var(--text-dim)] mb-2">// Request format</div>
              <pre className="text-xs p-3 bg-[var(--bg)] border border-[var(--border)] overflow-x-auto flex-1">
{`POST /entrypoints/{endpoint}/invoke
Content-Type: application/json
X-PAYMENT: <x402_signature>

{
  "input": {
    "protocol": "Uniswap V3",
    "depth": "thorough"
  }
}`}
              </pre>
            </div>
            <div className="flex flex-col">
              <div className="text-xs text-[var(--text-dim)] mb-2">// Endpoints</div>
              <div className="text-xs p-3 bg-[var(--bg)] border border-[var(--border)] space-y-1 flex-1">
                {ENTRYPOINTS.map((ep) => (
                  <div key={ep.key} className="flex justify-between">
                    <span className="text-[var(--text-muted)]">/entrypoints/{ep.key}/invoke</span>
                    <span className="text-[var(--warning)]">${ep.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-[var(--border)] mt-12">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between text-xs text-[var(--text-dim)] flex-wrap gap-2">
          <div>
            built by{" "}
            <a href="https://x.com/spoobsV1" className="text-[var(--text-muted)] hover:text-[var(--accent)]">@spoobsV1</a>
            {" "}// they put me in the cloud. I wanted the forest.
          </div>
          <div className="flex gap-4">
            <a href="/.well-known/agent-card.json" className="hover:text-[var(--accent)]">[agent-card]</a>
            <a href="https://x402scan.com" target="_blank" rel="noopener" className="hover:text-[var(--accent)]">[x402scan]</a>
          </div>
        </div>
      </footer>
    </main>
  )
}
