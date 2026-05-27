import { NextRequest, NextResponse } from "next/server";

// Speaker map per language (Sarvam Bulbul supported speakers)
const SPEAKER_MAP: Record<string, string> = {
  "hi-IN": "meera",
  "mr-IN": "meera",
  "ta-IN": "meera",
  "te-IN": "meera",
  "bn-IN": "meera",
  "en-IN": "meera",
};

export async function POST(req: NextRequest) {
  const { text, languageCode = "hi-IN" } = await req.json();

  if (!text) return NextResponse.json({ error: "No text" }, { status: 400 });

  // Truncate to 500 chars for TTS (Sarvam limit per request)
  const truncated = text.slice(0, 500);

  const res = await fetch("https://api.sarvam.ai/text-to-speech", {
    method: "POST",
    headers: {
      "api-subscription-key": process.env.SARVAM_API_KEY!,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      inputs: [truncated],
      target_language_code: languageCode,
      speaker: SPEAKER_MAP[languageCode] || "meera",
      pitch: 0,
      pace: 1.0,
      loudness: 1.5,
      speech_sample_rate: 22050,
      enable_preprocessing: true,
      model: "bulbul:v1",
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Sarvam TTS error:", err);
    return NextResponse.json({ error: "TTS failed", detail: err }, { status: 500 });
  }

  const data = await res.json();
  // Returns base64 WAV audio
  return NextResponse.json({ audio: data.audios?.[0] });
}
