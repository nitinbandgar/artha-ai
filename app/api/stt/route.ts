import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get("file") as Blob;
  const languageCode = formData.get("languageCode") as string || "hi-IN";

  if (!file) return NextResponse.json({ error: "No audio file" }, { status: 400 });

  const sarvamForm = new FormData();
  sarvamForm.append("file", file, "audio.webm");
  sarvamForm.append("model", "saarika:v1");
  sarvamForm.append("language_code", languageCode);
  sarvamForm.append("with_timestamps", "false");

  const res = await fetch("https://api.sarvam.ai/speech-to-text", {
    method: "POST",
    headers: { "api-subscription-key": process.env.SARVAM_API_KEY! },
    body: sarvamForm,
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Sarvam STT error:", err);
    return NextResponse.json({ error: "STT failed", detail: err }, { status: 500 });
  }

  const data = await res.json();
  return NextResponse.json({ transcript: data.transcript });
}
