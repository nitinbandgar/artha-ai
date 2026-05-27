import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const {
    question,
    spendingContext,
    languageCode = "en-IN",
    languageLabel = "English",
  } = await req.json();

  const prompt = `LANGUAGE RULE (ABSOLUTE — NEVER BREAK): Your entire answer MUST be in ${languageLabel}. Do NOT use English unless ${languageLabel} is English. Use native script: Devanagari for Hindi/Marathi, Tamil script for Tamil, Telugu script for Telugu, Bengali script for Bengali. ₹ amounts and app names (Swiggy, Zomato) stay unchanged.

You are ArthaAI, a smart and friendly Indian financial assistant. Answer concisely in 2-3 sentences in ${languageLabel}.

Spending context:
${spendingContext}

User question: "${question}"

Answer in ${languageLabel} — direct, specific, friendly. No markdown, plain text only.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const answer = message.content[0].type === "text" ? message.content[0].text : "Sorry, I could not answer that.";
  return NextResponse.json({ answer });
}
