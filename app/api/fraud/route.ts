import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { upiId, amount, name, note, languageCode = "en-IN", languageLabel = "English" } = await req.json();

  const prompt = `You are ArthaAI's fraud detection engine for Indian UPI payments. Analyze this payment request and assess its fraud risk.

Payment details:
- UPI ID: ${upiId}
- Amount: ₹${amount}
- Payee name: ${name || "Not provided"}
- Payment note/reason: ${note || "Not provided"}

Common Indian UPI fraud patterns to check:
1. Suspicious UPI IDs (random numbers, words like "lottery", "prize", "refund", "verify", "bank")
2. Known merchant UPI patterns (swiggy@icici, amazon@apl, etc. are safe)
3. Very small amounts (₹1-10) used in lottery/prize scams to "verify"
4. Payment notes mentioning lottery, KBC, prize, OTP, verification, refund claim
5. UPI IDs with too many numbers or suspicious domain handles

IMPORTANT: Write "summary", "flags", and "recommendation" in ${languageLabel} (language code: ${languageCode}). Keep UPI IDs, amounts, and technical terms in English.

Respond with a JSON object (no markdown, raw JSON):
{
  "riskLevel": "low" | "medium" | "high",
  "riskScore": <number 0-100>,
  "summary": "<one sentence summary IN ${languageLabel}>",
  "flags": ["<risk factor IN ${languageLabel}>"],
  "recommendation": "<clear actionable advice IN ${languageLabel}>"
}

riskScore guide: 0-30 = low, 31-60 = medium, 61-100 = high
Be specific about WHY something is risky. Known merchants/banks get low scores. Suspicious patterns get high scores.`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 400,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const parsed = JSON.parse(text.trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      riskLevel: "medium",
      riskScore: 50,
      summary: "Unable to fully analyze. Exercise caution.",
      flags: ["Analysis incomplete"],
      recommendation: "Verify the payee independently before sending money.",
    });
  }
}
