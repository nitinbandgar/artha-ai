/**
 * speak.ts — Robust client-side TTS utility
 *
 * Strategy:
 *  1. Try Sarvam Bulbul (Indian voices, best quality)
 *  2. If Sarvam fails / API key missing → browser speechSynthesis
 *  3. Browser TTS: explicitly pick the best available voice;
 *     fall back to any English voice so audio ALWAYS plays.
 *
 * Fixes Chrome's known silent-failure bug:
 *  - 150ms delay after cancel() before speak()
 *  - Explicit voice selection so utterance is never dropped
 */

// Pick the best available voice for a language code
function pickVoice(langCode: string): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis.getVoices();
  if (!voices.length) return null;

  const prefix = langCode.split("-")[0]; // "hi" from "hi-IN"

  // 1. Exact match (hi-IN)
  let v = voices.find(v => v.lang === langCode);
  if (v) return v;

  // 2. Same language, any region (hi-*, ta-*, etc.)
  v = voices.find(v => v.lang.startsWith(prefix + "-"));
  if (v) return v;

  // 3. Any English voice as fallback — audio still plays, accent differs
  v = voices.find(v => v.lang.startsWith("en"));
  if (v) return v;

  // 4. Absolute fallback — first voice on the device
  return voices[0] ?? null;
}

export function browserSpeak(
  text: string,
  langCode: string,
  onEnd?: () => void
): void {
  if (typeof window === "undefined" || !window.speechSynthesis) {
    onEnd?.();
    return;
  }

  window.speechSynthesis.cancel();

  // Chrome bug: calling speak() immediately after cancel() can silently no-op.
  // A 150ms gap reliably fixes it.
  setTimeout(() => {
    const utt = new SpeechSynthesisUtterance(text.slice(0, 300));
    utt.lang = langCode;
    utt.rate = 0.9;

    const voice = pickVoice(langCode);
    if (voice) utt.voice = voice;

    utt.onend = () => onEnd?.();
    utt.onerror = () => onEnd?.();

    window.speechSynthesis.speak(utt);

    // Safety net: if onend never fires within 15s, unblock the UI
    const timeout = setTimeout(() => onEnd?.(), 15_000);
    utt.onend = () => { clearTimeout(timeout); onEnd?.(); };
    utt.onerror = () => { clearTimeout(timeout); onEnd?.(); };
  }, 150);
}

export async function playTTS(
  text: string,
  langCode: string,
  onEnd?: () => void
): Promise<void> {
  try {
    const res = await fetch("/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: text.slice(0, 400), languageCode: langCode }),
    });

    if (!res.ok) {
      browserSpeak(text, langCode, onEnd);
      return;
    }

    const data = await res.json();

    if (data.audio) {
      const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
      audio.onended = () => onEnd?.();
      audio.onerror = () => browserSpeak(text, langCode, onEnd);
      await audio.play().catch(() => browserSpeak(text, langCode, onEnd));
    } else {
      // Sarvam returned no audio (API key missing, quota, etc.)
      browserSpeak(text, langCode, onEnd);
    }
  } catch {
    browserSpeak(text, langCode, onEnd);
  }
}
