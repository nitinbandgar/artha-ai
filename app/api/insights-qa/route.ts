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

  const prompt = `You are ArthaAI, a smart and friendly Indian financial assistant. Answer the user's question about their UPI spending concisely in 2-3 sentences.

IMPORTANT: Reply entirely in ${languageLabel}. Keep ₹ amounts and app names as-is.

Spending context:
${spendingContext}

User question: "${question}"

Answer in ${languageLabel} — be direct, specific, and friendly. No markdown, just plain text.`;

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 200,
    messages: [{ role: "user", content: prompt }],
  });

  const answer = message.content[0].type === "text" ? message.content[0].text : "Sorry, I could not answer that.";
  return NextResponse.json({ answer });
}
