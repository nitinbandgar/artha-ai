import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── Known-safe merchant UPI handles (always LOW risk) ──
const SAFE_HANDLES = [
  "swiggy", "zomato", "amazon", "flipkart", "paytm merchant",
  "irctc", "myntra", "bigbasket", "blinkit", "dunzo", "uber",
  "ola", "phonepe merchant", "gpay merchant",
];

// ── Scam keywords that ALWAYS mean HIGH risk (no need to ask Claude) ──
const HIGH_RISK_KEYWORDS = [
  "lottery", "lotto", "prize", "winner", "lucky", "reward",
  "claim", "claimprize", "claimreward",
  "refund", "taxrefund", "incometax",
  "kbc", "jio", "airtel prize",
  "otp", "otpverify", "verify.bank", "bankverify", "secure.bank",
  "freegift", "cashback9", "cashback99",
  "covid", "relief fund",
];

function detectHighRisk(upiId: string, name: string, note: string) {
  const haystack = `${upiId} ${name} ${note}`.toLowerCase();

  // Check safe merchant — skip HIGH risk override
  const isSafe = SAFE_HANDLES.some(h => haystack.includes(h));
  if (isSafe) return null;

  // Check scam keywords
  const matchedKeyword = HIGH_RISK_KEYWORDS.find(k => haystack.includes(k));
  if (matchedKeyword) return matchedKeyword;

  // UPI ID has 4+ consecutive digits AND amount ≤ ₹10 → classic verification scam
  const hasRandomDigits = /\d{4,}/.test(upiId);
  return null; // let Claude decide for ambiguous cases
  void hasRandomDigits; // used above for future extension
}

export async function POST(req: NextRequest) {
  const { upiId, amount, name, note, languageCode = "en-IN", languageLabel = "English" } = await req.json();

  // ── Fast-path: deterministic HIGH risk for known scam patterns ──
  const scamKeyword = detectHighRisk(upiId, name || "", note || "");
  if (scamKeyword) {
    // Still call Claude for the localised summary/flags/recommendation
    // but pre-seed the context so it can't waver on riskLevel
  }

  const preSeededRisk = scamKeyword
    ? `\nFRAUD ALERT: The UPI ID / payee name / note contains the keyword "${scamKeyword}" which is a confirmed scam pattern in India. You MUST return riskLevel="high" and riskScore >= 88. Do not downgrade this to medium under any circumstances.\n`
    : "";

  const prompt = `LANGUAGE RULE (ABSOLUTE — NEVER BREAK): Write "summary", "flags", and "recommendation" entirely in ${languageLabel}. Do NOT use English unless ${languageLabel} is English. Use native script: Devanagari for Hindi/Marathi, Tamil for Tamil, Telugu for Telugu, Bengali for Bengali. UPI IDs, amounts (₹), and technical terms may stay in English.
${preSeededRisk}
You are ArthaAI's fraud detection engine for Indian UPI payments. Analyze this payment request and return a risk assessment.

Payment details:
- UPI ID: ${upiId}
- Amount: ₹${amount}
- Payee name: ${name || "Not provided"}
- Payment note/reason: ${note || "Not provided"}

SCORING RULES — follow strictly:
• riskScore 80–100 (HIGH): UPI ID or name contains lottery/prize/claim/refund/otp/verify/kbc/lucky/winner/reward; amount ≤ ₹10 for "verification"; random digit strings like 9944/786/123 in UPI ID combined with suspicious words
• riskScore 31–79 (MEDIUM): Unknown individual, unverified handle, ambiguous note, unusual amount
• riskScore 0–30 (LOW): Recognised merchant (Swiggy, Zomato, Amazon, IRCTC, Uber, etc.), known contact pattern, standard amount

Known safe patterns: swiggy@icici, zomato@icici, amazon@apl, uber@icici, irctc@sbi
Known HIGH risk patterns: claim[numbers]refund@*, verify.bank.*@*, kbc*@*, lottery*@*, otp*@*

Respond with a JSON object (no markdown, raw JSON):
{
  "riskLevel": "low" | "medium" | "high",
  "riskScore": <number 0-100>,
  "summary": "<one sentence in ${languageLabel}>",
  "flags": ["<specific risk factor in ${languageLabel}>", "..."],
  "recommendation": "<clear actionable advice in ${languageLabel}>"
}`;

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
