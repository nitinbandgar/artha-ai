import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { transactions, thisMonthSpend, lastMonthSpend, categories, upcomingBills, languageCode = "en-IN", languageLabel = "English" } = await req.json();

  const prompt = `You are ArthaAI, an intelligent Indian financial companion. Based on this user's UPI spending data, write a personalized, warm, and insightful financial narrative in 4-5 short paragraphs. Be specific with numbers, use Indian context (mention rupees as ₹, reference Indian apps/merchants). Be like a smart friend giving honest but encouraging advice.

IMPORTANT: Write entirely in ${languageLabel} (language code: ${languageCode}). Use ${languageLabel} script and natural phrasing. Keep numbers, rupee amounts (₹), and app names (Swiggy, Zomato etc.) as-is.

User Data:
- This month's spending: ₹${thisMonthSpend.toLocaleString("en-IN")}
- Last month's spending: ₹${lastMonthSpend.toLocaleString("en-IN")}
- Top categories: ${categories.map((c: {name: string; value: number}) => `${c.name} (₹${c.value.toLocaleString("en-IN")})`).join(", ")}
- Recent transactions: ${transactions.slice(0, 8).map((t: {merchant: string; amount: number; type: string}) => `${t.merchant} ₹${t.amount} (${t.type})`).join(", ")}
- Upcoming bills: ${upcomingBills.map((b: {name: string; amount: number; dueDate: string}) => `${b.name} ₹${b.amount} due ${b.dueDate}`).join(", ")}

Write the narrative now in ${languageLabel}. Be conversational, insightful, and actionable. End with one specific saving tip. No markdown headers, just flowing paragraphs.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }],
  });

  const narrative = message.content[0].type === "text" ? message.content[0].text : "Unable to generate narrative.";
  return NextResponse.json({ narrative });
}
