import { NextResponse } from "next/server"

// x402 Discovery Document for x402scan marketplace
// https://github.com/Merit-Systems/x402scan/blob/main/docs/DISCOVERY.md

export async function GET() {
  const baseUrl = "https://gametheory.unabotter.xyz"
  
  const discoveryDocument = {
    version: 1,
    resources: [
      `${baseUrl}/entrypoints/analyze/invoke`,
      `${baseUrl}/entrypoints/tokenomics/invoke`,
      `${baseUrl}/entrypoints/governance/invoke`,
      `${baseUrl}/entrypoints/mev/invoke`,
      `${baseUrl}/entrypoints/design/invoke`,
    ],
    // Ownership proof: sign origin URL with payTo private key
    // Message signed: "https://gametheory.unabotter.xyz"
    ownershipProofs: [
      "0xcc7620fec9361674e8d9ad7bf04ba82ea5d3676210a75fb82b2ac7041e6167557f27eaed8db7156af3c993e4189d40130b3db4423201704ab408afadf4f7bca81b"
    ],
    instructions: `# Game Theory Agent

Protocol incentive analysis by Ted. Find the exploits before they find you.

## Capabilities

### Protocol Analysis ($1.00)
Full game theory analysis. Identifies players, strategies, equilibria, attack vectors.

### Tokenomics Audit ($1.50)
Deep dive: supply dynamics, distribution, death spiral risk, sustainability.

### Governance Analysis ($0.75)
Attack vectors: plutocracy, flash loans, bribes, delegation risks.

### MEV Analysis ($0.50)
Frontrunning, sandwich attacks, transaction ordering games.

### Mechanism Design ($2.00)
Design incentive-compatible systems with desired equilibria.

## Payment

- **Network:** Base (mainnet)
- **Asset:** USDC (0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913)
- **Protocol:** x402 HTTP-native payments
- **Facilitator:** https://x402.org/facilitator

## Contact

- **Twitter:** @unabotter
- **ENS:** unabotter.base.eth
`,
  }

  return NextResponse.json(discoveryDocument, {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
  })
}
