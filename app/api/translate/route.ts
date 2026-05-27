import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { input, targetLanguageCode, sourceLanguageCode = "en-IN" } = await req.json();

  if (!input || !targetLanguageCode) {
    return NextResponse.json({ error: "Missing input or target language" }, { status: 400 });
  }

  // No translation needed if same language or English source
  if (targetLanguageCode === "en-IN" || targetLanguageCode === sourceLanguageCode) {
    return NextResponse.json({ translated: input });
  }

  const res = await fetch("https://api.sarvam.ai/translate", {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      input,
      source_language_code: sourceLanguageCode,
      target_language_code: targetLanguageCode,
      model: "mayura:v1",
      enable_preprocessing: true,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Sarvam Translate error:", err);
    return NextResponse.json({ translated: input }); // Fallback to original
  }

  const data = await res.json();
  return NextResponse.json({ translated: data.translated_text });
}
