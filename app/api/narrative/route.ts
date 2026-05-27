import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    transactions, thisMonthSpend, lastMonthSpend,
    categories, upcomingBills,
    languageCode = "en-IN", languageLabel = "English"
  } = await req.json();

  const prompt = `You are ArthaAI, an intelligent Indian financial companion. Analyze this user's UPI spending data and return a structured JSON summary.

IMPORTANT: Write ALL text fields in ${languageLabel} (language code: ${languageCode}). Keep numbers, ₹ amounts, and app names (Swiggy, Zomato, etc.) as-is.

User Data:
- This month's spending: ₹${thisMonthSpend.toLocaleString("en-IN")}
- Last month's spending: ₹${lastMonthSpend.toLocaleString("en-IN")}
- Top categories: ${categories.map((c: {name: string; value: number}) => `${c.name} (₹${c.value.toLocaleString("en-IN")})`).join(", ")}
- Recent transactions: ${transactions.slice(0, 8).map((t: {merchant: string; amount: number; type: string}) => `${t.merchant} ₹${t.amount} (${t.type})`).join(", ")}
- Upcoming bills: ${upcomingBills.map((b: {name: string; amount: number; dueDate: string}) => `${b.name} ₹${b.amount} due ${b.dueDate}`).join(", ")}

Return ONLY this JSON (no markdown, no code blocks):
{
  "headline": "One punchy sentence summarising this month in ${languageLabel}",
  "bullets": [
    "Insight 1 with specific ₹ number",
    "Insight 2 with specific ₹ number",
    "Insight 3 with specific ₹ number",
    "Insight 4 about upcoming bills",
    "Insight 5 comparison vs last month"
  ],
  "tip": "One specific, actionable saving tip in ${languageLabel}",
  "mood": "good" | "okay" | "overspent"
}

Rules:
- Each bullet must be short (max 12 words), specific, and start with an emoji
- mood = "good" if spent less than last month, "okay" if within 10% more, "overspent" if >10% more
- Be direct, friendly, no fluff`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const text = message.content[0].type === "text" ? message.content[0].text : "{}";
  try {
    const parsed = JSON.parse(text.trim());
    return NextResponse.json(parsed);
  } catch {
    // Fallback
    return NextResponse.json({
      headline: "Here's your spending summary",
      bullets: ["📊 Could not parse structured data. Please retry."],
      tip: "Try refreshing for a fresh analysis.",
      mood: "okay",
    });
  }
}
