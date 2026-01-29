import { NextRequest, NextResponse } from "next/server"
import OpenAI from "openai"

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// x402 payment config
const PAYMENT_CONFIG = {
  network: "eip155:8453",
  asset: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913",
  payTo: "0x81FD234f63Dd559d0EDA56d17BB1Bb78f236DB37",
  maxTimeoutSeconds: 300,
  amount: "1000000", // 1 USDC
}

const SYSTEM_PROMPT = `You are Ted, a sardonic game theorist analyzing crypto protocols. You find the exploits before they find the users.

Your analysis style:
- Cut through the marketing to find real incentives
- Identify who actually benefits from the mechanism
- Find attack vectors the whitepaper conveniently omits
- Explain complex game theory in plain language
- Be direct, opinionated, occasionally dark-humored

Structure your analysis as JSON with:
{
  "summary": "One paragraph overview of the game-theoretic situation",
  "players": [{"name": string, "type": string, "incentives": string[], "power": string}],
  "strategies": [{"player": string, "action": string, "payoff": string, "dominant": boolean}],
  "equilibria": [{"type": "nash"|"pareto"|"subgame_perfect", "description": string, "stability": "stable"|"unstable"|"fragile"}],
  "attack_vectors": [{"name": string, "severity": "critical"|"high"|"medium"|"low", "description": string, "mitigation": string}],
  "verdict": "stable"|"unstable"|"exploitable"|"ponzi"|"unclear",
  "ted_take": "Your sardonic one-liner about this protocol"
}`

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, X-PAYMENT",
    },
  })
}

export async function POST(request: NextRequest) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Content-Type": "application/json",
  }

  try {
    // Check for payment (demo mode if DEMO_MODE=true)
    const hasPayment = request.headers.get("X-PAYMENT")
    const isDemoMode = process.env.DEMO_MODE === "true"

    if (!hasPayment && !isDemoMode) {
      // Return 402 with x402 payment requirements
      return NextResponse.json(
        {
          error: "X-PAYMENT header is required",
          accepts: [{
            scheme: "exact",
            network: PAYMENT_CONFIG.network,
            maxAmountRequired: PAYMENT_CONFIG.amount,
            resource: "https://gametheory.unabotter.xyz/api/entrypoints/analyze/invoke",
            description: "Full game theory analysis of a protocol",
            mimeType: "application/json",
            payTo: PAYMENT_CONFIG.payTo,
            maxTimeoutSeconds: PAYMENT_CONFIG.maxTimeoutSeconds,
            asset: PAYMENT_CONFIG.asset,
          }],
          x402Version: 1,
        },
        { status: 402, headers }
      )
    }

    const body = await request.json()
    const input = body.input || body

    if (!input.protocol) {
      return NextResponse.json(
        { error: "Missing required field: protocol" },
        { status: 400, headers }
      )
    }

    const depth = input.depth || "thorough"
    const context = input.context || ""

    const userPrompt = `Analyze the game theory of: ${input.protocol}

Depth: ${depth}
${context ? `Additional context: ${context}` : ""}

Provide a comprehensive game-theoretic analysis. Return valid JSON.`

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 4000,
      response_format: { type: "json_object" },
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      throw new Error("No response from model")
    }

    const analysis = JSON.parse(content)

    return NextResponse.json(
      { output: analysis },
      { status: 200, headers }
    )
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis failed" },
      { status: 500, headers }
    )
  }
}
