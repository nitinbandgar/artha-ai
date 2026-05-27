import Anthropic from "@anthropic-ai/sdk";
import { NextRequest, NextResponse } from "next/server";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function POST(req: NextRequest) {
  const { message, contacts, languageCode = "en-IN", languageLabel = "English" } = await req.json();

  const contactsList = contacts.map((c: {name: string; upiId: string; avatar: string}) =>
    `${c.name} (UPI: ${c.upiId}, avatar: ${c.avatar})`
  ).join("\n");

  const prompt = `LANGUAGE RULE (ABSOLUTE — NEVER BREAK): You MUST write the "message" field entirely in ${languageLabel}. Do NOT use English unless ${languageLabel} is English. Use the native script: Devanagari for Hindi/Marathi, Tamil script for Tamil, Telugu script for Telugu, Bengali script for Bengali. App names (Swiggy, Zomato, UPI) and ₹ amounts may remain unchanged.

You are ArthaAI's smart bill-splitting assistant for Indian UPI payments. Parse the user's request and calculate bill splits.

Available contacts:
${contactsList}

User request: "${message}"

Respond with a JSON object in this EXACT format (no markdown, no code blocks, just raw JSON):
{
  "message": "friendly confirmation in ${languageLabel} — 1-2 sentences in ${languageLabel} script",
  "splitData": {
    "total": <total amount as number>,
    "description": "<brief description>",
    "splits": [
      {
        "name": "<contact name>",
        "upiId": "<their upi id from contacts list>",
        "amount": <their share as number, rounded to nearest rupee>,
        "avatar": "<their avatar initials>"
      }
    ]
  }
}

Rules:
- Match contact names from the available contacts list (fuzzy match is fine)
- If a percentage split is mentioned, respect it
- Round amounts so they sum to the total exactly (give remainder to first person)
- If the user mentions splitting "equally", divide evenly
- The user (Nitin) is NOT included in the splits — only the people they want to collect from
- Always return valid JSON`;

  const response = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 500,
    messages: [{ role: "user", content: prompt }],
  });

  const text = response.content[0].type === "text" ? response.content[0].text : "{}";

  try {
    const parsed = JSON.parse(text.trim());
    return NextResponse.json(parsed);
  } catch {
    return NextResponse.json({
      message: "I understood your request! Here's the split:",
      splitData: null,
    });
  }
}
